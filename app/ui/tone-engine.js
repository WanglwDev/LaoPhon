"use strict";

(function attachToneEngine(global) {
  const consonantsDb = {
    "ຂ": { ipa: "kh", class: "High" }, "ຫງ": { ipa: "ŋ", class: "High" },
    "ສ": { ipa: "s", class: "High" }, "ຫຍ": { ipa: "ȵ", class: "High" },
    "ຖ": { ipa: "th", class: "High" }, "ຫນ": { ipa: "n", class: "High" },
    "ໜ": { ipa: "n", class: "High" }, "ຫມ": { ipa: "m", class: "High" },
    "ໝ": { ipa: "m", class: "High" }, "ຜ": { ipa: "ph", class: "High" },
    "ຝ": { ipa: "f", class: "High" }, "ຫລ": { ipa: "l", class: "High" },
    "ຫຼ": { ipa: "l", class: "High" }, "ຫວ": { ipa: "v", class: "High" },
    "ຫ": { ipa: "h", class: "High" }, "ຂວ": { ipa: "khw", class: "High" },
    "ກ": { ipa: "k", class: "Mid" }, "ຈ": { ipa: "ʦ", class: "Mid" },
    "ດ": { ipa: "d", class: "Mid" }, "ຕ": { ipa: "t", class: "Mid" },
    "ບ": { ipa: "b", class: "Mid" }, "ປ": { ipa: "p", class: "Mid" },
    "ຢ": { ipa: "j", class: "Mid" }, "ອ": { ipa: "ʔ", class: "Mid" },
    "ກວ": { ipa: "kw", class: "Mid" },
    "ຄ": { ipa: "kh", class: "Low" }, "ງ": { ipa: "ŋ", class: "Low" },
    "ຊ": { ipa: "s", class: "Low" }, "ຍ": { ipa: "ȵ", class: "Low" },
    "ທ": { ipa: "th", class: "Low" }, "ນ": { ipa: "n", class: "Low" },
    "ມ": { ipa: "m", class: "Low" }, "ພ": { ipa: "ph", class: "Low" },
    "ຟ": { ipa: "f", class: "Low" }, "ລ": { ipa: "l", class: "Low" },
    "ວ": { ipa: "v", class: "Low" }, "ຮ": { ipa: "h", class: "Low" },
    "ຣ": { ipa: "r", class: "Low" }, "ຄວ": { ipa: "khw", class: "Low" },
    "ທວ": { ipa: "thw", class: "Low" }, "ງວ": { ipa: "ŋw", class: "Low" }
  };

  const finalsDb = {
    "ກ": { ipa: "k", type: "Stop" }, "ດ": { ipa: "t", type: "Stop" },
    "ບ": { ipa: "p", type: "Stop" }, "ນ": { ipa: "n", type: "Nasal" },
    "ງ": { ipa: "ŋ", type: "Nasal" }, "ມ": { ipa: "m", type: "Nasal" },
    "ຍ": { ipa: "i", type: "Vowel" }, "ວ": { ipa: "u", type: "Vowel" }
  };

  const vowelsDb = {
    "ະ": { ipa: "a", len: "Short", type: "Open" }, "ິ": { ipa: "i", len: "Short", type: "Open" },
    "ຶ": { ipa: "ɯ", len: "Short", type: "Open" }, "ຸ": { ipa: "u", len: "Short", type: "Open" },
    "ເ-ະ": { ipa: "e", len: "Short", type: "Open" }, "ແ-ະ": { ipa: "ɛ", len: "Short", type: "Open" },
    "ໂ-ະ": { ipa: "o", len: "Short", type: "Open" }, "ເ-າະ": { ipa: "ɔ", len: "Short", type: "Open" },
    "ເ-ິ": { ipa: "ə", len: "Short", type: "Open" }, "ເ-ັຍ": { ipa: "ia", len: "Short", type: "Open" },
    "ເ-ຶອ": { ipa: "ɯa", len: "Short", type: "Open" }, "ົວະ": { ipa: "ua", len: "Short", type: "Open" },
    "ັ": { ipa: "a", len: "Short", type: "Closed" }, "ເ-ັ": { ipa: "e", len: "Short", type: "Closed" },
    "ແ-ັ": { ipa: "ɛ", len: "Short", type: "Closed" }, "ົ": { ipa: "o", len: "Short", type: "Closed" },
    "ັອ": { ipa: "ɔ", len: "Short", type: "Closed" }, "ັຽ": { ipa: "ia", len: "Short", type: "Closed" },
    "ັວ": { ipa: "ua", len: "Short", type: "Closed" }, "າ": { ipa: "aː", len: "Long", type: "Open" },
    "ີ": { ipa: "iː", len: "Long", type: "Open" }, "ື": { ipa: "ɯː", len: "Long", type: "Open" },
    "ູ": { ipa: "uː", len: "Long", type: "Open" }, "ເ-": { ipa: "eː", len: "Long", type: "Open" },
    "ແ-": { ipa: "ɛː", len: "Long", type: "Open" }, "ໂ-": { ipa: "oː", len: "Long", type: "Open" },
    "ໍ": { ipa: "ɔː", len: "Long", type: "Open" }, "ເ-ີ": { ipa: "əː", len: "Long", type: "Open" },
    "ເ-ຍ": { ipa: "iːa", len: "Long", type: "Open" }, "ເ-ືອ": { ipa: "ɯːa", len: "Long", type: "Open" },
    "ົວ": { ipa: "uːa", len: "Long", type: "Open" }, "ອ": { ipa: "ɔː", len: "Long", type: "Closed" },
    "ຽ": { ipa: "iːa", len: "Long", type: "Closed" }, "ວ": { ipa: "uːa", len: "Long", type: "Closed" },
    "ໄ-": { ipa: "ai", len: "Special", type: "Open" }, "ໃ-": { ipa: "ai", len: "Special", type: "Open" },
    "ເ-ົາ": { ipa: "au", len: "Special", type: "Open" }, "ຳ": { ipa: "am", len: "Special", type: "Open" },
    "-ໍາ": { ipa: "am", len: "Special", type: "Open" }
  };

  const toneMarksDb = { "່": 1, "້": 2 };
  const toneClasses = ["1t", "1", "2", "3t", "3", "4", "5t", "5", "6", "7t", "7", "8", "9t", "9", "10"];
  const toneClassLabels = {
    "1t": "AM", "1": "AH", "2": "AL", "3t": "CM", "3": "CH", "4": "CL",
    "5t": "BM", "5": "BH", "6": "BL", "7t": "DSM", "7": "DSH", "8": "DSL",
    "9t": "DLM", "9": "DLH", "10": "DLL"
  };
  const superscriptDigits = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"
  };

  const consKeys = Object.keys(consonantsDb).sort((a, b) => [...b].length - [...a].length);
  const consPattern = new RegExp(`^(${consKeys.join("|")})`, "u");

  const segmentEntries = Object.freeze({
    consonants: Object.freeze(Object.entries(consonantsDb).map(([grapheme, info]) => Object.freeze({
      grapheme, ipa: info.ipa, class: info.class
    }))),
    vowels: Object.freeze(Object.entries(vowelsDb).map(([grapheme, info]) => Object.freeze({
      grapheme, ipa: info.ipa, len: info.len, type: info.type
    }))),
    finals: Object.freeze(Object.entries(finalsDb).map(([grapheme, info]) => Object.freeze({
      grapheme, ipa: info.ipa, type: info.type
    })))
  });

  const defaultSegmentMappings = Object.freeze({
    consonants: Object.freeze(Object.fromEntries(segmentEntries.consonants.map(item => [item.grapheme, item.ipa]))),
    vowels: Object.freeze(Object.fromEntries(segmentEntries.vowels.map(item => [item.grapheme, item.ipa]))),
    finals: Object.freeze(Object.fromEntries(segmentEntries.finals.map(item => [item.grapheme, item.ipa])))
  });

  function squish(text) {
    return String(text || "").trim().replace(/\s+/gu, " ");
  }

  function lastChar(text) {
    const chars = [...text];
    return chars.length ? chars[chars.length - 1] : "";
  }

  function withoutLastChar(text) {
    const chars = [...text];
    return chars.length > 1 ? chars.slice(0, -1).join("") : "";
  }

  // This mirrors get_tone_value() in 【R】LaoPhon_调类.rtf.
  function getToneClass(consClass, vLen, finalType, toneMark) {
    const isSonorantFinal = ["Nasal", "Vowel"].includes(finalType);
    const isStopFinal = finalType === "Stop";
    const noFinal = finalType === "None";
    const isShort = vLen === "Short";

    if (toneMark === 0) {
      if (noFinal) {
        if (consClass === "Mid") return isShort ? "7t" : "1t";
        if (consClass === "High") return isShort ? "7" : "1";
        if (consClass === "Low") return isShort ? "8" : "2";
      }
      if (isStopFinal) {
        if (consClass === "Mid") return isShort ? "7t" : "9t";
        if (consClass === "High") return isShort ? "7" : "9";
        if (consClass === "Low") return isShort ? "8" : "10";
      }
      if (isSonorantFinal) {
        if (consClass === "Mid") return "1t";
        if (consClass === "Low") return "2";
        if (consClass === "High") return "1";
      }
    }

    if (toneMark === 1) {
      if (consClass === "Mid") return "5t";
      if (consClass === "Low") return "6";
      if (consClass === "High") return "5";
    }

    if (toneMark === 2) {
      if (consClass === "Mid") return "3t";
      if (consClass === "Low") return "4";
      if (consClass === "High") return "3";
    }

    return "";
  }

  function digitsToSuperscript(value) {
    return [...String(value || "")].map(digit => superscriptDigits[digit] || digit).join("");
  }

  function mappedIpa(segmentMappings, group, grapheme, fallback) {
    const groupMappings = segmentMappings && segmentMappings[group];
    if (groupMappings && Object.prototype.hasOwnProperty.call(groupMappings, grapheme)) {
      return String(groupMappings[grapheme]);
    }
    return fallback;
  }

  function parseRhyme(sylText, consonant) {
    const remainder = sylText.replace(consonant, "_PLACEHOLDER_");
    const patternAttempt = remainder.replace("_PLACEHOLDER_", "-");
    const patternWithoutDash = remainder.replace("_PLACEHOLDER_", "");
    const directVowelKey = Object.prototype.hasOwnProperty.call(vowelsDb, patternAttempt)
      ? patternAttempt
      : (Object.prototype.hasOwnProperty.call(vowelsDb, patternWithoutDash) ? patternWithoutDash : null);

    if (directVowelKey) {
      return {
        matched: true,
        patternAttempt,
        vowelKey: directVowelKey,
        vowelInfo: vowelsDb[directVowelKey],
        finalKey: null,
        finalInfo: { ipa: "", type: "None" }
      };
    }

    const potentialFinal = lastChar(patternAttempt);
    if (finalsDb[potentialFinal]) {
      const patternWithoutFinal = withoutLastChar(patternAttempt);
      const cleanPatternWithoutFinal = patternWithoutFinal.replace("-", "");
      const vowelKey = Object.prototype.hasOwnProperty.call(vowelsDb, patternWithoutFinal)
        ? patternWithoutFinal
        : (Object.prototype.hasOwnProperty.call(vowelsDb, cleanPatternWithoutFinal)
          ? cleanPatternWithoutFinal
          : null);
      if (vowelKey) {
        return {
          matched: true,
          patternAttempt,
          vowelKey,
          vowelInfo: vowelsDb[vowelKey],
          finalKey: potentialFinal,
          finalInfo: finalsDb[potentialFinal]
        };
      }
    }

    return {
      matched: false,
      patternAttempt,
      vowelKey: null,
      vowelInfo: null,
      finalKey: null,
      finalInfo: { ipa: "", type: "None" }
    };
  }

  function processSyllable(syllable, toneValues, segmentMappings = defaultSegmentMappings) {
    let sylText = String(syllable || "");
    if (sylText === "") return "";

    const toneMarkMatch = sylText.match(/[່້]/u);
    let toneMark = 0;
    if (toneMarkMatch) {
      toneMark = toneMarksDb[toneMarkMatch[0]];
      sylText = sylText.replace(/[່້]/u, "");
    }

    const textForConsonant = sylText.replace(/^[ເແໂໄໃ]/u, "");
    const consonantCandidates = consKeys.filter(candidate => textForConsonant.startsWith(candidate));
    if (!consonantCandidates.length) return sylText;

    let consonant = consonantCandidates[0];
    let rhyme = parseRhyme(sylText, consonant);
    let bestScore = (rhyme.matched ? 100 : 0) + (rhyme.finalKey ? 10 : 0);
    consonantCandidates.slice(1).forEach(candidate => {
      const candidateRhyme = parseRhyme(sylText, candidate);
      const candidateScore = (candidateRhyme.matched ? 100 : 0) + (candidateRhyme.finalKey ? 10 : 0);
      if (candidateScore > bestScore) {
        consonant = candidate;
        rhyme = candidateRhyme;
        bestScore = candidateScore;
      }
    });

    const consonantInfo = consonantsDb[consonant];
    const ipaInitial = mappedIpa(segmentMappings, "consonants", consonant, consonantInfo.ipa);
    const ipaVowel = rhyme.vowelInfo
      ? mappedIpa(segmentMappings, "vowels", rhyme.vowelKey, rhyme.vowelInfo.ipa)
      : "a";
    const vowelLength = rhyme.vowelInfo ? rhyme.vowelInfo.len : "Short";

    const toneClass = getToneClass(consonantInfo.class, vowelLength, rhyme.finalInfo.type, toneMark);
    const toneValue = toneClass && toneValues ? toneValues[toneClass] : "";
    const ipaTone = digitsToSuperscript(toneValue);
    const ipaFinal = rhyme.finalInfo.type === "None"
      ? ""
      : mappedIpa(segmentMappings, "finals", rhyme.finalKey, rhyme.finalInfo.ipa);
    return `${ipaInitial}${ipaVowel}${ipaFinal}${ipaTone}`;
  }

  function inspectSyllable(syllable) {
    let text = String(syllable || "");
    const marks = text.match(/[່້໊໋]/gu) || [];
    if (marks.length > 1 || /[໊໋]/u.test(text)) return { supported: false, reason: "现有 IPA 规则尚不支持该声调符号组合" };
    text = text.replace(/[່້]/u, "");
    const onsetText = text.replace(/^[ເແໂໄໃ]/u, "");
    const supported = consKeys.some(key => onsetText.startsWith(key) && parseRhyme(text, key).matched);
    return { supported, reason: supported ? "" : "现有 IPA 规则尚不支持此音节的辅音或韵母结构" };
  }

  function lao2ipa(text, toneValues, segmentMappings = defaultSegmentMappings) {
    const normalized = squish(text);
    if (!normalized) return "";
    const results = [];
    let previousSyllable = "";
    normalized.split(/\s+/u).forEach(token => {
      const repeatCount = [...token].filter(character => character === "ໆ").length;
      const syllable = token.replace(/ໆ/gu, "");
      if (syllable) {
        previousSyllable = processSyllable(syllable, toneValues, segmentMappings);
        results.push(previousSyllable);
      }
      for (let index = 0; index < repeatCount; index += 1) {
        if (previousSyllable) results.push(previousSyllable);
      }
    });
    return results.join("");
  }

  global.LaoPhonTone = Object.freeze({
    toneClasses: Object.freeze([...toneClasses]),
    toneClassLabels: Object.freeze({ ...toneClassLabels }),
    segmentEntries,
    defaultSegmentMappings,
    getToneClass,
    digitsToSuperscript,
    processSyllable,
    inspectSyllable,
    lao2ipa,
    squish
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
