import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import vehicleService from '../../services/vehicleService';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import SearchBar from '../../components/common/SearchBar';
import VehicleModal from './VehicleModal';
import VehicleDetailModal from './VehicleDetailModal';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailVehicleId, setDetailVehicleId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      console.log('[VehicleList] Fetching with pagination:', { page: pagination.page, limit: pagination.limit });
      const params = { 
        page: pagination.page, 
        limit: pagination.limit
      };
      if (searchTerm) params.search = searchTerm;
      
      const response = await vehicleService.getAll(params);
      setVehicles(response.data || response.list || []);
      if (response.pagination) {
        setPagination(prev => ({ ...prev, total: response.pagination.total }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, searchTerm]);

  const handlePageChange = (newPage) => {
    console.log('[VehicleList] Page change:', newPage, '→', newPage + 1);
    setPagination(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, limit: newPageSize, page: 1 }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Xác nhận xóa xe ${row.BienSo || row.MaXe}?`)) return;
    try {
      await vehicleService.delete(row.MaXe);
      alert('✅ Đã xóa xe');
      fetchVehicles();
    } catch (error) {
      alert('Lỗi: ' + (error.message || error));
    }
  };

  const handleAdd = () => {
    setSelectedVehicleId(null);
    setModalOpen(true);
  };

  const handleEdit = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedVehicleId(null);
  };

  const handleModalSuccess = () => {
    fetchVehicles();
  };

  const handleViewDetail = (vehicleId) => {
    setDetailVehicleId(vehicleId);
    setDetailModalOpen(true);
  };

  const columns = [
    { field: 'MaXe', headerName: 'Mã xe', width: 100 },
    { field: 'BienSo', headerName: 'Biển số', width: 130, renderCell: (params) => (
      <Chip label={params.row.BienSo || '-'} color="primary" size="small" />
    )},
    { field: 'HangXe', headerName: 'Hãng xe', width: 150 },
    { field: 'LoaiXe', headerName: 'Loại xe', width: 150 },
    { field: 'NamSX', headerName: 'Năm SX', width: 100 },
    { field: 'SoKhung', headerName: 'Số khung', width: 160 },
    { field: 'SoMay', headerName: 'Số máy', width: 140 },
    { field: 'TenChuXe', headerName: 'Chủ xe', width: 180 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleViewDetail(params.row.MaXe);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton 
              size="small" 
              color="warning" 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleEdit(params.row.MaXe); 
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton 
              size="small" 
              color="error" 
              onClick={(e) => { 
                e.stopPropagation(); 
                handleDelete(params.row); 
              }}
            >
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
              Quản lý phương tiện
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Danh sách tất cả xe trong hệ thống
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Thêm xe
          </Button>
        </Stack>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <SearchBar
          placeholder="Tìm kiếm theo biển số, hãng xe, chủ xe..."
          onSearch={handleSearch}
        />
      </Box>

      {/* Bảng danh sách */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={vehicles}
          loading={loading}
          emptyMessage="Chưa có phương tiện nào"
          pageSize={pagination.limit}
          rowCount={pagination.total}
          page={pagination.page - 1}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          paginationMode="server"
          getRowId={(row) => row.MaXe}
        />
      </Paper>

      {/* Modal thêm/sửa */}
      <VehicleModal
        open={modalOpen}
        onClose={handleModalClose}
        vehicleId={selectedVehicleId}
        onSuccess={handleModalSuccess}
      />

      {/* Modal xem chi tiết */}
      <VehicleDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        vehicleId={detailVehicleId}
      />
    </Container>
  );
};

export default VehicleList;
