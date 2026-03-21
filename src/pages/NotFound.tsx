// Página de error 404.
// Se muestra cuando el usuario intenta acceder a una ruta que no existe.
// Registra el intento en consola para facilitar el diagnóstico y ofrece
// un enlace para volver a la página principal.

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * Página de error 404 (página no encontrada).
 * Al montarse, registra en consola el path al que se intentó acceder.
 * Muestra un mensaje claro al usuario con un enlace de regreso al inicio.
 */
const NotFound = () => {
  const location = useLocation();

  // Registra en consola el path no encontrado (solo en entorno de desarrollo)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        {/* Enlace para volver a la página principal */}
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
