// Componente de barra de navegación principal.
// Muestra el logo, los enlaces de navegación y el estado de la sesión del usuario.
// Si el usuario está autenticado, muestra su nombre, badge VIP y botón de logout.
// Si no lo está, muestra el botón de acceso al formulario de autenticación.

import { Link, useLocation } from "react-router-dom";
import { ChefHat, Heart, Camera, LogOut, Crown, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

// Componente de la barra de navegación sticky con los enlaces principales
const Navbar = () => {
  const location = useLocation();
  const { session, profile, signOut } = useAuth();

  // Definición de los enlaces de navegación principales con su ruta e icono
  const links = [
    { to: "/", label: "Inicio", icon: ChefHat },
    { to: "/analyze", label: "Analizar", icon: Camera },
    { to: "/favorites", label: "Favoritos", icon: Heart },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card border-b">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo y nombre de la aplicación */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">Ely's Chef</span>
        </Link>

        <div className="flex items-center gap-1">
          {/* Renderiza cada enlace de navegación, resaltando el activo */}
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {/* El texto del enlace se oculta en pantallas pequeñas */}
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          {/* Sección derecha: muestra info del usuario o botón de login */}
          {session ? (
            <div className="flex items-center gap-2 ml-2">
              {/* Badge VIP solo visible para usuarios con plan premium */}
              {profile?.plan === "vip" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                  <Crown className="w-3 h-3" /> VIP
                </span>
              )}
              {/* Nombre del usuario como enlace al perfil (solo en pantallas medianas o grandes) */}
              <Link
                to="/profile"
                className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {profile?.nombre || profile?.email}
              </Link>
              {/* Botón para cerrar sesión */}
              <Button variant="ghost" size="icon" onClick={signOut} title="Cerrar sesión">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            // Botón de acceso si no hay sesión activa
            <Link to="/auth">
              <Button variant="outline" size="sm" className="ml-2 font-display">
                <User className="w-4 h-4 mr-1" /> Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
