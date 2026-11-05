// Functional conformance probes. Expected values derive from source semantics,
// never from an independent pronunciation gold standard.
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {defaultSource, projectRoot} from './engine-adapter.mjs';
const out=path.join(projectRoot,'research/evaluation/results'); fs.mkdirSync(out,{recursive:true});
const engineDir=path.join(defaultSource,'app/ui');
const ctx=vm.createContext({});
const files=['tone-engine.js','profile-store.js','syllable-engine.js','correction-store.js'];
for(const file of files)vm.runInContext(fs.readFileSync(path.join(engineDir,file),'utf8'),ctx,{filename:file});
const T=ctx.LaoPhonTone,S=ctx.LaoPhonSyllables,P=ctx.LaoPhonProfiles,D=P.createDefaultProfile();
const rows=[]; const simple=x=>JSON.parse(JSON.stringify(x));
function check(id,type,input,actual,expected,note='source-derived expectation'){
 const pass=JSON.stringify(simple(actual))===JSON.stringify(simple(expected));
 rows.push({id,type,input,expected,actual: simple(actual),pass,note}); return pass;
}
const groups={Mid:{A:'1t',B:'5t',C:'3t',DS:'7t',DL:'9t'},High:{A:'1',B:'5',C:'3',DS:'7',DL:'9'},Low:{A:'2',B:'6',C:'4',DS:'8',DL:'10'}};
let ti=0;
for(const c of ['Mid','High','Low'])for(const v of ['Short','Long','Special'])for(const f of ['None','Stop','Nasal','Vowel'])for(const m of [0,1,2]){
 const series=m===1?'B':m===2?'C':(f==='Nasal'||f==='Vowel'||(f==='None'&&v!=='Short'))?'A':v==='Short'?'DS':'DL';
 check(`T${++ti}`,'tone-cartesian',{c,v,f,m},T.getToneClass(c,v,f,m),groups[c][series]);
}
const fixtures=[['1t','ກາ','kaː¹¹'],['1','ຂາ','khaː²⁴'],['2','ຄາ','khaː⁴⁵'],['3t','ກ້າ','kaː⁵³'],['3','ຂ້າ','khaː³¹'],['4','ຄ້າ','khaː⁵³'],['5t','ກ່າ','kaː³³'],['5','ຂ່າ','khaː³³'],['6','ຄ່າ','khaː³³'],['7t','ກະ','ka⁴⁵'],['7','ຂະ','kha⁴⁵'],['8','ຄະ','kha³³'],['9t','ກາດ','kaːt³¹'],['9','ຂາດ','khaːt³¹'],['10','ຄາດ','khaːt⁵³']];
for(const [c,text,expected] of fixtures)check('E-'+c,'tone-orthographic-fixture',text,T.processSyllable(text,D.tones),expected,'orthographic fixture; no independent lexical/pronunciation attestation');
const trans=(text,spaced=false)=>simple(S.transcribe(S.manual(text),T,D.tones,D.mappings,spaced));
const reject=text=>{const r=trans(text);return {empty:r.text==='',issues:r.issues.length>0};};
check('P01','onset-score','ກວດ',T.processSyllable('ກວດ',D.tones),'kuːat³¹');
check('P02','onset-score','ຂວດ',T.processSyllable('ຂວດ',D.tones),'khuːat³¹');
check('P03','onset-score','ກວາ',T.processSyllable('ກວາ',D.tones),'kwaː¹¹');
check('P04','onset-score','ແຫ້ງ',T.processSyllable('ແຫ້ງ',D.tones),'hɛːŋ³¹');
check('P05','whole-vowel-before-final','ກັວ',T.processSyllable('ກັວ',D.tones),'kua⁴⁵','constructed string; direct vowel ັວ takes priority over ັ+final ວ');
for(const text of ['ກ','ກ໊າ','ກ່້າ','ອື່ນ ໆ','ການຄ້າ'])check('R-'+text,'strict-rejection',text,reject(text),{empty:true,issues:true});
check('P06','raw-fallback','ກ',T.processSyllable('ກ',D.tones),'ka⁴⁵');
check('P07','repeat-api-difference','ອື່ນໆ',T.lao2ipa('ອື່ນໆ',D.tones),'ʔɯːn³³ʔɯːn³³');
const amb=S.segment('ເກລວາ');
check('P08','ambiguity','ເກລວາ',amb.ambiguities.length>0,true,'synthetic grammar ambiguity, not claimed attested word');
const corrected=S.segment('ເກລວາ',{'ເກລວາ':['ເກ','ລວາ']});
check('P09','correction','ເກລວາ',{text:corrected.segmentedText,ambiguities:corrected.ambiguities.length,origin:corrected.tokens.every(t=>t.origin==='correction')},{text:'ເກ ລວາ',ambiguities:0,origin:true});
const longest=S.segment('ການຄ້າ',{'ການ':['ກາ','ນ'],'ການຄ້າ':['ການ','ຄ້າ']});
check('P10','correction-longest','ການຄ້າ',longest.segmentedText,'ການ ຄ້າ');
const badCorr=S.segment('ກ',{'ກ':['ກ']});
check('P11','correction-not-pronunciation-validation','ກ',{forced:badCorr.tokens[0].origin,rejected:S.transcribe(badCorr,T,D.tones,D.mappings).issues.length>0},{forced:'correction',rejected:true});
const mixed='ການຄ້າ ABC! ໑໒\nພັດທະນາ 🙂中';const mix=S.segment(mixed);
check('P12','lossless-original',mixed,mix.tokens.map(t=>t.raw).join(''),mixed);
check('P13','original-utf16-offsets',mixed,mix.tokens.every(t=>mixed.slice(t.start,t.end)===t.raw),true);
check('P14','mixed-transcription','ກ້າ ຂ້າ, ABC 123!',trans('ກ້າ ຂ້າ, ABC 123!').text,'kaː⁵³khaː³¹, ABC 123!');
check('P15','optional-spacing','ກ້າ ຂ້າ',trans('ກ້າ ຂ້າ',true).text,'kaː⁵³ khaː³¹');
check('P16','normalization','ກ່ິ',S.normalize('ກ່ິ'),'ກິ່');
check('P17','normalization-preserves-source','ກ່ິ',S.segment('ກ່ິ').tokens.map(t=>t.raw).join(''),'ກ່ິ');
const custom=simple(D.mappings);custom.consonants['ຂ']='x';custom.vowels['າ']='ɑː';custom.finals['ນ']='ɲ';
check('P18','configuration-label-invariance','ຂານ',{ipa:T.processSyllable('ຂານ',D.tones,custom),toneClass:T.getToneClass('High','Long','Nasal',0),highMetadata:T.segmentEntries.consonants.find(x=>x.grapheme==='ຂ').class},{ipa:'xɑːɲ²⁴',toneClass:'1',highMetadata:'High'});
check('P19','configuration-tone-value','ຂາ',T.processSyllable('ຂາ',{...D.tones,'1':'11'}),'khaː¹¹');
const invalidAccepted={...D,mappings:simple(D.mappings)};invalidAccepted.mappings.consonants['ກ']='XYZ';
check('P20','ipa-validation-is-only-format','XYZ',new P.ProfileRepository({getItem(){return null;},setItem(){}}).save({...invalidAccepted,id:'test-invalid',name:'合成方案'}).mappings.consonants['ກ']==='XYZ',true,'accepts arbitrary nonempty short string; not an IPA inventory validator');
// White-box observation: expose private parseRhyme in memory only, preserving source file.
const traced=fs.readFileSync(path.join(engineDir,'tone-engine.js'),'utf8').replace('  global.LaoPhonTone = Object.freeze({','  global.__trace = {parseRhyme,consKeys};\n  global.LaoPhonTone = Object.freeze({');
const instrumented=vm.createContext({});vm.runInContext(traced,instrumented);
const candidateTrace=['ກວດ','ຂວດ','ກວາ','ແຫ້ງ','ກັວ'].map(raw=>{const text=raw.replace(/[່້]/u,'');const initial=text.replace(/^[ເແໂໄໃ]/u,'');return {raw,candidates:instrumented.__trace.consKeys.filter(c=>initial.startsWith(c)).map(c=>{const r=instrumented.__trace.parseRhyme(text,c);return {c,vowelKey:r.vowelKey,finalKey:r.finalKey,matched:r.matched,score:(r.matched?100:0)+(r.finalKey?10:0)};})};});
const result={timestamp:new Date().toISOString(),node:process.version,scope:'functional conformance; source-derived expectations; no independent gold corpus',suite:'GitHub v2.0.3 source/app/ui',total:rows.length,passed:rows.filter(r=>r.pass).length,failed:rows.filter(r=>!r.pass).length,toneClassesExercised:[...new Set(rows.filter(r=>r.type==='tone-cartesian').map(r=>r.actual))],rows,candidateTrace,ambiguityObservation:simple(amb),sourceHashes:Object.fromEntries(files.map(f=>[f,createHash('sha256').update(fs.readFileSync(path.join(engineDir,f))).digest('hex')]))};
fs.writeFileSync(path.join(out,'functional-probes.json'),JSON.stringify(result,null,2)+'\n');
const quote=x=>'"'+String(typeof x==='object'?JSON.stringify(x):x).replaceAll('"','""')+'"';
fs.writeFileSync(path.join(out,'functional-probes.csv'),'id,type,input,expected,actual,pass,note\n'+rows.map(r=>[r.id,r.type,r.input,r.expected,r.actual,r.pass,r.note].map(quote).join(',')).join('\n')+'\n');
console.log(JSON.stringify({total:result.total,passed:result.passed,failed:result.failed,toneClasses:result.toneClassesExercised,failures:rows.filter(r=>!r.pass),candidateTrace},null,2));if(result.failed)process.exitCode=1;
