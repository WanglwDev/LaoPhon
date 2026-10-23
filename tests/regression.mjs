import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const ui = path.join(root, 'app/ui');
const tests = path.join(root, 'tests/fixtures');
const readUi = name => fs.readFileSync(path.join(ui, name), 'utf8');
for (const file of ['engine.js', 'ui-smoke.js']) {
  const ctx = vm.createContext({ print: console.log });
  ctx.load = source => vm.runInContext(readUi(source.replace(/^dist\//, '')), ctx);
  vm.runInContext(fs.readFileSync(path.join(tests, file), 'utf8'), ctx);
}

const harness = fs.readFileSync(path.join(tests, 'ui-smoke.js'), 'utf8').split('load("dist/tone-engine.js");')[0];
function boot(seed = {}) {
  const ctx = vm.createContext({ seed });
  vm.runInContext(harness, ctx);
  vm.runInContext('Object.assign(localStorage.values, seed); window.location = {protocol:"laophon-share:"};', ctx);
  for (const name of ['tone-engine.js','profile-store.js','syllable-engine.js','correction-store.js','app.js']) {
    vm.runInContext(readUi(name), ctx);
  }
  return code => vm.runInContext(code, ctx);
}

let run = boot();
const defaults = JSON.parse(run('JSON.stringify(profilesApi.createDefaultProfile())'));
const privateProfiles = JSON.stringify({version:2,profiles:[defaults,{...defaults,id:'private',name:'Private test variety'}]});
const seed = {
  'laophon.languageProfiles.v2': privateProfiles,
  'laophon.activeProfile.v1': 'private',
  'laophon.syllableCorrections.v1': JSON.stringify({version:1,entries:{'ພັດທະນາ':'ພັດ ທະ ນາ'}})
};
run = boot(seed);
assert.equal(run('repository.list().length'), 1);
assert.equal(run('activeProfile.name'), '万象');
assert.equal(run('profilesApi.STORAGE_KEY'), 'laophon.share.languageProfiles.v2');
assert.equal(run('ACTIVE_PROFILE_KEY'), 'laophon.share.activeProfile.v1');
assert.equal(run('localStorage.values["laophon.languageProfiles.v2"]'), privateProfiles);
assert.equal(run('localStorage.values["laophon.activeProfile.v1"]'), 'private');
assert.equal(run('Object.keys(corrections.entries).length'), 0);
assert.equal(run('document.getElementById("offlineStatus").textContent'), '桌面版 · 离线运行');
run('manageProfilesButton.dispatch("click"); newProfileButton.dispatch("click"); profileNameInput.value="用户新增"; useProfileButton.dispatch("click")');
assert.equal(run('repository.list().length'), 2);
assert.equal(run('activeProfile.name'), '用户新增');
run = boot(JSON.parse(run('JSON.stringify(localStorage.values)')));
assert.equal(run('activeProfile.name'), '用户新增');
assert.equal(run('repository.list().length'), 2);
assert.equal(run('repository.list().some(p=>p.name==="Private test variety")'), false);
run('manualSeg.value="ກ້າ ຂ້າ"; manualSeg.dispatch("input"); convertButton.dispatch("click")');
assert.equal(run('ipaOutput.textContent'), 'kaː⁵³khaː³¹');
const html = readUi('index.html');
assert.match(html, /Content-Security-Policy/);
assert.doesNotMatch(readUi('tone-engine.js') + readUi('profile-store.js') + html, /Private test variety/);
console.log('PASS: share edition ignores private profile/correction keys, preserves private values, starts with Vientiane, saves new points and converts offline');
