
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
        <p className="text-sm text-main mb-6 text-center">(Crea tu cuenta y reserva tu cancha preferida)</p>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4">
          <RegisterForm />
          <div className="flex items-center my-2">
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.2)' }} />
            <span className="mx-2 text-xs" style={{ color: 'rgba(0,0,0,0.8)' }}>o regístrate con</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.2)' }} />
          </div>
          <button className="flex items-center justify-center gap-2 border border-stone-gray rounded-md py-2 bg-snow-white hover:bg-grass-green transition font-semibold text-main">
            <span className="w-5 h-5 inline-block align-middle">
              <svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_17_40)">
                  <path d="M24.266 12.276c0-.818-.074-1.597-.211-2.343H12.5v4.437h6.563a5.61 5.61 0 01-2.434 3.684v3.06h3.938c2.308-2.127 3.699-5.263 3.699-8.838z" fill="#4285F4"/>
                  <path d="M12.5 24c3.24 0 5.963-1.073 7.95-2.92l-3.938-3.06c-1.094.734-2.49 1.17-4.012 1.17-3.084 0-5.697-2.084-6.627-4.884H1.797v3.09A11.997 11.997 0 0012.5 24z" fill="#34A853"/>
                  <path d="M5.873 14.306A7.19 7.19 0 014.687 12c0-.797.137-1.57.373-2.306V6.604H1.797A12.004 12.004 0 000 12c0 1.885.451 3.67 1.797 5.396l4.076-3.09z" fill="#FBBC05"/>
                  <path d="M12.5 4.77c1.765 0 3.34.607 4.583 1.797l3.438-3.438C18.457 1.073 15.74 0 12.5 0A11.997 11.997 0 001.797 6.604l4.076 3.09C6.803 6.854 9.416 4.77 12.5 4.77z" fill="#EA4335"/>
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <path fill="#fff" d="M0 0h24.5v24H0z"/>
                  </clipPath>
                </defs>
              </svg>
            </span>
            Google
          </button>
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
