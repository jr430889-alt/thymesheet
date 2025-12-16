const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut, ipcMain, dialog, powerMonitor } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const XLSX = require('xlsx');

// Load version from package.json
const packageJson = require('./package.json');
const APP_VERSION = packageJson.version;

// Load feature flags and license tiers
const { FEATURES, LICENSE_TIERS, LICENSE_KEY_PREFIXES, TRIAL_DURATION_DAYS } = require('./features.js');

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
let floatingTimerWindow;
let idlePromptWindow;
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
  // Expected format: THYME-TRIL-XXXX-XXXX or THYME-PREM-XXXX-XXXX
  const parts = licenseKey.split('-');

  if (parts.length !== 4 || parts[0] !== 'THYME') {
    return false;
  }

  // Second part should be TRIL or PREM
  if (parts[1] !== 'TRIL' && parts[1] !== 'PREM') {
    return false;
  }

  // Parts 2 and 3 should be 4 characters (alphanumeric)
  if (parts[2].length !== 4 || !/^[A-Z0-9]+$/.test(parts[2])) {
    return false;
  }
  if (parts[3].length !== 4 || !/^[A-Z0-9]+$/.test(parts[3])) {
    return false;
  }

  return true;
}

function verifyLicenseKey(licenseKey) {
  if (!validateLicenseKeyFormat(licenseKey)) {
    return false;
  }

  const parts = licenseKey.split('-');
  const part1 = parts[2]; // After TRIL/PREM
  const part2 = parts[3]; // Checksum

  // Calculate expected checksum
  const data = LICENSE_SECRET + part1;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  const expectedChecksum = hash.substring(0, 4).toUpperCase();

  return part2 === expectedChecksum;
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

// ============================================================================
// NEW: License Tier System (FREE/TRIAL/PREMIUM)
// ============================================================================

// Get current license state and tier
function getCurrentLicenseState() {
  // Check if license file exists
  if (!fs.existsSync(licenseFilePath)) {
    return {
      state: 'new',
      tier: LICENSE_TIERS.FREE,
      needsActivation: true,
      message: 'No License Found'
    };
  }

  try {
    const license = JSON.parse(fs.readFileSync(licenseFilePath, 'utf8'));
    const hardwareId = getHardwareId();

    // Verify hardware ID matches
    if (license.hardwareId !== hardwareId) {
      return {
        state: 'invalid',
        tier: LICENSE_TIERS.FREE,
        error: 'License is not valid for this computer',
        message: 'Invalid License'
      };
    }

    // Verify license key is valid
    if (!verifyLicenseKey(license.licenseKey)) {
      return {
        state: 'invalid',
        tier: LICENSE_TIERS.FREE,
        error: 'License key is corrupted or invalid',
        message: 'Invalid License'
      };
    }

    // Check if premium license
    if (license.licenseKey.includes(`-${LICENSE_KEY_PREFIXES.PREMIUM}-`)) {
      return {
        state: 'premium',
        tier: LICENSE_TIERS.PREMIUM,
        activatedAt: license.activatedAt,
        upgradedAt: license.upgradedAt,
        message: 'Premium License Active'
      };
    }

    // Check if trial license
    if (license.licenseKey.includes(`-${LICENSE_KEY_PREFIXES.TRIAL}-`)) {
      const activatedDate = new Date(license.activatedAt);
      const now = new Date();
      const trialEndDate = new Date(activatedDate);
      trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DURATION_DAYS);

      const daysElapsed = Math.floor((now - activatedDate) / (1000 * 60 * 60 * 24));
      const daysRemaining = TRIAL_DURATION_DAYS - daysElapsed;

      if (now < trialEndDate) {
        // Trial still active
        return {
          state: 'trial',
          tier: LICENSE_TIERS.PREMIUM, // Trial has premium access
          activatedAt: license.activatedAt,
          trialEndsAt: trialEndDate.toISOString(),
          daysRemaining: Math.max(1, daysRemaining),
          message: `Trial: ${Math.max(1, daysRemaining)} day${daysRemaining !== 1 ? 's' : ''} remaining`
        };
      } else {
        // Trial expired
        return {
          state: 'trial_expired',
          tier: LICENSE_TIERS.FREE,
          activatedAt: license.activatedAt,
          trialEndedAt: trialEndDate.toISOString(),
          message: 'Trial Ended - Upgrade to Premium'
        };
      }
    }

    // Unknown license type - default to free
    return {
      state: 'free',
      tier: LICENSE_TIERS.FREE,
      message: 'Free Version'
    };

  } catch (error) {
    console.error('Error reading license file:', error);
    return {
      state: 'error',
      tier: LICENSE_TIERS.FREE,
      error: 'License file is corrupted',
      message: 'License Error'
    };
  }
}

// Activate trial license (called on first launch)
function activateTrial() {
  try {
    // Get trial key from pool
    const keyResult = getKeyFromPool();
    if (!keyResult.success) {
      return { success: false, error: keyResult.error };
    }

    const trialKey = keyResult.key;
    const hardwareId = getHardwareId();
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);

    const licenseData = {
      licenseKey: trialKey,
      licenseType: 'trial',
      hardwareId: hardwareId,
      activatedAt: now.toISOString(),
      trialEndsAt: trialEnd.toISOString()
    };

    fs.writeFileSync(licenseFilePath, JSON.stringify(licenseData, null, 2));

    return {
      success: true,
      message: `Welcome to ThymeSheet! You have ${TRIAL_DURATION_DAYS} days of full Premium access.`,
      daysRemaining: TRIAL_DURATION_DAYS,
      trialEndsAt: trialEnd.toISOString()
    };
  } catch (error) {
    console.error('Error activating trial:', error);
    return { success: false, error: 'Failed to activate trial license' };
  }
}

// Upgrade to premium license
function upgradeToPremium(premiumKey) {
  // Validate premium key format
  if (!premiumKey.includes(`-${LICENSE_KEY_PREFIXES.PREMIUM}-`)) {
    return { success: false, error: 'Invalid premium license key format' };
  }

  // Verify key is valid
  if (!verifyLicenseKey(premiumKey)) {
    return { success: false, error: 'Invalid premium license key' };
  }

  try {
    const hardwareId = getHardwareId();
    const existingLicense = fs.existsSync(licenseFilePath)
      ? JSON.parse(fs.readFileSync(licenseFilePath, 'utf8'))
      : null;

    // Check if this premium key is already activated on different hardware
    if (existingLicense && existingLicense.licenseKey === premiumKey && existingLicense.hardwareId !== hardwareId) {
      return { success: false, error: 'This premium license key has already been activated on another computer' };
    }

    const licenseData = {
      licenseKey: premiumKey,
      licenseType: 'premium',
      hardwareId: hardwareId,
      activatedAt: existingLicense?.activatedAt || new Date().toISOString(),
      upgradedAt: new Date().toISOString()
    };

    fs.writeFileSync(licenseFilePath, JSON.stringify(licenseData, null, 2));

    return {
      success: true,
      message: 'Premium activated! All features unlocked.'
    };
  } catch (error) {
    console.error('Error upgrading to premium:', error);
    return { success: false, error: 'Failed to activate premium license' };
  }
}

// Check if a feature can be accessed based on current tier
function canAccessFeature(featureName) {
  const { tier } = getCurrentLicenseState();
  const requiredTier = FEATURES[featureName];

  if (!requiredTier) {
    console.warn(`Unknown feature: ${featureName}`);
    return false;
  }

  // Free features available to everyone
  if (requiredTier === LICENSE_TIERS.FREE) {
    return true;
  }

  // Premium features require premium tier
  if (requiredTier === LICENSE_TIERS.PREMIUM) {
    return tier === LICENSE_TIERS.PREMIUM;
  }

  return false;
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

// NEW: IPC Handlers for license tier system
ipcMain.handle('get-license-state', () => {
  return getCurrentLicenseState();
});

ipcMain.handle('activate-trial', () => {
  return activateTrial();
});

ipcMain.handle('upgrade-to-premium', (_event, premiumKey) => {
  return upgradeToPremium(premiumKey);
});

ipcMain.handle('can-access-feature', (_event, featureName) => {
  return canAccessFeature(featureName);
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

// Browse CSV/Excel file handler
ipcMain.handle('browse-csv-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Spreadsheet Files', extensions: ['csv', 'txt', 'xlsx', 'xls'] }
      ]
    });

    if (result.canceled) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    const ext = path.extname(filePath).toLowerCase();
    let content;

    // Handle Excel files
    if (ext === '.xlsx' || ext === '.xls') {
      const workbook = XLSX.readFile(filePath);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Convert to CSV format
      content = XLSX.utils.sheet_to_csv(worksheet);
    } else {
      // Handle CSV/TXT files
      content = fs.readFileSync(filePath, 'utf8');
    }

    return {
      success: true,
      path: filePath,
      content: content
    };
  } catch (error) {
    console.error('Browse file error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Floating timer window functions
function createFloatingTimerWindow() {
  if (floatingTimerWindow) {
    console.log('Floating timer window already exists');
    return;
  }

  console.log('Creating floating timer window...');
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
    show: false,  // Create hidden initially
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  floatingTimerWindow.loadFile('floating-timer.html');
  floatingTimerWindow.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
  floatingTimerWindow.setAlwaysOnTop(true, 'floating', 1);

  floatingTimerWindow.on('closed', () => {
    console.log('Floating timer window closed');
    floatingTimerWindow = null;
  });

  floatingTimerWindow.webContents.on('did-finish-load', () => {
    console.log('Floating timer window loaded successfully');
  });

  console.log('Floating timer window created successfully');
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

// Idle prompt window functions
function createIdlePromptWindow() {
  if (idlePromptWindow && !idlePromptWindow.isDestroyed()) {
    idlePromptWindow.focus();
    return;
  }

  const {screen} = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const {width, height} = primaryDisplay.workAreaSize;

  idlePromptWindow = new BrowserWindow({
    width: 400,
    height: 300,
    x: width - 420,
    y: height - 320,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  idlePromptWindow.loadFile('idle-prompt.html');

  idlePromptWindow.on('closed', () => {
    idlePromptWindow = null;
  });
}

function showIdlePrompt(data) {
  createIdlePromptWindow();

  if (idlePromptWindow && !idlePromptWindow.isDestroyed()) {
    idlePromptWindow.webContents.once('did-finish-load', () => {
      idlePromptWindow.webContents.send('idle-prompt-data', data);
    });
  }
}

function closeIdlePromptWindow() {
  if (idlePromptWindow && !idlePromptWindow.isDestroyed()) {
    idlePromptWindow.close();
    idlePromptWindow = null;
  }
}

// IPC handlers for idle prompt
ipcMain.on('show-idle-prompt', (_event, data) => {
  showIdlePrompt(data);
});

ipcMain.on('idle-prompt-response', (_event, response, promptType) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('idle-prompt-action', response, promptType);
  }
  closeIdlePromptWindow();
});

// IPC handler to check if main window is visible
ipcMain.handle('is-main-window-visible', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow.isVisible() && !mainWindow.isMinimized();
  }
  return false;
});

// IPC handler to show and focus main window (for activity reminder)
ipcMain.on('show-main-window', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setAlwaysOnTop(false); // Brings window to front
    windowCycleState = 'main';
    if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
      hideFloatingTimerWindow();
    }
    console.log('[MAIN] Main window shown and focused');
  }
});

// IPC handlers for floating timer
let floatingTimerEnabled = true;  // Enable by default for 3-state cycling
let isMainWindowMinimized = false;

// Window state for 3-state cycling: 'main', 'floating', 'hidden'
let windowCycleState = 'main';

ipcMain.on('toggle-floating-timer', (event, enabled) => {
  floatingTimerEnabled = enabled;
  if (!enabled) {
    closeFloatingTimerWindow();
  }
});

ipcMain.on('update-floating-timer', (event, timerData) => {
  if (floatingTimerEnabled) {
    // Create window if it doesn't exist
    if (!floatingTimerWindow || floatingTimerWindow.isDestroyed()) {
      createFloatingTimerWindow();
      // Only show if main window is minimized
      if (!isMainWindowMinimized) {
        hideFloatingTimerWindow();
      }
    }

    // Send data once window is ready
    if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
      floatingTimerWindow.webContents.send('timer-update', timerData);
    }
  } else {
    // Close window if timer updates come but feature is disabled
    closeFloatingTimerWindow();
  }
});

// Handle minimize button click from floating timer
ipcMain.on('minimize-floating-timer', () => {
  hideFloatingTimerWindow();
});

// Handle close button click from floating timer
ipcMain.on('close-floating-timer', () => {
  closeFloatingTimerWindow();
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
          label: 'Upgrade to Premium...',
          click: () => {
            const licenseState = getCurrentLicenseState();

            // If already premium, show confirmation
            if (licenseState.state === 'premium') {
              const { dialog } = require('electron');
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Premium Active',
                message: 'You already have Premium!',
                detail: 'Your premium license is active. Thank you for your support!',
                buttons: ['OK']
              });
            } else {
              // Show upgrade dialog
              mainWindow.webContents.send('show-upgrade-dialog');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'About ThymeSheet',
          click: () => {
            const { dialog } = require('electron');
            const licenseState = getCurrentLicenseState();

            let licenseInfo = '';
            let buttons = ['Close'];

            // Build license status message
            if (licenseState.state === 'premium') {
              licenseInfo = `\n\nLicense Status: Premium Active ⭐`;
            } else if (licenseState.state === 'trial') {
              licenseInfo = `\n\nLicense Status: Premium Trial\nTrial Expires: ${new Date(licenseState.trialEndsAt).toLocaleDateString()}\n(${licenseState.daysRemaining} day${licenseState.daysRemaining !== 1 ? 's' : ''} remaining)`;
              buttons = ['Upgrade to Premium', 'Close'];
            } else if (licenseState.state === 'trial_expired') {
              licenseInfo = `\n\nLicense Status: Free Version\n(Trial ended)`;
              buttons = ['Upgrade to Premium', 'Close'];
            } else {
              licenseInfo = `\n\nLicense Status: Free Version`;
              buttons = ['Upgrade to Premium', 'Close'];
            }

            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About ThymeSheet',
              message: 'ThymeSheet',
              detail: `A professional time tracking application\n\nVersion ${APP_VERSION}${licenseInfo}`,
              buttons: buttons,
              defaultId: buttons.length - 1,
              cancelId: buttons.length - 1
            }).then(result => {
              // If user clicked "Upgrade to Premium" (button index 0)
              if (result.response === 0 && buttons[0] === 'Upgrade to Premium') {
                // Send message to renderer to show upgrade dialog
                mainWindow.webContents.send('show-upgrade-dialog');
              }
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

  // Handle minimize/restore for floating timer
  mainWindow.on('minimize', () => {
    isMainWindowMinimized = true;
    if (floatingTimerEnabled && floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
      showFloatingTimerWindow();
      windowCycleState = 'floating';
    }
  });

  mainWindow.on('restore', () => {
    isMainWindowMinimized = false;
    windowCycleState = 'main';
    if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
      hideFloatingTimerWindow();
    }
  });

  mainWindow.on('show', () => {
    isMainWindowMinimized = false;
    // Only reset to main if window was actually hidden
    if (windowCycleState === 'hidden') {
      windowCycleState = 'main';
    }
    if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
      hideFloatingTimerWindow();
    }
  });

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
        mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
        windowCycleState = 'main';
        if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
          hideFloatingTimerWindow();
        }
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
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      windowCycleState = 'hidden';
    } else {
      mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
      windowCycleState = 'main';
      if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
        hideFloatingTimerWindow();
      }
    }
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

  // Auto-updater configuration (lazy-loaded after app ready)
  // Disabled automatic behaviors to prevent false malware detection
  const { autoUpdater } = require('electron-updater');
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

  // System power monitor for idle detection
  powerMonitor.on('suspend', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('system-suspend');
    }
  });

  powerMonitor.on('resume', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('system-resume');
    }
  });

  powerMonitor.on('shutdown', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('system-shutdown');
    }
  });

  powerMonitor.on('lock-screen', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('system-lock');
    }
  });

  powerMonitor.on('unlock-screen', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('system-unlock');
    }
  });

  // IPC handler for getting idle state
  ipcMain.handle('get-idle-state', () => {
    return powerMonitor.getSystemIdleState(1);
  });

  // IPC handler for getting idle time
  ipcMain.handle('get-idle-time', () => {
    return powerMonitor.getSystemIdleTime();
  });

  // Background activity monitoring for tracking reminders
  let lastActivityReminderTime = null;
  let isCurrentlyTracking = false;
  let activityReminderSettings = { enabled: false, reminderInterval: 10 };

  // Listen for tracking state updates from renderer
  ipcMain.on('tracking-state-update', (_event, data) => {
    isCurrentlyTracking = data.isTracking;
    activityReminderSettings.enabled = data.activityReminderEnabled || false;
    activityReminderSettings.reminderInterval = data.reminderInterval || 10;
    console.log('[MAIN] Tracking state updated:', {
      isTracking: isCurrentlyTracking,
      activityReminderEnabled: activityReminderSettings.enabled,
      reminderInterval: activityReminderSettings.reminderInterval
    });
  });

  // ACTIVITY REMINDER SERVICE: Check for activity every minute when activity reminders are enabled
  setInterval(() => {
    if (!activityReminderSettings.enabled || isCurrentlyTracking) return;

    const idleTimeSeconds = powerMonitor.getSystemIdleTime();
    const idleTimeMinutes = idleTimeSeconds / 60;

    // If user has been active recently (less than 1 minute idle)
    if (idleTimeMinutes < 1) {
      const now = Date.now();
      const timeSinceLastReminder = lastActivityReminderTime ? now - lastActivityReminderTime : Infinity;
      const reminderIntervalMs = activityReminderSettings.reminderInterval * 60 * 1000;

      // Show reminder if enough time has passed
      if (timeSinceLastReminder > reminderIntervalMs) {
        console.log('[MAIN - ACTIVITY REMINDER] User active but not tracking - showing reminder');
        lastActivityReminderTime = now;
        showIdlePrompt({ type: 'activity-reminder' });
      }
    }
  }, 60000); // Check every minute

  // Auto-update disabled on startup to prevent false malware detection
  // Users can check for updates manually via Help menu
  // setTimeout(() => {
  //   autoUpdater.checkForUpdates();
  // }, 3000);

  // Register global hotkeys - 3-state cycling: main → floating → hidden → main
  let isTogglingWindow = false;
  const ret = globalShortcut.register('CommandOrControl+Shift+Z', () => {
    // Prevent multiple rapid presses with shorter debounce
    if (isTogglingWindow) {
      console.log('Hotkey already processing, ignoring');
      return;
    }

    isTogglingWindow = true;
    const startTime = Date.now();
    console.log('Hotkey triggered - Current state:', windowCycleState);

    if (windowCycleState === 'main') {
      // State 1 → 2: Main window to floating popup at bottom right
      console.log('Cycling: main → floating popup');
      console.log('Floating timer enabled:', floatingTimerEnabled);
      console.log('Floating timer window exists:', floatingTimerWindow ? 'yes' : 'no');

      mainWindow.hide();
      isMainWindowMinimized = true;

      // Show floating timer window in bottom right corner
      if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
        console.log('Showing existing floating timer window');
        showFloatingTimerWindow();
        console.log('Floating timer window visible:', floatingTimerWindow.isVisible());
      } else if (floatingTimerEnabled) {
        // Create floating window if it doesn't exist
        console.log('Creating new floating timer window');
        createFloatingTimerWindow();
        if (floatingTimerWindow) {
          console.log('Showing newly created floating timer window');
          showFloatingTimerWindow();
          console.log('Floating timer window visible:', floatingTimerWindow.isVisible());
        } else {
          console.log('ERROR: Failed to create floating timer window');
        }
      } else {
        console.log('WARNING: Floating timer is disabled');
      }

      windowCycleState = 'floating';
    } else if (windowCycleState === 'floating') {
      // State 2 → 3: Floating popup to completely hidden
      console.log('Cycling: floating → hidden');
      if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
        hideFloatingTimerWindow();
      }
      mainWindow.hide();
      isMainWindowMinimized = true;
      windowCycleState = 'hidden';
    } else {
      // State 3 → 1: Hidden to main window (maximized)
      console.log('Cycling: hidden → main');

      // Hide floating window first
      if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
        hideFloatingTimerWindow();
      }

      // Show and focus main window
      mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      setTimeout(() => {
        mainWindow.setAlwaysOnTop(false);
      }, 100);
      isMainWindowMinimized = false;
      windowCycleState = 'main';
    }

    // Reset flag immediately after state change completes
    const elapsed = Date.now() - startTime;
    console.log(`State transition completed in ${elapsed}ms`);

    // Use shorter debounce - just enough to prevent double-triggers
    setTimeout(() => {
      isTogglingWindow = false;
      console.log('Hotkey ready for next press');
    }, 100);
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
    console.log('ERROR: Registration failed for Ctrl+Shift+Z');
  } else {
    console.log('SUCCESS: Ctrl+Shift+Z hotkey registered');
  }

  if (!ret2) {
    console.log('ERROR: Registration failed for Ctrl+Shift+Space');
  } else {
    console.log('SUCCESS: Ctrl+Shift+Space hotkey registered');
  }

  // Create floating timer window on startup (hidden initially)
  console.log('Creating floating timer window...');
  createFloatingTimerWindow();
  if (floatingTimerWindow && !floatingTimerWindow.isDestroyed()) {
    console.log('SUCCESS: Floating timer window created');
  } else {
    console.log('ERROR: Failed to create floating timer window');
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