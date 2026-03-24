// Página de perfil de usuario.
// Permite al usuario ver y editar sus datos personales (nombre, apellidos),
// cambiar su contraseña y gestionar su plan (gratuito o VIP).
// Delega toda la lógica al controlador useProfileController.

import { User, Mail, Crown, Eye, EyeOff, Zap, Save, KeyRound, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProfileController } from "@/controllers/use-profile-controller";

/**
 * Página de perfil dividida en tres tarjetas:
 * 1. Datos personales (nombre, apellidos, email de solo lectura).
 * 2. Cambio de contraseña (formulario desplegable).
 * 3. Gestión del plan (gratuito / VIP).
 */
const Profile = () => {
  // Obtiene el estado y los manejadores del controlador de perfil
  const {
    profile,
    nombre, setNombre,
    apellidos, setApellidos,
    saving,
    handleSave,
    handlePlanChange,
    downgradeDialogOpen,
    excessFavoritesCount,
    handleConfirmDowngrade,
    handleCancelDowngrade,
    pwOpen, setPwOpen,
    pwLoading,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    handleUpdatePassword,
    handleCancelPwChange,
  } = useProfileController();

  // Estado local para controlar la visibilidad de cada campo de contraseña
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // No renderiza nada mientras el perfil no está disponible
  if (!profile) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-fade-in">
      <h1 className="font-display font-bold text-3xl text-foreground mb-8">Mi perfil</h1>

      {/* Tarjeta de datos personales */}
      <Card className="p-6 space-y-5 bg-card border-border mb-6">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Datos personales
        </h2>

        {/* Campos editables de nombre y apellidos */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Apellidos</label>
            <Input value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
          </div>
        </div>

        {/* Email de solo lectura (no se puede modificar) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> Email
          </label>
          <Input value={profile.email} disabled className="opacity-60" />
        </div>

        {/* Botón para guardar los cambios del perfil */}
        <Button onClick={handleSave} disabled={saving} className="gradient-hero text-primary-foreground font-display font-semibold">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </Card>

      {/* Tarjeta de cambio de contraseña */}
      <Card className="p-6 space-y-5 bg-card border-border mb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> Cambiar contraseña
          </h2>
          {/* Botón para desplegar el formulario de cambio de contraseña */}
          {!pwOpen && (
            <Button onClick={() => setPwOpen(true)} variant="outline" size="sm" className="font-display font-semibold">
              Cambiar
            </Button>
          )}
        </div>

        {/* Formulario de cambio de contraseña (visible solo cuando pwOpen es true) */}
        {pwOpen && (
          <div className="space-y-4">
            {/* Campo de contraseña actual con toggle de visibilidad */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Contraseña actual
              </label>
              <div className="relative">
                <Input type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Tu contraseña actual" className="pr-10" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* Campos de nueva contraseña y su confirmación en dos columnas */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Nueva contraseña
                </label>
                <div className="relative">
                  <Input type={showNewPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="pr-10" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Repetir nueva contraseña
                </label>
                <div className="relative">
                  <Input type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la nueva contraseña" className="pr-10" />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            {/* Botones de confirmar y cancelar el cambio de contraseña */}
            <div className="flex gap-2">
              <Button
                onClick={handleUpdatePassword}
                disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
                className="gradient-hero text-primary-foreground font-display font-semibold"
              >
                {pwLoading ? "Guardando..." : "Actualizar contraseña"}
              </Button>
              <Button onClick={handleCancelPwChange} variant="ghost">Cancelar</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Tarjeta de selección de plan */}
      <Card className="p-6 space-y-5 bg-card border-border">
        <h2 className="font-display font-semibold text-lg">Tu plan actual</h2>

        {/* Dos opciones de plan en tarjetas clicables; el plan activo se resalta */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Opción plan gratuito */}
          <button
            onClick={() => handlePlanChange("free")}
            className={`relative rounded-xl border-2 p-5 text-left transition-all ${
              profile.plan === "free" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
            }`}
          >
            {/* Badge "Activo" visible solo si este es el plan actual */}
            {profile.plan === "free" && (
              <span className="absolute top-3 right-3 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">Activo</span>
            )}
            <Zap className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-display font-bold text-foreground">Gratuito</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• 1 receta a la vez</li>
              <li>• Hasta 10 favoritos</li>
            </ul>
          </button>

          {/* Opción plan VIP */}
          <button
            onClick={() => handlePlanChange("vip")}
            className={`relative rounded-xl border-2 p-5 text-left transition-all ${
              profile.plan === "vip" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/30"
            }`}
          >
            {/* Badge "Activo" visible solo si este es el plan actual */}
            {profile.plan === "vip" && (
              <span className="absolute top-3 right-3 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold">Activo</span>
            )}
            <Crown className="w-6 h-6 text-accent mb-2" />
            <h3 className="font-display font-bold text-foreground">VIP</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• 3 recetas simultáneas</li>
              <li>• Favoritos ilimitados</li>
            </ul>
          </button>
        </div>
      </Card>

      {/* Diálogo de confirmación al hacer downgrade VIP → gratuito con más de 10 favoritos */}
      <AlertDialog open={downgradeDialogOpen} onOpenChange={(open) => { if (!open) handleCancelDowngrade(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar al plan Gratuito?</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes más de 10 recetas guardadas en favoritos. Si cambias al plan gratuito,
              perderás {excessFavoritesCount === 1 ? "la última receta guardada" : `las últimas ${excessFavoritesCount} recetas guardadas`} y
              te quedarás solo con las 10 primeras que marcaste como favoritas.
              <br /><br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDowngrade}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDowngrade} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmar cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
