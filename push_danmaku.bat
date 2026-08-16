@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo [1/2] Compiling danmaku and boss data...
node tools/compile.js
if %errorlevel% neq 0 (
    echo Compilation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Pushing danmaku, boss data, and related assets...
echo.

git add js/danmaku.js js/compiledanmaku.js js/bossdanmakudata.js js/bossdata.js js/bossdanmakucompiledata.js se/ *.png
git commit -m "Update danmaku, boss data, and sound/image assets"
git push origin main

echo.
echo Done!
echo.
cmd /c pause
