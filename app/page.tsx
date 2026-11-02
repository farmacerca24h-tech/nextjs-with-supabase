"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// 103 MUNICIPIOS OFICIALES
const MUNICIPIOS = [
"Alameda","Alcaucín","Alfarnate","Alfarnatejo","Algarrobo","Algatocín","Alhaurín de la Torre","Alhaurín el Grande","Almáchar","Almargen","Almogía","Álora","Alozaina","Alpandeire","Antequera","Árchez","Archidona","Ardales","Arenas","Arriate","Atajate","Benadalid","Benahavís","Benalauría","Benalmádena","Benamargosa","Benamocarra","Benaoján","Benarrabá","El Borge","El Burgo","Campillos","Canillas de Aceituno","Canillas de Albaida","Cañete la Real","Carratraca","Cartajima","Cártama","Casabermeja","Casarabonela","Casares","Coín","Colmenar","Comares","Cómpeta","Cortes de la Frontera","Cuevas Bajas","Cuevas de San Marcos","Cuevas del Becerro","Cútar","Estepona","Faraján","Frigiliana","Fuengirola","Fuente de Piedra","Gaucín","Genalguacil","Guaro","Humilladero","Igualeja","Istán","Iznate","Jimera de Líbar","Jubrique","Júzcar","Macharaviaya","Málaga","Manilva","Marbella","Mijas","Moclinejo","Mollina","Monda","Montecorto","Montejaque","Nerja","Ojén","Parauta","Periana","Pizarra","Pujerra","Rincón de la Victoria","Riogordo","Ronda","Salares","Sayalonga","Sedella","Serrato","Sierra de Yeguas","Teba","Tolox","Torremolinos","Torrox","Totalán","Valle de Abdalajís","Vélez-Málaga","Villanueva de Algaidas","Villanueva de la Concepción","Villanueva del Rosario","Villanueva del Trabuco","Villanueva de Tapia","Viñuela","Yunquera"
].sort((a,b)=>a.localeCompare(b));

// PEDANÍAS IMPORTANTES QUE LA GENTE BUSCA (Mapeadas a su municipio)
const PEDANIAS_MAP: Record<string, string> = {
  "Torre del Mar": "Vélez-Málaga",
  "Caleta de Vélez": "Vélez-Málaga",
  "Benajarafe": "Vélez-Málaga",
  "Chilches": "Vélez-Málaga",
  "Almayate": "Vélez-Málaga",
  "San Pedro de Alcántara": "Marbella",
  "Nueva Andalucía": "Marbella",
  "Las Chapas": "Marbella",
  "La Cala de Mijas": "Mijas",
  "Las Lagunas de Mijas": "Mijas",
  "La Cala del Moral": "Rincón de la Victoria",
  "Torre de Benagalbón": "Rincón de la Victoria",
  "Benagalbón": "Rincón de la Victoria",
  "Churriana": "Málaga",
  "El Palo": "Málaga",
  "Pedregalejo": "Málaga",
  "Huelin": "Málaga",
  "Cancelada": "Estepona",
  "New Golden Mile": "Estepona",
  "Maro": "Nerja",
  "Burriana": "Nerja",
  "El Morche": "Torrox",
  "Ferrara": "Torrox",
  "Los Boliches": "Fuengirola",
  "Carvajal": "Fuengirola",
  "Arroyo de la Miel": "Benalmádena",
  "Benalmádena Costa": "Benalmádena",
  "Torrequebrada": "Benalmádena",
  "Sabinillas": "Manilva",
  "El Castillo": "Manilva",
  "La Carihuela": "Torremolinos",
  "Montemar": "Torremolinos",
  "Caleta de Maro": "Nerja"
};

const PEDANIAS = Object.keys(PEDANIAS_MAP).sort((a,b)=>a.localeCompare(b));
const PUEBLOS_MALAGA = ["Todos", ...MUNICIPIOS, ...PEDANIAS];

export default function Home() {
  const [farmacias, setFarmacias] = useState<any[]>([]);
  const [puebloSel, setPuebloSel] = useState("Todos");
  const supabase = createClient();

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from("farmacias").select("*");
      if (data) setFarmacias(data);
    };
    cargar();
  }, []);

  const filtradas = farmacias.filter(f => {
    if (puebloSel === "Todos") return true;
    
    const puebloF = (f.pueblo || "").toLowerCase();
    const dirF = (f.direccion || "").toLowerCase();
    const selLower = puebloSel.toLowerCase();

    // Si eliges una pedanía: muestra si la farmacia es de esa pedanía O de su municipio padre
    if (PEDANIAS_MAP[puebloSel]) {
      const padre = PEDANIAS_MAP[puebloSel].toLowerCase();
      return puebloF.includes(selLower) || dirF.includes(selLower) || puebloF.includes(padre);
    }

    // Si eliges un municipio: muestra si es del municipio O de cualquiera de sus pedanías
    const pedaniasDeEsteMunicipio = Object.entries(PEDANIAS_MAP)
      .filter(([_, padre]) => padre === puebloSel)
      .map(([ped]) => ped.toLowerCase());

    return puebloF === selLower || puebloF.includes(selLower) || pedaniasDeEsteMunicipio.some(p => puebloF.includes(p) || dirF.includes(p));
  });

  return (
    <main className="min-h-screen bg-[#f8fffe] p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-center text-black">
          Farmacias de guardia en <span className="text-emerald-500">{puebloSel} HOY</span>
        </h1>
        <p className="text-center text-gray-500 mt-2">{filtradas.length} farmacias encontradas</p>

        <div className="mt-6 bg-white p-4 rounded-2xl border-2 border-black shadow-lg">
          <label className="font-bold text-black text-sm">ELIGE TU PUEBLO (103 MUNICIPIOS + PEDANÍAS):</label>
          <select value={puebloSel} onChange={e=>setPuebloSel(e.target.value)} className="w-full mt-2 p-4 rounded-xl border-2 font-bold text-lg bg-white text-black border-black">
            {PUEBLOS_MALAGA.map(p=>{
              const esPedania = PEDANIAS_MAP[p];
              return <option key={p} value={p}>{esPedania ? `${p} (${esPedania})` : p}</option>
            })}
          </select>
        </div>

        <div className="grid gap-4 mt-6">
          {filtradas.length === 0 && <p className="text-center text-black font-bold mt-10">No hay farmacias registradas aún en {puebloSel}. ¡Añádelas en Supabase!</p>}
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
