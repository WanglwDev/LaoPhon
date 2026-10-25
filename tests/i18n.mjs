import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const ui = new URL('../app/ui/', import.meta.url);
const code = fs.readFileSync(new URL('i18n.js', ui), 'utf8');
const html = fs.readFileSync(new URL('index.html', ui), 'utf8');
const chinese = /[\u4e00-\u9fff]/u;
let assertions = 0;
function equal(actual, expected) { assertions++; assert.deepEqual(actual, expected); }

class Text {
  nodeType = 3;
  constructor(data) { this.data = data; }
}
class Element {
  nodeType = 1;
  childNodes = [];
  attributes = {};
  listeners = {};
  value = '';
  constructor(tagName, id = '', text = '') {
    this.tagName = tagName.toUpperCase(); this.id = id;
    if (text) this.append(new Text(text));
  }
  append(...nodes) { for (const node of nodes) { node.parentElement = this; this.childNodes.push(node); } }
  get textContent() { return this.childNodes.map(n => n.nodeType === 3 ? n.data : n.textContent).join(''); }
  set textContent(text) { this.childNodes = []; this.append(new Text(text)); }
  hasAttribute(key) { return Object.hasOwn(this.attributes, key); }
  getAttribute(key) { return this.attributes[key]; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  addEventListener(type, callback) { this.listeners[type] = callback; }
  closest(selector) {
    const matches = selector.split(',').some(part => {
      part = part.trim();
      if (part.startsWith('#')) return this.id === part.slice(1);
      if (part.startsWith('option:')) return this.tagName === 'OPTION' && this.value !== '';
      return this.tagName === part.toUpperCase();
    });
    return matches ? this : this.parentElement?.closest(selector);
  }
}

function boot({saved, storageFails = false} = {}) {
  const body = new Element('body');
  const nodes = {};
  function add(tag, id, text = '') { const node = new Element(tag, id, text); nodes[id] = node; body.append(node); return node; }
  add('button', 'languageZh', '中文'); add('button', 'languageEn', 'English');
  add('span', 'languageNotice', '界面语言仅在当前会话有效。');
  add('h2', 'heading', '  输入老挝文  ');
  add('div', 'notification', '正在使用“万象”语言点方案。');
  add('span', 'activeProfileName', '声调');
  const select = add('select', 'profileSelect');
  const placeholder = new Element('option', '', '请选择语言点');
  const custom = new Element('option', '', '保存'); custom.value = 'custom';
  select.append(placeholder, custom);
  const input = add('textarea', 'laoInput'); input.value = 'ການຄ້າ'; input.setAttribute('placeholder', '在这里输入老挝文…');
  const profile = add('input', 'profileName'); profile.value = '我的语言点'; profile.setAttribute('aria-label', '语言点名称');
  const output = add('code', 'ipaOutput', 'kaː⁵³');
  const label = add('div', 'mappingMeta', '长元音 · 开音节式');
  const storage = saved ? {'laophon.share.uiLanguage.v1': saved} : {};
  const bridge = [];
  let observer;
  const context = vm.createContext({
    window: null,
    document: {body, documentElement: {}, getElementById: id => nodes[id]},
    localStorage: {
      getItem(key) { if (storageFails) throw new Error('unavailable'); return storage[key]; },
      setItem(key, value) { if (storageFails) throw new Error('unavailable'); storage[key] = value; }
    },
    MutationObserver: class { constructor(callback) { this.callback = callback; observer = this; } observe() {} disconnect() {} },
    LaoPhonDesktop: {setLanguage: value => bridge.push(value)}
  });
  context.window = context;
  vm.runInContext(code, context);
  return {api: context.LaoPhonI18n, nodes, context, storage, bridge, custom, placeholder,
    notify(target, type = 'childList') { observer.callback([{target, type}]); }};
}

const app = boot();
equal(app.api.language, 'zh');
equal(app.nodes.heading.textContent, '  输入老挝文  ');
app.nodes.languageEn.listeners.click();
equal(app.api.language, 'en');
equal(app.context.document.documentElement.lang, 'en');
equal(app.nodes.heading.textContent, '  Enter Lao text  ');
equal(app.nodes.laoInput.getAttribute('placeholder'), 'Enter Lao text here…');
equal(app.nodes.profileName.getAttribute('aria-label'), 'Variety name');
equal(app.nodes.mappingMeta.textContent, 'Long vowel letter · Open-syllable form');
equal(app.nodes.activeProfileName.textContent, '声调');
equal(app.custom.textContent, '保存');
equal(app.placeholder.textContent, 'Select a variety');
equal(app.nodes.profileName.value, '我的语言点');
equal(app.nodes.laoInput.value, 'ການຄ້າ');
equal(app.nodes.ipaOutput.textContent, 'kaː⁵³');
equal(app.nodes.languageEn.getAttribute('aria-pressed'), 'true');
equal(app.nodes.languageZh.getAttribute('aria-pressed'), 'false');
equal(app.storage, {'laophon.share.uiLanguage.v1': 'en'});
equal(app.bridge.at(-1), 'en');

// Generated labels and engine/controller messages are translated after mutation.
app.nodes.notification.textContent = '已保存“声调”。'; app.notify(app.nodes.notification);
equal(app.nodes.notification.textContent, 'Saved “声调”.');
app.nodes.heading.childNodes[0].data = '2 个音节 · 1 个待修正片段 · 1 处拆分歧义'; app.notify(app.nodes.heading.childNodes[0], 'characterData');
equal(app.nodes.heading.textContent, '2 syllables · 1 segment to correct · 1 ambiguous boundary');
app.nodes.profileName.setAttribute('aria-label', '调类 AM 的调值'); app.notify(app.nodes.profileName, 'attributes');
equal(app.nodes.profileName.getAttribute('aria-label'), 'Tone value for category AM');
app.nodes.activeProfileName.textContent = '未选择'; app.notify(app.nodes.activeProfileName);
equal(app.nodes.activeProfileName.textContent, 'Not selected');
app.nodes.ipaOutput.textContent = '保存'; app.notify(app.nodes.ipaOutput.childNodes[0], 'characterData');
equal(app.nodes.ipaOutput.textContent, '保存');

app.nodes.languageZh.listeners.click();
equal(app.nodes.notification.textContent, '已保存“声调”。');
equal(app.nodes.heading.textContent, '2 个音节 · 1 个待修正片段 · 1 处拆分歧义');
equal(app.nodes.activeProfileName.textContent, '未选择');
equal(app.nodes.profileName.getAttribute('aria-label'), '调类 AM 的调值');
equal(app.nodes.laoInput.getAttribute('placeholder'), '在这里输入老挝文…');
equal(app.custom.textContent, '保存');
equal(app.nodes.ipaOutput.textContent, '保存');
for (let i = 0; i < 8; i++) { app.api.setLanguage('en'); app.api.setLanguage('zh'); }
equal(app.nodes.heading.textContent, '2 个音节 · 1 个待修正片段 · 1 处拆分歧义');
equal(app.nodes.profileName.value, '我的语言点');
equal(app.nodes.laoInput.value, 'ການຄ້າ');
app.api.setLanguage('fr'); equal(app.api.language, 'zh');
const restored = boot({saved: 'en'});
equal(restored.api.language, 'en'); equal(restored.nodes.heading.textContent, '  Enter Lao text  ');
const failed = boot({storageFails: true});
failed.nodes.languageEn.listeners.click();
equal(failed.api.language, 'en'); equal(failed.nodes.languageNotice.hidden, false);
equal(failed.nodes.languageNotice.textContent, 'The interface language is saved for this session only.');
equal(failed.nodes.laoInput.value, 'ການຄ້າ');

// Every original static Chinese text/label/placeholder must have an English form.
const staticCopy = [...html.matchAll(/>([^<>]+)</gu)].map(match => match[1])
  .concat([...html.matchAll(/(?:aria-label|placeholder|content)="([^"]*)"/gu)].map(match => match[1]));
for (const text of staticCopy.filter(text => chinese.test(text) && text.trim() !== '中文')) {
  assertions++; assert.equal(chinese.test(app.api.translate(text)), false, `Missing static translation: ${text.trim()}`);
}
// Preserve all engine/controller logic; every literal validation error is covered.
for (const file of ['profile-store.js', 'correction-store.js', 'syllable-engine.js', 'tone-engine.js']) {
  const source = fs.readFileSync(new URL(file, ui), 'utf8');
  for (const match of source.matchAll(/(?:Error\(|reason:\s*|this\.warning=)"([^"\n]*[\u4e00-\u9fff][^"\n]*)"/gu)) {
    equal(chinese.test(app.api.translate(match[1])), false);
  }
}
console.log(`PASS: ${assertions} bilingual interface assertions (coverage, dynamic messages, round trip, saved preference, unavailable storage, unchanged user data)`);
