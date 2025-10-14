@echo off
REM Disable the auto-save scheduled task

echo Disabling ThymeSheet auto-save...

schtasks /delete /tn "ThymeSheet Auto-Save" /f

if %errorlevel% equ 0 (
    echo ✓ Auto-save has been disabled.
) else (
    echo ✗ Auto-save task not found or already disabled.
)

echo.
pause
