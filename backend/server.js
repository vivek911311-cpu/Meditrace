const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts/styles for the frontend
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/symptoms', require('./routes/symptoms'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/vitals', require('./routes/vitals'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/medicine-requests', require('./routes/medicine_requests'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MediTrace API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  🏥 MediTrace Server Running');
  console.log('═══════════════════════════════════════════════');
  console.log(`  🌐 URL:      http://localhost:${PORT}`);
  console.log(`  📡 API:      http://localhost:${PORT}/api`);
  console.log(`  💊 Health:   http://localhost:${PORT}/api/health`);
  console.log(`  🔧 Mode:     ${process.env.NODE_ENV || 'development'}`);
  console.log('═══════════════════════════════════════════════\n');
});
