@echo off
title Upload Bal Ganesh Game to GitHub
cd /d "%~dp0"
echo ====================================================================
echo Uploading Game to:
echo https://github.com/Rehaman2008/BAL-GANESH-MODAK-CATCHER-AND-MAYA-LEELA
echo ====================================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ====================================================================
    echo [SUCCESS] Your game has been uploaded to GitHub!
    echo ====================================================================
) else (
    echo ====================================================================
    echo If GitHub prompted you in your browser, please complete sign-in and run this again.
    echo ====================================================================
)
echo.
pause
