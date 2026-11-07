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
  pueblo: string;
  pedania: string;
  telefono: string;
  guardia: boolean;
  horario: string;
  lat: number;
  lng: number;
};

export default function Home() {
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [producto, setProducto] = useState("");
  const [soloGuardia, setSoloGuardia] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from("farmacias")
        .select("*")
        .order("nombre");
      if (data) {
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
    const texto = (f.nombre + " " + f.direccion + " " + (f.pueblo || "") + " " + (f.pedania || ""))
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const guardiaOk = soloGuardia ? f.guardia : true;
    return texto && guardiaOk;
  });

  const linkWhatsApp = (f: Farmacia) => {
    let tel = f.telefono.replace(/[^0-9]/g, "");
    if (tel.length === 9) tel = "34" + tel;
    const prod = producto.trim() || "un producto";
    const mensaje = `Hola ${f.nombre}, soy de FarmaCerca 24h. ¿Tenéis stock de ${prod}? Gracias`;
    return `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`;
  };

  return (
    <main className="min-h-screen bg-[#f4f8f5] pb-10">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="flex justify-center py-3">
          <img
            src="/logo.png.jpeg"
            alt="FarmaCerca 24h"
            className="h-[110px] w-auto object-contain"
          />
        </div>

        <div className="px-4 pb-4 max-w-3xl mx-auto space-y-3">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Busca por farmacia, calle o pueblo... Ej: Iznájar"
            className="w-full p-4 rounded-2xl border-2 border-[#1a9a3d] text-lg outline-none bg-white shadow-sm"
          />

          <div className="bg-[#e8f5ee] border-2 border-[#1a9a3d] rounded-2xl p-3">
            <p className="font-black text-[#0b6b3a] text-sm mb-2">
              💊 ¿Qué medicamento buscas?
            </p>
            <input
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              placeholder="Ej: Paracetamol, Ibuprofeno, Omeprazol..."
              className="w-full p-3 rounded-xl border border-[#1a9a3d] outline-none bg-white"
            />
            <p className="text-xs text-gray-600 mt-2">
              Escribe el producto y luego pulsa en la farmacia
              &quot;Preguntar stock por WhatsApp&quot;
            </p>
          </div>

          <div className="flex gap-2">
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
                setProducto("");
                setSoloGuardia(false);
              }}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-700"
            >
              Limpiar
            </button>
          </div>
        </div>
      </header>

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
                  📍 {f.direccion} - {f.pueblo}
                  {f.pedania ? ` (${f.pedania})` : ""}
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
                      f.nombre + " " + f.direccion + " " + f.pueblo
                    )}`}
                    target="_blank"
                    className="flex-1 text-center bg-[#e8f5ee] text-[#0b6b3a] py-3 rounded-xl font-bold border border-[#1a9a3d]"
                  >
                    🗺️ Cómo llegar
                  </a>
                </div>

                <a
                  href={linkWhatsApp(f)}
                  target="_blank"
                  className="block text-center mt-2 bg-[#25D366] text-white py-3.5 rounded-xl font-black text-[15px] shadow-sm"
                >
                  💬 Preguntar stock por WhatsApp
                  {producto.trim() && (
                    <span className="block text-[12px] font-bold opacity-90">
                      &quot;{producto.trim()}&quot;
                    </span>
                  )}
                </a>
              </div>
            ))}
          </div>
        )}

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
