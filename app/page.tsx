"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const PUEBLOS_MALAGA = ["Todos", "Vélez-Málaga", "Torre del Mar", "Algarrobo", "Torrox", "Nerja", "Rincón de la Victoria", "Benajarafe", "Almayate", "Frigiliana", "Málaga Centro", "Urrácal"];

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
          { nombre: "Farmacia Cruz Verde 6", pueblo: "Vélez-Málaga", direccion: "C/ Cruz Verde, 6", guardia: true, horario: "HOY DE GUARDIA - 952 500 196" },
          { nombre: "Farmacia Avda. Andalucía 119", pueblo: "Torre del Mar", direccion: "Avda. Andalucía, 119", guardia: true, horario: "HOY DE GUARDIA - 952 540 822" },
        ]);
      }
    };
    cargar();
  }, []);

  const filtradas = farmacias.filter(f => puebloSel === "Todos" || f.pueblo === puebloSel || f.pueblo?.toLowerCase().includes(puebloSel.toLowerCase()));

  return (
    <main className="min-h-screen bg-[#f8fffe]">
      <header className="max-w-6xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black text-xl"><div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center">+</div>Farmacerca24h</div>
        <div className="text-sm bg-emerald-500 text-white px-4 py-1.5 rounded-full font-bold">● EN DIRECTO</div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black">Farmacias de guardia<br/><span className="text-emerald-500">en Málaga HOY</span></h1>
          <p className="text-gray-400 mt-3">Selecciona tu pueblo y te decimos cuál está abierta ahora</p>
        </div>
        <div className="mt-8 max-w-xl mx-auto bg-white rounded-[24px] shadow-2xl border p-3">
          <select value={puebloSel} onChange={(e) => setPuebloSel(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-gray-50 font-bold text-lg outline-none">
            {PUEBLOS_MALAGA.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {filtradas.map((f) => (
            <div key={f.nombre} className={`bg-white p-6 rounded-2xl border-2 ${f.guardia ? 'border-emerald-500 shadow-lg' : 'border-gray-100'}`}>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${f.guardia ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>{f.guardia ? 'DE GUARDIA HOY' : f.pueblo.toUpperCase()}</span>
              <h3 className="font-bold text-lg mt-3">{f.nombre}</h3>
              <p className="text-sm text-gray-500">{f.direccion}</p>
              <p className="text-sm font-bold mt-1 text-emerald-600">{f.horario}</p>
              <a target="_blank" href={`https://www.google.com/maps/search/${f.nombre} ${f.pueblo}`} className="mt-4 block text-center bg-black text-white py-3 rounded-xl font-bold">Ver en mapa →</a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
