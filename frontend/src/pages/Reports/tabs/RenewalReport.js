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

const RenewalReport = () => {
  const [filters, setFilters] = useState({
    timeType: 'year',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: Math.floor(new Date().getMonth() / 3) + 1
  });

  const [reportData] = useState({
    totalExpiring: 850,
    renewed: 680,
    notRenewed: 170,
    renewalRate: 80,
    reasonsNotRenewed: [
      { reason: 'Chuyển nhà bảo hiểm khác', count: 85, percentage: 50 },
      { reason: 'Không còn nhu cầu', count: 45, percentage: 26.5 },
      { reason: 'Phí cao', count: 25, percentage: 14.7 },
      { reason: 'Khác', count: 15, percentage: 8.8 }
    ],
    discountAnalysis: {
      withDiscount: 450,
      withoutDiscount: 230,
      averageDiscount: 8.5
    }
  });

  const handleExportPDF = () => {
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

          <Grid item xs={12} md={8}>
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
            BÁO CÁO TÁI TỤC BẢO HIỂM
          </Typography>
          <Typography variant="subtitle2">
            Kỳ báo cáo: {filters.timeType === 'year' ? 'Năm' : filters.timeType === 'quarter' ? 'Quý' : 'Tháng'} {filters.year}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* I. Tổng quan tái tục */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            I. TỔNG QUAN TÁI TỤC
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Chỉ tiêu</strong></TableCell>
                  <TableCell align="right"><strong>Số lượng</strong></TableCell>
                  <TableCell align="right"><strong>Tỷ lệ (%)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Tổng HĐ đáo hạn</TableCell>
                  <TableCell align="right">{reportData.totalExpiring}</TableCell>
                  <TableCell align="right">100%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Đã tái tục</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>{reportData.renewed}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>{reportData.renewalRate}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Không tái tục</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>{reportData.notRenewed}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>{100 - reportData.renewalRate}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* II. Phân tích lý do không tái tục */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            II. PHÂN TÍCH LÝ DO KHÔNG TÁI TỤC
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Lý do</strong></TableCell>
                  <TableCell align="right"><strong>Số lượng</strong></TableCell>
                  <TableCell align="right"><strong>Tỷ trọng (%)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.reasonsNotRenewed.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                    <TableCell align="right">{item.percentage}%</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell><strong>Tổng cộng</strong></TableCell>
                  <TableCell align="right"><strong>{reportData.notRenewed}</strong></TableCell>
                  <TableCell align="right"><strong>100%</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* III. Phân tích ưu đãi tái tục */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            III. PHÂN TÍCH ƯU ĐÃI TÁI TỤC
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Chỉ tiêu</strong></TableCell>
                  <TableCell align="right"><strong>Giá trị</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>HĐ tái tục có ưu đãi</TableCell>
                  <TableCell align="right">{reportData.discountAnalysis.withDiscount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>HĐ tái tục không ưu đãi</TableCell>
                  <TableCell align="right">{reportData.discountAnalysis.withoutDiscount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mức ưu đãi trung bình</TableCell>
                  <TableCell align="right">{reportData.discountAnalysis.averageDiscount}%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* IV. Đánh giá và khuyến nghị */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            IV. ĐÁNH GIÁ VÀ KHUYẾN NGHỊ
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>1. Đánh giá chung:</strong>
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Tỷ lệ tái tục đạt {reportData.renewalRate}%, đạt mục tiêu kế hoạch đề ra.
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Lý do chính khách hàng không tái tục là chuyển sang nhà bảo hiểm khác ({reportData.reasonsNotRenewed[0].percentage}%).
          </Typography>

          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            <strong>2. Khuyến nghị:</strong>
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Cần tăng cường chương trình ưu đãi khách hàng tái tục.
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Đào tạo đội ngũ chăm sóc khách hàng để nâng cao chất lượng dịch vụ.
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Rà soát chính sách giá cả để cạnh tranh tốt hơn với thị trường.
          </Typography>
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

export default RenewalReport;
