"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [farmacias, setFarmacias] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [puebloSel, setPuebloSel] = useState("Todos");
  const supabase = createClient();

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase.from("farmacias").select("*");
      if (data) setFarmacias(data);
    };
    cargar();
  }, []);

  const guardias = farmacias.filter(f => f.guardia === true);
  const filtradas = farmacias.filter(f => {
    if (busqueda && !f.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !f.pueblo.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (puebloSel !== "Todos" && f.pueblo !== puebloSel) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-white pb-10">
      <div className="max-w-3xl mx-auto px-4 pt-4 border-[4px] border-[#8fc8e8] rounded-[30px] overflow-hidden">

        {/* LOGO */}
        <div className="flex items-center justify-center gap-2 py-3">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-3xl font-black relative">
            +
            <span className="absolute -bottom-1 -right-1 bg-white border border-green-600 text-green-700 text-[8px] px-1 rounded font-black">24h</span>
          </div>
          <h1 className="text-4xl font-black text-gray-800">FarmaCerca</h1>
        </div>

        {/* BUSCADOR */}
        <div className="bg-[#ececec] rounded-2xl flex items-center px-4 py-4 gap-3">
          <span className="text-3xl">🔍</span>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="¿Qué buscas?"
            className="bg-transparent w-full text-3xl font-bold placeholder-gray-500 outline-none text-black"
          />
        </div>

        <h2 className="text-center font-black text-[#0b3d5e] text-xl mt-4 tracking-wide">MAPA - RED DE FARMACIAS</h2>

        {/* MAPA */}
        <div className="relative bg-[#b8e6a8] rounded-3xl h-[320px] mt-3 overflow-hidden border">
          <div className="absolute bottom-0 left-0 w-full h-[80px] bg-[#2a8fd6] rounded-b-3xl" />
          {/* Pines simulados */}
          {filtradas.slice(0, 18).map((f, i) => (
            <div key={f.id || i} className="absolute" style={{ left: `${8 + (i * 47) % 82}%`, top: `${10 + (i * 31) % 55}%` }}>
              <div className="w-7 h-7 bg-green-600 rounded-full rounded-bl-none rotate-45 flex items-center justify-center shadow">
                <span className="-rotate-45 text-white font-black text-sm">+</span>
              </div>
            </div>
          ))}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-14 h-14 bg-green-600 rounded-full rounded-bl-none rotate-45 flex items-center justify-center shadow-xl">
              <span className="-rotate-45 text-white text-3xl font-black">+</span>
            </div>
            <div className="bg-green-600 text-white font-black text-center px-4 py-2 rounded-2xl mt-2 text-sm leading-tight shadow">
              Farmacia cercana<br />disponible
            </div>
          </div>
        </div>

        {/* 2 CUADROS - CLIENTE / FARMACIA */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[#e6f2fa] border-2 border-[#a8d0e6] p-3 rounded-xl">
            <div className="bg-white rounded-2xl p-3 text-center text-sm font-bold text-[#0b2a4a] leading-tight shadow">
              Cliente desde casa consulta por el stock de un producto<br />¿Disponible?<br />Responde SI
            </div>
            <div className="mt-3 text-center text-5xl">🧔‍♂️📱</div>
            <p className="text-center text-xs font-bold mt-1 text-gray-600">Cliente pregunta desde casa</p>
          </div>
          <div className="bg-[#e9f7ec] border-2 border-green-500 p-3 rounded-xl">
            <div className="bg-white rounded-2xl p-3 text-center text-sm font-bold text-[#1a3a1a] leading-tight shadow">
              Por favor, verifique disponibilidad - Responder siempre vía mensajería utilizada
            </div>
            <div className="mt-3 text-center text-5xl">👩‍⚕️💻</div>
            <p className="text-center text-xs font-bold mt-1 text-gray-600">Farmacia verifica y responde</p>
          </div>
        </div>

        {/* LISTADO RED */}
        <div className="mt-6">
          <h3 className="font-black text-lg text-black">Red de farmacias - {filtradas.length} disponibles</h3>
          <select value={puebloSel} onChange={e => setPuebloSel(e.target.value)} className="w-full mt-2 p-3 rounded-xl border-2 border-black font-bold bg-white text-black">
            <option>Todos</option>
            {[...new Set(farmacias.map(f => f.pueblo))].sort().map(p => <option key={p}>{p}</option>)}
          </select>
          <div className="grid gap-3 mt-3">
            {filtradas.slice(0, 10).map(f => (
              <div key={f.id} className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-sm">
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500 text-white">{f.pueblo?.toUpperCase()}</span>
                <h4 className="font-bold text-black mt-1">{f.nombre}</h4>
                <p className="text-sm text-gray-600">{f.direccion} - {f.telefono}</p>
                <button className="mt-2 bg-black text-white px-4 py-2 rounded-full font-bold text-sm">Consultar stock →</button>
              </div>
            ))}
          </div>
        </div>

        {/* GUARDIAS - AHORA SECUNDARIO */}
        <div className="mt-8 bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
          <h3 className="font-black text-black">Farmacia de guardia hoy <span className="text-emerald-600">- extra</span></h3>
          <p className="text-sm text-gray-600">No es lo principal, solo para urgencias.</p>
          <div className="grid gap-2 mt-3">
            {guardias.slice(0, 5).map(f => (
              <div key={f.id} className="bg-white p-3 rounded-xl border border-emerald-500">
                <p className="font-bold text-black text-sm">{f.nombre} - {f.pueblo}</p>
                <p className="text-xs text-gray-600">{f.direccion} - {f.telefono}</p>
              </div>
            ))}
            {guardias.length === 0 && <p className="text-sm text-gray-500">Hoy no hay guardias marcadas en Supabase.</p>}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 py-4">FarmaCerca 24h - Red de farmacias de Málaga</p>
      </div>
    </main>
  );
}
