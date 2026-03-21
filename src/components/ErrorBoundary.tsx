// Componente de límite de errores (Error Boundary).
// Captura errores no controlados en el árbol de componentes hijos y muestra
// una pantalla de error amigable en lugar de que la app se rompa por completo.

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error Boundary que envuelve secciones de la app para capturar
 * errores de renderizado y mostrar un fallback en lugar de una pantalla en blanco.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center space-y-4 px-6">
            <h2 className="text-2xl font-bold text-foreground">Algo salió mal</h2>
            <p className="text-muted-foreground">
              Ocurrió un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
