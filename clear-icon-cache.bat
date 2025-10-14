@echo off
title ThymeSheet - Clear Windows Icon Cache
echo Clearing Windows icon cache to fix icon display issues...
echo.

echo Stopping Windows Explorer...
taskkill /f /im explorer.exe

echo Clearing icon cache files...
attrib -h -s -r "%localappdata%\IconCache.db"
del /f "%localappdata%\IconCache.db"
del /f "%localappdata%\Microsoft\Windows\Explorer\iconcache*"

echo Restarting Windows Explorer...
start explorer.exe

echo.
echo Icon cache cleared! Desktop and taskbar icons should now update.
echo You may need to refresh your desktop (F5) or restart if icons still don't update.
pause