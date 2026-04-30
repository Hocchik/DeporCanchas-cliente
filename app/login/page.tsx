
"use client";
import Navbar from '../components/Navbar';
import LoginForm from '../components/LoginForm';
import '../styles/colors.css';

export default function LoginPage() {
  const handleLogin = (user: any) => {
    // Redirección y notificaciones ya manejadas por el componente
  };

  return (
    <main className="bg-snow-white min-h-screen flex flex-col">
      <Navbar />
      <section className="flex flex-col items-center justify-center flex-1 py-8">
        <div className="mb-2 text-3xl font-bold text-forest-green">DeporCanchas</div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-main mb-1 text-center">Bienvenido de nuevo</h2>
        {/* <p className="text-sm text-main mb-6 text-center">(Texto de incentivo)</p> */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4">
          <LoginForm onLogin={handleLogin} />
        </div>
        <div className="mt-4 text-center text-sm text-forest-green">
          ¿No tienes una cuenta?{' '}
          <a href="/register" className="font-semibold hover:underline" style={{ color: '#0056D0' }}>Regístrate</a>
        </div>
        <footer className="w-full max-w-md mx-auto mt-8 text-xs text-center flex flex-col gap-2 text-forest-green">
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
