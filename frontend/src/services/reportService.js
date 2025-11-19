import api from './api';

const reportService = {
  // ============================================
  // BÁO CÁO DOANH THU
  // ============================================

  getMonthlyRevenue: async (params) => {
    try {
      // Extract year value if params is an object with year property
      const year = typeof params === 'object' ? params.year : params;
      
      const response = await api.get('/reports/revenue/monthly', {
        params: { year: parseInt(year) || new Date().getFullYear() }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getYearlyRevenue: async () => {
    try {
      const response = await api.get('/reports/revenue/yearly');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ============================================
  // BÁO CÁO HỢP ĐỒNG
  // ============================================

  getContractsByStatus: async () => {
    try {
      const response = await api.get('/reports/contracts/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getExpiringContracts: async (days = 30) => {
    try {
      const response = await api.get('/reports/contracts/expiring', {
        params: { days }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getNewContracts: async (fromDate, toDate) => {
    try {
      const response = await api.get('/reports/contracts/new', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ============================================
  // BÁO CÁO KHÁCH HÀNG
  // ============================================

  getNewCustomers: async (fromDate, toDate) => {
    try {
      const response = await api.get('/reports/customers/new', {
        params: { fromDate, toDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getTopCustomers: async (limit = 10) => {
    try {
      const response = await api.get('/reports/customers/top', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ============================================
  // BÁO CÁO TÁI TỤC
  // ============================================

  getRenewalReport: async (params) => {
    try {
      const response = await api.get('/reports/renewal', {
        params
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ============================================
  // BÁO CÁO THẨM ĐỊNH
  // ============================================

  getAssessmentsByRiskLevel: async (year) => {
    try {
      const response = await api.get('/reports/assessments/risk-level', {
        params: { year }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRiskAnalysis: async (year) => {
    try {
      const response = await api.get('/reports/risk-analysis', {
        params: { year }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ============================================
  // DASHBOARD
  // ============================================

  getDashboardStats: async () => {
    try {
      const response = await api.get('/reports/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ============================================
  // XUẤT BÁO CÁO PDF (CHUẨN VIỆT NAM)
  // ============================================

  /**
   * Xuất báo cáo doanh thu PDF
   */
  exportRevenuePDF: async (year) => {
    try {
      const response = await api.get('/reports/export/pdf/revenue', {
        params: { year },
        responseType: 'blob'
      });
      
      // Tạo link download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_DoanhThu_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Xuất báo cáo tái tục PDF
   */
  exportRenewalPDF: async (year) => {
    try {
      const response = await api.get('/reports/export/pdf/renewal', {
        params: { year },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_TaiTuc_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Xuất báo cáo thẩm định PDF
   */
  exportAssessmentPDF: async (year) => {
    try {
      const response = await api.get('/reports/export/pdf/assessment', {
        params: { year },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_ThamDinh_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Xuất báo cáo quản trị nghiệp vụ PDF
   */
  exportBusinessPDF: async (year) => {
    try {
      const response = await api.get('/reports/export/pdf/business', {
        params: { year },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_QuanTriNghiepVu_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ============================================
  // REQUEST CACHING - Tránh duplicate requests
  // ============================================
  _cache: new Map(),
  _pendingRequests: new Map(),

  _getCachedOrFetch: async function(cacheKey, fetchFn, ttl = 30000) {
    // Check cache
    const cached = this._cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    // Check if request is in flight
    if (this._pendingRequests.has(cacheKey)) {
      return this._pendingRequests.get(cacheKey);
    }

    // Make new request
    const promise = fetchFn()
      .then(data => {
        this._cache.set(cacheKey, { data, timestamp: Date.now() });
        this._pendingRequests.delete(cacheKey);
        return data;
      })
      .catch(error => {
        this._pendingRequests.delete(cacheKey);
        throw error;
      });

    this._pendingRequests.set(cacheKey, promise);
    return promise;
  },

  clearCache: function() {
    this._cache.clear();
    this._pendingRequests.clear();
  },

  // ============================================
  // BÁO CÁO NGHIỆP VỤ - 4 TABS
  // ============================================

  /**
   * Lấy dữ liệu Dashboard Nghiệp vụ (Tab 1)
   */
  getOperationalDashboard: async function(params) {
    const cacheKey = `operational-dashboard-${JSON.stringify(params)}`;
    return this._getCachedOrFetch(cacheKey, async () => {
      const response = await api.get('/reports/operational-dashboard', { params });
      return response.data;
    });
  },

  /**
   * Lấy dữ liệu Báo cáo Doanh thu (Tab 2)
   */
  getRevenueReportData: async function(params) {
    const cacheKey = `revenue-report-${JSON.stringify(params)}`;
    return this._getCachedOrFetch(cacheKey, async () => {
      const response = await api.get('/reports/revenue-report', { params });
      return response.data;
    });
  },

  /**
   * Lấy dữ liệu Báo cáo Tái tục (Tab 3)
   */
  getRenewalReportData: async function(params) {
    const cacheKey = `renewal-report-${JSON.stringify(params)}`;
    return this._getCachedOrFetch(cacheKey, async () => {
      const response = await api.get('/reports/renewal-report', { params });
      return response.data;
    });
  },

  /**
   * Lấy dữ liệu Báo cáo Hỗ trợ Thẩm định (Tab 4)
   */
  getAssessmentReportData: async function(params) {
    const cacheKey = `assessment-report-${JSON.stringify(params)}`;
    return this._getCachedOrFetch(cacheKey, async () => {
      const response = await api.get('/reports/assessment-report', { params });
      return response.data;
    });
  },

  // ============================================
  // XUẤT EXCEL
  // ============================================

  exportToExcel: async (reportType, params) => {
    try {
      const response = await api.post('/reports/export/excel', {
        reportType,
        ...params
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BaoCao_${reportType}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default reportService;
