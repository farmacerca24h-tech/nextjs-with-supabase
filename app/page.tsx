"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pueblo, setPueblo] = useState("Iznájar");
  const [necesidad, setNecesidad] = useState("");
  const [hoy, setHoy] = useState(10);
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
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    const esIphone = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (esIphone) {
      alert("En iPhone: pulsa Compartir > Añadir a pantalla de inicio");
    } else {
      alert("Pulsa los 3 puntitos de arriba > Instalar aplicación");
    }
  };

  const preguntar = () => {
    if (!pueblo.trim() || !necesidad.trim()) {
      alert("Escribe tu pueblo y qué necesitas");
      return;
    }
    setHoy((h) => h + 1);
    setEnviado(true);
    setNecesidad("");
  };

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: 20, fontFamily: "system-ui", background: "#fff", minHeight: "100vh", textAlign: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <img src="/logo.png" alt="FarmaCerca" style={{ width: 72, height: 72, objectFit: "contain", display: "block", margin: "0 auto" }} />
        <h1 style={{ color: "#16a34a", margin: "8px 0 4px", fontSize: 32, textAlign: "center" }}>FarmaCerca 24h</h1>
        <p style={{ color: "#666", margin: 0, textAlign: "center" }}>Preguntamos por ti a 3 farmacias a la vez</p>
      </div>

      <button
        onClick={instalar}
        style={{ width: "100%", background: "#000", color: "#fff", border: "none", padding: 14, borderRadius: 12, fontSize: 16, fontWeight: 700, marginTop: 20, cursor: "pointer" }}
      >
        📱 Crear acceso directo en tu móvil
      </button>
      <p style={{ textAlign: "center", color: "#888", fontSize: 13, margin: "8px 0 0" }}>
        1 toque y te queda el icono en pantalla como una app
      </p>

      <div style={{ background: "#eefaf3", borderRadius: 12, padding: 12, textAlign: "center", marginTop: 16, color: "#0f766e", fontWeight: 600 }}>
        Hoy: {hoy} / 250 &nbsp; Quedan: {250 - hoy}
      </div>

      <div style={{ textAlign: "left" }}>
        <label style={{ display: "block", marginTop: 20, fontWeight: 600 }}>Pueblo</label>
        <input
          value={pueblo}
          onChange={(e) => setPueblo(e.target.value)}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #ddd", marginTop: 8, fontSize: 16, boxSizing: "border-box" }}
        />

        <label style={{ display: "block", marginTop: 20, fontWeight: 600 }}>¿Qué necesitas?</label>
        <textarea
          value={necesidad}
          onChange={(e) => setNecesidad(e.target.value)}
          placeholder="Ej: Paracetamol 500..."
          rows={3}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #ddd", marginTop: 8, fontSize: 16, boxSizing: "border-box" }}
        />
      </div>

      <button
        onClick={preguntar}
        style={{ width: "100%", background: "#16c47f", color: "#fff", border: "none", padding: 16, borderRadius: 12, fontSize: 17, fontWeight: 700, marginTop: 20, cursor: "pointer" }}
      >
        Preguntar a 3 farmacias
      </button>

      {enviado && (
        <p style={{ background: "#dcfce7", padding: 12, borderRadius: 10, textAlign: "center", marginTop: 16 }}>
          ✅ Enviado. Te avisamos cuando responda una farmacia.
        </p>
      )}
    </main>
  );
}
