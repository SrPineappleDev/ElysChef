// Controlador del perfil de usuario.
// Gestiona la edición de datos personales, el cambio de plan y la actualización
// de contraseña. Conecta la página Profile con los servicios de perfil y autenticación.

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import * as profileService from "@/models/profile-service";
import * as authService from "@/models/auth-service";
import { traducirErrorAuth } from "@/lib/traducir-error-auth";

/**
 * Controller: Profile
 * Manages profile editing and plan changes
 */

/**
 * Hook que expone el estado y los manejadores de la página de perfil.
 * Devuelve los datos del perfil, campos editables, estado de carga
 * y funciones para guardar cambios, cambiar plan y actualizar contraseña.
 */
export function useProfileController() {
  const { profile, refreshProfile } = useAuth();

  // Estado editable del nombre y apellidos del usuario
  const [nombre, setNombre] = useState(profile?.nombre || "");
  const [apellidos, setApellidos] = useState(profile?.apellidos || "");
  const [saving, setSaving] = useState(false);

  // Estado del formulario de cambio de contraseña
  const [pwOpen, setPwOpen] = useState(false);        // Controla si el formulario está visible
  const [pwLoading, setPwLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /**
   * Guarda los cambios de nombre y apellidos en la base de datos.
   * Muestra un toast de éxito o error según el resultado.
   * Recarga el perfil para reflejar los cambios en la interfaz.
   */
  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await profileService.updateProfile(profile.id, { nombre, apellidos });
      toast.success("Perfil actualizado correctamente");
      await refreshProfile();
    } catch {
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cambia el plan del usuario (free o vip).
   * No hace nada si el nuevo plan es igual al actual.
   * Muestra un toast de éxito o error y recarga el perfil.
   */
  const handlePlanChange = async (newPlan: "free" | "vip") => {
    if (!profile || newPlan === profile.plan) return;
    try {
      await profileService.updatePlan(profile.id, newPlan);
      toast.success(`Plan cambiado a ${newPlan === "vip" ? "VIP" : "Gratuito"}`);
      await refreshProfile();
    } catch {
      toast.error("Error al cambiar el plan");
    }
  };

  /**
   * Actualiza la contraseña del usuario tras verificar la actual.
   * Valida que la nueva contraseña y su confirmación coincidan
   * y que tenga al menos 6 caracteres.
   * Cierra el formulario y limpia los campos si tiene éxito.
   */
  const handleUpdatePassword = async () => {
    if (!profile) return;
    // Validación: las nuevas contraseñas deben coincidir
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    // Validación: mínimo 6 caracteres
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setPwLoading(true);
    try {
      await authService.verifyAndUpdatePassword(profile.email, currentPassword, newPassword);
      toast.success("Contraseña actualizada correctamente");
      // Cierra el formulario y limpia todos los campos
      setPwOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(traducirErrorAuth((err as Error).message || ""));
    } finally {
      setPwLoading(false);
    }
  };

  /**
   * Cancela el cambio de contraseña y limpia todos los campos del formulario.
   */
  const handleCancelPwChange = () => {
    setPwOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return {
    profile,
    nombre, setNombre,
    apellidos, setApellidos,
    saving,
    handleSave,
    handlePlanChange,
    pwOpen, setPwOpen,
    pwLoading,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    handleUpdatePassword,
    handleCancelPwChange,
  };
}
