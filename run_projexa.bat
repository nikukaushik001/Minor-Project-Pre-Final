@echo off
title Grading AI - Demo Mode
echo =======================================================
echo          GRADING AI - DEMO LAUNCHER
echo =======================================================
echo.
echo Starting Backend Systems...

:: Ensure background tasks from previous runs are killed
powershell -Command "$p = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue; if($p) { Stop-Process -Id $p.OwningProcess -Force }"
powershell -Command "$p = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue; if($p) { Stop-Process -Id $p.OwningProcess -Force }"

echo [1/3] Launching FastAPI Backend...
start "Grading AI Backend" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000"

:: Wait a moment for backend to initialize
timeout /t 5 /nobreak >nul

echo [2/3] Checking Frontend Dependencies...
cd frontend
if not exist "node_modules\" (
    echo Installing required UI components...
    npm install
)

echo [3/3] Launching Frontend Interface...
start "Grading AI Frontend" cmd /k "npm run dev"

echo.
echo =======================================================
echo All systems are online. 
echo The Grading AI UI is available at: http://localhost:5173
echo Close this window to keep the servers running in the background.
echo =======================================================
pause
