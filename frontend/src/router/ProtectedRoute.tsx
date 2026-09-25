import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../data';

interface ProtectedRouteProps {
  children: ReactNode;
  // Rendered when the user isn't logged in at all.
  fallback: ReactNode;
  // Optional: only let this role through. Anyone else sees unauthorizedFallback.
  requiredRole?: UserRole;
  unauthorizedFallback?: ReactNode;
}

export default function ProtectedRoute({ children, fallback, requiredRole, unauthorizedFallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Session restore (GET /api/auth/me) is still in flight — don't redirect yet.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-2" style={{ background: '#F3F7F5' }}>
        <Loader2 size={18} className="animate-spin" color="#16A34A" />
        <span className="text-sm text-[#9CA3AF]">Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <>{unauthorizedFallback ?? null}</>;
  }

  return <>{children}</>;
}
