"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * El flujo nuevo está todo en `/recuperar` (3 pasos en una sola vista).
 * Esta página existe solo para no romper enlaces viejos de email: redirige.
 */
export default function RestablecerLegacyPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/recuperar");
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center text-muted">
          Redirigiendo al nuevo proceso de recuperación…
        </div>
      </section>
      <Footer />
    </main>
  );
}
