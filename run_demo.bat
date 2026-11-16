@echo off
echo ===================================================================
echo   BrandGuard AI - Intelligent Multimodal Brand Governance Studio
echo   Team ZeroToOne (Ayush Trivedi) - CodeZen India 2026
echo ===================================================================
echo.
echo Starting BrandGuard AI Unified Gateway on http://localhost:8000 ...
echo.

cd /d "%~dp0"
set PYTHONPATH=backend
start "" http://localhost:8000
python backend\app\main.py
pause
