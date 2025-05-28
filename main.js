const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

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

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

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

ipcMain.handle("start-bot", (_, config) => {
  const bot = require("./bot");
  bot.start(config);
  return true;
})