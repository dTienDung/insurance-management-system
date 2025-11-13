import api from './api';

const reportService = {
  // ============================================
  // BÁO CÁO DOANH THU
  // ============================================

  getMonthlyRevenue: async (year) => {
    try {
      const response = await api.get('/reports/revenue/monthly', {
        params: { year }
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

  getRenewalReport: async (year, month) => {
    try {
      const response = await api.get('/reports/renewal', {
        params: { year, month }
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
