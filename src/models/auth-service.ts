// Servicio de autenticación.
// Contiene las funciones que interactúan directamente con Supabase Auth
// para iniciar sesión, registrar usuarios, cerrar sesión y cambiar contraseña.

import { supabase } from "@/integrations/supabase/client";

/**
 * Inicia sesión con email y contraseña.
 * Lanza un error si las credenciales son incorrectas.
 */
export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/**
 * Registra un nuevo usuario con sus datos personales y plan elegido.
 * Envía un email de confirmación con redirección al origen de la app.
 * Lanza un error si el registro falla (email duplicado, etc.).
 */
export async function signUp(params: {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  plan: "free" | "vip";
}) {
  const { error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      // Metadatos pasados al trigger handle_new_user; el plan es ignorado por el trigger (siempre asigna "free" por seguridad)
      data: {
        nombre: params.nombre,
        apellidos: params.apellidos,
        plan: params.plan,
      },
      // URL de redirección tras confirmar el email
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) throw error;
}

/**
 * Cierra la sesión del usuario actualmente autenticado.
 */
export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Verifica la contraseña actual y, si es correcta, la reemplaza por la nueva.
 * Primero hace un inicio de sesión para validar la contraseña actual.
 * Lanza un error descriptivo si la contraseña actual es incorrecta.
 */
export async function verifyAndUpdatePassword(email: string, currentPassword: string, newPassword: string) {
  // Verifica que la contraseña actual es correcta intentando un inicio de sesión
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (signInError) throw new Error("La contraseña actual es incorrecta");

  // Si la verificación fue exitosa, actualiza la contraseña
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) throw new Error("Error al actualizar la contraseña. Por favor, inténtalo de nuevo.");
}
