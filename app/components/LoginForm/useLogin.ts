import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { mapAuthError } from "../../../lib/authErrors";
import { useRouter } from "next/navigation";
import { useToast } from "../../contexts/ToastContext";
import { useLoader } from "../../contexts/LoaderContext";

type LoginOptions = {
  onLogin?: (user: any) => void;
  redirectTo?: string | null;
};

export function useLogin(options?: LoginOptions) {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogged, setKeepLogged] = useState(true);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    clave?: string;
  }>({});

  const supabase = useMemo(
    () => createClient({ persistSession: keepLogged }),
    [keepLogged]
  );
  const router = useRouter();
  const redirectTo =
    options?.redirectTo === undefined ? "/" : options.redirectTo;
  const { showToast } = useToast();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      const sessionEmail = data.session?.user?.email ?? "";
      if (sessionEmail) {
        setAlreadyLoggedIn(true);
        setCurrentEmail(sessionEmail);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [supabase]);

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

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: clave,
    });

    if (signInError) {
      hideLoader();
      const code = (signInError as any).code || signInError.name;
      const msg = code ? mapAuthError(code) : "Correo o contraseña incorrectos.";
      showToast(msg, "error");
      return;
    }

    if (options?.onLogin) options.onLogin(data.user);
    hideLoader();
    showToast("¡Bienvenido de nuevo!", "success");
    if (redirectTo) {
      router.push(redirectTo);
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
