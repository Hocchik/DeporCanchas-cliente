"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../contexts/ToastContext";
import { useLoader } from "../../contexts/LoaderContext";
import { useSession } from "../../contexts/SessionContext";

type LoginOptions = {
  onLogin?: (user: unknown) => void;
  redirectTo?: string | null;
};

export function useLogin(options?: LoginOptions) {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogged, setKeepLogged] = useState(true);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    clave?: string;
  }>({});

  const router = useRouter();
  const redirectTo = options?.redirectTo === undefined ? "/" : options.redirectTo;
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { user, refresh } = useSession();
  const alreadyLoggedIn = Boolean(user);
  const currentEmail = user?.email ?? "";

  const validate = () => {
    const errors: typeof fieldErrors = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = "El correo electrónico es requerido.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "El correo electrónico no es válido.";
      isValid = false;
    }

    if (!clave.trim()) {
      errors.clave = "La contraseña es requerida.";
      isValid = false;
    } else if (clave.length < 8) {
      errors.clave = "La contraseña debe tener al menos 8 caracteres.";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Por favor, corrige los errores del formulario.", "error");
      return;
    }

    showLoader("Iniciando sesión...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, clave }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        hideLoader();
        const msg =
          data.error === "credenciales_invalidas"
            ? "Correo o contraseña incorrectos."
            : data.error === "too_many_attempts"
              ? "Demasiados intentos. Intenta en un minuto."
              : data.error === "validation"
                ? "Revisa los datos ingresados."
                : "Error al iniciar sesión.";
        showToast(msg, "error");
        return;
      }

      await refresh();
      if (options?.onLogin) options.onLogin(data.user);
      hideLoader();
      showToast("¡Bienvenido de nuevo!", "success");
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch {
      hideLoader();
      showToast("Error de red.", "error");
    }
  };

  return {
    email, setEmail,
    clave, setClave,
    showPassword, setShowPassword,
    keepLogged, setKeepLogged,
    alreadyLoggedIn, currentEmail,
    fieldErrors, setFieldErrors,
    handleSubmit
  };
}
