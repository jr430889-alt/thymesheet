@echo off
REM Setup automatic git saves every 30 minutes using Windows Task Scheduler

echo Setting up auto-save for ThymeSheet...
echo This will create a scheduled task that saves your work every 30 minutes.
echo.

REM Get the current directory
set SCRIPT_PATH=%~dp0auto-save.bat

REM Create the scheduled task
schtasks /create /tn "ThymeSheet Auto-Save" /tr "\"%SCRIPT_PATH%\"" /sc minute /mo 30 /f /rl highest

if %errorlevel% equ 0 (
    echo.
    echo ✓ Auto-save successfully configured!
    echo   - Saves every 30 minutes
    echo   - Only saves if there are changes
    echo   - Commits to git with timestamp
    echo.
    echo To disable auto-save later, run: disable-auto-save.bat
) else (
    echo.
    echo ✗ Failed to create auto-save task.
    echo   You may need to run this as Administrator.
)

echo.
pause
