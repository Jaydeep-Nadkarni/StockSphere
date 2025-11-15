import React, { createContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Only initialize socket if user is authenticated
    if (!token) {
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      toast.success('Real-time connection established', {
        autoClose: 2000,
        hideProgressBar: true,
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      toast.warning('Connection lost. Attempting to reconnect...', {
        autoClose: false,
        hideProgressBar: true,
      });
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(`Connection error: ${error}`, {
        autoClose: 3000,
      });
    });

    // Event listeners for notifications
    newSocket.on('lowStockAlert', (data) => {
      toast.warning(`⚠️ Low Stock: ${data.productName} - Only ${data.currentStock} units left`, {
        autoClose: 5000,
      });
    });

    newSocket.on('nearExpiryAlert', (data) => {
      const urgencyIcon = {
        critical: '🔴',
        urgent: '🟠',
        warning: '🟡',
      };
      toast.warning(
        `${urgencyIcon[data.urgency]} Expiry Alert: ${data.productName} (Batch: ${data.batchNo})`,
        {
          autoClose: 5000,
        }
      );
    });

    newSocket.on('newOrder', (data) => {
      toast.info(
        `📦 New Order: ${data.orderNo} from ${data.customer?.name || 'Customer'} - ₹${data.totalAmount}`,
        {
          autoClose: 4000,
        }
      );
    });

    newSocket.on('orderStatusChanged', (data) => {
      toast.info(`📋 Order ${data.orderNo} status updated to ${data.status}`, {
        autoClose: 3000,
      });
    });

    newSocket.on('inventoryUpdate', (data) => {
      toast.info(`📊 Inventory: ${data.productName} - ${data.action} (${data.quantity} units)`, {
        autoClose: 3000,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
