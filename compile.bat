@echo off
node "%~dp0tools\compile.js"
if errorlevel 1 (
    echo [ERROR] Compile failed.
    pause
    exit /b 1
)
echo [SUCCESS] Compile done. Closing in 3 seconds...
timeout /t 3 /nobreak > nul
