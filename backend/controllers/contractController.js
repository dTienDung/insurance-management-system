const { getConnection, sql } = require('../config/database');
const { 
  paymentStatusToDB, 
  paymentMethodToDB 
} = require('../utils/mapping');  // ← IMPORT MAPPING
const documentService = require('../services/documentService');
const path = require('path');
const fs = require('fs');

class ContractController {
  async getAll(req, res, next) {
    try {
      const { search, trangThai, fromDate, toDate, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const pool = await getConnection();
      
      let query = `
        SELECT hd.*, 
               kh.HoTen as TenKhachHang, kh.SDT as SDTKhachHang,
               xe.HangXe, xe.LoaiXe,
               gb.TenGoi as TenGoiBaoHiem,
               nv.HoTen as TenNhanVien,
               bs.BienSo
        FROM HopDong hd
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
        LEFT JOIN GoiBaoHiem gb ON hd.MaGoi = gb.MaGoi
        LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV
        LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
        LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
        WHERE 1=1
      `;

      const request = pool.request();

      if (search) {
        query += ' AND (hd.MaHD LIKE @search OR kh.HoTen LIKE @search OR xe.BienSo LIKE @search)';
        request.input('search', sql.NVarChar, `%${search}%`);
      }

      if (trangThai) {
        query += ' AND hd.TrangThai = @trangThai';
        request.input('trangThai', sql.NVarChar(15), trangThai);
      }

      if (fromDate) {
        query += ' AND hd.NgayKy >= @fromDate';
        request.input('fromDate', sql.Date, fromDate);
      }

      if (toDate) {
        query += ' AND hd.NgayKy <= @toDate';
        request.input('toDate', sql.Date, toDate);
      }

      query += ` 
        ORDER BY hd.NgayTao DESC, hd.MaHD DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      request.input('offset', sql.Int, offset);
      request.input('limit', sql.Int, parseInt(limit));

      const result = await request.query(query);

      let countQuery = `
        SELECT COUNT(*) as total 
        FROM HopDong hd
        LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
        LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
        WHERE 1=1
      `;
      if (search) {countQuery += ' AND (hd.MaHD LIKE @search OR kh.HoTen LIKE @search OR xe.BienSo LIKE @search)';}
      if (trangThai) {countQuery += ' AND hd.TrangThai = @trangThai';}
      if (fromDate) {countQuery += ' AND hd.NgayKy >= @fromDate';}
      if (toDate) {countQuery += ' AND hd.NgayKy <= @toDate';}
      
      const countRequest = pool.request();
      if (search) {countRequest.input('search', sql.NVarChar, `%${search}%`);}
      if (trangThai) {countRequest.input('trangThai', sql.NVarChar(15), trangThai);}
      if (fromDate) {countRequest.input('fromDate', sql.Date, fromDate);}
      if (toDate) {countRequest.input('toDate', sql.Date, toDate);}
      const countResult = await countRequest.query(countQuery);

      if (!countResult.recordset || countResult.recordset.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi truy vấn database'
        });
      }

      res.json({
        success: true,
        data: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.recordset[0].total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      const result = await pool.request()
        .input('maHD', sql.VarChar(20), id) // Tăng độ dài từ 10 → 20 để chứa format HD-YYYYMMDD-XXXX
        .query(`
          SELECT hd.*, 
                 kh.HoTen as TenKhachHang, kh.CMND_CCCD, kh.SDT as SDTKhachHang, kh.Email as EmailKhachHang, kh.DiaChi as DiaChiKhachHang,
                 xe.HangXe, xe.LoaiXe, xe.NamSX, xe.GiaTriXe, xe.MucDichSuDung,
                 gb.TenGoi as TenGoiBaoHiem, gb.MoTa as MoTaGoiBaoHiem, gb.TyLePhiCoBan,
                 nv.HoTen as TenNhanVien, nv.ChucVu, nv.SDT as SDTNhanVien,
                 bs.BienSo
          FROM HopDong hd
          LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN GoiBaoHiem gb ON hd.MaGoi = gb.MaGoi
          LEFT JOIN NhanVien nv ON hd.MaNV = nv.MaNV
          LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE hd.MaHD = @maHD
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng'
        });
      }

      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { ngayKy, ngayHetHan, phiBaoHiem, maKH, maXe, maGoi, maHDCu } = req.body;
      const { maNV } = req.user;

      if (!ngayKy || !ngayHetHan || !phiBaoHiem || !maKH || !maXe || !maGoi) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
        });
      }

      if (new Date(ngayHetHan) <= new Date(ngayKy)) {
        return res.status(400).json({
          success: false,
          message: 'Ngày hết hạn phải sau ngày ký'
        });
      }

      // LUẬT NGHIỆP VỤ 5.3: Tạo hợp đồng DRAFT trực tiếp (không qua hồ sơ)
      // Lưu ý: Đây là flow tạo DRAFT thủ công. Nếu tạo từ Hồ sơ, dùng hosoController.lapHopDongTuHoSo()
      const pool = await getConnection();

      await pool.request()
        .input('ngayKy', sql.Date, ngayKy)
        .input('ngayHetHan', sql.Date, ngayHetHan)
        .input('trangThai', sql.NVarChar(15), 'DRAFT')
        .input('phiBaoHiem', sql.Decimal(18, 2), phiBaoHiem)
        .input('maKH', sql.VarChar(10), maKH)
        .input('maXe', sql.VarChar(10), maXe)
        .input('maGoi', sql.VarChar(10), maGoi)
        .input('maNV', sql.VarChar(10), maNV)
        .query(`
          INSERT INTO HopDong (NgayKy, NgayHetHan, TrangThai, PhiBaoHiem, MaKH, MaXe, MaGoi, MaNV, NgayTao)
          VALUES (@ngayKy, @ngayHetHan, @trangThai, @phiBaoHiem, @maKH, @maXe, @maGoi, @maNV, GETDATE())
        `);

      // Lấy MaHD vừa tạo
      const result = await pool.request()
        .input('maKH', sql.VarChar(10), maKH)
        .input('maXe', sql.VarChar(10), maXe)
        .query(`
          SELECT TOP 1 MaHD 
          FROM HopDong 
          WHERE MaKH = @maKH AND MaXe = @maXe
          ORDER BY NgayTao DESC
        `);

      const maHD = result.recordset[0].MaHD;

      res.status(201).json({
        success: true,
        message: 'Tạo hợp đồng thành công',
        data: { maHD }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        ngayKy, 
        ngayHetHan, 
        trangThai, 
        phiBaoHiem, 
        maGoi
      } = req.body;

      const pool = await getConnection();
      
      const checkExist = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query('SELECT MaHD, TrangThai FROM HopDong WHERE MaHD = @maHD');

      if (checkExist.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng'
        });
      }

      // LUẬT NGHIỆP VỤ 5.3: KHÓA core fields khi trạng thái ACTIVE
      const currentStatus = checkExist.recordset[0].TrangThai;
      if (currentStatus === 'ACTIVE') {
        if (ngayKy || ngayHetHan || phiBaoHiem || maGoi) {
          return res.status(403).json({
            success: false,
            message: 'Không thể sửa thông tin cốt lõi (Ngày ký, Ngày hết hạn, Phí bảo hiểm, Gói) khi hợp đồng đang hiệu lực'
          });
        }
      }

      if (ngayHetHan && ngayKy && new Date(ngayHetHan) <= new Date(ngayKy)) {
        return res.status(400).json({
          success: false,
          message: 'Ngày hết hạn phải sau ngày ký'
        });
      }

      await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .input('ngayKy', sql.Date, ngayKy)
        .input('ngayHetHan', sql.Date, ngayHetHan)
        .input('trangThai', sql.NVarChar(15), trangThai)
        .input('phiBaoHiem', sql.Decimal(18, 2), phiBaoHiem)
        .input('maGoi', sql.VarChar(10), maGoi)
        .query(`
          UPDATE HopDong 
          SET NgayKy = @ngayKy, 
              NgayHetHan = @ngayHetHan, 
              TrangThai = @trangThai, 
              PhiBaoHiem = @phiBaoHiem, 
              MaGoi = @maGoi
          WHERE MaHD = @maHD
        `);

      res.json({
        success: true,
        message: 'Cập nhật hợp đồng thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // XÓA FUNCTION updatePaymentStatus - DÙNG paymentController
  // ============================================

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const { lyDo } = req.body;
      const { maNV } = req.user;

      if (!lyDo) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập lý do hủy hợp đồng'
        });
      }

      const pool = await getConnection();
      
      // Kiểm tra trạng thái hợp đồng
      const checkStatus = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query(`
          SELECT TrangThai, NgayKy, NgayHetHan, PhiBaoHiem
          FROM HopDong 
          WHERE MaHD = @maHD
        `);

      if (checkStatus.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng'
        });
      }

      const contract = checkStatus.recordset[0];
      
      if (contract.TrangThai !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể hủy hợp đồng đang có hiệu lực'
        });
      }

      // Sử dụng SP hoàn tiền với OUTPUT parameter
      const result = await pool.request()
        .input('MaHD', sql.VarChar(20), id)
        .input('LyDo', sql.NVarChar(255), lyDo)
        .input('SoTienHoan', sql.Decimal(18, 2), contract.PhiBaoHiem)
        .output('MaTTOut', sql.VarChar(10))
        .execute('sp_HoanTienHopDong');

      const maTT = result.output.MaTTOut;

      res.json({
        success: true,
        message: 'Đã hủy hợp đồng và hoàn tiền thành công',
        data: { maTT }
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpiringContracts(req, res, next) {
    try {
      const { days = 30 } = req.query;

      const pool = await getConnection();
      const result = await pool.request()
        .input('days', sql.Int, parseInt(days))
        .query(`
          SELECT hd.*, 
                 kh.HoTen as TenKhachHang, kh.SDT as SDTKhachHang,
                 xe.HangXe,
                 bs.BienSo,
                 DATEDIFF(day, GETDATE(), hd.NgayHetHan) as SoNgayConLai
          FROM HopDong hd
          LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE hd.TrangThai = N'ACTIVE'
            AND hd.NgayHetHan BETWEEN GETDATE() AND DATEADD(day, @days, GETDATE())
            AND hd.DaNhacTaiTuc = 0
          ORDER BY hd.NgayHetHan ASC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  async renewContract(req, res, next) {
    try {
      const { id } = req.params;
      const { maNV } = req.user;

      const pool = await getConnection();
      
      // Kiểm tra trạng thái hợp đồng cũ
      const checkStatus = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query(`
          SELECT TrangThai 
          FROM HopDong 
          WHERE MaHD = @maHD
        `);

      if (checkStatus.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng'
        });
      }

      const trangThai = checkStatus.recordset[0].TrangThai;
      if (trangThai !== 'ACTIVE' && trangThai !== 'EXPIRED') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể tái tục hợp đồng đang hiệu lực hoặc đã hết hạn'
        });
      }

      // Sử dụng SP tái tục (cần đầy đủ params)
      const ngayKyMoi = new Date();
      const ngayHetHanMoi = new Date(ngayKyMoi);
      ngayHetHanMoi.setFullYear(ngayHetHanMoi.getFullYear() + 1);
      
      // Lấy phí bảo hiểm hiện tại
      const oldContract = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query('SELECT PhiBaoHiem FROM HopDong WHERE MaHD = @maHD');
      
      const phiBaoHiemMoi = oldContract.recordset[0].PhiBaoHiem;
      
      const result = await pool.request()
        .input('MaHDCu', sql.VarChar(20), id)
        .input('NgayKyMoi', sql.Date, ngayKyMoi)
        .input('NgayHetHanMoi', sql.Date, ngayHetHanMoi)
        .input('PhiBaoHiemMoi', sql.Decimal(18, 2), phiBaoHiemMoi)
        .input('MaNV', sql.VarChar(10), maNV)
        .output('MaHDMoiOut', sql.VarChar(20))
        .execute('sp_RenewHopDong');

      const maHDMoi = result.output.MaHDMoiOut;

      if (!maHDMoi) {
        return res.status(500).json({
          success: false,
          message: 'Tái tục thành công nhưng không lấy được mã hợp đồng mới'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Tái tục hợp đồng thành công',
        data: { maHDMoi }
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================
  // Chuyển nhượng hợp đồng (Transfer ownership)
  // ============================
  async transferContract(req, res, next) {
    try {
      const { id } = req.params;
      const { maKHMoi, lyDo } = req.body;
      const { maNV } = req.user;

      if (!maKHMoi) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn khách hàng mới'
        });
      }

      const pool = await getConnection();

      // Kiểm tra trạng thái hợp đồng
      const checkContract = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query(`
          SELECT TrangThai, MaXe 
          FROM HopDong 
          WHERE MaHD = @maHD
        `);

      if (checkContract.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng'
        });
      }

      if (checkContract.recordset[0].TrangThai !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể chuyển nhượng hợp đồng đang hiệu lực'
        });
      }

      const maXe = checkContract.recordset[0].MaXe;
      const phiBaoHiem = checkContract.recordset[0].PhiBaoHiem;

      // Sử dụng SP chuyển quyền (cần đầy đủ params)
      const ngayKyMoi = new Date();
      const ngayHetHanMoi = new Date(ngayKyMoi);
      ngayHetHanMoi.setFullYear(ngayHetHanMoi.getFullYear() + 1);
      
      const result = await pool.request()
        .input('MaHDCu', sql.VarChar(20), id)
        .input('MaKHMoi', sql.VarChar(10), maKHMoi)
        .input('NgayKyMoi', sql.Date, ngayKyMoi)
        .input('NgayHetHanMoi', sql.Date, ngayHetHanMoi)
        .input('PhiBaoHiemMoi', sql.Decimal(18, 2), phiBaoHiem)
        .input('MaNV', sql.VarChar(10), maNV)
        .output('MaHDMoiOut', sql.VarChar(20))
        .execute('sp_ChuyenQuyenHopDong');

      const maHDMoi = result.output.MaHDMoiOut;

      // NOTE: Theo yêu cầu, sau khi chuyển quyền cần THẨM ĐỊNH LẠI
      // Tạo hồ sơ thẩm định mới cho khách hàng mới
      const newAssessment = await pool.request()
        .input('MaKH', sql.VarChar(10), maKHMoi)
        .input('MaXe', sql.VarChar(10), maXe)
        .input('MaNV_Nhap', sql.VarChar(10), maNV)
        .input('GhiChu', sql.NVarChar(500), `Thẩm định lại sau chuyển nhượng từ HĐ ${id}`)
        .query(`
          INSERT INTO HoSoThamDinh (MaKH, MaXe, MaNV_Nhap, GhiChu, TrangThai)
          OUTPUT INSERTED.MaHS
          VALUES (@MaKH, @MaXe, @MaNV_Nhap, @GhiChu, N'Chờ thẩm định')
        `);

      const maHS = newAssessment.recordset[0].MaHS;

      // Tự động thẩm định
      try {
        await pool.request()
          .input('MaHS', sql.VarChar(10), maHS)
          .execute('sp_TinhDiemThamDinh');
      } catch (assessError) {
        console.error('Lỗi thẩm định tự động sau chuyển nhượng:', assessError);
      }

      res.status(201).json({
        success: true,
        message: 'Đã chuyển nhượng hợp đồng. Vui lòng kiểm tra hồ sơ thẩm định để lập hợp đồng mới.',
        data: { 
          maHSMoi: maHS,
          note: 'Cần duyệt hồ sơ thẩm định trước khi lập hợp đồng mới'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================
  // Lấy lịch sử quan hệ hợp đồng (renewal/transfer history)
  // ============================
  async getContractRelations(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      
      // Lấy cả hợp đồng cha và con
      const result = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query(`
          SELECT hr.*, 
                 hd_goc.NgayKy AS NgayKy_Goc, hd_goc.TrangThai AS TrangThai_Goc,
                 hd_moi.NgayKy AS NgayKy_Moi, hd_moi.TrangThai AS TrangThai_Moi
          FROM HopDongRelation hr
          LEFT JOIN HopDong hd_goc ON hr.MaHD_Goc = hd_goc.MaHD
          LEFT JOIN HopDong hd_moi ON hr.MaHD_Moi = hd_moi.MaHD
          WHERE hr.MaHD_Goc = @maHD OR hr.MaHD_Moi = @maHD
          ORDER BY hr.NgayTao DESC
        `);

      res.json({
        success: true,
        data: result.recordset
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================
  // TẢI CHỨNG TỪ - GIẤY TỜ
  // ============================
  
  /**
   * Tải Giấy chứng nhận bảo hiểm
   */
  async downloadCertificate(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      
      // Lấy thông tin đầy đủ hợp đồng
      const result = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query(`
          SELECT hd.*, 
                 kh.HoTen as TenKhachHang, 
                 kh.CMND_CCCD,
                 kh.DiaChi as DiaChiKhachHang,
                 kh.SDT as SDTKhachHang,
                 xe.HangXe, 
                 xe.LoaiXe,
                 xe.NamSX,
                 xe.SoKhung,
                 xe.SoMay,
                 gb.TenGoi as TenGoiBaoHiem,
                 bs.BienSo
          FROM HopDong hd
          LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN GoiBaoHiem gb ON hd.MaGoi = gb.MaGoi
          LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE hd.MaHD = @maHD
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
      }

      const contractData = result.recordset[0];

      // Tạo file PDF
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileName = `ChungNhan_${id}_${Date.now()}.pdf`;
      const filePath = path.join(tempDir, fileName);

      await documentService.generateInsuranceCertificate(contractData, filePath);

      // Gửi file về client
      res.download(filePath, `ChungNhan_BaoHiem_${id}.pdf`, (err) => {
        // Xóa file sau khi tải xong
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (err) {next(err);}
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tải Hợp đồng bảo hiểm chi tiết
   */
  async downloadContract(req, res, next) {
    try {
      const { id } = req.params;

      const pool = await getConnection();
      
      const result = await pool.request()
        .input('maHD', sql.VarChar(10), id)
        .query(`
          SELECT hd.*, 
                 kh.HoTen as TenKhachHang, 
                 kh.CMND_CCCD,
                 kh.DiaChi as DiaChiKhachHang,
                 kh.SDT as SDTKhachHang,
                 xe.HangXe, 
                 xe.LoaiXe,
                 xe.NamSX,
                 xe.SoKhung,
                 xe.SoMay,
                 gb.TenGoi as TenGoiBaoHiem,
                 bs.BienSo
          FROM HopDong hd
          LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN GoiBaoHiem gb ON hd.MaGoi = gb.MaGoi
          LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE hd.MaHD = @maHD
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
      }

      const contractData = result.recordset[0];

      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileName = `HopDong_${id}_${Date.now()}.pdf`;
      const filePath = path.join(tempDir, fileName);

      await documentService.generateContract(contractData, filePath);

      res.download(filePath, `HopDong_BaoHiem_${id}.pdf`, (err) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (err) {next(err);}
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tải Biên lai thu phí theo thanh toán
   */
  async downloadReceipt(req, res, next) {
    try {
      const { paymentId } = req.params;

      const pool = await getConnection();
      
      const result = await pool.request()
        .input('maTT', sql.VarChar(10), paymentId)
        .query(`
          SELECT tt.*, 
                 kh.HoTen as TenKhachHang,
                 bs.BienSo
          FROM ThanhToanHopDong tt
          LEFT JOIN HopDong hd ON tt.MaHD = hd.MaHD
          LEFT JOIN KhachHang kh ON hd.MaKH = kh.MaKH
          LEFT JOIN Xe xe ON hd.MaXe = xe.MaXe
          LEFT JOIN KhachHangXe kxe ON xe.MaXe = kxe.MaXe AND kxe.NgayKetThucSoHuu IS NULL
          LEFT JOIN BienSoXe bs ON kxe.MaKH = bs.MaKH AND bs.TrangThai = N'Hoạt động'
          WHERE tt.MaTT = @maTT
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy giao dịch thanh toán' });
      }

      const paymentData = result.recordset[0];

      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileName = `BienLai_${paymentId}_${Date.now()}.pdf`;
      const filePath = path.join(tempDir, fileName);

      await documentService.generateReceipt(paymentData, filePath);

      res.download(filePath, `BienLai_${paymentId}.pdf`, (err) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (err) {next(err);}
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa hợp đồng (chỉ cho phép xóa hợp đồng nháp hoặc chờ duyệt)
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const pool = await getConnection();

      // Kiểm tra hợp đồng tồn tại
      const checkContract = await pool.request()
        .input('MaHD', sql.VarChar(15), id)
        .query('SELECT TrangThai FROM HopDong WHERE MaHD = @MaHD');

      if (checkContract.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy hợp đồng'
        });
      }

      const trangThai = checkContract.recordset[0].TrangThai;

      // Chỉ cho phép xóa hợp đồng nháp hoặc chờ duyệt
      if (!['Nháp', 'Chờ duyệt'].includes(trangThai)) {
        return res.status(400).json({
          success: false,
          message: `Không thể xóa hợp đồng có trạng thái "${trangThai}". Chỉ có thể xóa hợp đồng "Nháp" hoặc "Chờ duyệt".`
        });
      }

      // LUẬT NGHIỆP VỤ 5.3: Kiểm tra thanh toán trước khi xóa
      const checkPayment = await pool.request()
        .input('MaHD', sql.VarChar(15), id)
        .query('SELECT COUNT(*) as count FROM ThanhToanHopDong WHERE MaHD = @MaHD');

      if (checkPayment.recordset[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa hợp đồng đã có giao dịch thanh toán'
        });
      }

      // Xóa hợp đồng
      await pool.request()
        .input('MaHD', sql.VarChar(15), id)
        .query('DELETE FROM HopDong WHERE MaHD = @MaHD');

      res.json({
        success: true,
        message: 'Đã xóa hợp đồng thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContractController();
