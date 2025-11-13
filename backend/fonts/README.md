# Fonts cho PDF tiếng Việt

Để hiển thị đúng tiếng Việt trong file PDF, cần các font hỗ trợ Unicode.

## ✅ Cách tải tự động (KHUYẾN NGHỊ)

Chạy lệnh sau trong thư mục `backend`:

```bash
npm run download-fonts
```

Script sẽ tự động tải **Noto Sans** từ Google Fonts (font tốt nhất cho tiếng Việt).

## 📦 Fonts được tải:

- `NotoSans-Regular.ttf` - Font chữ thường
- `NotoSans-Bold.ttf` - Font chữ đậm
- `NotoSans-Italic.ttf` - Font chữ nghiêng
- `NotoSans-BoldItalic.ttf` - Font chữ đậm nghiêng

## 🔄 Fonts thay thế

Hệ thống tự động tìm fonts theo thứ tự ưu tiên:

1. **Noto Sans** (tốt nhất) ✅
2. **Roboto** (tốt)
3. **DejaVu Sans** (khả dụng)
4. **Helvetica** (không hỗ trợ tiếng Việt)

## 📥 Cách tải thủ công

### Noto Sans (Khuyến nghị):
1. Vào https://fonts.google.com/noto/specimen/Noto+Sans
2. Click "Download family"
3. Giải nén file zip
4. Copy các file `.ttf` vào thư mục này

### Roboto:
1. Vào https://fonts.google.com/specimen/Roboto
2. Click "Download family"
3. Copy các file từ thư mục `static` vào đây

### DejaVu Sans:
1. Tải từ: https://dejavu-fonts.github.io/
2. Copy `DejaVuSans.ttf`, `DejaVuSans-Bold.ttf` vào đây

---

**Lưu ý:** Sau khi tải font, khởi động lại server để áp dụng thay đổi!
