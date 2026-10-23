# Build LaoPhon

## English

The repository contains the desktop application source, regression tests, and a Python packager. The source is independent of the author's private application and data.

### Run from source

Install Node.js 22+ and npm. Run these commands from the repository root:

```sh
npm test
npm install
npm start
```

`npm install` downloads the pinned Electron 45.0.0 runtime and requires an internet connection. After installation the application runs offline. The source-only checkout uses installed system font fallbacks until the separately supplied fonts below are present. Packaged downloads already contain their fonts and runtime.

### Fonts

Font binaries are not part of the Apache-2.0 source distribution. Supply the original fonts separately under their own applicable terms. Place them in `app/ui/` using these exact filenames to reproduce the packaged typography:

| Filename | Font | SHA-256 of the release file |
| --- | --- | --- |
| `SaysetthaOT.ttf` | Saysettha OT | `6f4f1240140c927437c69d37b45f010adc09261eadcd239ddd97ed8dc7658510` |
| `IpaPanNew.ttf` | IPAPANNEW | `7abb6170cce71697e9c8c990ea20048fe495b0275833f18d6421aa21df6cedea` |

See `app/ui/FONT-NOTICE.txt` for the original copyright and metadata. Embedding metadata does not itself constitute an open-source license. These fonts are not relicensed by this repository.

### Package all three platforms on macOS

Use Python 3.10+ and the standard macOS `ditto` and `codesign` tools. Obtain these official Electron 45.0.0 files from the [Electron release](https://github.com/electron/electron/releases/tag/v45.0.0) and place them together in a local `runtime/` directory:

```text
SHASUMS256.txt
electron-v45.0.0-darwin-arm64.zip
electron-v45.0.0-darwin-x64.zip
electron-v45.0.0-win32-x64.zip
```

The packager verifies each archive against `SHASUMS256.txt`, then builds without further downloads:

```sh
python3 scripts/build.py --runtime-dir runtime
```

The results are written to `release/`: three platform ZIPs and `SHA256.json`. Temporary application trees are written under `build/`. Do not put your own data in either output directory; packaging replaces its own platform build folders. Mac builds receive ad-hoc signatures. This process does not notarize, commercially sign, or prove compatibility on the target hardware. Test the generated applications on their intended systems before distributing a modified build.

## 中文

仓库包含桌面应用源码、回归测试及 Python 打包脚本，与作者的私人原版程序和数据独立。

### 从源码运行

安装 Node.js 22 或更新版本及 npm，在仓库根目录运行：

```sh
npm test
npm install
npm start
```

`npm install` 需要联网下载固定版本 Electron 45.0.0，安装完成后应用可离线运行。纯源码包未包含字体；补入下述字体前会使用系统后备字体。直接下载的软件包已自带字体和运行库。

### 字体

字体二进制文件不属于 Apache-2.0 源码分发内容，请根据其各自适用条款另行准备。在 `app/ui/` 放入 `SaysetthaOT.ttf` 和 `IpaPanNew.ttf` 即可复现发布版字体。上表提供发布版字体的 SHA-256；原始版权和元数据见 `app/ui/FONT-NOTICE.txt`。嵌入标记本身不等于开源许可，本仓库不重新授权这些字体。

### 在 macOS 打包三个平台

需要 Python 3.10 或更新版本及 macOS 自带的 `ditto`、`codesign`。从 [Electron 官方发布页](https://github.com/electron/electron/releases/tag/v45.0.0) 下载上面列出的三个平台 ZIP 和 `SHASUMS256.txt`，放在本地 `runtime/` 目录，然后运行：

```sh
python3 scripts/build.py --runtime-dir runtime
```

脚本先核对运行库校验值，再离线打包。`release/` 包含三个软件 ZIP 和 `SHA256.json`，`build/` 保存临时应用目录。请勿在这两个输出目录中放入个人文件，脚本会重建所属平台目录。Mac 仅做 ad-hoc 签名；此流程不包含公证、商业签名或目标硬件兼容性验证，修改后应在对应系统测试。
