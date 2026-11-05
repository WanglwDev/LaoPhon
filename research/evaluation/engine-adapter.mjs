// Research adapter only. The application files are loaded without on-disk edits.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const bundledSource = path.join(projectRoot, 'github-release/v2.0.3/source/LaoPhon');
export const defaultSource = fs.existsSync(path.join(bundledSource, 'app/ui/tone-engine.js'))
  ? bundledSource
  : projectRoot;
export function loadEngine(sourceRoot = defaultSource) {
  const context = vm.createContext({});
  const hashes = {};
  for (const file of ['tone-engine.js','profile-store.js','syllable-engine.js','correction-store.js']) {
    const bytes = fs.readFileSync(path.join(sourceRoot,'app/ui',file));
    hashes[file] = createHash('sha256').update(bytes).digest('hex');
    vm.runInContext(bytes.toString('utf8'),context,{filename:file});
  }
  const T=context.LaoPhonTone,S=context.LaoPhonSyllables,P=context.LaoPhonProfiles;
  // Expose private parser data in a SECOND VM for observation only.
  // The original VM remains the authority for predictions.
  const source=fs.readFileSync(path.join(sourceRoot,'app/ui/tone-engine.js'),'utf8');
  const marker='  global.LaoPhonTone = Object.freeze({';
  if (source.split(marker).length!==2) throw Error('Unsupported source: trace anchor changed');
  const traced=vm.createContext({});
  vm.runInContext(source.replace(marker,'  global.__research={parseRhyme,consKeys,consonantsDb};\n'+marker),traced);
  const priv=traced.__research;
  const profile=P.createDefaultProfile();
  function inspect(raw, active=profile) {
    const normalized=S.normalize(raw);
    if (!T.inspectSyllable(normalized).supported) return {supported:false};
    const markMatch=normalized.match(/[່້]/u),mark=markMatch?(markMatch[0]==='່'?1:2):0;
    const text=normalized.replace(/[່້]/u,''),onsetText=text.replace(/^[ເແໂໄໃ]/u,'');
    const candidates=priv.consKeys.filter(c=>onsetText.startsWith(c)).map(c=>{
      const rhyme=priv.parseRhyme(text,c);
      return {c,rhyme,score:(rhyme.matched?100:0)+(rhyme.finalKey?10:0)};
    });
    const selected=candidates.reduce((a,b)=>b.score>a.score?b:a);
    const {c,rhyme:r}=selected,info=priv.consonantsDb[c];
    const key=T.getToneClass(info.class,r.vowelInfo.len,r.finalInfo.type,mark);
    const result={supported:true,initial_grapheme:c,vowel_template:r.vowelKey,final_grapheme:r.finalKey??'',
      initial:active.mappings.consonants[c],vowel:active.mappings.vowels[r.vowelKey],
      final:r.finalKey?active.mappings.finals[r.finalKey]:'',tone_category:T.toneClassLabels[key],
      tone_value:active.tones[key],tone_key:key,consonant_class:info.class,vowel_length:r.vowelInfo.len,final_type:r.finalInfo.type};
    result.ipa=T.processSyllable(normalized,active.tones,active.mappings);
    const assembled=result.initial+result.vowel+result.final+T.digitsToSuperscript(result.tone_value);
    if(assembled!==result.ipa) throw Error('Trace disagrees with authoritative conversion');
    return result;
  }
  return {T,S,P,profile,inspect,hashes,sourceRoot};
}
