# TÀI LIỆU VỊ TRÍ CÁC BUTTON CRUD THEO TỪNG PAGE

**Hệ thống Quản lý Bảo hiểm PJICO**  
**Ngày: 16/11/2025**

---

## MỤC LỤC

1. [KHÁCH HÀNG (Customers)](#1-khách-hàng-customers)
2. [PHƯƠNG TIỆN (Vehicles)](#2-phương-tiện-vehicles)
3. [HỒ SƠ THẨM ĐỊNH (HoSo)](#3-hồ-sơ-thẩm-định-hoso)
4. [THẨM ĐỊNH (Assessments)](#4-thẩm-định-assessments)
5. [HỢP ĐỒNG (Contracts)](#5-hợp-đồng-contracts)
6. [DASHBOARD](#6-dashboard)
7. [REPORTS](#7-reports-báo-cáo)
8. [TỔNG HỢP](#8-tổng-hợp)

---

## 1. KHÁCH HÀNG (Customers)

### 📍 Đường dẫn: `/customers`

### 🎯 VỊ TRÍ BUTTONS

#### A. HEADER - Phía trên bên phải
```
┌─────────────────────────────────────────────────────────┐
│  Quản lý khách hàng                    [+ Thêm khách hàng] │
│  Danh sách tất cả khách hàng...                         │
└─────────────────────────────────────────────────────────┘
```

**Button:**
- 🔵 **Thêm khách hàng** 
  - Vị trí: `Header - Top Right`
  - Component: `<Button variant="contained" startIcon={<AddIcon />}>`
  - Handler: `handleAdd()`
  - Action: Mở `CustomerModal` với `customerId={null}`

#### B. SEARCH BAR - Dưới header
```
┌─────────────────────────────────────────────────────────┐
│  [🔍 Tìm kiếm theo tên, CCCD, SĐT...              ]     │
└─────────────────────────────────────────────────────────┘
```

**Control:**
- 🔍 **Search Bar**
  - Vị trí: `Below Header`
  - Component: `<SearchBar>`
  - Handler: `handleSearch(value)`
  - Feature: Debounce 500ms, reset to page 1

#### C. TABLE - Actions Column (Cột cuối cùng)
```
┌──────┬────────┬─────────┬──────────┬────────┐
│ Mã KH│ Họ tên │ CMND    │ ...      │ Thao tác│
├──────┼────────┼─────────┼──────────┼────────┤
│ KH001│ Nguyễn │ 001...  │ ...      │ [👁][✏][🗑]│
└──────┴────────┴─────────┴──────────┴────────┘
```

**Buttons (trong Stack direction="row" spacing={0.5}):**

1. 👁 **Xem chi tiết**
   - Vị trí: `Actions Column - Position 1`
   - Component: `<IconButton size="small" color="primary">`
   - Icon: `<VisibilityIcon fontSize="small" />`
   - Tooltip: "Xem chi tiết"
   - Handler: `handleViewDetail(params.row.MaKH)`
   - Action: Mở `CustomerDetailModal`

2. ✏️ **Chỉnh sửa**
   - Vị trí: `Actions Column - Position 2`
   - Component: `<IconButton size="small" color="warning">`
   - Icon: `<EditIcon fontSize="small" />`
   - Tooltip: "Chỉnh sửa"
   - Handler: `handleEdit(params.row.MaKH)`
   - Action: Mở `CustomerModal` với `customerId={MaKH}`

3. 🗑 **Xóa**
   - Vị trí: `Actions Column - Position 3`
   - Component: `<IconButton size="small" color="error">`
   - Icon: `<DeleteIcon fontSize="small" />`
   - Tooltip: "Xóa"
   - Handler: `handleDelete(params.row)`
   - Action: Confirm → API DELETE → Refresh list

#### D. PAGINATION - Bottom
```
┌─────────────────────────────────────────────────────────┐
│                    [Số hàng mỗi trang: 10 ▼]           │
│                    [◀] 1-10 của 50 [▶]                  │
└─────────────────────────────────────────────────────────┘
```

**Controls:**
- Page size selector: `[5, 10, 25, 50, 100]`
- Previous/Next buttons
- Page info display

---

## 2. PHƯƠNG TIỆN (Vehicles)

### 📍 Đường dẫn: `/vehicles`

### 🎯 VỊ TRÍ BUTTONS

#### A. HEADER - Top Right
```
┌─────────────────────────────────────────────────────────┐
│  Quản lý phương tiện                          [+ Thêm xe] │
│  Danh sách tất cả xe trong hệ thống                     │
└─────────────────────────────────────────────────────────┘
```

**Button:**
- 🔵 **Thêm xe**
  - Vị trí: `Header - Top Right`
  - Component: `<Button variant="contained" startIcon={<AddIcon />}>`
  - Handler: `handleAdd()`
  - Action: Mở `VehicleModal`

#### B. SEARCH BAR
```
┌─────────────────────────────────────────────────────────┐
│  [🔍 Tìm kiếm theo biển số, hãng xe, chủ xe...    ]     │
└─────────────────────────────────────────────────────────┘
```

#### C. TABLE - Actions Column
```
┌──────┬────────┬────────┬─────────┬──────────┐
│ Mã xe│ Biển số│ Hãng   │ ...     │ Thao tác │
├──────┼────────┼────────┼─────────┼──────────┤
│ XE001│ 30A-123│ Toyota │ ...     │ [👁][✏][🗑] │
└──────┴────────┴────────┴─────────┴──────────┘
```

**Buttons:**

1. 👁 **Xem chi tiết**
   - Vị trí: `Actions Column - Position 1`
   - Component: `<IconButton size="small" color="primary">`
   - Icon: `<VisibilityIcon fontSize="small" />`
   - Tooltip: "Xem chi tiết"
   - Handler: `handleViewDetail(params.row.MaXe)`
   - Action: Mở `VehicleDetailModal`

2. ✏️ **Chỉnh sửa**
   - Vị trí: `Actions Column - Position 2`
   - Component: `<IconButton size="small" color="warning">`
   - Icon: `<EditIcon fontSize="small" />`
   - Tooltip: "Chỉnh sửa"
   - Handler: `handleEdit(params.row.MaXe)`
   - Action: Mở `VehicleModal` với data

3. 🗑 **Xóa**
   - Vị trí: `Actions Column - Position 3`
   - Component: `<IconButton size="small" color="error">`
   - Icon: `<DeleteIcon fontSize="small" />`
   - Tooltip: "Xóa"
   - Handler: `handleDelete(params.row)`
   - Action: Confirm → DELETE API

#### D. MODAL - Additional Buttons

**Trong VehicleModal (Form thêm/sửa):**
```
┌─────────────────────────────────────────────────────────┐
│  Thêm phương tiện                                   [X] │
├─────────────────────────────────────────────────────────┤
│  Khách hàng: [Select ▼] [+ Thêm khách hàng mới]       │
│  ...                                                    │
│  Lịch sử tai nạn:           [+ Thêm]                   │
│  ├─ Ngày XR: [...] Mô tả: [...] Chi phí: [...] [🗑]    │
│                                                         │
│                           [Hủy] [Lưu]                   │
└─────────────────────────────────────────────────────────┘
```

**Extra buttons trong modal:**
- 🔵 **Thêm khách hàng mới** (inline button)
  - Vị trí: `Bên cạnh dropdown Khách hàng`
  - Handler: Mở nested CustomerModal
  
- 🔵 **Thêm** (tai nạn)
  - Vị trí: `Section Lịch sử tai nạn - Right`
  - Handler: Thêm dòng mới vào array

- 🗑 **Delete** (tai nạn)
  - Vị trí: `Mỗi dòng tai nạn - End`
  - Handler: Xóa dòng khỏi array

---

## 3. HỒ SƠ THẨM ĐỊNH (HoSo)

### 📍 Đường dẫn: `/hoso`

### 🎯 VỊ TRÍ BUTTONS

#### A. HEADER - Top Right
```
┌─────────────────────────────────────────────────────────┐
│  Hồ sơ thẩm định                          [+ Tạo hồ sơ] │
│  Quản lý hồ sơ thẩm định rủi ro                         │
└─────────────────────────────────────────────────────────┘
```

**Button:**
- 🔵 **Tạo hồ sơ**
  - Vị trí: `Header - Top Right`
  - Component: `<Button variant="contained" startIcon={<AddIcon />}>`
  - Handler: `handleAdd()`
  - Action: Mở `HoSoModal`

#### B. SEARCH BAR
```
┌─────────────────────────────────────────────────────────┐
│  [🔍 Tìm kiếm theo mã hồ sơ, khách hàng, biển số...]   │
└─────────────────────────────────────────────────────────┘
```

#### C. TABLE - Actions Column
```
┌──────┬────────┬─────────┬────────┬──────────┐
│ Mã HS│ KH     │ Biển số │ Rủi ro │ Thao tác │
├──────┼────────┼─────────┼────────┼──────────┤
│ HS001│ Nguyễn │ 30A-123 │ [THẤP] │ [👁][🗑]  │
└──────┴────────┴─────────┴────────┴──────────┘
```

**Buttons (CHỈ 2 buttons - không có Edit):**

1. 👁 **Xem chi tiết**
   - Vị trí: `Actions Column - Position 1`
   - Component: `<IconButton size="small" color="primary">`
   - Icon: `<VisibilityIcon fontSize="small" />`
   - Tooltip: "Xem chi tiết"
   - Handler: `handleViewDetail(params.row.MaHS)`
   - Action: Mở `HoSoDetailModal`

2. 🗑 **Xóa**
   - Vị trí: `Actions Column - Position 2`
   - Component: `<IconButton size="small" color="error">`
   - Icon: `<DeleteIcon fontSize="small" />`
   - Tooltip: "Xóa"
   - Handler: `handleDelete(params.row)`
   - Action: Confirm → DELETE API

#### D. MODAL - Extra Buttons

**Trong HoSoModal:**
```
┌─────────────────────────────────────────────────────────┐
│  Tạo hồ sơ thẩm định                                [X] │
├─────────────────────────────────────────────────────────┤
│  Khách hàng: [Select ▼] [+ Thêm khách hàng mới]       │
│  Xe:         [Select ▼] [+ Thêm xe mới]               │
│  Ghi chú:    [                                    ]     │
│                                                         │
│                           [Hủy] [Tạo hồ sơ]            │
└─────────────────────────────────────────────────────────┘
```

**Extra buttons:**
- 🔵 **Thêm khách hàng mới** (inline)
- 🔵 **Thêm xe mới** (inline)

---

## 4. THẨM ĐỊNH (Assessments)

### 📍 Đường dẫn: `/assessments`

### 🎯 VỊ TRÍ BUTTONS

#### A. HEADER - Top Right
```
┌─────────────────────────────────────────────────────────┐
│  Quản lý thẩm định                    [+ Tạo thẩm định] │
│  [Tất cả][Chờ bổ sung][Đã duyệt][Từ chối]              │
└─────────────────────────────────────────────────────────┘
```

**Button:**
- 🔵 **Tạo thẩm định**
  - Vị trí: `Header - Top Right`
  - Text: "+ Tạo thẩm định"
  - Component: Plain text button
  - Handler: `navigate('/assessments/new')`
  - Action: Navigate to full page form

#### B. FILTER TABS - Below Header
```
┌─────────────────────────────────────────────────────────┐
│  [■ Tất cả] [  Chờ bổ sung] [  Đã duyệt] [  Từ chối]   │
└─────────────────────────────────────────────────────────┘
```

**ToggleButtonGroup:**
- Position: Below header
- Options: `all`, `pending`, `approved`, `rejected`
- Handler: `setFilter(value)`

#### C. STATS CARDS - Top of content
```
┌──────────┬──────────┬──────────┬──────────┐
│ Tổng: 45 │ Chấp: 30 │ Từ: 10   │ Chờ: 5   │
└──────────┴──────────┴──────────┴──────────┘
```

#### D. SEARCH BAR
```
┌─────────────────────────────────────────────────────────┐
│  [🔍 Tìm kiếm theo mã thẩm định, hợp đồng...]          │
└─────────────────────────────────────────────────────────┘
```

#### E. TABLE - Actions Column (5 BUTTONS - NHIỀU NHẤT)
```
┌──────┬─────┬──────┬────────┬─────────┬─────────────────────┐
│ Mã TD│ HĐ  │ Ngày │ Rủi ro │ Kết quả │ Thao tác            │
├──────┼─────┼──────┼────────┼─────────┼─────────────────────┤
│ TD001│ HD01│ ...  │ [THẤP] │[Chấp ✓] │[👁][✏][📄][❌][🗑] │
└──────┴─────┴──────┴────────┴─────────┴─────────────────────┘
```

**Buttons (Stack direction="row" spacing={0.5}):**

1. 👁 **Xem chi tiết**
   - Vị trí: `Actions Column - Position 1`
   - Component: `<IconButton size="small" color="primary">`
   - Icon: `<VisibilityIcon fontSize="small" />`
   - Tooltip: "Xem chi tiết"
   - Handler: `handleViewDetail(params.row.MaTD)`
   - Action: Mở `AssessmentDetailModal`
   - **Hiển thị: LUÔN LUÔN**

2. ✏️ **Chỉnh sửa**
   - Vị trí: `Actions Column - Position 2`
   - Component: `<IconButton size="small" color="warning">`
   - Icon: `<EditIcon fontSize="small" />`
   - Tooltip: "Chỉnh sửa"
   - Handler: `handleEdit(params.row.MaTD)`
   - Action: Navigate to `/assessments/edit/${MaTD}`
   - **Hiển thị: LUÔN LUÔN**

3. 📄 **Tạo hợp đồng**
   - Vị trí: `Actions Column - Position 3`
   - Component: `<IconButton size="small" color="success">`
   - Icon: `<DocumentIcon fontSize="small" />`
   - Tooltip: "Tạo hợp đồng"
   - Handler: `handleCreateContract(params.row)`
   - Action: Mở `ContractFormModal` với data thẩm định
   - **Hiển thị: ĐIỀU KIỆN - CHỈ KHI `params.row.KetQua === 'Chấp nhận'`**

4. ❌ **Từ chối**
   - Vị trí: `Actions Column - Position 4`
   - Component: `<IconButton size="small" color="error">`
   - Icon: `<CancelIcon fontSize="small" />`
   - Tooltip: "Từ chối"
   - Handler: `handleReject(params.row.MaTD)`
   - Action: Confirm → Update KetQua='Từ chối'
   - **Hiển thị: ĐIỀU KIỆN - CHỈ KHI `params.row.KetQua !== 'Từ chối'`**

5. 🗑 **Xóa**
   - Vị trí: `Actions Column - Position 5`
   - Component: `<IconButton size="small" color="error">`
   - Icon: `<DeleteIcon fontSize="small" />`
   - Tooltip: "Xóa"
   - Handler: `handleDelete(params.row)`
   - Action: Confirm → DELETE API
   - **Hiển thị: LUÔN LUÔN**

**⚠️ LƯU Ý QUAN TRỌNG:**
- Button **"Tạo hợp đồng"** chỉ xuất hiện khi thẩm định có kết quả "Chấp nhận"
- Button **"Từ chối"** biến mất khi thẩm định đã bị từ chối
- Mỗi dòng có thể có 3-5 buttons tùy trạng thái

---

## 5. HỢP ĐỒNG (Contracts)

### 📍 Đường dẫn: `/contracts`

### 🎯 VỊ TRÍ BUTTONS

#### A. TABS - Top Navigation
```
┌─────────────────────────────────────────────────────────┐
│  [■ Quản lý HĐ] [  Phát hành] [  Tái tục]              │
└─────────────────────────────────────────────────────────┘
```

**TabPanel:**
- Tab 0: Quản lý hợp đồng (tất cả)
- Tab 1: Quản lý phát hành (TrangThai='Chờ ký')
- Tab 2: Quản lý tái tục (TrangThai='Hiệu lực' hoặc 'Hết hạn')

#### B. HEADER - Chỉ trong Tab 0 (Quản lý)
```
┌─────────────────────────────────────────────────────────┐
│  [■ Quản lý HĐ] [  Phát hành] [  Tái tục]              │
│                                       [+ Tạo hợp đồng]  │
│  [Hiệu lực: 50] [Chờ: 10] [Sắp hết: 5]                │
└─────────────────────────────────────────────────────────┘
```

**Button:**
- 🔵 **Tạo hợp đồng**
  - Vị trí: `Tab 0 Header - Top Right`
  - Component: `<Button variant="contained" startIcon={<AddIcon />}>`
  - Handler: `navigate('/contracts/new')`
  - Action: Navigate to full page form
  - **⚠️ CHỈ HIỂN THỊ Ở TAB 0**

#### C. STATS CARDS - Chỉ trong Tab 0
```
┌──────────────┬──────────────┬──────────────┐
│ Hiệu lực: 50 │ Chờ duyệt: 10│ Sắp hết: 5  │
└──────────────┴──────────────┴──────────────┘
```

#### D. SEARCH BAR - Tất cả tabs
```
┌─────────────────────────────────────────────────────────┐
│  [🔍 Tìm kiếm theo số HĐ, khách hàng, biển số...]      │
└─────────────────────────────────────────────────────────┘
```

#### E. TABLE - Actions Columns (KHÁC NHAU THEO TAB)

### **TAB 0: QUẢN LÝ HỢP ĐỒNG**
```
┌──────┬────────┬─────────┬────────┬──────────┐
│ Mã HĐ│ Khách  │ Biển số │ Trạng  │ Thao tác │
├──────┼────────┼─────────┼────────┼──────────┤
│ HD001│ Nguyễn │ 30A-123 │ [HLực] │ [👁][✏][🗑]│
└──────┴────────┴─────────┴────────┴──────────┘
```

**Buttons (3 buttons):**

1. 👁 **Xem chi tiết**
   - Component: `<IconButton size="small" color="primary">`
   - Icon: `<VisibilityIcon fontSize="small" />`
   - Handler: `navigate(\`/contracts/${params.row.MaHD}\`)`
   - Action: Navigate to detail page

2. ✏️ **Chỉnh sửa**
   - Component: `<IconButton size="small" color="warning">`
   - Icon: `<EditIcon fontSize="small" />`
   - Handler: `navigate(\`/contracts/edit/${params.row.MaHD}\`)`
   - Action: Navigate to edit form

3. 🗑 **Xóa**
   - Component: `<IconButton size="small" color="error">`
   - Icon: `<DeleteIcon fontSize="small" />`
   - Handler: `handleDelete(params.row)`
   - Action: Confirm → DELETE API

### **TAB 1: QUẢN LÝ PHÁT HÀNH**
```
┌──────┬────────┬─────────┬────────┬─────────────────┐
│ Mã HĐ│ Khách  │ Biển số │ Phí BH │ Thao tác        │
├──────┼────────┼─────────┼────────┼─────────────────┤
│ HD002│ Trần   │ 51B-456 │ 5.5tr  │[👁][🖨HĐ][🖨CN]│
└──────┴────────┴─────────┴────────┴─────────────────┘
```

**Buttons (3 buttons):**

1. 👁 **Xem chi tiết**
   - Icon: `<VisibilityIcon />`
   - Handler: `navigate(\`/contracts/${params.row.MaHD}\`)`

2. 🖨️ **In hợp đồng**
   - Component: `<IconButton size="small" color="secondary">`
   - Icon: `<PrintIcon fontSize="small" />`
   - Tooltip: "In hợp đồng"
   - Handler: `handlePrintContract(params.row.MaHD)`
   - Action: Download PDF hợp đồng

3. 🖨️ **In chứng nhận**
   - Component: `<IconButton size="small" color="info">`
   - Icon: `<DescriptionIcon fontSize="small" />`
   - Tooltip: "In giấy chứng nhận"
   - Handler: `handlePrintCertificate(params.row.MaHD)`
   - Action: Download PDF giấy chứng nhận

### **TAB 2: QUẢN LÝ TÁI TỤC**
```
┌──────┬────────┬─────────┬────────┬────────┬─────────────────────┐
│ Mã HĐ│ Khách  │ Biển số │ Trạng  │ Còn lại│ Thao tác            │
├──────┼────────┼─────────┼────────┼────────┼─────────────────────┤
│ HD003│ Lê     │ 29C-789 │ [HLực] │ 10 ngày│[👁][🔄][↔️][❌]    │
└──────┴────────┴─────────┴────────┴────────┴─────────────────────┘
```

**Buttons (4 buttons):**

1. 👁 **Xem chi tiết**
   - Icon: `<VisibilityIcon />`
   - Handler: `navigate(\`/contracts/${params.row.MaHD}\`)`

2. 🔄 **Tái tục**
   - Component: `<IconButton size="small" color="success">`
   - Icon: `<AutorenewIcon fontSize="small" />`
   - Tooltip: "Tái tục"
   - Handler: `handleRenew(params.row)`
   - Action: Confirm → POST /api/contracts/renew → Alert "Đã tạo HĐ mới: XXX"

3. ↔️ **Chuyển nhượng**
   - Component: `<IconButton size="small" color="info">`
   - Icon: `<TransferIcon fontSize="small" />`
   - Tooltip: "Chuyển nhượng"
   - Handler: `navigate(\`/contracts/${params.row.MaHD}/transfer\`)`
   - Action: Navigate to transfer form

4. ❌ **Hủy (hoàn phí)**
   - Component: `<IconButton size="small" color="error">`
   - Icon: `<CancelIcon fontSize="small" />`
   - Tooltip: "Hủy (hoàn phí)"
   - Handler: `handleCancel(params.row.MaHD)`
   - Action: Prompt lý do → POST /api/contracts/cancel → Tính hoàn phí

---

### F. CONTRACT DETAIL PAGE (`/contracts/:id`)

#### HEADER BUTTONS
```
┌─────────────────────────────────────────────────────────┐
│  [← Quay lại]  Hợp đồng HD001  [Hiệu lực] [Đã TT]      │
│                        [📄 Giấy CN][📑 Hợp đồng][✏][🗑]│
└─────────────────────────────────────────────────────────┘
```

**Buttons (Top Right):**

1. 🔙 **Quay lại**
   - Vị trí: `Top Left`
   - Component: `<Button startIcon={<ArrowBackIcon />}>`
   - Handler: `navigate('/contracts')`

2. 📄 **Giấy chứng nhận**
   - Vị trí: `Top Right - Position 1`
   - Component: `<Button variant="outlined" startIcon={<DescriptionIcon />}>`
   - Handler: `handleDownloadCertificate()`
   - Action: Download PDF

3. 📑 **Hợp đồng**
   - Vị trí: `Top Right - Position 2`
   - Component: `<Button variant="outlined" startIcon={<PrintIcon />}>`
   - Handler: `handleDownloadContract()`
   - Action: Download PDF

4. ✏️ **Sửa**
   - Vị trí: `Top Right - Position 3`
   - Component: `<IconButton color="warning">`
   - Icon: `<EditIcon />`
   - Handler: `navigate(\`/contracts/edit/${MaHD}\`)`

5. 🗑 **Xóa**
   - Vị trí: `Top Right - Position 4`
   - Component: `<IconButton color="error">`
   - Icon: `<DeleteIcon />`
   - Handler: `handleDelete()`

#### TABS TRONG DETAIL
```
┌─────────────────────────────────────────────────────────┐
│  [■ Thông tin HĐ] [  Thanh toán] [  Bên liên quan] [  Định giá] │
└─────────────────────────────────────────────────────────┘
```

#### TAB THANH TOÁN - Buttons
```
┌─────────────────────────────────────────────────────────┐
│  Tóm tắt thanh toán                                     │
│  Phí BH: 5,500,000 VNĐ                                 │
│  Trạng thái: [Đã thanh toán]                           │
│                                                         │
│  Chi tiết thanh toán:                                   │
│  Ngày TT: 01/01/2025                                   │
│  Hình thức: Chuyển khoản                               │
│                                                         │
│                           [🖨 In biên lai]              │
└─────────────────────────────────────────────────────────┘
```

**Buttons (conditional):**

- 💰 **Đánh dấu đã thanh toán**
  - Vị trí: `Tab Thanh toán - Bottom`
  - Component: `<Button variant="contained">`
  - Handler: `setPaymentModalOpen(true)`
  - Action: Mở `PaymentModal`
  - **Hiển thị: CHỈ KHI chưa thanh toán VÀ TrangThai='active'**

- 🖨️ **In biên lai**
  - Vị trí: `Tab Thanh toán - Bottom`
  - Component: `<Button variant="outlined" startIcon={<PrintIcon />}>`
  - Handler: `handlePrintReceipt()`
  - Action: Download receipt PDF
  - **Hiển thị: CHỈ KHI đã thanh toán**

#### TAB BÊN LIÊN QUAN - Navigate Buttons
```
┌─────────────────────────────────────────────────────────┐
│  📋 Thông tin khách hàng                                │
│  Họ tên: Nguyễn Văn A                                  │
│  CCCD: 001234567890                                     │
│                           [Xem chi tiết →]              │
├─────────────────────────────────────────────────────────┤
│  🚗 Thông tin xe                                        │
│  Biển số: 30A-12345                                    │
│  Loại: Sedan                                           │
│                           [Xem chi tiết →]              │
└─────────────────────────────────────────────────────────┘
```

**Navigate buttons:**
- **Xem chi tiết khách hàng**: Navigate to customer detail
- **Xem chi tiết xe**: Navigate to vehicle detail

#### TAB ĐỊNH GIÁ - Buttons
```
┌─────────────────────────────────────────────────────────┐
│  Lịch sử định giá (0)                  [+ Tạo định giá] │
│                                                         │
│  Chưa có định giá nào                                  │
└─────────────────────────────────────────────────────────┘
```

**Button:**
- 🔵 **Tạo định giá**
  - Vị trí: `Tab Định giá - Header Right`
  - Component: `<Button variant="outlined" startIcon={<AddIcon />}>`
  - Handler: `handleCreateAssessment()`

---

## 6. DASHBOARD

### 📍 Đường dẫn: `/dashboard` hoặc `/`

### 🎯 VỊ TRÍ BUTTONS

#### A. HEADER
```
┌─────────────────────────────────────────────────────────┐
│  Dashboard - Tổng quan hệ thống               [🔄]      │
└─────────────────────────────────────────────────────────┘
```

**Button:**
- 🔄 **Refresh**
  - Vị trí: `Header - Top Right`
  - Component: `<IconButton color="primary">`
  - Icon: `<RefreshIcon />`
  - Tooltip: "Làm mới"
  - Handler: `loadDashboardData()`
  - Action: Reload tất cả data

#### B. FILTER BAR
```
┌─────────────────────────────────────────────────────────┐
│  [Từ ngày: 📅] [Đến ngày: 📅] [Gói BH ▼] [Trạng thái ▼]│
│                               [Áp dụng] [Xóa]          │
└─────────────────────────────────────────────────────────┘
```

**Buttons:**

1. **Áp dụng**
   - Vị trí: `Filter bar - Right - Position 1`
   - Component: `<MuiButton variant="contained" fullWidth>`
   - Handler: `handleApplyFilter()`
   - Action: Reload với filters

2. **Xóa**
   - Vị trí: `Filter bar - Right - Position 2`
   - Component: `<MuiButton variant="outlined">`
   - Handler: `handleResetFilter()`
   - Action: Reset về default (30 ngày)

#### C. STATS CARDS - Navigate on Click
```
┌───────────────┬───────────────┬───────────────┬───────────────┐
│ 👥 Khách: 150 │ 🚗 Xe: 200   │ 📄 HĐ: 120   │ 💰 DT: 500tr │
│  ↑ 12%        │  ↑ 8%        │  Tổng: 150   │  ↑ 15%       │
└───────────────┴───────────────┴───────────────┴───────────────┘
```

**Cards có thể click:**
- Mỗi card là `<Card>` clickable
- `onClick`: Navigate đến trang tương ứng
  - Khách hàng → `/customers`
  - Xe → `/vehicles`
  - Hợp đồng → `/contracts`

#### D. TABLES - Action Buttons

**Bảng "Hợp đồng sắp hết hạn":**
```
┌─────────────────────────────────────────────────────────┐
│  Hợp đồng sắp hết hạn (15 ngày)    [Xem tất cả →]       │
├──────┬────────┬─────────┬──────────┬──────────┐
│ Số HĐ│ Khách  │ Biển số │ Hết hạn  │ Thao tác │
├──────┼────────┼─────────┼──────────┼──────────┤
│ HD001│ Nguyễn │ [30A]   │ 5 ngày   │   [👁]   │
└──────┴────────┴─────────┴──────────┴──────────┘
```

**Buttons:**
- 👁 **Xem**: Navigate to `/contracts/${MaHD}`
- 📋 **Xem tất cả**: Navigate to `/contracts` (Tab Tái tục)

**Bảng "Hồ sơ chờ thẩm định":**
```
┌─────────────────────────────────────────────────────────┐
│  Hồ sơ chờ thẩm định                [Xem tất cả →]      │
├──────┬────────┬─────────┬──────────┬──────────┐
│ Mã HS│ Khách  │ Biển số │ Ngày tạo │ Thao tác │
├──────┼────────┼─────────┼──────────┼──────────┤
│ HS001│ Trần   │ [51B]   │ 1 ngày   │   [👁]   │
└──────┴────────┴─────────┴──────────┴──────────┘
```

**Buttons:**
- 👁 **Xem**: Navigate to hoso detail
- 📋 **Xem tất cả**: Navigate to `/assessments` (Filter pending)

---

## 7. REPORTS (Báo cáo)

### 📍 Đường dẫn: `/reports`

### 🎯 VỊ TRÍ BUTTONS

#### A. DATE RANGE FILTER
```
┌─────────────────────────────────────────────────────────┐
│  Hệ thống Báo cáo                                       │
│  [Từ ngày: 📅 01/01/2025] [Đến ngày: 📅 31/01/2025]    │
└─────────────────────────────────────────────────────────┘
```

#### B. REPORT CARDS (4 cards) - Mỗi card có 1 button
```
┌─────────────────────────────────────────────────────────┐
│  📈 Báo cáo Doanh thu Phí Bảo hiểm                      │
│  Thống kê doanh thu theo tháng, quý, năm...            │
│                                       [📄 Xuất PDF]     │
├─────────────────────────────────────────────────────────┤
│  🔄 Báo cáo Tái tục Hợp đồng                           │
│  Phân tích số lượng HĐ tái tục...                      │
│                                       [📄 Xuất PDF]     │
├─────────────────────────────────────────────────────────┤
│  ⚖️ Báo cáo Hỗ trợ Thẩm định                           │
│  Thống kê hồ sơ theo mức độ rủi ro...                 │
│                                       [📄 Xuất PDF]     │
├─────────────────────────────────────────────────────────┤
│  📊 Báo cáo Quản trị Nghiệp vụ                         │
│  Tổng hợp các chỉ tiêu nghiệp vụ...                   │
│                                       [📄 Xuất PDF]     │
└─────────────────────────────────────────────────────────┘
```

**Buttons (4 buttons giống nhau, khác handler):**

1. 📄 **Xuất PDF - Doanh thu**
   - Vị trí: `Card 1 - Bottom Right`
   - Component: `<Button variant="contained" startIcon={<PdfIcon />}>`
   - Color: `#1976d2` (primary)
   - Handler: `handleExportPDF('revenue')`
   - Action: `reportService.exportRevenuePDF(fromDate, toDate)`

2. 📄 **Xuất PDF - Tái tục**
   - Vị trí: `Card 2 - Bottom Right`
   - Color: `#2e7d32` (success)
   - Handler: `handleExportPDF('renewal')`
   - Action: `reportService.exportRenewalPDF(fromDate, toDate)`

3. 📄 **Xuất PDF - Thẩm định**
   - Vị trí: `Card 3 - Bottom Right`
   - Color: `#ed6c02` (warning)
   - Handler: `handleExportPDF('assessment')`
   - Action: `reportService.exportAssessmentPDF(fromDate, toDate)`

4. 📄 **Xuất PDF - Nghiệp vụ**
   - Vị trí: `Card 4 - Bottom Right`
   - Color: `#0288d1` (info)
   - Handler: `handleExportPDF('business')`
   - Action: `reportService.exportBusinessPDF(fromDate, toDate)`

**Loading state:**
- Button disabled khi loading
- Icon đổi thành `<CircularProgress size={20} />`

---

## 8. TỔNG HỢP

### 📊 THỐNG KÊ BUTTONS THEO PAGE

| Page | Header Buttons | Actions/Row | Total Buttons | Special |
|------|---------------|-------------|---------------|---------|
| **Customers** | 1 (Thêm) | 3 (Xem, Sửa, Xóa) | **4** | - |
| **Vehicles** | 1 (Thêm) | 3 (Xem, Sửa, Xóa) | **4** | +2 inline (Thêm KH, Thêm tai nạn) |
| **HoSo** | 1 (Tạo) | 2 (Xem, Xóa) | **3** | +2 inline (Thêm KH, Thêm xe) |
| **Assessments** | 1 (Tạo) | 3-5 (Xem, Sửa, Xóa, [Tạo HĐ], [Từ chối]) | **6** | Conditional buttons |
| **Contracts** | 1 (Tạo - Tab 0) | 3-4 tùy tab | **10+** | Multi-tab, nhiều actions |
| **Dashboard** | 1 (Refresh) | 2 trong tables | **5** | Filter buttons |
| **Reports** | 0 | 0 | **4** | Export PDF buttons |

### 🎨 MÀU SẮC BUTTONS

**Primary Actions (Tạo/Thêm mới):**
- Color: `contained` blue (#1976d2)
- Icon: `<AddIcon />`

**View (Xem chi tiết):**
- Color: `primary` (#1976d2)
- Icon: `<VisibilityIcon />`

**Edit (Sửa):**
- Color: `warning` (#ed6c02)
- Icon: `<EditIcon />`

**Delete (Xóa):**
- Color: `error` (#d32f2f)
- Icon: `<DeleteIcon />`

**Success Actions (Tạo HĐ, Tái tục):**
- Color: `success` (#2e7d32)
- Icon: `<DocumentIcon />`, `<AutorenewIcon />`

**Secondary Actions (In, Export):**
- Color: `secondary`, `outlined`
- Icon: `<PrintIcon />`, `<PdfIcon />`

### 🔄 PATTERNS CHUNG

**1. List Page Pattern:**
```
Header
├── Title + Description (Left)
└── [+ Thêm/Tạo] Button (Right)

Search Bar (Full width)

Table
└── Actions Column (Last)
    ├── [👁 Xem] (Always)
    ├── [✏️ Sửa] (Always, except HoSo)
    └── [🗑 Xóa] (Always)

Pagination (Bottom)
```

**2. Detail Modal Pattern:**
```
Header
├── Title (Left)
└── [X] Close (Right)

Content
├── Tabs (if multi-section)
└── Data display

Footer
└── [Action Buttons] (Right)
```

**3. Form Modal Pattern:**
```
Header
├── Title (Left)
└── [X] Close (Right)

Form Fields
├── Required fields (*)
├── Optional fields
└── [+ Inline action buttons]

Footer
├── [Hủy] (Left/Center)
└── [Lưu/Tạo] (Right)
```

### ⚡ SPECIAL BEHAVIORS

**Conditional Rendering:**
- Assessment: "Tạo HĐ" button chỉ hiện khi `KetQua='Chấp nhận'`
- Assessment: "Từ chối" button ẩn khi đã từ chối
- Contract Detail: "Thanh toán" button chỉ hiện khi chưa thanh toán

**Tab-specific Buttons:**
- Contract List: Button "Tạo HĐ" chỉ ở Tab 0
- Contract List: Actions khác nhau mỗi tab (3-4 buttons)

**Nested Actions:**
- Vehicle Modal: Có button "Thêm KH mới" mở nested modal
- HoSo Modal: Có button "Thêm KH" và "Thêm xe"

**Inline Actions:**
- Vehicle Form: Dynamic table tai nạn với Add/Delete buttons
- Assessment Form: Quick select với autocomplete

### 📱 RESPONSIVE BEHAVIOR

**Desktop (>960px):**
- Buttons hiển thị full text + icon
- Actions column rộng đủ cho tất cả buttons

**Tablet (600-960px):**
- Buttons có thể stack vertical
- Actions column scroll horizontal nếu cần

**Mobile (<600px):**
- Header buttons có thể chỉ hiện icon
- Actions column dùng menu dropdown (3 dots)

---

## KẾT LUẬN

Hệ thống có **tổng cộng 40+ buttons** phân bố trên 7 pages chính, với các đặc điểm:

✅ **Consistency**: Tất cả list pages đều có pattern giống nhau  
✅ **Intuitive**: Icon colors phản ánh action (blue=view, orange=edit, red=delete)  
✅ **Conditional**: Buttons hiện/ẩn thông minh theo context  
✅ **Accessible**: Tooltip cho tất cả icon buttons  
✅ **Responsive**: Layout adapt theo screen size  

**Lưu ý khi phát triển thêm:**
- Giữ consistency về vị trí buttons (Header right cho Create, Actions column cho CRUD)
- Sử dụng màu sắc chuẩn Material-UI
- Luôn có confirm dialog cho destructive actions (Delete, Cancel)
- Tooltip cho tất cả icon buttons
- Loading state cho async actions

---

**Ngày tạo:** 16/11/2025  
**Phiên bản:** 1.0  
**Tác giả:** System Documentation
