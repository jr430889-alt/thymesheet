@echo off
REM Auto-save script for ThymeSheet
REM This will commit any changes to git automatically

cd /d "%~dp0"

REM Check if there are any changes
git diff --quiet
if %errorlevel% equ 0 (
    echo No changes to save.
    goto :end
)

REM Add all changes
git add Jeremy-Time-Tracker.html main.js package.json

REM Create auto-save commit with timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a:%%b)

git commit -m "Auto-save: %mydate% %mytime%"

echo Changes auto-saved to git!

:end
