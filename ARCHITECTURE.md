# 🏗️ KIẾN TRÚC HỆ THỐNG

## 1. Tổng quan kiến trúc

Hệ thống sử dụng kiến trúc **3-Tier Architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│                   (React.js Frontend)                    │
│  - User Interface Components                            │
│  - State Management (Context API)                       │
│  - Routing (React Router)                               │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│                  (Node.js + Express)                     │
│  - API Routes                                           │
│  - Controllers (Business Logic)                         │
│  - Middleware (Auth, Validation, Error Handling)        │
└─────────────────────────────────────────────────────────┘
                          ↕ SQL Queries
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│                    (SQL Server)                          │
│  - Database Tables                                      │
│  - Stored Procedures                                    │
│  - Triggers                                             │
│  - Constraints & Indexes                                │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Chi tiết các tầng

### 2.1 Presentation Layer (Frontend)

**Công nghệ:**
- React.js 18
- Ant Design UI Framework
- Chart.js cho visualization
- Axios cho HTTP requests
- React Router v6 cho routing

**Cấu trúc thư mục:**
```
src/
├── components/       # Reusable components
│   └── Layout/       # Layout components
├── pages/            # Page components
│   ├── Login/
│   ├── Dashboard/
│   ├── Customers/
│   ├── Vehicles/
│   ├── Contracts/
│   └── Assessments/
├── contexts/         # React Context (State Management)
├── services/         # API services
└── utils/            # Utility functions
```

**Flow đăng nhập:**
```
1. User nhập credentials
2. React gửi POST /api/auth/login
3. Backend xác thực và trả về JWT token
4. Frontend lưu token vào localStorage
5. Mọi request sau đều gửi kèm token trong header
```

### 2.2 Application Layer (Backend)

**Công nghệ:**
- Node.js v18+
- Express.js framework
- JWT authentication
- Bcrypt password hashing
- MSSQL driver

**Cấu trúc thư mục:**
```
backend/
├── config/
│   └── database.js      # SQL Server connection
├── controllers/         # Business logic
│   ├── authController.js
│   ├── customerController.js
│   ├── vehicleController.js
│   ├── contractController.js
│   ├── assessmentController.js
│   └── dashboardController.js
├── middleware/
│   ├── auth.js          # JWT verification
│   └── errorHandler.js  # Global error handling
├── routes/              # API routes
└── server.js            # Main entry point
```

**API Security:**
- JWT Token authentication
- Role-based authorization
- Rate limiting
- Helmet.js security headers
- CORS protection
- Input validation

### 2.3 Data Layer (Database)

**Cấu trúc Database:**

**Core Tables:**
```
KhachHang (Customers)
├─ MaKH (PK)
├─ HoTen
├─ CMND_CCCD (UNIQUE)
└─ SDT, Email, DiaChi

Xe (Vehicles)
├─ MaXe (PK)
├─ BienSo (UNIQUE)
├─ MaKH (FK → KhachHang)
└─ HangXe, LoaiXe, NamSX

HopDong (Contracts)
├─ MaHD (PK)
├─ MaKH (FK → KhachHang)
├─ MaXe (FK → Xe)
├─ MaLB (FK → LoaiBaoHiem)
├─ MaNV (FK → NhanVien)
└─ NgayKy, NgayHetHan, PhiBaoHiem

ThamDinh (Assessments)
├─ MaTD (PK)
├─ MaHD (FK → HopDong)
└─ MucDoRuiRo, KetQua

DecisionTable
├─ ID (PK)
├─ TieuChi
├─ DieuKien
└─ Diem
```

**Triggers:**
- `trg_TuDongMaKH` - Auto-generate customer ID
- `trg_TuDongMaXe` - Auto-generate vehicle ID
- `trg_TuDongMaNV` - Auto-generate employee ID
- `trg_KiemTraNgayHopDong` - Validate contract dates
- `trg_NhacTaiTuc` - Auto-mark renewal notification

---

## 3. Data Flow

### 3.1 Tạo hợp đồng mới

```
User → Frontend
  ↓ (Nhập thông tin)
Frontend validates input
  ↓ (POST /api/contracts)
Backend middleware (JWT auth)
  ↓
Controller receives request
  ↓
Query validation
  ↓
Check customer/vehicle exists
  ↓
Generate contract ID
  ↓
Insert into HopDong table
  ↓
Return success + contract ID
  ↓
Frontend shows success message
```

### 3.2 Thẩm định rủi ro

```
User selects vehicle → Frontend
  ↓
POST /api/assessments/calculate-risk
  ↓
Backend Controller
  ↓
Query vehicle information
  ↓
Query vehicle history
  ↓
Load DecisionTable rules
  ↓
Apply rules:
  - Check giá trị xe
  - Check loại xe
  - Check năm sản xuất
  - Check tần suất bảo dưỡng
  - Check tái tục
  ↓
Calculate total risk score
  ↓
Determine risk level:
  ≤ -2: Thấp
  -1 to 2: Trung bình
  ≥ 3: Cao
  ↓
Calculate additional fee
  ↓
Return assessment result
  ↓
Frontend displays result + recommendation
```

---

## 4. Security Architecture

### 4.1 Authentication Flow

```
1. Login Request
   ↓
2. Validate credentials
   ↓
3. Compare hashed password (bcrypt)
   ↓
4. Generate JWT token
   {
     maTK, maNV, tenDangNhap,
     vaiTro, hoTen
   }
   ↓
5. Return token + user info
   ↓
6. Frontend stores in localStorage
   ↓
7. Include in Authorization header:
   "Bearer <token>"
```

### 4.2 Authorization Levels

```
┌──────────────┬─────────┬──────────┬─────────┬────────┐
│   Chức năng  │  Admin  │ Nhân viên│ Thẩm định│ Kế toán│
├──────────────┼─────────┼──────────┼─────────┼────────┤
│ Dashboard    │    ✓    │    ✓     │    ✓    │   ✓    │
│ Khách hàng   │    ✓    │    ✓     │    ✓    │   ✓    │
│ Phương tiện  │    ✓    │    ✓     │    ✓    │   ✓    │
│ Hợp đồng     │    ✓    │    ✓     │    ✓    │   ✓    │
│ Thẩm định    │    ✓    │    ✗     │    ✓    │   ✗    │
│ Tạo thẩm định│    ✓    │    ✗     │    ✓    │   ✗    │
│ Báo cáo tài chính│ ✓   │    ✗     │    ✗    │   ✓    │
│ Quản lý users│    ✓    │    ✗     │    ✗    │   ✗    │
└──────────────┴─────────┴──────────┴─────────┴────────┘
```

---

## 5. Performance Optimization

### 5.1 Database
- Indexes on primary/foreign keys
- Indexed on frequently searched columns (BienSo, CMND_CCCD)
- Connection pooling (max 10 connections)
- Query optimization with proper JOINs

### 5.2 Backend
- Compression middleware
- Rate limiting (100 req/15min)
- Caching frequently accessed data
- Async/await for non-blocking operations

### 5.3 Frontend
- Code splitting với React.lazy
- Memoization với React.memo
- Pagination cho large datasets
- Debouncing search inputs

---

## 6. Error Handling

### 6.1 Backend Error Types

```javascript
ValidationError     → 400 Bad Request
UnauthorizedError   → 401 Unauthorized
ForbiddenError      → 403 Forbidden
NotFoundError       → 404 Not Found
ConflictError       → 409 Conflict
ServerError         → 500 Internal Server Error
```

### 6.2 Frontend Error Handling

```javascript
try {
  const response = await api.call();
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else {
    // Show error message
    message.error(error.response?.data?.message);
  }
}
```

---

## 7. Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│              Production Environment              │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌────────────┐    ┌──────────────┐            │
│  │   Nginx    │───▶│  React Build │            │
│  │  (Port 80) │    │   (Static)   │            │
│  └────────────┘    └──────────────┘            │
│         │                                        │
│         ├─────────────────────┐                 │
│         ▼                     ▼                 │
│  ┌────────────┐        ┌────────────┐          │
│  │  Node.js   │────────│ SQL Server │          │
│  │  Backend   │        │  Database  │          │
│  │ (Port 5000)│        │ (Port 1433)│          │
│  └────────────┘        └────────────┘          │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Deployment Steps:

1. **Build Frontend:**
```bash
cd frontend
npm run build
```

2. **Configure Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /var/www/frontend/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Run Backend with PM2:**
```bash
pm2 start backend/server.js --name insurance-api
pm2 save
pm2 startup
```

---

## 8. Monitoring & Logging

### Logs được lưu tại:
- Backend: Morgan logs HTTP requests
- Database: SQL Server Error Log
- Application: Console logs (production: file logs)

### Metrics theo dõi:
- API response time
- Database query performance
- Error rates
- Active users
- Contract creation rate

---

## 📚 Tài liệu tham khảo

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Documentation](https://react.dev/)
- [Ant Design Components](https://ant.design/)
- [SQL Server Documentation](https://learn.microsoft.com/sql/)
