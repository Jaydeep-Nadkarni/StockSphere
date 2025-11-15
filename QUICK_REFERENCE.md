# PHASE 5 - QUICK REFERENCE GUIDE

## 🚀 Running the Application

### Terminal 1: Backend
```bash
cd backend
npm install  # if not already done
npm start    # or node server.js
# Server running on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm install  # if not already done
npm run dev  # or npm run build for production
# App running on http://localhost:5173
```

---

## 📡 Testing Endpoints

### Using Browser Console
```javascript
const token = localStorage.getItem('token');
const headers = { 'Authorization': `Bearer ${token}` };

// Test Suppliers
fetch('http://localhost:5000/api/suppliers', { headers })
  .then(r => r.json()).then(d => console.log(d));

// Create Supplier
fetch('http://localhost:5000/api/suppliers', {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'ABC Supplies',
    email: 'abc@supplies.com',
    phone: '9876543210',
    address: '123 Business St'
  })
}).then(r => r.json()).then(d => console.log(d));
```

### Using Postman
1. Create Supplier: `POST /api/suppliers`
2. Get All: `GET /api/suppliers`
3. Get One: `GET /api/suppliers/{id}`
4. Update: `PUT /api/suppliers/{id}`
5. Delete: `DELETE /api/suppliers/{id}`

**Headers Required:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Manager | manager@example.com | password |
| Clerk | clerk@example.com | password |

---

## 📊 Files Overview

### Backend New Files
```
backend/
├── models/
│   ├── Supplier.js          (189 lines)
│   ├── Customer.js          (166 lines)
│   └── Order.js             (366 lines)
├── controllers/
│   ├── supplierController.js (185 lines)
│   ├── customerController.js (192 lines)
│   └── orderController.js   (487 lines)
├── routes/
│   ├── supplierRoutes.js    (20 lines)
│   ├── customerRoutes.js    (20 lines)
│   └── orderRoutes.js       (28 lines)
├── utils/
│   └── socket.js            (150 lines)
└── server.js                (UPDATED)
```

### Frontend New Files
```
frontend/
├── src/
│   ├── components/
│   │   ├── Toast.jsx        (NEW - toast wrapper)
│   │   └── Sidebar.jsx      (UPDATED - new routes)
│   ├── context/
│   │   └── SocketContext.jsx (ENHANCED - event listeners)
│   └── App.jsx              (UPDATED - new routes)
└── package.json             (UPDATED - new dependencies)
```

---

## 🎯 Key Endpoints

### Suppliers
```
GET    /api/suppliers                    List all
GET    /api/suppliers/:id                Get one
POST   /api/suppliers                    Create
PUT    /api/suppliers/:id                Update
DELETE /api/suppliers/:id                Delete
```

### Customers
```
GET    /api/customers                    List all
GET    /api/customers/:id                Get one
POST   /api/customers                    Create (all roles)
PUT    /api/customers/:id                Update
DELETE /api/customers/:id                Delete
```

### Orders
```
GET    /api/orders                       List all
GET    /api/orders/:id                   Get one
GET    /api/orders/:id/invoice           Get invoice
POST   /api/orders                       Create (with stock mgmt)
PUT    /api/orders/:id                   Update (Pending only)
PATCH  /api/orders/:id/status            Update status
DELETE /api/orders/:id                   Delete (restore stock)
```

---

## 🔔 Socket.IO Events

### Events to Listen
```javascript
socket.on('lowStockAlert', (data) => {...})
socket.on('nearExpiryAlert', (data) => {...})
socket.on('newOrder', (data) => {...})
socket.on('orderStatusChanged', (data) => {...})
socket.on('inventoryUpdate', (data) => {...})
```

### Auto-Toast Notifications
- ✅ All events auto-convert to toasts in SocketContext
- ✅ No additional code needed in components
- ✅ Just listen to socket events if needed

---

## 📦 Create Order Example

### Request
```json
{
  "customerId": "customer_id",
  "items": [
    {
      "productId": "product_id",
      "batchId": "batch_id",
      "quantity": 5
    }
  ],
  "discount": 100,
  "notes": "Urgent order"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "order": {
      "orderNo": "ORD-20240125-0001",
      "customerId": {...},
      "items": [...],
      "subtotal": 5000,
      "tax": 900,
      "netAmount": 5800,
      "status": "Pending",
      "_id": "..."
    }
  }
}
```

---

## 🐛 Debugging Tips

### Check Socket Connection
```javascript
// In browser console
const { socket } = useSocket();
console.log(socket?.connected);  // true/false
console.log(socket?.id);         // socket id
```

### Test Stock Management
```javascript
// Create order and verify:
// 1. Batch quantity decreased
// 2. Product currentStock updated
// 3. Order created with correct netAmount
```

### View Errors
```javascript
// Browser: Check Console tab
// Backend: Check server logs
// Network: Check XHR requests in Network tab
```

---

## 🔄 Order Workflow

### State Transitions
```
Pending ──> Confirmed ──> Delivered
  │
  └──────> Cancelled (from any state)
```

### Stock Management
```
Order Created
  ↓
Validate batches (expiry, quantity)
  ↓
Deduct from batches (within transaction)
  ↓
Update Product.currentStock
  ↓
Emit 'newOrder' event
  ↓
✅ Order Complete
(or ❌ Rollback if error)
```

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Backend on 5000
netstat -ano | find "5000"
# Kill process
taskkill /PID <PID> /F

# Or change PORT
PORT=5001 npm start
```

### CORS Error
**Solution:** Check `CLIENT_URL` in backend `.env`
```
CLIENT_URL=http://localhost:5173
```

### Socket Connection Failed
**Check:**
1. Token exists: `localStorage.getItem('token')`
2. Socket URL correct: `http://localhost:5000`
3. Backend Socket.IO running

### Stock Not Deducting
**Check:**
1. Batch quantity sufficient
2. Batch not expired
3. Transaction completed (no errors)

---

## 📈 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Creates dist/ folder
```

### Environment Variables
```
# Backend .env
MONGODB_URI=production_uri
JWT_SECRET=your_secret
NODE_ENV=production
PORT=5000
CLIENT_URL=your_frontend_url
CORS_ORIGIN=your_frontend_url

# Frontend .env
VITE_API_URL=your_backend_url
VITE_SOCKET_URL=your_backend_url
```

### Deploy
- Backend: Deploy to AWS/Heroku/DigitalOcean
- Frontend: Deploy to Vercel/Netlify
- Database: MongoDB Atlas or managed service

---

## 📞 File Quick Access

### Backend Most Important
1. `server.js` - Main server file (Socket.IO integrated)
2. `controllers/orderController.js` - Complex business logic
3. `models/Order.js` - Order schema with auto-generation
4. `utils/socket.js` - Socket event emitters

### Frontend Most Important
1. `App.jsx` - Routing and layouts
2. `context/SocketContext.jsx` - Real-time events
3. `components/Toast.jsx` - Notifications
4. `components/DataTable.jsx` - Reusable table
5. `api/axios.js` - HTTP client

---

## ✅ Implementation Checklist for Next Phase

### Before Starting Feature Pages
- [ ] Run backend: `npm start`
- [ ] Run frontend: `npm run dev`
- [ ] Test login with demo credentials
- [ ] Verify Socket.IO connection (check browser console)
- [ ] Test one API endpoint (e.g., GET suppliers)
- [ ] Verify toast notification appears

### For Each Feature Page
- [ ] Create component file in `src/pages/`
- [ ] Add route to `App.jsx`
- [ ] Add sidebar navigation item
- [ ] Implement list view with DataTable
- [ ] Implement create/edit forms
- [ ] Add delete confirmation
- [ ] Test all CRUD operations
- [ ] Add real-time updates (if applicable)
- [ ] Test role-based access

---

## 🎓 Code Examples

### Fetch and Display Data
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const { data } = await axios.get('/api/suppliers');
    if (data.success) {
      setData(data.data.suppliers);
    }
  } catch (error) {
    toast.error(error.response?.data?.message);
  } finally {
    setLoading(false);
  }
};
```

### Create New Record
```javascript
const handleCreate = async (formData) => {
  try {
    const { data } = await axios.post('/api/suppliers', formData);
    if (data.success) {
      toast.success('Created successfully');
      fetchData();  // Refresh list
    }
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
```

### Update Record
```javascript
const handleUpdate = async (id, formData) => {
  try {
    const { data } = await axios.put(`/api/suppliers/${id}`, formData);
    if (data.success) {
      toast.success('Updated successfully');
      fetchData();
    }
  } catch (error) {
    toast.error(error.response?.data?.message);
  }
};
```

### Delete Record
```javascript
const handleDelete = async (id) => {
  if (window.confirm('Are you sure?')) {
    try {
      await axios.delete(`/api/suppliers/${id}`);
      toast.success('Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  }
};
```

---

**QUICK REFERENCE - PHASE 5 COMPLETE ✅**

All systems operational. Ready for feature development.
