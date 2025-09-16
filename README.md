# Jeremy's Time Tracker

A desktop time tracking application built with Electron and React.

## Features

- ✅ **Desktop Application** - Runs as a native desktop app
- ✅ **System Tray Integration** - Minimize to tray, quick access
- ✅ **Global Hotkeys** - Control from anywhere on your system
- ✅ **Project Management** - Organize time by project codes
- ✅ **Data Export** - Export to Excel and QuickBooks formats
- ✅ **Data Persistence** - Your data is saved locally

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your system

### Installation

**Super Easy (Recommended):**
1. Download or clone this repository
2. Double-click `Jeremy-Time-Tracker.vbs` to launch the app
   - First run will auto-install dependencies
   - App launches automatically
   - **No command prompt stays open!**
   - Runs completely in background

**Alternative:** Use `Jeremy-Time-Tracker.bat` if VBS doesn't work

**Install as Regular Windows App:**
1. Double-click `Create-Desktop-Shortcut.bat` for desktop shortcut
2. Double-click `Install-To-Start-Menu.bat` for Start Menu entry
3. Right-click Start Menu entry → "Pin to taskbar" for taskbar access

**Manual Installation:**
   ```bash
   npm install
   npm start
   ```

## Usage

### Global Hotkeys
- **Ctrl+Shift+T** - Show/Hide the application
- **Ctrl+Shift+Space** - Start/Stop timer

### Getting Started
1. Click "Manage Projects" to add your project codes
2. Select a project from the quick switcher
3. Click Start to begin tracking time
4. Use the system tray or hotkeys for quick control

### System Tray
- Look for the gray square icon in your system tray
- Right-click for quick actions:
  - Show Time Tracker
  - Start/Stop Timer
  - Quit

## Export Options
- **Monthly Timesheet** - Detailed Excel-compatible CSV
- **QuickBooks Export** - QBO-ready format for easy import

## Troubleshooting
- Data is saved automatically to localStorage
- Close the window to hide to tray (doesn't quit the app)
- Right-click the tray icon and select "Quit" to fully exit

## Technical Details
- Built with Electron, React, and Tailwind CSS
- Data stored locally in browser localStorage
- No external dependencies or cloud services required
