// Componente de ruta protegida para el panel de administración.
// Solo permite el acceso si el usuario tiene role === "admin".

import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile || profile.role !== "admin") return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
