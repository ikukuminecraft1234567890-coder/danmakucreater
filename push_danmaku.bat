@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo [1/2] Compiling danmaku...
node tools/compile.js
if %errorlevel% neq 0 (
    echo Compilation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Pushing danmaku.js and compiledanmaku.js...
echo.

git add js/danmaku.js js/compiledanmaku.js
git commit -m "Update danmaku.js and compiledanmaku.js"
git push origin main

echo.
echo Done!
echo.
cmd /c pause
