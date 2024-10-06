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


// NOTE: The following code is in reference to docker's logdriver plugin API
// https://github.com/docker/go-docker/blob/master/api/types/plugins/logdriver/io.go

const protobuf = require("protobufjs");
const fs = require("fs");

function ReadBigEndian32bit(reader) {
  const buffer = reader.buf;
  const offset = reader.pos;
  const value = buffer[offset] << 24 | buffer[offset + 1] << 16 | buffer[offset + 2] << 8 | buffer[offset + 3];
  reader.pos += 4;
  return value;
}

protobuf.load(__dirname + "/proto/dockerlogs.proto", function (err, root) {
  if (err) throw err;

  // Obtain a message type
  var LogEntry = root.lookupType("LogEntry");

  // Load the file /proto/test.log
  var myFileContents = fs.readFileSync(__dirname + "/proto/container.log");
  var reader = protobuf.Reader.create(myFileContents);

  while (reader.pos < reader.len) {
    
    const length = ReadBigEndian32bit(reader);

    // now that we have the length of this log line, make a note of the current position, and then decode the message
    const oldReaderLength = reader.len;
    reader.len = reader.pos + length;
    var message = LogEntry.decode(reader);
    reader.len = oldReaderLength;

    // We should expect to see the same length as we read in the first 4 bytes
    if (length != ReadBigEndian32bit(reader)) {
      console.log(
        "Length mismatch: " + length + " != " + lengthCheck + " at position " + reader.pos
      );
      break;
    }

    // get timestamp in nanoseconds
    const timestamp = message.timeNano;
    const date = new Date(timestamp / 1000000);
    console.log(date.toISOString() + " " + message.line);
  }
});
