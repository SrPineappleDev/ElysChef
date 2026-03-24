// Página de perfil de usuario.
// Permite al usuario ver y editar sus datos personales (nombre, apellidos),
// cambiar su contraseña, gestionar su plan (gratuito o VIP) y recargar créditos.
// Delega toda la lógica al controlador useProfileController.

import { User, Mail, Crown, Eye, EyeOff, Zap, Save, KeyRound, Lock, Coins } from "lucide-react";
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
import CreditsDisplay from "@/components/CreditsDisplay";
import { useProfileController } from "@/controllers/use-profile-controller";

// Paquetes de créditos disponibles con precio base
const CREDIT_PACKAGES = [
  { amount: 50,  label: "Paquete S", price: 0.99 },
  { amount: 150, label: "Paquete M", price: 2.49 },
  { amount: 500, label: "Paquete L", price: 5.99 },
];

const DISCOUNT_VIP = 0.15; // 15% de descuento para VIP

/**
 * Página de perfil dividida en cuatro tarjetas:
 * 1. Datos personales (nombre, apellidos, email de solo lectura).
 * 2. Cambio de contraseña (formulario desplegable).
 * 3. Gestión del plan (gratuito / VIP).
 * 4. Recarga de créditos (paquetes S / M / L con descuento para VIP).
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
    upgradeDialogOpen,
    handleConfirmUpgrade,
    handleCancelUpgrade,
    downgradeDialogOpen,
    excessFavoritesCount,
    handleConfirmDowngrade,
    handleCancelDowngrade,
    creditPackage,
    handleSelectCreditPackage,
    handleConfirmAddCredits,
    handleCancelAddCredits,
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

  const isVip = profile.plan === "vip";

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
      <Card className="p-6 space-y-5 bg-card border-border mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-display font-semibold text-lg">Tu plan actual</h2>
          <CreditsDisplay credits={profile.credits} />
        </div>

        {/* Dos opciones de plan en tarjetas clicables; el plan activo se resalta */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Opción plan gratuito */}
          <button
            onClick={() => handlePlanChange("free")}
            className={`relative rounded-xl border-2 p-5 text-left transition-all ${
              profile.plan === "free" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
            }`}
          >
            {profile.plan === "free" && (
              <span className="absolute top-3 right-3 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">Activo</span>
            )}
            <Zap className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-display font-bold text-foreground">Gratuito</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• 1 receta a la vez</li>
              <li>• Hasta 10 favoritos</li>
              <li>• 200 créditos iniciales</li>
            </ul>
          </button>

          {/* Opción plan VIP */}
          <button
            onClick={() => handlePlanChange("vip")}
            className={`relative rounded-xl border-2 p-5 text-left transition-all ${
              profile.plan === "vip" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/30"
            }`}
          >
            {profile.plan === "vip" && (
              <span className="absolute top-3 right-3 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-semibold">Activo</span>
            )}
            <Crown className="w-6 h-6 text-accent mb-2" />
            <h3 className="font-display font-bold text-foreground">VIP</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• 1 a 3 recetas simultáneas</li>
              <li>• Favoritos ilimitados</li>
              <li>• 500 créditos iniciales</li>
              <li>• 15% dto. en recargas</li>
            </ul>
          </button>
        </div>

        {/* Referencia de costes */}
        <p className="text-xs text-muted-foreground">
          Generar recetas: <span className="font-semibold">50 créditos</span> · Analizar imagen: <span className="font-semibold">25 créditos</span>
        </p>
      </Card>

      {/* Tarjeta de recarga de créditos */}
      <Card className="p-6 space-y-5 bg-card border-border">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Recargar créditos</h2>
          {isVip && (
            <span className="text-xs bg-green-500/10 text-green-600 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">
              15% descuento VIP
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {CREDIT_PACKAGES.map((pkg) => {
            const discountedPrice = isVip ? pkg.price * (1 - DISCOUNT_VIP) : null;
            const displayPrice = discountedPrice ?? pkg.price;

            return (
              <button
                key={pkg.amount}
                onClick={() => handleSelectCreditPackage(pkg.amount, `${displayPrice.toFixed(2)} €`)}
                className="relative rounded-xl border-2 border-border hover:border-primary/50 p-5 text-left transition-all group"
              >
                <p className="font-display font-bold text-2xl text-foreground group-hover:text-primary transition-colors">
                  +{pkg.amount}
                </p>
                <p className="text-sm text-muted-foreground mb-3">créditos</p>
                <p className="text-xs text-muted-foreground font-semibold">{pkg.label}</p>
                <div className="mt-2">
                  {isVip ? (
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm line-through text-muted-foreground">{pkg.price.toFixed(2)} €</span>
                      <span className="text-base font-bold text-green-600">{discountedPrice!.toFixed(2)} €</span>
                    </div>
                  ) : (
                    <span className="text-base font-bold text-foreground">{pkg.price.toFixed(2)} €</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Diálogo de confirmación al hacer upgrade gratuito → VIP */}
      <AlertDialog open={upgradeDialogOpen} onOpenChange={(open) => { if (!open) handleCancelUpgrade(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-accent" /> Activar plan VIP
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  El plan VIP tiene un coste de <span className="font-semibold text-foreground">5,00 €/mes</span>.
                  Al confirmar, aceptas que se realizará un cargo mensual de esta cantidad.
                </p>
                <ul className="space-y-1 border rounded-lg p-3 bg-accent/5 border-accent/20 text-foreground">
                  <li className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-accent" /> 1 a 3 recetas simultáneas</li>
                  <li className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-accent" /> Favoritos ilimitados</li>
                  <li className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-accent" /> 500 créditos iniciales</li>
                  <li className="flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-accent" /> 15% descuento en recargas</li>
                </ul>
                <p className="text-xs">
                  Puedes volver al plan gratuito en cualquier momento desde tu perfil.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelUpgrade}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUpgrade} className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              Activar VIP — 5,00 €/mes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              Además, tus créditos se resetearán a 200. Esta acción no se puede deshacer.
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

      {/* Diálogo de confirmación de compra de créditos */}
      <AlertDialog open={!!creditPackage} onOpenChange={(open) => { if (!open) handleCancelAddCredits(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar recarga de créditos</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a añadir <span className="font-semibold text-foreground">+{creditPackage?.amount} créditos</span> a tu saldo por{" "}
              <span className="font-semibold text-foreground">{creditPackage?.price}</span>.
              {isVip && <span className="text-green-600 font-semibold"> (precio con descuento VIP)</span>}
              <br /><br />
              Tu nuevo saldo será de <span className="font-semibold text-foreground">{(profile.credits + (creditPackage?.amount ?? 0))} créditos</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAddCredits}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAddCredits} className="gradient-hero text-primary-foreground">
              Confirmar compra
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
