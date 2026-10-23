/*
 * LaoPhon offline syllable engine, 2026-10-21.
 * Pattern definitions adapted from LaoNLP laonlp/tokenize/syllable.py.
 * Copyright 2020-2026 Wannaphong Phatthiyaphaibun; Apache-2.0.
 * Modified: full-coverage dynamic programming, original offsets, bounded
 * alternatives, local corrections, lossless fragments and manual validation.
 * See THIRD_PARTY_NOTICES.md and LICENSE-LaoNLP.txt.
 */
"use strict";
(function (global) {
  const patternSources = ["(?:ເຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?(?:[່້໊໋]?[ກງຍດນມຢບວ]?(?:[ຈສຊພຟລ]໌)?|[ິີ][່້໊໋]?[ກງຍດນມຢບວ]?(?:[ຈສຊພຟລ]໌)?|[ຶື][່້໊໋]?ອ[ກງຍດນມຢບວ]?(?:[ຈສຊພຟລ]໌)?|າ?ະ|ົ[່້໊໋]?າ|ັ[່້໊໋]?[ກງຍດນມຢບວ](?:[ຈສຊພຟລ]໌)?|ັ?[່້໊໋]?ຽ))", "(?:ແຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?(?:[່້໊໋]?[ວອຽ]?[ກງຍດນມຢບວ]?(?:[ຈສຊພຟລ]໌)?|ະ|ັ[່້໊໋]?[ກງຍດນມຢບວ](?:[ຈສຊພຟລ]໌)?))", "(?:ໂຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?(?:[່້໊໋]?[ກງຍດນມຢບວ]?(?:[ຈສຊພຟລ]໌)?|ະ|ັ[່້໊໋]?[ຍດນມຢບ]?))", "ໄຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?[່້໊໋]?ວ?(?:[ຈສຊພຟລ]໌)?", "ໃຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?[່້໊໋]?ວ?", "ຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?[ຸູ][່້໊໋]?[ກງຍດນມຢບວ]?(?:[ຈສຊພຟລ]໌)?", "ຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?[ິີຶື][່້໊໋]?[ກງຍດນມຢບວ]?(?:[ຈສຊພຟລ]໌)?", "ຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?ໍ[່້໊໋]?າ?(?:[ຈສຊພຟລ]໌)?", "ຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?ົ[່້໊໋]?(?:[ກງຍດນມຢບວ](?:[ຈສຊພຟລ]໌)?|ວະ)", "ຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?ັ[່້໊໋]?ວ?[ກງຍດນມຢບວ](?:[ຈສຊພຟລ]໌)?", "ຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?[່້໊໋]?[ວອຽ][ກງຍດນມຢບວ](?:[ຈສຊພຟລ]໌)?", "ຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?[່້໊໋]?ະ", "ຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?[່້໊໋]?າ[ກງຍດນມຢບວ]?(?:[ຈສຊພຟລ]໌)?", "ຫ?[ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ][ຼຣວລ]?[່້໊໋]?ຳ(?:[ຈສຊພຟລ]໌)?"];

  const MAX_INPUT = 20000;
  const MAX_SYLLABLE = 16;
  const laoRun = /[\u0E80-\u0EAE\u0EB0-\u0EC5\u0EC7-\u0ECF\u0EDA-\u0EFF]+|[\u0EAF\u0EC6]|[\u0ED0-\u0ED9]+|[^\u0E80-\u0EFF]+/gu;
  const isLaoRun = text => /^[\u0E80-\u0EAE\u0EB0-\u0EC5\u0EC7-\u0ECF\u0EDA-\u0EFF]+$/u.test(text);
  const toneOrder = /([ກຂຄງຈສຊຍດຕຖທນບປຜຝພຟມຢຣລວຫອຮໜໝ])([່້໊໋])([ັິີຶືຸູົໍ])/gu;
  function normalize(text) { return String(text).normalize("NFC").replace(toneOrder, "$1$3$2"); }
  const rules = patternSources.map(source => new RegExp(`^(?:${source})$`, "u"));
  function isSyllable(text) { return text.length > 0 && text.length <= MAX_SYLLABLE && rules.some(rule => rule.test(normalize(text))); }
  function validateCorrection(source, split) {
    source = String(source || "").trim();
    const syllables = Array.isArray(split) ? split.map(String) : String(split || "").trim().split(/\s+/u);
    if (!isLaoRun(source) || source.length > 200 || !source) throw new Error("原文需为连续的老挝文字串（不含空格、数字或重复符号），最多 200 字符。");
    if (!syllables.length || syllables.length > 100 || syllables.some(s => !s || !isLaoRun(s)) || syllables.join("") !== source) throw new Error("拆分只能增加音节间空格，不能增删或替换原文字母。");
    return { source, syllables };
  }
  function solveRun(text, offset, corrections) {
    const n = text.length;
    const forced = new Map();
    for (const [key, value] of Object.entries(corrections)) {
      let entry;
      try { entry = validateCorrection(key, value); } catch (_) { continue; }
      let pos = text.indexOf(key);
      while (pos !== -1) {
        if (!forced.has(pos) || forced.get(pos).source.length < key.length) forced.set(pos, entry);
        pos = text.indexOf(key, pos + 1);
      }
    }
    const dp = new Array(n + 1);
    dp[n] = [{ unknown: 0, count: 0, edge: [], next: null }];
    let nextForced = n;
    for (let i = n - 1; i >= 0; i--) {
      const options = [];
      const add = (end, edge, unknown) => {
        for (const tail of dp[end]) options.push({ unknown: unknown + tail.unknown, count: edge.length + tail.count, edge, next: tail });
      };
      const correction = forced.get(i);
      if (correction) {
        let start = offset + i;
        const edge = correction.syllables.map(raw => { const t = {raw, start, end:start + raw.length, type:"syllable", origin:"correction"}; start += raw.length; return t; });
        add(i + correction.source.length, edge, 0);
      } else {
        for (let end = Math.min(n, i + MAX_SYLLABLE, nextForced); end > i; end--) {
          const raw = text.slice(i, end);
          if (isSyllable(raw)) add(end, [{raw, start:offset+i, end:offset+end, type:"syllable", origin:"rule"}], 0);
        }
        add(i + 1, [{raw:text[i], start:offset+i, end:offset+i+1, type:"unknown", origin:"unknown"}], 1);
      }
      options.sort((a,b) => a.unknown - b.unknown || a.count - b.count);
      const best = options[0];
      // At most two structurally different best-coverage paths; no exponential lists.
      dp[i] = options.filter(o => o.unknown === best.unknown).slice(0, 2);
      if (correction) nextForced = i;
    }
    const unpack = path => { const out=[]; while(path) { out.push(...path.edge); path=path.next; } return out; };
    const mergeUnknowns = tokens => {
      const out=[];
      for (const token of tokens) {
        const last=out[out.length-1];
        if(last && last.type === "unknown" && token.type === "unknown") { last.raw+=token.raw; last.end=token.end; }
        else out.push({...token});
      }
      return out;
    };
    const paths = dp[0].map(p => mergeUnknowns(unpack(p)));
    const tokens=paths[0];
    const options=paths.map(path => path.map(t => t.raw).join(" "));
    return {tokens, alternative: options.length > 1 && options[0] !== options[1] ? {start:offset,end:offset+n,raw:text,options} : null};
  }
  function segment(text, corrections = {}) {
    text=String(text || "");
    if(text.length > MAX_INPUT) throw new Error("单次最多处理 20,000 字符，请分段处理。");
    const tokens=[], ambiguities=[];
    for(const match of text.matchAll(laoRun)) {
      const raw=match[0], start=match.index;
      if(isLaoRun(raw)) {
        const run=solveRun(raw,start,corrections);
        tokens.push(...run.tokens);
        if(run.alternative) ambiguities.push(run.alternative);
      } else tokens.push({raw,start,end:start+raw.length,type:raw === "ໆ" ? "repeat" : "other",origin:"original"});
    }
    let segmentedText="";
    tokens.forEach((token,i) => {
      const prev=tokens[i-1];
      if(prev && prev.type !== "other" && token.type !== "other") segmentedText+=" ";
      segmentedText+=token.raw;
    });
    return {tokens,ambiguities,segmentedText,unknowns:tokens.filter(t=>t.type === "unknown")};
  }
  function manual(text) {
    const tokens=[];
    text=String(text || "");
    if(text.length > MAX_INPUT) throw new Error("单次最多处理 20,000 字符，请分段处理。");
    for(const match of text.matchAll(laoRun)) {
      const raw=match[0],start=match.index;
      tokens.push({raw,start,end:start+raw.length,type:isLaoRun(raw)?(isSyllable(raw)?"syllable":"unknown"):(raw==="ໆ"?"repeat":"other"),origin:"manual"});
    }
    return {tokens,ambiguities:[],segmentedText:text,unknowns:tokens.filter(t=>t.type==="unknown")};
  }
  function transcribe(analysis, toneEngine, tones, mappings, spaced = false) {
    const issues=[];
    const rendered=analysis.tokens.map(token => {
      if(token.type === "unknown") { issues.push({token,reason:"未识别为单音节，请检查拼写和空格"}); return token.raw; }
      if(token.type === "repeat") { issues.push({token,reason:"请将重复符号展开为实际需要重复的音节"}); return token.raw; }
      if(token.type !== "syllable") return token.raw;
      const raw=normalize(token.raw);
      const inspection=toneEngine.inspectSyllable(raw);
      if(!inspection.supported) { issues.push({token,reason:inspection.reason}); return token.raw; }
      return toneEngine.processSyllable(raw,tones,mappings);
    });
    let text="";
    analysis.tokens.forEach((token,i) => {
      if(token.type === "other" && /^[\s\u200B]+$/u.test(token.raw)) {
        const prev=analysis.tokens[i-1],next=analysis.tokens[i+1];
        if(prev?.type === "syllable" && next?.type === "syllable") { if(spaced) text+=" "; return; }
      }
      if(spaced && token.type === "syllable" && analysis.tokens[i-1]?.type === "syllable") text+=" ";
      text+=rendered[i];
    });
    return {text:issues.length?"":text,issues};
  }
  global.LaoPhonSyllables=Object.freeze({version:"2.0.0",MAX_INPUT,isSyllable,normalize,validateCorrection,segment,manual,transcribe});
})(typeof globalThis!=="undefined"?globalThis:this);
