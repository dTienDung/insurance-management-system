// ============================================
// DỊCH VỤ XUẤT BÁO CÁO PDF
// Format theo chuẩn văn bản hành chính Việt Nam
// ============================================

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFReportService {
  constructor() {
    // Font tiếng Việt - sử dụng font có sẵn hỗ trợ Unicode
    this.fontPath = path.join(__dirname, '../fonts');
    this.COMPANY_NAME = 'TỔNG CÔNG TY BẢO HIỂM PETROLIMEX';
    this.COMPANY_SHORT = 'PJICO';
    this.ADDRESS = 'Hà Nội, Việt Nam';
    
    // Thử tìm các font hỗ trợ tiếng Việt (ưu tiên: Noto Sans > Roboto > DejaVu)
    this.hasCustomFont = false;
    this.regularFont = null;
    this.boldFont = null;
    this.italicFont = null;

    try {
      // Thử Noto Sans trước (font tốt nhất cho tiếng Việt)
      const notoPath = path.join(this.fontPath, 'NotoSans-Regular.ttf');
      if (fs.existsSync(notoPath)) {
        this.hasCustomFont = true;
        this.regularFont = notoPath;
        this.boldFont = path.join(this.fontPath, 'NotoSans-Bold.ttf');
        this.italicFont = path.join(this.fontPath, 'NotoSans-Italic.ttf');
        console.log('✅ Using Noto Sans font for PDF (best for Vietnamese)');
      } else {
        // Thử Roboto
        const robotoPath = path.join(this.fontPath, 'Roboto-Regular.ttf');
        if (fs.existsSync(robotoPath)) {
          this.hasCustomFont = true;
          this.regularFont = robotoPath;
          this.boldFont = path.join(this.fontPath, 'Roboto-Bold.ttf');
          this.italicFont = path.join(this.fontPath, 'Roboto-Italic.ttf');
          console.log('✅ Using Roboto font for PDF');
        } else {
          // Thử DejaVu Sans (fallback)
          const dejavuPath = path.join(this.fontPath, 'DejaVuSans.ttf');
          if (fs.existsSync(dejavuPath)) {
            this.hasCustomFont = true;
            this.regularFont = dejavuPath;
            this.boldFont = path.join(this.fontPath, 'DejaVuSans-Bold.ttf');
            this.italicFont = dejavuPath; // DejaVu không có italic riêng
            console.log('✅ Using DejaVu Sans font for PDF');
          }
        }
      }

      if (!this.hasCustomFont) {
        console.warn('⚠️  No custom fonts found. Vietnamese characters may not display correctly.');
        console.warn('   Download fonts to backend/fonts/');
        console.warn('   Recommended: Noto Sans from https://fonts.google.com/noto/specimen/Noto+Sans');
      }
    } catch (err) {
      console.error('❌ Error loading fonts:', err.message);
    }
  }

  /**
   * Set font cho document
   */
  setFont(doc, style = 'regular') {
    if (this.hasCustomFont) {
      switch(style) {
        case 'bold':
          doc.font(this.boldFont);
          break;
        case 'italic':
          doc.font(this.italicFont);
          break;
        default:
          doc.font(this.regularFont);
      }
    } else {
      // Fallback to Helvetica
      switch(style) {
        case 'bold':
          doc.font('Helvetica-Bold');
          break;
        case 'italic':
          doc.font('Helvetica-Oblique');
          break;
        default:
          doc.font('Helvetica');
      }
    }
  }

  /**
   * Tạo header chuẩn cho báo cáo
   */
  createHeader(doc, reportTitle) {
    const pageWidth = doc.page.width;
    
    // Logo + Thông tin công ty (bên trái)
    doc.fontSize(11);
    this.setFont(doc, 'bold');
    doc.text(this.COMPANY_SHORT, 50, 50);
    
    doc.fontSize(9);
    this.setFont(doc, 'regular');
    doc.text(this.COMPANY_NAME, 50, 65);

    // Quốc hiệu + Tiêu ngữ (bên phải)
    const rightX = pageWidth - 250;
    doc.fontSize(11);
    this.setFont(doc, 'bold');
    doc.text('CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM', rightX, 50, {
      align: 'center',
      width: 200
    });
    
    doc.fontSize(10);
    this.setFont(doc, 'italic');
    doc.text('Độc lập - Tự do - Hạnh phúc', rightX, 65, {
      align: 'center',
      width: 200
    });

    // Đường kẻ ngang
    doc.fontSize(9)
      .text('_______________', rightX + 25, 78, {
        align: 'center',
        width: 150
      });

    // Địa điểm và ngày tháng
    const today = new Date();
    const dateStr = `${this.ADDRESS}, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
    doc.fontSize(10);
    this.setFont(doc, 'italic');
    doc.text(dateStr, rightX, 95, {
      align: 'center',
      width: 200
    });

    // Tiêu đề báo cáo
    doc.fontSize(16);
    this.setFont(doc, 'bold');
    doc.text(reportTitle.toUpperCase(), 50, 130, {
      align: 'center',
      width: pageWidth - 100
    });

    return 160; // Vị trí Y để bắt đầu nội dung
  }

  /**
   * Tạo thông tin người báo cáo
   */
  createReporterInfo(doc, yPos, reporterInfo) {
    const { hoTen = '', chucVu = '', boPhan = '', tuNgay = '', denNgay = '', kyBaoCao = '', phamVi = '' } = reporterInfo;

    doc.fontSize(10);
    this.setFont(doc, 'regular');

    // Tạo bảng thông tin
    const table = [
      ['Họ và tên:', hoTen, 'Chức vụ:', chucVu],
      ['Thời gian thực hiện:', `Từ ngày ${tuNgay} đến ngày ${denNgay}`, 'Kỳ báo cáo:', kyBaoCao],
      ['Bộ phận công tác:', boPhan, 'Phạm vi:', phamVi]
    ];

    let currentY = yPos;
    const cellHeight = 25;
    const col1Width = 130;
    const col2Width = 180;
    const col3Width = 90;
    const col4Width = 140;
    const startX = 50;

    table.forEach(row => {
      // Vẽ viền ô
      doc.rect(startX, currentY, col1Width, cellHeight).stroke();
      doc.rect(startX + col1Width, currentY, col2Width, cellHeight).stroke();
      doc.rect(startX + col1Width + col2Width, currentY, col3Width, cellHeight).stroke();
      doc.rect(startX + col1Width + col2Width + col3Width, currentY, col4Width, cellHeight).stroke();

      // Nội dung
      this.setFont(doc, 'bold');
      doc.text(row[0], startX + 5, currentY + 8, { width: col1Width - 10 });
      this.setFont(doc, 'regular');
      doc.text(row[1], startX + col1Width + 5, currentY + 8, { width: col2Width - 10 });
      this.setFont(doc, 'bold');
      doc.text(row[2], startX + col1Width + col2Width + 5, currentY + 8, { width: col3Width - 10 });
      this.setFont(doc, 'regular');
      doc.text(row[3], startX + col1Width + col2Width + col3Width + 5, currentY + 8, { width: col4Width - 10 });

      currentY += cellHeight;
    });

    return currentY + 20; // Vị trí tiếp theo
  }

  /**
   * Tạo bảng nội dung chi tiết
   */
  createContentTable(doc, yPos, headers, data) {
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('NỘI DUNG CHI TIẾT', 50, yPos, { align: 'center', width: 500 });

    let currentY = yPos + 30;
    const startX = 50;
    const tableWidth = 500;
    const cellHeight = 30;
    const colWidths = headers.map(() => tableWidth / headers.length);

    // Header
    doc.fontSize(10).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.rect(x, currentY, colWidths[i], cellHeight).stroke();
      doc.text(header, x + 5, currentY + 10, {
        width: colWidths[i] - 10,
        align: 'center'
      });
    });

    currentY += cellHeight;

    // Data rows
    doc.fontSize(9).font('Helvetica');
    data.forEach(row => {
      const rowData = Object.values(row);
      rowData.forEach((cell, i) => {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.rect(x, currentY, colWidths[i], cellHeight).stroke();
        doc.text(String(cell), x + 5, currentY + 10, {
          width: colWidths[i] - 10,
          align: i === 0 ? 'left' : 'center'
        });
      });
      currentY += cellHeight;

      // Xuống trang mới nếu cần
      if (currentY > doc.page.height - 150) {
        doc.addPage();
        currentY = 50;
      }
    });

    return currentY + 20;
  }

  /**
   * Tạo phần chữ ký
   */
  createSignature(doc, yPos) {
    const pageWidth = doc.page.width;
    const leftX = 100;
    const rightX = pageWidth - 200;

    doc.fontSize(11).font('Helvetica-Bold');

    // Phụ trách bộ phận
    doc.text('PHỤ TRÁCH BỘ PHẬN', leftX - 30, yPos, {
      align: 'center',
      width: 150
    });

    // Người báo cáo
    doc.text('NGƯỜI BÁO CÁO', rightX - 20, yPos, {
      align: 'center',
      width: 150
    });

    doc.fontSize(9).font('Helvetica-Oblique');
    
    // Chú thích ký
    doc.text('(Ký, ghi rõ họ tên)', leftX - 30, yPos + 20, {
      align: 'center',
      width: 150
    });

    doc.text('(Ký, ghi rõ họ tên)', rightX - 20, yPos + 20, {
      align: 'center',
      width: 150
    });

    return yPos + 100;
  }

  /**
   * BÁO CÁO DOANH THU PHÍ BẢO HIỂM
   */
  async generateRevenueReport(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // Header
        let yPos = this.createHeader(doc, 'BÁO CÁO DOANH THU PHÍ BẢO HIỂM');

        // Thông tin người báo cáo
        yPos = this.createReporterInfo(doc, yPos, {
          hoTen: data.nguoiBaoCao || 'Nguyễn Văn A',
          chucVu: data.chucVu || 'Trưởng phòng',
          boPhan: 'Phòng Kinh doanh',
          tuNgay: data.tuNgay || '01/01/2025',
          denNgay: data.denNgay || '31/12/2025',
          kyBaoCao: data.kyBaoCao || 'Năm 2025',
          phamVi: 'Phí Bảo hiểm Xe Cơ giới'
        });

        // Nội dung chi tiết
        const tableData = data.chiTiet || [];
        yPos = this.createContentTable(doc, yPos, 
          ['Tháng', 'Doanh thu (VNĐ)', 'Số HĐ', 'Tăng trưởng (%)'],
          tableData
        );

        // Chữ ký
        if (yPos > doc.page.height - 200) {
          doc.addPage();
          yPos = 50;
        }
        this.createSignature(doc, yPos);

        doc.end();
        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * BÁO CÁO TÁI TỤC HỢP ĐỒNG
   */
  async generateRenewalReport(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        let yPos = this.createHeader(doc, 'BÁO CÁO TÁI TỤC HỢP ĐỒNG');

        yPos = this.createReporterInfo(doc, yPos, {
          hoTen: data.nguoiBaoCao || 'Trần Thị B',
          chucVu: data.chucVu || 'Nhân viên',
          boPhan: 'Phòng Chăm sóc khách hàng',
          tuNgay: data.tuNgay || '01/01/2025',
          denNgay: data.denNgay || '31/12/2025',
          kyBaoCao: data.kyBaoCao || 'Quý IV/2025',
          phamVi: 'Hợp đồng Bảo hiểm Xe Cơ giới'
        });

        const tableData = data.chiTiet || [];
        yPos = this.createContentTable(doc, yPos,
          ['Tháng', 'HĐ đến hạn', 'Tái tục thành công', 'Tỷ lệ (%)'],
          tableData
        );

        if (yPos > doc.page.height - 200) {
          doc.addPage();
          yPos = 50;
        }
        this.createSignature(doc, yPos);

        doc.end();
        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * BÁO CÁO HỖ TRỢ THẨM ĐỊNH
   */
  async generateAssessmentReport(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        let yPos = this.createHeader(doc, 'BÁO CÁO HỖ TRỢ THẨM ĐỊNH');

        yPos = this.createReporterInfo(doc, yPos, {
          hoTen: data.nguoiBaoCao || 'Lê Văn C',
          chucVu: data.chucVu || 'Chuyên viên thẩm định',
          boPhan: 'Phòng Thẩm định',
          tuNgay: data.tuNgay || '01/01/2025',
          denNgay: data.denNgay || '31/12/2025',
          kyBaoCao: data.kyBaoCao || 'Năm 2025',
          phamVi: 'Hồ sơ yêu cầu bảo hiểm mới và tái tục'
        });

        const tableData = data.chiTiet || [];
        yPos = this.createContentTable(doc, yPos,
          ['Mức rủi ro', 'Số lượng HS', 'Tỷ lệ (%)', 'Ghi chú'],
          tableData
        );

        if (yPos > doc.page.height - 200) {
          doc.addPage();
          yPos = 50;
        }
        this.createSignature(doc, yPos);

        doc.end();
        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * BÁO CÁO QUẢN TRỊ NGHIỆP VỤ
   */
  async generateBusinessReport(data, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        let yPos = this.createHeader(doc, 'BÁO CÁO QUẢN TRỊ NGHIỆP VỤ');

        yPos = this.createReporterInfo(doc, yPos, {
          hoTen: data.nguoiBaoCao || 'Phạm Thị D',
          chucVu: data.chucVu || 'Trưởng phòng',
          boPhan: 'Phòng Quản lý nghiệp vụ',
          tuNgay: data.tuNgay || '01/01/2025',
          denNgay: data.denNgay || '31/12/2025',
          kyBaoCao: data.kyBaoCao || 'Năm 2025',
          phamVi: 'Toàn hệ thống'
        });

        const tableData = data.chiTiet || [];
        yPos = this.createContentTable(doc, yPos,
          ['Chỉ tiêu', 'Kết quả', 'Mục tiêu', 'Đạt (%)'],
          tableData
        );

        if (yPos > doc.page.height - 200) {
          doc.addPage();
          yPos = 50;
        }
        this.createSignature(doc, yPos);

        doc.end();
        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PDFReportService();
