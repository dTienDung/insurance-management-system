// ============================================
// PJICO - Backend Server (FIXED CORS)
// Tổng Công ty Bảo hiểm Petrolimex
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { COMPANY, APP, API, MESSAGES } = require('./config/constants');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ENHANCED CORS Configuration - Allow both localhost and network IPs
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) {return callback(null, true);}
    
    // Allow any localhost, 127.0.0.1, or local network IP
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,           // localhost:any-port
      /^http:\/\/127\.0\.0\.1:\d+$/,        // 127.0.0.1:any-port
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,  // 192.168.x.x:any-port
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,  // 10.x.x.x:any-port
      /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/  // 172.16-31.x.x:any-port
    ];
    
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400 // Cache preflight for 24 hours
}));

// Handle preflight requests
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // giới hạn 100 requests
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting only to /api routes
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging with IP address
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
  // Log incoming requests with IP
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
  });
}

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: `Chào mừng đến với ${APP.fullName}`,
    company: COMPANY.fullName,
    version: APP.version,
    timestamp: new Date().toISOString(),
    clientIP: req.ip
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Hệ thống đang hoạt động bình thường',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: API.port
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/license-plates', require('./routes/licensePlateRoutes'));
// Vietnamese alias for contracts and new hoso routes
app.use('/api/hopdong', require('./routes/contractRoutes'));
app.use('/api/hoso', require('./routes/hosoRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
// Master Data Management (Phase 1)
app.use('/api/criteria', require('./routes/assessmentCriteriaRoutes'));
app.use('/api/pricing', require('./routes/pricingMatrixRoutes'));
app.use('/api/audit', require('./routes/auditLogRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy API endpoint',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log error details
  console.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    body: req.body
  });
  
  const status = err.status || 500;
  const message = err.message || MESSAGES.ERROR.SERVER;
  
  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.stack,
      details: err 
    })
  });
});

// Get server IP addresses
const os = require('os');
function getServerIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// Start server
const PORT = API.port;
const server = app.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
  const serverIPs = getServerIPs();
  
  console.log('');
  console.log('============================================');
  console.log(`${APP.fullName}`);
  console.log(`${COMPANY.fullName}`);
  console.log('============================================');
  console.log('🚀 Server đang chạy tại:');
  console.log(`   📍 Local: http://localhost:${PORT}`);
  
  serverIPs.forEach(ip => {
    console.log(`   📍 Network: http://${ip}:${PORT}`);
  });
  
  console.log('');
  console.log(`📁 Environment: ${API.environment}`);
  console.log('🔗 API Base: /api');
  console.log(`🏢 Website: ${COMPANY.website}`);
  console.log(`📞 Hotline: ${COMPANY.hotline}`);
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   admin / admin123 (Admin)');
  console.log('   nhanvien / nhanvien123 (Nhân viên)');
  console.log('============================================');
  console.log('✅ Server ready to accept connections!');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;