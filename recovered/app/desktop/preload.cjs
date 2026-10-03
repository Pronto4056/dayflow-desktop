const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dayflowDesktop", {
  getAppInfo: () => ipcRenderer.invoke("dayflow:get-app-info"),
});
