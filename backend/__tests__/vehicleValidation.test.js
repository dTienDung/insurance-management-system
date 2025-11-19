/**
 * UNIT TEST: Vehicle Validation Rules
 * Based on rule.docx specifications
 * 
 * Vehicle Business Rules:
 * - VIN (SoKhung_VIN) must be exactly 17 characters
 * - NamSX must be >= 1990 and <= current year
 * - GiaTriXe must be > 0
 * - LoaiXe must be valid type
 */

const { validateVehicle, validateVIN, validateYear } = require('../businessRules');

describe('Vehicle Validation Rules - Business Rules', () => {
  const currentYear = new Date().getFullYear();

  describe('validateVIN() - Kiểm tra VIN', () => {
    test('VIN đúng 17 ký tự → PASS', () => {
      const validVIN = '1HGBH41JXMN109186';
      expect(validateVIN(validVIN)).toBe(true);
    });

    test('VIN 16 ký tự → FAIL', () => {
      const invalidVIN = '1HGBH41JXMN10918';
      expect(() => validateVIN(invalidVIN)).toThrow('VIN phải có đúng 17 ký tự');
    });

    test('VIN 18 ký tự → FAIL', () => {
      const invalidVIN = '1HGBH41JXMN1091866';
      expect(() => validateVIN(invalidVIN)).toThrow('VIN phải có đúng 17 ký tự');
    });

    test('VIN rỗng → FAIL', () => {
      expect(() => validateVIN('')).toThrow('VIN không được để trống');
    });

    test('VIN null/undefined → FAIL', () => {
      expect(() => validateVIN(null)).toThrow('VIN không được để trống');
      expect(() => validateVIN(undefined)).toThrow('VIN không được để trống');
    });

    test('VIN chứa khoảng trắng (17 chars) → FAIL', () => {
      const invalidVIN = '1HGBH41J XMN10918'; // 17 chars nhưng có space
      expect(() => validateVIN(invalidVIN)).toThrow('VIN không được chứa khoảng trắng');
    });
  });

  describe('validateYear() - Kiểm tra Năm sản xuất', () => {
    test('Năm 2023 (năm hiện tại) → PASS', () => {
      expect(validateYear(2023)).toBe(true);
    });

    test('Năm 1990 (biên dưới) → PASS', () => {
      expect(validateYear(1990)).toBe(true);
    });

    test('Năm 2000 (giữa khoảng) → PASS', () => {
      expect(validateYear(2000)).toBe(true);
    });

    test('Năm 1989 (trước 1990) → FAIL', () => {
      expect(() => validateYear(1989)).toThrow('Năm sản xuất phải từ 1990 trở lên');
    });

    test(`Năm ${currentYear + 1} (năm sau) → FAIL`, () => {
      expect(() => validateYear(currentYear + 1)).toThrow('Năm sản xuất không được vượt quá năm hiện tại');
    });

    test('Năm âm → FAIL', () => {
      expect(() => validateYear(-2000)).toThrow('Năm sản xuất không hợp lệ');
    });

    test('Năm = 0 → FAIL', () => {
      expect(() => validateYear(0)).toThrow('Năm sản xuất không hợp lệ');
    });
  });

  describe('validateVehicle() - Kiểm tra toàn bộ xe', () => {
    test('Xe hợp lệ đầy đủ → PASS', () => {
      const validVehicle = {
        SoKhung_VIN: '1HGBH41JXMN109186',
        NamSX: 2020,
        LoaiXe: 'Sedan',
        HangXe: 'Toyota',
        GiaTriXe: 500000000
      };
      
      expect(validateVehicle(validVehicle)).toBe(true);
    });

    test('Xe thiếu VIN → FAIL', () => {
      const invalidVehicle = {
        NamSX: 2020,
        LoaiXe: 'Sedan',
        GiaTriXe: 500000000
      };
      
      expect(() => validateVehicle(invalidVehicle)).toThrow('VIN không được để trống');
    });

    test('Xe có VIN sai độ dài → FAIL', () => {
      const invalidVehicle = {
        SoKhung_VIN: '123', // Chỉ 3 ký tự
        NamSX: 2020,
        LoaiXe: 'Sedan',
        GiaTriXe: 500000000
      };
      
      expect(() => validateVehicle(invalidVehicle)).toThrow('VIN phải có đúng 17 ký tự');
    });

    test('Xe có năm SX không hợp lệ → FAIL', () => {
      const invalidVehicle = {
        SoKhung_VIN: '1HGBH41JXMN109186',
        NamSX: 1980, // < 1990
        LoaiXe: 'Sedan',
        GiaTriXe: 500000000
      };
      
      expect(() => validateVehicle(invalidVehicle)).toThrow('Năm sản xuất phải từ 1990 trở lên');
    });

    test('Xe có giá trị = 0 → FAIL', () => {
      const invalidVehicle = {
        SoKhung_VIN: '1HGBH41JXMN109186',
        NamSX: 2020,
        LoaiXe: 'Sedan',
        GiaTriXe: 0
      };
      
      expect(() => validateVehicle(invalidVehicle)).toThrow('Giá trị xe phải lớn hơn 0');
    });

    test('Xe có giá trị âm → FAIL', () => {
      const invalidVehicle = {
        SoKhung_VIN: '1HGBH41JXMN109186',
        NamSX: 2020,
        LoaiXe: 'Sedan',
        GiaTriXe: -1000000
      };
      
      expect(() => validateVehicle(invalidVehicle)).toThrow('Giá trị xe phải lớn hơn 0');
    });
  });
});
