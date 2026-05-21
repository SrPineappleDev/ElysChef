// Entidad Profile: mapea una fila de la tabla `profiles` al tipo de dominio Profile.
// El campo `role` no está en los tipos auto-generados de Supabase, por lo que se castea manualmente.

import type { Tables, Enums } from "@/integrations/supabase/types";

export type ProfileRow = Tables<"profiles">;
export type UserPlan = Enums<"user_plan">;

export interface Profile {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  plan: UserPlan;
  credits: number;
  role: "user" | "admin";
}

export function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    nombre: row.nombre,
    apellidos: row.apellidos,
    email: row.email,
    plan: row.plan,
    credits: row.credits,
    // `role` no está en los tipos generados; se castea con fallback a "user"
    role: (row.role as "user" | "admin") ?? "user",
  };
}
