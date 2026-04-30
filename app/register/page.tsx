
"use client";
import Navbar from '../components/Navbar';
import RegisterForm from '../components/RegisterForm';
import '../styles/colors.css';

export default function RegisterPage() {
  return (
    <main className="bg-snow-white min-h-screen flex flex-col">
      <Navbar />
      <section className="flex flex-col items-center justify-center flex-1 py-8">
        <div className="mb-2 text-3xl font-bold text-forest-green">DeporCanchas</div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-main mb-1 text-center">Crear Cuenta</h2>
        <p className="text-sm text-main mb-6 text-center">Crea tu cuenta y reserva tu cancha preferida</p>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4">
          <RegisterForm />

        </div>
        <div className="mt-4 text-center text-sm" style={{ color: '#386641' }}>
          ¿Ya tienes una cuenta?{' '}
          <a href="/login" className="font-semibold hover:underline" style={{ color: '#0056D0' }}>Inicia Sesión</a>
        </div>
        <footer className="w-full max-w-md mx-auto mt-8 text-xs text-center flex flex-col gap-2" style={{ color: '#386641' }}>
          <div>© 2026 DeporCanchas</div>
          <div className="flex justify-center gap-4">
            <a href="#" className="hover:underline">PRIVACIDAD</a>
            <a href="#" className="hover:underline">TÉRMINOS</a>
          </div>
        </footer>
      </section>
    </main>
  );
}
