"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../contexts/ToastContext";
import { useLoader } from "../../contexts/LoaderContext";
import { useSession } from "../../contexts/SessionContext";

type RegisterOptions = {
  onRegister?: (user: unknown) => void;
  redirectTo?: string | null;
};

export function useRegister(options?: RegisterOptions) {
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    nombre?: string;
    celular?: string;
    email?: string;
    clave?: string;
  }>({});

  const router = useRouter();
  const redirectTo = options?.redirectTo === undefined ? "/" : options.redirectTo;
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();
  const { refresh } = useSession();

  const validate = () => {
    const errors: typeof fieldErrors = {};
    let isValid = true;

    if (!nombre.trim() || nombre.trim().length < 3) {
      errors.nombre = "El nombre debe tener al menos 3 caracteres.";
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = "El correo electrónico es requerido.";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "El correo electrónico no es válido.";
      isValid = false;
    }

    if (!celular.trim()) {
      errors.celular = "El celular es requerido.";
      isValid = false;
    } else if (!/^9[0-9]{8}$/.test(celular)) {
      errors.celular = "El celular debe tener 9 dígitos y empezar con 9.";
      isValid = false;
    }

    if (!clave.trim()) {
      errors.clave = "La contraseña es requerida.";
      isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(clave)) {
      errors.clave = "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.";
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

    showLoader("Creando tu cuenta...");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, celular, clave }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        hideLoader();
        const msg =
          data.error === "usuario_ya_existe"
            ? "Ya existe una cuenta con ese email."
            : data.error === "validation"
              ? "Revisa los datos ingresados."
              : "No se pudo registrar. Intenta de nuevo.";
        showToast(msg, "error");
        return;
      }

      await refresh();
      hideLoader();
      showToast("¡Registro exitoso!", "success");
      if (options?.onRegister) options.onRegister(data.user);
      if (redirectTo) router.push(redirectTo);
    } catch {
      hideLoader();
      showToast("Error de red.", "error");
    }
  };

  return {
    nombre, setNombre,
    celular, setCelular,
    email, setEmail,
    clave, setClave,
    showPassword, setShowPassword,
    fieldErrors, setFieldErrors,
    handleSubmit
  };
}
