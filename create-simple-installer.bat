@echo off
title ThymeSheet - Simple Installer Creator
color 0a
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                ThymeSheet Simple Installer                  ║
echo  ║               Creating Self-Extracting EXE                  ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo ┌─ Checking Build ────────────────────────────────────────────────┐
echo │ Looking for built application...                               │
echo └─────────────────────────────────────────────────────────────────┘
echo.

if not exist "dist\win-unpacked\ThymeSheet.exe" (
    echo ❌ ThymeSheet.exe not found in dist\win-unpacked\
    echo    Please run build-installer.bat first to build the app.
    pause
    exit /b 1
)

echo ✅ Found ThymeSheet.exe

echo.
echo ┌─ Creating Installer Archive ───────────────────────────────────┐
echo │ Compressing application files...                               │
echo └─────────────────────────────────────────────────────────────────┘
echo.

if exist "ThymeSheet-Portable.zip" del "ThymeSheet-Portable.zip"

powershell -command "Compress-Archive -Path 'dist\win-unpacked\*' -DestinationPath 'ThymeSheet-Portable.zip' -Force"

if not exist "ThymeSheet-Portable.zip" (
    echo ❌ Failed to create archive
    pause
    exit /b 1
)

echo ✅ Created ThymeSheet-Portable.zip

echo.
echo ┌─ Creating Self-Extracting Installer ───────────────────────────┐
echo │ Building executable installer...                               │
echo └─────────────────────────────────────────────────────────────────┘
echo.

:: Create simple batch installer script
echo @echo off > installer-script.bat
echo title ThymeSheet Installation >> installer-script.bat
echo echo Installing ThymeSheet... >> installer-script.bat
echo echo Please choose installation directory: >> installer-script.bat
echo set /p "INSTALL_DIR=Enter path (or press Enter for default): " >> installer-script.bat
echo if "%%INSTALL_DIR%%"=="" set "INSTALL_DIR=%%USERPROFILE%%\ThymeSheet" >> installer-script.bat
echo mkdir "%%INSTALL_DIR%%" 2^>nul >> installer-script.bat
echo powershell -command "Expand-Archive -Path 'ThymeSheet-Portable.zip' -DestinationPath '%%INSTALL_DIR%%' -Force" >> installer-script.bat
echo echo. >> installer-script.bat
echo echo ✅ ThymeSheet installed to: %%INSTALL_DIR%% >> installer-script.bat
echo echo. >> installer-script.bat
echo echo Creating desktop shortcut... >> installer-script.bat
echo powershell -command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%%USERPROFILE%%\Desktop\ThymeSheet.lnk'); $s.TargetPath = '%%INSTALL_DIR%%\ThymeSheet.exe'; $s.Save()" >> installer-script.bat
echo echo ✅ Desktop shortcut created >> installer-script.bat
echo echo. >> installer-script.bat
echo echo Installation complete! >> installer-script.bat
echo pause >> installer-script.bat

echo ✅ Simple installer ready!

echo.
echo ┌─ Installation Complete ─────────────────────────────────────────┐
echo │ ✅ Files ready for distribution:                                │
echo │                                                                 │
echo │ 📁 dist\win-unpacked\         - Portable version              │
echo │ 📦 ThymeSheet-Portable.zip    - Compressed portable           │
echo │ 📋 installer-script.bat       - Simple installer              │
echo │                                                                 │
echo │ 📖 Users can:                                                  │
echo │    • Run ThymeSheet.exe directly (portable)                   │
echo │    • Extract ThymeSheet-Portable.zip                          │
echo │    • Run installer-script.bat for guided install             │
echo └─────────────────────────────────────────────────────────────────┘
echo.

echo Opening dist folder...
start explorer dist\win-unpacked

pause