import api from './api';

// Normalizes various possible response shapes into an array
function normalizeListResponse(res) {
  if (!res) return [];
  // If using new standardized backend: { success, data, pagination }
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data)) return res.data;
  // Fallback older style
  if (Array.isArray(res.records)) return res.records;
  if (Array.isArray(res.items)) return res.items;
  console.warn('[hosoService] Unexpected response shape', res);
  return [];
}

const hosoService = {
  // Lấy tất cả hồ sơ
  async getAll({ status, page = 1, limit = 10 } = {}) {
    const params = {};
    if (status && status !== 'all') params.status = status;
    params.page = page;
    params.limit = limit;

    const response = await api.get('/hoso', { params });
    const list = normalizeListResponse(response);
    const pagination = response.data?.pagination || { page, limit, total: list.length };
    return { list, pagination };
  },

  // Lấy hồ sơ chờ thẩm định
  async getHoSoChoThamDinh() {
    try {
      const response = await api.get('/hoso/cho-tham-dinh');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lấy chi tiết hồ sơ (bao gồm điểm thẩm định)
  async getById(id) {
    const response = await api.get(`/hoso/${id}`);
    return response.data?.data || response.data;
  },

  // Tạo hồ sơ mới (tự động thẩm định)
  async create(data) {
    try {
      const response = await api.post('/hoso', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Duyệt hồ sơ
  async approve(id, data = {}) {
    try {
      const response = await api.put(`/hoso/${id}/approve`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Từ chối hồ sơ
  async reject(id, data) {
    try {
      const response = await api.put(`/hoso/${id}/reject`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Lập hợp đồng từ hồ sơ
  async lapHopDong(data) {
    try {
      const response = await api.post('/hoso/lap-hopdong', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Xóa hồ sơ
  async delete(id) {
    try {
      const response = await api.delete(`/hoso/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default hosoService;