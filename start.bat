@echo off
echo ========================================
echo   Salesforce Field Analyzer
echo ========================================
echo.
echo Starting development server...
echo.
echo The browser will open in 8 seconds...
echo http://localhost:5173/SFDC-Field-Extractor/
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the browser opener in background (will wait 8 seconds then open)
start /min wscript.exe "%~dp0open-browser.vbs"

REM Start the development server (this keeps the window open)
npm run dev
