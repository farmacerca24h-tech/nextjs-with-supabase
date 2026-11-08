"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pueblo, setPueblo] = useState("Iznájar");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const instalar = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim()) return;
    setEnviado(true);
  };

  return (
    <main className="min-h-screen bg-white px-4 py-6 max-w-md mx-auto">
      {/* LOGO */}
      <div className="flex flex-col items-center">
        <img src="/icon-192.png" alt="FarmaCerca" className="w-16 h-16 rounded-2xl" />
        <h1 className="text-3xl font-extrabold text-green-600 mt-2">FarmaCerca 24h</h1>
        <p className="text-gray-500 text-sm mt-1 text-center">
          Preguntamos por ti a 3 farmacias a la vez
        </p>
      </div>

      {/* BOTON INSTALAR - SOLO ESTO, SIN CARTEL */}
      <button
        onClick={instalar}
        className="w-full bg-black text-white py-3 rounded-xl font-bold mt-5"
      >
        📱 Crear acceso directo en tu móvil
      </button>
      <p className="text-center text-xs text-gray-400 mt-1">
        1 toque y te queda el icono en pantalla como una app
      </p>

      {/* CONTADOR */}
      <div className="bg-green-50 rounded-xl py-3 text-center text-green-700 font-semibold mt-4">
        Hoy: 10 / 250 &nbsp; Quedan: 240
      </div>

      {/* FORMULARIO */}
      {!enviado ? (
        <form onSubmit={enviar} className="mt-5 flex flex-col gap-4">
          <div>
            <label className="font-medium">Pueblo</label>
            <input
              value={pueblo}
              onChange={(e) => setPueblo(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 mt-1"
            />
          </div>

          <div>
            <label className="font-medium">¿Qué necesitas?</label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ej: Paracetamol 500..."
              className="w-full border rounded-xl px-4 py-3 mt-1 h-24"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold"
          >
            Preguntar a 3 farmacias
          </button>
        </form>
      ) : (
        <div className="bg-green-50 rounded-xl p-4 mt-5 text-center">
          <p className="font-bold text-green-700">✅ Enviado</p>
          <p className="text-sm text-gray-600 mt-1">
            Estamos preguntando en {pueblo}. Te avisamos en cuanto responda una farmacia.
          </p>
          <button
            onClick={() => {
              setEnviado(false);
              setMensaje("");
            }}
            className="mt-3 underline text-sm"
          >
            Hacer otra consulta
          </button>
        </div>
      )}
    </main>
  );
}
