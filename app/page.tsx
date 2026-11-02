"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// TODOS LOS MUNICIPIOS DE MÁLAGA (103)
const PUEBLOS_MALAGA = ["Todos","Málaga","Marbella","Mijas","Fuengirola","Torremolinos","Benalmádena","Estepona","Vélez-Málaga","Alhaurín de la Torre","Alhaurín el Grande","Rincón de la Victoria","Nerja","Torrox","Algarrobo","Benajarafe","Torre del Mar","Antequera","Ronda","Manilva","Casares","Benahavís","Ojén","Istán","Monda","Coín","Cártama","Pizarra","Álora","Campillos","Archidona","Alora","Campillos","Nerja","Frigiliana","Competa","Canillas de Albaida","Sayalonga","Almachar","Moclinejo","El Borge","Cútar","Benamocarra","Iznate","Arenas","Benamargosa","Viñuela","Benarrabá","Mollina","Humilladero","Fuente de Piedra","Sierra de Yeguas","Alameda","Cuevas de San Marcos","Villanueva de Tapia","Villanueva del Trabuco","Villanueva del Rosario","Villanueva de Algaidas","Cuevas Bajas","Cuevas del Becerro","Teba","Ardales","Carratraca","Alozaina","Yunquera","El Burgo","Casarabonela","Guaro","Tolox","Alfarnate","Alfarnatejo","Periana","Riogordo","Colmenar","Comares","Cútar","Totalán","Benagalbón","La Cala del Moral","Torre de Benagalbón","Chilches","Benajarafe"];

export default function Home() {
  const [farmacias, setFarmacias] = useState<any[]>([]);
  const [puebloSel, setPuebloSel] = useState("Todos");
  const supabase = createClient();

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from("farmacias").select("*").order('pueblo');
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
        <p className="text-center text-gray-500 mt-2">{filtradas.length} farmacias en Málaga</p>

        <div className="mt-6">
          <label className="font-bold text-black">Elige tu pueblo (103 municipios):</label>
          <select value={puebloSel} onChange={e=>setPuebloSel(e.target.value)} className="w-full mt-2 p-4 rounded-2xl border-2 font-bold text-lg bg-white text-black border-black">
            {PUEBLOS_MALAGA.map(p=><option key={p} value={p} className="text-black bg-white">{p}</option>)}
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
              <a href={`https://www.google.com/maps/search/${f.nombre} ${f.pueblo}`} target="_blank" className="mt-3 block bg-black text-white text-center py-3 rounded-xl font-bold">Ver en mapa →</a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
