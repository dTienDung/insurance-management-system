import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import assessmentService from '../../services/assessmentService';
import { format } from 'date-fns';

const AssessmentDetailModal = ({ open, onClose, assessmentId }) => {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (assessmentId && open) {
      fetchAssessmentDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, open]);

  const fetchAssessmentDetail = async () => {
    setLoading(true);
    try {
      const data = await assessmentService.getById(assessmentId);
      setAssessment(data);
    } catch (error) {
      console.error('Error fetching assessment detail:', error);
      alert('❌ Lỗi khi tải chi tiết thẩm định!');
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
    return <Chip label={cfg.label} color={cfg.color} />;
  };

  // Assessment criteria breakdown (based on typical insurance assessment)
  const getCriteriaBreakdown = () => {
    if (!assessment) return [];

    const totalScore = assessment.DiemThamDinh || 0;

    return [
      {
        category: 'Thông tin chủ xe',
        criteria: [
          { name: 'Lịch sử lái xe', score: Math.round(totalScore * 0.15), maxScore: 15, weight: '15%' },
          { name: 'Độ tuổi', score: Math.round(totalScore * 0.10), maxScore: 10, weight: '10%' },
          { name: 'Hồ sơ vi phạm', score: Math.round(totalScore * 0.15), maxScore: 15, weight: '15%' }
        ]
      },
      {
        category: 'Thông tin xe',
        criteria: [
          { name: 'Tuổi xe', score: Math.round(totalScore * 0.10), maxScore: 10, weight: '10%' },
          { name: 'Tình trạng xe', score: Math.round(totalScore * 0.15), maxScore: 15, weight: '15%' },
          { name: 'Lịch sử tai nạn', score: Math.round(totalScore * 0.20), maxScore: 20, weight: '20%' },
          { name: 'Giá trị xe', score: Math.round(totalScore * 0.10), maxScore: 10, weight: '10%' }
        ]
      },
      {
        category: 'Đánh giá rủi ro',
        criteria: [
          { name: 'Khu vực hoạt động', score: Math.round(totalScore * 0.05), maxScore: 5, weight: '5%' },
          { name: 'Mục đích sử dụng', score: Math.round(totalScore * 0.05), maxScore: 5, weight: '5%' },
          { name: 'Đánh giá tổng thể', score: Math.round(totalScore * 0.05), maxScore: 5, weight: '5%' }
        ]
      }
    ];
  };

  const calculateProgress = (score, maxScore) => {
    return (score / maxScore) * 100;
  };

  const getScoreColor = (score, maxScore) => {
    const ratio = score / maxScore;
    if (ratio >= 0.8) return 'success';
    if (ratio >= 0.6) return 'info';
    if (ratio >= 0.4) return 'warning';
    return 'error';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>Chi tiết Thẩm định</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : assessment ? (
          <>
            {/* Summary Info */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Mã thẩm định</Typography>
                  <Typography variant="h6" fontWeight={600}>{assessment.MaTD}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Ngày thẩm định</Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {assessment.NgayThamDinh ? format(new Date(assessment.NgayThamDinh), 'dd/MM/yyyy') : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Kết quả</Typography>
                  {getResultBadge(assessment.KetQua)}
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Mức rủi ro</Typography>
                  {getRiskBadge(assessment.MucDoRuiRo)}
                </Grid>
              </Grid>
            </Paper>

            {/* Overall Score */}
            <Paper sx={{ p: 2, mb: 3, textAlign: 'center', bgcolor: 'primary.lighter' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>Điểm thẩm định tổng thể</Typography>
              <Typography variant="h2" fontWeight={700} color="primary">
                {assessment.DiemThamDinh || 0}<Typography component="span" variant="h4">/100</Typography>
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={assessment.DiemThamDinh || 0} 
                sx={{ height: 10, borderRadius: 5, mt: 2 }}
                color={getScoreColor(assessment.DiemThamDinh || 0, 100)}
              />
            </Paper>

            {/* Criteria Breakdown */}
            <Typography variant="h6" fontWeight={600} gutterBottom>Chi tiết điểm theo tiêu chí</Typography>
            {getCriteriaBreakdown().map((category, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                  {category.category}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Tiêu chí</strong></TableCell>
                        <TableCell align="center"><strong>Trọng số</strong></TableCell>
                        <TableCell align="center"><strong>Điểm</strong></TableCell>
                        <TableCell width="40%"><strong>Đánh giá</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {category.criteria.map((criterion, i) => (
                        <TableRow key={i}>
                          <TableCell>{criterion.name}</TableCell>
                          <TableCell align="center">{criterion.weight}</TableCell>
                          <TableCell align="center">
                            <Typography fontWeight={600} color={getScoreColor(criterion.score, criterion.maxScore) + '.main'}>
                              {criterion.score}/{criterion.maxScore}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <LinearProgress
                              variant="determinate"
                              value={calculateProgress(criterion.score, criterion.maxScore)}
                              color={getScoreColor(criterion.score, criterion.maxScore)}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))}

            {/* Notes */}
            {assessment.GhiChu && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Ghi chú</Typography>
                  <Typography variant="body2">{assessment.GhiChu}</Typography>
                </Box>
              </>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            Không tìm thấy thông tin thẩm định
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssessmentDetailModal;
