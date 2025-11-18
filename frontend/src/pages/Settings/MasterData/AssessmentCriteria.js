// ============================================
// PJICO - Assessment Criteria Component
// Quản lý Ma trận Thẩm định
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

import assessmentCriteriaService from '../../../services/assessmentCriteriaService';

function AssessmentCriteria() {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState(null);
  const [formData, setFormData] = useState({
    TieuChi: '',
    DieuKien: '',
    Diem: 0,
    GhiChu: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    loadCriteria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const loadCriteria = async () => {
    try {
      setLoading(true);
      const response = await assessmentCriteriaService.getAll({
        page: page + 1,
        limit: rowsPerPage
      });
      setCriteria(response.data);
      setTotalRecords(response.pagination?.total || 0);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách tiêu chí');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (criteria = null) => {
    if (criteria) {
      setEditMode(true);
      setCurrentCriteria(criteria);
      setFormData({
        TieuChi: criteria.TieuChi,
        DieuKien: criteria.DieuKien,
        Diem: criteria.Diem,
        GhiChu: criteria.GhiChu || ''
      });
    } else {
      setEditMode(false);
      setCurrentCriteria(null);
      setFormData({
        TieuChi: '',
        DieuKien: '',
        Diem: 0,
        GhiChu: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      TieuChi: '',
      DieuKien: '',
      Diem: 0,
      GhiChu: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Diem' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.TieuChi || !formData.DieuKien) {
        setError('Vui lòng nhập đầy đủ Tiêu chí và Điều kiện');
        return;
      }

      if (formData.Diem < -100 || formData.Diem > 100) {
        setError('Điểm phải từ -100 đến +100');
        return;
      }

      setLoading(true);
      if (editMode) {
        await assessmentCriteriaService.update(currentCriteria.ID, formData);
        setSuccess('Cập nhật tiêu chí thành công');
      } else {
        await assessmentCriteriaService.create(formData);
        setSuccess('Tạo tiêu chí thành công');
      }
      
      handleCloseDialog();
      loadCriteria();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa tiêu chí này?')) {
      return;
    }

    try {
      setLoading(true);
      await assessmentCriteriaService.delete(id);
      setSuccess('Xóa tiêu chí thành công');
      loadCriteria();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa tiêu chí');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderScoreChip = (score) => {
    if (score > 0) {
      return (
        <Chip
          icon={<TrendingUpIcon />}
          label={`+${score}`}
          color="success"
          size="small"
        />
      );
    } else if (score < 0) {
      return (
        <Chip
          icon={<TrendingDownIcon />}
          label={score}
          color="error"
          size="small"
        />
      );
    } else {
      return <Chip label="0" size="small" />;
    }
  };

  return (
    <Box>
      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Danh sách Tiêu chí Thẩm định
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm tiêu chí
        </Button>
      </Box>

      {/* Table */}
      {loading && !criteria.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tiêu chí</TableCell>
                  <TableCell>Điều kiện</TableCell>
                  <TableCell align="center">Điểm</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criteria.map((item) => (
                  <TableRow key={item.ID} hover>
                    <TableCell>{item.ID}</TableCell>
                    <TableCell>{item.TieuChi}</TableCell>
                    <TableCell>{item.DieuKien}</TableCell>
                    <TableCell align="center">
                      {renderScoreChip(item.Diem)}
                    </TableCell>
                    <TableCell>{item.GhiChu || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(item.ID)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {criteria.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Chưa có tiêu chí nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalRecords}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
          />
        </>
      )}

      {/* Dialog Form */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Sửa tiêu chí' : 'Thêm tiêu chí mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Tiêu chí"
              name="TieuChi"
              value={formData.TieuChi}
              onChange={handleInputChange}
              fullWidth
              required
              placeholder="VD: Tuổi xe"
            />
            <TextField
              label="Điều kiện"
              name="DieuKien"
              value={formData.DieuKien}
              onChange={handleInputChange}
              fullWidth
              required
              placeholder="VD: < 5 năm"
            />
            <TextField
              label="Điểm"
              name="Diem"
              type="number"
              value={formData.Diem}
              onChange={handleInputChange}
              fullWidth
              required
              inputProps={{ min: -100, max: 100 }}
              helperText="Từ -100 đến +100"
            />
            <TextField
              label="Ghi chú"
              name="GhiChu"
              value={formData.GhiChu}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
              placeholder="Mô tả thêm về tiêu chí"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (editMode ? 'Cập nhật' : 'Tạo mới')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AssessmentCriteria;
