"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const MUNICIPIOS = ["Alameda","Alcaucín","Alfarnate","Alfarnatejo","Algarrobo","Algatocín","Alhaurín de la Torre","Alhaurín el Grande","Almáchar","Almargen","Almogía","Álora","Alozaina","Alpandeire","Antequera","Árchez","Archidona","Ardales","Arenas","Arriate","Atajate","Benadalid","Benahavís","Benalauría","Benalmádena","Benamargosa","Benamocarra","Benaoján","Benarrabá","El Borge","El Burgo","Campillos","Canillas de Aceituno","Canillas de Albaida","Cañete la Real","Carratraca","Cartajima","Cártama","Casabermeja","Casarabonela","Casares","Coín","Colmenar","Comares","Cómpeta","Cortes de la Frontera","Cuevas Bajas","Cuevas de San Marcos","Cuevas del Becerro","Cútar","Estepona","Faraján","Frigiliana","Fuengirola","Fuente de Piedra","Gaucín","Genalguacil","Guaro","Humilladero","Igualeja","Istán","Iznate","Jimera de Líbar","Jubrique","Júzcar","Macharaviaya","Málaga","Manilva","Marbella","Mijas","Moclinejo","Mollina","Monda","Montecorto","Montejaque","Nerja","Ojén","Parauta","Periana","Pizarra","Pujerra","Rincón de la Victoria","Riogordo","Ronda","Salares","Sayalonga","Sedella","Serrato","Sierra de Yeguas","Teba","Tolox","Torremolinos","Torrox","Totalán","Valle de Abdalajís","Vélez-Málaga","Villanueva de Algaidas","Villanueva de la Concepción","Villanueva del Rosario","Villanueva del Trabuco","Villanueva de Tapia","Viñuela","Yunquera"].sort((a,b)=>a.localeCompare(b));

const PEDANIAS_MAP: Record<string, string> = {
  "Torre del Mar": "Vélez-Málaga", "Caleta de Vélez": "Vélez-Málaga", "Benajarafe": "Vélez-Málaga",
  "San Pedro de Alcántara": "Marbella", "La Cala de Mijas": "Mijas", "La Cala del Moral": "Rincón de la Victoria",
  "Churriana": "Málaga", "El Palo": "Málaga", "Cancelada": "Estepona", "Maro": "Nerja", "El Morche": "Torrox", "Sabinillas": "Manilva"
};
const PEDANIAS = Object.keys(PEDANIAS_MAP).sort((a,b)=>a.localeCompare(b));
const PUEBLOS_MALAGA = ["Todos", ...MUNICIPIOS, ...PEDANIAS];

export default function Home() {
  const [farmacias, setFarmacias] = useState<any[]>([]);
  const [puebloSel, setPuebloSel] = useState("Todos");
  const [hoyStr, setHoyStr] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    setHoyStr(hoy);
    const cargar = async () => {
      // AHORA FILTRA DIRECTO POR FECHA DE HOY - AUTOMÁTICO
      const { data } = await supabase.from("farmacias").select("*").eq('fecha_guardia', hoy);
      if (data) setFarmacias(data);
    };
    cargar();
  }, []);

  const filtradas = farmacias.filter(f => {
    if (puebloSel === "Todos") return true;
    const pf = (f.pueblo || "").toLowerCase();
    return pf.includes(puebloSel.toLowerCase()) || (PEDANIAS_MAP[puebloSel] && pf.includes(PEDANIAS_MAP[puebloSel].toLowerCase()));
  });

  return (
    <main className="min-h-screen bg-[#f8fffe] p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-center text-black">Guardia HOY <span className="text-emerald-500">{new Date().toLocaleDateString('es-ES')}</span> en {puebloSel}</h1>
        <p className="text-center text-gray-500 mt-2">Automático - Se actualiza cada día solo</p>
        <div className="mt-6 bg-white p-4 rounded-2xl border-2 border-black">
          <select value={puebloSel} onChange={e=>setPuebloSel(e.target.value)} className="w-full p-4 rounded-xl border-2 font-bold text-lg bg-white text-black border-black">
            {PUEBLOS_MALAGA.map(p=><option key={p} value={p}>{PEDANIAS_MAP[p] ? `${p} (${PEDANIAS_MAP[p]})` : p}</option>)}
          </select>
        </div>
        <div className="grid gap-4 mt-6">
          {filtradas.length===0 && <p className="text-center font-bold mt-10 text-black">Hoy {hoyStr} no hay guardias registradas para {puebloSel}. Añade fecha_guardia en Supabase.</p>}
          {filtradas.map(f=>(
            <div key={f.id} className="bg-white p-5 rounded-2xl border-2 border-emerald-500">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-white">DE GUARDIA HOY {f.fecha_guardia} - {f.pueblo.toUpperCase()}</span>
              <h3 className="font-bold text-lg mt-2 text-black">{f.nombre}</h3>
              <p className="text-sm text-gray-600">{f.direccion} - {f.telefono}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
