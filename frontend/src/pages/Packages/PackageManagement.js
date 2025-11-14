import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import packageService from '../../services/packageService';

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [formData, setFormData] = useState({
    TenGoi: '',
    MoTa: '',
    TyLePhiCoBan: '',
    LoaiPhamVi: '',
    TrangThai: 'Hoạt động'
  });

  useEffect(() => {
    fetchPackages();
  }, [pagination.page, pagination.limit, searchTerm]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });
      setPackages(response.data || response.list || []);
      if (response.pagination) {
        setPagination(prev => ({ ...prev, total: response.pagination.total }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pkg = null) => {
    if (pkg) {
      setEditMode(true);
      setCurrentPackage(pkg);
      setFormData({
        TenGoi: pkg.TenGoi || '',
        MoTa: pkg.MoTa || '',
        TyLePhiCoBan: pkg.TyLePhiCoBan || '',
        LoaiPhamVi: pkg.LoaiPhamVi || '',
        TrangThai: pkg.TrangThai || 'Hoạt động'
      });
    } else {
      setEditMode(false);
      setCurrentPackage(null);
      setFormData({
        TenGoi: '',
        MoTa: '',
        TyLePhiCoBan: '',
        LoaiPhamVi: '',
        TrangThai: 'Hoạt động'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentPackage(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMode && currentPackage) {
        await packageService.update(currentPackage.MaGoi, formData);
        alert('✅ Đã cập nhật gói bảo hiểm');
      } else {
        await packageService.create(formData);
        alert('✅ Đã thêm gói bảo hiểm mới');
      }
      handleCloseDialog();
      fetchPackages();
    } catch (error) {
      alert('Lỗi: ' + (error.message || error));
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Xác nhận xóa gói ${row.TenGoi}?`)) return;
    try {
      await packageService.delete(row.MaGoi);
      alert('✅ Đã xóa gói bảo hiểm');
      fetchPackages();
    } catch (error) {
      alert('Lỗi: ' + (error.message || error));
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ ...prev, limit: newPageSize, page: 1 }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const columns = [
    { field: 'MaGoi', headerName: 'Mã gói', width: 100 },
    { field: 'TenGoi', headerName: 'Tên gói', width: 250 },
    { field: 'MoTa', headerName: 'Mô tả', width: 300 },
    { field: 'TyLePhiCoBan', headerName: 'Tỷ lệ phí cơ bản', width: 150, renderCell: (row) => `${row.TyLePhiCoBan}%` },
    { field: 'LoaiPhamVi', headerName: 'Loại phạm vi', width: 150 },
    { field: 'TrangThai', headerName: 'Trạng thái', width: 120, renderCell: (row) => (
      <Chip 
        label={row.TrangThai} 
        color={row.TrangThai === 'Hoạt động' ? 'success' : 'default'} 
        size="small" 
      />
    )},
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); handleOpenDialog(row); }}>
              <EditIcon fontSize="small" />
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
              Quản lý gói bảo hiểm
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Danh sách các gói bảo hiểm trong hệ thống
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm gói
          </Button>
        </Stack>
      </Box>

      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearch}
        placeholder="Tìm gói bảo hiểm (tên, mã)..."
      />

      {/* Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table
          columns={columns}
          data={packages}
          loading={loading}
          emptyMessage="Chưa có gói bảo hiểm nào"
          pageSize={pagination.limit}
          rowCount={pagination.total}
          page={pagination.page - 1}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          paginationMode="server"
          getRowId={(row) => row.MaGoi}
        />
      </Paper>

      {/* Dialog Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editMode ? 'Chỉnh sửa gói bảo hiểm' : 'Thêm gói bảo hiểm mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên gói *"
                value={formData.TenGoi}
                onChange={(e) => setFormData({ ...formData, TenGoi: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                value={formData.MoTa}
                onChange={(e) => setFormData({ ...formData, MoTa: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tỷ lệ phí cơ bản (%) *"
                type="number"
                inputProps={{ step: "0.01", min: "0", max: "100" }}
                value={formData.TyLePhiCoBan}
                onChange={(e) => setFormData({ ...formData, TyLePhiCoBan: e.target.value })}
                helperText="Ví dụ: 2.5 nghĩa là 2.5% giá trị xe"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Loại phạm vi"
                value={formData.LoaiPhamVi}
                onChange={(e) => setFormData({ ...formData, LoaiPhamVi: e.target.value })}
                placeholder="Ví dụ: Toàn diện, Cơ bản, TNDS"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Trạng thái"
                value={formData.TrangThai}
                onChange={(e) => setFormData({ ...formData, TrangThai: e.target.value })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Ngưng">Ngưng</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PackageManagement;
