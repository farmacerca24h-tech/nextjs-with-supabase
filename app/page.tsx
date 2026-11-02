"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const PUEBLOS = ["Alameda","Alcaucín","Alfarnate","Alfarnatejo","Algarrobo","Algatocín","Alhaurín de la Torre","Alhaurín el Grande","Almáchar","Almargen","Almogía","Álora","Alozaina","Alpandeire","Antequera","Árchez","Archidona","Ardales","Arenas","Arriate","Atajate","Benadalid","Benahavís","Benalauría","Benalmádena","Benamargosa","Benamocarra","Benaoján","Benarrabá","El Borge","El Burgo","Campillos","Canillas de Aceituno","Canillas de Albaida","Cañete la Real","Carratraca","Cartajima","Cártama","Casabermeja","Casarabonela","Casares","Coín","Colmenar","Comares","Cómpeta","Cortes de la Frontera","Cuevas Bajas","Cuevas de San Marcos","Cuevas del Becerro","Cútar","Estepona","Faraján","Frigiliana","Fuengirola","Fuente de Piedra","Gaucín","Genalguacil","Guaro","Humilladero","Igualeja","Istán","Iznate","Jimera de Líbar","Jubrique","Júzcar","Macharaviaya","Málaga","Manilva","Marbella","Mijas","Moclinejo","Mollina","Monda","Montecorto","Montejaque","Nerja","Ojén","Parauta","Periana","Pizarra","Pujerra","Rincón de la Victoria","Riogordo","Ronda","Salares","Sayalonga","Sedella","Serrato","Sierra de Yeguas","Teba","Tolox","Torremolinos","Torrox","Totalán","Valle de Abdalajís","Vélez-Málaga","Villanueva de Algaidas","Villanueva de la Concepción","Villanueva del Rosario","Villanueva del Trabuco","Villanueva de Tapia","Viñuela","Yunquera"].sort((a,b)=>a.localeCompare(b));

const PUEBLOS_MALAGA = ["Todos", ...PUEBLOS];

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
        <h1 className="text-4xl font-black text-center text-black">Farmacias de guardia en <span className="text-emerald-500">{puebloSel} HOY</span></h1>
        <div className="mt-6 bg-white p-4 rounded-2xl border-2 border-black shadow-lg">
          <label className="font-bold text-black text-sm">ELIGE TU PUEBLO (103 MUNICIPIOS A-Z):</label>
          <select value={puebloSel} onChange={e=>setPuebloSel(e.target.value)} className="w-full mt-2 p-4 rounded-xl border-2 font-bold text-lg bg-white text-black border-black">
            {PUEBLOS_MALAGA.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="grid gap-4 mt-6">
          {filtradas.map(f=>(
            <div key={f.id} className="bg-white p-5 rounded-2xl border-2 border-gray-200">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-black">{f.pueblo.toUpperCase()}</span>
              <h3 className="font-bold text-lg mt-2 text-black">{f.nombre}</h3>
              <p className="text-sm text-gray-600">{f.direccion} - {f.telefono}</p>
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(f.nombre+' '+f.pueblo)}`} target="_blank" className="mt-3 block bg-black text-white text-center py-3 rounded-xl font-bold">Ver en mapa →</a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
