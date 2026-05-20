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
    role: (row.role as "user" | "admin") ?? "user",
  };
}
