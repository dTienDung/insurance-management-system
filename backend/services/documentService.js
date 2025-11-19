// ============================================
// DỊCH VỤ TẠO CHỨNG TỪ - GIẤY TỜ BẢO HIỂM
// ============================================

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class DocumentService {
  constructor() {
    this.fontPath = path.join(__dirname, '../fonts');
    this.COMPANY_NAME = 'TỔNG CÔNG TY BẢO HIỂM PETROLIMEX';
    this.COMPANY_SHORT = 'PJICO';
    this.ADDRESS = 'Hà Nội, Việt Nam';
    this.HOTLINE = '1900 5454';
  }

  /**
   * TẠO GIẤY CHỨNG NHẬN BẢO HIỂM XE CƠ GIỚI
   */
  async generateInsuranceCertificate(contractData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        const pageWidth = doc.page.width;

        // Header - Logo và thông tin công ty
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .text(this.COMPANY_SHORT, 50, 50);
        
        doc.fontSize(10)
          .font('Helvetica')
          .text(this.COMPANY_NAME, 50, 70)
          .text(`Hotline: ${this.HOTLINE}`, 50, 85);

        // Tiêu đề chính
        doc.fontSize(18)
          .font('Helvetica-Bold')
          .text('GIẤY CHỨNG NHẬN BẢO HIỂM', 50, 130, {
            align: 'center',
            width: pageWidth - 100
          });

        doc.fontSize(16)
          .text('XE CƠ GIỚI', 50, 155, {
            align: 'center',
            width: pageWidth - 100
          });

        // Số chứng nhận
        doc.fontSize(12)
          .font('Helvetica-BoldOblique')
          .text(`Số: ${contractData.MaHD || 'N/A'}`, 50, 185, {
            align: 'center',
            width: pageWidth - 100
          });

        let yPos = 220;

        // Thông tin hợp đồng
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('I. THÔNG TIN BÊN MUA BẢO HIỂM', 50, yPos);
        yPos += 25;

        doc.fontSize(10).font('Helvetica');
        const info1 = [
          `Họ và tên: ${contractData.TenKhachHang || 'N/A'}`,
          `CMND/CCCD: ${contractData.CMND_CCCD || 'N/A'}`,
          `Địa chỉ: ${contractData.DiaChiKhachHang || 'N/A'}`,
          `Điện thoại: ${contractData.SDTKhachHang || 'N/A'}`
        ];

        info1.forEach(line => {
          doc.text(line, 70, yPos);
          yPos += 20;
        });

        yPos += 10;

        // Thông tin xe
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('II. THÔNG TIN XE ĐƯỢC BẢO HIỂM', 50, yPos);
        yPos += 25;

        doc.fontSize(10).font('Helvetica');
        const info2 = [
          `Biển số: ${contractData.BienSo || 'N/A'}`,
          `Hãng xe: ${contractData.HangXe || 'N/A'}`,
          `Loại xe: ${contractData.LoaiXe || 'N/A'}`,
          `Năm sản xuất: ${contractData.NamSX || 'N/A'}`,
          `Số khung: ${contractData.SoKhung || 'N/A'}`,
          `Số máy: ${contractData.SoMay || 'N/A'}`
        ];

        info2.forEach(line => {
          doc.text(line, 70, yPos);
          yPos += 20;
        });

        yPos += 10;

        // Thông tin bảo hiểm
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('III. THÔNG TIN BẢO HIỂM', 50, yPos);
        yPos += 25;

        doc.fontSize(10).font('Helvetica');
        const info3 = [
          `Gói bảo hiểm: ${contractData.TenGoiBaoHiem || 'N/A'}`,
          `Ngày hiệu lực: ${this.formatDate(contractData.NgayKy)}`,
          `Ngày hết hạn: ${this.formatDate(contractData.NgayHetHan)}`,
          `Phí bảo hiểm: ${this.formatCurrency(contractData.PhiBaoHiem)} VNĐ`
        ];

        info3.forEach(line => {
          doc.text(line, 70, yPos);
          yPos += 20;
        });

        yPos += 20;

        // Lưu ý
        doc.fontSize(9)
          .font('Helvetica-Oblique')
          .text('* Giấy chứng nhận này có giá trị pháp lý khi có đầy đủ chữ ký và đóng dấu.', 50, yPos);
        yPos += 15;
        doc.text('* Vui lòng mang theo giấy chứng nhận khi tham gia giao thông.', 50, yPos);

        // Chữ ký
        yPos = doc.page.height - 200;
        const today = new Date();
        doc.fontSize(10)
          .font('Helvetica-Oblique')
          .text(`${this.ADDRESS}, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`, 350, yPos, {
            align: 'center',
            width: 200
          });

        yPos += 30;
        doc.fontSize(11)
          .font('Helvetica-Bold')
          .text('NGƯỜI ĐẠI DIỆN', 350, yPos, {
            align: 'center',
            width: 200
          });

        yPos += 20;
        doc.fontSize(9)
          .font('Helvetica-Oblique')
          .text('(Ký, đóng dấu)', 350, yPos, {
            align: 'center',
            width: 200
          });

        doc.end();
        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * TẠO HỢP ĐỒNG BẢO HIỂM CHI TIẾT
   */
  async generateContract(contractData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        const pageWidth = doc.page.width;

        // Header
        doc.fontSize(14).font('Helvetica-Bold').text(this.COMPANY_SHORT, 50, 50);
        doc.fontSize(10).font('Helvetica').text(this.COMPANY_NAME, 50, 70);

        // Tiêu đề
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('HỢP ĐỒNG BẢO HIỂM XE CƠ GIỚI', 50, 120, {
            align: 'center',
            width: pageWidth - 100
          });

        doc.fontSize(12)
          .text(`Số hợp đồng: ${contractData.MaHD || 'N/A'}`, 50, 145, {
            align: 'center',
            width: pageWidth - 100
          });

        let yPos = 180;

        // Các bên tham gia
        doc.fontSize(11).font('Helvetica-Bold').text('Điều 1: CÁC BÊN THAM GIA HỢP ĐỒNG', 50, yPos);
        yPos += 25;

        doc.fontSize(10).font('Helvetica');
        doc.text('BÊN MUA BẢO HIỂM (Bên A):', 70, yPos);
        yPos += 20;
        doc.text(`- Họ và tên: ${contractData.TenKhachHang || 'N/A'}`, 90, yPos);
        yPos += 18;
        doc.text(`- CMND/CCCD: ${contractData.CMND_CCCD || 'N/A'}`, 90, yPos);
        yPos += 18;
        doc.text(`- Địa chỉ: ${contractData.DiaChiKhachHang || 'N/A'}`, 90, yPos);
        yPos += 18;
        doc.text(`- Điện thoại: ${contractData.SDTKhachHang || 'N/A'}`, 90, yPos);
        yPos += 25;

        doc.text('BÊN BẢO HIỂM (Bên B):', 70, yPos);
        yPos += 20;
        doc.text(`- Tên công ty: ${this.COMPANY_NAME}`, 90, yPos);
        yPos += 18;
        doc.text(`- Địa chỉ: ${this.ADDRESS}`, 90, yPos);
        yPos += 18;
        doc.text(`- Hotline: ${this.HOTLINE}`, 90, yPos);
        yPos += 30;

        // Đối tượng bảo hiểm
        doc.fontSize(11).font('Helvetica-Bold').text('Điều 2: ĐỐI TƯỢNG BẢO HIỂM', 50, yPos);
        yPos += 25;

        doc.fontSize(10).font('Helvetica');
        const vehicleInfo = [
          `Biển số: ${contractData.BienSo || 'N/A'}`,
          `Hãng xe: ${contractData.HangXe || 'N/A'} - Loại xe: ${contractData.LoaiXe || 'N/A'}`,
          `Năm sản xuất: ${contractData.NamSX || 'N/A'}`,
          `Số khung: ${contractData.SoKhung || 'N/A'}`,
          `Số máy: ${contractData.SoMay || 'N/A'}`
        ];

        vehicleInfo.forEach(line => {
          doc.text(line, 70, yPos);
          yPos += 18;
        });

        yPos += 20;

        // Thời hạn và phí
        doc.fontSize(11).font('Helvetica-Bold').text('Điều 3: THỜI HẠN VÀ PHÍ BẢO HIỂM', 50, yPos);
        yPos += 25;

        doc.fontSize(10).font('Helvetica');
        doc.text(`- Gói bảo hiểm: ${contractData.TenGoiBaoHiem || 'N/A'}`, 70, yPos);
        yPos += 18;
        doc.text(`- Ngày hiệu lực: ${this.formatDate(contractData.NgayKy)}`, 70, yPos);
        yPos += 18;
        doc.text(`- Ngày hết hạn: ${this.formatDate(contractData.NgayHetHan)}`, 70, yPos);
        yPos += 18;
        doc.text(`- Phí bảo hiểm: ${this.formatCurrency(contractData.PhiBaoHiem)} VNĐ`, 70, yPos);
        yPos += 30;

        // Quyền lợi bảo hiểm
        if (yPos > doc.page.height - 200) {
          doc.addPage();
          yPos = 50;
        }

        doc.fontSize(11).font('Helvetica-Bold').text('Điều 4: QUYỀN LỢI BẢO HIỂM', 50, yPos);
        yPos += 25;

        doc.fontSize(10).font('Helvetica');
        const benefits = [
          '- Bảo hiểm trách nhiệm dân sự bắt buộc',
          '- Bảo hiểm thiệt hại vật chất xe',
          '- Bảo hiểm người ngồi trên xe',
          '- Các quyền lợi mở rộng theo gói đã chọn'
        ];

        benefits.forEach(line => {
          doc.text(line, 70, yPos);
          yPos += 18;
        });

        // Chữ ký
        if (yPos > doc.page.height - 250) {
          doc.addPage();
          yPos = 50;
        } else {
          yPos += 50;
        }

        const today = new Date();
        doc.fontSize(10)
          .font('Helvetica-Oblique')
          .text(`${this.ADDRESS}, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`, 50, yPos, {
            align: 'center',
            width: pageWidth - 100
          });

        yPos += 40;

        // 2 cột chữ ký
        doc.fontSize(11).font('Helvetica-Bold');
        doc.text('BÊN A', 100, yPos, { align: 'center', width: 150 });
        doc.text('BÊN B', 350, yPos, { align: 'center', width: 150 });

        yPos += 20;
        doc.fontSize(9).font('Helvetica-Oblique');
        doc.text('(Ký, ghi rõ họ tên)', 100, yPos, { align: 'center', width: 150 });
        doc.text('(Ký, đóng dấu)', 350, yPos, { align: 'center', width: 150 });

        doc.end();
        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * TẠO BIÊN LAI THU PHÍ
   */
  async generateReceipt(paymentData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: [600, 400] }); // Kích thước biên lai nhỏ hơn
        const writeStream = fs.createWriteStream(outputPath);
        doc.pipe(writeStream);

        // Header
        doc.fontSize(12).font('Helvetica-Bold').text(this.COMPANY_SHORT, 50, 30);
        doc.fontSize(9).font('Helvetica').text(this.COMPANY_NAME, 50, 45);
        doc.text(`Hotline: ${this.HOTLINE}`, 50, 58);

        // Tiêu đề
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('BIÊN LAI THU PHÍ BẢO HIỂM', 50, 90, {
            align: 'center',
            width: 500
          });

        doc.fontSize(11)
          .font('Helvetica')
          .text(`Số: ${paymentData.MaTT || 'N/A'}`, 50, 115, {
            align: 'center',
            width: 500
          });

        let yPos = 150;

        // Thông tin thanh toán
        doc.fontSize(10).font('Helvetica');
        
        const receiptInfo = [
          `Họ tên khách hàng: ${paymentData.TenKhachHang || 'N/A'}`,
          `Số hợp đồng: ${paymentData.MaHD || 'N/A'}`,
          `Biển số xe: ${paymentData.BienSo || 'N/A'}`,
          `Số tiền: ${this.formatCurrency(paymentData.SoTien)} VNĐ`,
          `Bằng chữ: ${this.numberToWords(paymentData.SoTien)}`,
          `Hình thức: ${paymentData.HinhThuc || 'N/A'}`,
          `Ngày thanh toán: ${this.formatDate(paymentData.NgayGiaoDich)}`
        ];

        receiptInfo.forEach(line => {
          doc.text(line, 70, yPos);
          yPos += 22;
        });

        // Chữ ký
        yPos += 30;
        const today = new Date();
        doc.fontSize(9)
          .font('Helvetica-Oblique')
          .text(`Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`, 350, yPos);

        yPos += 25;
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .text('THU NGÂN', 350, yPos);

        yPos += 18;
        doc.fontSize(8)
          .font('Helvetica-Oblique')
          .text('(Ký, ghi rõ họ tên)', 350, yPos);

        doc.end();
        writeStream.on('finish', () => resolve(outputPath));
        writeStream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper functions
  formatDate(dateStr) {
    if (!dateStr) {return 'N/A';}
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  formatCurrency(amount) {
    if (!amount) {return '0';}
    return new Intl.NumberFormat('vi-VN').format(amount);
  }

  numberToWords(num) {
    if (!num) {return 'Không đồng';}
    // Simplified - chỉ trả về format số
    return this.formatCurrency(num) + ' đồng';
  }
}

module.exports = new DocumentService();
