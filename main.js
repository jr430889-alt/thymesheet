const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut } = require('electron');
const path = require('path');

let mainWindow;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false
  });

  mainWindow.loadFile('Jeremy-Time-Tracker.html');

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
  // Create a simple 16x16 black square as tray icon
  const icon = nativeImage.createEmpty();

  // Create a simple icon programmatically
  const canvas = {
    width: 16,
    height: 16,
    data: Buffer.alloc(16 * 16 * 4) // RGBA
  };

  // Fill with dark pixels to make it visible
  for (let i = 0; i < canvas.data.length; i += 4) {
    canvas.data[i] = 100;     // R
    canvas.data[i + 1] = 100; // G
    canvas.data[i + 2] = 100; // B
    canvas.data[i + 3] = 255; // A
  }

  const trayIcon = nativeImage.createFromBitmap(canvas.data, { width: 16, height: 16 });
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Time Tracker',
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

  tray.setToolTip("Jeremy's Time Tracker");
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register global hotkeys
  const ret = globalShortcut.register('CommandOrControl+Shift+T', () => {
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
    console.log('Registration failed for Ctrl+Shift+T');
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