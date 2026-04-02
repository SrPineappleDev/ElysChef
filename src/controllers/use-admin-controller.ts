// Controlador del panel de administración.
// Gestiona la carga de KPIs y el catálogo de alergias.

import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as adminService from "@/models/admin-service";
import * as allergyService from "@/models/allergy-service";
import type { Allergy } from "@/models/allergy-service";

export function useAdminController() {
  const [userStats, setUserStats] = useState<adminService.UserStats | null>(null);
  const [recipeStats, setRecipeStats] = useState<adminService.RecipeStats | null>(null);
  const [allergyStats, setAllergyStats] = useState<adminService.AllergyStats[]>([]);
  const [creditStats, setCreditStats] = useState<{ totalConsumed: number } | null>(null);
  const [profiles, setProfiles] = useState<adminService.AdminProfile[]>([]);
  const [catalog, setCatalog] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para añadir nueva alergia al catálogo
  const [newAllergyName, setNewAllergyName] = useState("");
  const [savingAllergy, setSavingAllergy] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [us, rs, as_, cs, pf, cat] = await Promise.all([
        adminService.fetchUserStats(),
        adminService.fetchRecipeStats(),
        adminService.fetchAllergyStats(),
        adminService.fetchCreditStats(),
        adminService.fetchAllProfiles(),
        allergyService.fetchAllergies(),
      ]);
      setUserStats(us);
      setRecipeStats(rs);
      setAllergyStats(as_);
      setCreditStats(cs);
      setProfiles(pf);
      setCatalog(cat);
    } catch {
      toast.error("Error al cargar los datos del panel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /** Añade una nueva alergia al catálogo. */
  const handleAddAllergy = async () => {
    if (!newAllergyName.trim()) return;
    setSavingAllergy(true);
    try {
      await allergyService.addAllergy(newAllergyName);
      setNewAllergyName("");
      toast.success("Alergia añadida al catálogo");
      const updated = await allergyService.fetchAllergies();
      setCatalog(updated);
    } catch (e: any) {
      toast.error(e.message?.includes("duplicate") ? "Esa alergia ya existe" : "Error al añadir la alergia");
    } finally {
      setSavingAllergy(false);
    }
  };

  /** Elimina una alergia del catálogo. */
  const handleDeleteAllergy = async (id: string) => {
    try {
      await allergyService.deleteAllergy(id);
      setCatalog((prev) => prev.filter((a) => a.id !== id));
      toast.success("Alergia eliminada del catálogo");
    } catch {
      toast.error("Error al eliminar la alergia");
    }
  };

  return {
    loading,
    userStats,
    recipeStats,
    allergyStats,
    creditStats,
    profiles,
    catalog,
    newAllergyName,
    setNewAllergyName,
    savingAllergy,
    handleAddAllergy,
    handleDeleteAllergy,
  };
}
