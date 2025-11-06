#!/bin/bash

# Script khởi động hệ thống quản lý bảo hiểm
# Chạy: ./start.sh hoặc bash start.sh

echo "╔════════════════════════════════════════════════════════╗"
echo "║   🚗 HỆ THỐNG QUẢN LÝ BẢO HIỂM XE CƠ GIỚI           ║"
echo "║   Pearl Holding Group                                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt!"
    echo "Vui lòng cài đặt Node.js từ: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Hỏi người dùng muốn chạy gì
echo "Chọn chế độ chạy:"
echo "1. Chạy Backend only"
echo "2. Chạy Frontend only"
echo "3. Chạy cả Backend và Frontend (khuyến nghị)"
echo ""
read -p "Nhập lựa chọn (1-3): " choice

case $choice in
    1)
        echo "🚀 Khởi động Backend..."
        cd backend
        if [ ! -d "node_modules" ]; then
            echo "📦 Cài đặt dependencies..."
            npm install
        fi
        npm run dev
        ;;
    2)
        echo "🚀 Khởi động Frontend..."
        cd frontend
        if [ ! -d "node_modules" ]; then
            echo "📦 Cài đặt dependencies..."
            npm install
        fi
        npm start
        ;;
    3)
        echo "🚀 Khởi động cả Backend và Frontend..."
        
        # Kiểm tra và cài đặt dependencies cho backend
        if [ ! -d "backend/node_modules" ]; then
            echo "📦 Cài đặt backend dependencies..."
            cd backend && npm install && cd ..
        fi
        
        # Kiểm tra và cài đặt dependencies cho frontend
        if [ ! -d "frontend/node_modules" ]; then
            echo "📦 Cài đặt frontend dependencies..."
            cd frontend && npm install && cd ..
        fi
        
        # Khởi động backend trong background
        echo "🔧 Khởi động Backend..."
        cd backend
        npm run dev &
        BACKEND_PID=$!
        cd ..
        
        # Đợi backend khởi động
        sleep 3
        
        # Khởi động frontend
        echo "🎨 Khởi động Frontend..."
        cd frontend
        npm start
        
        # Cleanup khi thoát
        trap "kill $BACKEND_PID" EXIT
        ;;
    *)
        echo "❌ Lựa chọn không hợp lệ!"
        exit 1
        ;;
esac

echo ""
echo "✨ Hệ thống đang chạy!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "Nhấn Ctrl+C để dừng"
