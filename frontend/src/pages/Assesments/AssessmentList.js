import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import assessmentService from '../../services/assessmentService';
import ContractFormModal from './ContractFormModal';
import AssessmentDetailModal from './AssessmentDetailModal';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
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
  CircularProgress
} from '@mui/material';

const AssessmentList = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleViewDetail = (id) => {
    setSelectedAssessmentId(id);
    setDetailModalOpen(true);
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

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentService.getAll();

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
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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

  const filteredData = filter === 'all' 
    ? assessments 
    : assessments.filter(a => {
        if (filter === 'pending') return a.KetQua === 'Yêu cầu bổ sung';
        if (filter === 'approved') return a.KetQua === 'Chấp nhận';
        if (filter === 'rejected') return a.KetQua === 'Từ chối';
        return true;
      });

  const columns = [
    { key: 'MaTD', label: 'Mã thẩm định' },
    { key: 'MaHD', label: 'Hợp đồng' },
    {
      key: 'NgayThamDinh',
      label: 'Ngày thẩm định',
      render: (row) => format(new Date(row.NgayThamDinh), 'dd/MM/yyyy')
    },
    {
      key: 'MucDoRuiRo',
      label: 'Mức rủi ro',
      render: (row) => getRiskBadge(row.MucDoRuiRo)
    },
    {
      key: 'KetQua',
      label: 'Kết quả',
      render: (row) => getResultBadge(row.KetQua)
    },
    { 
      key: 'GhiChu', 
      label: 'Ghi chú',
      render: (row) => (
        <div title={row.GhiChu} style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.GhiChu}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Button variant="text" size="small" onClick={() => handleViewDetail(row.MaTD)}>
            Chi tiết
          </Button>
          {row.KetQua === 'Chấp nhận' && (
            <Button variant="contained" size="small" color="success" onClick={() => handleCreateContract(row)}>
              Tạo HĐ
            </Button>
          )}
          {row.KetQua !== 'Từ chối' && (
            <Button variant="outlined" size="small" color="error" onClick={() => handleReject(row.MaTD)}>
              Từ chối
            </Button>
          )}
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
          onChange={(e, v) => v && setFilter(v)}
          size="small"
        >
          <ToggleButton value="all">Tất cả</ToggleButton>
          <ToggleButton value="pending">Chờ bổ sung</ToggleButton>
          <ToggleButton value="approved">Đã duyệt</ToggleButton>
          <ToggleButton value="rejected">Từ chối</ToggleButton>
        </ToggleButtonGroup>
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
              data={filteredData}
              loading={loading}
              emptyMessage="Chưa có thẩm định nào"
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
