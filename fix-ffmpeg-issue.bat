@echo off
title ThymeSheet - Fix ffmpeg.dll Issue
color 0c
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                ThymeSheet - Fixing ffmpeg.dll               ║
echo  ║                    Dependency Issues                        ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo ┌─ Diagnosing Issue ──────────────────────────────────────────────┐
echo │ Checking ffmpeg.dll and dependencies...                       │
echo └─────────────────────────────────────────────────────────────────┘
echo.

cd "dist\win-unpacked"

if not exist "ThymeSheet.exe" (
    echo ❌ ThymeSheet.exe not found!
    echo    Please build the application first.
    pause
    exit /b 1
)

if not exist "ffmpeg.dll" (
    echo ❌ ffmpeg.dll missing from build!
    echo    This indicates a build problem.
) else (
    echo ✅ ffmpeg.dll found (size:
    dir ffmpeg.dll | find "ffmpeg.dll"
)

echo.
echo ┌─ Common Solutions ──────────────────────────────────────────────┐
echo │ Trying multiple fixes for ffmpeg.dll issues...                │
echo └─────────────────────────────────────────────────────────────────┘
echo.

echo 🔧 Solution 1: Creating proper launcher...
echo @echo off > Launch-ThymeSheet.bat
echo cd /d "%%~dp0" >> Launch-ThymeSheet.bat
echo set PATH=%%PATH%%;%%~dp0 >> Launch-ThymeSheet.bat
echo start "" "ThymeSheet.exe" >> Launch-ThymeSheet.bat
echo ✅ Created Launch-ThymeSheet.bat

echo.
echo 🔧 Solution 2: Setting up environment...
set PATH=%PATH%;%CD%

echo.
echo 🔧 Solution 3: Checking Windows dependencies...
echo    This system needs Visual C++ Redistributable.
echo    Most modern Windows systems have this, but if not:
echo    Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe

echo.
echo 🔧 Solution 4: Alternative launch method...
echo Creating direct launch shortcut...

powershell -command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%CD%\ThymeSheet.lnk'); $s.TargetPath = '%CD%\ThymeSheet.exe'; $s.WorkingDirectory = '%CD%'; $s.Save()"

if exist "ThymeSheet.lnk" (
    echo ✅ Created ThymeSheet.lnk shortcut with proper working directory
) else (
    echo ⚠️  Shortcut creation failed
)

echo.
echo ┌─ Testing Solutions ─────────────────────────────────────────────┐
echo │ Ready to test ThymeSheet...                                    │
echo └─────────────────────────────────────────────────────────────────┘
echo.

echo 📋 Try these methods in order:
echo.
echo 1️⃣  Double-click "Launch-ThymeSheet.bat"
echo 2️⃣  Double-click "ThymeSheet.lnk"
echo 3️⃣  Right-click ThymeSheet.exe → "Run as administrator"
echo 4️⃣  If still failing, install Visual C++ Redistributable
echo.

echo 🔍 If none work, the issue may be:
echo    • Missing Visual C++ Runtime
echo    • Antivirus blocking execution
echo    • Corrupted build files
echo.

echo Opening folder for testing...
start explorer .

pause