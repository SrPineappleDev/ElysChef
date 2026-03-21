// Componente NavLink compatible con React Router v6.
// Envuelve el NavLink de React Router y permite pasar clases CSS separadas
// para el estado activo y pendiente, sin necesidad de usar funciones inline.

import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Props extendidas que añaden soporte para clases de estado activo y pendiente
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;       // Clase CSS base siempre aplicada
  activeClassName?: string; // Clase CSS aplicada cuando el enlace está activo
  pendingClassName?: string; // Clase CSS aplicada mientras la ruta está cargando
}

/**
 * Componente de enlace de navegación con soporte para clases condicionales.
 * Combina las clases base, activa y pendiente usando la utilidad cn().
 * Usa forwardRef para permitir que componentes padres accedan al elemento <a>.
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        // Combina las clases según el estado actual del enlace
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
