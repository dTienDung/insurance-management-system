import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Stack,
  Chip,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import HoSoModal from './HoSoModal';
import HoSoDetailModal from './HoSoDetailModal';
import hosoService from '../../services/hosoService';

// Force rebuild - timestamp: 2025-11-13T07:55:00
const HoSoList = () => {
  console.log('[HoSoList] Component loaded at:', new Date().toISOString());
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [filter, setFilter] = useState('all'); // placeholder for future status filter
  const [page] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHoSoId, setSelectedHoSoId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailHoSoId, setDetailHoSoId] = useState(null);

  useEffect(() => {
    fetchHoso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  async function fetchHoso() {
    try {
      setLoading(true);
      const { list, pagination: pg } = await hosoService.getAll({ status: filter, page });
      console.log('[HoSoList] Raw list from API:', list);
      // Transform data to add id field
      const transformedList = list.map(item => ({
        ...item,
        id: item.MaHS
      }));
      console.log('[HoSoList] Transformed list:', transformedList);
      setData(transformedList);
      setPagination(pg);
    } catch (error) {
      console.error('[HoSoList] Fetch error:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  function getStatusChip(status) {
    const statusMap = {
      'Chờ thẩm định': { color: 'warning', label: 'Chờ thẩm định' },
      'Đã thẩm định': { color: 'success', label: 'Đã thẩm định' },
      'Từ chối': { color: 'error', label: 'Từ chối' }
    };
    const cfg = statusMap[status] || { color: 'default', label: status };
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Xác nhận xóa hồ sơ ${row.MaHS}?`)) return;
    try {
      await hosoService.delete(row.MaHS);
      alert('✅ Đã xóa hồ sơ');
      fetchHoso();
    } catch (error) {
      alert('Lỗi: ' + (error.message || error));
    }
  };

  const handleAdd = () => {
    setSelectedHoSoId(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedHoSoId(null);
  };

  const handleModalSuccess = () => {
    fetchHoso();
  };

  const handleViewDetail = (maHS) => {
    setDetailHoSoId(maHS);
    setDetailModalOpen(true);
  };

  const columns = [
    { field: 'MaHS', headerName: 'Mã HS', width: 110 },
    { field: 'TenKhach', headerName: 'Khách hàng', width: 180, renderCell: row => row.TenKhach || row.MaKH },
    { field: 'BienSo', headerName: 'Biển số', width: 120 },
    { field: 'RiskScore', headerName: 'Điểm rủi ro', width: 110, renderCell: row => row.RiskScore || '-' },
    { field: 'RiskLevel', headerName: 'Mức rủi ro', width: 140, renderCell: row => {
      if (!row.RiskLevel) return '-';
      const colorMap = {
        'CHẤP NHẬN': 'success',
        'XEM XÉT': 'warning',
        'TỪ CHỐI': 'error'
      };
      return <Chip label={row.RiskLevel} color={colorMap[row.RiskLevel] || 'default'} size="small" />;
    }},
    { field: 'TrangThai', headerName: 'Trạng thái', width: 150, renderCell: row => getStatusChip(row.TrangThai) },
    { field: 'NgayLap', headerName: 'Ngày lập', width: 140, renderCell: row => row.NgayLap ? new Date(row.NgayLap).toLocaleDateString('vi-VN') : '' },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" color="primary" onClick={() => handleViewDetail(row.MaHS)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Hồ sơ thẩm định
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý hồ sơ thẩm định rủi ro
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Tạo hồ sơ
          </Button>
        </Stack>
      </Box>

      {/* Bảng danh sách */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="Chưa có hồ sơ nào"
          pageSize={pagination.limit || 10}
          getRowId={(row) => row.MaHS}
        />
      </Paper>

      {/* Modal thêm/sửa */}
      <HoSoModal
        open={modalOpen}
        onClose={handleModalClose}
        hosoId={selectedHoSoId}
        onSuccess={handleModalSuccess}
      />

      {/* Modal xem chi tiết */}
      <HoSoDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        hosoId={detailHoSoId}
      />
    </Container>
  );
};

export default HoSoList;
