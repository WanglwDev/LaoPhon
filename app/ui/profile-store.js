"use strict";

(function attachProfileStore(global) {
  const STORAGE_KEY = "laophon.share.languageProfiles.v2";
  const LEGACY_STORAGE_KEY = "laophon.share.toneProfiles.v1";
  const STORAGE_VERSION = 2;
  const DEFAULT_PROFILE_ID = "default-vientiane";
  const toneEngine = global.LaoPhonTone;
  const toneClasses = toneEngine.toneClasses;

  const defaultVientianeTones = Object.freeze({
    "1t": "11", "1": "24", "2": "45", "3t": "53", "3": "31",
    "4": "53", "5t": "33", "5": "33", "6": "33", "7t": "45",
    "7": "45", "8": "33", "9t": "31", "9": "31", "10": "53"
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function cloneDefaultMappings() {
    return clone(toneEngine.defaultSegmentMappings);
  }

  function createDefaultProfile() {
    return {
      id: DEFAULT_PROFILE_ID,
      name: "万象",
      tones: { ...defaultVientianeTones },
      mappings: cloneDefaultMappings()
    };
  }

  function createInitialState() {
    return { version: STORAGE_VERSION, profiles: [createDefaultProfile()] };
  }

  function isToneMapValid(tones) {
    if (!tones || typeof tones !== "object") return false;
    return toneClasses.every(toneClass => /^[1-5]{1,3}$/.test(String(tones[toneClass] || "")));
  }

  function isIpaValueValid(value) {
    const text = String(value === undefined || value === null ? "" : value).trim();
    return text.length > 0 && [...text].length <= 24;
  }

  function isSegmentMappingsValid(mappings) {
    if (!mappings || typeof mappings !== "object") return false;
    return ["consonants", "vowels", "finals"].every(group => {
      const groupMappings = mappings[group];
      if (!groupMappings || typeof groupMappings !== "object") return false;
      return toneEngine.segmentEntries[group]
        .every(item => isIpaValueValid(groupMappings[item.grapheme]));
    });
  }

  function isProfileValid(profile) {
    return Boolean(
      profile &&
      typeof profile.id === "string" && profile.id.trim() &&
      typeof profile.name === "string" && profile.name.trim() &&
      isToneMapValid(profile.tones) &&
      isSegmentMappingsValid(profile.mappings)
    );
  }

  function isStateValid(state) {
    return Boolean(
      state &&
      state.version === STORAGE_VERSION &&
      Array.isArray(state.profiles) &&
      state.profiles.every(isProfileValid)
    );
  }

  function normalizeToneMap(source = {}) {
    const tones = {};
    toneClasses.forEach(toneClass => {
      const legacyValue = toneClass === "3t" ? source["4t"] : undefined;
      tones[toneClass] = String(source[toneClass] || legacyValue || defaultVientianeTones[toneClass]);
    });
    return tones;
  }

  function normalizeMappings(source = {}) {
    const mappings = cloneDefaultMappings();
    ["consonants", "vowels", "finals"].forEach(group => {
      const sourceGroup = source[group] || {};
      toneEngine.segmentEntries[group].forEach(item => {
        const value = sourceGroup[item.grapheme];
        if (isIpaValueValid(value)) mappings[group][item.grapheme] = String(value).trim();
      });
    });
    return mappings;
  }

  function migrateLegacyState(legacyState) {
    if (!legacyState || legacyState.version !== 1 || !Array.isArray(legacyState.profiles)) return null;
    const profiles = legacyState.profiles
      .filter(profile => profile && profile.id && String(profile.name || "").trim())
      .map(profile => ({
        id: String(profile.id),
        name: String(profile.name).trim(),
        tones: normalizeToneMap(profile.tones),
        mappings: cloneDefaultMappings()
      }));
    return { version: STORAGE_VERSION, profiles };
  }

  function createId() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }
    return `profile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  class ProfileValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ProfileValidationError";
    }
  }

  class ProfileRepository {
    constructor(storage) {
      this.storage = storage;
      this.persistent = Boolean(storage);
      this.state = this.load();
    }

    read(key) {
      try {
        return this.storage.getItem(key);
      } catch (_) {
        this.persistent = false;
        return null;
      }
    }

    load() {
      const serialized = this.read(STORAGE_KEY);
      if (serialized !== null) {
        try {
          const state = JSON.parse(serialized);
          if (!isStateValid(state)) throw new Error("Invalid profile state");
          return state;
        } catch (_) {
          const recovered = createInitialState();
          this.persist(recovered);
          return recovered;
        }
      }

      const legacySerialized = this.read(LEGACY_STORAGE_KEY);
      if (legacySerialized !== null) {
        try {
          const migrated = migrateLegacyState(JSON.parse(legacySerialized));
          if (migrated) {
            this.persist(migrated);
            return migrated;
          }
        } catch (_) {
          // Fall through to a clean first-run state.
        }
      }

      const initial = createInitialState();
      this.persist(initial);
      return initial;
    }

    persist(state = this.state) {
      try {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (_) {
        this.persistent = false;
      }
    }

    list() {
      return clone(this.state.profiles);
    }

    get(id) {
      const profile = this.state.profiles.find(item => item.id === id);
      return profile ? clone(profile) : null;
    }

    save(profileDraft) {
      const id = String(profileDraft.id || createId());
      const name = String(profileDraft.name || "").trim();
      const tones = normalizeToneMap(profileDraft.tones);
      const mappings = normalizeMappings(profileDraft.mappings);

      if (!name) throw new ProfileValidationError("请输入语言点名称。");
      if (!isToneMapValid(profileDraft.tones)) {
        throw new ProfileValidationError("每个调类都必须填写由 1–5 组成的 1 至 3 位调值。");
      }
      if (!isSegmentMappingsValid(profileDraft.mappings)) {
        throw new ProfileValidationError("辅音、元音和韵尾的 IPA 映射均不能为空，且每项不能超过 24 个字符。");
      }
      const duplicate = this.state.profiles.find(item => item.name === name && item.id !== id);
      if (duplicate) throw new ProfileValidationError("语言点名称不能与现有方案重复。");

      const profile = { id, name, tones, mappings };
      const index = this.state.profiles.findIndex(item => item.id === id);
      if (index >= 0) this.state.profiles[index] = profile;
      else this.state.profiles.push(profile);
      this.persist();
      return clone(profile);
    }

    delete(id) {
      const previousLength = this.state.profiles.length;
      this.state.profiles = this.state.profiles.filter(item => item.id !== id);
      if (this.state.profiles.length !== previousLength) this.persist();
    }

    hasDefault() {
      return this.state.profiles.some(item => item.id === DEFAULT_PROFILE_ID);
    }

    restoreDefault() {
      const existing = this.state.profiles.find(item => item.id === DEFAULT_PROFILE_ID);
      if (existing) return clone(existing);
      const restored = createDefaultProfile();
      this.state.profiles.unshift(restored);
      this.persist();
      return clone(restored);
    }
  }

  global.LaoPhonProfiles = Object.freeze({
    STORAGE_KEY,
    LEGACY_STORAGE_KEY,
    DEFAULT_PROFILE_ID,
    ProfileRepository,
    ProfileValidationError,
    createDefaultProfile,
    cloneDefaultMappings,
    isToneMapValid,
    isSegmentMappingsValid
  });
})(typeof globalThis !== "undefined" ? globalThis : this);
