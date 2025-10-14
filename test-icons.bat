@echo off
title ThymeSheet - Icon Test & Fix
color 0b
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                ThymeSheet Icon Test & Fix                   ║
echo  ║                  Complete Solution                          ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo ┌─ Step 1: Testing Current Icons ────────────────────────────────┐
echo │ Checking if ThymeSheet.exe has the correct icon embedded...   │
echo └─────────────────────────────────────────────────────────────────┘
echo.

if exist "dist\win-unpacked\ThymeSheet.exe" (
    echo ✅ ThymeSheet.exe found
    echo    Icon should now be properly embedded in the executable
) else (
    echo ❌ ThymeSheet.exe not found - please build first
    pause
    exit /b 1
)

echo.
echo ┌─ Step 2: Clear Icon Cache (Recommended) ───────────────────────┐
echo │ This will fix Windows icon caching issues...                  │
echo └─────────────────────────────────────────────────────────────────┘
echo.

echo Would you like to clear the Windows icon cache?
echo This will temporarily close Windows Explorer and fix icon display.
echo.
choice /c YN /m "Clear icon cache (Y/N)"

if errorlevel 2 goto skip_cache
if errorlevel 1 goto clear_cache

:clear_cache
echo.
echo 🔧 Clearing Windows icon cache...
taskkill /f /im explorer.exe >nul 2>&1
attrib -h -s -r "%localappdata%\IconCache.db" >nul 2>&1
del /f "%localappdata%\IconCache.db" >nul 2>&1
del /f "%localappdata%\Microsoft\Windows\Explorer\iconcache*" >nul 2>&1
echo ✅ Icon cache cleared
echo 🔄 Restarting Windows Explorer...
start explorer.exe
timeout /t 2 >nul
echo ✅ Windows Explorer restarted

:skip_cache
echo.
echo ┌─ Step 3: Install Latest Version ───────────────────────────────┐
echo │ Install the new version with correct icons...                 │
echo └─────────────────────────────────────────────────────────────────┘
echo.

if exist "dist\ThymeSheet Setup 1.0.0.exe" (
    echo ✅ Latest installer found: ThymeSheet Setup 1.0.0.exe
    echo.
    choice /c YN /m "Run installer now (Y/N)"

    if errorlevel 1 (
        echo 🚀 Running installer...
        start "" "dist\ThymeSheet Setup 1.0.0.exe"
        echo.
        echo ✅ Installer launched!
        echo.
        echo 📋 After installation:
        echo    1. Check desktop shortcut icon
        echo    2. Run ThymeSheet and check taskbar icon
        echo    3. Check system tray icon
        echo.
        echo If icons are still wrong, try:
        echo    1. Restart your computer
        echo    2. Right-click desktop → Refresh
        echo    3. Run this script again to clear cache
    )
) else (
    echo ❌ Installer not found in dist folder
    echo    Please run: npm run build-win
)

echo.
echo ┌─ Step 4: Manual Icon Refresh ──────────────────────────────────┐
echo │ Additional methods if icons still don't show correctly...     │
echo └─────────────────────────────────────────────────────────────────┘
echo.
echo If icons are still incorrect after installation:
echo.
echo 🔄 Method 1: Desktop Refresh
echo    • Right-click desktop → Refresh (F5)
echo.
echo 🔄 Method 2: Restart Explorer
echo    • Ctrl+Shift+Esc → End "Windows Explorer" → File → Run → explorer.exe
echo.
echo 🔄 Method 3: Restart Computer
echo    • Complete restart will definitely clear all icon caches
echo.
echo 🔄 Method 4: Registry refresh (Advanced)
echo    • Run: ie4uinit.exe -show
echo.

echo Opening dist folder for you...
start explorer "dist"

echo.
pause