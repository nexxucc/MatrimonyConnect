@echo off
echo Checking if server is running...
curl -s http://localhost:5000/api/health > nul 2>&1
if %errorlevel% neq 0 (
    echo Server is not running, starting it...
    cd /d %~dp0..\server
    start cmd /k npm run dev
) else (
    echo Server is already running
)
pause
