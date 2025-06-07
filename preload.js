const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  checkNodeInstalled: () => ipcRenderer.invoke("check-node-installed"),
  getConfig: () => ipcRenderer.invoke("get-config"),
  saveConfig: (config) => ipcRenderer.invoke("save-config", config),
  startBot: (config) => ipcRenderer.invoke("start-bot", config),
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', (_, message) => callback(message))
});
