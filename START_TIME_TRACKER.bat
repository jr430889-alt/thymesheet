@echo off
title ChronoTrack - Professional Time Tracking
color 0a
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                       ChronoTrack                            ║
echo  ║                 Professional Time Tracking                  ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

if not exist "node_modules" (
    echo ┌─ First Time Setup ─────────────────────────────────────────┐
    echo │ Installing dependencies...                                 │
    echo │ This usually takes 3-5 minutes depending on your internet  │
    echo │ connection. Please wait...                                 │
    echo └─────────────────────────────────────────────────────────────┘
    echo.
    echo [■□□□□□□□□□] 10%% - Downloading Electron framework...

    call npm install --silent >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ⚠️  Installation failed! Running detailed install...
        call npm install
        if errorlevel 1 (
            echo.
            echo ❌ Installation failed. Please check your internet connection
            echo    and ensure Node.js is installed.
            pause
            exit /b 1
        )
    )

    echo [■■■■■■■■■■] 100%% - Installation complete!
    echo.
    echo ✅ Dependencies installed successfully!
    echo.
    timeout /t 2 /nobreak >nul
)

echo ┌─ Starting Application ─────────────────────────────────────────┐
echo │ Launching ChronoTrack...                                       │
echo │ The application window will open shortly.                     │
echo └─────────────────────────────────────────────────────────────────┘
echo.

call npm start