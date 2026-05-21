// Traduce los mensajes de error de Supabase Auth (en inglés) a cadenas en español comprensibles para el usuario.
export function traducirErrorAuth(message: string): string {
  if (message.includes("Invalid login credentials")) return "Email o contraseña incorrectos";
  if (message.includes("User already registered")) return "Ya existe una cuenta con ese email";
  if (message.includes("Password should be at least")) return "La contraseña debe tener al menos 6 caracteres";
  if (message.includes("Too many requests") || message.includes("over_email_send_rate_limit")) return "Demasiadas solicitudes. Espera unos segundos e inténtalo de nuevo";
  if (message.includes("Unable to validate email address")) return "El formato del email no es válido";
  if (message.includes("signup is disabled")) return "El registro está desactivado temporalmente";
  if (message.includes("La contraseña actual es incorrecta")) return "La contraseña actual es incorrecta";
  return "Ha ocurrido un error. Inténtalo de nuevo";
}
