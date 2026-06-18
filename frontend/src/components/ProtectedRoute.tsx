import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthStorage } from '../services/authStorage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!AuthStorage.isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
