const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Demo mode flag - NEVER commit this file
const IS_DEMO_MODE = true;

let mainWindow;
let floatingTimerWindow;
let tray;

// Use temporary demo data location
const demoDataPath = path.join(os.tmpdir(), 'ThymeSheet-Demo');
const dataFilePath = path.join(demoDataPath, 'thymesheet-data.json');

// Ensure demo data directory exists
if (!fs.existsSync(demoDataPath)) {
  fs.mkdirSync(demoDataPath, { recursive: true });
}

// Create clean demo data with sample projects
const demoData = {
  projects: [
    {
      id: Date.now() + 1,
      name: "Sample Project A",
      color: "#4CAF50",
      sessions: []
    },
    {
      id: Date.now() + 2,
      name: "Sample Project B",
      color: "#2196F3",
      sessions: []
    },
    {
      id: Date.now() + 3,
      name: "Sample Project C",
      color: "#FF9800",
      sessions: []
    }
  ],
  settings: {
    roundingInterval: 15,
    autoPauseEnabled: false,
    autoPauseThreshold: 5,
    dailyGoal: 8,
    dailyProgressEnabled: true,
    timeSummaryEnabled: true,
    floatingTimerEnabled: false
  }
};

// Initialize with clean demo data
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify(demoData, null, 2), 'utf8');
}

// IPC Handlers for data operations (demo mode)
ipcMain.handle('load-data', () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: true, data: demoData };
  } catch (error) {
    console.error('Error loading data:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-data', (event, data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving data:', error);
    return { success: false, error: error.message };
  }
});

// Dummy handlers for features not needed in demo
ipcMain.handle('check-license', () => {
  return { valid: true }; // Always valid in demo
});

ipcMain.handle('export-data', async () => {
  return { success: false, error: 'Export disabled in demo mode' };
});

ipcMain.handle('import-data', async () => {
  return { success: false, error: 'Import disabled in demo mode' };
});

ipcMain.handle('get-data-location', () => {
  return demoDataPath;
});

ipcMain.handle('browse-csv-file', async () => {
  return { success: false, error: 'CSV import disabled in demo mode' };
});

// Floating timer window functions
function createFloatingTimerWindow() {
  if (floatingTimerWindow) return;

  const {screen} = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const {width, height} = primaryDisplay.workAreaSize;

  floatingTimerWindow = new BrowserWindow({
    width: 352,
    height: 135,
    x: width - 362,
    y: height - 145,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  floatingTimerWindow.loadFile('floating-timer.html');
  floatingTimerWindow.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
  floatingTimerWindow.setAlwaysOnTop(true, 'floating', 1);

  floatingTimerWindow.on('closed', () => {
    floatingTimerWindow = null;
  });
}

function closeFloatingTimerWindow() {
  if (floatingTimerWindow) {
    floatingTimerWindow.close();
    floatingTimerWindow = null;
  }
}

function showFloatingTimerWindow() {
  if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
    floatingTimerWindow.show();
  }
}

function hideFloatingTimerWindow() {
  if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
    floatingTimerWindow.hide();
  }
}

// IPC handlers for floating timer
let floatingTimerEnabled = false;
let isMainWindowMinimized = false;

ipcMain.on('toggle-floating-timer', (event, enabled) => {
  floatingTimerEnabled = enabled;
  if (!enabled) {
    closeFloatingTimerWindow();
  }
});

ipcMain.on('update-floating-timer', (event, timerData) => {
  if (floatingTimerEnabled) {
    if (!floatingTimerWindow || floatingTimerWindow.isDestroyed()) {
      createFloatingTimerWindow();
      if (!isMainWindowMinimized) {
        hideFloatingTimerWindow();
      }
    }

    if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
      floatingTimerWindow.webContents.send('timer-update', timerData);
    }
  } else {
    closeFloatingTimerWindow();
  }
});

ipcMain.on('minimize-floating-timer', () => {
  hideFloatingTimerWindow();
});

ipcMain.on('close-floating-timer', () => {
  closeFloatingTimerWindow();
});

// Dummy auto-update handlers
ipcMain.handle('check-for-updates', () => {
  console.log('Updates disabled in demo mode');
});

function createWindow() {
  const appIcon = nativeImage.createFromPath(path.join(__dirname, 'icon.ico'));

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: appIcon,
    title: 'ThymeSheet - DEMO MODE',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      backgroundThrottling: false
    },
    show: false,
    backgroundColor: '#ffffff'
  });

  mainWindow.loadFile('Jeremy-Time-Tracker.html');

  // Simple menu for demo
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit Demo',
          accelerator: 'CommandOrControl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Track Time',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'track');
          }
        },
        {
          label: 'Manage Projects',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'manage');
          }
        },
        { type: 'separator' },
        { role: 'reload' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('minimize', () => {
    isMainWindowMinimized = true;
    if (floatingTimerEnabled && floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
      showFloatingTimerWindow();
    }
  });

  mainWindow.on('restore', () => {
    isMainWindowMinimized = false;
    if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
      hideFloatingTimerWindow();
    }
  });

  mainWindow.on('show', () => {
    isMainWindowMinimized = false;
    if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
      hideFloatingTimerWindow();
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Show demo mode notification
    mainWindow.webContents.executeJavaScript(`
      alert('Demo Mode Active\\n\\nThis window uses temporary data that will not affect your main application.\\n\\nDemo data location: ${demoDataPath.replace(/\\/g, '\\\\')}');
    `);
  });
}

function createTray() {
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'icon.ico'));
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Demo',
      click: () => {
        mainWindow.show();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Demo',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip("ThymeSheet - DEMO");
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  ipcMain.on('update-tray-tooltip', (event, tooltipText) => {
    if (tray) {
      tray.setToolTip(tooltipText + ' - DEMO');
    }
  });
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.jeremy.thymesheet.demo');
  }

  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // Clean up demo data on exit
  try {
    if (fs.existsSync(demoDataPath)) {
      fs.rmSync(demoDataPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Error cleaning up demo data:', error);
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log('Demo Mode Active - Data stored in:', demoDataPath);
