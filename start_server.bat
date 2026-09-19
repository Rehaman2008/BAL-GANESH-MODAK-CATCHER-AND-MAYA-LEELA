@echo off
title Bal Ganesh Modak Catcher - Local Server (Port 5500)
echo Starting Local Web Server at http://127.0.0.1:5500/ ...
start http://127.0.0.1:5500/
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -port 5500
pause
