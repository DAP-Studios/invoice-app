@echo off
echo ================================================
echo Building Invoice Management System
echo ================================================
echo.

cd /d "%~dp0"

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Building for production...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo ================================================
echo Build complete! Files are in the 'dist' folder
echo ================================================
echo.
echo To preview the build, run: npm run preview
echo.

pause
