// Las tablas `allergies` y `user_allergies` no están en los tipos auto-generados de Supabase todavía.
export interface Allergy {
  id: string;
  name: string;
  created_at: string | null;
}
