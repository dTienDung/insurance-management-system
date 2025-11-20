# 🐛 BÁO CÁO LỖI FRONTEND

**Ngày:** 21/11/2025, 12:48 AM  
**Phạm vi:** Frontend React App  
**Mức độ:** CRITICAL - Ảnh hưởng đến các chức năng chính

---

## 📊 TỔNG QUAN

| Loại lỗi | Số lượng | Mức độ |
|-----------|----------|---------|
| **Field Mapping** | 1 | 🔴 CRITICAL |
| **Status Mapping** | 3 | 🔴 CRITICAL |
| **API Response Format** | 2 | 🟡 MEDIUM |

**Tổng:** 6 lỗi cần sửa

---

## 🔴 LỖI 1: SAI FIELD NAME KHI TÁI TỤC

### File: `frontend/src/pages/Contracts/ContractList.js`

**Line 119:**
```javascript
// ❌ SAI
const result = await contractService.renew(row.MaHD);
alert(`✅ Đã tạo hợp đồng tái tục: ${result.data.MaHD}`); // ❌ SAI field name
```

**Backend trả về:**
```json
{
  "success": true,
  "message": "Tái tục hợp đồng thành công",
  "data": {
    "maHDMoi": "HD-20251121-0001"  // ← Đúng
  }
}
```

**✅ SỬA:**
```javascript
const result = await contractService.renew(row.MaHD);
alert(`✅ Đã tạo hợp đồng tái tục: ${result.data.maHDMoi}`); // ✅ ĐÚNG
```

**Tác động:** Hiển thị `undefined` khi tái tục hợp đồng

---

## 🔴 LỖI 2: SAI STATUS MAPPING - FILTER

### File: `frontend/src/pages/Contracts/ContractList.js`

**Line 61-65:**
```javascript
// ❌ SAI - Dùng tiếng Việt thay vì code
if (activeTab === 1) {
  params.trangThai = 'Chờ ký';  // ❌ Backend không hiểu
} else if (activeTab === 2) {
  params.trangThai = 'Hiệu lực,Hết hạn';  // ❌ Backend không hiểu
}
```

**Backend expects:**
- `ACTIVE` (không phải "Hiệu lực")
- `EXPIRED` (không phải "Hết hạn")
- `DRAFT` (không phải "Chờ ký")

**✅ SỬA:**
```javascript
import { CONTRACT_STATUS } from '../../config';

if (activeTab === 1) {
  params.trangThai = CONTRACT_STATUS.DRAFT;  // 'DRAFT'
} else if (activeTab === 2) {
  params.trangThai = `${CONTRACT_STATUS.ACTIVE},${CONTRACT_STATUS.EXPIRED}`;
}
```

**Tác động:** Không lọc được hợp đồng theo tab

---

## 🔴 LỖI 3: SAI STATUS MAPPING - STATS

### File: `frontend/src/pages/Contracts/ContractList.js`

**Line 75-85:**
```javascript
// ❌ SAI - So sánh với tiếng Việt
setStats({
  active: data.filter(c => c.TrangThai === 'Hiệu lực').length,  // ❌
  pending: data.filter(c => c.TrangThai === 'Chờ ký' || c.TrangThai === 'Chờ duyệt').length,  // ❌
  expiring: data.filter(c => {
    // ...
  }).length
});
```

**Backend trả về:** `TrangThai: 'ACTIVE'`, không phải `'Hiệu lực'`

**✅ SỬA:**
```javascript
import { CONTRACT_STATUS } from '../../config';

setStats({
  active: data.filter(c => c.TrangThai === CONTRACT_STATUS.ACTIVE).length,
  pending: data.filter(c => 
    c.TrangThai === CONTRACT_STATUS.DRAFT || 
    c.TrangThai === CONTRACT_STATUS.PENDING_PAYMENT
  ).length,
  expiring: data.filter(c => {
    if (!c.NgayHetHan) return false;
    const daysLeft = Math.floor((new Date(c.NgayHetHan) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 15 && c.TrangThai === CONTRACT_STATUS.ACTIVE;
  }).length
});
```

**Tác động:** Stats hiển thị 0 (sai số liệu)

---

## 🔴 LỖI 4: HARDCODE STATUS CHIP

### File: `frontend/src/pages/Contracts/ContractList.js`

**Line 168-177:**
```javascript
// ❌ Hardcode, không dùng config
const getStatusChip = (status) => {
  const map = {
    'Hiệu lực': { color: 'success', label: 'Hiệu lực' },
    'Hết hạn': { color: 'default', label: 'Hết hạn' },
    'Chờ ký': { color: 'warning', label: 'Chờ ký' },
    // ...
  };
  // ...
};
```

**Backend trả về:** `ACTIVE`, `EXPIRED`, `DRAFT`, etc.

**✅ SỬA:**
```javascript
import { CONTRACT_STATUS_TEXT, CONTRACT_STATUS_COLOR } from '../../config';

const getStatusChip = (status) => {
  return (
    <Chip 
      label={CONTRACT_STATUS_TEXT[status] || status} 
      color={CONTRACT_STATUS_COLOR[status] || 'default'} 
      size="small" 
    />
  );
};
```

**Tác động:** Chip hiển thị code thay vì text tiếng Việt

---

## 🟡 LỖI 5: LẬP HỢP ĐỒNG TỪ HỒ SƠ

### File: `frontend/src/pages/Assesments/AssessmentDetail.js`

**Vấn đề tương tự Lỗi 1:**
```javascript
// ❌ SAI
alert('✅ Đã tạo hợp đồng: ' + result.data.MaHD);
navigate(`/contracts/${result.data.MaHD}`);
```

**✅ SỬA:**
```javascript
// Backend trả về result.data.maHD (lowercase 'ma')
alert('✅ Đã tạo hợp đồng: ' + result.data.maHD);
navigate(`/contracts/${result.data.maHD}`);
```

---

## 🟡 LỖI 6: BACKEND RESPONSE FORMAT KHÔNG NHẤT QUÁN

### Vấn đề:
Backend đôi khi trả về:
- `{ success, data, pagination }` (standardized)
- `{ data }` (simple)
- `{ list, pagination }` (old style)

### Ảnh hưởng:
File `hosoService.js` đã xử lý bằng `normalizeListResponse()` nhưng cần áp dụng cho tất cả services.

**✅ SỬA:**
Standardize tất cả backend responses thành:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

## 📋 CHECKLIST SỬA LỖI

### Ưu tiên cao (CRITICAL) ✅ HOÀN TẤT
- [x] Lỗi 1: Sửa `result.data.MaHD` → `result.data.maHDMoi` (ContractList.js)
- [x] Lỗi 2: Sửa filter status dùng constants (ContractList.js)
- [x] Lỗi 3: Sửa stats calculation dùng constants (ContractList.js)
- [x] Lỗi 4: Sửa getStatusChip dùng config (ContractList.js)

### Ưu tiên trung bình ✅ HOÀN TẤT
- [x] Lỗi 5: Sửa `result.data.MaHD` → `result.data.maHD` (AssessmentDetail.js)
- [ ] Lỗi 6: Standardize backend response format (Để sau)

---

## 🎯 HƯỚNG DẪN SỬA

### Bước 1: Sửa ContractList.js
```bash
# Sửa 4 chỗ trong file này:
frontend/src/pages/Contracts/ContractList.js
- Line 61-65: Filter status
- Line 75-85: Stats calculation
- Line 119: Renew response
- Line 168-177: Status chip mapping
```

### Bước 2: Sửa AssessmentDetail.js
```bash
frontend/src/pages/Assesments/AssessmentDetail.js
- Sửa field name khi lập hợp đồng
```

### Bước 3: Test
```bash
npm start
# Test các chức năng:
# 1. Lọc hợp đồng theo tab
# 2. Xem stats
# 3. Tái tục hợp đồng
# 4. Lập hợp đồng từ hồ sơ
```

---

## 📁 FILES CẦN SỬA

1. ✅ `frontend/src/pages/Contracts/ContractList.js` - 4 chỗ
2. ✅ `frontend/src/pages/Assesments/AssessmentDetail.js` - 1 chỗ
3. 📄 `frontend/src/config.js` - Đã có constants (OK)

---

## ⚠️ LƯU Ý

### Backend Status Values
Backend sử dụng **code tiếng Anh:**
```javascript
ACTIVE          // Đang hiệu lực
EXPIRED         // Hết hạn
DRAFT           // Nháp/Chờ ký
PARTIAL_PAID    // Thanh toán một phần
CANCELLED       // Đã hủy
RENEWED         // Đã tái tục
TRANSFERRED     // Đã chuyển nhượng
```

### Frontend Mapping
Luôn dùng constants từ `config.js`:
```javascript
import { 
  CONTRACT_STATUS, 
  CONTRACT_STATUS_TEXT, 
  CONTRACT_STATUS_COLOR 
} from '../../config';
```

---

**Ước tính thời gian sửa:** 20-30 phút  
**Mức độ khó:** Dễ (chỉ sửa mapping)  
**Testing:** Cần test đầy đủ sau khi sửa

---

**Báo cáo bởi:** Cline AI Assistant  
**Ngày:** 21/11/2025, 12:48 AM
