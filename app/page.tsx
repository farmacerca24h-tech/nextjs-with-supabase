"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const PUEBLOS_MALAGA = ["Todos","Algarrobo","Antequera","Benajarafe","Fuengirola","Málaga","Marbella","Nerja","Rincón de la Victoria","Ronda","Torre del Mar","Torre de Benagalbón","Torrox","Urrácal","Vélez-Málaga"].sort((a,b)=>a.localeCompare(b));

export default function Home() {
  const [farmacias, setFarmacias] = useState<any[]>([]);
  const [puebloSel, setPuebloSel] = useState("Todos");
  const supabase = createClient();

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from("farmacias").select("*").order('pueblo', { ascending: true });
      if (data) setFarmacias(data);
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
        <p className="text-center text-gray-500 mt-2">{filtradas.length} farmacias encontradas</p>

        <div className="mt-6 bg-white p-4 rounded-2xl border-2 border-black shadow-lg">
          <label className="font-bold text-black text-sm">ELIGE TU PUEBLO (ORDEN A-Z):</label>
          <select 
            value={puebloSel} 
            onChange={e=>setPuebloSel(e.target.value)} 
            className="w-full mt-2 p-4 rounded-xl border-2 font-bold text-lg bg-white text-black border-black"
            style={{ backgroundColor: 'white', color: 'black' }}
          >
            {PUEBLOS_MALAGA.map(p=><option key={p} value={p} style={{ backgroundColor: 'white', color: 'black' }}>{p}</option>)}
          </select>
        </div>

        <div className="grid gap-4 mt-6">
          {filtradas.map(f=>(
            <div key={f.id} className={`bg-white p-5 rounded-2xl border-2 shadow-sm ${f.guardia?'border-emerald-500':'border-gray-200'}`}>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${f.guardia?'bg-emerald-500 text-white':'bg-gray-100 text-black'}`}>
                {f.guardia?'DE GUARDIA HOY - '+f.pueblo.toUpperCase():f.pueblo.toUpperCase()}
              </span>
              <h3 className="font-bold text-lg mt-2 text-black">{f.nombre}</h3>
              <p className="text-sm text-gray-600">{f.direccion} - {f.telefono}</p>
              <p className="text-xs text-gray-500 mt-1">{f.horario}</p>
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(f.nombre+' '+f.pueblo)}`} target="_blank" className="mt-3 block bg-black text-white text-center py-3 rounded-xl font-bold">Ver en mapa →</a>
            </div>
          ))}
          {filtradas.length === 0 && <p className="text-center text-gray-400 mt-10">No hay farmacias para {puebloSel} hoy. Elige otro pueblo.</p>}
        </div>
      </div>
    </main>
  )
}
