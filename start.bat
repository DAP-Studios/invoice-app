@echo off
echo ================================================
echo Invoice Management System - Quick Start
echo ================================================
echo.

echo [1/3] Navigating to project directory...
cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo [2/3] Installing dependencies...
echo This may take a few minutes on first run...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please make sure Node.js is installed
    pause
    exit /b 1
)
echo.

echo [3/3] Starting development server...
echo.
echo ================================================
echo Application will open at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo ================================================
echo.

call npm run dev

pause
