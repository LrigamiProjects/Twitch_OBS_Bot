const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const { exec } = require('child_process');

function checkNodeInstalled() {
  return new Promise((resolve) => {
    exec('node -v', (error, stdout) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true); 
      }
    });
  });
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 950,
    height: 800,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
    }
  })
  win.webContents.openDevTools();

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle("check-node-installed", async () => {
  const isInstalled = await checkNodeInstalled();
  return isInstalled;
});

ipcMain.handle("get-config", async () => {
  const configPath = path.join(app.getPath("userData"), "config.json");
  if (!fs.existsSync(configPath)) return null; // vérifie que la config existe déjà. Sinon, return
  return JSON.parse(fs.readFileSync(configPath, "utf-8")); 
})

ipcMain.handle("save-config", async (_, config) => {
  const configPath = path.join(app.getPath("userData"), "config.json");
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); // sauvegarde la configuration en JSON indenté de 2
  return true;
})

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