# 🚗 HỆ THỐNG QUẢN LÝ HỢP ĐỒNG BẢO HIỂM XE CƠ GIỚI

**Khóa luận tốt nghiệp - Đỗ Tiến Dũng**  
**Trường: Pearl Holding Group**

---

## 📋 MÔ TẢ DỰ ÁN

Hệ thống quản lý hợp đồng bảo hiểm xe cơ giới được xây dựng với mục tiêu:
- Quản lý thông tin khách hàng, phương tiện, hợp đồng bảo hiểm
- Thẩm định rủi ro tự động dựa trên Decision Table
- Theo dõi và cảnh báo tái tục hợp đồng
- Báo cáo, thống kê doanh thu và hiệu suất

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

### Backend
- **Node.js** v18+ với Express.js
- **SQL Server** 2019+
- **JWT** Authentication
- **Bcrypt** mã hóa mật khẩu
- **MSSQL** driver cho Node.js

### Frontend
- **React.js** v18+
- **Ant Design** UI Framework
- **Chart.js** cho biểu đồ
- **Axios** HTTP client
- **React Router** v6

---

## 📁 CẤU TRÚC DỰ ÁN

```
insurance-management-system/
├── backend/
│   ├── config/
│   │   └── database.js          # Cấu hình SQL Server
│   ├── controllers/
│   │   ├── authController.js    # Xác thực
│   │   ├── customerController.js # Khách hàng
│   │   ├── vehicleController.js  # Phương tiện
│   │   ├── contractController.js # Hợp đồng
│   │   ├── assessmentController.js # Thẩm định
│   │   └── dashboardController.js # Dashboard
│   ├── middleware/
│   │   ├── auth.js              # JWT middleware
│   │   └── errorHandler.js      # Xử lý lỗi
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── contractRoutes.js
│   │   ├── assessmentRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example             # Template environment
│   ├── package.json
│   └── server.js                # Main server file
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Layout/
    │   │       ├── MainLayout.js
    │   │       └── MainLayout.css
    │   ├── contexts/
    │   │   └── AuthContext.js    # Context quản lý auth
    │   ├── pages/
    │   │   ├── Login/
    │   │   │   ├── Login.js
    │   │   │   └── Login.css
    │   │   └── Dashboard/
    │   │       ├── Dashboard.js
    │   │       └── Dashboard.css
    │   ├── services/
    │   │   └── api.js            # API services
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### 1️⃣ YÊU CẦU HỆ THỐNG

- **Node.js** >= 18.x
- **SQL Server** 2019 hoặc mới hơn
- **npm** hoặc **yarn**
- **Git** (để clone project)

### 2️⃣ CÀI ĐẶT DATABASE

#### Bước 1: Tạo database
```sql
-- Chạy file Otoscript.sql trong SQL Server Management Studio
-- Hoặc sử dụng sqlcmd:
sqlcmd -S localhost -U sa -P your_password -i Otoscript.sql
```

#### Bước 2: Tạo tài khoản test (nếu chưa có)
```sql
USE QuanlyHDBaoHiem;
GO

-- Thêm nhân viên
INSERT INTO NhanVien (HoTen, ChucVu, PhongBan, SDT, Email)
VALUES (N'Admin Test', N'Quản trị viên', N'IT', '0123456789', 'admin@pearlholding.com');

-- Lấy MaNV vừa tạo
DECLARE @MaNV VARCHAR(10);
SELECT @MaNV = MaNV FROM NhanVien WHERE Email = 'admin@pearlholding.com';

-- Tạo tài khoản (mật khẩu: admin123)
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro, TrangThai, MaNV)
VALUES ('admin', '$2a$10$YourHashedPasswordHere', N'Admin', N'Hoạt động', @MaNV);
```

> **Lưu ý**: Mật khẩu cần được hash bằng bcrypt. Để tạo hash:
```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('admin123', 10));
```

### 3️⃣ CÀI ĐẶT BACKEND

```bash
cd insurance-management-system/backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa file .env với thông tin SQL Server của bạn
nano .env  # hoặc notepad .env trên Windows
```

**Cấu hình file .env:**
```env
PORT=5000
NODE_ENV=development

# SQL Server Configuration
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=QuanlyHDBaoHiem
DB_USER=sa
DB_PASSWORD=YourStrongPassword123
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4️⃣ CÀI ĐẶT FRONTEND

```bash
cd ../frontend

# Cài đặt dependencies
npm install

# Tạo file .env (nếu cần)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

---

## ▶️ CHẠY ỨNG DỤNG

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# hoặc
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Ứng dụng sẽ chạy tại:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Production Build

**Backend:**
```bash
cd backend
NODE_ENV=production node server.js
```

**Frontend:**
```bash
cd frontend
npm run build
# Sau đó serve folder build/ bằng nginx hoặc serve
npx serve -s build
```

---

## 🔐 THÔNG TIN ĐĂNG NHẬP MẶC ĐỊNH

```
Tên đăng nhập: admin
Mật khẩu: admin123
```

> **Lưu ý bảo mật**: Đổi mật khẩu ngay sau lần đăng nhập đầu tiên!

---

## 📊 CHỨC NĂNG CHÍNH

### 1. **Dashboard**
- Thống kê tổng quan: Tổng hợp đồng, doanh thu, khách hàng
- Biểu đồ doanh thu theo tháng
- Biểu đồ phân bố trạng thái hợp đồng
- Danh sách hoạt động gần đây

### 2. **Quản lý Khách hàng**
- Thêm, sửa, xóa, tìm kiếm khách hàng
- Xem lịch sử hợp đồng của khách hàng
- Thống kê số lượng xe và hợp đồng

### 3. **Quản lý Phương tiện**
- Quản lý thông tin xe: biển số, hãng, loại, năm SX
- Lịch sử tai nạn và bảo dưỡng
- Liên kết với chủ xe

### 4. **Quản lý Hợp đồng**
- Tạo hợp đồng mới
- Cập nhật trạng thái: Hiệu lực, Hết hạn, Hủy
- Tái tục hợp đồng tự động
- Cảnh báo hợp đồng sắp hết hạn

### 5. **Thẩm định Rủi ro**
- Tính điểm rủi ro dựa trên Decision Table:
  - Giá trị xe
  - Loại xe
  - Năm sản xuất
  - Tần suất bảo dưỡng
  - Lịch sử tái tục
- Gợi ý mức phí bổ sung
- Kết quả: Chấp nhận / Từ chối / Có điều kiện

### 6. **Báo cáo - Thống kê**
- Doanh thu theo tháng/quý/năm
- Tỷ lệ tái tục hợp đồng
- Top loại bảo hiểm phổ biến
- Hiệu suất nhân viên
- Phân bố mức độ rủi ro

---

## 🔧 API ENDPOINTS

### Authentication
```
POST   /api/auth/login           # Đăng nhập
GET    /api/auth/profile         # Lấy thông tin user
POST   /api/auth/change-password # Đổi mật khẩu
```

### Customers (Khách hàng)
```
GET    /api/customers            # Danh sách khách hàng
GET    /api/customers/:id        # Chi tiết khách hàng
POST   /api/customers            # Tạo khách hàng mới
PUT    /api/customers/:id        # Cập nhật khách hàng
DELETE /api/customers/:id        # Xóa khách hàng
```

### Vehicles (Phương tiện)
```
GET    /api/vehicles             # Danh sách xe
GET    /api/vehicles/:id         # Chi tiết xe
GET    /api/vehicles/:id/history # Lịch sử xe
POST   /api/vehicles             # Thêm xe mới
PUT    /api/vehicles/:id         # Cập nhật xe
DELETE /api/vehicles/:id         # Xóa xe
```

### Contracts (Hợp đồng)
```
GET    /api/contracts            # Danh sách hợp đồng
GET    /api/contracts/expiring   # Hợp đồng sắp hết hạn
GET    /api/contracts/:id        # Chi tiết hợp đồng
POST   /api/contracts            # Tạo hợp đồng
PUT    /api/contracts/:id        # Cập nhật hợp đồng
POST   /api/contracts/:id/cancel # Hủy hợp đồng
POST   /api/contracts/:id/renew  # Tái tục hợp đồng
```

### Assessments (Thẩm định)
```
GET    /api/assessments                # Danh sách thẩm định
GET    /api/assessments/contract/:maHD # Thẩm định theo hợp đồng
POST   /api/assessments/calculate-risk # Tính điểm rủi ro
POST   /api/assessments                # Tạo thẩm định mới
```

### Dashboard
```
GET    /api/dashboard/overview              # Thống kê tổng quan
GET    /api/dashboard/revenue-by-month      # Doanh thu theo tháng
GET    /api/dashboard/contracts-by-status   # Hợp đồng theo trạng thái
GET    /api/dashboard/top-insurance-types   # Top loại bảo hiểm
GET    /api/dashboard/risk-distribution     # Phân bố rủi ro
GET    /api/dashboard/renewal-rate          # Tỷ lệ tái tục
GET    /api/dashboard/employee-performance  # Hiệu suất nhân viên
GET    /api/dashboard/recent-activities     # Hoạt động gần đây
```

---

## 🧪 TESTING

### Test API với curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tenDangNhap":"admin","matKhau":"admin123"}'

# Get customers (với token)
curl http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test với Postman:
1. Import collection từ `postman_collection.json` (nếu có)
2. Set environment variable `base_url` = `http://localhost:5000/api`
3. Đăng nhập để lấy token
4. Thêm token vào Authorization header cho các request khác

---

## 🐛 TROUBLESHOOTING

### Lỗi kết nối SQL Server:
```
Error: Failed to connect to SQL Server
```
**Giải pháp:**
1. Kiểm tra SQL Server đang chạy
2. Xác nhận thông tin trong `.env` đúng
3. Bật TCP/IP trong SQL Server Configuration Manager
4. Mở port 1433 trong firewall

### Lỗi CORS:
```
Access-Control-Allow-Origin error
```
**Giải pháp:**
- Kiểm tra `CORS_ORIGIN` trong `.env` backend
- Đảm bảo frontend chạy đúng port 3000

### Lỗi JWT:
```
Token invalid or expired
```
**Giải pháp:**
- Đăng xuất và đăng nhập lại
- Kiểm tra `JWT_SECRET` trong `.env`
- Clear localStorage trong browser

---

## 📦 DEPENDENCIES

### Backend
```json
{
  "express": "^4.18.2",
  "mssql": "^10.0.1",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "helmet": "^7.1.0",
  "morgan": "^1.10.0",
  "compression": "^1.7.4",
  "express-rate-limit": "^7.1.5"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "antd": "^5.12.1",
  "axios": "^1.6.2",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "dayjs": "^1.11.10"
}
```

---

## 📝 TODO / FUTURE IMPROVEMENTS

- [ ] Thêm module thanh toán trực tuyến
- [ ] Tích hợp Email/SMS notification
- [ ] Export báo cáo Excel/PDF
- [ ] Upload và quản lý tài liệu hợp đồng
- [ ] Tích hợp e-signature
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics với AI/ML

---

## 👨‍💻 TÁC GIẢ

**Đỗ Tiến Dũng**  
Mã SV: 11221476  
Trường: [Tên trường]  
Email: dungdt@example.com

---

## 📄 GIẤY PHÉP

MIT License - Xem file LICENSE để biết thêm chi tiết.

---

## 🙏 LỜI CẢM ƠN

Cảm ơn:
- Giảng viên hướng dẫn
- Pearl Holding Group
- Cộng đồng open source

---

**Chúc bạn triển khai thành công! 🚀**
