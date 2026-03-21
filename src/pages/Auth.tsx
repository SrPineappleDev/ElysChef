// Página de autenticación.
// Muestra un formulario con dos pestañas: inicio de sesión y registro.
// Delega toda la lógica al controlador useAuthController y
// gestiona localmente la visibilidad de las contraseñas.

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ChefHat, Crown, Eye, EyeOff, Leaf, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { useAuthController } from "@/controllers/use-auth-controller";

/**
 * Página de acceso a la aplicación.
 * Contiene dos formularios: inicio de sesión y creación de cuenta.
 * El formulario de registro incluye selección de plan (gratuito o VIP).
 * Los campos de contraseña tienen botón para alternar visibilidad.
 */
const Auth = () => {
  // Obtiene el estado y los manejadores del controlador de autenticación
  const {
    tab, setTab,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    loginLoading, handleLogin,
    nombre, setNombre,
    apellidos, setApellidos,
    regEmail, setRegEmail,
    regPassword, setRegPassword,
    regConfirmPassword, setRegConfirmPassword,
    plan, setPlan,
    regLoading, handleRegister,
  } = useAuthController();

  // Estado local para controlar la visibilidad de cada campo de contraseña
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md border-border bg-card">
        {/* Cabecera con logo y título */}
        <CardHeader className="text-center space-y-2">
          <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mx-auto">
            <ChefHat className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Ely's Chef</CardTitle>
          <CardDescription>Tu asistente culinario con IA</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs para alternar entre login y registro */}
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
              <TabsTrigger value="login" className="font-display">
                <LogIn className="w-4 h-4 mr-2" /> Iniciar sesión
              </TabsTrigger>
              <TabsTrigger value="register" className="font-display">
                <UserPlus className="w-4 h-4 mr-2" /> Crear cuenta
              </TabsTrigger>
            </TabsList>

            {/* Formulario de inicio de sesión */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="tu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  {/* Campo de contraseña con toggle de visibilidad */}
                  <div className="relative">
                    <Input id="login-password" type={showLoginPassword ? "text" : "password"} placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="pr-10" />
                    <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-hero text-primary-foreground font-display" disabled={loginLoading}>
                  {loginLoading ? "Entrando..." : "Iniciar sesión"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  ¿No tienes cuenta?{" "}
                  <button type="button" onClick={() => setTab("register")} className="text-primary font-medium hover:underline">Crear cuenta</button>
                </p>
              </form>
            </TabsContent>

            {/* Formulario de registro de nueva cuenta */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Campos de nombre y apellidos en dos columnas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input id="nombre" placeholder="Juan" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos</Label>
                    <Input id="apellidos" placeholder="García López" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input id="reg-email" type="email" placeholder="tu@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                </div>

                {/* Campo de nueva contraseña con toggle de visibilidad */}
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Contraseña</Label>
                  <div className="relative">
                    <Input id="reg-password" type={showRegPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={6} className="pr-10" />
                    <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Campo de confirmación de contraseña con toggle de visibilidad */}
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input id="reg-confirm-password" type={showRegConfirmPassword ? "text" : "password"} placeholder="Repite tu contraseña" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required minLength={6} className="pr-10" />
                    <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Selector de plan: gratuito o VIP */}
                <div className="space-y-3">
                  <Label>Selecciona tu plan</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Opción plan gratuito */}
                    <button type="button" onClick={() => setPlan("free")} className={cn("rounded-xl border-2 p-4 text-left transition-all", plan === "free" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30")}>
                      <Leaf className="w-5 h-5 text-primary mb-2" />
                      <p className="font-display font-semibold text-sm text-foreground">Gratuito</p>
                      <p className="text-xs text-muted-foreground mt-1">1 receta a la vez. Hasta 10 favoritos.</p>
                    </button>
                    {/* Opción plan VIP */}
                    <button type="button" onClick={() => setPlan("vip")} className={cn("rounded-xl border-2 p-4 text-left transition-all", plan === "vip" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/30")}>
                      <Crown className="w-5 h-5 text-accent mb-2" />
                      <p className="font-display font-semibold text-sm text-foreground">VIP</p>
                      <p className="text-xs text-muted-foreground mt-1">3 recetas simultáneas. Favoritos ilimitados.</p>
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full gradient-hero text-primary-foreground font-display" disabled={regLoading}>
                  {regLoading ? "Creando cuenta..." : "Registrarse"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{" "}
                  <button type="button" onClick={() => setTab("login")} className="text-primary font-medium hover:underline">Iniciar sesión</button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
