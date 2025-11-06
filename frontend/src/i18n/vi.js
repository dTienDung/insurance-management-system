// ============================================
// MESSAGES TIẾNG VIỆT MỞ RỘNG
// Thêm vào file config.js hiện tại
// ============================================

// Thêm vào export của config.js
export const MESSAGES_EXTENDED = {
  // ============================================
  // COMMON - Chung
  // ============================================
  common: {
    save: 'Lưu',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Sửa',
    add: 'Thêm',
    addNew: 'Thêm mới',
    search: 'Tìm kiếm',
    export: 'Xuất',
    import: 'Nhập',
    print: 'In',
    refresh: 'Làm mới',
    back: 'Quay lại',
    next: 'Tiếp theo',
    previous: 'Trước',
    close: 'Đóng',
    confirm: 'Xác nhận',
    yes: 'Có',
    no: 'Không',
    ok: 'Đồng ý',
    loading: 'Đang tải...',
    noData: 'Không có dữ liệu',
    actions: 'Thao tác',
    status: 'Trạng thái',
    date: 'Ngày',
    time: 'Giờ',
    total: 'Tổng',
    filter: 'Lọc',
    clear: 'Xóa',
    apply: 'Áp dụng',
    view: 'Xem',
    details: 'Chi tiết',
    select: 'Chọn',
    selectAll: 'Chọn tất cả',
    deselectAll: 'Bỏ chọn tất cả',
    upload: 'Tải lên',
    download: 'Tải xuống',
    update: 'Cập nhật',
    create: 'Tạo mới',
    submit: 'Gửi',
    reset: 'Đặt lại',
  },

  // ============================================
  // MENU - Điều hướng
  // ============================================
  menu: {
    dashboard: 'Tổng quan',
    customers: 'Khách hàng',
    vehicles: 'Phương tiện',
    contracts: 'Hợp đồng',
    assessments: 'Thẩm định',
    reports: 'Báo cáo',
    settings: 'Cài đặt',
    profile: 'Thông tin cá nhân',
    logout: 'Đăng xuất',
  },

  // ============================================
  // AUTH - Xác thực
  // ============================================
  auth: {
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    username: 'Tên đăng nhập',
    password: 'Mật khẩu',
    rememberMe: 'Ghi nhớ đăng nhập',
    forgotPassword: 'Quên mật khẩu?',
    loginSuccess: 'Đăng nhập thành công',
    loginFailed: 'Đăng nhập thất bại',
    logoutSuccess: 'Đăng xuất thành công',
    invalidCredentials: 'Tên đăng nhập hoặc mật khẩu không đúng',
    sessionExpired: 'Phiên đăng nhập đã hết hạn',
    welcomeBack: 'Chào mừng trở lại',
    pleaseLogin: 'Vui lòng đăng nhập để tiếp tục',
    enterUsername: 'Vui lòng nhập tên đăng nhập',
    enterPassword: 'Vui lòng nhập mật khẩu',
  },

  // ============================================
  // DASHBOARD - Tổng quan
  // ============================================
  dashboard: {
    title: 'Tổng quan',
    welcome: 'Chào mừng đến với PJICO',
    totalCustomers: 'Tổng khách hàng',
    totalVehicles: 'Tổng phương tiện',
    totalContracts: 'Tổng hợp đồng',
    activeContracts: 'Hợp đồng hiệu lực',
    expiredContracts: 'Hợp đồng hết hạn',
    cancelledContracts: 'Hợp đồng đã hủy',
    recentContracts: 'Hợp đồng gần đây',
    recentPayments: 'Thanh toán gần đây',
    statistics: 'Thống kê',
    revenue: 'Doanh thu',
    thisMonth: 'Tháng này',
    lastMonth: 'Tháng trước',
    thisYear: 'Năm nay',
    lastYear: 'Năm trước',
    overview: 'Tổng quan hệ thống',
  },

  // ============================================
  // CUSTOMERS - Khách hàng
  // ============================================
  customers: {
    title: 'Quản lý khách hàng',
    addNew: 'Thêm khách hàng',
    edit: 'Sửa khách hàng',
    delete: 'Xóa khách hàng',
    details: 'Chi tiết khách hàng',
    list: 'Danh sách khách hàng',
    
    // Fields
    customerId: 'Mã khách hàng',
    fullName: 'Họ và tên',
    idCard: 'CMND/CCCD',
    dateOfBirth: 'Ngày sinh',
    gender: 'Giới tính',
    address: 'Địa chỉ',
    phone: 'Số điện thoại',
    email: 'Email',
    
    // Gender
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
    
    // Placeholders
    enterFullName: 'Nhập họ và tên',
    enterIdCard: 'Nhập CMND/CCCD',
    enterPhone: 'Nhập số điện thoại',
    enterEmail: 'Nhập email',
    enterAddress: 'Nhập địa chỉ',
    selectGender: 'Chọn giới tính',
    selectDate: 'Chọn ngày sinh',
    
    // Messages
    addSuccess: 'Thêm khách hàng thành công',
    updateSuccess: 'Cập nhật khách hàng thành công',
    deleteSuccess: 'Xóa khách hàng thành công',
    deleteConfirm: 'Bạn có chắc chắn muốn xóa khách hàng này?',
    notFound: 'Không tìm thấy khách hàng',
    
    // Validation
    nameRequired: 'Vui lòng nhập họ tên',
    idCardRequired: 'Vui lòng nhập CMND/CCCD',
    phoneRequired: 'Vui lòng nhập số điện thoại',
    emailInvalid: 'Email không hợp lệ',
    phoneInvalid: 'Số điện thoại không hợp lệ',
    dobRequired: 'Vui lòng chọn ngày sinh',
  },

  // ============================================
  // VEHICLES - Phương tiện
  // ============================================
  vehicles: {
    title: 'Quản lý phương tiện',
    addNew: 'Thêm phương tiện',
    edit: 'Sửa phương tiện',
    delete: 'Xóa phương tiện',
    details: 'Chi tiết phương tiện',
    list: 'Danh sách phương tiện',
    
    // Fields
    vehicleId: 'Mã phương tiện',
    licensePlate: 'Biển số xe',
    brand: 'Hãng xe',
    model: 'Dòng xe',
    type: 'Loại xe',
    year: 'Năm sản xuất',
    color: 'Màu sắc',
    engineNumber: 'Số máy',
    chassisNumber: 'Số khung',
    value: 'Giá trị xe',
    purpose: 'Mục đích sử dụng',
    technicalStatus: 'Tình trạng kỹ thuật',
    owner: 'Chủ sở hữu',
    
    // Vehicle Types
    car: 'Ô tô',
    motorcycle: 'Xe máy',
    truck: 'Xe tải',
    bus: 'Xe khách',
    
    // Purpose
    personal: 'Cá nhân',
    business: 'Kinh doanh',
    
    // Technical Status
    good: 'Tốt',
    normal: 'Bình thường',
    needRepair: 'Cần sửa chữa',
    
    // Placeholders
    enterLicensePlate: 'Nhập biển số xe',
    enterBrand: 'Nhập hãng xe',
    enterModel: 'Nhập dòng xe',
    selectType: 'Chọn loại xe',
    enterYear: 'Nhập năm sản xuất',
    enterValue: 'Nhập giá trị xe',
    
    // Messages
    addSuccess: 'Thêm phương tiện thành công',
    updateSuccess: 'Cập nhật phương tiện thành công',
    deleteSuccess: 'Xóa phương tiện thành công',
    deleteConfirm: 'Bạn có chắc chắn muốn xóa phương tiện này?',
    notFound: 'Không tìm thấy phương tiện',
    
    // Validation
    licensePlateRequired: 'Vui lòng nhập biển số xe',
    brandRequired: 'Vui lòng nhập hãng xe',
    yearRequired: 'Vui lòng nhập năm sản xuất',
    valueRequired: 'Vui lòng nhập giá trị xe',
    licensePlateInvalid: 'Biển số xe không hợp lệ',
  },

  // ============================================
  // CONTRACTS - Hợp đồng
  // ============================================
  contracts: {
    title: 'Quản lý hợp đồng',
    addNew: 'Tạo hợp đồng mới',
    edit: 'Sửa hợp đồng',
    delete: 'Xóa hợp đồng',
    details: 'Chi tiết hợp đồng',
    list: 'Danh sách hợp đồng',
    
    // Fields
    contractId: 'Mã hợp đồng',
    contractNumber: 'Số hợp đồng',
    customer: 'Khách hàng',
    vehicle: 'Phương tiện',
    insuranceType: 'Loại bảo hiểm',
    startDate: 'Ngày bắt đầu',
    endDate: 'Ngày kết thúc',
    signDate: 'Ngày ký',
    premium: 'Phí bảo hiểm',
    status: 'Trạng thái',
    employee: 'Nhân viên phụ trách',
    paymentStatus: 'Trạng thái thanh toán',
    
    // Status (đã có trong config.js)
    active: 'Hiệu lực',
    expired: 'Hết hạn',
    cancelled: 'Đã hủy',
    pending: 'Chờ xử lý',
    
    // Payment Status (đã có trong config.js)
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    partiallyPaid: 'Thanh toán một phần',
    
    // Insurance Types
    compulsory: 'Bảo hiểm trách nhiệm dân sự bắt buộc',
    physical: 'Bảo hiểm vật chất xe',
    comprehensive: 'Bảo hiểm toàn diện',
    
    // Actions
    export: 'Xuất hợp đồng',
    exportContract: 'Xuất hợp đồng',
    renew: 'Gia hạn',
    cancel: 'Hủy hợp đồng',
    
    // Placeholders
    selectCustomer: 'Chọn khách hàng',
    selectVehicle: 'Chọn phương tiện',
    selectInsuranceType: 'Chọn loại bảo hiểm',
    enterPremium: 'Nhập phí bảo hiểm',
    
    // Messages
    addSuccess: 'Tạo hợp đồng thành công',
    updateSuccess: 'Cập nhật hợp đồng thành công',
    deleteSuccess: 'Xóa hợp đồng thành công',
    deleteConfirm: 'Bạn có chắc chắn muốn xóa hợp đồng này?',
    cancelConfirm: 'Bạn có chắc chắn muốn hủy hợp đồng này?',
    notFound: 'Không tìm thấy hợp đồng',
    exportSuccess: 'Xuất hợp đồng thành công',
    
    // Validation
    customerRequired: 'Vui lòng chọn khách hàng',
    vehicleRequired: 'Vui lòng chọn phương tiện',
    insuranceTypeRequired: 'Vui lòng chọn loại bảo hiểm',
    premiumRequired: 'Vui lòng nhập phí bảo hiểm',
    dateRequired: 'Vui lòng chọn ngày',
    startDateRequired: 'Vui lòng chọn ngày bắt đầu',
    endDateRequired: 'Vui lòng chọn ngày kết thúc',
  },

  // ============================================
  // ASSESSMENTS - Thẩm định
  // ============================================
  assessments: {
    title: 'Quản lý thẩm định',
    addNew: 'Tạo thẩm định mới',
    edit: 'Sửa thẩm định',
    details: 'Chi tiết thẩm định',
    list: 'Danh sách thẩm định',
    
    // Fields
    assessmentId: 'Mã thẩm định',
    contract: 'Hợp đồng',
    assessmentDate: 'Ngày thẩm định',
    location: 'Địa điểm',
    damage: 'Thiệt hại',
    estimatedCost: 'Chi phí ước tính',
    approvedAmount: 'Số tiền phê duyệt',
    status: 'Trạng thái',
    notes: 'Ghi chú',
    images: 'Hình ảnh',
    
    // Status
    pending: 'Chờ thẩm định',
    inProgress: 'Đang thẩm định',
    completed: 'Hoàn thành',
    rejected: 'Từ chối',
    
    // Messages
    addSuccess: 'Tạo thẩm định thành công',
    updateSuccess: 'Cập nhật thẩm định thành công',
    deleteSuccess: 'Xóa thẩm định thành công',
    notFound: 'Không tìm thấy thẩm định',
  },

  // ============================================
  // REPORTS - Báo cáo
  // ============================================
  reports: {
    title: 'Báo cáo',
    generate: 'Tạo báo cáo',
    export: 'Xuất báo cáo',
    
    // Types
    revenue: 'Báo cáo doanh thu',
    contracts: 'Báo cáo hợp đồng',
    customers: 'Báo cáo khách hàng',
    claims: 'Báo cáo bồi thường',
    
    // Periods
    daily: 'Hàng ngày',
    weekly: 'Hàng tuần',
    monthly: 'Hàng tháng',
    quarterly: 'Hàng quý',
    yearly: 'Hàng năm',
    custom: 'Tùy chỉnh',
    
    // Fields
    fromDate: 'Từ ngày',
    toDate: 'Đến ngày',
    reportType: 'Loại báo cáo',
    period: 'Kỳ báo cáo',
    
    // Messages
    generateSuccess: 'Tạo báo cáo thành công',
    exportSuccess: 'Xuất báo cáo thành công',
    noData: 'Không có dữ liệu báo cáo',
  },

  // ============================================
  // PAYMENTS - Thanh toán
  // ============================================
  payments: {
    title: 'Quản lý thanh toán',
    addNew: 'Thêm thanh toán',
    details: 'Chi tiết thanh toán',
    list: 'Danh sách thanh toán',
    
    // Fields
    paymentId: 'Mã thanh toán',
    contract: 'Hợp đồng',
    amount: 'Số tiền',
    paymentDate: 'Ngày thanh toán',
    paymentMethod: 'Hình thức thanh toán',
    status: 'Trạng thái',
    notes: 'Ghi chú',
    receipt: 'Biên lai',
    
    // Payment Methods (đã có trong config.js)
    cash: 'Tiền mặt',
    bankTransfer: 'Chuyển khoản',
    card: 'Thẻ',
    eWallet: 'Ví điện tử',
    
    // Actions
    exportReceipt: 'Xuất biên lai',
    
    // Messages
    addSuccess: 'Thêm thanh toán thành công',
    notFound: 'Không tìm thấy thanh toán',
    exportSuccess: 'Xuất biên lai thành công',
  },

  // ============================================
  // VALIDATION - Xác thực
  // ============================================
  validation: {
    required: 'Trường này là bắt buộc',
    email: 'Email không hợp lệ',
    phone: 'Số điện thoại không hợp lệ',
    min: 'Giá trị tối thiểu là {min}',
    max: 'Giá trị tối đa là {max}',
    minLength: 'Độ dài tối thiểu là {min} ký tự',
    maxLength: 'Độ dài tối đa là {max} ký tự',
    number: 'Vui lòng nhập số',
    positive: 'Vui lòng nhập số dương',
    date: 'Ngày không hợp lệ',
    dateRange: 'Khoảng ngày không hợp lệ',
    idCard: 'CMND/CCCD không hợp lệ',
    licensePlate: 'Biển số xe không hợp lệ',
  },

  // ============================================
  // TABLE - Bảng
  // ============================================
  table: {
    showing: 'Hiển thị',
    to: 'đến',
    of: 'trong tổng số',
    records: 'bản ghi',
    noData: 'Không có dữ liệu',
    loading: 'Đang tải dữ liệu...',
    perPage: 'bản ghi/trang',
  },
};

// Export để sử dụng
export default MESSAGES_EXTENDED;