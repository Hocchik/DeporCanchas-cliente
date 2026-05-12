"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSession } from "../contexts/SessionContext";

export default function PerfilPage() {
  const router = useRouter();
  const { user, loading, refresh, logout } = useSession();

  const [datos, setDatos] = useState({ nombre: "", email: "", celular: "" });
  const [savingDatos, setSavingDatos] = useState(false);
  const [datosMsg, setDatosMsg] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState({ actual: "", nueva: "", confirmar: "" });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/perfil");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) setDatos({ nombre: user.nombre, email: user.email, celular: user.celular ?? "" });
  }, [user]);

  if (loading || !user) return null;

  async function saveDatos() {
    setSavingDatos(true);
    setDatosMsg("");
    const res = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    setSavingDatos(false);
    if (res.ok) {
      setDatosMsg("Datos actualizados");
      refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setDatosMsg(j.error === "email_ya_usado" ? "Ese email ya está en uso" : "Error al actualizar");
    }
  }

  async function savePwd() {
    setPwdMsg("");
    if (pwd.nueva !== pwd.confirmar) { setPwdMsg("Las claves no coinciden"); return; }
    if (pwd.nueva.length < 8) { setPwdMsg("Clave nueva debe tener al menos 8 caracteres"); return; }
    setSavingPwd(true);
    const res = await fetch("/api/perfil/clave", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clave_actual: pwd.actual, clave_nueva: pwd.nueva }),
    });
    setSavingPwd(false);
    if (res.ok) {
      setPwdMsg("Clave actualizada");
      setPwd({ actual: "", nueva: "", confirmar: "" });
      setShowPwd(false);
    } else {
      const j = await res.json().catch(() => ({}));
      setPwdMsg(j.error === "clave_actual_invalida" ? "Clave actual incorrecta" : "Error al actualizar");
    }
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#FBF9F5" }}>
      <Navbar />
      <section className="max-w-xl mx-auto px-4 py-10 w-full flex-1">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-full bg-forest-green text-snow-white flex items-center justify-center text-2xl font-bold">
            {user.nombre.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-main">Mi Perfil</h1>
        </div>

        <section className="rounded-2xl bg-snow-white p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-main mb-4">Datos personales</h2>
          <div className="space-y-3">
            <Field label="Nombre">
              <input value={datos.nombre} onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main" />
            </Field>
            <Field label="Email">
              <input type="email" value={datos.email} onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main" />
            </Field>
            <Field label="DNI (no editable)">
              <input value={user.dni} disabled
                className="w-full rounded-xl border border-stone-gray bg-stone-gray/10 px-4 py-3 text-main opacity-60" />
            </Field>
            <Field label="Celular">
              <input inputMode="numeric" value={datos.celular} onChange={(e) => setDatos({ ...datos, celular: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main" />
            </Field>
            {datosMsg && <p className="text-sm text-main">{datosMsg}</p>}
            <button type="button" onClick={saveDatos} disabled={savingDatos}
              className="rounded-xl bg-forest-green px-6 py-3 text-snow-white font-semibold disabled:opacity-50">
              Guardar cambios
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-snow-white p-6 shadow-sm mb-6">
          <button type="button" onClick={() => setShowPwd((s) => !s)}
            className="w-full text-left font-semibold text-main">
            Cambiar clave {showPwd ? "▲" : "▼"}
          </button>
          {showPwd && (
            <div className="space-y-3 mt-4">
              <Field label="Clave actual">
                <input type="password" value={pwd.actual} onChange={(e) => setPwd({ ...pwd, actual: e.target.value })}
                  className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main" />
              </Field>
              <Field label="Clave nueva">
                <input type="password" value={pwd.nueva} onChange={(e) => setPwd({ ...pwd, nueva: e.target.value })}
                  className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main" />
              </Field>
              <Field label="Confirmar clave nueva">
                <input type="password" value={pwd.confirmar} onChange={(e) => setPwd({ ...pwd, confirmar: e.target.value })}
                  className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main" />
              </Field>
              {pwdMsg && <p className="text-sm text-main">{pwdMsg}</p>}
              <button type="button" onClick={savePwd} disabled={savingPwd}
                className="rounded-xl bg-forest-green px-6 py-3 text-snow-white font-semibold disabled:opacity-50">
                Actualizar clave
              </button>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-snow-white p-6 shadow-sm">
          <h2 className="font-semibold text-main mb-4">Cuenta</h2>
          <button type="button"
            onClick={async () => { await logout(); router.push("/"); }}
            className="rounded-xl border border-red-500 px-6 py-3 text-red-600 font-semibold">
            Cerrar sesión
          </button>
        </section>
      </section>
      <Footer />
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-main mb-2">{label}</label>
      {children}
    </div>
  );
}
