const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConnection, sql } = require('../config/database');

class AuthController {
  async login(req, res, next) {
    try {
      const { tenDangNhap, matKhau } = req.body;

      if (!tenDangNhap || !matKhau) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
        });
      }

      const pool = await getConnection();
      const result = await pool.request()
        .input('tenDangNhap', sql.VarChar(30), tenDangNhap)
        .query(`
          SELECT tk.*, nv.HoTen, nv.ChucVu, nv.Email
          FROM TaiKhoan tk
          LEFT JOIN NhanVien nv ON tk.MaNV = nv.MaNV
          WHERE tk.TenDangNhap = @tenDangNhap AND tk.TrangThai = N'Hoạt động'
        `);

      if (result.recordset.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
        });
      }

      const user = result.recordset[0];
      // ⚠️ DEMO MODE: So sánh password trực tiếp (KHÔNG AN TOÀN!)
      if (matKhau !== user.MatKhau) {
        return res.status(401).json({
          success: false,
          message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
        });
      }

      const token = jwt.sign(
        {
          maTK: user.MaTK,
          maNV: user.MaNV,
          tenDangNhap: user.TenDangNhap,
          vaiTro: user.VaiTro,
          hoTen: user.HoTen
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      const refreshToken = jwt.sign(
        { maTK: user.MaTK },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
      );

      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          token,
          refreshToken,
          user: {
            maTK: user.MaTK,
            maNV: user.MaNV,
            tenDangNhap: user.TenDangNhap,
            hoTen: user.HoTen,
            vaiTro: user.VaiTro,
            chucVu: user.ChucVu,
            email: user.Email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { matKhauCu, matKhauMoi } = req.body;
      const { maTK } = req.user;

      if (!matKhauCu || !matKhauMoi) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin'
        });
      }

      if (matKhauMoi.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
        });
      }

      const pool = await getConnection();
      const result = await pool.request()
        .input('maTK', sql.VarChar(10), maTK)
        .query('SELECT MatKhau FROM TaiKhoan WHERE MaTK = @maTK');

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
      }

      const isPasswordValid = (matKhauCu === result.recordset[0].MatKhau);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Mật khẩu cũ không chính xác'
        });
      }

      await pool.request()
        .input('maTK', sql.VarChar(10), maTK)
        .input('matKhau', sql.VarChar(64), matKhauMoi)
        .query('UPDATE TaiKhoan SET MatKhau = @matKhau WHERE MaTK = @maTK');

      res.json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const { maTK } = req.user;

      const pool = await getConnection();
      const result = await pool.request()
        .input('maTK', sql.VarChar(10), maTK)
        .query(`
          SELECT tk.MaTK, tk.TenDangNhap, tk.VaiTro, tk.TrangThai,
                 nv.MaNV, nv.HoTen, nv.ChucVu, nv.PhongBan, nv.SDT, nv.Email
          FROM TaiKhoan tk
          LEFT JOIN NhanVien nv ON tk.MaNV = nv.MaNV
          WHERE tk.MaTK = @maTK
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin tài khoản'
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
}

module.exports = new AuthController();
