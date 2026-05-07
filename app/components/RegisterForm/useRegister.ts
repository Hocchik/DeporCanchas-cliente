import { useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { mapAuthError } from "../../../lib/authErrors";
import { useRouter } from "next/navigation";
import { useToast } from "../../contexts/ToastContext";
import { useLoader } from "../../contexts/LoaderContext";

type RegisterOptions = {
  onRegister?: (user: any, session: any) => void;
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

  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const redirectTo =
    options?.redirectTo === undefined ? "/" : options.redirectTo;
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  const validate = () => {
    const errors: typeof fieldErrors = {};
    let isValid = true;

    if (!nombre.trim()) {
      errors.nombre = "El nombre es requerido.";
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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: clave,
      options: {
        data: {
          nombre,
        },
      },
    });

    if (signUpError) {
      hideLoader();
      const code = (signUpError as any).code || signUpError.name;
      const msg = code ? mapAuthError(code) : "No se pudo registrar. Revisa tus datos.";
      showToast(msg, "error");
      return;
    }

    const { error: insertError } = await supabase.from('usuarios').insert([
      {
        nombre,
        email,
        celular,
        rol: 'USER'
      }
    ]);

    if (insertError) {
      console.error("Error al guardar en usuarios:", insertError);
      hideLoader();
      const code = insertError.code;
      const msg = code ? mapAuthError(code) : "Ocurrió un error al guardar tu información.";
      showToast(msg, "error");
      return;
    }

    hideLoader();
    showToast("¡Registro exitoso!", "success");
    if (options?.onRegister) {
      options.onRegister(data.user, data.session);
    }
    if (redirectTo) {
      router.push(redirectTo);
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
