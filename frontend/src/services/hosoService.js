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
  async getAll({ status, page = 1, limit = 10 } = {}) {
    const params = {};
    if (status && status !== 'all') params.status = status; // if later backend supports status filtering
    params.page = page;
    params.limit = limit;

    const response = await api.get('/hoso', { params });
    const list = normalizeListResponse(response);
    const pagination = response.data?.pagination || { page, limit, total: list.length };
    return { list, pagination };
  },

  async getById(id) {
    const response = await api.get(`/hoso/${id}`);
    return response.data?.data || response.data; // supports both {success,data} and raw object
  }
};

export default hosoService;