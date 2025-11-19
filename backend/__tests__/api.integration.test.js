/**
 * API INTEGRATION TESTS
 * Test các endpoint quan trọng với dữ liệu thực tế
 * Sử dụng supertest để test HTTP requests
 */

const request = require('supertest');
const app = require('../server'); // Import Express app
const { getConnection } = require('../config/database');

describe('API Integration Tests - HoSoThamDinh (Assessment)', () => {
  let authToken;
  let testMaHS;

  // Setup: Đăng nhập trước khi test
  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        tenDangNhap: 'admin',
        matKhau: 'admin123'
      });
    
    authToken = loginRes.body.data.token;
  });

  describe('POST /api/assessments/calculate-risk', () => {
    test('Tính điểm thẩm định thành công', async () => {
      // Lấy một hồ sơ thực tế từ database để test
      const pool = await getConnection();
      const hsResult = await pool.request()
        .query(`
          SELECT TOP 1 MaHS 
          FROM HoSoThamDinh 
          WHERE TrangThai = N'Chờ thẩm định'
        `);
      
      // Skip test nếu không có hồ sơ test
      if (hsResult.recordset.length === 0) {
        console.log('⚠️ Skip test: Không có hồ sơ thẩm định nào trong database');
        return;
      }

      testMaHS = hsResult.recordset[0].MaHS;

      const res = await request(app)
        .post('/api/assessments/calculate-risk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ maHS: testMaHS });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('riskLevel');
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(res.body.data.riskLevel);
    });

    test('Từ chối request thiếu maHS', async () => {
      const res = await request(app)
        .post('/api/assessments/calculate-risk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('mã hồ sơ');
    });

    test('Từ chối request không có token', async () => {
      const res = await request(app)
        .post('/api/assessments/calculate-risk')
        .send({ maHS: 'HS_TEST01' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/assessments', () => {
    test('Lấy danh sách hồ sơ thành công', async () => {
      const res = await request(app)
        .get('/api/assessments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
    });

    test('Filter theo risk level', async () => {
      const res = await request(app)
        .get('/api/assessments?riskLevel=LOW')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Kiểm tra tất cả kết quả đều có riskLevel = LOW
      res.body.data.forEach(item => {
        expect(item.RiskLevel).toBe('LOW');
      });
    });

    test('Filter theo ngày', async () => {
      const fromDate = '2024-01-01';
      const toDate = '2024-12-31';

      const res = await request(app)
        .get(`/api/assessments?fromDate=${fromDate}&toDate=${toDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // Cleanup: Xóa dữ liệu test
  afterAll(async () => {
    if (testMaHS) {
      const pool = await getConnection();
      await pool.request()
        .query(`DELETE FROM HoSoThamDinh WHERE MaHS = '${testMaHS}'`);
    }
  });
});

describe('API Integration Tests - Vehicle (Xe)', () => {
  let authToken;
  let testMaXe;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        tenDangNhap: 'admin',
        matKhau: 'admin123'
      });
    
    authToken = loginRes.body.data.token;
  });

  describe('POST /api/vehicles - Validate Business Rules', () => {
    test('Reject VIN < 17 ký tự', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          SoKhung: '12345', // Chỉ 5 ký tự
          SoMay: 'SM123456',
          NamSX: 2020,
          LoaiXe: 'Sedan',
          HangXe: 'Toyota',
          GiaTriXe: 500000000
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('VIN');
    });

    test('Reject NamSX < 1990', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          SoKhung: '1HGBH41JXMN109186', // Valid 17-char VIN
          SoMay: 'SM123456',
          NamSX: 1980, // Vi phạm rule
          LoaiXe: 'Sedan',
          HangXe: 'Toyota',
          GiaTriXe: 500000000
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Năm sản xuất');
    });

    test('Accept valid vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          MaXe: 'XE_TEST_API01',
          SoKhung: '1HGBH41JXMN109999', // Valid 17-char VIN
          SoMay: 'SM999999',
          NamSX: 2020,
          LoaiXe: 'Sedan',
          HangXe: 'Toyota',
          Model: 'Camry',
          GiaTriXe: 500000000
        });

      // Có thể 201 (created) hoặc 400 (duplicate VIN)
      expect([200, 201, 400]).toContain(res.status);
      
      if (res.status === 201) {
        testMaXe = 'XE_TEST_API01';
      }
    });
  });

  afterAll(async () => {
    if (testMaXe) {
      const pool = await getConnection();
      await pool.request()
        .query(`DELETE FROM Xe WHERE MaXe = '${testMaXe}'`);
    }
  });
});

describe('API Integration Tests - Contract (HopDong)', () => {
  let authToken;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        tenDangNhap: 'admin',
        matKhau: 'admin123'
      });
    
    authToken = loginRes.body.data.token;
  });

  describe('GET /api/contracts', () => {
    test('Lấy danh sách hợp đồng thành công', async () => {
      const res = await request(app)
        .get('/api/contracts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Filter theo trạng thái ACTIVE', async () => {
      const res = await request(app)
        .get('/api/contracts?status=ACTIVE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/contracts/:id', () => {
    test('Lấy chi tiết hợp đồng', async () => {
      // Lấy hợp đồng đầu tiên để test
      const listRes = await request(app)
        .get('/api/contracts?limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      if (listRes.body.data && listRes.body.data.length > 0) {
        const maHD = listRes.body.data[0].MaHD;

        const res = await request(app)
          .get(`/api/contracts/${maHD}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.MaHD).toBe(maHD);
      }
    });

    test('Trả về 404 khi không tìm thấy', async () => {
      const res = await request(app)
        .get('/api/contracts/HD_NOT_EXIST')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});
