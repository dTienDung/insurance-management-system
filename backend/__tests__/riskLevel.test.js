/**
 * UNIT TEST: Risk Level Classification
 * Based on rule.docx specifications
 * 
 * Risk Score Classification Rules:
 * - 0-15: LOW risk
 * - 16-25: MEDIUM risk
 * - ≥26: HIGH risk
 */

const { getRiskLevel, calculateRiskScore } = require('../businessRules');

describe('Risk Level Classification - Business Rules', () => {
  describe('getRiskLevel() - Phân loại mức độ rủi ro', () => {
    test('Điểm = 0 → LOW', () => {
      expect(getRiskLevel(0)).toBe('LOW');
    });

    test('Điểm = 15 (biên dưới) → LOW', () => {
      expect(getRiskLevel(15)).toBe('LOW');
    });

    test('Điểm = 10 (giữa khoảng LOW) → LOW', () => {
      expect(getRiskLevel(10)).toBe('LOW');
    });

    test('Điểm = 16 (biên trên LOW) → MEDIUM', () => {
      expect(getRiskLevel(16)).toBe('MEDIUM');
    });

    test('Điểm = 20 (giữa khoảng MEDIUM) → MEDIUM', () => {
      expect(getRiskLevel(20)).toBe('MEDIUM');
    });

    test('Điểm = 25 (biên dưới MEDIUM) → MEDIUM', () => {
      expect(getRiskLevel(25)).toBe('MEDIUM');
    });

    test('Điểm = 26 (biên trên MEDIUM) → HIGH', () => {
      expect(getRiskLevel(26)).toBe('HIGH');
    });

    test('Điểm = 30 (trường hợp HIGH) → HIGH', () => {
      expect(getRiskLevel(30)).toBe('HIGH');
    });

    test('Điểm = 50 (rủi ro rất cao) → HIGH', () => {
      expect(getRiskLevel(50)).toBe('HIGH');
    });

    test('Điểm âm (invalid) → throw error', () => {
      expect(() => getRiskLevel(-5)).toThrow('Risk score cannot be negative');
    });
  });

  describe('calculateRiskScore() - Tính điểm rủi ro tổng hợp', () => {
    test('Xe mới, lái xe có kinh nghiệm → LOW', () => {
      const vehicle = {
        namSX: 2023,
        loaiXe: 'Sedan',
        giaTriXe: 500000000
      };
      const driver = {
        tuoi: 35,
        namKinhNghiem: 10,
        soVuTaiNan: 0
      };
      
      const score = calculateRiskScore(vehicle, driver);
      expect(score).toBeLessThanOrEqual(15);
      expect(getRiskLevel(score)).toBe('LOW');
    });

    test('Xe cũ, lái xe ít kinh nghiệm → MEDIUM', () => {
      const vehicle = {
        namSX: 2010,
        loaiXe: 'SUV',
        giaTriXe: 300000000
      };
      const driver = {
        tuoi: 23,
        namKinhNghiem: 2,
        soVuTaiNan: 1
      };
      
      const score = calculateRiskScore(vehicle, driver);
      expect(score).toBeGreaterThanOrEqual(16);
      expect(score).toBeLessThanOrEqual(25);
      expect(getRiskLevel(score)).toBe('MEDIUM');
    });

    test('Xe rất cũ, lái xe nhiều tai nạn → HIGH', () => {
      const vehicle = {
        namSX: 1995,
        loaiXe: 'Truck',
        giaTriXe: 100000000
      };
      const driver = {
        tuoi: 20,
        namKinhNghiem: 1,
        soVuTaiNan: 3
      };
      
      const score = calculateRiskScore(vehicle, driver);
      expect(score).toBeGreaterThanOrEqual(26);
      expect(getRiskLevel(score)).toBe('HIGH');
    });
  });
});
