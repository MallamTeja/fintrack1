@echo off
echo Starting FinTrack Application...

echo Starting Backend Server...
start "FinTrack Backend" cmd /c "cd backend && npm start"

echo Waiting for backend to initialize...
ping 127.0.0.1 -n 6 > nul

echo Starting Frontend Server...
start "FinTrack Frontend" cmd /c "cd frontend && npm start"

echo FinTrack application is starting up!
echo Backend: http://localhost:5001/api
echo Frontend: http://localhost:3000
