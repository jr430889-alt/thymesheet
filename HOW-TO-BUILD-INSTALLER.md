# How to Build ThymeSheet Installer

## Quick Start

1. **Right-click** on `build-installer.bat`
2. Select **"Run as administrator"**
3. Wait for the build to complete (may take several minutes)
4. The installer will be in the `dist` folder as `ThymeSheet.exe`

## What the Build Script Does

The `build-installer.bat` script will:
- Check for Node.js installation
- Clear any cached files
- Install dependencies
- Create a portable Windows executable

## Requirements

- **Node.js** (download from https://nodejs.org/ if not installed)
- **Administrator privileges** (required for the build process)

## Troubleshooting

### "Node.js not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal/command prompt after installation

### "This script needs administrator privileges"
- Right-click the `build-installer.bat` file
- Select "Run as administrator"

### Build fails
- Delete the `dist` folder and try again
- Clear the cache: `rmdir /s /q "%USERPROFILE%\AppData\Local\electron-builder\Cache"`
- Run `npm install` manually first

## Output

The build creates a portable executable:
- **Location**: `dist\ThymeSheet.exe`
- **Type**: Portable (no installation required)
- **Size**: ~200MB

## Installing ThymeSheet

Once built, simply:
1. Copy `ThymeSheet.exe` from the `dist` folder to any location on your computer
2. Double-click to run
3. (Optional) Create a desktop shortcut

Your data is stored in: `%APPDATA%\thymesheet\data.json`
