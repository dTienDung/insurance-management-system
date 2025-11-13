import React, { useState } from 'react';
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
  TableRow
} from '@mui/material';
import {
  PictureAsPdf,
  Description,
  Print
} from '@mui/icons-material';

const RevenueReport = () => {
  const [filters, setFilters] = useState({
    timeType: 'year',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: Math.floor(new Date().getMonth() / 3) + 1,
    package: 'all'
  });

  const [reportData] = useState({
    totalRevenue: 12500000000,
    ytdRevenue: 85000000000,
    targetAchievement: 105,
    growthMoM: 8.5,
    growthYoY: 15.2,
    packageBreakdown: [
      { package: 'Cơ Bản', revenue: 4500000000, percentage: 36 },
      { package: 'Nâng Cao', revenue: 5200000000, percentage: 41.6 },
      { package: 'Toàn Diện', revenue: 2800000000, percentage: 22.4 }
    ]
  });

  const handleExportPDF = () => {
    // Export logic
    alert('Đang xuất báo cáo PDF...');
  };

  return (
    <Box>
      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Kỳ báo cáo</InputLabel>
              <Select
                value={filters.timeType}
                label="Kỳ báo cáo"
                onChange={(e) => setFilters({ ...filters, timeType: e.target.value })}
              >
                <MenuItem value="month">Tháng</MenuItem>
                <MenuItem value="quarter">Quý</MenuItem>
                <MenuItem value="year">Năm</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Năm</InputLabel>
              <Select
                value={filters.year}
                label="Năm"
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <MenuItem key={year} value={year}>{year}</MenuItem>;
                })}
              </Select>
            </FormControl>
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
              <Button variant="contained" startIcon={<PictureAsPdf />} onClick={handleExportPDF}>
                Xuất PDF
              </Button>
              <Button variant="contained" color="success" startIcon={<Description />}>
                Xuất Excel
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Preview */}
      <Paper sx={{ p: 4, minHeight: 800 }}>
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
      </Paper>
    </Box>
  );
};

export default RevenueReport;
