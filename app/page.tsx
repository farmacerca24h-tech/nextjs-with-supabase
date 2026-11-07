"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Farmacia = {
  id: number;
  nombre: string;
  direccion: string;
  localidad: string;
  telefono: string;
  guardia: boolean;
  horario: string;
  lat: number;
  lng: number;
};

export default function Home() {
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [soloGuardia, setSoloGuardia] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from("farmacias")
        .select("*")
        .order("nombre");
      if (data) {
        // Quitar duplicadas por nombre + dirección
        const unicas = (data as Farmacia[]).filter(
          (f, i, arr) =>
            i ===
            arr.findIndex(
              (x) => x.nombre === f.nombre && x.direccion === f.direccion
            )
        );
        setFarmacias(unicas);
      }
      setCargando(false);
    }
    cargar();
  }, []);

  const filtradas = farmacias.filter((f) => {
    const texto = (f.nombre + " " + f.direccion + " " + f.localidad)
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const guardiaOk = soloGuardia ? f.guardia : true;
    return texto && guardiaOk;
  });

  return (
    <main className="min-h-screen bg-[#f4f8f5] pb-10">
      {/* CABECERA */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        {/* LOGO OFICIAL FARMACERCA */}
        <div className="flex justify-center py-3">
          <img
            src="/logo.png.jpeg"
            alt="FarmaCerca 24h"
            className="h-[110px] w-auto object-contain"
          />
        </div>

        {/* BUSCADOR */}
        <div className="px-4 pb-4 max-w-3xl mx-auto">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Busca por farmacia, calle o pueblo... Ej: Iznájar, Rute, Lucena"
            className="w-full p-4 rounded-2xl border-2 border-[#1a9a3d] text-lg outline-none bg-white shadow-sm"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setSoloGuardia(!soloGuardia)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm ${
                soloGuardia
                  ? "bg-[#1a9a3d] text-white"
                  : "bg-white border-2 border-[#1a9a3d] text-[#0b6b3a]"
              }`}
            >
              {soloGuardia ? "✅ Solo de guardia" : "🌙 Solo de guardia"}
            </button>
            <button
              onClick={() => {
                setBusqueda("");
                setSoloGuardia(false);
              }}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-700"
            >
              Limpiar
            </button>
          </div>
        </div>
      </header>

      {/* RESULTADOS */}
      <div className="px-4 max-w-3xl mx-auto mt-4">
        <p className="text-sm font-bold text-gray-600 mb-3">
          {cargando
            ? "Cargando farmacias..."
            : `${filtradas.length} farmacias encontradas`}
        </p>

        {cargando ? (
          <p className="text-center py-10 text-gray-500">Cargando...</p>
        ) : filtradas.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl text-center">
            <p className="font-bold text-lg">No hay resultados</p>
            <p className="text-gray-500 text-sm mt-1">
              Prueba con otro pueblo o calle, o quita el filtro de guardia.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtradas.map((f) => (
              <div
                key={f.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start gap-2">
                  <h2 className="font-black text-[17px] leading-tight">
                    {f.nombre}
                  </h2>
                  {f.guardia && (
                    <span className="shrink-0 bg-[#1a9a3d] text-white text-[11px] font-black px-2 py-1 rounded-full">
                      DE GUARDIA
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  📍 {f.direccion} - {f.localidad}
                </p>
                {f.horario && (
                  <p className="text-gray-600 text-sm">🕐 {f.horario}</p>
                )}

                <div className="flex gap-2 mt-3">
                  <a
                    href={`tel:${f.telefono}`}
                    className="flex-1 text-center bg-[#0b6b3a] text-white py-3 rounded-xl font-bold"
                  >
                    📞 {f.telefono}
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      f.nombre + " " + f.direccion + " " + f.localidad
                    )}`}
                    target="_blank"
                    className="flex-1 text-center bg-[#e8f5ee] text-[#0b6b3a] py-3 rounded-xl font-bold border border-[#1a9a3d]"
                  >
                    🗺️ Cómo llegar
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PIE OFICIAL */}
        <div className="mt-8 text-center border-t-2 border-[#1a9a3d] pt-4 pb-2">
          <p className="text-2xl font-black text-[#0b6b3a]">
            A un mensaje de ti
          </p>
          <p className="font-bold text-gray-800 mt-2">
            ✉️ farmacerca24h@gmail.com
          </p>
          <p className="font-bold text-gray-800">
            🌐 www.farmacerca24h.com
          </p>
          <p className="font-bold text-gray-800">
            ⓘ Información de farmacias
          </p>
        </div>
      </div>
    </main>
  );
}
