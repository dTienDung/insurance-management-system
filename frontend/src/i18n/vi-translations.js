// ============================================
// PJICO - HỆ THỐNG NGÔN NGỮ TIẾNG VIỆT
// Tổng Công ty Bảo hiểm Petrolimex
// Version: 1.0.0
// ============================================

export const VI_TRANSLATIONS = {
  // ============================================
  // APP - Thông tin ứng dụng
  // ============================================
  app: {
    title: 'Hệ thống Quản lý Bảo hiểm PJICO',
    shortTitle: 'PJICO',
    description: 'Hệ thống quản lý hợp đồng bảo hiểm xe cơ giới',
    version: 'Phiên bản',
    copyright: '© 2025 PJICO - Tổng Công ty Bảo hiểm Petrolimex',
    allRightsReserved: 'Bản quyền thuộc về PJICO',
  },

  // ============================================
  // COMMON - Các từ/cụm từ chung
  // ============================================
  common: {
    // Hành động cơ bản
    add: 'Thêm',
    addNew: 'Thêm mới',
    edit: 'Sửa',
    update: 'Cập nhật',
    delete: 'Xóa',
    remove: 'Loại bỏ',
    save: 'Lưu',
    saveAndContinue: 'Lưu và tiếp tục',
    saveAndClose: 'Lưu và đóng',
    cancel: 'Hủy bỏ',
    close: 'Đóng',
    confirm: 'Xác nhận',
    reject: 'Từ chối',
    approve: 'Phê duyệt',
    
    // Tìm kiếm & Lọc
    search: 'Tìm kiếm',
    searchPlaceholder: 'Nhập từ khóa tìm kiếm...',
    filter: 'Lọc',
    filterBy: 'Lọc theo',
    clearFilter: 'Xóa bộ lọc',
    advancedSearch: 'Tìm kiếm nâng cao',
    
    // Xuất/Nhập
    export: 'Xuất',
    exportExcel: 'Xuất Excel',
    exportPDF: 'Xuất PDF',
    exportWord: 'Xuất Word',
    import: 'Nhập',
    importExcel: 'Nhập từ Excel',
    upload: 'Tải lên',
    download: 'Tải xuống',
    print: 'In',
    
    // Điều hướng
    back: 'Quay lại',
    next: 'Tiếp theo',
    previous: 'Trước',
    first: 'Đầu tiên',
    last: 'Cuối cùng',
    home: 'Trang chủ',
    
    // Trạng thái
    status: 'Trạng thái',
    active: 'Đang hoạt động',
    inactive: 'Ngừng hoạt động',
    pending: 'Đang chờ',
    approved: 'Đã duyệt',
    rejected: 'Đã từ chối',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  draft: 'Nháp',
    
    // Thông tin chung
    yes: 'Có',
    no: 'Không',
    ok: 'Đồng ý',
    all: 'Tất cả',
    none: 'Không có',
    select: 'Chọn',
    selectAll: 'Chọn tất cả',
    deselectAll: 'Bỏ chọn tất cả',
    view: 'Xem',
    viewDetails: 'Xem chi tiết',
    details: 'Chi tiết',
    info: 'Thông tin',
    note: 'Ghi chú',
    description: 'Mô tả',
    remark: 'Nhận xét',
    
    // Thời gian
    date: 'Ngày',
    time: 'Giờ',
    dateTime: 'Ngày giờ',
    from: 'Từ',
    to: 'Đến',
    startDate: 'Ngày bắt đầu',
    endDate: 'Ngày kết thúc',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật',
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    tomorrow: 'Ngày mai',
    thisWeek: 'Tuần này',
    thisMonth: 'Tháng này',
    thisYear: 'Năm này',
    
    // Số liệu
    total: 'Tổng',
    subtotal: 'Tổng phụ',
    amount: 'Số tiền',
    quantity: 'Số lượng',
    price: 'Giá',
    discount: 'Giảm giá',
    tax: 'Thuế',
    vat: 'VAT',
    
    // Khác
    loading: 'Đang tải...',
    processing: 'Đang xử lý...',
    noData: 'Không có dữ liệu',
    noResult: 'Không tìm thấy kết quả',
    refresh: 'Làm mới',
    actions: 'Thao tác',
    options: 'Tùy chọn',
    settings: 'Cài đặt',
    help: 'Trợ giúp',
    logout: 'Đăng xuất',
  },

  // ============================================
  // AUTH - Xác thực
  // ============================================
  auth: {
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    register: 'Đăng ký',
    forgotPassword: 'Quên mật khẩu',
    resetPassword: 'Đặt lại mật khẩu',
    changePassword: 'Đổi mật khẩu',
    
    username: 'Tên đăng nhập',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    email: 'Email',
    phone: 'Số điện thoại',
    
    rememberMe: 'Ghi nhớ đăng nhập',
    loginSuccess: 'Đăng nhập thành công',
    logoutSuccess: 'Đăng xuất thành công',
    loginFailed: 'Đăng nhập thất bại',
    invalidCredentials: 'Tên đăng nhập hoặc mật khẩu không đúng',
    sessionExpired: 'Phiên làm việc đã hết hạn',
    accountLocked: 'Tài khoản đã bị khóa',
    
    welcomeBack: 'Chào mừng trở lại',
    welcomeMessage: 'Vui lòng đăng nhập để tiếp tục',
  },

  // ============================================
  // MENU - Menu điều hướng
  // ============================================
  menu: {
    dashboard: 'Tổng quan',
    overview: 'Tổng quan',
    
    // Quản lý bảo hiểm
    insurance: 'Bảo hiểm',
    contracts: 'Hợp đồng',
    policies: 'Đơn bảo hiểm',
    claims: 'Yêu cầu bồi thường',
    
    // Khách hàng
    customers: 'Khách hàng',
    customerList: 'Danh sách khách hàng',
    customerGroups: 'Nhóm khách hàng',
    customerInfo: 'Thông tin khách hàng',
    
    // Phương tiện
    vehicles: 'Phương tiện',
    vehicleList: 'Danh sách phương tiện',
    vehicleTypes: 'Loại phương tiện',
    vehicleRegistration: 'Đăng ký phương tiện',
    
    // Giám định
    assessment: 'Giám định',
    assessmentList: 'Danh sách giám định',
    assessmentRequest: 'Yêu cầu giám định',
    assessmentReport: 'Báo cáo giám định',
    damageAssessment: 'Giám định thiệt hại',
    
    // Báo cáo
    reports: 'Báo cáo',
    salesReport: 'Báo cáo doanh số',
    claimReport: 'Báo cáo bồi thường',
    revenueReport: 'Báo cáo doanh thu',
    statisticsReport: 'Báo cáo thống kê',
    
    // Quản lý
    management: 'Quản lý',
    userManagement: 'Quản lý người dùng',
    roleManagement: 'Quản lý phân quyền',
    branchManagement: 'Quản lý chi nhánh',
    agentManagement: 'Quản lý đại lý',
    
    // Cấu hình
    settings: 'Cài đặt',
    systemSettings: 'Cài đặt hệ thống',
    profile: 'Thông tin cá nhân',
    preferences: 'Tùy chọn',
    notifications: 'Thông báo',
    
    // Hỗ trợ
    support: 'Hỗ trợ',
    documentation: 'Tài liệu',
    userGuide: 'Hướng dẫn sử dụng',
    faq: 'Câu hỏi thường gặp',
    contact: 'Liên hệ',
  },

  // ============================================
  // DASHBOARD - Trang tổng quan
  // ============================================
  dashboard: {
    title: 'Bảng điều khiển',
    welcome: 'Chào mừng',
    todaySummary: 'Tổng hợp hôm nay',
    
    // Thống kê
    statistics: 'Thống kê',
    totalContracts: 'Tổng số hợp đồng',
    activeContracts: 'Hợp đồng đang hiệu lực',
    expiredContracts: 'Hợp đồng hết hạn',
    nearExpiry: 'Sắp hết hạn',
    
    totalCustomers: 'Tổng số khách hàng',
    newCustomers: 'Khách hàng mới',
    totalVehicles: 'Tổng số xe',
    totalClaims: 'Tổng yêu cầu bồi thường',
    pendingClaims: 'Bồi thường đang chờ',
    
    revenue: 'Doanh thu',
    todayRevenue: 'Doanh thu hôm nay',
    monthRevenue: 'Doanh thu tháng',
    yearRevenue: 'Doanh thu năm',
    
    // Biểu đồ
    charts: 'Biểu đồ',
    revenueChart: 'Biểu đồ doanh thu',
    contractChart: 'Biểu đồ hợp đồng',
    claimChart: 'Biểu đồ bồi thường',
    
    // Quick actions
    quickActions: 'Thao tác nhanh',
    createContract: 'Tạo hợp đồng mới',
    addCustomer: 'Thêm khách hàng',
    registerVehicle: 'Đăng ký xe',
    newClaim: 'Yêu cầu bồi thường mới',
    
    // Notifications
    recentActivities: 'Hoạt động gần đây',
    notifications: 'Thông báo',
    alerts: 'Cảnh báo',
  },

  // ============================================
  // CONTRACT - Hợp đồng bảo hiểm
  // ============================================
  contract: {
    title: 'Hợp đồng bảo hiểm',
    contracts: 'Hợp đồng',
    contractList: 'Danh sách hợp đồng',
    newContract: 'Hợp đồng mới',
    editContract: 'Sửa hợp đồng',
    contractDetails: 'Chi tiết hợp đồng',
    
    // Thông tin hợp đồng
    contractNo: 'Số hợp đồng',
    policyNo: 'Số đơn',
    contractType: 'Loại hợp đồng',
    contractDate: 'Ngày ký',
    effectiveDate: 'Ngày hiệu lực',
    expiryDate: 'Ngày hết hạn',
    duration: 'Thời hạn',
    
    // Loại bảo hiểm
    insuranceType: 'Loại bảo hiểm',
    comprehensiveInsurance: 'Bảo hiểm toàn diện',
    thirdPartyInsurance: 'Bảo hiểm TNDS',
    physicalDamage: 'Bảo hiểm vật chất xe',
    passengerInsurance: 'Bảo hiểm người ngồi trên xe',
    
    // Phí bảo hiểm
    premium: 'Phí bảo hiểm',
    basePremium: 'Phí cơ bản',
    additionalPremium: 'Phí bổ sung',
    totalPremium: 'Tổng phí',
    discount: 'Giảm giá',
    vat: 'VAT',
    finalAmount: 'Thành tiền',
    
    // Thanh toán
    payment: 'Thanh toán',
    paymentMethod: 'Phương thức thanh toán',
    paymentStatus: 'Trạng thái thanh toán',
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    partiallyPaid: 'Thanh toán một phần',
    paymentDate: 'Ngày thanh toán',
    dueDate: 'Hạn thanh toán',
    
    // Trạng thái
    status: 'Trạng thái',
    draft: 'Nháp',
    pending: 'Chờ duyệt',
    active: 'Đang hiệu lực',
    expired: 'Đã hết hạn',
    cancelled: 'Đã hủy',
    suspended: 'Tạm ngừng',
    
    // Thao tác
    createContract: 'Tạo hợp đồng',
    renewContract: 'Gia hạn hợp đồng',
    cancelContract: 'Hủy hợp đồng',
    printContract: 'In hợp đồng',
    sendEmail: 'Gửi email',
    
    // Thông báo
    createSuccess: 'Tạo hợp đồng thành công',
    updateSuccess: 'Cập nhật hợp đồng thành công',
    deleteSuccess: 'Xóa hợp đồng thành công',
    renewSuccess: 'Gia hạn hợp đồng thành công',
  },

  // ============================================
  // CUSTOMER - Khách hàng
  // ============================================
  customer: {
    title: 'Khách hàng',
    customers: 'Khách hàng',
    customerList: 'Danh sách khách hàng',
    newCustomer: 'Khách hàng mới',
    editCustomer: 'Sửa thông tin khách hàng',
    customerDetails: 'Chi tiết khách hàng',
    
    // Thông tin cá nhân
    personalInfo: 'Thông tin cá nhân',
    customerCode: 'Mã khách hàng',
    customerType: 'Loại khách hàng',
    individual: 'Cá nhân',
    corporate: 'Doanh nghiệp',
    
    fullName: 'Họ và tên',
    companyName: 'Tên công ty',
    gender: 'Giới tính',
    male: 'Nam',
    female: 'Nữ',
    dateOfBirth: 'Ngày sinh',
    
    // Giấy tờ
    identification: 'Giấy tờ tùy thân',
    idNumber: 'Số CMND/CCCD',
    passportNo: 'Số hộ chiếu',
    taxCode: 'Mã số thuế',
    businessLicense: 'Giấy phép kinh doanh',
    issueDate: 'Ngày cấp',
    issuePlace: 'Nơi cấp',
    
    // Liên hệ
    contactInfo: 'Thông tin liên hệ',
    phone: 'Điện thoại',
    mobile: 'Di động',
    email: 'Email',
    fax: 'Fax',
    website: 'Website',
    
    // Địa chỉ
    address: 'Địa chỉ',
    street: 'Số nhà, đường',
    ward: 'Phường/Xã',
    district: 'Quận/Huyện',
    city: 'Tỉnh/Thành phố',
    country: 'Quốc gia',
    postalCode: 'Mã bưu điện',
    
    // Ngân hàng
    bankInfo: 'Thông tin ngân hàng',
    bankName: 'Tên ngân hàng',
    bankBranch: 'Chi nhánh',
    accountNumber: 'Số tài khoản',
    accountName: 'Tên tài khoản',
    
    // Thống kê
    statistics: 'Thống kê',
    totalContracts: 'Tổng hợp đồng',
    totalPremium: 'Tổng phí bảo hiểm',
    totalClaims: 'Tổng bồi thường',
    joinDate: 'Ngày tham gia',
    lastTransaction: 'Giao dịch gần nhất',
    
    // Thao tác
    createCustomer: 'Thêm khách hàng',
    importCustomers: 'Nhập danh sách',
    exportCustomers: 'Xuất danh sách',
    mergeCustomers: 'Gộp khách hàng',
  },

  // ============================================
  // VEHICLE - Phương tiện
  // ============================================
  vehicle: {
    title: 'Phương tiện',
    vehicles: 'Phương tiện',
    vehicleList: 'Danh sách phương tiện',
    newVehicle: 'Thêm phương tiện',
    editVehicle: 'Sửa thông tin xe',
    vehicleDetails: 'Chi tiết phương tiện',
    
    // Thông tin xe
    vehicleInfo: 'Thông tin xe',
    licensePlate: 'Biển số xe',
    chassisNo: 'Số khung',
    engineNo: 'Số máy',
    registrationNo: 'Số đăng ký',
    registrationDate: 'Ngày đăng ký',
    
    // Loại xe
    vehicleType: 'Loại xe',
    car: 'Ô tô',
    truck: 'Xe tải',
    bus: 'Xe buýt',
    motorcycle: 'Xe máy',
    trailer: 'Rơ moóc',
    
    // Thông tin chi tiết
    brand: 'Hãng xe',
    model: 'Model',
    year: 'Năm sản xuất',
    color: 'Màu sơn',
    seats: 'Số chỗ ngồi',
    tonnage: 'Tải trọng',
    engineCapacity: 'Dung tích',
    
    // Mục đích sử dụng
    purpose: 'Mục đích sử dụng',
    personal: 'Cá nhân',
    commercial: 'Kinh doanh',
    transportation: 'Vận tải',
    tourism: 'Du lịch',
    
    // Giá trị
    valuation: 'Định giá',
    marketValue: 'Giá thị trường',
    insuredValue: 'Giá trị bảo hiểm',
    depreciatedValue: 'Giá trị còn lại',
    
    // Trạng thái
    vehicleStatus: 'Trạng thái xe',
    active: 'Đang hoạt động',
    inactive: 'Ngừng hoạt động',
    underRepair: 'Đang sửa chữa',
    sold: 'Đã bán',
    scrapped: 'Đã thanh lý',
    
    // Lịch sử
    history: 'Lịch sử',
    insuranceHistory: 'Lịch sử bảo hiểm',
    claimHistory: 'Lịch sử bồi thường',
    maintenanceHistory: 'Lịch sử bảo dưỡng',
  },

  // ============================================
  // ASSESSMENT - Giám định
  // ============================================
  assessment: {
    title: 'Giám định',
    assessments: 'Giám định',
    assessmentList: 'Danh sách giám định',
    newAssessment: 'Tạo yêu cầu giám định',
    editAssessment: 'Sửa giám định',
    assessmentDetails: 'Chi tiết giám định',
    
    // Thông tin giám định
    assessmentNo: 'Số giám định',
    assessmentDate: 'Ngày giám định',
    assessmentType: 'Loại giám định',
    initialAssessment: 'Giám định ban đầu',
    reAssessment: 'Giám định lại',
    supplementaryAssessment: 'Giám định bổ sung',
    
    // Giám định viên
    assessor: 'Giám định viên',
    assessorName: 'Tên giám định viên',
    assessorCode: 'Mã giám định viên',
    assessorCompany: 'Công ty giám định',
    assignDate: 'Ngày phân công',
    
    // Thiệt hại
    damage: 'Thiệt hại',
    damageType: 'Loại thiệt hại',
    damageDescription: 'Mô tả thiệt hại',
    damageCause: 'Nguyên nhân',
    damageLocation: 'Địa điểm',
    damageDate: 'Thời gian xảy ra',
    
    // Đánh giá
    assessment: 'Đánh giá',
    estimatedCost: 'Chi phí ước tính',
    actualCost: 'Chi phí thực tế',
    repairCost: 'Chi phí sửa chữa',
    replacementCost: 'Chi phí thay thế',
    laborCost: 'Chi phí nhân công',
    partsCost: 'Chi phí phụ tùng',
    
    // Hình ảnh
    images: 'Hình ảnh',
    beforeRepair: 'Trước sửa chữa',
    afterRepair: 'Sau sửa chữa',
    damagePhotos: 'Ảnh thiệt hại',
    uploadImages: 'Tải ảnh lên',
    
    // Báo cáo
    report: 'Báo cáo',
    assessmentReport: 'Báo cáo giám định',
    generateReport: 'Tạo báo cáo',
    approveReport: 'Phê duyệt báo cáo',
    rejectReport: 'Từ chối báo cáo',
    
    // Trạng thái
    assessmentStatus: 'Trạng thái giám định',
    pending: 'Chờ giám định',
    inProgress: 'Đang giám định',
    completed: 'Hoàn thành',
    approved: 'Đã phê duyệt',
    rejected: 'Đã từ chối',
  },

  // ============================================
  // CLAIM - Bồi thường
  // ============================================
  claim: {
    title: 'Bồi thường',
    claims: 'Yêu cầu bồi thường',
    claimList: 'Danh sách bồi thường',
    newClaim: 'Tạo yêu cầu bồi thường',
    editClaim: 'Sửa yêu cầu bồi thường',
    claimDetails: 'Chi tiết bồi thường',
    
    // Thông tin bồi thường
    claimNo: 'Số yêu cầu',
    claimDate: 'Ngày yêu cầu',
    incidentDate: 'Ngày xảy ra sự cố',
    reportDate: 'Ngày báo cáo',
    
    // Loại bồi thường
    claimType: 'Loại bồi thường',
    accident: 'Tai nạn',
    theft: 'Mất cắp',
    fire: 'Cháy nổ',
    naturalDisaster: 'Thiên tai',
    otherDamage: 'Thiệt hại khác',
    
    // Chi tiết sự cố
    incidentDetails: 'Chi tiết sự cố',
    location: 'Địa điểm',
    description: 'Mô tả',
    policeReport: 'Biên bản công an',
    witnesses: 'Nhân chứng',
    
    // Số tiền bồi thường
    claimAmount: 'Số tiền yêu cầu',
    approvedAmount: 'Số tiền được duyệt',
    deductible: 'Mức khấu trừ',
    payableAmount: 'Số tiền thanh toán',
    
    // Thanh toán
    paymentInfo: 'Thông tin thanh toán',
    paymentDate: 'Ngày thanh toán',
    paymentMethod: 'Phương thức thanh toán',
    bankTransfer: 'Chuyển khoản',
    cash: 'Tiền mặt',
    cheque: 'Séc',
    
    // Hồ sơ
    documents: 'Hồ sơ',
    requiredDocuments: 'Hồ sơ cần thiết',
    submittedDocuments: 'Hồ sơ đã nộp',
    missingDocuments: 'Hồ sơ thiếu',
    
    // Trạng thái
    claimStatus: 'Trạng thái bồi thường',
    submitted: 'Đã gửi',
    underReview: 'Đang xem xét',
    investigating: 'Đang điều tra',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    paid: 'Đã thanh toán',
    closed: 'Đã đóng',
  },

  // ============================================
  // REPORT - Báo cáo
  // ============================================
  report: {
    title: 'Báo cáo',
    reports: 'Báo cáo',
    generateReport: 'Tạo báo cáo',
    viewReport: 'Xem báo cáo',
    exportReport: 'Xuất báo cáo',
    
    // Loại báo cáo
    reportType: 'Loại báo cáo',
    dailyReport: 'Báo cáo hàng ngày',
    weeklyReport: 'Báo cáo hàng tuần',
    monthlyReport: 'Báo cáo hàng tháng',
    quarterlyReport: 'Báo cáo hàng quý',
    yearlyReport: 'Báo cáo hàng năm',
    customReport: 'Báo cáo tùy chỉnh',
    
    // Báo cáo doanh số
    salesReport: 'Báo cáo doanh số',
    newContracts: 'Hợp đồng mới',
    renewedContracts: 'Hợp đồng gia hạn',
    cancelledContracts: 'Hợp đồng hủy',
    totalRevenue: 'Tổng doanh thu',
    
    // Báo cáo bồi thường
    claimReport: 'Báo cáo bồi thường',
    totalClaims: 'Tổng yêu cầu',
    approvedClaims: 'Yêu cầu được duyệt',
    rejectedClaims: 'Yêu cầu bị từ chối',
    totalPayout: 'Tổng chi trả',
    
    // Báo cáo khách hàng
    customerReport: 'Báo cáo khách hàng',
    newCustomers: 'Khách hàng mới',
    activeCustomers: 'Khách hàng hoạt động',
    lostCustomers: 'Khách hàng rời bỏ',
    
    // Báo cáo hiệu suất
    performanceReport: 'Báo cáo hiệu suất',
    kpi: 'KPI',
    target: 'Mục tiêu',
    achieved: 'Đạt được',
    percentage: 'Phần trăm',
    
    // Tùy chọn báo cáo
    reportOptions: 'Tùy chọn báo cáo',
    dateRange: 'Khoảng thời gian',
    groupBy: 'Nhóm theo',
    sortBy: 'Sắp xếp theo',
    includeChart: 'Bao gồm biểu đồ',
  },

  // ============================================
  // USER - Người dùng
  // ============================================
  user: {
    title: 'Người dùng',
    users: 'Người dùng',
    userList: 'Danh sách người dùng',
    newUser: 'Thêm người dùng',
    editUser: 'Sửa người dùng',
    userDetails: 'Chi tiết người dùng',
    
    // Thông tin tài khoản
    accountInfo: 'Thông tin tài khoản',
    username: 'Tên đăng nhập',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    userCode: 'Mã nhân viên',
    
    // Thông tin cá nhân
    personalInfo: 'Thông tin cá nhân',
    fullName: 'Họ và tên',
    firstName: 'Tên',
    lastName: 'Họ',
    email: 'Email',
    phone: 'Điện thoại',
    position: 'Chức vụ',
    department: 'Phòng ban',
    branch: 'Chi nhánh',
    
    // Phân quyền
    permissions: 'Phân quyền',
    role: 'Vai trò',
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    staff: 'Nhân viên',
    agent: 'Đại lý',
    
    // Trạng thái
    userStatus: 'Trạng thái',
    active: 'Đang hoạt động',
    inactive: 'Ngừng hoạt động',
    locked: 'Đã khóa',
    pending: 'Chờ kích hoạt',
    
    // Hoạt động
    activities: 'Hoạt động',
    lastLogin: 'Đăng nhập lần cuối',
    loginHistory: 'Lịch sử đăng nhập',
    activityLog: 'Nhật ký hoạt động',
    
    // Thao tác
    resetPassword: 'Đặt lại mật khẩu',
    lockAccount: 'Khóa tài khoản',
    unlockAccount: 'Mở khóa tài khoản',
    sendActivation: 'Gửi email kích hoạt',
  },

  // ============================================
  // SETTINGS - Cài đặt
  // ============================================
  settings: {
    title: 'Cài đặt',
    generalSettings: 'Cài đặt chung',
    systemSettings: 'Cài đặt hệ thống',
    
    // Công ty
    companyInfo: 'Thông tin công ty',
    companyName: 'Tên công ty',
    companyAddress: 'Địa chỉ',
    companyPhone: 'Điện thoại',
    companyEmail: 'Email',
    companyWebsite: 'Website',
    
    // Cấu hình
    configuration: 'Cấu hình',
    language: 'Ngôn ngữ',
    vietnamese: 'Tiếng Việt',
    english: 'Tiếng Anh',
    timezone: 'Múi giờ',
    dateFormat: 'Định dạng ngày',
    currency: 'Tiền tệ',
    
    // Email
    emailSettings: 'Cài đặt Email',
    smtpServer: 'Máy chủ SMTP',
    smtpPort: 'Cổng SMTP',
    emailUsername: 'Tên đăng nhập',
    emailPassword: 'Mật khẩu',
    senderEmail: 'Email gửi',
    senderName: 'Tên người gửi',
    
    // Bảo mật
    security: 'Bảo mật',
    passwordPolicy: 'Chính sách mật khẩu',
    minLength: 'Độ dài tối thiểu',
    requireUppercase: 'Yêu cầu chữ hoa',
    requireLowercase: 'Yêu cầu chữ thường',
    requireNumber: 'Yêu cầu số',
    requireSpecialChar: 'Yêu cầu ký tự đặc biệt',
    passwordExpiry: 'Thời hạn mật khẩu',
    
    // Sao lưu
    backup: 'Sao lưu',
    backupSettings: 'Cài đặt sao lưu',
    autoBackup: 'Sao lưu tự động',
    backupFrequency: 'Tần suất sao lưu',
    backupLocation: 'Vị trí sao lưu',
    lastBackup: 'Sao lưu gần nhất',
    restoreBackup: 'Khôi phục sao lưu',
    
    // Nhật ký
    logs: 'Nhật ký',
    systemLogs: 'Nhật ký hệ thống',
    errorLogs: 'Nhật ký lỗi',
    accessLogs: 'Nhật ký truy cập',
    auditLogs: 'Nhật ký kiểm toán',
  },

  // ============================================
  // MESSAGES - Thông báo
  // ============================================
  messages: {
    // Success messages
    success: {
      save: 'Lưu thành công',
      update: 'Cập nhật thành công',
      delete: 'Xóa thành công',
      create: 'Tạo mới thành công',
      send: 'Gửi thành công',
      approve: 'Phê duyệt thành công',
      reject: 'Từ chối thành công',
      cancel: 'Hủy thành công',
      upload: 'Tải lên thành công',
      download: 'Tải xuống thành công',
      export: 'Xuất dữ liệu thành công',
      import: 'Nhập dữ liệu thành công',
      login: 'Đăng nhập thành công',
      logout: 'Đăng xuất thành công',
      passwordChanged: 'Đổi mật khẩu thành công',
    },
    
    // Error messages
    error: {
      general: 'Có lỗi xảy ra',
      save: 'Lưu thất bại',
      update: 'Cập nhật thất bại',
      delete: 'Xóa thất bại',
      create: 'Tạo mới thất bại',
      notFound: 'Không tìm thấy dữ liệu',
      unauthorized: 'Không có quyền truy cập',
      forbidden: 'Truy cập bị từ chối',
      validation: 'Dữ liệu không hợp lệ',
      network: 'Lỗi kết nối mạng',
      server: 'Lỗi máy chủ',
      timeout: 'Hết thời gian chờ',
      login: 'Đăng nhập thất bại',
      invalidCredentials: 'Thông tin đăng nhập không đúng',
    },
    
    // Warning messages
    warning: {
      unsavedChanges: 'Bạn có thay đổi chưa lưu',
      deleteConfirm: 'Bạn có chắc chắn muốn xóa?',
      cancelConfirm: 'Bạn có chắc chắn muốn hủy?',
      logoutConfirm: 'Bạn có chắc chắn muốn đăng xuất?',
      dataLoss: 'Dữ liệu chưa lưu sẽ bị mất',
    },
    
    // Info messages
    info: {
      loading: 'Đang tải dữ liệu...',
      processing: 'Đang xử lý...',
      noData: 'Không có dữ liệu',
      selectItem: 'Vui lòng chọn một mục',
      fillRequired: 'Vui lòng điền đầy đủ thông tin bắt buộc',
    },
    
    // Validation messages
    validation: {
      required: 'Trường này là bắt buộc',
      email: 'Email không hợp lệ',
      phone: 'Số điện thoại không hợp lệ',
      number: 'Vui lòng nhập số',
      minLength: 'Độ dài tối thiểu là {min} ký tự',
      maxLength: 'Độ dài tối đa là {max} ký tự',
      minValue: 'Giá trị tối thiểu là {min}',
      maxValue: 'Giá trị tối đa là {max}',
      pattern: 'Định dạng không hợp lệ',
      passwordMatch: 'Mật khẩu không khớp',
      dateInvalid: 'Ngày không hợp lệ',
      futureDate: 'Ngày phải trong tương lai',
      pastDate: 'Ngày phải trong quá khứ',
    },
  },

  // ============================================
  // FORMS - Biểu mẫu
  // ============================================
  form: {
    // Labels
    label: {
      required: 'Bắt buộc',
      optional: 'Tùy chọn',
      selectOption: 'Chọn một tùy chọn',
      selectDate: 'Chọn ngày',
      selectTime: 'Chọn giờ',
      uploadFile: 'Tải file lên',
      chooseFile: 'Chọn file',
      dragDropFile: 'Kéo thả file vào đây',
      searchPlaceholder: 'Tìm kiếm...',
    },
    
    // Buttons
    button: {
      submit: 'Gửi',
      save: 'Lưu',
      saveAndNew: 'Lưu và tạo mới',
      saveAndClose: 'Lưu và đóng',
      cancel: 'Hủy',
      reset: 'Đặt lại',
      clear: 'Xóa',
      back: 'Quay lại',
      next: 'Tiếp theo',
      previous: 'Trước',
      finish: 'Hoàn thành',
    },
    
    // Placeholders
    placeholder: {
      enterText: 'Nhập văn bản',
      enterNumber: 'Nhập số',
      enterEmail: 'Nhập email',
      enterPassword: 'Nhập mật khẩu',
      enterPhone: 'Nhập số điện thoại',
      selectOption: 'Chọn một tùy chọn',
      selectDate: 'Chọn ngày',
      search: 'Tìm kiếm...',
    },
  },

  // ============================================
  // TABLE - Bảng
  // ============================================
  table: {
    // Headers
    actions: 'Thao tác',
    no: 'STT',
    
    // Pagination
    pagination: {
      showing: 'Hiển thị',
      of: 'trong',
      entries: 'mục',
      rowsPerPage: 'Số dòng mỗi trang',
      page: 'Trang',
      goToPage: 'Đi tới trang',
    },
    
    // Sorting
    sort: {
      sortBy: 'Sắp xếp theo',
      ascending: 'Tăng dần',
      descending: 'Giảm dần',
    },
    
    // Filter
    filter: {
      filter: 'Lọc',
      clearFilter: 'Xóa bộ lọc',
      applyFilter: 'Áp dụng',
    },
    
    // Empty state
    empty: {
      noData: 'Không có dữ liệu',
      noResults: 'Không tìm thấy kết quả',
    },
  },

  // ============================================
  // MODAL - Hộp thoại
  // ============================================
  modal: {
    // Titles
    confirmation: 'Xác nhận',
    warning: 'Cảnh báo',
    error: 'Lỗi',
    success: 'Thành công',
    info: 'Thông tin',
    
    // Messages
    confirmDelete: 'Bạn có chắc chắn muốn xóa?',
    confirmCancel: 'Bạn có chắc chắn muốn hủy?',
    confirmSave: 'Bạn có muốn lưu thay đổi?',
    dataWillBeLost: 'Dữ liệu chưa lưu sẽ bị mất',
    
    // Buttons
    ok: 'Đồng ý',
    cancel: 'Hủy',
    yes: 'Có',
    no: 'Không',
    close: 'Đóng',
  },
};

export default VI_TRANSLATIONS;