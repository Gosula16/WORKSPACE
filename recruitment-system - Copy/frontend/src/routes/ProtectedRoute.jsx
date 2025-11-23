import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  // If user not in context, try localStorage (fast fallback)
  if (!user) {
    try {
      const s = localStorage.getItem('auth');
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.user) {
          if (!role || parsed.user.role === role) return children;
          return <div>Forbidden</div>;
        }
      }
    } catch (e) { /* ignore */ }
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) return <div>Forbidden</div>;
  return children;
}
