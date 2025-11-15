// Load environment variables at the very top
require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeSocket } = require('./utils/socket');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const batchRoutes = require('./routes/batchRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiAnalyticsRoutes = require('./routes/aiAnalyticsRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware - CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware - Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Wholesale Inventory API is running',
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// User management routes (Admin only)
app.use('/api/users', userRoutes);

// Product management routes
app.use('/api/products', productRoutes);

// Batch and inventory tracking routes
app.use('/api/batches', batchRoutes);
// AI Analytics routes
app.use('/api/ai', aiAnalyticsRoutes);
// Reporting and analytics routes
app.use('/api/reports', reportRoutes);

// Supplier management routes
app.use('/api/suppliers', supplierRoutes);

// Customer management routes
app.use('/api/customers', customerRoutes);

// Order management routes
app.use('/api/orders', orderRoutes);

// 404 Handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.IO initialized\n`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
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
