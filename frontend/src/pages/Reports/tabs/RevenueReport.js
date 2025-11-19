import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import {
  PictureAsPdf,
  Description,
  Print
} from '@mui/icons-material';
import reportService from '../../../services/reportService';

const RevenueReport = () => {
  const [filters, setFilters] = useState({
    fromDate: dayjs().subtract(30, 'day'),
    toDate: dayjs(),
    package: 'all'
  });

  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    ytdRevenue: 0,
    targetAchievement: 0,
    growthMoM: 0,
    growthYoY: 0,
    monthlyData: [],
    packageBreakdown: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Only load once initially or when dates change significantly (user action)
    if (!hasLoaded || filters.fromDate || filters.toDate) {
      loadReportData();
      setHasLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.fromDate?.format('YYYY-MM-DD'), filters.toDate?.format('YYYY-MM-DD')]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const fromDate = filters.fromDate.format('YYYY-MM-DD');
      const toDate = filters.toDate.format('YYYY-MM-DD');

      const response = await reportService.getMonthlyRevenue({
        fromDate,
        toDate
      });

      if (response.success) {
        const data = response.data || [];
        const totalRevenue = data.reduce((sum, item) => sum + (item.DoanhThu || 0), 0);
        
        setReportData({
          totalRevenue,
          ytdRevenue: totalRevenue,
          targetAchievement: 0,
          growthMoM: 0,
          growthYoY: 0,
          monthlyData: data,
          packageBreakdown: []
        });
      }
    } catch (err) {
      console.error('Error loading report:', err);
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      setError('');
      const year = filters.fromDate.year();
      await reportService.exportRevenuePDF(year);
      alert('Xuất PDF thành công!');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Đã xảy ra lỗi khi xuất PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      setError('');
      await reportService.exportToExcel('revenue', {
        fromDate: filters.fromDate.format('YYYY-MM-DD'),
        toDate: filters.toDate.format('YYYY-MM-DD')
      });
      alert('Xuất Excel thành công!');
    } catch (err) {
      console.error('Error exporting Excel:', err);
      setError('Đã xảy ra lỗi khi xuất Excel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Từ ngày"
                value={filters.fromDate}
                onChange={(newValue) => setFilters({ ...filters, fromDate: newValue })}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <DatePicker
                label="Đến ngày"
                value={filters.toDate}
                onChange={(newValue) => setFilters({ ...filters, toDate: newValue })}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Gói bảo hiểm</InputLabel>
                <Select
                  value={filters.package}
                  label="Gói bảo hiểm"
                  onChange={(e) => setFilters({ ...filters, package: e.target.value })}
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="coban">Cơ Bản</MenuItem>
                  <MenuItem value="nangcao">Nâng Cao</MenuItem>
                  <MenuItem value="toandien">Toàn Diện</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="outlined" startIcon={<Print />}>
                Xem trước
              </Button>
              <Button variant="contained" startIcon={<PictureAsPdf />} onClick={handleExportPDF} disabled={loading}>
                Xuất PDF
              </Button>
              <Button variant="contained" color="success" startIcon={<Description />} onClick={handleExportExcel} disabled={loading}>
                Xuất Excel
              </Button>
            </Stack>
          </Grid>
        </Grid>
        </LocalizationProvider>
      </Paper>

      {/* Report Preview */}
      <Paper sx={{ p: 4, minHeight: 800 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && (
          <>
        {/* Header - Mẫu hành chính */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" fontWeight={600}>
              TỔNG CÔNG TY BẢO HIỂM PETROLIMEX
            </Typography>
            <Typography variant="caption">PJICO</Typography>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Typography variant="subtitle2" fontWeight={600}>
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </Typography>
            <Typography variant="caption">Độc lập – Tự do – Hạnh phúc</Typography>
          </Grid>
        </Grid>

        <Box textAlign="center" sx={{ my: 4 }}>
          <Typography variant="caption">Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</Typography>
          <Typography variant="h5" fontWeight={700} sx={{ my: 2 }}>
            BÁO CÁO DOANH THU PHÍ BẢO HIỂM
          </Typography>
          <Typography variant="subtitle2">
            Kỳ báo cáo: {filters.timeType === 'year' ? 'Năm' : filters.timeType === 'quarter' ? 'Quý' : 'Tháng'} {filters.year}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* I. Tổng hợp doanh thu */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            I. TỔNG HỢP DOANH THU
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Chỉ tiêu</strong></TableCell>
                  <TableCell align="right"><strong>Giá trị (VNĐ)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Tổng GWP trong kỳ</TableCell>
                  <TableCell align="right">{reportData.totalRevenue.toLocaleString('vi-VN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Lũy kế từ đầu năm</TableCell>
                  <TableCell align="right">{reportData.ytdRevenue.toLocaleString('vi-VN')}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>So với kế hoạch</TableCell>
                  <TableCell align="right">{reportData.targetAchievement}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* II. Tăng trưởng */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            II. TĂNG TRƯỞNG
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Chỉ tiêu</strong></TableCell>
                  <TableCell align="right"><strong>Tỷ lệ</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>So với kỳ trước</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>+{reportData.growthMoM}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>So với cùng kỳ năm trước</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>+{reportData.growthYoY}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* III. Phân bổ theo gói bảo hiểm */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            III. PHÂN BỔ DOANH THU THEO GÓI BẢO HIỂM
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Gói bảo hiểm</strong></TableCell>
                  <TableCell align="right"><strong>Doanh thu (VNĐ)</strong></TableCell>
                  <TableCell align="right"><strong>Tỷ trọng (%)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.packageBreakdown.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.package}</TableCell>
                    <TableCell align="right">{item.revenue.toLocaleString('vi-VN')}</TableCell>
                    <TableCell align="right">{item.percentage}%</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell><strong>Tổng cộng</strong></TableCell>
                  <TableCell align="right"><strong>{reportData.totalRevenue.toLocaleString('vi-VN')}</strong></TableCell>
                  <TableCell align="right"><strong>100%</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Signature Section */}
        <Grid container spacing={4} sx={{ mt: 6 }}>
          <Grid item xs={6} textAlign="center">
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              PHỤ TRÁCH BỘ PHẬN
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 8 }}>
              (Ký, ghi rõ họ tên)
            </Typography>
            <Typography variant="body2">____________________</Typography>
          </Grid>
          <Grid item xs={6} textAlign="center">
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              NGƯỜI BÁO CÁO
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 8 }}>
              (Ký, ghi rõ họ tên)
            </Typography>
            <Typography variant="body2">____________________</Typography>
          </Grid>
        </Grid>
        </>
        )}
      </Paper>
    </Box>
  );
};

export default RevenueReport;
