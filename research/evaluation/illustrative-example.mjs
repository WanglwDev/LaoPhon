import fs from 'node:fs';
import path from 'node:path';
import {loadEngine,projectRoot} from './engine-adapter.mjs';
const e=loadEngine(),text='ພາສາລາວໃນປັດຈຸບັນ';
const auto=e.S.segment(text),reviewed=auto.tokens.map(t=>t.raw);
const saved=e.S.validateCorrection(text,reviewed);
const corrected=e.S.segment(text,{[text]:saved.syllables});
const profile=JSON.parse(JSON.stringify(e.profile));profile.id='research-aspiration-demo';profile.name='Aspiration notation demonstration';profile.mappings.consonants['ພ']='pʰ';
const output=p=>e.S.transcribe(e.S.manual(reviewed.join(' ')),e.T,p.tones,p.mappings,true);
const result={source_text:text,
  source_reference:'https://github.com/wannaphong/LaoNLP/blob/a914f64e38ff24d67d32e37db40dad5c368ea602/laonlp/tokenize/syllable.py',
  source_license:'Apache-2.0; Copyright 2020–2026 Wannaphong Phatthiyaphaibun; short documented example reused with attribution',
  nature:'Documented software example, not naturalistic corpus evaluation. Also appears in development fixtures; ineligible for held-out evaluation.',
  automatic_syllables:reviewed,manual_review:'Retained the documented boundaries; no correction experiment or independent pronunciation annotation is claimed.',
  saved_correction:saved,reapplied_correction_origins:corrected.tokens.map(t=>t.origin),
  default_output:output(e.profile),edited_profile_change:{group:'consonants',grapheme:'ພ',from:'ph',to:'pʰ'},edited_output:output(profile),
  per_syllable:reviewed.map(s=>({source:s,...e.inspect(s)})),source_hashes:e.hashes};
const out=path.join(projectRoot,'research/evaluation/results');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'illustrative-example.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
