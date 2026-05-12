import { EnvelopeIcon, PhoneIcon, MapPinIcon, GlobeAltIcon, ShareIcon, TrophyIcon } from '@heroicons/react/24/solid';

export default function Footer() {
  return (
    <footer className="relative bg-[#0A3D2E] text-snow-white pt-14 pb-6 px-4 mt-auto">
      <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden
        style={{
          background: "radial-gradient(50% 60% at 0% 0%, rgba(198, 246, 213, 0.10) 0%, transparent 60%), radial-gradient(40% 50% at 100% 100%, rgba(198, 246, 213, 0.06) 0%, transparent 65%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
        {/* Marca */}
        <div>
          <h3 className="font-display font-extrabold text-xl mb-3">DeporCanchas</h3>
          <p className="text-snow-white/70 text-sm leading-relaxed mb-5">
            Elevando la experiencia deportiva urbana a través de sedes premium y tecnología de vanguardia.
          </p>
          <div className="flex gap-2">
            <span className="border border-snow-white/30 rounded-xl p-2.5 flex items-center justify-center hover:bg-snow-white/10 transition">
              <TrophyIcon className="w-4 h-4 text-snow-white" />
            </span>
            <span className="border border-snow-white/30 rounded-xl p-2.5 flex items-center justify-center hover:bg-snow-white/10 transition">
              <ShareIcon className="w-4 h-4 text-snow-white" />
            </span>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-snow-white/90">Navegación</h4>
          <ul className="space-y-2 text-sm text-snow-white/75">
            <li><a href="/reservas" className="hover:text-snow-white transition">Reserva tu cancha</a></li>
            <li><a href="/nosotros" className="hover:text-snow-white transition">Nosotros</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-snow-white/90">Soporte</h4>
          <ul className="space-y-2 text-sm text-snow-white/75">
            <li className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4 text-snow-white/50" /><a href="#" className="hover:text-snow-white transition">Privacidad</a></li>
            <li className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4 text-snow-white/50" /><a href="#" className="hover:text-snow-white transition">Términos</a></li>
            <li className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4 text-snow-white/50" /><a href="#" className="hover:text-snow-white transition">Centro de Ayuda</a></li>
            <li className="flex items-center gap-2"><GlobeAltIcon className="w-4 h-4 text-snow-white/50" /><a href="#" className="hover:text-snow-white transition">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-snow-white/90">Contacto</h4>
          <ul className="space-y-2.5 text-sm text-snow-white/75">
            <li className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4 text-snow-white/50" /> contacto@deporcanchas.com</li>
            <li className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-snow-white/50" /> +51 900 123 456</li>
            <li className="flex items-center gap-2"><MapPinIcon className="w-4 h-4 text-snow-white/50" /> Lima, Perú</li>
          </ul>
        </div>
      </div>
      <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between border-t border-snow-white/15 pt-5 text-xs text-snow-white/60">
        <span>© 2026 DeporCanchas. Todos los derechos reservados.</span>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-snow-white transition">Español</a>
        </div>
      </div>
    </footer>
  );
}
