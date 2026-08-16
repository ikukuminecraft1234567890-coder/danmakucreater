@echo off
node tools/compile.js
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] コンパイル中にエラーが発生しました。
    pause
)
