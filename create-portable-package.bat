@echo off
title Creating ThymeSheet Portable Package
color 0a
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           ThymeSheet Portable Package Creator              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo This will create a portable ZIP package you can share...
echo.

REM Create a temp directory for packaging
if exist "thymesheet-portable-temp" rmdir /s /q "thymesheet-portable-temp"
mkdir "thymesheet-portable-temp"

REM Copy the win-unpacked folder
echo Copying application files...
xcopy /E /I /Y "dist\win-unpacked" "thymesheet-portable-temp\ThymeSheet"

REM Create a README
echo Creating README...
echo ThymeSheet v2.0 - Time Tracking Tool > "thymesheet-portable-temp\README.txt"
echo. >> "thymesheet-portable-temp\README.txt"
echo To run: Double-click ThymeSheet.exe >> "thymesheet-portable-temp\README.txt"
echo. >> "thymesheet-portable-temp\README.txt"
echo Your data is saved in: %%APPDATA%%\thymesheet\data.json >> "thymesheet-portable-temp\README.txt"

REM Create ZIP
echo Creating ZIP file...
powershell -command "Compress-Archive -Path 'thymesheet-portable-temp\*' -DestinationPath 'ThymeSheet-v2.0-Portable.zip' -Force"

REM Clean up
echo Cleaning up...
rmdir /s /q "thymesheet-portable-temp"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                     SUCCESS!                                 ║
echo ║                                                              ║
echo ║  Package created: ThymeSheet-v2.0-Portable.zip              ║
echo ║                                                              ║
echo ║  Recipients should:                                         ║
echo ║  1. Extract the ZIP                                         ║
echo ║  2. Run ThymeSheet.exe from the extracted folder           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause
