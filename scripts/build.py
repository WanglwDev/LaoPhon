#!/usr/bin/env python3
"""Build isolated, shareable applications without changing the private app."""
import argparse
import hashlib
import json
from pathlib import Path
import plistlib
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent.parent
HERE = ROOT
BUILD = ROOT / 'build'
OUT = ROOT / 'release'
VERSION = '45.0.0'
FILES = [
    'index.html', 'style.css', 'app.js', 'tone-engine.js', 'profile-store.js',
    'syllable-engine.js', 'correction-store.js', 'favicon.svg',
    'IpaPanNew.ttf', 'SaysetthaOT.ttf', 'FONT-NOTICE.txt',
    'LICENSE-LaoNLP.txt', 'THIRD_PARTY_NOTICES.md', 'i18n.js'
]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def create_ui():
    # The isolated share UI is the build source. Never overwrite it from the
    # private application's resources when rebuilding a release.
    target = HERE / 'app' / 'ui'
    for name in FILES:
        assert (target / name).is_file(), f'Missing UI asset: {name}. See BUILD.md for separately supplied fonts.'
    assert set(p.name for p in target.iterdir()) == set(FILES)
    for private_key in ['laophon.languageProfiles.v2', 'laophon.activeProfile.v1', 'laophon.syllableCorrections.v1']:
        assert not any(private_key in (target / name).read_text() for name in FILES if name.endswith('.js'))
    return target


def verify_archive(runtime_dir, platform):
    name = f'electron-v{VERSION}-{platform}.zip'
    checks = dict((line.split()[1].lstrip('*'), line.split()[0])
                  for line in (runtime_dir / 'SHASUMS256.txt').read_text().splitlines() if line.strip())
    archive = runtime_dir / name
    assert sha(archive) == checks[name], f'Official runtime checksum failed: {name}'
    return archive


def package_mac(runtime_dir, arch):
    platform = f'darwin-{arch}'
    folder = BUILD / platform
    if folder.exists():
        shutil.rmtree(folder)
    folder.mkdir(parents=True)
    subprocess.run(['/usr/bin/ditto', '-x', '-k', str(verify_archive(runtime_dir, platform)), str(folder)], check=True)
    bundle = folder / 'LaoPhon.app'
    (folder / 'Electron.app').rename(bundle)
    resources = bundle / 'Contents' / 'Resources'
    # Official sample app must not be shipped alongside our app entry point.
    (resources / 'default_app.asar').unlink(missing_ok=True)
    shutil.copytree(HERE / 'app', resources / 'app')
    shutil.copyfile(ROOT / 'assets/AppIcon.icns', resources / 'AppIcon.icns')
    for p in bundle.rglob('Info.plist'):
        with p.open('rb') as f:
            info = plistlib.load(f)
        if p == bundle / 'Contents/Info.plist':
            info.update(CFBundleIdentifier='org.laophon.share', CFBundleName='LaoPhon',
                        CFBundleDisplayName='LaoPhon', CFBundleIconFile='AppIcon',
                        CFBundleShortVersionString='2.0.3', CFBundleVersion='4')
        elif '.app/Contents/Info.plist' in str(p.relative_to(bundle)):
            suffix = p.parent.parent.stem.replace('Electron Helper', 'helper').replace(' ', '').replace('(', '.').replace(')', '').lower()
            info['CFBundleIdentifier'] = 'org.laophon.share.' + suffix
        else:
            continue
        with p.open('wb') as f:
            plistlib.dump(info, f)
    subprocess.run(['/usr/bin/codesign', '--force', '--deep', '--sign', '-', '--preserve-metadata=entitlements', str(bundle)], check=True)
    subprocess.run(['/usr/bin/codesign', '--verify', '--deep', '--strict', '--verbose=2', str(bundle)], check=True)
    for name in ['LICENSE', 'LICENSES.chromium.html']:
        if (folder / name).exists():
            shutil.copyfile(folder / name, resources / name)
    # License copies change the root bundle seal; sign again before archiving.
    subprocess.run(['/usr/bin/codesign', '--force', '--sign', '-', '--preserve-metadata=entitlements', str(bundle)], check=True)
    subprocess.run(['/usr/bin/codesign', '--verify', '--deep', '--strict', str(bundle)], check=True)
    out = OUT / ('LaoPhon-macOS-arm64.zip' if arch == 'arm64' else 'LaoPhon-macOS-x64.zip')
    temporary = out.with_suffix('.building.zip')
    subprocess.run(['/usr/bin/ditto', '-c', '-k', '--norsrc', '--noextattr', '--noqtn', '--keepParent', str(bundle), str(temporary)], check=True)
    temporary.replace(out)
    return out


def package_windows(runtime_dir):
    folder = BUILD / 'LaoPhon-Windows-x64'
    if folder.exists():
        shutil.rmtree(folder)
    folder.mkdir(parents=True)
    with zipfile.ZipFile(verify_archive(runtime_dir, 'win32-x64')) as z:
        assert all(not Path(n).is_absolute() and '..' not in Path(n).parts for n in z.namelist())
        z.extractall(folder)
    (folder / 'electron.exe').rename(folder / 'LaoPhon.exe')
    (folder / 'resources/default_app.asar').unlink(missing_ok=True)
    shutil.copytree(HERE / 'app', folder / 'resources/app')
    (folder / '使用说明.txt').write_text('请先完整解压此文件夹，再双击 LaoPhon.exe。\n不要只复制 exe，必须保留同目录中的资源与运行库。\n首次运行只有万象语言点；运行及转换不需要联网。\n', encoding='utf-8-sig')
    out = OUT / 'LaoPhon-Windows-x64.zip'
    temporary = out.with_suffix('.building.zip')
    with zipfile.ZipFile(temporary, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for p in sorted(folder.rglob('*')):
            if p.is_file():
                z.write(p, p.relative_to(BUILD))
    temporary.replace(out)
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--runtime-dir', type=Path, required=True)
    args = parser.parse_args()
    create_ui()
    BUILD.mkdir(exist_ok=True)
    OUT.mkdir(exist_ok=True)
    results = [package_mac(args.runtime_dir, 'arm64'), package_mac(args.runtime_dir, 'x64'), package_windows(args.runtime_dir)]
    manifest = {p.name: {'sha256': sha(p), 'bytes': p.stat().st_size} for p in results}
    (OUT / 'SHA256.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(manifest, ensure_ascii=False, indent=2), flush=True)


if __name__ == '__main__':
    main()
