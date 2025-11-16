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
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
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
  
  // Default: last 30 days
  const getDefaultFromDate = () => {
    return dayjs().subtract(30, 'day');
  };
  
  const getDefaultToDate = () => {
    return dayjs();
  };
  
  const [fromDate, setFromDate] = useState(getDefaultFromDate());
  const [toDate, setToDate] = useState(getDefaultToDate());

  useEffect(() => {
    loadDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardStats = async () => {
    // Stats will be loaded from backend when needed
  };

  const handleExportPDF = async (reportType) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      switch (reportType) {
        case 'revenue':
          await reportService.exportRevenuePDF(fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD'));
          setSuccess('Đã xuất báo cáo doanh thu thành công!');
          break;
        case 'renewal':
          await reportService.exportRenewalPDF(fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD'));
          setSuccess('Đã xuất báo cáo tái tục thành công!');
          break;
        case 'assessment':
          await reportService.exportAssessmentPDF(fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD'));
          setSuccess('Đã xuất báo cáo thẩm định thành công!');
          break;
        case 'business':
          await reportService.exportBusinessPDF(fromDate.format('YYYY-MM-DD'), toDate.format('YYYY-MM-DD'));
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

        {/* Chọn khoảng thời gian */}
        <Box sx={{ mb: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Từ ngày"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    sx: { minWidth: 200 }
                  }
                }}
              />
              <DatePicker
                label="Đến ngày"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    sx: { minWidth: 200 }
                  }
                }}
              />
            </Stack>
          </LocalizationProvider>
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
            • Dữ liệu được tính toán tự động từ hệ thống theo khoảng thời gian đã chọn
            <br />
            • File PDF sẽ được tải xuống tự động sau khi tạo thành công
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReportDashboard;
