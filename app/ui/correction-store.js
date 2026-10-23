"use strict";
(function(global) {
  const KEY="laophon.share.syllableCorrections.v1";
  class CorrectionRepository {
    constructor(storage) {
      this.storage=storage; this.persistent=Boolean(storage); this.entries={}; this.warning="";
      try { const raw=storage?.getItem(KEY); if(raw) this.entries=this.parse(raw); }
      catch(error) { this.warning="校正词典读取失败，现有数据未覆盖。可继续使用规则切分。"; this.persistent=false; }
    }
    parse(raw) {
      if(raw.length > 1000000) throw new Error("备份文本过大，请控制在 1 MB 以内。");
      const data=JSON.parse(raw);
      if(data?.version!==1 || !data.entries || typeof data.entries!=="object" || Array.isArray(data.entries)) throw new Error("校正词典格式不正确。");
      const keys=Object.keys(data.entries);
      if(keys.length>1000) throw new Error("校正词条最多 1,000 条。");
      const entries={};
      for(const source of keys) { const entry=global.LaoPhonSyllables.validateCorrection(source,data.entries[source]); entries[entry.source]=entry.syllables; }
      return entries;
    }
    persist() {
      try { this.storage.setItem(KEY,this.export()); }
      catch(_) { this.persistent=false; this.warning="校正修改仅在当前会话有效，请复制备份文本保存。"; }
    }
    save(source,split) {
      const entry=global.LaoPhonSyllables.validateCorrection(source,split);
      if(!this.entries[entry.source] && Object.keys(this.entries).length>=1000) throw new Error("校正词条最多 1,000 条。");
      this.entries[entry.source]=entry.syllables; this.persist(); return entry;
    }
    delete(source) { delete this.entries[source]; this.persist(); }
    export() { return JSON.stringify({version:1,entries:this.entries},null,2); }
    import(raw) {
      const incoming=this.parse(raw), merged={...this.entries,...incoming};
      if(Object.keys(merged).length>1000) throw new Error("合并后超过 1,000 条，请先整理词典。");
      this.entries=merged; this.persist(); return Object.keys(incoming).length;
    }
  }
  global.LaoPhonCorrections=Object.freeze({KEY,CorrectionRepository});
})(typeof globalThis!=="undefined"?globalThis:this);
