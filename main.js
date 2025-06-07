const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const { exec } = require('child_process');

function checkNodeInstalled() {
  return new Promise((resolve) => {
    exec('node -v', (error, stdout) => {
      resolve(!error);
    });
  });
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 950,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  win.webContents.openDevTools();
  win.loadFile('index.html');
}

function sendStatusToWindow(text) {
  if (win && win.webContents) {
    win.webContents.send('update-message', text);
  }
}

app.whenReady().then(() => {
  createWindow();

  // Configure autoUpdater logging
  autoUpdater.logger = require('electron-log');
  autoUpdater.logger.transports.file.level = 'info';

  // Check for updates and notify user if available
  autoUpdater.checkForUpdatesAndNotify();

  // Events pour informer la fenêtre sur le processus de mise à jour
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Recherche de mise à jour...');
  });
  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow(`Nouvelle version disponible : ${info.version}`);
  });
  autoUpdater.on('update-not-available', () => {
    sendStatusToWindow('Aucune mise à jour disponible.');
  });
  autoUpdater.on('error', (err) => {
    sendStatusToWindow(`Erreur lors de la mise à jour : ${err == null ? "unknown" : (err.message || err)}`);
  });
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = `Téléchargement : ${Math.round(progressObj.percent)}% (${progressObj.transferred}/${progressObj.total} octets)`;
    sendStatusToWindow(log_message);
  });
  autoUpdater.on('update-downloaded', () => {
    sendStatusToWindow('Mise à jour téléchargée, redémarrage dans 5 secondes...');
    // On peut proposer un dialogue pour redémarrer tout de suite
    dialog.showMessageBox(win, {
      type: 'info',
      buttons: ['Redémarrer maintenant', 'Plus tard'],
      title: 'Mise à jour disponible',
      message: 'La mise à jour a été téléchargée. Voulez-vous redémarrer maintenant pour appliquer la mise à jour ?'
    }).then(result => {
      if (result.response === 0) { // bouton 'Redémarrer maintenant'
        autoUpdater.quitAndInstall();
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle("check-node-installed", async () => {
  return await checkNodeInstalled();
});

ipcMain.handle("get-config", async () => {
  const configPath = path.join(app.getPath("userData"), "config.json");
  if (!fs.existsSync(configPath)) return null;
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
});

ipcMain.handle("save-config", async (_, config) => {
  const configPath = path.join(app.getPath("userData"), "config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return true;
});

ipcMain.handle("start-bot", async (_, config) => {
  const { startAuthFlow } = require("./auth-setup");
  const bot = require("./bot");

  try {
    console.log("Authentification en cours...");
    await startAuthFlow({
      clientId: config.clientId,
      clientSecret: config.clientSecret
    });
    console.log("Authentification réussie !");
    console.log("Démarrage du bot...");
    bot.start(config);
    return true;
  } catch (err) {
    console.error("Échec de l'authentification :", err);
    return false;
  }
});