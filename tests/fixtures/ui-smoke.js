"use strict";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }
  add(value) { this.values.add(value); }
  remove(value) { this.values.delete(value); }
  contains(value) { return this.values.has(value); }
  toggle(value, force) {
    if (force) this.values.add(value);
    else this.values.delete(value);
  }
}

const createdElements = [];

class FakeElement {
  constructor(tagName = "div", id = "") {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.value = "";
    this.children = [];
    this.dataset = {};
    this.listeners = {};
    this.classList = new FakeClassList();
    this.attributes = {};
    this.disabled = false;
    this.hidden = false;
    this._textContent = "";
  }
  get textContent() { return this._textContent; }
  set textContent(value) {
    this._textContent = String(value);
    if (value === "") this.children = [];
  }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  append(...children) { this.children.push(...children); }
  addEventListener(type, listener) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }
  dispatch(type, event = {}) {
    (this.listeners[type] || []).forEach(listener => listener({ preventDefault() {}, key: "", ...event }));
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  querySelectorAll(selector) {
    if (selector === "[data-tone-class]") {
      return createdElements.filter(element => element.dataset.toneClass);
    }
    if (selector === "[data-mapping-group]") {
      return createdElements.filter(element => element.dataset.mappingGroup);
    }
    return [];
  }
  querySelector(selector) {
    const toneLabelMatch = selector.match(/^\[data-tone-label="(.+)"\]$/);
    if (toneLabelMatch) {
      return createdElements.find(element => element.dataset.toneLabel === toneLabelMatch[1]) || null;
    }
    return null;
  }
  focus() {}
}

const elementIds = [
  "laoInput", "segmentButton", "manualSeg", "confirmSlot", "ipaOutput", "copyButton",
  "notification", "activeProfileName", "manageProfilesButton", "profileModal", "profileSelect",
  "profileName", "toneFields", "consonantFields", "vowelFields", "finalFields",
  "newProfileButton", "deleteProfileButton", "restoreDefaultButton",
  "saveProfileButton", "useProfileButton", "closeProfileButton", "profileError", "storageNotice", "resultPlaceholder", "segmentHint", "deleteConfirmation", "deleteConfirmationText", "confirmDeleteButton", "cancelDeleteButton", "offlineStatus", "inputCount", "analysisSummary", "syllableTokens", "analysisIssues", "analysisAlternatives", "spacedOutput", "correctionCount", "correctionSource", "correctionSplit", "correctionMessage", "correctionList", "correctionBackup", "saveCorrectionButton", "exportCorrectionsButton", "copyCorrectionsButton", "importCorrectionsButton"
];
const elements = {};
elementIds.forEach(id => { elements[id] = new FakeElement("div", id); });
const fakeEditorTabs = ["tones", "consonants", "vowels", "finals"].map(name => {
  const tab = new FakeElement("button");
  tab.dataset.editorTab = name;
  return tab;
});
const fakeEditorPanels = ["tones", "consonants", "vowels", "finals"].map(name => {
  const panel = new FakeElement("section");
  panel.dataset.editorPanel = name;
  return panel;
});

globalThis.window = globalThis;
globalThis.document = {
  body: new FakeElement("body", "body"),
  getElementById(id) { return elements[id]; },
  createElement(tagName) {
    const element = new FakeElement(tagName);
    createdElements.push(element);
    return element;
  },
  createDocumentFragment() { return new FakeElement("fragment"); },
  querySelectorAll(selector) {
    if (selector === "[data-editor-tab]") return fakeEditorTabs;
    if (selector === "[data-editor-panel]") return fakeEditorPanels;
    return [];
  },
  querySelector() { return new FakeElement("main"); },
  addEventListener() {},
  createRange() { return { selectNodeContents() {} }; }
};
globalThis.navigator = { clipboard: { writeText() { return Promise.resolve(); } } };
globalThis.localStorage = {
  values: {},
  getItem(key) { return Object.prototype.hasOwnProperty.call(this.values, key) ? this.values[key] : null; },
  setItem(key, value) { this.values[key] = String(value); }
};
globalThis.confirm = () => true;
globalThis.getSelection = () => ({ removeAllRanges() {}, addRange() {} });
globalThis.setTimeout = callback => { callback(); return 1; };
globalThis.clearTimeout = () => {};

load("dist/tone-engine.js");
load("dist/profile-store.js");
load("dist/syllable-engine.js");
load("dist/correction-store.js");
load("dist/app.js");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(!elements.profileModal.classList.contains("open"), "startup should be ready to use");
assert(elements.activeProfileName.textContent === "万象", "startup should use Vientiane");
elements.manageProfilesButton.dispatch("click");
assert(createdElements.filter(element => element.dataset.toneClass).length === 15, "15 tone inputs should exist");
assert(createdElements.filter(element => element.dataset.mappingGroup === "consonants").length > 30, "consonant mapping inputs should exist");
assert(createdElements.filter(element => element.dataset.mappingGroup === "vowels").length > 30, "vowel mapping inputs should exist");
assert(createdElements.filter(element => element.dataset.mappingGroup === "finals").length === 8, "final mapping inputs should exist");

elements.profileSelect.value = "default-vientiane";
elements.profileSelect.dispatch("change");
assert(elements.profileName.value === "万象", "selecting default should fill the profile form");
const tone1tLabel = createdElements.find(element => element.dataset.toneLabel === "1t");
assert(tone1tLabel.textContent === "AM（¹¹）", "tone hint should use AM and show superscript value");
elements.useProfileButton.dispatch("click");
assert(elements.activeProfileName.textContent === "万象", "default profile should become active");
assert(!elements.profileModal.classList.contains("open"), "dialog should close after activation");

elements.manualSeg.value = "ກ້າ";
elements.manualSeg.dispatch("input");
assert(elements.confirmSlot.children.length === 1, "conversion button should be created");
elements.confirmSlot.children[0].dispatch("click");
assert(elements.ipaOutput.textContent === "kaː⁵³", "UI transcription should use the active 3t mapping");

elements.manageProfilesButton.dispatch("click");
const tone3tInput = createdElements.find(element => element.dataset.toneClass === "3t");
tone3tInput.value = "22";
elements.saveProfileButton.dispatch("click");
assert(elements.ipaOutput.textContent === "kaː²²", "saving the active profile should refresh existing output");

const consonantKaInput = createdElements.find(element =>
  element.dataset.mappingGroup === "consonants" && element.dataset.mappingKey === "ກ"
);
consonantKaInput.value = "q";
elements.saveProfileButton.dispatch("click");
assert(elements.ipaOutput.textContent === "qaː²²", "saving an active letter mapping should refresh existing output");

print("PASS: UI controller smoke test");
