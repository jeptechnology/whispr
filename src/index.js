const { app, BrowserWindow } = require("electron");
const path = require("node:path");

webserver = require("./app");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    useContentSize: true,
    icon: path.join(__dirname, "public", "images", "icon.ico"),
  });

  // and load the index.html from the express webserver
  mainWindow.loadURL("http://localhost:3000/");
  // mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.focus();

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const { PostProcessSupportPackage, spdb } = require("./support_package");

// This is the main entry point for the application

PostProcessSupportPackage(path.join(__dirname, "test", "rtos.tgz"), path.join(__dirname, "test", "rtos"));