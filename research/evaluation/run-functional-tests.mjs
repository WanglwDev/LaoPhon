// Re-run published tests and count actual executed assertions. No source edits.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {loadEngine,defaultSource,projectRoot} from './engine-adapter.mjs';
const sourceRoot=path.resolve(process.argv[2]||defaultSource);
const out=path.join(projectRoot,'research/evaluation/results'); fs.mkdirSync(out,{recursive:true});
const outputs=[];
for(const file of ['regression.mjs','i18n.mjs','syllables.mjs']) {
  const r=spawnSync(process.execPath,[path.join(sourceRoot,'tests',file)],{encoding:'utf8',cwd:sourceRoot});
  fs.writeFileSync(path.join(out,file+'.log'),r.stdout+r.stderr);
  outputs.push({file,exit_code:r.status,stdout:r.stdout,stderr:r.stderr});
  if(r.status!==0) throw Error('Published suite failed: '+file);
}
const methods=['equal','deepEqual','match','doesNotMatch'];
const original=Object.fromEntries(methods.map(k=>[k,assert[k]]));let direct=0,controller=0,core=0;
for(const k of methods) assert[k]=(...args)=>{const r=original[k](...args);direct++;return r;};
const run=vm.runInContext;
vm.runInContext=function(code,ctx,...args){
  const isController=String(code).includes('PASS: UI controller smoke test');
  if(isController){
    const anchor='function assert(condition, message) {';
    if(!String(code).includes(anchor))throw Error('Controller counter anchor changed');
    code=String(code).replace(anchor,anchor+'\n globalThis.__researchAssertions=(globalThis.__researchAssertions||0)+1;');
  }
  const result=run.call(vm,code,ctx,...args);
  if(isController)controller+=ctx.__researchAssertions;
  return result;
};
try{await import(pathToFileURL(path.join(sourceRoot,'tests/regression.mjs')));}
finally{for(const k of methods)assert[k]=original[k];vm.runInContext=run;}
const coreMatch=outputs[0].stdout.match(/PASS: (\d+) assertions/);if(!coreMatch)throw Error('Core count missing');core=Number(coreMatch[1]);
const counts={conversion_controller_profile:{core,controller,direct,total:core+controller+direct},
  bilingual:Number(outputs[1].stdout.match(/PASS: (\d+) bilingual/)[1]),
  syllables_corrections:Number(outputs[2].stdout.match(/PASS: (\d+) syllable/)[1])};
const engine=loadEngine(sourceRoot);
const report={timestamp:new Date().toISOString(),node:process.version,platform:process.platform,arch:process.arch,
  source_root:path.relative(projectRoot,sourceRoot)||'.',package_version:JSON.parse(fs.readFileSync(path.join(sourceRoot,'package.json'))).version,
  counts,all_passed:true,source_hashes:engine.hashes,
  inventories:{initials:engine.T.segmentEntries.consonants.length,vowels:engine.T.segmentEntries.vowels.length,
    finals:engine.T.segmentEntries.finals.length,tones:engine.T.toneClasses.length,
    syllable_pattern_groups:JSON.parse(fs.readFileSync(path.join(sourceRoot,'app/ui/syllable-engine.js'),'utf8').match(/const patternSources = (\[.*\]);/)[1]).length},
  scope:'Internal functional assertions, not independent linguistic evaluation; groups overlap in behavior.'};
fs.writeFileSync(path.join(out,'functional-baseline.json'),JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(path.join(out,'mapping-inventory.json'),JSON.stringify({segments:engine.T.segmentEntries,tones:engine.profile.tones,toneLabels:engine.T.toneClassLabels},null,2)+'\n');
console.log(JSON.stringify(report,null,2));
