"use strict";

const toneEngine = window.LaoPhonTone;
const profilesApi = window.LaoPhonProfiles;
let browserStorage = null;
try { browserStorage = window.localStorage; } catch (_) {}
const repository = new profilesApi.ProfileRepository(browserStorage);
const syllables = window.LaoPhonSyllables;
const corrections = new window.LaoPhonCorrections.CorrectionRepository(browserStorage);
let currentAnalysis = null;
const ACTIVE_PROFILE_KEY = "laophon.share.activeProfile.v1";

const laoInput = document.getElementById("laoInput");
const segmentButton = document.getElementById("segmentButton");
const manualSeg = document.getElementById("manualSeg");
const confirmSlot = document.getElementById("confirmSlot");
const ipaOutput = document.getElementById("ipaOutput");
const copyButton = document.getElementById("copyButton");
const notification = document.getElementById("notification");
const activeProfileName = document.getElementById("activeProfileName");
const manageProfilesButton = document.getElementById("manageProfilesButton");

const profileModal = document.getElementById("profileModal");
const profileSelect = document.getElementById("profileSelect");
const profileNameInput = document.getElementById("profileName");
const toneFields = document.getElementById("toneFields");
const consonantFields = document.getElementById("consonantFields");
const vowelFields = document.getElementById("vowelFields");
const finalFields = document.getElementById("finalFields");
const editorTabs = Array.from(document.querySelectorAll("[data-editor-tab]"));
const editorPanels = Array.from(document.querySelectorAll("[data-editor-panel]"));
const newProfileButton = document.getElementById("newProfileButton");
const deleteProfileButton = document.getElementById("deleteProfileButton");
const restoreDefaultButton = document.getElementById("restoreDefaultButton");
const saveProfileButton = document.getElementById("saveProfileButton");
const useProfileButton = document.getElementById("useProfileButton");
const closeProfileButton = document.getElementById("closeProfileButton");
const profileError = document.getElementById("profileError");

let activeProfile = null;
let editingProfileId = null;
let modalIsRequired = true;
let convertButton = null;
let hasConverted = false;
let notifyTimer = null;
let pendingDeleteId = null;
const deleteConfirmation = document.getElementById("deleteConfirmation");

function updateStorageNotice() {
  document.getElementById("storageNotice").hidden = repository.persistent && corrections.persistent;
}

function rememberProfile(id) {
  try { browserStorage.setItem(ACTIVE_PROFILE_KEY, id || ""); }
  catch (_) { repository.persistent = false; }
  updateStorageNotice();
}

function clearResult() {
  ipaOutput.textContent = "";
  hasConverted = false;
  copyButton.disabled = true;
  document.getElementById("resultPlaceholder").hidden = false;
}


function showNotification(message) {
  notification.textContent = message;
  notification.classList.add("visible");
  window.clearTimeout(notifyTimer);
  notifyTimer = window.setTimeout(() => notification.classList.remove("visible"), 2400);
}

function showProfileError(message) {
  profileError.textContent = message || "";
}

function renderAnalysis(analysis) {
  currentAnalysis = analysis;
  const count = analysis.tokens.filter(t => t.type === "syllable").length;
  const checked = syllables.transcribe(analysis, toneEngine, activeProfile?.tones, activeProfile?.mappings);
  const summary = document.getElementById("analysisSummary");
  summary.textContent = `${count} 个音节 · ${checked.issues.length} 个待修正片段` + (analysis.ambiguities.length ? ` · ${analysis.ambiguities.length} 处拆分歧义` : "");
  summary.classList.toggle("has-issues", Boolean(checked.issues.length));
  const container = document.getElementById("syllableTokens");
  container.textContent = "";
  analysis.tokens.filter(t => t.type !== "other").slice(0,200).forEach(token => {
    const chip = document.createElement("span");
    const issue = checked.issues.find(item => item.token === token);
    chip.className = "syllable-chip" + (issue ? " chip-error" : token.origin === "correction" ? " chip-corrected" : "");
    chip.textContent = token.raw;
    chip.title = issue ? issue.reason : token.origin === "correction" ? "已保存的本机校正" : "规则匹配，仍需核对";
    container.appendChild(chip);
  });
  const issues = document.getElementById("analysisIssues");
  issues.textContent = "";
  checked.issues.slice(0,10).forEach(issue => {
    const line=document.createElement("p"); line.textContent=`「${issue.token.raw}」：${issue.reason}。`; issues.appendChild(line);
  });
  if(checked.issues.length>10) { const line=document.createElement("p"); line.textContent=`另有 ${checked.issues.length-10} 个片段待修正。`; issues.appendChild(line); }
  const alternatives=document.getElementById("analysisAlternatives"); alternatives.textContent="";
  analysis.ambiguities.slice(0,5).forEach(item => {
    const line=document.createElement("p"); line.textContent=`「${item.raw}」存在多种规则拆分：${item.options.join(" / ")}。请在上方确认或修改空格。`; alternatives.appendChild(line);
  });
  if(analysis.tokens.filter(t=>t.type!=="other").length>200) { const line=document.createElement("p"); line.textContent="音节标签仅显示前 200 项，全文仍会检查和转写。"; alternatives.appendChild(line); }
  ensureConvertButton();
  if(convertButton) convertButton.disabled = checked.issues.length > 0 || !activeProfile || !count;
  return checked;
}

function autoSegment(text) {
  const analysis = syllables.segment(text, corrections.entries);
  manualSeg.value = analysis.segmentedText;
  renderAnalysis(analysis);
  return analysis.segmentedText;
}

function transcribeCurrentText() {
  if (!activeProfile) return;
  let result;
  try {
    const analysis = syllables.manual(manualSeg.value);
    result = syllables.transcribe(analysis, toneEngine, activeProfile.tones, activeProfile.mappings, document.getElementById("spacedOutput").checked);
    if(result.issues.length) { clearResult(); renderAnalysis(analysis); showNotification("请先修正标出的片段，再生成音标。"); return; }
  } catch(error) { showNotification(error.message); return; }
  ipaOutput.textContent = result.text;
  hasConverted = true;
  copyButton.disabled = !result.text.trim();
  document.getElementById("resultPlaceholder").hidden = Boolean(result.text);
}

function ensureConvertButton() {
  if (toneEngine.squish(manualSeg.value) === "") {
    confirmSlot.textContent = "";
    convertButton = null;
    return;
  }
  if (convertButton) return;
  convertButton = document.createElement("button");
  convertButton.type = "button";
  convertButton.className = "button button-success";
  convertButton.innerHTML = "<span aria-hidden=\"true\">文</span><span>确认并生成 IPA</span>";
  convertButton.addEventListener("click", transcribeCurrentText);
  confirmSlot.appendChild(convertButton);
}

function buildToneFields() {
  const fragment = document.createDocumentFragment();
  toneEngine.toneClasses.forEach(toneClass => {
    const wrapper = document.createElement("label");
    wrapper.className = "tone-field";
    wrapper.htmlFor = `tone-${toneClass}`;

    const label = document.createElement("span");
    label.className = "tone-label";
    label.dataset.toneLabel = toneClass;
    label.textContent = toneEngine.toneClassLabels[toneClass];
    const input = document.createElement("input");
    input.id = `tone-${toneClass}`;
    input.dataset.toneClass = toneClass;
    input.className = "tone-input";
    input.type = "text";
    input.inputMode = "numeric";
    input.maxLength = 3;
    input.autocomplete = "off";
    input.placeholder = "如 11";
    input.setAttribute("aria-label", `调类 ${toneEngine.toneClassLabels[toneClass]} 的调值`);
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^1-5]/g, "").slice(0, 3);
      updateToneLabel(toneClass, input.value);
      showProfileError("");
    });

    wrapper.append(label, input);
    fragment.appendChild(wrapper);
  });
  toneFields.appendChild(fragment);
}

function updateToneLabel(toneClass, value) {
  const label = toneFields.querySelector(`[data-tone-label="${toneClass}"]`);
  if (!label) return;
  const abbreviation = toneEngine.toneClassLabels[toneClass];
  label.textContent = value
    ? `${abbreviation}（${toneEngine.digitsToSuperscript(value)}）`
    : abbreviation;
}

function mappingMeta(group, entry) {
  if (group === "consonants") {
    return { High: "高辅音", Mid: "中辅音", Low: "低辅音" }[entry.class] || entry.class;
  }
  if (group === "vowels") {
    const length = { Short: "短元音", Long: "长元音", Special: "特殊元音" }[entry.len] || entry.len;
    const type = { Open: "开音节式", Closed: "闭音节式" }[entry.type] || entry.type;
    return `${length} · ${type}`;
  }
  return { Stop: "塞音韵尾", Nasal: "鼻音韵尾", Vowel: "元音韵尾" }[entry.type] || entry.type;
}

function buildMappingFields(group, container) {
  const fragment = document.createDocumentFragment();
  toneEngine.segmentEntries[group].forEach((entry, index) => {
    const wrapper = document.createElement("label");
    wrapper.className = "mapping-field";
    wrapper.htmlFor = `mapping-${group}-${index}`;

    const heading = document.createElement("span");
    heading.className = "mapping-field-heading";
    const grapheme = document.createElement("strong");
    grapheme.textContent = entry.grapheme;
    const meta = document.createElement("small");
    meta.textContent = mappingMeta(group, entry);
    heading.append(grapheme, meta);

    const input = document.createElement("input");
    input.id = `mapping-${group}-${index}`;
    input.className = "mapping-input";
    input.type = "text";
    input.maxLength = 24;
    input.autocomplete = "off";
    input.dataset.mappingGroup = group;
    input.dataset.mappingKey = entry.grapheme;
    input.setAttribute("aria-label", `${entry.grapheme} 的 IPA 映射`);
    input.addEventListener("input", () => showProfileError(""));

    wrapper.append(heading, input);
    fragment.appendChild(wrapper);
  });
  container.appendChild(fragment);
}

function toneInputs() {
  return Array.from(toneFields.querySelectorAll("[data-tone-class]"));
}

function mappingInputs() {
  return [consonantFields, vowelFields, finalFields]
    .flatMap(container => Array.from(container.querySelectorAll("[data-mapping-group]")));
}

function readDraft() {
  const tones = {};
  toneInputs().forEach(input => {
    tones[input.dataset.toneClass] = input.value.trim();
  });
  const mappings = { consonants: {}, vowels: {}, finals: {} };
  mappingInputs().forEach(input => {
    mappings[input.dataset.mappingGroup][input.dataset.mappingKey] = input.value.trim();
  });
  return { id: editingProfileId, name: profileNameInput.value, tones, mappings };
}

function fillForm(profile) {
  editingProfileId = profile ? profile.id : null;
  pendingDeleteId = null;
  deleteConfirmation.hidden = true;
  profileNameInput.value = profile ? profile.name : "";
  toneInputs().forEach(input => {
    input.value = profile ? profile.tones[input.dataset.toneClass] : "";
    updateToneLabel(input.dataset.toneClass, input.value);
  });
  mappingInputs().forEach(input => {
    input.value = profile
      ? profile.mappings[input.dataset.mappingGroup][input.dataset.mappingKey]
      : "";
  });
  deleteProfileButton.disabled = !editingProfileId;
  showProfileError("");
}

function renderProfileSelect(selectedId = null) {
  const profiles = repository.list();
  profileSelect.textContent = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = profiles.length ? "请选择语言点" : "暂无语言点方案";
  profileSelect.appendChild(placeholder);
  profiles.forEach(profile => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    profileSelect.appendChild(option);
  });
  profileSelect.value = selectedId && repository.get(selectedId) ? selectedId : "";
  restoreDefaultButton.disabled = repository.hasDefault();
}

function selectProfile(id) {
  const profile = id ? repository.get(id) : null;
  profileSelect.value = profile ? profile.id : "";
  fillForm(profile);
}

function activateEditorTab(tabName) {
  editorTabs.forEach(tab => {
    const active = tab.dataset.editorTab === tabName;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.setAttribute("tabindex", active ? "0" : "-1");
  });
  editorPanels.forEach(panel => {
    const active = panel.dataset.editorPanel === tabName;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });
}

function openProfileManager(required = false) {
  modalIsRequired = required || !activeProfile;
  pendingDeleteId = null;
  deleteConfirmation.hidden = true;
  closeProfileButton.hidden = modalIsRequired;
  renderProfileSelect(activeProfile ? activeProfile.id : null);
  selectProfile(activeProfile ? activeProfile.id : null);
  activateEditorTab("tones");
  profileModal.classList.add("open");
  profileModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.querySelector("main").inert = true;
  window.setTimeout(() => (profileSelect.value ? profileNameInput : profileSelect).focus(), 0);
}

function closeProfileManager() {
  if (modalIsRequired || !activeProfile) return;
  profileModal.classList.remove("open");
  profileModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  document.querySelector("main").inert = false;
  manageProfilesButton.focus();
}

function saveCurrentDraft() {
  const saved = repository.save(readDraft());
  editingProfileId = saved.id;
  renderProfileSelect(saved.id);
  fillForm(saved);
  profileSelect.value = saved.id;
  if (activeProfile && activeProfile.id === saved.id) {
    activeProfile = saved;
    activeProfileName.textContent = saved.name;
    if (hasConverted) transcribeCurrentText();
  }
  updateStorageNotice();
  showNotification(`已保存“${saved.name}”${repository.persistent ? "。" : "（仅当前会话）。"}`);
  return saved;
}

function activateProfile(profile) {
  activeProfile = profile;
  rememberProfile(profile.id);
  activeProfileName.textContent = profile.name;
  modalIsRequired = false;
  profileModal.classList.remove("open");
  profileModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  document.querySelector("main").inert = false;
  if (hasConverted) transcribeCurrentText();
  if(currentAnalysis) renderAnalysis(currentAnalysis);
  manageProfilesButton.focus();
  showNotification(`正在使用“${profile.name}”语言点方案。`);
}

function resetInput() {
  manualSeg.value = ""; clearResult(); currentAnalysis = null; ensureConvertButton();
  document.getElementById("inputCount").textContent = `${laoInput.value.length.toLocaleString()} / 20,000`;
  document.getElementById("analysisSummary").textContent = "输入文本后，点击自动拆分音节。";
  ["syllableTokens","analysisIssues","analysisAlternatives"].forEach(id => document.getElementById(id).textContent = "");
}
segmentButton.addEventListener("click", () => {
  clearResult();
  try { autoSegment(laoInput.value); }
  catch(error) { resetInput(); showNotification(error.message); }
});
manualSeg.addEventListener("input", () => {
  clearResult();
  try { renderAnalysis(syllables.manual(manualSeg.value)); }
  catch(error) { ensureConvertButton(); if(convertButton) convertButton.disabled=true; showNotification(error.message); }
});
laoInput.addEventListener("input", resetInput);
document.getElementById("spacedOutput").addEventListener("change", () => { if(hasConverted) transcribeCurrentText(); });
document.querySelectorAll("[data-example]").forEach(button => button.addEventListener("click", () => {
  laoInput.value = button.dataset.example; resetInput(); autoSegment(laoInput.value);
}));
async function copyText(value, element) {
  if(!value.trim()) return;
  try { await navigator.clipboard.writeText(value); showNotification("已复制。"); return; } catch(_) {}
  // WebKit file:// may lack Clipboard API; copy remains an explicit user action.
  const helper=document.createElement("textarea"); helper.value=value; helper.style.position="fixed"; helper.style.opacity="0";
  document.body.appendChild(helper); helper.select();
  let copied=false; try { copied=document.execCommand("copy"); } catch(_) {} helper.remove();
  if(copied) { showNotification("已复制。"); return; }
  if(element.select) element.select();
  else { const range=document.createRange(); range.selectNodeContents(element); const selection=window.getSelection(); selection.removeAllRanges(); selection.addRange(range); }
  showNotification("请手动复制已选中的文本。");
}
copyButton.addEventListener("click", () => copyText(ipaOutput.textContent || "", ipaOutput));

function renderCorrections() {
  const entries=Object.entries(corrections.entries);
  document.getElementById("correctionCount").textContent=`${entries.length} 条`;
  const container=document.getElementById("correctionList"); container.textContent="";
  entries.forEach(([source,parts]) => {
    const row=document.createElement("div"); row.className="correction-row";
    const text=document.createElement("span"); text.textContent=`${source} → ${parts.join(" · ")}`;
    const edit=document.createElement("button"); edit.type="button"; edit.className="text-button"; edit.textContent="编辑"; edit.setAttribute("aria-label",`编辑校正 ${source}`);
    edit.addEventListener("click", () => { document.getElementById("correctionSource").value=source; document.getElementById("correctionSplit").value=parts.join(" "); document.getElementById("correctionSplit").focus(); });
    const remove=document.createElement("button"); remove.type="button"; remove.className="text-button danger-text"; remove.textContent="删除"; remove.setAttribute("aria-label",`删除校正 ${source}`);
    remove.addEventListener("click", () => {
      if(remove.dataset.confirm!=="yes") { remove.dataset.confirm="yes"; remove.textContent="确认删除"; return; }
      corrections.delete(source); renderCorrections(); updateStorageNotice();
    });
    row.append(text,edit,remove); container.appendChild(row);
  });
  if(!entries.length) container.textContent="暂无校正词条。先核对音节，再保存你确认过的拆分。";
  if(corrections.warning) document.getElementById("correctionMessage").textContent=corrections.warning;
}
document.getElementById("saveCorrectionButton").addEventListener("click", () => {
  try {
    const saved=corrections.save(document.getElementById("correctionSource").value, document.getElementById("correctionSplit").value);
    renderCorrections(); updateStorageNotice();
    document.getElementById("correctionMessage").textContent=corrections.warning || `已保存「${saved.source}」的拆分。再次自动拆分时生效。`;
  } catch(error) { document.getElementById("correctionMessage").textContent=error.message; }
});
document.getElementById("exportCorrectionsButton").addEventListener("click", () => { document.getElementById("correctionBackup").value=corrections.export(); });
document.getElementById("copyCorrectionsButton").addEventListener("click", () => { const field=document.getElementById("correctionBackup"); copyText(field.value,field); });
document.getElementById("importCorrectionsButton").addEventListener("click", () => {
  try { const count=corrections.import(document.getElementById("correctionBackup").value); renderCorrections(); updateStorageNotice(); document.getElementById("correctionMessage").textContent=corrections.warning || `已合并导入 ${count} 条校正。`; }
  catch(error) { document.getElementById("correctionMessage").textContent=error.message || "导入失败，请检查备份文本。"; }
});

manageProfilesButton.addEventListener("click", () => openProfileManager(false));
closeProfileButton.addEventListener("click", closeProfileManager);

profileSelect.addEventListener("change", () => selectProfile(profileSelect.value));

editorTabs.forEach(tab => {
  tab.addEventListener("click", () => activateEditorTab(tab.dataset.editorTab));
  tab.addEventListener("keydown", event => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = editorTabs.indexOf(tab);
    const next = event.key === "Home" ? 0 : event.key === "End" ? editorTabs.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + editorTabs.length) % editorTabs.length;
    activateEditorTab(editorTabs[next].dataset.editorTab);
    editorTabs[next].focus();
  });
});

newProfileButton.addEventListener("click", () => {
  profileSelect.value = "";
  const base = activeProfile || profilesApi.createDefaultProfile();
  fillForm({ id: null, name: "", tones: base.tones, mappings: base.mappings });
  profileNameInput.focus();
});

saveProfileButton.addEventListener("click", () => {
  try {
    saveCurrentDraft();
  } catch (error) {
    showProfileError(error.message || "保存失败。");
  }
});

useProfileButton.addEventListener("click", () => {
  try {
    activateProfile(saveCurrentDraft());
  } catch (error) {
    showProfileError(error.message || "无法使用该方案。");
  }
});

deleteProfileButton.addEventListener("click", () => {
  const profile = editingProfileId ? repository.get(editingProfileId) : null;
  if (!profile) return;
  pendingDeleteId = profile.id;
  document.getElementById("deleteConfirmationText").textContent = `确定删除“${profile.name}”声调方案吗？`;
  deleteConfirmation.hidden = false;
  document.getElementById("confirmDeleteButton").focus();
});

document.getElementById("cancelDeleteButton").addEventListener("click", () => {
  pendingDeleteId = null;
  deleteConfirmation.hidden = true;
  deleteProfileButton.focus();
});

document.getElementById("confirmDeleteButton").addEventListener("click", () => {
  const profile = pendingDeleteId ? repository.get(pendingDeleteId) : null;
  if (!profile) return;
  pendingDeleteId = null;
  deleteConfirmation.hidden = true;
  repository.delete(profile.id);
  if (activeProfile && activeProfile.id === profile.id) {
    activeProfile = null;
    activeProfileName.textContent = "未选择";
    clearResult();
    rememberProfile(null);
    modalIsRequired = true;
    closeProfileButton.hidden = true;
  }
  renderProfileSelect();
  fillForm(null);
  if (!activeProfile) {
    const remaining = repository.list()[0];
    if (remaining) activateProfile(remaining);
    else openProfileManager(true);
  }
  updateStorageNotice();
  showNotification(`已删除“${profile.name}”。`);
});

restoreDefaultButton.addEventListener("click", () => {
  try {
    const restored = repository.restoreDefault();
    renderProfileSelect(restored.id);
    selectProfile(restored.id);
    updateStorageNotice();
    showNotification("已恢复默认“万象”方案。");
  } catch (error) {
    showProfileError(error.message || "恢复失败。");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Tab" && profileModal.classList.contains("open")) {
    const focusable = Array.from(profileModal.querySelectorAll('button:not([disabled]), input, select, [tabindex="0"]'))
      .filter(element => !element.hidden && element.getClientRects().length && element.tabIndex !== -1);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (event.key === "Escape" && profileModal.classList.contains("open")) {
    event.preventDefault();
    closeProfileManager();
  }
});

buildToneFields();
buildMappingFields("consonants", consonantFields);
buildMappingFields("vowels", vowelFields);
buildMappingFields("finals", finalFields);
let savedProfileId = null;
try { savedProfileId = browserStorage.getItem(ACTIVE_PROFILE_KEY); } catch (_) { repository.persistent = false; }
const initialProfile = repository.get(savedProfileId) || repository.get(profilesApi.DEFAULT_PROFILE_ID) || repository.list()[0];
if (initialProfile) activateProfile(initialProfile);
else openProfileManager(true);
updateStorageNotice();

renderCorrections();
const offlineStatus=document.getElementById("offlineStatus");
if(["file:","laophon-share:"].includes(window.location?.protocol)) offlineStatus.textContent="桌面版 · 离线运行";
else if("serviceWorker" in navigator && (window.location?.protocol === "https:" || ["localhost","127.0.0.1"].includes(window.location?.hostname))) {
  navigator.serviceWorker.register("sw.js").then(() => navigator.serviceWorker.ready).then(() => { offlineStatus.textContent="离线缓存已就绪"; }).catch(() => { offlineStatus.textContent="本地计算 · 离线缓存未就绪"; });
}
