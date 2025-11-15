# Phase 5 Frontend Integration Guide

## Overview
Frontend has been set up with all necessary infrastructure for real-time updates, toast notifications, and route management. Ready for feature page implementation.

---

## 1. Current Frontend Status

### ✅ Completed
- React + Vite + Tailwind CSS setup
- AuthContext with login/logout/register
- Enhanced SocketContext with event listeners
- JWT interceptor via axios
- Toast component and react-toastify integration
- ProtectedRoute wrapper
- RoleGuard component
- Navbar and Sidebar with role-aware navigation
- DataTable reusable component
- Login page with JWT storage
- All new routes added (Orders, Suppliers, Customers)
- Chart.js, react-toastify, react-chartjs-2 dependencies added

### ⏳ In Progress
- Feature page implementations

### 📋 Not Started
- Dashboard with analytics charts
- Products page with CRUD
- Orders page with dynamic items
- Suppliers/Customers CRUD pages
- Reports page with 5 sections
- Invoice generation

---

## 2. Toast Notifications Integration

### Usage Pattern
```javascript
import { toast } from 'react-toastify';

// Success
toast.success('Operation completed!');

// Error
toast.error('Something went wrong');

// Warning
toast.warning('Please review this');

// Info
toast.info('New information available');

// Custom
toast.info('🎉 Success!');
```

### Socket.IO Events Auto-Converted to Toasts
All events in SocketContext automatically display:
- `lowStockAlert` → Warning with product name
- `nearExpiryAlert` → Warning with urgency icon
- `newOrder` → Info with order details
- `orderStatusChanged` → Info with status
- `inventoryUpdate` → Info with quantity change

---

## 3. API Integration Pattern

### Standard API Calls
```javascript
import axios from './api/axios';

// GET all
const { data } = await axios.get('/api/products');
const { success, data: { products, total, pages } } = data;

// GET single
const { data } = await axios.get(`/api/products/${id}`);
const { success, data: { product } } = data;

// POST
const { data } = await axios.post('/api/products', { 
  name: 'Product', 
  price: 100 
});
const { success, data: { product } } = data;

// PUT
const { data } = await axios.put(`/api/products/${id}`, updates);

// DELETE
await axios.delete(`/api/products/${id}`);
```

### Error Handling
```javascript
try {
  const { data } = await axios.get('/api/products');
  if (data.success) {
    setProducts(data.data.products);
  }
} catch (error) {
  // 401 auto-handled by interceptor (redirects to login)
  // Other errors logged by interceptor
  toast.error(error.response?.data?.message || 'Error occurred');
}
```

---

## 4. Using Custom Hooks

### useAuth Hook
```javascript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </>
  );
}
```

### useSocket Hook
```javascript
import { useSocket } from '../hooks/useSocket';

function RealtimeComponent() {
  const { socket, isConnected } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('customEvent', (data) => {
      console.log('Event received:', data);
    });
  }, [socket]);
  
  return <div>{isConnected ? '🟢 Connected' : '⚪ Disconnected'}</div>;
}
```

---

## 5. DataTable Component Usage

### Basic Example
```javascript
import DataTable from '../components/DataTable';
import { formatCurrency } from '../utils/formatCurrency';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { key: 'name', label: 'Product Name' },
    { 
      key: 'price', 
      label: 'Price',
      render: (value) => formatCurrency(value)
    },
    { 
      key: 'currentStock', 
      label: 'Stock',
      render: (value, row) => (
        <span className={value < 10 ? 'text-red-600' : 'text-green-600'}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => editProduct(row._id)}>Edit</button>
          <button onClick={() => deleteProduct(row._id)}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      loading={loading}
      onRowClick={(row) => viewProduct(row._id)}
    />
  );
}
```

---

## 6. Format Utilities

### Currency Formatting
```javascript
import { formatCurrency, formatDate, formatNumber } from '../utils/formatCurrency';

formatCurrency(1000);        // "₹1,000.00"
formatCurrency(1000.5);      // "₹1,000.50"
formatCurrency(0);           // "₹0.00"

formatDate(new Date());      // "25 Jan, 2024"
formatNumber(1000);          // "1,000"
formatNumber(1000.5);        // "1,000.5"
```

---

## 7. RoleGuard Usage

### Hide/Show Elements by Role
```javascript
import RoleGuard from '../components/RoleGuard';

function Dashboard() {
  return (
    <>
      <RoleGuard allowedRoles={['admin']}>
        <button>Delete Everything</button>
      </RoleGuard>

      <RoleGuard allowedRoles={['admin', 'manager']}>
        <section>Manager Controls</section>
      </RoleGuard>

      <RoleGuard allowedRoles={['admin', 'manager', 'clerk']}>
        <p>Visible to all authenticated users</p>
      </RoleGuard>
    </>
  );
}
```

---

## 8. Feature Page Templates

### List Page Template
```javascript
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import { toast } from 'react-toastify';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/products', { 
        params: { page, limit: 10 } 
      });
      if (data.success) {
        setProducts(data.data.products);
        setTotal(data.data.total);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <DataTable 
        columns={productColumns}
        data={products}
        loading={loading}
      />
    </div>
  );
}

export default ProductsPage;
```

### Form Page Template
```javascript
import { useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function AddProductPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    category: '',
    supplierId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post('/api/products', formData);
      if (data.success) {
        toast.success('Product created successfully');
        navigate('/products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Add Product</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}

export default AddProductPage;
```

---

## 9. Socket.IO Integration in Pages

### Real-Time Updates Example
```javascript
import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for new orders
    socket.on('newOrder', (data) => {
      setOrders(prev => [data, ...prev]);
    });

    // Listen for order status changes
    socket.on('orderStatusChanged', (data) => {
      setOrders(prev => prev.map(order => 
        order._id === data.orderId 
          ? { ...order, status: data.status }
          : order
      ));
    });

    return () => {
      socket.off('newOrder');
      socket.off('orderStatusChanged');
    };
  }, [socket]);

  return <div>{/* Render orders */}</div>;
}
```

---

## 10. Next Steps - Feature Pages to Create

### Priority 1: Core CRUD Pages
1. **Products Page** - Listing with search, add/edit modals
2. **Orders Page** - Order listing with status filtering
3. **Suppliers Page** - CRUD with modal
4. **Customers Page** - CRUD with modal

### Priority 2: Complex Pages
5. **Dashboard** - Charts with Chart.js
6. **Create Order** - Dynamic items table with auto-calculation
7. **Reports** - Tabbed interface with analytics

### Priority 3: Specialized Pages
8. **Invoice** - Printable template
9. **Edit Order** - Reuses Create Order logic
10. **Batch Management** - Related to Products

---

## 11. Tailwind CSS Customization

### Available Custom Colors (in tailwind.config.js)
```javascript
primary: '#3b82f6'      // Blue
secondary: '#10b981'    // Green
danger: '#ef4444'       // Red
warning: '#f59e0b'      // Amber
success: '#10b981'      // Green
```

### Common Tailwind Patterns
```jsx
// Button Styles
<button className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700">
  Primary Button
</button>

// Form Inputs
<input className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />

// Cards
<div className="bg-white rounded-lg shadow-md p-6 space-y-4">
  {/* Content */}
</div>

// Success/Error Text
<p className="text-green-600">Success message</p>
<p className="text-red-600">Error message</p>
```

---

## 12. Testing API Endpoints

### Using Frontend Console
```javascript
// Test from browser console
const token = localStorage.getItem('token');
const headers = { Authorization: `Bearer ${token}` };

// Test Supplier endpoint
fetch('http://localhost:5000/api/suppliers', { headers })
  .then(r => r.json())
  .then(d => console.log(d));

// Create Supplier
fetch('http://localhost:5000/api/suppliers', {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Supplier',
    email: 'test@example.com',
    phone: '9876543210',
    address: 'Test Address'
  })
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## 13. Environment Variables

### Create `.env` file
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Access in Code
```javascript
const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
```

---

**Status:** Frontend infrastructure COMPLETE ✅

All dependencies installed, contexts enhanced, routing configured, and components prepared.
Ready to begin feature page implementations.
