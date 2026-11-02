"use client";
import { useState } from "react";

const FARMACIAS = [
  // URRACAL / COMARCA
  { nombre: "Farmacia Urrácal", pueblo: "Urrácal", direccion: "Av. Constitución 5", guardia: true, horario: "Abierta hasta 22:00" },
  { nombre: "Farmacia Liria", pueblo: "Purchena", direccion: "C/ Mayor 12", guardia: false, horario: "Abre mañana 9:00" },
  
  // VELEZ MALAGA - AHORA 8
  { nombre: "Farmacia Central Vélez", pueblo: "Vélez Málaga", direccion: "C/ Canalejas 10", guardia: true, horario: "Abierta hasta 23:00" },
  { nombre: "Farmacia Torre del Mar", pueblo: "Vélez Málaga", direccion: "Av. Andalucía 34", guardia: false, horario: "Abre mañana 9:00" },
  { nombre: "Farmacia El Carmen", pueblo: "Vélez Málaga", direccion: "C/ Cristo 15", guardia: true, horario: "Abierta hasta 22:00" },
  { nombre: "Farmacia Triana", pueblo: "Vélez Málaga", direccion: "C/ San Francisco 8", guardia: false, horario: "Abre mañana 9:30" },
  { nombre: "Farmacia Capuchinos", pueblo: "Vélez Málaga", direccion: "Av. Vivar Téllez 45", guardia: false, horario: "Abre mañana 9:00" },
  { nombre: "Farmacia Real Bajo", pueblo: "Vélez Málaga", direccion: "C/ Reñidero 2", guardia: false, horario: "Abre mañana 9:00" },
];

function quitarAcentos(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function Home() {
  const [q, setQ] = useState("velez malaga");
  const [resultados, setResultados] = useState(FARMACIAS.filter(f => quitarAcentos(f.pueblo).includes("velez")));

  const buscar = () => {
    const query = quitarAcentos(q);
    if (!query) { setResultados(FARMACIAS.slice(0,6)); return; }
    const f = FARMACIAS.filter(f => 
      quitarAcentos(f.pueblo).includes(query) || 
      quitarAcentos(f.nombre).includes(query)
    );
    setResultados(f);
  };

  return (
    <main className="min-h-screen bg-[#f8fffe]">
      <header className="max-w-6xl mx-auto p-6 flex justify-between">
        <div className="flex items-center gap-2 font-black text-xl">
          <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center">+</div>
          Farmacerca24h
        </div>
        <div className="text-sm text-emerald-600 font-bold">Ahora en Vélez Málaga</div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 text-center">
        <h1 className="text-4xl md:text-6xl font-black">Encuentra tu farmacia<br/><span className="text-emerald-500">de guardia en 5 segundos</span></h1>
        
        <div className="mt-8 max-w-2xl mx-auto flex gap-2 p-2 bg-white rounded-[20px] shadow-2xl border">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscar()} className="flex-1 px-6 py-4 outline-none rounded-xl text-lg" placeholder="Ej: velez malaga" />
          <button onClick={buscar} className="bg-emerald-500 text-white px-8 rounded-xl font-bold">Buscar</button>
        </div>

        <div className="mt-4 text-sm text-gray-400">{resultados.length} farmacias encontradas en "{q}"</div>

        <div className="mt-8 grid md:grid-cols-3 gap-4 text-left">
          {resultados.map((f) => (
            <div key={f.nombre} className={`bg-white p-6 rounded-2xl border-2 ${f.guardia ? 'border-emerald-500' : 'border-gray-100'}`}>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${f.guardia ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>{f.guardia ? 'DE GUARDIA HOY' : f.pueblo.toUpperCase()}</span>
              <h3 className="font-bold text-lg mt-3">{f.nombre}</h3>
              <p className="text-sm text-gray-500">{f.direccion}</p>
              <p className="text-sm font-bold mt-2 text-emerald-600">{f.horario}</p>
              <a target="_blank" href={`https://www.google.com/maps/search/${f.nombre} ${f.pueblo}`} className="mt-4 inline-block text-sm font-bold text-emerald-600 underline">Ver en mapa →</a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
