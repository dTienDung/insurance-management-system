@echo off
chcp 65001 >nul
color 0A

echo ╔════════════════════════════════════════════════════════╗
echo ║   🚗 HỆ THỐNG QUẢN LÝ BẢO HIỂM XE CƠ GIỚI           ║
echo ║   Pearl Holding Group                                  ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Kiểm tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js chưa được cài đặt!
    echo Vui lòng cài đặt Node.js từ: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js đã được cài đặt
echo.

echo Chọn chế độ chạy:
echo 1. Chạy Backend only
echo 2. Chạy Frontend only
echo 3. Chạy cả Backend và Frontend (khuyến nghị)
echo.
set /p choice="Nhập lựa chọn (1-3): "

if "%choice%"=="1" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="3" goto both
echo ❌ Lựa chọn không hợp lệ!
pause
exit /b 1

:backend
echo 🚀 Khởi động Backend...
cd backend
if not exist "node_modules" (
    echo 📦 Cài đặt dependencies...
    call npm install
)
call npm run dev
goto end

:frontend
echo 🚀 Khởi động Frontend...
cd frontend
if not exist "node_modules" (
    echo 📦 Cài đặt dependencies...
    call npm install
)
call npm start
goto end

:both
echo 🚀 Khởi động cả Backend và Frontend...

REM Cài đặt dependencies nếu cần
if not exist "backend\node_modules" (
    echo 📦 Cài đặt backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📦 Cài đặt frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Mở cửa sổ mới cho backend
echo 🔧 Khởi động Backend...
start "Backend - Insurance System" cmd /k "cd backend && npm run dev"

REM Đợi 3 giây
timeout /t 3 /nobreak >nul

REM Khởi động frontend ở cửa sổ hiện tại
echo 🎨 Khởi động Frontend...
cd frontend
call npm start

:end
echo.
echo ✨ Hệ thống đang chạy!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo.
echo Nhấn Ctrl+C để dừng
pause
