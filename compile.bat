@echo off
chcp 65001 > nul
node "%~dp0tools\compile.js"
if errorlevel 1 (
    echo.
    echo [ERROR] コンパイル中にエラーが発生しました。
    pause
    exit /b 1
)
echo [SUCCESS] コンパイルが正常に完了しました。
pause
