import { MapIcon } from "@heroicons/react/24/solid";

export default function CourtsMap() {
  return (
    <div className="card-soft p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent text-brand mb-4">
        <MapIcon className="w-7 h-7" />
      </div>
      <h3 className="font-display font-semibold text-lg text-primary mb-1">
        Vista de croquis en preparación
      </h3>
      <p className="text-sm text-muted max-w-sm mx-auto">
        Pronto mostraremos un mapa interactivo para seleccionar tu cancha visualmente.
      </p>
    </div>
  );
}
