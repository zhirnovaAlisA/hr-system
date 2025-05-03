import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  // Проверяем авторизацию
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Проверяем роль, если требуется
  if (requiredRole && requiredRole !== 'any' && userRole !== requiredRole) {
    return <Navigate to="/forbidden" replace />;
  }
  
  return children;
};

export default ProtectedRoute;