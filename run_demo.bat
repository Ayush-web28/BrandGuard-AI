@echo off
title BrandGuard AI Studio
echo ===================================================================
echo   BrandGuard AI - Intelligent Multimodal Brand Governance Studio
echo   Team ZeroToOne (Ayush Trivedi) - CodeZen India 2026
echo ===================================================================
echo.
echo [1/2] Initializing BrandGuard AI Unified Gateway on port 8000...
echo.

cd /d "%~dp0"
set PYTHONPATH=%~dp0backend

:: Launch browser in background after 2 seconds once server is ready
start /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000"

echo [2/2] Server running! Opening http://localhost:8000 in your browser...
echo (Keep this window open while using BrandGuard AI. Press Ctrl+C to stop)
echo.

python backend\app\main.py
pause
