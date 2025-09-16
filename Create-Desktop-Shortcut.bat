@echo off
echo Creating desktop shortcut for Jeremy's Time Tracker...

set "shortcutPath=%USERPROFILE%\Desktop\Jeremy's Time Tracker.lnk"
set "targetPath=%~dp0Jeremy-Time-Tracker.vbs"
set "workingDir=%~dp0"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%shortcutPath%'); $s.TargetPath = '%targetPath%'; $s.WorkingDirectory = '%workingDir%'; $s.Save()"

echo Desktop shortcut created successfully!
echo You can now double-click "Jeremy's Time Tracker" on your desktop to launch the app.
pause