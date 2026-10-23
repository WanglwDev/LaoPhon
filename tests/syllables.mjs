import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx=vm.createContext({});
for(const file of ['tone-engine.js','profile-store.js','syllable-engine.js','correction-store.js']) vm.runInContext(fs.readFileSync(new URL('../app/ui/'+file, import.meta.url),'utf8'),ctx);
const s=ctx.LaoPhonSyllables, tone=ctx.LaoPhonTone, defaults=ctx.LaoPhonProfiles.createDefaultProfile();
let checks=0;
const eq=(a,b,label)=>{assert.deepEqual(JSON.parse(JSON.stringify(a)),b,label);checks++;};
const cases=[
 ['ການຄ້າ',['ການ','ຄ້າ']],['ນັກຮຽນ',['ນັກ','ຮຽນ']],['ພັດທະນາ',['ພັດ','ທະ','ນາ']],
 ['ສະບາຍດີ',['ສະ','ບາຍ','ດີ']],['ພາສາລາວໃນປັດຈຸບັນ',['ພາ','ສາ','ລາວ','ໃນ','ປັດ','ຈຸ','ບັນ']]
];
for(const [text,expected] of cases) {
 const r=s.segment(text); eq(r.tokens.map(t=>t.raw),expected,'syllable boundaries'); eq(r.unknowns.length,0,'no unknowns');
 const ipa=s.transcribe(s.manual(r.segmentedText),tone,defaults.tones,defaults.mappings); eq(ipa.issues.length,0,'IPA support');
}
for(const text of ['ກວດ','ຂວດ','ແຫ້ງ','ແຫ່ງ','ກວາ','ຫນາ']) eq(s.segment(text).segmentedText,text,'existing single syllable regression');
eq(s.segment('ການຄ້າ ABC! ໑໒\nພັດທະນາ').segmentedText,'ການ ຄ້າ ABC! ໑໒\nພັດ ທະ ນາ','mixed source retained');
eq(s.segment('ການຄ້າຯ').segmentedText,'ການ ຄ້າຯ','Lao ellipsis retained as punctuation');
let result=s.transcribe(s.manual('ກ້າ ຂ້າ, ABC 123!'),tone,defaults.tones,defaults.mappings);
eq(result.text,'kaː⁵³khaː³¹, ABC 123!','punctuation and foreign word spacing retained');
eq(s.transcribe(s.manual('ກ້າ ຂ້າ'),tone,defaults.tones,defaults.mappings,true).text,'kaː⁵³ khaː³¹','optional syllable spacing');
for(const text of ['ກ','ກ໊າ','ອື່ນ ໆ','ການຄ້າ']) {
 result=s.transcribe(s.manual(text),tone,defaults.tones,defaults.mappings);
 eq(result.text,'','unsafe transcription blocked'); eq(result.issues.length>0,true,'issue exposed');
}
eq(s.normalize('ກ່ິ'),'ກິ່','tone mark normalization for matching only');
eq(s.segment('ກ່ິ').tokens.map(t=>t.raw).join(''),'ກ່ິ','original codepoint order retained');
// Synthetic strings test grammar ambiguity; they are not claimed attested Lao words.
const ambiguous=s.segment('ເກລວາ'); eq(ambiguous.ambiguities.length>0,true,'multiple structural paths exposed');
const correction={'ເກລວາ':['ເກ','ລວາ']};
eq(s.segment('ເກລວາ',correction).segmentedText,'ເກ ລວາ','local correction overrides rule preference');
eq(s.segment('ເກລວາ',correction).ambiguities.length,0,'explicit local correction removes ambiguity');
eq(s.segment('ເກລວາ',correction).tokens.every(t=>t.origin==='correction'),true,'correction provenance');
assert.throws(()=>s.validateCorrection('ການຄ້າ','ການ ຄາ'));checks++;
assert.throws(()=>s.validateCorrection('ABC','A BC'));checks++;
const storage={data:{},getItem(k){return this.data[k]??null;},setItem(k,v){this.data[k]=v;}};
let repo=new ctx.LaoPhonCorrections.CorrectionRepository(storage);
repo.save('ການຄ້າ','ການ ຄ້າ'); repo=new ctx.LaoPhonCorrections.CorrectionRepository(storage);
eq(repo.entries['ການຄ້າ'],['ການ','ຄ້າ'],'correction persists');
const before=repo.export();assert.throws(()=>repo.import('{"version":1,"entries":{"ການຄ້າ":["ຜິດ"]}}'));checks++;eq(repo.export(),before,'invalid import atomic');
repo.import('{"version":1,"entries":{"ນັກຮຽນ":["ນັກ","ຮຽນ"]}}');eq(Object.keys(repo.entries).length,2,'import merges');
repo.delete('ນັກຮຽນ');eq(Object.keys(repo.entries).length,1,'remove correction');
const blocked=new ctx.LaoPhonCorrections.CorrectionRepository({getItem(){throw Error();},setItem(){throw Error();}});
blocked.save('ການຄ້າ','ການ ຄ້າ');eq(blocked.persistent,false,'blocked storage session mode');eq(Object.keys(blocked.entries).length,1,'session correction usable');
// Deterministic data-preservation fuzz tests, not linguistic accuracy measurements.
let state=91;
const chars=[...'ກຂຄງວອາະິີຶືັ່້ເແໂໆ໑໒', ' ', '\n','\u200B','A','中','!','🙂'];
for(let i=0;i<150;i++) {
 let text='';for(let j=0;j<60;j++){state=(Math.imul(state,1664525)+1013904223)>>>0;text+=chars[state%chars.length];}
 const r=s.segment(text);eq(r.tokens.map(t=>t.raw).join(''),text,'lossless arbitrary text');
 eq(r.tokens.every(t=>text.slice(t.start,t.end)===t.raw),true,'original offsets');
}
const start=performance.now();const long=s.segment('ການຄ້າ'.repeat(1000));
eq(long.unknowns.length,0,'long input coverage');eq(long.tokens.length,2000,'long input syllables');
assert.throws(()=>s.segment('ກ'.repeat(20001)));checks++;
console.log(`PASS: ${checks} syllable/correction assertions; long sample ${Math.round(performance.now()-start)} ms (not an accuracy benchmark)`);
