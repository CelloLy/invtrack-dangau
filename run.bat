@echo off
title Menjalankan Inventori Hotel Dangau
color 0A

echo ========================================================
echo        SISTEM INVENTORI HOTEL DANGAU KUBU RAYA
echo ========================================================
echo.
echo [1/2] Menjalankan Backend Server (Port 5000)...
start "Backend Server (Port 5000)" cmd /k "cd /d %~dp0server && npm start"

echo [2/2] Menjalankan Frontend Client (Port 3000)...
start "Frontend Client (Port 3000)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================================
echo   Kedua server berhasil dijalankan!
echo   Buka browser di: http://localhost:3000
echo ========================================================
echo.
pause

