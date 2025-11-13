import React, { useState, useEffect } from 'react';
import reportService from '../../services/reportService';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Autorenew as RenewIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

const ReportDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);

  // Danh sách năm (5 năm gần nhất)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await reportService.getDashboardStats();
      setStats(response.data || {});
    } catch (err) {
      console.error('Lỗi tải thống kê:', err);
      setError('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (reportType) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      switch (reportType) {
        case 'revenue':
          await reportService.exportRevenuePDF(selectedYear);
          setSuccess('Đã xuất báo cáo doanh thu thành công!');
          break;
        case 'renewal':
          await reportService.exportRenewalPDF(selectedYear);
          setSuccess('Đã xuất báo cáo tái tục thành công!');
          break;
        case 'assessment':
          await reportService.exportAssessmentPDF(selectedYear);
          setSuccess('Đã xuất báo cáo thẩm định thành công!');
          break;
        case 'business':
          await reportService.exportBusinessPDF(selectedYear);
          setSuccess('Đã xuất báo cáo quản trị nghiệp vụ thành công!');
          break;
        default:
          setError('Loại báo cáo không hợp lệ');
      }
    } catch (err) {
      console.error('Lỗi xuất báo cáo:', err);
      setError(err.message || 'Không thể xuất báo cáo PDF');
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      title: 'Báo cáo Doanh thu Phí Bảo hiểm',
      description: 'Thống kê doanh thu theo tháng, quý, năm với tỷ lệ tăng trưởng',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#1976d2',
      type: 'revenue'
    },
    {
      title: 'Báo cáo Tái tục Hợp đồng',
      description: 'Phân tích số lượng hợp đồng tái tục, tỷ lệ thành công/thất bại',
      icon: <RenewIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#2e7d32',
      type: 'renewal'
    },
    {
      title: 'Báo cáo Hỗ trợ Thẩm định',
      description: 'Thống kê hồ sơ theo mức độ rủi ro, yếu tố rủi ro phổ biến',
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#ed6c02',
      type: 'assessment'
    },
    {
      title: 'Báo cáo Quản trị Nghiệp vụ',
      description: 'Tổng hợp các chỉ tiêu nghiệp vụ: hợp đồng, khách hàng, doanh thu',
      icon: <BarChartIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: '#0288d1',
      type: 'business'
    }
  ];
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Hệ thống Báo cáo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xuất các báo cáo theo định dạng chuẩn văn bản hành chính Việt Nam
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Thông báo */}
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

        {/* Chọn năm */}
        <Box sx={{ mb: 4 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Năm báo cáo</InputLabel>
            <Select
              value={selectedYear}
              label="Năm báo cáo"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Các loại báo cáo */}
        <Grid container spacing={3}>
          {reportCards.map((report, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderLeft: `5px solid ${report.color}`,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>
                      {report.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {report.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {report.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
                      onClick={() => handleExportPDF(report.type)}
                      disabled={loading}
                      sx={{ backgroundColor: report.color }}
                    >
                      Xuất PDF
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Thông tin bổ sung */}
        <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            <strong>Lưu ý:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Các báo cáo được xuất theo định dạng PDF chuẩn văn bản hành chính Việt Nam
            <br />
            • Bao gồm đầy đủ: Quốc hiệu, Tiêu ngữ, Thông tin người báo cáo, Chữ ký xác nhận
            <br />
            • Dữ liệu được tính toán tự động từ hệ thống theo năm đã chọn
            <br />
            • File PDF sẽ được tải xuống tự động sau khi tạo thành công
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReportDashboard;
