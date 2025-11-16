import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assessmentService from '../../services/assessmentService';
import ContractFormModal from './ContractFormModal';
import AssessmentDetailModal from './AssessmentDetailModal';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import { format } from 'date-fns';
import {
  Container,
  Box,
  Typography,
  Stack,
  Grid,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const AssessmentList = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      if (searchTerm) params.search = searchTerm;
      if (filter !== 'all') {
        if (filter === 'pending') params.ketQua = 'Yêu cầu bổ sung';
        if (filter === 'approved') params.ketQua = 'Chấp nhận';
        if (filter === 'rejected') params.ketQua = 'Từ chối';
      }
      
      const data = await assessmentService.getAll(params);

      // Normalize possible response shapes
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data && Array.isArray(data.assessments)) {
        list = data.assessments;
      } else if (data && Array.isArray(data.items)) {
        list = data.items;
      } else {
        console.warn('Unexpected assessments response shape, expected array-like but got:', data);
      }

      setAssessments(list);
      if (data && data.pagination) {
        setPagination(prev => ({ ...prev, total: data.pagination.total }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, pagination.page, pagination.limit, searchTerm]);

  const handleViewDetail = (id) => {
    setSelectedAssessmentId(id);
    setDetailModalOpen(true);
  };

  const handleEdit = (id) => {
    navigate(`/assessments/edit/${id}`);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Xác nhận xóa thẩm định ${row.MaTD}?`)) return;
    try {
      await assessmentService.delete(row.MaTD);
      alert('✅ Đã xóa thẩm định');
      fetchAssessments();
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

  const handleCreateContract = (assessment) => {
    setSelectedAssessment(assessment);
    setContractModalOpen(true);
  };

  const handleReject = async (id) => {
    if (!window.confirm('Xác nhận từ chối thẩm định này?')) return;
    
    try {
      await assessmentService.update(id, { KetQua: 'Từ chối' });
      alert('✅ Đã từ chối thẩm định!');
      fetchAssessments();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Lỗi khi từ chối thẩm định!');
    }
  };

  const getRiskBadge = (risk) => {
    const map = {
      'Thấp': { color: 'success', label: 'Thấp' },
      'Trung bình': { color: 'warning', label: 'Trung bình' },
      'Cao': { color: 'warning', label: 'Cao' },
      'Rất cao': { color: 'error', label: 'Rất cao' }
    };
    const cfg = map[risk] || { color: 'default', label: risk || '-' };
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
  };

  const getResultBadge = (result) => {
    const map = {
      'Chấp nhận': { color: 'success', label: 'Chấp nhận' },
      'Từ chối': { color: 'error', label: 'Từ chối' },
      'Yêu cầu bổ sung': { color: 'warning', label: 'Yêu cầu bổ sung' }
    };
    const cfg = map[result] || { color: 'default', label: result || '-' };
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
  };

  const columns = [
    { field: 'MaTD', headerName: 'Mã thẩm định', width: 130 },
    { field: 'MaHD', headerName: 'Hợp đồng', width: 130 },
    {
      field: 'NgayThamDinh',
      headerName: 'Ngày thẩm định',
      width: 140,
      renderCell: (params) => params.row.NgayThamDinh ? format(new Date(params.row.NgayThamDinh), 'dd/MM/yyyy') : '-'
    },
    {
      field: 'MucDoRuiRo',
      headerName: 'Mức rủi ro',
      width: 140,
      renderCell: (params) => getRiskBadge(params.row.MucDoRuiRo)
    },
    {
      field: 'KetQua',
      headerName: 'Kết quả',
      width: 150,
      renderCell: (params) => getResultBadge(params.row.KetQua)
    },
    { 
      field: 'GhiChu', 
      headerName: 'Ghi chú',
      width: 200,
      renderCell: (params) => (
        <div title={params.row.GhiChu} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {params.row.GhiChu || '-'}
        </div>
      )
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleViewDetail(params.row.MaTD); }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" color="warning" onClick={(e) => { e.stopPropagation(); handleEdit(params.row.MaTD); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.KetQua === 'Chấp nhận' && (
            <Tooltip title="Tạo hợp đồng">
              <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleCreateContract(params.row); }}>
                <DocumentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {params.row.KetQua !== 'Từ chối' && (
            <Tooltip title="Từ chối">
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleReject(params.row.MaTD); }}>
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Xóa">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(params.row); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={700}>Quản lý Thẩm định</Typography>
            <Typography variant="body2" color="text.secondary">Danh sách thẩm định hợp đồng bảo hiểm</Typography>
          </Box>
          <Button onClick={() => navigate('/assessments/new')} startIcon={null}>+ Tạo thẩm định</Button>
        </Stack>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, v) => { if (v) setFilter(v); setPagination(prev => ({ ...prev, page: 1 })); }}
          size="small"
        >
          <ToggleButton value="all">Tất cả</ToggleButton>
          <ToggleButton value="pending">Chờ bổ sung</ToggleButton>
          <ToggleButton value="approved">Đã duyệt</ToggleButton>
          <ToggleButton value="rejected">Từ chối</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <SearchBar
          placeholder="Tìm kiếm theo mã thẩm định, hợp đồng..."
          onSearch={handleSearch}
        />
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">Tổng thẩm định</Typography>
            <Typography variant="h5" fontWeight={700}>{assessments.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">Chấp nhận</Typography>
            <Typography variant="h5" fontWeight={700} color="success.main">{assessments.filter(a => a.KetQua === 'Chấp nhận').length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">Từ chối</Typography>
            <Typography variant="h5" fontWeight={700} color="error.main">{assessments.filter(a => a.KetQua === 'Từ chối').length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary">Chờ bổ sung</Typography>
            <Typography variant="h5" fontWeight={700} color="warning.main">{assessments.filter(a => a.KetQua === 'Yêu cầu bổ sung').length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={6}><CircularProgress /></Box>
        ) : (
          <Box p={2}>
            <Table
              columns={columns}
              data={assessments}
              loading={loading}
              emptyMessage="Chưa có thẩm định nào"
              pageSize={pagination.limit}
              rowCount={pagination.total}
              page={pagination.page - 1}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              paginationMode="server"
              getRowId={(row) => row.MaTD}
            />
          </Box>
        )}
      </Paper>

      {/* Modals */}
      <ContractFormModal
        open={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        onSuccess={() => {
          fetchAssessments();
          setContractModalOpen(false);
        }}
        assessment={selectedAssessment}
      />
      <AssessmentDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        assessmentId={selectedAssessmentId}
      />
    </Container>
  );
};

export default AssessmentList;
