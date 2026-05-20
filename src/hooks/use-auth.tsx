// Hook y proveedor de autenticación global.
// Gestiona la sesión del usuario, el perfil y las funciones de cierre de sesión.
// Expone el contexto de autenticación a toda la aplicación mediante AuthProvider.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

// Estructura del perfil de usuario almacenado en la tabla "profiles" de Supabase
export interface Profile {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  plan: "free" | "vip";
  credits: number;
  role: "user" | "admin";
}

// Tipos de los valores que expone el contexto de autenticación
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Contexto de autenticación con valores por defecto (sin sesión activa)
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

/**
 * Hook para acceder al contexto de autenticación desde cualquier componente.
 * Devuelve la sesión, el usuario, el perfil, el estado de carga y funciones de auth.
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Proveedor de autenticación que envuelve la aplicación.
 * Escucha los cambios de sesión en Supabase, carga el perfil del usuario
 * y expone todo el estado de autenticación a sus componentes hijos.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Obtiene el perfil del usuario desde la base de datos usando su ID.
   * Actualiza el estado local con los datos del perfil.
   */
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (data) setProfile(data as Profile);
  };

  /**
   * Recarga el perfil del usuario actualmente autenticado.
   * Útil para reflejar cambios después de actualizaciones del perfil.
   */
  const refreshProfile = async () => {
    if (session?.user?.id) await fetchProfile(session.user.id);
  };

  // Escucha cambios en el estado de autenticación (login, logout, refresco de token).
  // onAuthStateChange dispara INITIAL_SESSION al montar con la sesión existente,
  // por lo que no hace falta llamar a getSession() por separado para cargar el perfil.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          // Se usa setTimeout para evitar un posible deadlock con el cliente de Supabase
          setTimeout(() => fetchProfile(newSession.user.id), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Cancela la suscripción al desmontar el componente
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Cierra la sesión del usuario actual en Supabase y limpia el perfil local.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
