# ThymeSheet - Installation Guide

## For End Users (Simple Installation)

### 🎯 Quick Start
1. **Download** the installer: `ThymeSheet Setup.exe`
2. **Double-click** the installer
3. **Follow** the installation wizard
4. **Launch** ThymeSheet from your desktop or Start menu

That's it! The installer handles everything automatically.

---

## For Developers (Building the Installer)

### 📋 Prerequisites
- **Node.js** (version 16 or later)
- **npm** (comes with Node.js)

### 🚀 Build Instructions

#### Option 1: Quick Build (Recommended)
1. **Double-click** `build-installer.bat`
2. **Wait** for the build to complete (3-5 minutes)
3. **Find** your installer in the `dist` folder: `ThymeSheet Setup.exe`

#### Option 2: Manual Build
```bash
npm install
npm run build-win
```

### 📦 What the Installer Includes
- ✅ **Full ThymeSheet application**
- ✅ **Desktop shortcut**
- ✅ **Start menu entry**
- ✅ **Automatic uninstaller**
- ✅ **ThymeSheet branding and icons**
- ✅ **Windows integration**

### 🎛️ Installer Features
- **Custom installation directory** (user can choose)
- **Progress tracking** during installation
- **Desktop shortcut creation**
- **Start menu integration**
- **Clean uninstallation** option
- **Elevation handling** (admin rights when needed)

### 📁 Output Files
After building, you'll find in the `dist` folder:
- `ThymeSheet Setup.exe` - **Main installer** (distribute this)
- `ThymeSheet-1.0.0-win.exe` - Portable version (optional)

---

## 🔧 Distribution

### For End Users
Simply share the `ThymeSheet Setup.exe` file. Users can:
1. Download it
2. Run it
3. Use ThymeSheet immediately

### Professional Distribution
- Upload to your website
- Share via email
- Distribute on software repositories
- Include in software packages

---

## 🆘 Troubleshooting

### Build Issues
- **"Node.js not found"**: Install Node.js from [nodejs.org](https://nodejs.org/)
- **"Build failed"**: Run `npm install` then try again
- **Permission errors**: Run as administrator

### Installation Issues
- **"Cannot install"**: Run installer as administrator
- **Antivirus blocking**: Add exception for ThymeSheet
- **Already installed**: Uninstall previous version first

---

## 📝 Notes
- The installer is **code-signed ready** (add certificate for production)
- **Windows Defender** may show warnings for unsigned executables
- **File size** is approximately 150-200MB (includes Electron runtime)
- **Supports** Windows 10/11 (64-bit)