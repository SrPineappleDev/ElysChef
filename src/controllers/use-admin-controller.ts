// Controlador del panel de administración.
// Gestiona los KPIs y los catálogos de alergias, países, categorías y dietas
// con soporte de soft delete (archivar/restaurar).

import { useState, useEffect } from "react";
import { toast } from "sonner";
import * as adminService from "@/models/admin-service";
import * as allergyService from "@/models/allergy-service";
import * as catalogService from "@/models/catalog-service";
import type { Allergy } from "@/models/allergy-service";
import type { CatalogCountry, CatalogCategory, CatalogDiet } from "@/models/catalog-service";

export function useAdminController() {
  const [userStats, setUserStats] = useState<adminService.UserStats | null>(null);
  const [recipeStats, setRecipeStats] = useState<adminService.RecipeStats | null>(null);
  const [allergyStats, setAllergyStats] = useState<adminService.AllergyStats[]>([]);
  const [creditStats, setCreditStats] = useState<{ totalConsumed: number } | null>(null);
  const [profiles, setProfiles] = useState<adminService.AdminProfile[]>([]);
  const [catalog, setCatalog] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);

  const [newAllergyName, setNewAllergyName] = useState("");
  const [savingAllergy, setSavingAllergy] = useState(false);

  // Catálogos: todos los registros incluidos los archivados
  const [countries, setCountries] = useState<CatalogCountry[]>([]);
  const [newCountry, setNewCountry] = useState("");
  const [savingCountry, setSavingCountry] = useState(false);

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  const [diets, setDiets] = useState<CatalogDiet[]>([]);
  const [newDiet, setNewDiet] = useState("");
  const [savingDiet, setSavingDiet] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [us, rs, as_, cs, pf, cat, ctrs, cats, dts] = await Promise.all([
        adminService.fetchUserStats(),
        adminService.fetchRecipeStats(),
        adminService.fetchAllergyStats(),
        adminService.fetchCreditStats(),
        adminService.fetchAllProfiles(),
        allergyService.fetchAllergies(),
        catalogService.fetchAllCountries(),
        catalogService.fetchAllCategories(),
        catalogService.fetchAllDiets(),
      ]);
      setUserStats(us);
      setRecipeStats(rs);
      setAllergyStats(as_);
      setCreditStats(cs);
      setProfiles(pf);
      setCatalog(cat);
      setCountries(ctrs);
      setCategories(cats);
      setDiets(dts);
    } catch {
      toast.error("Error al cargar los datos del panel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ─── Alergias ─────────────────────────────────────────────────────────────

  const handleAddAllergy = async () => {
    if (!newAllergyName.trim()) return;
    setSavingAllergy(true);
    try {
      await allergyService.addAllergy(newAllergyName);
      setNewAllergyName("");
      toast.success("Alergia añadida al catálogo");
      setCatalog(await allergyService.fetchAllergies());
    } catch (e: any) {
      toast.error(e.message?.includes("duplicate") ? "Esa alergia ya existe" : "Error al añadir la alergia");
    } finally {
      setSavingAllergy(false);
    }
  };

  const handleDeleteAllergy = async (id: string) => {
    try {
      await allergyService.deleteAllergy(id);
      setCatalog((prev) => prev.filter((a) => a.id !== id));
      toast.success("Alergia eliminada del catálogo");
    } catch {
      toast.error("Error al eliminar la alergia");
    }
  };

  // ─── Países ───────────────────────────────────────────────────────────────

  const handleAddCountry = async () => {
    if (!newCountry.trim()) return;
    setSavingCountry(true);
    try {
      await catalogService.addCountry(newCountry);
      setNewCountry("");
      toast.success("País añadido al catálogo");
      setCountries(await catalogService.fetchAllCountries());
    } catch (e: any) {
      toast.error(e.message?.includes("duplicate") ? "Ese país ya existe" : "Error al añadir el país");
    } finally {
      setSavingCountry(false);
    }
  };

  const handleArchiveCountry = async (id: string) => {
    try {
      await catalogService.archiveCountry(id);
      setCountries((prev) => prev.map((c) => c.id === id ? { ...c, archived: true } : c));
      toast.success("País archivado");
    } catch {
      toast.error("Error al archivar el país");
    }
  };

  const handleRestoreCountry = async (id: string) => {
    try {
      await catalogService.restoreCountry(id);
      setCountries((prev) => prev.map((c) => c.id === id ? { ...c, archived: false } : c));
      toast.success("País restaurado");
    } catch {
      toast.error("Error al restaurar el país");
    }
  };

  // ─── Categorías ───────────────────────────────────────────────────────────

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setSavingCategory(true);
    try {
      await catalogService.addCategory(newCategory);
      setNewCategory("");
      toast.success("Categoría añadida al catálogo");
      setCategories(await catalogService.fetchAllCategories());
    } catch (e: any) {
      toast.error(e.message?.includes("duplicate") ? "Esa categoría ya existe" : "Error al añadir la categoría");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleArchiveCategory = async (id: string) => {
    try {
      await catalogService.archiveCategory(id);
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, archived: true } : c));
      toast.success("Categoría archivada");
    } catch {
      toast.error("Error al archivar la categoría");
    }
  };

  const handleRestoreCategory = async (id: string) => {
    try {
      await catalogService.restoreCategory(id);
      setCategories((prev) => prev.map((c) => c.id === id ? { ...c, archived: false } : c));
      toast.success("Categoría restaurada");
    } catch {
      toast.error("Error al restaurar la categoría");
    }
  };

  // ─── Dietas ───────────────────────────────────────────────────────────────

  const handleAddDiet = async () => {
    if (!newDiet.trim()) return;
    setSavingDiet(true);
    try {
      await catalogService.addDiet(newDiet);
      setNewDiet("");
      toast.success("Dieta añadida al catálogo");
      setDiets(await catalogService.fetchAllDiets());
    } catch (e: any) {
      toast.error(e.message?.includes("duplicate") ? "Esa dieta ya existe" : "Error al añadir la dieta");
    } finally {
      setSavingDiet(false);
    }
  };

  const handleArchiveDiet = async (id: string) => {
    try {
      await catalogService.archiveDiet(id);
      setDiets((prev) => prev.map((d) => d.id === id ? { ...d, archived: true } : d));
      toast.success("Dieta archivada");
    } catch {
      toast.error("Error al archivar la dieta");
    }
  };

  const handleRestoreDiet = async (id: string) => {
    try {
      await catalogService.restoreDiet(id);
      setDiets((prev) => prev.map((d) => d.id === id ? { ...d, archived: false } : d));
      toast.success("Dieta restaurada");
    } catch {
      toast.error("Error al restaurar la dieta");
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
    countries,
    newCountry,
    setNewCountry,
    savingCountry,
    handleAddCountry,
    handleArchiveCountry,
    handleRestoreCountry,
    categories,
    newCategory,
    setNewCategory,
    savingCategory,
    handleAddCategory,
    handleArchiveCategory,
    handleRestoreCategory,
    diets,
    newDiet,
    setNewDiet,
    savingDiet,
    handleAddDiet,
    handleArchiveDiet,
    handleRestoreDiet,
  };
}
