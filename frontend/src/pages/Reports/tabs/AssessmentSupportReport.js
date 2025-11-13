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

const AssessmentSupportReport = () => {
  const [filters, setFilters] = useState({
    timeType: 'year',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: Math.floor(new Date().getMonth() / 3) + 1,
    riskLevel: 'all'
  });

  const [reportData] = useState({
    totalAssessments: 1250,
    riskDistribution: [
      { level: 'Thấp', count: 625, percentage: 50, avgAdjustment: 0 },
      { level: 'Trung bình', count: 437, percentage: 35, avgAdjustment: 5 },
      { level: 'Cao', count: 188, percentage: 15, avgAdjustment: 15 }
    ],
    commonRiskFactors: [
      { factor: 'Tuổi xe > 10 năm', occurrences: 380, impactLevel: 'Cao' },
      { factor: 'Lịch sử bồi thường', occurrences: 210, impactLevel: 'Cao' },
      { factor: 'Lái xe < 5 năm kinh nghiệm', occurrences: 155, impactLevel: 'Trung bình' },
      { factor: 'Sử dụng mục đích kinh doanh', occurrences: 95, impactLevel: 'Trung bình' },
      { factor: 'Không có garage', occurrences: 75, impactLevel: 'Thấp' }
    ],
    adjustmentStats: {
      increased: 425,
      decreased: 120,
      unchanged: 705
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

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Mức độ rủi ro</InputLabel>
              <Select
                value={filters.riskLevel}
                label="Mức độ rủi ro"
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="low">Thấp</MenuItem>
                <MenuItem value="medium">Trung bình</MenuItem>
                <MenuItem value="high">Cao</MenuItem>
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
            BÁO CÁO HỖ TRỢ THẨM ĐỊNH
          </Typography>
          <Typography variant="subtitle2">
            Kỳ báo cáo: {filters.timeType === 'year' ? 'Năm' : filters.timeType === 'quarter' ? 'Quý' : 'Tháng'} {filters.year}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* I. Tổng quan đánh giá */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            I. TỔNG QUAN ĐÁNH GIÁ
          </Typography>
          <Typography variant="body2" paragraph>
            Tổng số hồ sơ thẩm định trong kỳ: <strong>{reportData.totalAssessments}</strong>
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Mức độ rủi ro</strong></TableCell>
                  <TableCell align="right"><strong>Số lượng</strong></TableCell>
                  <TableCell align="right"><strong>Tỷ lệ (%)</strong></TableCell>
                  <TableCell align="right"><strong>Điều chỉnh TB (%)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.riskDistribution.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.level}</TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                    <TableCell align="right">{item.percentage}%</TableCell>
                    <TableCell align="right">
                      {item.avgAdjustment > 0 ? `+${item.avgAdjustment}%` : `${item.avgAdjustment}%`}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell><strong>Tổng cộng</strong></TableCell>
                  <TableCell align="right"><strong>{reportData.totalAssessments}</strong></TableCell>
                  <TableCell align="right"><strong>100%</strong></TableCell>
                  <TableCell align="right">-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* II. Yếu tố rủi ro phổ biến */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            II. YẾU TỐ RỦI RO PHỔ BIẾN
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Yếu tố rủi ro</strong></TableCell>
                  <TableCell align="right"><strong>Số lần xuất hiện</strong></TableCell>
                  <TableCell align="center"><strong>Mức độ tác động</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.commonRiskFactors.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.factor}</TableCell>
                    <TableCell align="right">{item.occurrences}</TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          color: item.impactLevel === 'Cao' ? 'error.main' : 
                                 item.impactLevel === 'Trung bình' ? 'warning.main' : 
                                 'success.main'
                        }}
                      >
                        {item.impactLevel}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* III. Thống kê điều chỉnh phí */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            III. THỐNG KÊ ĐIỀU CHỈNH PHÍ
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Loại điều chỉnh</strong></TableCell>
                  <TableCell align="right"><strong>Số lượng</strong></TableCell>
                  <TableCell align="right"><strong>Tỷ lệ (%)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Tăng phí</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>{reportData.adjustmentStats.increased}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {((reportData.adjustmentStats.increased / reportData.totalAssessments) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Giảm phí</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>{reportData.adjustmentStats.decreased}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {((reportData.adjustmentStats.decreased / reportData.totalAssessments) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Không điều chỉnh</TableCell>
                  <TableCell align="right">{reportData.adjustmentStats.unchanged}</TableCell>
                  <TableCell align="right">
                    {((reportData.adjustmentStats.unchanged / reportData.totalAssessments) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* IV. Khuyến nghị */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            IV. KHUYẾN NGHỊ
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>1. Về quy trình thẩm định:</strong>
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Tăng cường kiểm tra kỹ thuật đối với xe có tuổi đời trên 10 năm.
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Yêu cầu hồ sơ chi tiết hơn đối với khách hàng có lịch sử bồi thường.
          </Typography>

          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            <strong>2. Về chính sách giá:</strong>
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Xem xét điều chỉnh hệ số rủi ro cho xe cũ để phù hợp với thực tế thị trường.
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Áp dụng ưu đãi cho khách hàng không có lịch sử bồi thường.
          </Typography>

          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            <strong>3. Về đào tạo:</strong>
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Nâng cao năng lực thẩm định viên trong việc đánh giá rủi ro kỹ thuật.
          </Typography>
          <Typography variant="body2" paragraph sx={{ pl: 2 }}>
            - Cập nhật kiến thức về công nghệ ô tô mới.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Signature Section */}
        <Grid container spacing={4} sx={{ mt: 6 }}>
          <Grid item xs={6} textAlign="center">
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              TRƯỞNG PHÒNG THẨM ĐỊNH
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 8 }}>
              (Ký, ghi rõ họ tên)
            </Typography>
            <Typography variant="body2">____________________</Typography>
          </Grid>
          <Grid item xs={6} textAlign="center">
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              NGƯỜI LẬP BÁO CÁO
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

export default AssessmentSupportReport;
