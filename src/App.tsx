// Componente raíz de la aplicación.
// Configura los proveedores globales (React Query, tooltips, notificaciones, autenticación)
// y define las rutas principales de la aplicación usando React Router.

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/use-auth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Carga diferida (lazy loading) de páginas para reducir el bundle inicial
const Index = lazy(() => import("./pages/Index"));
const Analyze = lazy(() => import("./pages/Analyze"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Spinner de carga que se muestra mientras se descarga una página
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Cliente de React Query para gestionar el estado del servidor y la caché de datos
const queryClient = new QueryClient();

// Componente principal que envuelve toda la app con los proveedores necesarios
const App = () => (
  // ErrorBoundary global: captura errores no controlados y muestra pantalla de error amigable
  <ErrorBoundary>
    {/* Proveedor de React Query para manejo de peticiones y caché */}
    <QueryClientProvider client={queryClient}>
      {/* Proveedor de tooltips para toda la aplicación */}
      <TooltipProvider>
        {/* Sistema de notificaciones toast (dos variantes) */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Proveedor de autenticación: expone sesión, usuario y perfil a toda la app */}
          <AuthProvider>
            {/* Barra de navegación: sidebar en desktop, top bar en móvil */}
            <Navbar />
            {/* En desktop se compensa el ancho del sidebar (w-60 = 240px) */}
            <div className="lg:pl-60">
            {/* Suspense muestra el spinner mientras se descarga una página con lazy loading */}
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Página principal (landing) */}
                <Route path="/" element={<Index />} />
                {/* Página de inicio de sesión y registro */}
                <Route path="/auth" element={<Auth />} />
                {/* Rutas protegidas: solo accesibles si hay sesión activa */}
                <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                {/* Ruta comodín para páginas no encontradas */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
