# 📋 KẾ HOẠCH TRIỂN KHAI HỆ THỐNG - PHÂN TÍCH THỰC TẾ

> **Ngày tạo:** 2025-11-18  
> **Dựa trên:** Database schema hiện tại + Business rules đã apply  
> **Trạng thái:** Backend đã fix business rules, thiếu SPs và Audit

---

## 🎯 TÓM TẮT NHANH

### ✅ ĐÃ HOÀN THÀNH
- ✅ **14 bảng database** (Master Data + Transaction Data)
- ✅ **10 triggers** auto-generate primary keys
- ✅ **Controllers:** Tuân thủ 100% business rules (5.1-5.4, 6.2-6.3)
  - Payment immutability ✅
  - State locking (HoSo/Assessment) ✅
  - Contract core fields lock ✅
  - Master data warnings ✅
- ✅ **Routes:** 11 endpoints đăng ký đúng
- ✅ **Error handling:** Centralized middleware

### ❌ THIẾU NGHIÊM TRỌNG (BLOCKING)
- ❌ **6 Stored Procedures** (code gọi nhưng chưa tạo!)
- ❌ **Bảng AuditLog** (cần cho compliance)
- ❌ **Bảng HoSo_XeSnapshot** (cần cho legal snapshot)
- ❌ **Audit triggers** (tự động ghi log thay đổi)

### 🔜 THIẾU CHỨC NĂNG (ENHANCEMENT)
- 🔜 **Master Data Management UI** (MaTranThamDinh, MaTranTinhPhi)
- 🔜 **Audit Log Viewer** (xem lịch sử thay đổi)
- 🔜 **Snapshot Management** (xem trạng thái xe lúc underwriting)

---

## 🚨 PHASE 0: CRITICAL FIX (URGENT - 2 GIỜ)

### **Mục tiêu:** Tạo các SPs và bảng còn thiếu để hệ thống chạy được

### **File đã tạo:**
```
📁 backend/database/
  └── PHASE0_CRITICAL_FIX.sql  ⭐ CHẠY NGAY!
```

### **Nội dung migration:**

#### **1. Tạo 2 bảng mới**
```sql
✅ AuditLog                 -- Lưu lịch sử thay đổi
✅ HoSo_XeSnapshot          -- Snapshot xe + KH tại thời điểm thẩm định
```

#### **2. Tạo 7 Stored Procedures**
```sql
✅ sp_TinhDiemThamDinh      -- Tính điểm rủi ro từ MaTranThamDinh
✅ sp_TaoThanhToan          -- Tạo thanh toán + update contract status
✅ sp_HoanTienHopDong       -- Hoàn tiền + hủy hợp đồng
✅ sp_RenewHopDong          -- Tái tục hợp đồng
✅ sp_ChuyenQuyenHopDong    -- Chuyển quyền sở hữu
✅ sp_LapHopDong_TuHoSo     -- Tạo hợp đồng từ hồ sơ đã duyệt
✅ sp_CreateSnapshot        -- Tạo snapshot xe (helper)
```

#### **3. Tạo 2 Audit Triggers**
```sql
✅ trg_AuditLog_Xe          -- Log thay đổi xe (NamSX, GiaTriXe, LoaiXe...)
✅ trg_AuditLog_KhachHang   -- Log thay đổi khách hàng
```

### **Cách chạy:**

#### **Bước 1: Backup database**
```sql
USE master;
GO
BACKUP DATABASE [QuanlyHDBaoHiem]
TO DISK = 'D:\Backup\QuanlyHDBaoHiem_Before_Phase0.bak'
WITH FORMAT, INIT, NAME = 'Before Phase 0';
GO
```

#### **Bước 2: Chạy migration**
```powershell
# Trong SQL Server Management Studio (SSMS):
# 1. Mở file: backend/database/PHASE0_CRITICAL_FIX.sql
# 2. Kết nối database: QuanlyHDBaoHiem
# 3. Execute (F5)
```

#### **Bước 3: Verify**
```sql
-- Check tables
SELECT name FROM sys.tables WHERE name IN ('AuditLog', 'HoSo_XeSnapshot');

-- Check SPs
SELECT name FROM sys.objects 
WHERE type = 'P' 
AND name LIKE 'sp_%'
ORDER BY name;

-- Check Triggers
SELECT name FROM sys.triggers 
WHERE name LIKE 'trg_Audit%';
```

**Expected output:**
```
✅ 2 tables created
✅ 7 stored procedures created
✅ 2 audit triggers created
```

---

## 📅 PHASE 1: BACKEND ENHANCEMENTS (16 GIỜ)

### **Mục tiêu:** Tạo controllers/routes cho Master Data và Audit Log

### **1.1. Master Data Controllers (8h)**

#### **File cần tạo:**
```
backend/controllers/
  ├── assessmentCriteriaController.js  -- CRUD MaTranThamDinh
  └── pricingMatrixController.js       -- CRUD MaTranTinhPhi

backend/routes/
  ├── assessmentCriteriaRoutes.js
  └── pricingMatrixRoutes.js
```

#### **API Endpoints:**

**Assessment Criteria (Ma trận thẩm định):**
```
GET    /api/criteria          -- Lấy danh sách tiêu chí
GET    /api/criteria/:id      -- Lấy 1 tiêu chí
POST   /api/criteria          -- Tạo tiêu chí mới
PUT    /api/criteria/:id      -- Sửa tiêu chí
DELETE /api/criteria/:id      -- Xóa tiêu chí
```

**Pricing Matrix (Ma trận định phí):**
```
GET    /api/pricing           -- Lấy bảng hệ số phí
GET    /api/pricing/:id       -- Lấy 1 hệ số
POST   /api/pricing           -- Tạo hệ số mới
PUT    /api/pricing/:id       -- Sửa hệ số
DELETE /api/pricing/:id       -- Xóa hệ số
GET    /api/pricing/calculate -- Tính phí theo RiskLevel + MaGoi
```

#### **Code template:**

**assessmentCriteriaController.js:**
```javascript
const { getConnection, sql } = require('../config/database');

class AssessmentCriteriaController {
  async getAll(req, res, next) {
    try {
      const pool = await getConnection();
      const result = await pool.request()
        .query('SELECT * FROM MaTranThamDinh ORDER BY ID');
      
      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { tieuChi, dieuKien, diem, ghiChu } = req.body;
      
      if (!tieuChi || !dieuKien || diem === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin'
        });
      }

      const pool = await getConnection();
      await pool.request()
        .input('tieuChi', sql.NVarChar(80), tieuChi)
        .input('dieuKien', sql.NVarChar(50), dieuKien)
        .input('diem', sql.Int, diem)
        .input('ghiChu', sql.NVarChar(150), ghiChu || null)
        .query(`
          INSERT INTO MaTranThamDinh (TieuChi, DieuKien, Diem, GhiChu)
          VALUES (@tieuChi, @dieuKien, @diem, @ghiChu)
        `);

      res.status(201).json({
        success: true,
        message: 'Tạo tiêu chí thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { tieuChi, dieuKien, diem, ghiChu } = req.body;

      const pool = await getConnection();
      
      const checkExist = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT ID FROM MaTranThamDinh WHERE ID = @id');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tiêu chí'
        });
      }

      await pool.request()
        .input('id', sql.Int, id)
        .input('tieuChi', sql.NVarChar(80), tieuChi)
        .input('dieuKien', sql.NVarChar(50), dieuKien)
        .input('diem', sql.Int, diem)
        .input('ghiChu', sql.NVarChar(150), ghiChu || null)
        .query(`
          UPDATE MaTranThamDinh
          SET TieuChi = @tieuChi,
              DieuKien = @dieuKien,
              Diem = @diem,
              GhiChu = @ghiChu
          WHERE ID = @id
        `);

      res.json({
        success: true,
        message: 'Cập nhật tiêu chí thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      
      // Check nếu đang được dùng
      const checkUsage = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT COUNT(*) as count FROM HoSoThamDinh_ChiTiet WHERE MaTieuChi = @id');

      if (checkUsage.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa tiêu chí đang được sử dụng'
        });
      }

      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM MaTranThamDinh WHERE ID = @id');

      res.json({
        success: true,
        message: 'Xóa tiêu chí thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssessmentCriteriaController();
```

### **1.2. Audit Log Controller (4h)**

#### **File cần tạo:**
```
backend/controllers/
  └── auditLogController.js

backend/routes/
  └── auditLogRoutes.js
```

#### **API Endpoints:**
```
GET /api/audit                 -- Lấy danh sách logs (có phân trang)
GET /api/audit/table/:table    -- Lọc theo bảng
GET /api/audit/record/:id      -- Lịch sử của 1 record
```

#### **Code template:**
```javascript
class AuditLogController {
  async getAll(req, res, next) {
    try {
      const { 
        tableName, 
        recordID, 
        changedBy, 
        fromDate, 
        toDate,
        page = 1, 
        limit = 50 
      } = req.query;

      const offset = (page - 1) * limit;
      const pool = await getConnection();

      let query = `
        SELECT * FROM AuditLog
        WHERE 1=1
      `;
      const request = pool.request();

      if (tableName) {
        query += ` AND TableName = @tableName`;
        request.input('tableName', sql.NVarChar(50), tableName);
      }
      if (recordID) {
        query += ` AND RecordID = @recordID`;
        request.input('recordID', sql.NVarChar(20), recordID);
      }
      if (changedBy) {
        query += ` AND ChangedBy LIKE @changedBy`;
        request.input('changedBy', sql.NVarChar(100), `%${changedBy}%`);
      }
      if (fromDate) {
        query += ` AND ChangedAt >= @fromDate`;
        request.input('fromDate', sql.DateTime, fromDate);
      }
      if (toDate) {
        query += ` AND ChangedAt <= @toDate`;
        request.input('toDate', sql.DateTime, toDate);
      }

      query += `
        ORDER BY ChangedAt DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      // Count total
      let countQuery = `SELECT COUNT(*) as total FROM AuditLog WHERE 1=1`;
      if (tableName) countQuery += ` AND TableName = @tableName`;
      if (recordID) countQuery += ` AND RecordID = @recordID`;
      
      const countRequest = pool.request();
      if (tableName) countRequest.input('tableName', sql.NVarChar(50), tableName);
      if (recordID) countRequest.input('recordID', sql.NVarChar(20), recordID);
      
      const countResult = await countRequest.query(countQuery);

      res.json({
        success: true,
        data: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.recordset[0].total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getByRecord(req, res, next) {
    try {
      const { table, id } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('tableName', sql.NVarChar(50), table)
        .input('recordID', sql.NVarChar(20), id)
        .query(`
          SELECT * FROM AuditLog
          WHERE TableName = @tableName AND RecordID = @recordID
          ORDER BY ChangedAt DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditLogController();
```

### **1.3. Đăng ký routes (2h)**

**backend/server.js:**
```javascript
// Thêm vào phần route registration
const assessmentCriteriaRoutes = require('./routes/assessmentCriteriaRoutes');
const pricingMatrixRoutes = require('./routes/pricingMatrixRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

app.use('/api/criteria', assessmentCriteriaRoutes);
app.use('/api/pricing', pricingMatrixRoutes);
app.use('/api/audit', auditLogRoutes);
```

### **1.4. Testing (2h)**
```bash
# Test assessment criteria
POST http://localhost:5000/api/criteria
{
  "tieuChi": "Tuổi xe",
  "dieuKien": "> 10 năm",
  "diem": 20,
  "ghiChu": "Xe quá cũ tăng rủi ro"
}

# Test audit log
GET http://localhost:5000/api/audit?tableName=Xe&page=1&limit=20
```

---

## 📅 PHASE 2: FRONTEND UI (24 GIỜ)

### **Mục tiêu:** Tạo UI quản lý Master Data và Audit Log

### **2.1. Master Data Management Pages (16h)**

#### **File cần tạo:**
```
frontend/src/pages/
  ├── MasterData/
  │   ├── AssessmentCriteria.js      -- Quản lý tiêu chí thẩm định
  │   ├── PricingMatrix.js           -- Quản lý hệ số phí
  │   └── MasterDataLayout.js        -- Layout chung

frontend/src/components/
  └── MasterData/
      ├── CriteriaForm.js            -- Form thêm/sửa tiêu chí
      ├── CriteriaTable.js           -- Bảng danh sách
      ├── PricingForm.js             -- Form thêm/sửa hệ số
      └── PricingTable.js            -- Bảng hệ số
```

#### **Code template - AssessmentCriteria.js:**
```javascript
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import CriteriaTable from '../../components/MasterData/CriteriaTable';
import CriteriaForm from '../../components/MasterData/CriteriaForm';
import api from '../../services/api';

function AssessmentCriteria() {
  const [criteria, setCriteria] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCriteria();
  }, []);

  const fetchCriteria = async () => {
    try {
      setLoading(true);
      const response = await api.get('/criteria');
      setCriteria(response.data.data);
    } catch (error) {
      console.error('Error fetching criteria:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCriteria(null);
    setOpenForm(true);
  };

  const handleEdit = (item) => {
    setSelectedCriteria(item);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tiêu chí này?')) return;
    
    try {
      await api.delete(`/criteria/${id}`);
      fetchCriteria();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  const handleSave = async (data) => {
    try {
      if (selectedCriteria) {
        await api.put(`/criteria/${selectedCriteria.ID}`, data);
      } else {
        await api.post('/criteria', data);
      }
      setOpenForm(false);
      fetchCriteria();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi lưu');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Quản lý Tiêu chí Thẩm định</Typography>
        <Button variant="contained" onClick={handleCreate}>
          Thêm tiêu chí mới
        </Button>
      </Box>

      <Paper>
        <CriteriaTable
          data={criteria}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Paper>

      <CriteriaForm
        open={openForm}
        data={selectedCriteria}
        onClose={() => setOpenForm(false)}
        onSave={handleSave}
      />
    </Box>
  );
}

export default AssessmentCriteria;
```

### **2.2. Audit Log Viewer (8h)**

#### **File cần tạo:**
```
frontend/src/pages/
  └── AuditLog/
      └── AuditLogViewer.js

frontend/src/components/
  └── AuditLog/
      ├── AuditLogTable.js
      └── AuditLogFilters.js
```

#### **Features:**
- Filter by table name, record ID, date range
- Highlight changes (old value → new value)
- Export to Excel
- Pagination

---

## 📊 PROGRESS TRACKING

### **Checklist:**

#### **Phase 0: Critical Fix (2h)** ⏰ URGENT
- [ ] Backup database
- [ ] Chạy PHASE0_CRITICAL_FIX.sql
- [ ] Verify 2 tables created
- [ ] Verify 7 SPs created
- [ ] Verify 2 triggers created
- [ ] Test 1 endpoint gọi SP (e.g., POST /api/hoso)

#### **Phase 1: Backend (16h)**
- [ ] Create assessmentCriteriaController.js
- [ ] Create pricingMatrixController.js
- [ ] Create auditLogController.js
- [ ] Create routes cho 3 controllers
- [ ] Register routes trong server.js
- [ ] Test với Postman

#### **Phase 2: Frontend (24h)**
- [ ] Create AssessmentCriteria page
- [ ] Create PricingMatrix page
- [ ] Create AuditLogViewer page
- [ ] Add menu items vào MainLayout
- [ ] Integration testing

---

## 🎯 TIMELINE ƯỚC TÍNH

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| **Phase 0: Critical Fix** | 2h | Now | Today |
| **Phase 1: Backend** | 16h | Day 2 | Day 4 |
| **Phase 2: Frontend** | 24h | Day 5 | Day 8 |
| **Testing & Polish** | 8h | Day 9 | Day 10 |
| **TOTAL** | **50h** | - | **~10 days** |

---

## 📝 NEXT STEPS

### **Ngay bây giờ (5 phút):**
1. Đọc file này
2. Mở SQL Server Management Studio
3. Chạy `backend/database/PHASE0_CRITICAL_FIX.sql`
4. Kiểm tra verification output

### **Sau khi Phase 0 xong:**
1. Test API endpoints hiện tại (POST /api/hoso, POST /api/payments)
2. Xác nhận không còn lỗi "Could not find stored procedure"
3. Bắt đầu Phase 1 - tạo controllers

### **Câu hỏi cần trả lời:**
- [ ] Database backup location?
- [ ] Ai có quyền admin SQL Server?
- [ ] Frontend cần design mới hay dùng lại component có sẵn?

---

**🚀 Ready to execute Phase 0!**
