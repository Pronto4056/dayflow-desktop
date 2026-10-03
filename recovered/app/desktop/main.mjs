import { app, BrowserWindow, dialog, ipcMain, session } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const appDataDirectory = path.join(app.getPath("appData"), "DayFlow");

app.setName("DayFlow");
app.setPath("userData", appDataDirectory);
if (process.platform === "win32") app.setAppUserModelId("com.zerotech.dayflow");

let mainWindow;
const hasInstanceLock = app.requestSingleInstanceLock();

if (!hasInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });
}

function createWindow() {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "icon.png")
    : path.join(currentDir, "..", "build", "icon.png");

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 390,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#f4f7f8",
    title: `DayFlow ${app.getVersion()}`,
    icon: iconPath,
    webPreferences: {
      preload: path.join(currentDir, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.webContents.on("will-navigate", event => event.preventDefault());
  mainWindow.webContents.on("did-fail-load", (_event, code, description) => {
    dialog.showErrorBox("DayFlow could not start", `The local interface failed to load (${code}): ${description}`);
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.loadFile(path.join(currentDir, "..", "dist-desktop", "index.html"));
}

ipcMain.handle("dayflow:get-app-info", () => ({
  version: app.getVersion(),
  dataPath: app.getPath("userData"),
  platform: process.platform,
}));

app.whenReady().then(() => {
  if (!hasInstanceLock) return;
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
