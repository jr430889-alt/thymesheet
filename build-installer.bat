@echo off
title ThymeSheet - Building Installer

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running with administrator privileges
) else (
    echo ⚠️  This script needs administrator privileges to build properly.
    echo    Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)
color 0a
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                    ThymeSheet Installer                     ║
echo  ║                      Build Process                          ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo ┌─ Checking Dependencies ─────────────────────────────────────────┐
echo │ Checking for Node.js and npm...                                │
echo └─────────────────────────────────────────────────────────────────┘
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

echo.
echo ┌─ Cleaning Cache ─────────────────────────────────────────────────┐
echo │ Clearing electron-builder cache...                             │
echo └─────────────────────────────────────────────────────────────────┘
echo.

if exist "%USERPROFILE%\AppData\Local\electron-builder\Cache" (
    rmdir /s /q "%USERPROFILE%\AppData\Local\electron-builder\Cache"
    echo ✅ Cache cleared
) else (
    echo ℹ️  No cache to clear
)

echo.
echo ┌─ Installing Dependencies ───────────────────────────────────────┐
echo │ Running npm install...                                         │
echo └─────────────────────────────────────────────────────────────────┘
echo.

call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ┌─ Building Installer ─────────────────────────────────────────────┐
echo │ Creating Windows installer (.exe)...                           │
echo │ This may take several minutes...                               │
echo └─────────────────────────────────────────────────────────────────┘
echo.

call npm run build-win
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ┌─ Build Complete ─────────────────────────────────────────────────┐
echo │ ✅ Installer created successfully!                              │
echo │                                                                 │
echo │ Location: dist\ThymeSheet Setup.exe                           │
echo │                                                                 │
echo │ You can now distribute this installer to users.               │
echo └─────────────────────────────────────────────────────────────────┘
echo.

echo Opening dist folder...
start explorer dist

pause