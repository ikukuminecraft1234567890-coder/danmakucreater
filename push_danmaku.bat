@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo Pushing danmaku.js...
echo.

git add js/danmaku.js
git commit -m "Update danmaku.js"
git push origin main

echo.
echo Done.
echo.
cmd /c pause
