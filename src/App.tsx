// Componente raíz de la aplicaciOn.
// Configura los proveedores globales (React Query, tooltips, notificaciones, autenticación)
// y define las rutas principales de la aplicación usando React Router.

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/use-auth";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Analyze from "./pages/Analyze";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Cliente de React Query para gestionar el estado del servidor y la caché de datos
const queryClient = new QueryClient();

// Componente principal que envuelve toda la app con los proveedores necesarios
const App = () => (
  // Proveedor de React Query para manejo de peticiones y caché
  <QueryClientProvider client={queryClient}>
    {/* Proveedor de tooltips para toda la aplicación */}
    <TooltipProvider>
      {/* Sistema de notificaciones toast (dos variantes) */}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Proveedor de autenticación: expone sesión, usuario y perfil a toda la app */}
        <AuthProvider>
          {/* Barra de navegación visible en todas las páginas */}
          <Navbar />
          <Routes>
            {/* Página principal (landing) */}
            <Route path="/" element={<Index />} />
            {/* Página de inicio de sesión y registro */}
            <Route path="/auth" element={<Auth />} />
            {/* Rutas protegidas: solo accesibles si hay sesión activa */}
            <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* Ruta comodín para páginas no encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
