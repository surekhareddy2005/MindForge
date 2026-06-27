import React from 'react';
import { Navigate } from 'react-router-dom';

const StudentProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'student') {
    // Redirect to mentor dashboard or a generic unauthorized page
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default StudentProtectedRoute;
