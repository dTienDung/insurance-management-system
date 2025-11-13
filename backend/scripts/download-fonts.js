// ============================================
// SCRIPT TẢI FONT CHO PDF TIẾNG VIỆT
// ============================================

const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '../fonts');

// Noto Sans URLs (từ Google Fonts CDN)
const fonts = {
  'NotoSans-Regular.ttf': 'https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-Regular.ttf',
  'NotoSans-Bold.ttf': 'https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-Bold.ttf',
  'NotoSans-Italic.ttf': 'https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-Italic.ttf',
  'NotoSans-BoldItalic.ttf': 'https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-BoldItalic.ttf'
};

// Tạo thư mục fonts nếu chưa có
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

function downloadFont(filename, url) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(fontsDir, filename);
    
    // Kiểm tra xem file đã tồn tại chưa
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filename} đã tồn tại, bỏ qua`);
      resolve();
      return;
    }

    console.log(`⏬ Đang tải ${filename}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      // Xử lý redirect
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✅ Tải thành công ${filename}`);
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Tải thành công ${filename}`);
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Xóa file lỗi
      reject(err);
    });
  });
}

async function downloadAllFonts() {
  console.log('============================================');
  console.log('TẢI FONT NOTO SANS CHO PDF TIẾNG VIỆT');
  console.log('============================================\n');

  try {
    for (const [filename, url] of Object.entries(fonts)) {
      await downloadFont(filename, url);
    }
    
    console.log('\n============================================');
    console.log('✅ HOÀN TẤT! Tất cả fonts đã được tải về');
    console.log('============================================');
    console.log(`📁 Thư mục: ${fontsDir}`);
    console.log('\n🚀 Khởi động lại server để áp dụng fonts mới!');
  } catch (error) {
    console.error('\n❌ LỖI khi tải fonts:', error.message);
    console.log('\n📝 CÁCH TẢI THỦ CÔNG:');
    console.log('1. Vào https://fonts.google.com/noto/specimen/Noto+Sans');
    console.log('2. Click "Download family"');
    console.log('3. Giải nén và copy các file .ttf vào:');
    console.log(`   ${fontsDir}`);
    process.exit(1);
  }
}

// Chạy script
downloadAllFonts();
