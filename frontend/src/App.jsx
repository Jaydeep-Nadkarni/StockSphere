import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import './index.css';

// Placeholder pages for future implementation
const Dashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome to the dashboard - Analytics & charts coming soon</p>
  </div>
);

const Batches = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Batches</h1>
    <p className="text-gray-600 mt-2">Manage product batches</p>
  </div>
);

const Reports = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Reports</h1>
    <p className="text-gray-600 mt-2">View analytics and reports</p>
  </div>
);

const Users = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Users</h1>
    <p className="text-gray-600 mt-2">Manage system users</p>
  </div>
);

const Profile = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">Profile</h1>
    <p className="text-gray-600 mt-2">View and edit your profile</p>
  </div>
);

// Layout wrapper for authenticated pages
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 overflow-auto md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Toast />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Regular Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Products />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/batches"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Batches />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Orders />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/create"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CreateOrder />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suppliers />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Customers />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Reports />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Users />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
