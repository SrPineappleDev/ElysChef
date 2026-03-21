// Componente de ruta protegida.
// Impide el acceso a páginas privadas si el usuario no está autenticado.
// Muestra un spinner mientras se comprueba la sesión y redirige a /auth si no hay sesión activa.

import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

/**
 * Componente que protege rutas que requieren autenticación.
 * Mientras se verifica la sesión, muestra un indicador de carga.
 * Si no hay sesión activa, redirige automáticamente a la página de login.
 * Si hay sesión, renderiza los componentes hijos normalmente.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  // Muestra un spinner mientras se comprueba si hay sesión activa
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si no hay sesión, redirige a la página de autenticación
  if (!session) return <Navigate to="/auth" replace />;

  // Hay sesión: renderiza el contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;
