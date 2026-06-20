@echo off
chcp 65001 > nul
cls
echo ========================================
echo Bitcoin Address Generator Server
echo ========================================
echo.
echo Installing dependencies...
pip install flask flask-cors ecdsa base58 bech32 > nul 2>&1
echo.
echo Starting LOCAL servers...
echo.

rem Запускаем Flask сервер в фоновом режиме
start /B "Flask Server" python server.py
echo Flask API Server started: http://127.0.0.1:5000
echo.

rem Запускаем HTTP сервер в фоновом режиме
start /B "HTTP Server" python -m http.server 8080
echo HTTP Server for HTML started: http://127.0.0.1:8080
echo.

echo ========================================
echo IMPORTANT: Opening browser...
echo     http://localhost:8080/calc.html
echo ========================================
echo.

rem Ждем немного чтобы серверы успели запуститься
timeout /t 0 /nobreak > nul

rem Открываем браузер
start http://localhost:8080/calc.html

echo.
echo Servers are running in background.
echo To stop servers:
echo 1. Close this window
echo 2. Or use Task Manager to kill python.exe processes
echo.
echo Press any key to exit...
pause > nul