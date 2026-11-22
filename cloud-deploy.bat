@echo off
setlocal
cd /d "%~dp0"
title TururuCoding - Cloudflare

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  echo Install the LTS version from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

rem First time: puts TururuCoding on your Cloudflare account and prints a link for your devices.
rem Later: updates the site; your devices keep their link.
rem "cloud-deploy.bat new-key" makes a new device key (old device links stop working).
node scripts\cloudflare.mjs %*
echo.
pause
