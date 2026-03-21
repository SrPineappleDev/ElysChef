// Hook para detectar si el dispositivo tiene pantalla de tamaño móvil.
// Escucha los cambios de tamaño de ventana y devuelve true si el ancho
// es menor al breakpoint definido para móvil (768px).

import * as React from "react";

// Ancho máximo en píxeles considerado como pantalla móvil
const MOBILE_BREAKPOINT = 768;

/**
 * Hook que indica si la pantalla actual es de tamaño móvil.
 * Se suscribe a los cambios de tamaño de ventana con MediaQueryList.
 * Devuelve true si el ancho de la ventana es menor a 768px, false en caso contrario.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Crea una media query que se activa cuando el ancho es menor al breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Actualiza el estado cuando cambia el tamaño de la ventana
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Suscribe el handler al evento de cambio de la media query
    mql.addEventListener("change", onChange);

    // Establece el valor inicial al montar el componente
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Limpia el listener al desmontar
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Convierte undefined a false para devolver siempre un booleano
  return !!isMobile;
}
