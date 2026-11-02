"use client";
import { useState } from "react";

const FARMACIAS = [
  { nombre: "Farmacia Liria", pueblo: "Purchena", direccion: "C/ Mayor 12", guardia: true, horario: "Abierta hasta 22:00" },
  { nombre: "Farmacia Urrácal", pueblo: "Urrácal", direccion: "Av. Constitución 5", guardia: false, horario: "Abre mañana 9:30" },
  { nombre: "Farmacia Central Olula", pueblo: "Olula del Río", direccion: "C/ Granada 8", guardia: false, horario: "Abre mañana 9:00" },
  { nombre: "Farmacia Vélez-Málaga Centro", pueblo: "Vélez Málaga", direccion: "C/ Canalejas 10", guardia: true, horario: "Abierta hasta 23:00" },
  { nombre: "Farmacia Torre del Mar", pueblo: "Vélez Málaga", direccion: "Av. Andalucía 34", guardia: false, horario: "Abre mañana 9:00" },
  { nombre: "Farmacia Algarrobo", pueblo: "Algarrobo", direccion: "C/ La Iglesia 2", guardia: false, horario: "Abre mañana 9:30" },
];

export default function Home() {
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState(FARMACIAS.slice(0,3));

  const buscar = () => {
    if (!q) { setResultados(FARMACIAS.slice(0,3)); return; }
    const f = FARMACIAS.filter(f => 
      f.pueblo.toLowerCase().includes(q.toLowerCase()) || 
      f.nombre.toLowerCase().includes(q.toLowerCase())
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
        <div className="text-sm text-gray-400">Beta - Almería & Málaga</div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">
          Encuentra tu farmacia<br/>
          <span className="text-emerald-500">de guardia en 5 segundos</span>
        </h1>
        <p className="mt-4 text-gray-500 text-lg">En Urrácal, Purchena, Olula, Vélez Málaga y toda la comarca.</p>

        <div className="mt-8 max-w-2xl mx-auto flex gap-2 p-2 bg-white rounded-[20px] shadow-2xl shadow-emerald-100 border">
          <input 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            className="flex-1 px-6 py-4 outline-none rounded-xl text-lg" 
            placeholder="¿En qué pueblo estás? Ej: Velez Malaga" 
          />
          <button onClick={buscar} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 rounded-xl font-bold">Buscar</button>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-4 text-left">
          {resultados.length === 0 && <div className="col-span-3 text-center text-gray-400 py-10">No hemos encontrado nada en "{q}". Prueba "Velez" o "Urrácal"</div>}
          {resultados.map((f) => (
            <div key={f.nombre} className={`bg-white p-6 rounded-2xl border-2 ${f.guardia ? 'border-emerald-500' : 'border-gray-100'}`}>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${f.guardia ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>
                {f.guardia ? 'DE GUARDIA HOY' : f.pueblo.toUpperCase()}
              </span>
              <h3 className="font-bold text-lg mt-3">{f.nombre}</h3>
              <p className="text-sm text-gray-500">{f.direccion} - {f.pueblo}</p>
              <p className="text-sm font-bold mt-2 text-emerald-600">{f.horario}</p>
              <a target="_blank" href={`https://www.google.com/maps/search/${f.nombre} ${f.pueblo}`} className="mt-4 inline-block text-sm font-bold text-emerald-600 underline">Ver en mapa →</a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
