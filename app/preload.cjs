'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('LaoPhonDesktop', {
  setLanguage(language) {
    if (language === 'zh' || language === 'en') ipcRenderer.send('laophon:set-ui-language', language);
  }
});
