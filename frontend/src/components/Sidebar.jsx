import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RoleGuard from './RoleGuard';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'manager', 'clerk'] },
    { path: '/products', label: 'Products', icon: '📦', roles: ['admin', 'manager', 'clerk'] },
    { path: '/batches', label: 'Batches', icon: '📋', roles: ['admin', 'manager', 'clerk'] },
    { path: '/orders', label: 'Orders', icon: '🛒', roles: ['admin', 'manager', 'clerk'] },
    { path: '/suppliers', label: 'Suppliers', icon: '🏭', roles: ['admin', 'manager'] },
    { path: '/customers', label: 'Customers', icon: '👤', roles: ['admin', 'manager', 'clerk'] },
    { path: '/reports', label: 'Reports', icon: '📈', roles: ['admin', 'manager'] },
    { path: '/users', label: 'Users', icon: '👥', roles: ['admin'] },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-gray-900 text-white transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-8">
          {/* User Profile Section */}
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-gray-400 text-sm capitalize">{user?.role}</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <RoleGuard key={item.path} allowedRoles={item.roles}>
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </RoleGuard>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
