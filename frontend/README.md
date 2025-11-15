# Frontend Documentation

## Wholesale Inventory Frontend

A modern React + Vite frontend for the Wholesale Inventory and Sales Management System with Tailwind CSS styling, role-based access control, and real-time Socket.IO integration.

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Backend API running on localhost:5000

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js              # Axios instance with JWT interceptors
│   ├── context/
│   │   ├── AuthContext.jsx       # Authentication state management
│   │   └── SocketContext.jsx     # Socket.IO integration
│   ├── components/
│   │   ├── ProtectedRoute.jsx    # Route protection wrapper
│   │   ├── RoleGuard.jsx         # Role-based component rendering
│   │   ├── Navbar.jsx            # Top navigation
│   │   ├── Sidebar.jsx           # Side navigation with user menu
│   │   └── DataTable.jsx         # Reusable table component
│   ├── pages/
│   │   └── Login.jsx             # Login page with JWT storage
│   ├── utils/
│   │   ├── formatCurrency.js     # Currency, date, number formatting
│   │   └── calculateTotals.js    # Calculation utilities
│   ├── hooks/
│   │   ├── useAuth.js            # Auth context hook
│   │   └── useSocket.js          # Socket context hook
│   ├── App.jsx                   # Main app with routing
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind CSS
├── public/                        # Static assets
├── package.json                   # Dependencies and scripts
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
└── index.html                    # HTML template
```

### Key Features

#### Authentication
- JWT token-based authentication
- Automatic token refresh on 401 responses
- localStorage persistence
- Protected routes with loading states

#### Authorization
- Role-based access control (Admin, Manager, Clerk)
- RoleGuard component for conditional rendering
- Route-level protection with role verification

#### UI Components
- **ProtectedRoute**: Wraps routes requiring authentication
- **RoleGuard**: Conditionally renders components based on user role
- **Navbar**: Top navigation with user profile dropdown
- **Sidebar**: Navigation menu with role-based items
- **DataTable**: Reusable table with search, pagination, and actions

#### Real-time Features
- Socket.IO client integration
- Automatic connection on login
- Graceful disconnect on logout
- Automatic reconnection with backoff

#### Utilities
- **formatCurrency**: Format numbers as currency (USD, EUR, etc.)
- **formatDate/formatDateOnly**: Date formatting
- **formatPercentage**: Percentage formatting
- **calculateTotal**: Compute line totals
- **calculateInventoryValue**: Calculate total inventory worth
- **calculateStockStats**: Get stock statistics

### API Integration

The frontend uses Axios with JWT interceptors:

```javascript
import apiClient from './api/axios';

// Automatically includes Authorization header
const response = await apiClient.get('/products');

// Token is refreshed automatically on 401
// User is redirected to login on auth failure
```

### Authentication Flow

1. User enters email and password on login page
2. Frontend sends POST /api/auth/login
3. Backend returns JWT token and user data
4. Token is stored in localStorage
5. User is redirected to dashboard
6. Token is automatically included in all subsequent requests
7. On logout or token expiration, user is redirected to login

### Routing

```
/ → /dashboard (if authenticated)
/login → Login page (public)
/dashboard → Dashboard (protected)
/products → Products management (protected)
/batches → Batch management (protected)
/reports → Analytics reports (protected, admin/manager only)
/users → User management (protected, admin only)
/profile → User profile (protected)
* → /login (redirect)
```

### Development Tips

#### Using Auth Context
```javascript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return <div>Welcome {user?.name}</div>;
}
```

#### Using Socket Context
```javascript
import { useSocket } from './hooks/useSocket';

function RealtimeComponent() {
  const { socket, isConnected } = useSocket();
  
  useEffect(() => {
    if (socket) {
      socket.on('data-update', (data) => {
        // Handle real-time data
      });
    }
  }, [socket]);
}
```

#### Using DataTable
```javascript
<DataTable
  columns={[
    { key: 'name', label: 'Product Name' },
    { key: 'price', label: 'Price', render: (v) => formatCurrency(v) },
    { key: 'stock', label: 'Stock' }
  ]}
  data={products}
  actions={[
    { label: 'Edit', onClick: (row) => editProduct(row) }
  ]}
  paginated
  searchable
/>
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API base URL | http://localhost:5000/api |
| VITE_SOCKET_URL | Socket.IO server URL | http://localhost:5000 |
| VITE_ENV | Environment mode | development |

### Styling

The project uses Tailwind CSS with custom extensions:

- **Primary Color**: #3b82f6 (Blue)
- **Secondary Color**: #10b981 (Green)
- **Danger Color**: #ef4444 (Red)
- **Warning Color**: #f59e0b (Amber)

Customize in `tailwind.config.js`

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance Optimizations

- Code splitting with React Router
- Lazy loading of route components
- Optimized Tailwind CSS builds
- Automatic tree-shaking by Vite

### Troubleshooting

#### CORS Errors
- Ensure backend is running on localhost:5000
- Check VITE_API_URL in .env
- Verify backend CORS configuration

#### 401 Unauthorized
- Token may be expired or invalid
- User will be automatically redirected to login
- Clear localStorage and login again if needed

#### Socket Connection Issues
- Check backend Socket.IO configuration
- Verify VITE_SOCKET_URL in .env
- Check browser console for connection logs

### Production Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy `dist/` folder to your hosting service

3. Configure environment variables on your hosting platform

4. Update VITE_API_URL to point to production backend

### Contributing

Follow the existing code style and component patterns. All new components should:
- Be functional components with hooks
- Include proper error handling
- Use Tailwind CSS for styling
- Export from index files for cleaner imports

### License

ISC
