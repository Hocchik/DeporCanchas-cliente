import '../styles/colors.css';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, GlobeAltIcon, ShareIcon, TrophyIcon } from '@heroicons/react/24/solid';

export default function Footer() {
  return (
    <footer className="bg-forest-green text-snow-white pt-12 pb-4 px-4 mt-16 border-t border-forest-green">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-8">
        {/* Marca */}
        <div>
          <h3 className="font-bold text-lg mb-2">DeporCanchas</h3>
          <p className="text-grass-green text-sm mb-4">Elevando la experiencia deportiva urbana a través de sedes premium y tecnología de vanguardia.</p>
          <div className="flex gap-3">
            <span className="bg-transparent border-2 border-grass-green rounded-xl p-3 flex items-center justify-center">
              <TrophyIcon className="w-5 h-5 text-grass-green" />
            </span>
            <span className="bg-transparent border-2 border-grass-green rounded-xl p-3 flex items-center justify-center">
              <ShareIcon className="w-5 h-5 text-grass-green" />
            </span>
          </div>
        </div>
        {/* Navegación */}
        <div>
          <h4 className="font-semibold mb-2">Navegación</h4>
          <ul className="space-y-1 text-sm">
            <li><a href="/reservas" className="hover:text-grass-green">Reserva tu cancha</a></li>
            <li><a href="/nosotros" className="hover:text-grass-green">Nosotros</a></li>
          </ul>
        </div>
        {/* Soporte */}
        <div>
          <h4 className="font-semibold mb-2">Soporte</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4 text-grass-green" /><a href="#" className="hover:text-grass-green">Privacidad</a></li>
            <li className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4 text-grass-green" /><a href="#" className="hover:text-grass-green">Términos</a></li>
            <li className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4 text-grass-green" /><a href="#" className="hover:text-grass-green">Centro de Ayuda</a></li>
            <li className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4 text-grass-green" /><a href="#" className="hover:text-grass-green">FAQ</a></li>
          </ul>
        </div>
        {/* Contacto */}
        <div>
          <h4 className="font-semibold mb-2">Contacto</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><EnvelopeIcon className="w-5 h-5 text-grass-green" /> contacto@deporcanchas.com</li>
            <li className="flex items-center gap-2"><PhoneIcon className="w-5 h-5 text-grass-green" /> +51 900 123 456</li>
            <li className="flex items-center gap-2"><MapPinIcon className="w-5 h-5 text-grass-green" /> Lima, Peru</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between border-t border-grass-green pt-4 text-xs text-grass-green">
        <span>© 2026 DeporCanchas. All rights reserved.</span>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:underline">Español</a>
          {/* <a href="#" className="hover:underline">English</a> */}
        </div>
      </div>
    </footer>
  );
}
