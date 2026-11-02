"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const MUNICIPIOS = ["Alameda","Alcaucín","Alfarnate","Alfarnatejo","Algarrobo","Algatocín","Alhaurín de la Torre","Alhaurín el Grande","Almáchar","Almargen","Almogía","Álora","Alozaina","Alpandeire","Antequera","Árchez","Archidona","Ardales","Arenas","Arriate","Atajate","Benadalid","Benahavís","Benalauría","Benalmádena","Benamargosa","Benamocarra","Benaoján","Benarrabá","El Borge","El Burgo","Campillos","Canillas de Aceituno","Canillas de Albaida","Cañete la Real","Carratraca","Cartajima","Cártama","Casabermeja","Casarabonela","Casares","Coín","Colmenar","Comares","Cómpeta","Cortes de la Frontera","Cuevas Bajas","Cuevas de San Marcos","Cuevas del Becerro","Cútar","Estepona","Faraján","Frigiliana","Fuengirola","Fuente de Piedra","Gaucín","Genalguacil","Guaro","Humilladero","Igualeja","Istán","Iznate","Jimera de Líbar","Jubrique","Júzcar","Macharaviaya","Málaga","Manilva","Marbella","Mijas","Moclinejo","Mollina","Monda","Montecorto","Montejaque","Nerja","Ojén","Parauta","Periana","Pizarra","Pujerra","Rincón de la Victoria","Riogordo","Ronda","Salares","Sayalonga","Sedella","Serrato","Sierra de Yeguas","Teba","Tolox","Torremolinos","Torrox","Totalán","Valle de Abdalajís","Vélez-Málaga","Villanueva de Algaidas","Villanueva de la Concepción","Villanueva del Rosario","Villanueva del Trabuco","Villanueva de Tapia","Viñuela","Yunquera"].sort((a,b)=>a.localeCompare(b));
const PEDANIAS_MAP: Record<string, string> = {"Torre del Mar":"Vélez-Málaga","Caleta de Vélez":"Vélez-Málaga","Benajarafe":"Vélez-Málaga","Chilches":"Vélez-Málaga","Almayate":"Vélez-Málaga","San Pedro de Alcántara":"Marbella","Nueva Andalucía":"Marbella","Las Chapas":"Marbella","La Cala de Mijas":"Mijas","Las Lagunas de Mijas":"Mijas","La Cala del Moral":"Rincón de la Victoria","Torre de Benagalbón":"Rincón de la Victoria","Churriana":"Málaga","El Palo":"Málaga","Cancelada":"Estepona","Maro":"Nerja","El Morche":"Torrox","Los Boliches":"Fuengirola","Arroyo de la Miel":"Benalmádena","Sabinillas":"Manilva","La Carihuela":"Torremolinos"};
const PUEBLOS_MALAGA = ["Todos", ...MUNICIPIOS, ...Object.keys(PEDANIAS_MAP).sort()];

export default function Home() {
  const [farmacias, setFarmacias] = useState<any[]>([]);
  const [puebloSel, setPuebloSel] = useState("Vélez-Málaga");
  const supabase = createClient();
  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from("farmacias").select("*").order('nombre');
      if (data) setFarmacias(data);
    };
    cargar();
  }, []);

  const filtradas = farmacias.filter(f => {
    if (puebloSel === "Todos") return true;
    const pf = (f.pueblo || "").toLowerCase();
    const sel = puebloSel.toLowerCase();
    if (PEDANIAS_MAP[puebloSel]) return pf.includes(sel);
    return pf.includes(sel);
  });

  return (
    <main className="min-h-screen bg-[#f8fffe] p-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-center text-black">Farmacias de guardia en <span className="text-emerald-500">{puebloSel} HOY</span></h1>
        <p className="text-center text-sm text-gray-500 mt-2">Hoy es {new Date().toLocaleDateString('es-ES')} - Total en BD: {farmacias.length}</p>
        
        <div className="mt-6 bg-white p-4 rounded-2xl border-2 border-black shadow-lg">
          <label className="font-bold text-sm">ELIGE TU PUEBLO (103 MUNICIPIOS + PEDANÍAS):</label>
          <select value={puebloSel} onChange={e=>setPuebloSel(e.target.value)} className="w-full mt-2 p-4 rounded-xl border-2 font-bold text-lg bg-white text-black border-black">
            {PUEBLOS_MALAGA.map(p=><option key={p} value={p}>{PEDANIAS_MAP[p] ? `${p} (${PEDANIAS_MAP[p]})` : p}</option>)}
          </select>
        </div>

        <div className="grid gap-4 mt-6">
          {filtradas.length===0 && <p className="text-center font-bold mt-10 bg-white p-6 rounded-2xl border-2 border-black">No hay farmacias registradas aún en {puebloSel}. ¡Añádelas en Supabase! (Tienes {farmacias.length} en total)</p>}
          {filtradas.map(f=>{
            const esHoy = f.fecha_guardia === hoy || f.guardia === true;
            return (
              <div key={f.id} className={`bg-white p-5 rounded-2xl border-2 ${esHoy?'border-emerald-500 bg-emerald-50':'border-gray-200'}`}>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${esHoy?'bg-emerald-500 text-white':'bg-gray-100 text-black'}`}>{esHoy?'DE GUARDIA HOY':''} {f.pueblo?.toUpperCase()} {f.fecha_guardia?` - ${f.fecha_guardia}`:''}</span>
                <h3 className="font-bold text-lg mt-2 text-black">{f.nombre}</h3>
                <p className="text-sm text-gray-600">{f.direccion} - {f.telefono}</p>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
