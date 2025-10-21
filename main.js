const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');

// Request single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // If we didn't get the lock, another instance is running
  // Quit this instance immediately
  app.quit();
} else {
  // We got the lock, this is the main instance
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

let mainWindow;
let tray;

// Data storage path - survives uninstall/reinstall
const userDataPath = path.join(app.getPath('documents'), 'ThymeSheet');
const dataFilePath = path.join(userDataPath, 'thymesheet-data.json');
const licenseFilePath = path.join(userDataPath, 'thymesheet-license.dat');

// Ensure data directory exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

// Get hardware ID for license binding
function getHardwareId() {
  const networkInterfaces = os.networkInterfaces();
  let macAddress = '';

  // Get the first non-internal MAC address
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
        macAddress = iface.mac;
        break;
      }
    }
    if (macAddress) break;
  }

  // Combine MAC address with OS info for more uniqueness
  const hwString = `${macAddress}-${os.platform()}-${os.hostname()}`;
  return crypto.createHash('sha256').update(hwString).digest('hex');
}

// Secret for license key validation
// Plain text to avoid false malware detection (base64 encoding looks suspicious)
const LICENSE_SECRET = 'ThymeSheetSecretKey2024!';

// Cryptographic license key validation
function validateLicenseKeyFormat(licenseKey) {
  // Expected format: THYME-XXXX-XXXX-XXXX
  const parts = licenseKey.split('-');

  if (parts.length !== 4 || parts[0] !== 'THYME') {
    return false;
  }

  // Each part should be 4 characters (alphanumeric)
  for (let i = 1; i < 4; i++) {
    if (parts[i].length !== 4 || !/^[A-Z0-9]+$/.test(parts[i])) {
      return false;
    }
  }

  return true;
}

function verifyLicenseKey(licenseKey) {
  if (!validateLicenseKeyFormat(licenseKey)) {
    return false;
  }

  const parts = licenseKey.split('-');
  const part1 = parts[1];
  const part2 = parts[2];
  const checksum = parts[3];

  // Calculate expected checksum
  const data = LICENSE_SECRET + part1 + part2;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  const expectedChecksum = hash.substring(0, 4).toUpperCase();

  return checksum === expectedChecksum;
}

// Validate and activate license
function validateAndActivateLicense(licenseKey) {
  // Check if key format and checksum are valid
  if (!verifyLicenseKey(licenseKey)) {
    return { valid: false, error: 'Invalid license key' };
  }

  const hardwareId = getHardwareId();

  // Check if license file exists
  if (fs.existsSync(licenseFilePath)) {
    try {
      const licenseData = JSON.parse(fs.readFileSync(licenseFilePath, 'utf8'));

      // Check if this hardware already has a license
      if (licenseData.hardwareId === hardwareId) {
        // Same computer, license is valid
        return { valid: true };
      } else {
        // Different computer, check if it's the same key
        if (licenseData.licenseKey === licenseKey) {
          return { valid: false, error: 'This license key has already been activated on another computer' };
        }
      }
    } catch (error) {
      console.error('Error reading license file:', error);
    }
  }

  // New activation - bind license to this hardware
  const licenseData = {
    licenseKey: licenseKey,
    hardwareId: hardwareId,
    activatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(licenseFilePath, JSON.stringify(licenseData, null, 2));
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Failed to activate license' };
  }
}

// Check if license is valid
function checkLicense() {
  if (!fs.existsSync(licenseFilePath)) {
    return { valid: false };
  }

  try {
    const licenseData = JSON.parse(fs.readFileSync(licenseFilePath, 'utf8'));
    const hardwareId = getHardwareId();

    // Verify hardware ID matches and key is valid
    if (licenseData.hardwareId === hardwareId && verifyLicenseKey(licenseData.licenseKey)) {
      return { valid: true };
    } else {
      return { valid: false, error: 'License is not valid for this computer' };
    }
  } catch (error) {
    return { valid: false, error: 'License file is corrupted' };
  }
}

// Get a random key from the embedded key pool
function getKeyFromPool() {
  try {
    const keyPoolPath = path.join(__dirname, 'license-key-pool.json');

    if (!fs.existsSync(keyPoolPath)) {
      return { success: false, error: 'Key pool not found' };
    }

    const keyPool = JSON.parse(fs.readFileSync(keyPoolPath, 'utf8'));

    if (!keyPool.keys || keyPool.keys.length === 0) {
      return { success: false, error: 'No keys available in pool' };
    }

    // Pick a random key from the pool
    const randomIndex = Math.floor(Math.random() * keyPool.keys.length);
    const selectedKey = keyPool.keys[randomIndex];

    return { success: true, key: selectedKey };
  } catch (error) {
    console.error('Error reading key pool:', error);
    return { success: false, error: 'Failed to read key pool' };
  }
}

// IPC Handlers for license operations
ipcMain.handle('check-license', () => {
  return checkLicense();
});

ipcMain.handle('get-key-from-pool', () => {
  return getKeyFromPool();
});

ipcMain.handle('activate-license', (_event, licenseKey) => {
  return validateAndActivateLicense(licenseKey);
});

// IPC Handlers for data operations
ipcMain.handle('load-data', () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: true, data: null };
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

ipcMain.handle('export-data', async () => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export All Data',
      defaultPath: `thymesheet-backup-${timestamp}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (filePath && fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      fs.writeFileSync(filePath, data, 'utf8');
      return { success: true, path: filePath };
    }
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-data', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Data',
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (filePaths && filePaths.length > 0) {
      const data = fs.readFileSync(filePaths[0], 'utf8');
      // Validate it's proper JSON
      JSON.parse(data);
      // Copy to main data file
      fs.writeFileSync(dataFilePath, data, 'utf8');
      return { success: true };
    }
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-data-location', () => {
  return userDataPath;
});

// Browse CSV file handler
ipcMain.handle('browse-csv-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'CSV Files', extensions: ['csv', 'txt'] }
      ]
    });

    if (result.canceled) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf8');

    return {
      success: true,
      path: filePath,
      content: content
    };
  } catch (error) {
    console.error('Browse CSV error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Auto-updater configuration
// Disabled automatic behaviors to prevent false malware detection
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
  mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info);
  mainWindow.webContents.send('update-not-available', info);
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
  mainWindow.webContents.send('update-error', err.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log('Download progress:', progressObj);
  mainWindow.webContents.send('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info);
  mainWindow.webContents.send('update-downloaded', info);
});

// IPC handlers for update actions
ipcMain.handle('download-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('check-for-updates', () => {
  autoUpdater.checkForUpdates();
});

function createWindow() {
  // Load icon as nativeImage for better quality in taskbar
  const appIcon = nativeImage.createFromPath(path.join(__dirname, 'icon.ico'));

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: appIcon,
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

  // Create application menu
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export All Data...',
          accelerator: 'CommandOrControl+E',
          click: () => {
            mainWindow.webContents.send('export-data-request');
          }
        },
        {
          label: 'Import Data...',
          accelerator: 'CommandOrControl+I',
          click: () => {
            mainWindow.webContents.send('import-data-request');
          }
        },
        { type: 'separator' },
        {
          label: 'Show Data Folder',
          click: () => {
            require('electron').shell.openPath(userDataPath);
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CommandOrControl+Q',
          click: () => {
            app.isQuiting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
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
        { role: 'reload' },
        { role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        {
          label: 'Hide to Tray',
          accelerator: 'CommandOrControl+H',
          click: () => {
            mainWindow.hide();
          }
        }
      ]
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Time Rounding',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        {
          label: 'Auto-Pause Detection',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        {
          label: 'Daily Goal',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        {
          label: 'Daily Progress',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        {
          label: 'Time Summary Widget',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'All Settings...',
          accelerator: 'CommandOrControl+,',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Getting Started Guide',
          click: () => {
            mainWindow.webContents.send('show-guide');
          }
        },
        { type: 'separator' },
        {
          label: 'Send Feedback...',
          accelerator: 'CommandOrControl+Shift+F',
          click: () => {
            mainWindow.webContents.send('show-feedback');
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates...',
          click: () => {
            mainWindow.webContents.send('manual-check-for-updates');
          }
        },
        { type: 'separator' },
        {
          label: 'About ThymeSheet',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About ThymeSheet',
              message: 'ThymeSheet',
              detail: 'A professional time tracking application\n\nVersion 2.1.9'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Uncomment the line below to open DevTools for debugging
  // mainWindow.webContents.openDevTools();

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

function createTray() {
  // Load the ThymeSheet tray icon
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'icon.ico'));
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show ThymeSheet',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Start/Stop Timer',
      click: () => {
        // Send a message to the renderer process to toggle timer
        mainWindow.webContents.send('toggle-timer');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip("ThymeSheet");
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  // Listen for tray tooltip updates from renderer
  ipcMain.on('update-tray-tooltip', (event, tooltipText) => {
    if (tray) {
      tray.setToolTip(tooltipText);
    }
  });
}

app.whenReady().then(() => {
  // Set App User Model ID for Windows taskbar icon grouping
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.jeremy.thymesheet');
  }

  createWindow();
  createTray();

  // Auto-update disabled on startup to prevent false malware detection
  // Users can check for updates manually via Help menu
  // setTimeout(() => {
  //   autoUpdater.checkForUpdates();
  // }, 3000);

  // Register global hotkeys
  const ret = globalShortcut.register('CommandOrControl+Shift+Z', () => {
    console.log('Hotkey triggered - Window visible:', mainWindow.isVisible(), 'Window focused:', mainWindow.isFocused());

    if (mainWindow.isVisible() && mainWindow.isFocused()) {
      // If window is visible and focused, hide it
      console.log('Hiding window');
      mainWindow.hide();
    } else {
      // If window is hidden or not focused, show and focus it
      console.log('Showing and focusing window');
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      mainWindow.setAlwaysOnTop(false); // This brings it to front
    }
  });

  const ret2 = globalShortcut.register('CommandOrControl+Shift+Space', () => {
    console.log('Timer toggle hotkey triggered');

    // Make sure window is visible when toggling timer
    if (!mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }

    // Toggle timer with hotkey
    mainWindow.webContents.send('toggle-timer');
  });

  if (!ret) {
    console.log('Registration failed for Ctrl+Shift+Z');
  }

  if (!ret2) {
    console.log('Registration failed for Ctrl+Shift+Space');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});