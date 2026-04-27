import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../lib/types";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, initializing } = useAuth();
  if (initializing) return <div className="min-h-screen grid place-items-center">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.some((role) => user.roles.includes(role))) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
