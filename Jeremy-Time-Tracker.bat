@echo off
cd /d "%~dp0"
if not exist "node_modules\" (
    echo Installing dependencies for first run...
    call npm install
    echo Installation complete! Starting app...
    timeout /t 2 >nul
)
start /b "" npm start
exit