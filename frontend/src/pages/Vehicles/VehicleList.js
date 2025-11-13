import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import VehicleModal from './VehicleModal';
import VehicleDetailModal from './VehicleDetailModal';

const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailVehicleId, setDetailVehicleId] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAll();
      setVehicles(response.data || response.list || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
    { field: 'BienSo', headerName: 'Biển số', width: 130, renderCell: (row) => (
      <Chip label={row.BienSo || '-'} color="primary" size="small" />
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
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => row.MaXe && handleViewDetail(row.MaXe)}
              disabled={!row.MaXe}
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
                if (row.MaXe) handleEdit(row.MaXe); 
              }}
              disabled={!row.MaXe}
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
                if (row.MaXe) handleDelete(row); 
              }}
              disabled={!row.MaXe}
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

      {/* Bảng danh sách */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={vehicles}
          loading={loading}
          emptyMessage="Chưa có phương tiện nào"
          pageSize={10}
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
