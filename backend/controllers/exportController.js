const { Document, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle } = require('docx');
const { getConnection, sql } = require('../config/database');
const { COMPANY } = require('../config/constants'); // ← THÊM IMPORT

class ExportController {
  // ============================================
  // 1. GIẤY YÊU CẦU BẢO HIỂM
  // ============================================
  async exportGiayYeuCau(req, res, next) {
    try {
      const { maKH, maXe } = req.params;

      const pool = await getConnection();
      
      // Lấy thông tin khách hàng
      const khResult = await pool.request()
        .input('maKH', sql.VarChar(10), maKH)
        .query('SELECT * FROM KhachHang WHERE MaKH = @maKH');
      
      // Lấy thông tin xe
      const xeResult = await pool.request()
        .input('maXe', sql.VarChar(10), maXe)
        .query('SELECT * FROM Xe WHERE MaXe = @maXe');

      if (khResult.recordset.length === 0 || xeResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin'
        });
      }

      const khachHang = khResult.recordset[0];
      const xe = xeResult.recordset[0];

      // Tạo document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // ← SỬA: Header với thông tin PJICO
            new Paragraph({
              text: COMPANY.fullName.toUpperCase(), // ← DÙNG CONSTANTS
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: COMPANY.fullName.toUpperCase(),
                  bold: true,
                  size: 28
                })
              ]
            }),
            new Paragraph({
              text: '────────────',
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 }
            }),
            
            // Tiêu đề
            new Paragraph({
              text: 'GIẤY YÊU CẦU BẢO HIỂM XE CƠ GIỚI',
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 400 },
              children: [
                new TextRun({
                  text: 'GIẤY YÊU CẦU BẢO HIỂM XE CƠ GIỚI',
                  bold: true,
                  size: 32,
                  allCaps: true
                })
              ]
            }),

            // Thông tin chủ xe
            new Paragraph({
              text: 'I. THÔNG TIN CHỦ XE',
              spacing: { before: 300, after: 200 },
              children: [
                new TextRun({
                  text: 'I. THÔNG TIN CHỦ XE',
                  bold: true,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              text: `Họ và tên: ${khachHang.HoTen}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `CMND/CCCD: ${khachHang.CMND_CCCD}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Ngày sinh: ${new Date(khachHang.NgaySinh).toLocaleDateString('vi-VN')}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Địa chỉ: ${khachHang.DiaChi}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Số điện thoại: ${khachHang.SDT}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Email: ${khachHang.Email}`,
              spacing: { after: 300 }
            }),

            // Thông tin xe
            new Paragraph({
              text: 'II. THÔNG TIN PHƯƠNG TIỆN',
              spacing: { before: 300, after: 200 },
              children: [
                new TextRun({
                  text: 'II. THÔNG TIN PHƯƠNG TIỆN',
                  bold: true,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              text: `Biển kiểm soát: ${xe.BienSo}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Hãng xe: ${xe.HangXe}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Loại xe: ${xe.LoaiXe}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Năm sản xuất: ${xe.NamSX}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Giá trị xe: ${new Intl.NumberFormat('vi-VN').format(xe.GiaTriXe)} VNĐ`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Mục đích sử dụng: ${xe.MucDichSuDung}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Tình trạng kỹ thuật: ${xe.TinhTrangKT}`,
              spacing: { after: 300 }
            }),

            // Loại bảo hiểm
            new Paragraph({
              text: 'III. LOẠI BẢO HIỂM YÊU CẦU',
              spacing: { before: 300, after: 200 },
              children: [
                new TextRun({
                  text: 'III. LOẠI BẢO HIỂM YÊU CẦU',
                  bold: true,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              text: '☐ Bảo hiểm vật chất xe',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: '☐ Bảo hiểm trách nhiệm dân sự bắt buộc',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: '☐ Bảo hiểm toàn diện',
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: '☐ Bảo hiểm tai nạn lái phụ xe',
              spacing: { after: 400 }
            }),

            // Cam kết
            new Paragraph({
              text: 'Tôi xin cam đoan các thông tin trên là chính xác và đúng sự thật.',
              spacing: { before: 400, after: 200 },
              italics: true
            }),

            // ← SỬA: Chữ ký với địa chỉ PJICO
            new Paragraph({
              text: `${COMPANY.address.city}, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
              alignment: AlignmentType.RIGHT,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: 'Người yêu cầu',
              alignment: AlignmentType.RIGHT,
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: 'Người yêu cầu',
                  bold: true
                })
              ]
            }),
            new Paragraph({
              text: '(Ký và ghi rõ họ tên)',
              alignment: AlignmentType.RIGHT,
              spacing: { after: 200 },
              italics: true
            })
          ]
        }]
      });

      res.json({
        success: true,
        message: 'Tạo giấy yêu cầu thành công',
        data: {
          khachHang: khachHang.HoTen,
          xe: xe.BienSo
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // 2. HỢP ĐỒNG BẢO HIỂM
  // ============================================
  async exportHopDong(req, res, next) {
    try {
      const { maHD } = req.params;

      const pool = await getConnection();
      
      const result = await pool.request()
        .input('maHD', sql.VarChar(10), maHD)
        .query(`
          SELECT hd.*, 
                 kh.HoTen, kh.CMND_CCCD, kh.DiaChi, kh.SDT, kh.Email,
                 xe.BienSo, xe.HangXe, xe.LoaiXe, xe.NamSX, xe.GiaTriXe,
                 lb.TenLoai, lb.MoTa,
                 nv.HoTen AS NhanVienPhuTrach
          FROM HopDong hd
          JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          JOIN Xe xe ON hd.MaXe = xe.MaXe
          JOIN LoaiBaoHiem lb ON hd.MaLB = lb.MaLB
          JOIN NhanVien nv ON hd.MaNV = nv.MaNV
          WHERE hd.MaHD = @maHD
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng'
        });
      }

      const hd = result.recordset[0];

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // ← SỬA: Header công ty PJICO
            new Paragraph({
              text: COMPANY.fullName.toUpperCase(), // ← DÙNG CONSTANTS
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: COMPANY.fullName.toUpperCase(),
                  bold: true,
                  size: 28
                })
              ]
            }),
            new Paragraph({
              text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                  bold: true,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              text: 'Độc lập - Tự do - Hạnh phúc',
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              children: [
                new TextRun({
                  text: 'Độc lập - Tự do - Hạnh phúc',
                  bold: true,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              text: '──────────────',
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // Tiêu đề
            new Paragraph({
              text: 'HỢP ĐỒNG BẢO HIỂM XE CƠ GIỚI',
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 200 },
              children: [
                new TextRun({
                  text: 'HỢP ĐỒNG BẢO HIỂM XE CƠ GIỚI',
                  bold: true,
                  size: 32,
                  allCaps: true
                })
              ]
            }),
            new Paragraph({
              text: `Số: ${hd.MaHD}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              children: [
                new TextRun({
                  text: `Số: ${hd.MaHD}`,
                  bold: true,
                  size: 24
                })
              ]
            }),

            // Điều khoản
            new Paragraph({
              text: 'Hôm nay, ngày ' + new Date(hd.NgayKy).getDate() + 
                    ' tháng ' + (new Date(hd.NgayKy).getMonth() + 1) + 
                    ' năm ' + new Date(hd.NgayKy).getFullYear(),
              spacing: { before: 300, after: 300 }
            }),

            // ← SỬA: Bên A - PJICO
            new Paragraph({
              text: `BÊN A: ${COMPANY.fullName.toUpperCase()}`, // ← DÙNG CONSTANTS
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({
                  text: `BÊN A: ${COMPANY.fullName.toUpperCase()}`,
                  bold: true,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              text: `Địa chỉ: ${COMPANY.address.main}`, // ← DÙNG CONSTANTS
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Điện thoại: ${COMPANY.hotline}`, // ← DÙNG CONSTANTS
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Email: ${COMPANY.email}`, // ← DÙNG CONSTANTS
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Website: ${COMPANY.website}`, // ← DÙNG CONSTANTS
              spacing: { after: 300 }
            }),

            // Bên B
            new Paragraph({
              text: 'BÊN B: BÊN MUA BẢO HIỂM',
              spacing: { before: 200, after: 100 },
              children: [
                new TextRun({
                  text: 'BÊN B: BÊN MUA BẢO HIỂM',
                  bold: true,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              text: `Họ và tên: ${hd.HoTen}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `CMND/CCCD: ${hd.CMND_CCCD}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Địa chỉ: ${hd.DiaChi}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Điện thoại: ${hd.SDT}`,
              spacing: { after: 300 }
            }),

            // Điều 1: Đối tượng bảo hiểm
            new Paragraph({
              text: 'ĐIỀU 1: ĐỐI TƯỢNG BẢO HIỂM',
              spacing: { before: 400, after: 200 },
              children: [
                new TextRun({
                  text: 'ĐIỀU 1: ĐỐI TƯỢNG BẢO HIỂM',
                  bold: true,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              text: `Loại bảo hiểm: ${hd.TenLoai}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Biển số xe: ${hd.BienSo}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Hãng xe: ${hd.HangXe} - ${hd.LoaiXe}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Năm sản xuất: ${hd.NamSX}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Giá trị xe: ${new Intl.NumberFormat('vi-VN').format(hd.GiaTriXe)} VNĐ`,
              spacing: { after: 300 }
            }),

            // Điều 2: Thời hạn bảo hiểm
            new Paragraph({
              text: 'ĐIỀU 2: THỜI HẠN BẢO HIỂM',
              spacing: { before: 400, after: 200 },
              children: [
                new TextRun({
                  text: 'ĐIỀU 2: THỜI HẠN BẢO HIỂM',
                  bold: true,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              text: `Từ ngày: ${new Date(hd.NgayKy).toLocaleDateString('vi-VN')}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Đến ngày: ${new Date(hd.NgayHetHan).toLocaleDateString('vi-VN')}`,
              spacing: { after: 300 }
            }),

            // Điều 3: Phí bảo hiểm
            new Paragraph({
              text: 'ĐIỀU 3: PHÍ BẢO HIỂM',
              spacing: { before: 400, after: 200 },
              children: [
                new TextRun({
                  text: 'ĐIỀU 3: PHÍ BẢO HIỂM',
                  bold: true,
                  size: 24
                })
              ]
            }),
            new Paragraph({
              text: `Tổng phí bảo hiểm: ${new Intl.NumberFormat('vi-VN').format(hd.PhiBaoHiem)} VNĐ`,
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: `Tổng phí bảo hiểm: ${new Intl.NumberFormat('vi-VN').format(hd.PhiBaoHiem)} VNĐ`,
                  bold: true
                })
              ]
            }),
            new Paragraph({
              text: `(Bằng chữ: ${this.soThanhChu(hd.PhiBaoHiem)} đồng)`,
              spacing: { after: 300 },
              italics: true
            }),

            // ← SỬA: Chữ ký với địa chỉ PJICO
            new Paragraph({
              text: `${COMPANY.address.city}, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
              alignment: AlignmentType.CENTER,
              spacing: { before: 600, after: 200 }
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: 'ĐẠI DIỆN BÊN A',
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: 'ĐẠI DIỆN BÊN A',
                              bold: true
                            })
                          ]
                        }),
                        new Paragraph({
                          text: '(Ký và đóng dấu)',
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 800 },
                          italics: true
                        })
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: 'ĐẠI DIỆN BÊN B',
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: 'ĐẠI DIỆN BÊN B',
                              bold: true
                            })
                          ]
                        }),
                        new Paragraph({
                          text: '(Ký và ghi rõ họ tên)',
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 800 },
                          italics: true
                        })
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE }
                    })
                  ]
                })
              ]
            })
          ]
        }]
      });

      res.json({
        success: true,
        message: 'Tạo hợp đồng thành công',
        data: {
          maHD: hd.MaHD,
          khachHang: hd.HoTen,
          xe: hd.BienSo,
          phi: hd.PhiBaoHiem
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // 3. BIÊN LAI THU TIỀN
  // ============================================
  async exportBienLai(req, res, next) {
    try {
      const { maTT } = req.params;

      const pool = await getConnection();
      
      const result = await pool.request()
        .input('maTT', sql.VarChar(10), maTT)
        .query(`
          SELECT tt.*, hd.MaHD, hd.NgayKy,
                 kh.HoTen, kh.DiaChi,
                 xe.BienSo,
                 lb.TenLoai
          FROM ThanhToan tt
          JOIN HopDong hd ON tt.MaHD = hd.MaHD
          JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          JOIN Xe xe ON hd.MaXe = xe.MaXe
          JOIN LoaiBaoHiem lb ON hd.MaLB = lb.MaLB
          WHERE tt.MaTT = @maTT
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy biên lai'
        });
      }

      const tt = result.recordset[0];

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // ← SỬA: Header PJICO
            new Paragraph({
              text: COMPANY.fullName.toUpperCase(), // ← DÙNG CONSTANTS
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: COMPANY.fullName.toUpperCase(),
                  bold: true,
                  size: 26
                })
              ]
            }),
            new Paragraph({
              text: COMPANY.address.main, // ← DÙNG CONSTANTS
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `ĐT: ${COMPANY.hotline} - Email: ${COMPANY.email}`, // ← DÙNG CONSTANTS
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Paragraph({
              text: '═══════════════════════',
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // Tiêu đề
            new Paragraph({
              text: 'BIÊN LAI THU TIỀN',
              alignment: AlignmentType.CENTER,
              spacing: { before: 300, after: 200 },
              children: [
                new TextRun({
                  text: 'BIÊN LAI THU TIỀN',
                  bold: true,
                  size: 36,
                  allCaps: true
                })
              ]
            }),
            new Paragraph({
              text: `Số: ${tt.MaTT}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              children: [
                new TextRun({
                  text: `Số: ${tt.MaTT}`,
                  bold: true,
                  size: 24
                })
              ]
            }),

            // Ngày
            new Paragraph({
              text: `Ngày ${new Date(tt.NgayThanhToan).getDate()} tháng ${new Date(tt.NgayThanhToan).getMonth() + 1} năm ${new Date(tt.NgayThanhToan).getFullYear()}`,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 400 },
              italics: true
            }),

            // Nội dung
            new Paragraph({
              text: `Họ tên người nộp tiền: ${tt.HoTen}`,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: 'Họ tên người nộp tiền: ',
                  bold: true
                }),
                new TextRun({
                  text: tt.HoTen
                })
              ]
            }),
            new Paragraph({
              text: `Địa chỉ: ${tt.DiaChi}`,
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: `Nội dung thu: Phí bảo hiểm xe ${tt.BienSo} - Hợp đồng số ${tt.MaHD}`,
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: `Loại bảo hiểm: ${tt.TenLoai}`,
              spacing: { after: 300 }
            }),

            // Số tiền
            new Paragraph({
              text: `Số tiền: ${new Intl.NumberFormat('vi-VN').format(tt.SoTien)} VNĐ`,
              spacing: { before: 200, after: 200 },
              children: [
                new TextRun({
                  text: `Số tiền: ${new Intl.NumberFormat('vi-VN').format(tt.SoTien)} VNĐ`,
                  bold: true,
                  size: 28
                })
              ]
            }),
            new Paragraph({
              text: `(Bằng chữ: ${this.soThanhChu(tt.SoTien)} đồng)`,
              spacing: { after: 300 },
              italics: true
            }),

            // Hình thức thanh toán
            new Paragraph({
              text: `Hình thức thanh toán: ${tt.HinhThuc}`,
              spacing: { after: 400 }
            }),

            // Chữ ký
            new Paragraph({
              text: '',
              spacing: { before: 400 }
            }),

            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: 'Người nộp tiền',
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: 'Người nộp tiền',
                              bold: true
                            })
                          ]
                        }),
                        new Paragraph({
                          text: '(Ký và ghi rõ họ tên)',
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 600 },
                          italics: true
                        })
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: 'Người thu tiền',
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: 'Người thu tiền',
                              bold: true
                            })
                          ]
                        }),
                        new Paragraph({
                          text: '(Ký và ghi rõ họ tên)',
                          alignment: AlignmentType.CENTER,
                          spacing: { before: 600 },
                          italics: true
                        })
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE }
                    })
                  ]
                })
              ]
            })
          ]
        }]
      });

      res.json({
        success: true,
        message: 'Tạo biên lai thành công',
        data: {
          maTT: tt.MaTT,
          khachHang: tt.HoTen,
          soTien: tt.SoTien
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Helper: Convert số thành chữ
  soThanhChu(so) {
    const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const donVi = ["", "nghìn", "triệu", "tỷ"];
    
    if (so === 0) return chuSo[0];
    
    let ketQua = "";
    let viTri = 0;
    
    while (so > 0) {
      let nhom = so % 1000;
      if (nhom > 0) {
        let chuNhom = "";
        
        // Hàng trăm
        let hang = Math.floor(nhom / 100);
        if (hang > 0) {
          chuNhom = chuSo[hang] + " trăm ";
          nhom = nhom % 100;
        }
        
        // Hàng chục
        hang = Math.floor(nhom / 10);
        if (hang > 1) {
          chuNhom += chuSo[hang] + " mươi ";
        } else if (hang === 1) {
          chuNhom += "mười ";
        }
        nhom = nhom % 10;
        
        // Hàng đơn vị
        if (nhom > 0) {
          chuNhom += chuSo[nhom] + " ";
        }
        
        ketQua = chuNhom + donVi[viTri] + " " + ketQua;
      }
      
      so = Math.floor(so / 1000);
      viTri++;
    }
    
    return ketQua.trim().charAt(0).toUpperCase() + ketQua.trim().slice(1);
  }
}

module.exports = new ExportController();