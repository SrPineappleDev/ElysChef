import { Link, useLocation } from "react-router-dom";
import { ChefHat, Heart, Camera, Crown, User, ShieldCheck, Home } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const { session, profile } = useAuth();

  const links = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/analyze", label: "Analizar", icon: Camera },
    { to: "/favorites", label: "Favoritos", icon: Heart },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* ── MÓVIL: barra superior sticky ── */}
      <nav className="lg:hidden sticky top-0 z-50 glass-card border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline font-display font-bold text-xl text-foreground">Ely's Chef</span>
          </Link>

          <div className="flex items-center gap-0.5 min-w-0">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}

            {session ? (
              <div className="flex items-center gap-0.5 ml-1">
                {profile?.role === "admin" && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/admin")
                        ? "bg-primary text-primary-foreground"
                        : "text-primary hover:bg-primary/10"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                {profile?.plan === "vip" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                    <Crown className="w-3 h-3 shrink-0" />
                    <span className="hidden sm:inline">VIP</span>
                  </span>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline truncate max-w-[6rem]">
                    {profile?.nombre || profile?.email}
                  </span>
                </Link>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="ml-1 font-display">
                  <User className="w-4 h-4 mr-1" /> Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── DESKTOP: sidebar fijo en el lado izquierdo ── */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 z-50 glass-card border-r border-border/60">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-5 border-b border-border/50 shrink-0">
          <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">Ely's Chef</span>
        </div>

        {/* Sección de navegación */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(to)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}

          {profile?.role === "admin" && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive("/admin")
                  ? "bg-primary text-primary-foreground"
                  : "text-primary hover:bg-primary/10"
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Panel Admin
            </Link>
          )}
        </div>

        {/* Sección de usuario en la parte inferior */}
        <div className="px-3 py-4 border-t border-border/50 shrink-0">
          {session ? (
            <div className="space-y-1">
              {profile?.plan === "vip" && (
                <div className="flex items-center gap-2 px-3 py-1">
                  <Crown className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-xs font-semibold text-accent">Plan VIP</span>
                </div>
              )}
              <Link
                to="/profile"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate">{profile?.nombre || profile?.email || "Perfil"}</span>
              </Link>
            </div>
          ) : (
            <Link to="/auth" className="block">
              <Button variant="outline" size="sm" className="w-full font-display justify-start gap-2">
                <User className="w-4 h-4" /> Entrar
              </Button>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
