# ⚡ HƯỚNG DẪN CÀI ĐẶT NHANH

## 🎯 Cài đặt trong 5 phút

### Bước 1: Cài đặt Database

```bash
# Chạy file SQL trong SQL Server Management Studio
# Hoặc dùng command line:
sqlcmd -S localhost -U sa -P YourPassword -i Otoscript.sql
```

### Bước 2: Tạo hash password

```bash
cd backend/scripts
node hashPassword.js
# Copy hash vào seed-data.sql
```

### Bước 3: Tạo dữ liệu mẫu

```bash
sqlcmd -S localhost -U sa -P YourPassword -d QuanlyHDBaoHiem -i backend/database/seed-data.sql
```

### Bước 4: Cấu hình Backend

```bash
cd backend
cp .env.example .env
# Chỉnh sửa .env với thông tin SQL Server
```

### Bước 5: Khởi động

**Windows:**
```bash
start.bat
# Chọn option 3
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
# Chọn option 3
```

## 🎉 Hoàn tất!

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

**Đăng nhập:**
- Username: `admin`
- Password: `admin123`

---

## 🚨 Xử lý lỗi thường gặp

### Lỗi: "Cannot connect to SQL Server"
```bash
# Kiểm tra SQL Server đang chạy
# Bật TCP/IP trong SQL Server Configuration Manager
# Mở port 1433 trong firewall
```

### Lỗi: "Port 3000 already in use"
```bash
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -ti:3000 | xargs kill -9
```

### Lỗi: "Module not found"
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 📞 Hỗ trợ

- Email: dungdt@example.com
- GitHub Issues: [Link repository]
