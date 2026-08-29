import { app, BrowserWindow, Menu, dialog, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { probeYouwei, startYouweiServer } from './server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREFERRED_PORT = Number(process.env.PORT || 8765);

let mainWindow = null;
let localServer = null;

function siteRoot() {
    if (app.isPackaged) return path.join(process.resourcesPath, 'site');
    return path.resolve(__dirname, '..');
}

async function resolveBaseUrl() {
    if (await probeYouwei(PREFERRED_PORT)) {
        return 'http://127.0.0.1:' + PREFERRED_PORT;
    }
    const started = await startYouweiServer({ root: siteRoot(), port: PREFERRED_PORT });
    localServer = started.server;
    return started.url;
}

function createWindow(baseUrl) {
    mainWindow = new BrowserWindow({
        width: 1360,
        height: 860,
        minWidth: 1024,
        minHeight: 680,
        title: '友为 · 从战略到路标',
        backgroundColor: '#f7f5f0',
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });
    mainWindow.once('ready-to-show', function () {
        mainWindow.show();
    });
    mainWindow.webContents.setWindowOpenHandler(function (details) {
        const url = String(details.url || '');
        if (url.startsWith(baseUrl)) return { action: 'allow' };
        if (/^https?:\/\//i.test(url)) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });
    mainWindow.loadURL(baseUrl + '/');
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
} else {
    app.setName('友为');
    app.setAppUserModelId('com.yoway.workshop');
    Menu.setApplicationMenu(null);

    app.on('second-instance', function () {
        if (!mainWindow) return;
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    });

    app.whenReady().then(async function () {
        try {
            const baseUrl = await resolveBaseUrl();
            createWindow(baseUrl);
        } catch (err) {
            dialog.showErrorBox('友为无法启动', String((err && err.message) || err || '本机服务启动失败'));
            app.quit();
        }
    });

    app.on('window-all-closed', function () {
        app.quit();
    });

    app.on('before-quit', function () {
        if (localServer) {
            try { localServer.close(); } catch (e) { /* ignore */ }
            localServer = null;
        }
    });
}
