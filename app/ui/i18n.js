"use strict";

// Translate presentation only. Input, IPA, stored profiles and correction backups
// remain untouched; the conversion engines continue using their original rules.
(function (global) {
  const STORAGE_KEY = "laophon.share.uiLanguage.v1";
  const english = {
    "跳转到输入": "Skip to input",
    "老挝文 · 国际音标": "Lao · International Phonetic Alphabet",
    "当前声调方案": "Current tone profile",
    "当前语言点：": "Current variety:",
    "未选择": "Not selected",
    "声调方案": "Tone profiles",
    "LaoPhon 老挝文转国际音标": "LaoPhon · Lao to IPA",
    "本地存储不可用：方案修改仅在当前会话有效，关闭或刷新后可能丢失。": "Local storage is unavailable. Profile changes last for this session only and may be lost when you close or reload the app.",
    "音标转换工作区": "IPA conversion workspace",
    "输入老挝文": "Enter Lao text",
    "拼写规则与本机校正词条共同辅助切分。": "Spelling rules and your saved corrections assist syllable segmentation.",
    "老挝文文本": "Lao text",
    "在这里输入老挝文…": "Enter Lao text here…",
    "自动拆分音节": "Segment syllables",
    "文本仅在本地处理": "Text is processed locally",
    "试用示例": "Examples",
    "试一试": "Try an example",
    "切分在本地完成，无需联网。特殊拼写和歧义边界仍需人工核对。": "Segmentation runs locally, without an internet connection. Unusual spellings and ambiguous boundaries still need manual review.",
    "使用说明": "Instructions",
    "红色片段需修正后才能转写；黄色提示需核对": "Correct red segments before transcription; review yellow notices.",
    "可保存自己的拆分校正，下次自动优先使用": "Save confirmed boundaries to use them first in future segmentation.",
    "确认音节": "Review syllables",
    "手动调整音节，以空格分隔": "Edit syllables manually, separated by spaces",
    "切分结果会显示在这里，也可以直接输入音节": "Segmentation appears here. You can also enter syllables directly.",
    "用空格分隔音节。修改后，系统会按你输入的边界重新检查。": "Separate syllables with spaces. Your edited boundaries will be checked again.",
    "输入文本后，点击自动拆分音节。": "Enter text, then select Segment syllables.",
    "音节检查": "Syllable review",
    "IPA 转换结果": "IPA output",
    "音节间加空格": "Add spaces between syllables",
    "确认音节后，生成音标": "Review the syllables, then generate IPA",
    "复制结果": "Copy output",
    "确认并生成 IPA": "Confirm and generate IPA",
    "本机拆分校正": "Saved segmentation corrections",
    "保存你确认过的边界": "Save confirmed boundaries",
    "词条按连续字串匹配，最长词条优先。Mac 与网站各自保存；备份文本可在两者之间迁移。": "Corrections match continuous text, with longer entries taking priority. Mac and the website store data separately; backup text can transfer entries between them.",
    "原文字串": "Original text",
    "确认后的音节": "Confirmed syllables",
    "例如：ການຄ້າ": "Example: ການຄ້າ",
    "例如：ການ ຄ້າ": "Example: ການ ຄ້າ",
    "保存 / 更新词条": "Save / update entry",
    "备份与导入校正词典": "Back up and import corrections",
    "导入会合并词条；原文字串相同的条目，以导入内容为准。复制备份文本可留作离线备份。": "Import merges entries. Imported entries replace existing ones with the same original text. Copy the backup text to keep an offline backup.",
    "校正词典备份文本": "Correction dictionary backup text",
    "生成备份文本，或在此粘贴备份": "Generate backup text, or paste a backup here",
    "生成备份文本": "Generate backup text",
    "复制备份文本": "Copy backup text",
    "合并导入": "Merge and import",
    "LaoPhon · 老挝文转 IPA": "LaoPhon · Lao to IPA",
    "本地处理": "Local processing",
    "桌面版 · 离线运行": "Desktop app · Works offline",
    "规则匹配不代表读音已核验。无法识别或现有 IPA 规则不支持的片段会提示修正。语言点方案保留原有转换规则。": "A rule match does not verify pronunciation. Unrecognized segments and structures unsupported by the current IPA rules are flagged for correction. Variety profiles retain the existing conversion rules.",
    "管理语言点的声调与音段映射。15 个调类的调值将自动转换为上标。": "Manage tone and segment mappings for each variety. Values for the 15 tone categories are displayed as superscripts.",
    "关闭声调方案": "Close tone profiles",
    "已保存的语言点": "Saved varieties",
    "新增": "New",
    "删除": "Delete",
    "恢复默认万象": "Restore default Vientiane",
    "确认删除方案": "Confirm profile deletion",
    "确认删除": "Confirm deletion",
    "取消": "Cancel",
    "语言点名称": "Variety name",
    "例如：万象": "Example: Vientiane",
    "语言点映射类型": "Variety mapping categories",
    "声调": "Tones",
    "辅音": "Consonants",
    "元音": "Vowels",
    "韵尾": "Finals",
    "调类代号说明：A、B、C、DS、DL 与 H、M、L": "Tone category guide: A, B, C, DS, DL and H, M, L",
    "前半部分表示调类，末尾字母表示辅音字母等级：H（High）高辅音字母、M（Mid）中辅音字母、L（Low）低辅音字母。例如：": "The first part denotes the tone category; the final letter denotes the consonant-letter class: H (high), M (mid), L (low). For example: ",
    "属 H，": "is H; ",
    "属 M，": "is M; ",
    "属 L。": "is L.",
    "15 个调类代号": "The 15 tone category codes",
    "调类": "Category",
    "含义": "Meaning",
    "H 高辅音": "H: high-class",
    "M 中辅音": "M: mid-class",
    "L 低辅音": "L: low-class",
    "无声调符号开音节": "Open syllable without a tone mark",
    "带第一声调符号开音节": "Open syllable with the first tone mark",
    "带第二声调符号开音节": "Open syllable with the second tone mark",
    "短塞音节": "Short checked syllable",
    "长塞音节": "Long checked syllable",
    "例如 AM＝A 类＋中辅音字母，DLH＝长塞音节＋高辅音字母。H/M/L 表示字母等级，实际调值请在下方填写。": "For example, AM = category A + mid-class consonant letter; DLH = long checked syllable + high-class consonant letter. H/M/L indicate letter classes. Enter the actual tone values below.",
    "各调类实际调值": "Tone values by category",
    "仅限 1–5，最多三位": "Digits 1–5 only; up to three digits",
    "辅音等级保持不变；这里修改各辅音字母在该语言点的 IPA。": "Consonant classes remain unchanged. Edit the IPA mapping of each consonant letter for this variety.",
    "元音长短及结构保持不变；这里修改元音形式对应的 IPA。": "Vowel length and structure remain unchanged. Edit the IPA mapping of each vowel form.",
    "韵尾类型保持不变；这里修改韵尾字母对应的 IPA。": "Final types remain unchanged. Edit the IPA mapping of each final letter.",
    "保存": "Save",
    "保存并使用": "Save and use",
    "已保存的本机校正": "Saved local correction",
    "规则匹配，仍需核对": "Rule match; manual review still needed",
    "音节标签仅显示前 200 项，全文仍会检查和转写。": "Only the first 200 syllable labels are shown. The full text is still checked and transcribed.",
    "请先修正标出的片段，再生成音标。": "Correct the flagged segments before generating IPA.",
    "如 11": "e.g. 11",
    "高辅音": "High-class consonant",
    "中辅音": "Mid-class consonant",
    "低辅音": "Low-class consonant",
    "短元音": "Short vowel",
    "长元音": "Long vowel",
    "特殊元音": "Special vowel",
    "开音节式": "Open-syllable form",
    "闭音节式": "Closed-syllable form",
    "塞音韵尾": "Stop final",
    "鼻音韵尾": "Nasal final",
    "元音韵尾": "Vowel final",
    "请选择语言点": "Select a variety",
    "暂无语言点方案": "No variety profiles yet",
    "已复制。": "Copied.",
    "请手动复制已选中的文本。": "Please copy the selected text manually.",
    "编辑": "Edit",
    "暂无校正词条。先核对音节，再保存你确认过的拆分。": "No saved corrections yet. Review the syllables, then save the confirmed boundaries.",
    "导入失败，请检查备份文本。": "Import failed. Check the backup text.",
    "保存失败。": "Could not save.",
    "无法使用该方案。": "Could not activate this profile.",
    "已恢复默认“万象”方案。": "The default Vientiane profile has been restored.",
    "恢复失败。": "Could not restore the default profile.",
    "请输入语言点名称。": "Enter a variety name.",
    "每个调类都必须填写由 1–5 组成的 1 至 3 位调值。": "Enter one to three digits from 1 to 5 for every tone category.",
    "辅音、元音和韵尾的 IPA 映射均不能为空，且每项不能超过 24 个字符。": "All consonant, vowel and final IPA mappings are required, with at most 24 characters each.",
    "语言点名称不能与现有方案重复。": "This variety name is already in use.",
    "校正词典读取失败，现有数据未覆盖。可继续使用规则切分。": "Could not read the correction dictionary. Existing data was not overwritten. Rule-based segmentation is still available.",
    "备份文本过大，请控制在 1 MB 以内。": "The backup text is too large. Keep it within 1 MB.",
    "校正词典格式不正确。": "Invalid correction dictionary format.",
    "校正词条最多 1,000 条。": "The correction dictionary can contain at most 1,000 entries.",
    "校正修改仅在当前会话有效，请复制备份文本保存。": "Correction changes last for this session only. Copy the backup text to keep them.",
    "合并后超过 1,000 条，请先整理词典。": "Merging would exceed 1,000 entries. Reduce the dictionary first.",
    "原文需为连续的老挝文字串（不含空格、数字或重复符号），最多 200 字符。": "Enter continuous Lao text without spaces, digits or repetition marks, up to 200 characters.",
    "拆分只能增加音节间空格，不能增删或替换原文字母。": "Segmentation may only add spaces between syllables; original letters must not be added, removed or replaced.",
    "单次最多处理 20,000 字符，请分段处理。": "The limit is 20,000 characters. Process longer text in sections.",
    "未识别为单音节，请检查拼写和空格": "Not recognized as one syllable; check spelling and spaces",
    "请将重复符号展开为实际需要重复的音节": "Replace the repetition mark with the syllables to be repeated",
    "现有 IPA 规则尚不支持该声调符号组合": "The current IPA rules do not support this combination of tone marks",
    "现有 IPA 规则尚不支持此音节的辅音或韵母结构": "The current IPA rules do not support this syllable's consonant or rhyme structure",
    "界面语言": "Interface language",
    "界面语言仅在当前会话有效。": "The interface language is saved for this session only.",
    "老挝文国际音标转换工具。离线音节切分、人工核对，支持万象及自定义语言点的声调与音段映射。": "Lao to IPA with offline syllable segmentation, manual review, and tone and segment mappings for Vientiane and custom varieties."
  };
  // Rename interface terminology without changing the engines, mapping keys,
  // saved profiles, or user-entered names. Legacy controller copy stays valid.
  const terminology = {
    "辅音": ["起始辅音字母", "Initial consonant letters"],
    "元音": ["元音字母", "Vowel letters"],
    "韵尾": ["尾辅音字母", "Final consonant letters"],
    "高辅音": ["高起始辅音字母", "High-class initial consonant letter"],
    "中辅音": ["中起始辅音字母", "Mid-class initial consonant letter"],
    "低辅音": ["低起始辅音字母", "Low-class initial consonant letter"],
    "短元音": ["短元音字母", "Short vowel letter"],
    "长元音": ["长元音字母", "Long vowel letter"],
    "特殊元音": ["特殊元音字母", "Special vowel letter"],
    "塞音韵尾": ["塞音类尾辅音字母", "Stop-type final consonant letter"],
    "鼻音韵尾": ["鼻音类尾辅音字母", "Nasal-type final consonant letter"],
    "元音韵尾": ["元音类尾辅音字母", "Vowel-type final consonant letter"],
    "H 高辅音": ["H 高起始辅音字母", "H: high-class initial consonant letters"],
    "M 中辅音": ["M 中起始辅音字母", "M: mid-class initial consonant letters"],
    "L 低辅音": ["L 低起始辅音字母", "L: low-class initial consonant letters"],
    "前半部分表示调类，末尾字母表示辅音字母等级：H（High）高辅音字母、M（Mid）中辅音字母、L（Low）低辅音字母。例如：": [
      "前半部分表示调类，末尾字母表示起始辅音字母等级：H（High）高起始辅音字母、M（Mid）中起始辅音字母、L（Low）低起始辅音字母。例如：",
      "The first part denotes the tone category; the final letter denotes the class of the initial consonant letter: H (high), M (mid), L (low). For example: "
    ],
    "例如 AM＝A 类＋中辅音字母，DLH＝长塞音节＋高辅音字母。H/M/L 表示字母等级，实际调值请在下方填写。": [
      "例如 AM＝A 类＋中起始辅音字母，DLH＝长塞音节＋高起始辅音字母。H/M/L 表示字母等级，实际调值请在下方填写。",
      "For example, AM = category A + mid-class initial consonant letter; DLH = long checked syllable + high-class initial consonant letter. H/M/L indicate letter classes. Enter the actual tone values below."
    ],
    "辅音等级保持不变；这里修改各辅音字母在该语言点的 IPA。": [
      "起始辅音字母等级保持不变；这里修改各起始辅音字母在该语言点的 IPA。",
      "Initial consonant letter classes remain unchanged. Edit the IPA mapping of each initial consonant letter for this variety."
    ],
    "元音长短及结构保持不变；这里修改元音形式对应的 IPA。": [
      "元音字母对应的长短及结构保持不变；这里修改元音字母形式对应的 IPA。",
      "The length and structure represented by vowel letters remain unchanged. Edit the IPA mapping of each vowel letter form."
    ],
    "韵尾类型保持不变；这里修改韵尾字母对应的 IPA。": [
      "尾辅音字母类型保持不变；这里修改尾辅音字母对应的 IPA。",
      "Final consonant letter types remain unchanged. Edit the IPA mapping of each final consonant letter."
    ],
    "辅音、元音和韵尾的 IPA 映射均不能为空，且每项不能超过 24 个字符。": [
      "起始辅音字母、元音字母和尾辅音字母的 IPA 映射均不能为空，且每项不能超过 24 个字符。",
      "All initial consonant letter, vowel letter and final consonant letter IPA mappings are required, with at most 24 characters each."
    ],
    "现有 IPA 规则尚不支持此音节的辅音或韵母结构": [
      "现有 IPA 规则尚不支持此音节的起始辅音字母或韵母结构",
      "The current IPA rules do not support this syllable's initial consonant letters or rhyme structure"
    ]
  };
  for (const [source, labels] of Object.entries(terminology)) english[source] = labels[1];

  function chineseTerminology(source) {
    const text = String(source);
    const trimmed = text.trim();
    let result = terminology[trimmed]?.[0];
    if (result === undefined) {
      const meta = trimmed.match(/^(短元音|长元音|特殊元音) · (开音节式|闭音节式)$/);
      if (meta) result = `${terminology[meta[1]][0]} · ${meta[2]}`;
      const issue = trimmed.match(/^(「.+」：)(.+)(。)$/);
      if (issue && terminology[issue[2]]) result = `${issue[1]}${terminology[issue[2]][0]}${issue[3]}`;
    }
    return result === undefined ? text : text.replace(trimmed, () => result);
  }

  const patterns = [
    [/^(\d+) 个音节 · (\d+) 个待修正片段(?: · (\d+) 处拆分歧义)?$/, (_, n, issues, ambiguities) => `${n} syllable${n === "1" ? "" : "s"} · ${issues} segment${issues === "1" ? "" : "s"} to correct${ambiguities ? ` · ${ambiguities} ambiguous ${ambiguities === "1" ? "boundary" : "boundaries"}` : ""}`],
    [/^(\d+) 条$/, (_, n) => `${n} ${n === "1" ? "entry" : "entries"}`],
    [/^另有 (\d+) 个片段待修正。$/, (_, n) => `${n} more segments need correction.`],
    [/^「(.+)」：(.+)。$/, (_, raw, reason) => `“${raw}”: ${translate(reason)}.`],
    [/^「(.+)」存在多种规则拆分：(.+)。请在上方确认或修改空格。$/, (_, raw, options) => `“${raw}” has multiple rule-based segmentations: ${options}. Review or edit the spaces above.`],
    [/^调类 (.+) 的调值$/, (_, code) => `Tone value for category ${code}`],
    [/^(.+) 的 IPA 映射$/, (_, grapheme) => `IPA mapping for ${grapheme}`],
    [/^已保存“(.+)”（仅当前会话）。$/, (_, name) => `Saved “${name}” for this session only.`],
    [/^已保存“(.+)”。$/, (_, name) => `Saved “${name}”.`],
    [/^正在使用“(.+)”语言点方案。$/, (_, name) => `Using the “${name}” variety profile.`],
    [/^确定删除“(.+)”声调方案吗？$/, (_, name) => `Delete the “${name}” tone profile?`],
    [/^已删除“(.+)”。$/, (_, name) => `Deleted “${name}”.`],
    [/^编辑校正 (.+)$/, (_, source) => `Edit correction for ${source}`],
    [/^删除校正 (.+)$/, (_, source) => `Delete correction for ${source}`],
    [/^已保存「(.+)」的拆分。再次自动拆分时生效。$/, (_, source) => `Saved the segmentation of “${source}”. It will be used next time you segment text.`],
    [/^已合并导入 (\d+) 条校正。$/, (_, count) => `Merged and imported ${count} corrections.`],
    [/^(短元音|长元音|特殊元音) · (开音节式|闭音节式)$/, (_, length, type) => `${translate(length)} · ${translate(type)}`]
  ];

  function translate(source) {
    const text = String(source);
    const trimmed = text.trim();
    let result = english[trimmed];
    if (result === undefined) {
      for (const [pattern, replacement] of patterns) {
        if (pattern.test(trimmed)) { result = trimmed.replace(pattern, replacement); break; }
      }
    }
    return result === undefined ? text : text.replace(trimmed, () => result);
  }

  let language = "zh";
  let persistent = true;
  try { if (global.localStorage.getItem(STORAGE_KEY) === "en") language = "en"; }
  catch (_) { persistent = false; }
  const document = global.document;
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  const attributes = ["aria-label", "placeholder", "title"];
  let observer;

  function renderValue(node, current, records, key, write) {
    const previous = records.get(node);
    const record = key ? previous?.[key] : previous;
    const source = record && current === record.rendered ? record.source : current;
    const rendered = language === "en" ? translate(source) : chineseTerminology(source);
    const next = { source, rendered };
    if (key) records.set(node, { ...previous, [key]: next });
    else records.set(node, next);
    if (current !== rendered) write(rendered);
  }

  function visit(node) {
    if (node.nodeType === 3) {
      renderValue(node, node.data, textSources, null, value => { node.data = value; });
      return;
    }
    if (node.nodeType !== 1) return;
    for (const name of attributes) {
      if (node.hasAttribute(name)) renderValue(node, node.getAttribute(name), attributeSources, name, value => node.setAttribute(name, value));
    }
    // Proper names, editable values and output are data, not interface copy.
    if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE"].includes(node.tagName)
      || (node.id === "activeProfileName" && !["未选择", "Not selected"].includes(node.textContent))
      || (node.tagName === "OPTION" && node.value !== "")) return;
    for (const child of node.childNodes) visit(child);
  }

  function observe() {
    observer?.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
  }

  function setLanguage(next, save = true) {
    if (next !== "zh" && next !== "en") return;
    language = next;
    if (save) {
      try { global.localStorage.setItem(STORAGE_KEY, language); }
      catch (_) { persistent = false; }
    }
    if (!document) return;
    observer?.disconnect();
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
    document.getElementById("languageZh").setAttribute("aria-pressed", String(language === "zh"));
    document.getElementById("languageEn").setAttribute("aria-pressed", String(language === "en"));
    document.getElementById("languageNotice").hidden = persistent;
    visit(document.body);
    observe();
    global.LaoPhonDesktop?.setLanguage(language);
  }

  global.LaoPhonI18n = { translate, setLanguage, STORAGE_KEY, get language() { return language; } };
  if (!document) return;
  document.getElementById("languageZh").addEventListener("click", () => setLanguage("zh"));
  document.getElementById("languageEn").addEventListener("click", () => setLanguage("en"));
  observer = new global.MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === "attributes") { visit(record.target); continue; }
      // A text-node mutation inside a preserved data element must also stay data.
      const parent = record.target.nodeType === 3 ? record.target.parentElement : record.target;
      if (parent?.closest("textarea, input, code, option:not([value=''])")) continue;
      const name = parent?.closest("#activeProfileName");
      if (name && !["未选择", "Not selected"].includes(name.textContent)) continue;
      visit(record.target);
    }
    observe();
  });
  setLanguage(language, false);
})(window);
