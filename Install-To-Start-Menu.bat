@echo off
echo Installing Jeremy's Time Tracker to Start Menu...

set "startMenuPath=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
set "shortcutPath=%startMenuPath%\Jeremy's Time Tracker.lnk"
set "targetPath=%~dp0Jeremy-Time-Tracker.bat"
set "workingDir=%~dp0"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%shortcutPath%'); $s.TargetPath = '%targetPath%'; $s.WorkingDirectory = '%workingDir%'; $s.Save()"

echo Start Menu shortcut created successfully!
echo You can now find "Jeremy's Time Tracker" in your Start Menu.
echo You can also pin it to taskbar by right-clicking the Start Menu item.
pause