const jwt = require('jsonwebtoken');
const socketio = require('socket.io');

let io = null;

// @desc    Initialize Socket.IO with JWT authentication
// @param   {http.Server} server - HTTP server instance
// @returns {socketio.Server} Socket.IO instance
exports.initializeSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware for JWT authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication failed: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication failed: Invalid token'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`[Socket] User ${socket.userId} connected: ${socket.id}`);

    // Join user's personal room for targeted notifications
    socket.join(`user_${socket.userId}`);
    socket.join(`role_${socket.userRole}`);

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`[Socket] User ${socket.userId} disconnected: ${socket.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`[Socket] Error from ${socket.userId}:`, error);
    });
  });

  return io;
};

// @desc    Get the Socket.IO instance
// @returns {socketio.Server} Socket.IO instance
exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// @desc    Emit low stock alert
// @param   {string} productName - Product name
// @param   {number} currentStock - Current stock level
// @param   {number} threshold - Low stock threshold
exports.emitLowStockAlert = (productName, currentStock, threshold) => {
  if (!io) return;
  io.to('role_admin').emit('lowStockAlert', {
    productName,
    currentStock,
    threshold,
    timestamp: new Date(),
  });
};

// @desc    Emit near-expiry alert
// @param   {string} productName - Product name
// @param   {string} batchNo - Batch number
// @param   {Date} expiryDate - Expiry date
// @param   {string} urgency - 'critical' | 'urgent' | 'warning'
exports.emitNearExpiryAlert = (
  productName,
  batchNo,
  expiryDate,
  urgency = 'warning'
) => {
  if (!io) return;
  io.to('role_admin')
    .to('role_manager')
    .emit('nearExpiryAlert', {
      productName,
      batchNo,
      expiryDate,
      urgency,
      timestamp: new Date(),
    });
};

// @desc    Emit new order notification
// @param   {object} orderData - Order details { orderId, orderNo, customer, totalAmount }
exports.emitNewOrder = (orderData) => {
  if (!io) return;
  io.to('role_admin')
    .to('role_manager')
    .emit('newOrder', {
      ...orderData,
      timestamp: new Date(),
    });
};

// @desc    Emit order status change notification
// @param   {object} statusData - Status update { orderId, orderNo, status, previousStatus }
exports.emitOrderStatusChanged = (statusData) => {
  if (!io) return;
  io.emit('orderStatusChanged', {
    ...statusData,
    timestamp: new Date(),
  });
};

// @desc    Emit inventory update notification
// @param   {object} updateData - Update details { productId, productName, action, quantity }
exports.emitInventoryUpdate = (updateData) => {
  if (!io) return;
  io.to('role_admin')
    .to('role_manager')
    .emit('inventoryUpdate', {
      ...updateData,
      timestamp: new Date(),
    });
};

// @desc    Broadcast message to specific role
// @param   {string} role - User role
// @param   {string} event - Event name
// @param   {object} data - Data to emit
exports.broadcastToRole = (role, event, data) => {
  if (!io) return;
  io.to(`role_${role}`).emit(event, {
    ...data,
    timestamp: new Date(),
  });
};

// @desc    Broadcast message to specific user
// @param   {string} userId - User ID
// @param   {string} event - Event name
// @param   {object} data - Data to emit
exports.broadcastToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user_${userId}`).emit(event, {
    ...data,
    timestamp: new Date(),
  });
};
