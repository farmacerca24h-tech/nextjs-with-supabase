"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const PUEBLOS_MALAGA = ["Todos", "Vélez-Málaga", "Torre del Mar", "Algarrobo", "Torrox", "Nerja", "Rincón de la Victoria", "Benajarafe"];

export default function Home() {
  const [farmacias, setFarmacias] = useState<any[]>([]);
  const [puebloSel, setPuebloSel] = useState("Vélez-Málaga");
  const supabase = createClient();

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from("farmacias").select("*");
      if (data && data.length > 0) {
        setFarmacias(data);
      } else {
        // Si aún no hiciste el SQL, muestra las de ejemplo
        setFarmacias([
          { id: 1, nombre: "Farmacia Cruz Verde 6", pueblo: "Vélez-Málaga", direccion: "C/ Cruz Verde, 6", telefono: "952 50 00 00", guardia: true, horario: "HOY DE GUARDIA 24H" },
          { id: 2, nombre: "Farmacia Avda. Andalucía 119", pueblo: "Torre del Mar", direccion: "Avda. Andalucía, 119", telefono: "952 54 00 00", guardia: true, horario: "HOY DE GUARDIA 24H" },
        ]);
      }
    };
    cargar();
  }, []);

  const filtradas = puebloSel === "Todos" ? farmacias : farmacias.filter(f => f.pueblo === puebloSel);

  return (
    <main className="min-h-screen bg-[#f8fffe] p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-center text-black">
          Farmacias de guardia en <span className="text-emerald-500">{puebloSel} HOY</span>
        </h1>
        <p className="text-center text-gray-500 mt-2">Axarquía - Málaga</p>

        {/* ESTE ES EL DESPLEGABLE ARREGLADO */}
        <div className="mt-6">
          <label className="font-bold text-black">Elige tu pueblo:</label>
          <select 
            value={puebloSel} 
            onChange={e=>setPuebloSel(e.target.value)} 
            className="w-full mt-2 p-4 rounded-2xl border-2 font-bold text-lg bg-white text-black border-black"
          >
            {PUEBLOS_MALAGA.map(p=>(
              <option key={p} value={p} className="text-black bg-white">{p}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 mt-6">
          {filtradas.map(f=>(
            <div key={f.id} className={`bg-white p-5 rounded-2xl border-2 shadow-sm ${f.guardia?'border-emerald-500':'border-gray-200'}`}>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${f.guardia?'bg-emerald-500 text-white':'bg-gray-100 text-black'}`}>
                {f.guardia?'DE GUARDIA HOY':f.pueblo}
              </span>
              <h3 className="font-bold text-lg mt-2 text-black">{f.nombre}</h3>
              <p className="text-sm text-gray-500">{f.direccion} - {f.telefono}</p>
              <p className="text-sm font-bold text-emerald-600 mt-1">{f.horario}</p>
              <a href={`https://www.google.com/maps/search/${f.nombre} ${f.pueblo}`} target="_blank" className="mt-3 block bg-black text-white text-center py-3 rounded-xl font-bold">
                Ver en mapa →
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
