"use strict";

load("dist/tone-engine.js");
load("dist/profile-store.js");

let assertions = 0;

function assertEqual(actual, expected, label) {
  assertions += 1;
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assert(condition, label) {
  assertions += 1;
  if (!condition) throw new Error(label);
}

function assertThrows(action, messagePart, label) {
  assertions += 1;
  try {
    action();
  } catch (error) {
    if (String(error.message).includes(messagePart)) return;
    throw new Error(`${label}: wrong error: ${error.message}`);
  }
  throw new Error(`${label}: expected an error`);
}

function makeStorage(initialValue, initialKey = LaoPhonProfiles.STORAGE_KEY) {
  const values = {};
  if (initialValue !== undefined) {
    values[initialKey] = initialValue;
  }
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null;
    },
    setItem(key, value) {
      values[key] = String(value);
    },
    removeItem(key) {
      delete values[key];
    }
  };
}

const ruleCases = [
  ["Mid", "Short", "None", 0, "7t"],
  ["Mid", "Long", "None", 0, "1t"],
  ["High", "Short", "None", 0, "7"],
  ["High", "Long", "None", 0, "1"],
  ["Low", "Short", "None", 0, "8"],
  ["Low", "Long", "None", 0, "2"],
  ["Mid", "Short", "Stop", 0, "7t"],
  ["Mid", "Long", "Stop", 0, "9t"],
  ["High", "Short", "Stop", 0, "7"],
  ["High", "Long", "Stop", 0, "9"],
  ["Low", "Short", "Stop", 0, "8"],
  ["Low", "Long", "Stop", 0, "10"],
  ["Mid", "Long", "Nasal", 0, "1t"],
  ["High", "Short", "Vowel", 0, "1"],
  ["Low", "Short", "Nasal", 0, "2"],
  ["Mid", "Long", "None", 1, "5t"],
  ["High", "Short", "Stop", 1, "5"],
  ["Low", "Long", "Nasal", 1, "6"],
  ["Mid", "Long", "None", 2, "3t"],
  ["High", "Long", "None", 2, "3"],
  ["Low", "Long", "None", 2, "4"],
  ["Mid", "Special", "None", 0, "1t"],
  ["High", "Special", "Stop", 0, "9"],
  ["Low", "Special", "None", 0, "2"]
];

ruleCases.forEach(([consClass, vLen, finalType, mark, expected], index) => {
  assertEqual(
    LaoPhonTone.getToneClass(consClass, vLen, finalType, mark),
    expected,
    `tone rule ${index + 1}`
  );
});

assertEqual(LaoPhonTone.digitsToSuperscript("11"), "¹¹", "two-digit superscript");
assertEqual(LaoPhonTone.digitsToSuperscript("214"), "²¹⁴", "three-digit superscript");

const defaultTones = LaoPhonProfiles.createDefaultProfile().tones;
assertEqual(LaoPhonTone.processSyllable("ກ້າ", defaultTones), "kaː⁵³", "Mid + second mark uses 3t");
assertEqual(LaoPhonTone.processSyllable("ຂ້າ", defaultTones), "khaː³¹", "High + second mark uses 3");
assertEqual(LaoPhonTone.processSyllable("ຄ້າ", defaultTones), "khaː⁵³", "Low + second mark uses 4");
assertEqual(LaoPhonTone.processSyllable("ກວດ", defaultTones), "kuːat³¹", "ກວດ resolves ວ as vowel");
assertEqual(LaoPhonTone.processSyllable("ຂວດ", defaultTones), "khuːat³¹", "ຂວດ resolves ວ as vowel");
assertEqual(LaoPhonTone.processSyllable("ແຫ້ງ", defaultTones), "hɛːŋ³¹", "ແຫ້ງ resolves ງ as final");
assertEqual(LaoPhonTone.processSyllable("ແຫ່ງ", defaultTones), "hɛːŋ³³", "ແຫ່ງ resolves ງ as final");
assertEqual(LaoPhonTone.processSyllable("ກວາ", defaultTones), "kwaː¹¹", "true kw onset remains unchanged");
assertEqual(LaoPhonTone.processSyllable("ຫນາ", defaultTones), "naː²⁴", "true ຫນ onset remains unchanged");

const customTones = { ...defaultTones, "1": "11" };
assertEqual(LaoPhonTone.processSyllable("ຂາ", customTones), "khaː¹¹", "profile mapping is applied");
assertEqual(LaoPhonTone.lao2ipa("ກ້າ ຂ້າ", defaultTones), "kaː⁵³khaː³¹", "multi-syllable transcription");
assertEqual(
  LaoPhonTone.lao2ipa("ອື່ນໆ", defaultTones),
  "ʔɯːn³³ʔɯːn³³",
  "attached repeat sign duplicates the previous syllable"
);
assertEqual(
  LaoPhonTone.lao2ipa("ອື່ນ ໆ", defaultTones),
  "ʔɯːn³³ʔɯːn³³",
  "separate repeat sign duplicates the previous syllable"
);

const customSegments = JSON.parse(JSON.stringify(LaoPhonTone.defaultSegmentMappings));
customSegments.consonants["ຂ"] = "x";
customSegments.vowels["າ"] = "ɑː";
customSegments.finals["ນ"] = "ɲ";
assertEqual(
  LaoPhonTone.processSyllable("ຂານ", defaultTones, customSegments),
  "xɑːɲ²⁴",
  "consonant, vowel and final mappings are applied"
);

const storage = makeStorage();
let repository = new LaoPhonProfiles.ProfileRepository(storage);
assertEqual(repository.list().length, 1, "first run seeds one profile");
assertEqual(repository.list()[0].name, "万象", "first run seeds Vientiane");
assertEqual(repository.list()[0].tones["3t"], "53", "default 3t value");
assert(!Object.prototype.hasOwnProperty.call(repository.list()[0].tones, "4t"), "obsolete 4t is absent");
assertEqual(repository.list()[0].mappings.consonants["ຂ"], "kh", "default consonant mapping");
assertEqual(repository.list()[0].mappings.vowels["າ"], "aː", "default vowel mapping");
assertEqual(repository.list()[0].mappings.finals["ນ"], "n", "default final mapping");

const newProfile = repository.save({
  name: "琅勃拉邦",
  tones: Object.fromEntries(LaoPhonTone.toneClasses.map(toneClass => [toneClass, "22"])),
  mappings: LaoPhonProfiles.cloneDefaultMappings()
});
assertEqual(repository.list().length, 2, "new profile is saved");
repository = new LaoPhonProfiles.ProfileRepository(storage);
assertEqual(repository.get(newProfile.id).name, "琅勃拉邦", "profile survives repository reload");

repository.save({ ...newProfile, name: "琅勃拉邦（修改）" });
assertEqual(repository.get(newProfile.id).name, "琅勃拉邦（修改）", "profile can be edited");

assertThrows(
  () => repository.save({
    name: "非法",
    tones: { ...defaultTones, "1": "60" },
    mappings: LaoPhonProfiles.cloneDefaultMappings()
  }),
  "1–5",
  "invalid tone value is rejected"
);
assertThrows(
  () => repository.save({ name: "", tones: defaultTones, mappings: LaoPhonProfiles.cloneDefaultMappings() }),
  "名称",
  "blank name is rejected"
);
assertThrows(
  () => repository.save({ name: "万象", tones: defaultTones, mappings: LaoPhonProfiles.cloneDefaultMappings() }),
  "重复",
  "duplicate name is rejected"
);

const invalidMappings = LaoPhonProfiles.cloneDefaultMappings();
invalidMappings.vowels["າ"] = "";
assertThrows(
  () => repository.save({ name: "空映射", tones: defaultTones, mappings: invalidMappings }),
  "IPA 映射",
  "blank segment mapping is rejected"
);

repository.list().forEach(profile => repository.delete(profile.id));
assertEqual(repository.list().length, 0, "all profiles can be deleted");
repository = new LaoPhonProfiles.ProfileRepository(storage);
assertEqual(repository.list().length, 0, "empty state survives repository reload");
const restored = repository.restoreDefault();
assertEqual(restored.name, "万象", "default profile can be restored");
assertEqual(repository.list().length, 1, "restore adds one profile");

const corruptStorage = makeStorage("not-json");
const recoveredRepository = new LaoPhonProfiles.ProfileRepository(corruptStorage);
assertEqual(recoveredRepository.list()[0].name, "万象", "corrupt data recovers to default");

const legacyStorage = makeStorage(JSON.stringify({
  version: 1,
  profiles: [{ id: "legacy", name: "旧方案", tones: { ...defaultTones, "1": "11" } }]
}), LaoPhonProfiles.LEGACY_STORAGE_KEY);
const migratedRepository = new LaoPhonProfiles.ProfileRepository(legacyStorage);
assertEqual(migratedRepository.get("legacy").tones["1"], "11", "legacy tone values are preserved");
assertEqual(migratedRepository.get("legacy").mappings.consonants["ຂ"], "kh", "legacy profile receives default mappings");

print(`PASS: ${assertions} assertions`);
