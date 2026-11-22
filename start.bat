@echo off
setlocal
cd /d "%~dp0"
title TururuCoding

rem Runs the site on this computer only, at http://localhost:5180
rem Progress made here is stored by the browser for that address.
netstat -ano | findstr /R /C:":5180 .*LISTENING" >nul 2>nul
if not errorlevel 1 (
  echo TururuCoding is already running. Opening it in your browser...
  start "" "http://localhost:5180/"
  timeout /t 2 >nul
  exit /b 0
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not on PATH.
  echo Install the LTS version from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

rem Runs every time: it takes a few seconds, and after an update it adds what is new.
echo Checking what the site needs. The first time this takes a minute or two...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo npm install failed. Scroll up for the reason.
  pause
  exit /b 1
)

echo.
echo Starting TururuCoding at http://localhost:5180
echo Keep this window open while you study. Closing the browser tab does not stop it.
echo To stop it, close this window or press Ctrl+C.
echo.
call npm run dev -- --open
pause
