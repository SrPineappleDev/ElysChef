// Controlador de autenticación.
// Gestiona el estado y la lógica de los formularios de inicio de sesión y registro.
// Conecta la vista (página Auth) con el modelo (auth-service).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as authService from "@/models/auth-service";
import { traducirErrorAuth } from "@/lib/traducir-error-auth";

/**
 * Controller: Auth
 * Manages login and registration logic
 */

/**
 * Hook que expone el estado y los manejadores del formulario de autenticación.
 * Devuelve variables de estado para los campos de login y registro,
 * junto con las funciones handleLogin y handleRegister para procesar los formularios.
 */
export function useAuthController() {
  const navigate = useNavigate();

  // Controla qué pestaña está activa: "login" o "register"
  const [tab, setTab] = useState("login");

  // Estado del formulario de inicio de sesión
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Estado del formulario de registro
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [plan, setPlan] = useState<"free" | "vip">("free");
  const [regLoading, setRegLoading] = useState(false);

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * Llama al servicio de autenticación y redirige al inicio si tiene éxito.
   * Muestra un toast de error con el mensaje traducido si falla.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await authService.signIn(loginEmail, loginPassword);
      toast.success("¡Bienvenido!");
      navigate("/");
    } catch (error: any) {
      toast.error(traducirErrorAuth(error.message));
    } finally {
      setLoginLoading(false);
    }
  };

  /**
   * Maneja el envío del formulario de registro.
   * Valida que todos los campos estén completos y que las contraseñas coincidan.
   * Llama al servicio de registro y cambia a la pestaña de login si tiene éxito.
   * Muestra un toast de error con el mensaje traducido si falla.
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validación: todos los campos son obligatorios
    if (!nombre.trim() || !apellidos.trim() || !regEmail.trim() || !regPassword.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    // Validación: las contraseñas deben coincidir
    if (regPassword !== regConfirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setRegLoading(true);
    try {
      await authService.signUp({
        email: regEmail,
        password: regPassword,
        nombre,
        apellidos,
        plan,
      });
      toast.success("Cuenta creada correctamente");
      // Redirige al usuario al formulario de login tras el registro exitoso
      setTab("login");
    } catch (error: any) {
      toast.error(traducirErrorAuth(error.message));
    } finally {
      setRegLoading(false);
    }
  };

  return {
    tab, setTab,
    // Login
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    loginLoading, handleLogin,
    // Register
    nombre, setNombre,
    apellidos, setApellidos,
    regEmail, setRegEmail,
    regPassword, setRegPassword,
    regConfirmPassword, setRegConfirmPassword,
    plan, setPlan,
    regLoading, handleRegister,
  };
}
