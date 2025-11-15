import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
};

export default RoleGuard;
