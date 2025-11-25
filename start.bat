@echo off
echo ========================================
echo   Salesforce Field Analyzer
echo ========================================
echo.
echo Starting development server...
echo.
echo The app will open at:
echo http://localhost:5173/SFDC-Field-Extractor/
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

start http://localhost:5173/SFDC-Field-Extractor/
npm run dev
