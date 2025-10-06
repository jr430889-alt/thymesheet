const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icon.ico'),
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
          label: 'Compact Mode',
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
          label: 'About ThymeSheet',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About ThymeSheet',
              message: 'ThymeSheet',
              detail: 'A professional time tracking application\n\nVersion 2.0'
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
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'trayimage.ico'));
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
  createWindow();
  createTray();

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