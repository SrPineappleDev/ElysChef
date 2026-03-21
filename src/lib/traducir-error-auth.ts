// Utilidad para traducir errores de autenticación al español.
// Convierte los mensajes de error técnicos de Supabase Auth en mensajes
// claros y comprensibles para el usuario final.

/**
 * Traduce los mensajes de error de Supabase Auth al español.
 * Recibe el mensaje de error original en inglés y devuelve
 * una descripción amigable en español.
 */
export function traducirErrorAuth(message: string): string {
  // Credenciales incorrectas al iniciar sesión
  if (message.includes("Invalid login credentials")) return "Email o contraseña incorrectos";
  // El email ya tiene una cuenta registrada
  if (message.includes("User already registered")) return "Ya existe una cuenta con ese email";
  // La contraseña no cumple el mínimo de caracteres
  if (message.includes("Password should be at least")) return "La contraseña debe tener al menos 6 caracteres";
  // Se han hecho demasiadas peticiones en poco tiempo
  if (message.includes("Too many requests") || message.includes("over_email_send_rate_limit")) return "Demasiadas solicitudes. Espera unos segundos e inténtalo de nuevo";
  // Formato de email inválido
  if (message.includes("Unable to validate email address")) return "El formato del email no es válido";
  // El registro de nuevos usuarios está desactivado
  if (message.includes("signup is disabled")) return "El registro está desactivado temporalmente";
  // Error al verificar la contraseña actual en el cambio de contraseña
  if (message.includes("La contraseña actual es incorrecta")) return "La contraseña actual es incorrecta";
  // Mensaje genérico para cualquier otro error no contemplado
  return "Ha ocurrido un error. Inténtalo de nuevo";
}
