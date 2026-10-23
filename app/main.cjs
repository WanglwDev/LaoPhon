'use strict';
const { app, BrowserWindow, Menu, protocol, net, session, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

app.setName('LaoPhon');
// This path is intentionally unrelated to the native private application's data.
app.setPath('userData', path.join(app.getPath('appData'), 'LaoPhon-Share'));
if (process.platform === 'win32') app.setAppUserModelId('org.laophon.share');
protocol.registerSchemesAsPrivileged([{
  scheme: 'laophon-share',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true }
}]);

const origin = 'laophon-share://app';
const ui = path.join(__dirname, 'ui');
const assets = new Set(fs.readdirSync(ui));
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180, height: 850, minWidth: 380, minHeight: 540,
    title: 'LaoPhon', backgroundColor: '#f6f7f3',
    autoHideMenuBar: process.platform !== 'darwin',
    webPreferences: {
      nodeIntegration: false, contextIsolation: true, sandbox: true,
      webSecurity: true, spellcheck: false, devTools: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(origin + '/')) event.preventDefault();
  });
  mainWindow.webContents.on('will-attach-webview', event => event.preventDefault());
  mainWindow.loadURL(origin + '/index.html');
}

function setApplicationLanguage(language) {
  const english = language === 'en';
  const menu = [];
  if (process.platform === 'darwin') {
    menu.push(english ? { label: 'LaoPhon', submenu: [
      { role: 'about', label: 'About LaoPhon' }, { type: 'separator' },
      { role: 'hide', label: 'Hide LaoPhon' }, { role: 'hideOthers', label: 'Hide Others' },
      { role: 'unhide', label: 'Show All' }, { type: 'separator' },
      { role: 'quit', label: 'Quit LaoPhon' }
    ] } : { role: 'appMenu' });
  }
  const item = (role, label) => english ? { role, label } : { role };
  menu.push({ label: english ? 'Edit' : '编辑', submenu: [
    item('undo', 'Undo'), item('redo', 'Redo'), { type: 'separator' },
    item('cut', 'Cut'), item('copy', 'Copy'), item('paste', 'Paste'), item('selectAll', 'Select All')
  ] }, { label: english ? 'Window' : '窗口', submenu: [item('minimize', 'Minimize'), item('close', 'Close')] });
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

ipcMain.on('laophon:set-ui-language', (event, language) => {
  if (!mainWindow || event.sender !== mainWindow.webContents
    || event.senderFrame !== mainWindow.webContents.mainFrame
    || !event.sender.getURL().startsWith(origin + '/')
    || !['zh', 'en'].includes(language)) return;
  setApplicationLanguage(language);
});

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
  });
  app.whenReady().then(() => {
    protocol.handle('laophon-share', request => {
      const url = new URL(request.url);
      const name = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname).slice(1);
      if (url.host !== 'app' || !assets.has(name) || name.includes('/') || name.includes('\\')) {
        return new Response('Not found', { status: 404 });
      }
      return net.fetch(pathToFileURL(path.join(ui, name)).href);
    });
    session.defaultSession.setPermissionRequestHandler((contents, permission, done) => {
      done(permission === 'clipboard-sanitized-write' && contents.getURL().startsWith(origin + '/'));
    });
    session.defaultSession.setPermissionCheckHandler((contents, permission) =>
      permission === 'clipboard-sanitized-write' && Boolean(contents?.getURL().startsWith(origin + '/')));
    // The application has no online service or external content.
    session.defaultSession.webRequest.onBeforeRequest(
      { urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*'] },
      (_, done) => done({ cancel: true })
    );
    setApplicationLanguage('zh');
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => app.quit());
}
