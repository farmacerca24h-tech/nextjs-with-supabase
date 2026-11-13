"use client";
import { useState } from "react";

export default function Page() {
  const [texto, setTexto] = useState("");
  const [productos, setProductos] = useState<string[]>([]);
  const [buscando, setBuscando] = useState(false);

  const anadir = () => {
    if (!texto.trim()) return;
    setProductos([...productos, texto.trim()]);
    setTexto("");
    setBuscando(false);
  };

  const borrar = (i: number) => {
    setProductos(productos.filter((_, index) => index !== i));
    setBuscando(false);
  };

  const crearAcceso = () => {
    alert("Para crear el acceso directo:\n\nEn iPhone: Pulsa Compartir y luego 'Añadir a pantalla de inicio'.\nEn Android: Pulsa los 3 puntitos y luego 'Añadir a pantalla de inicio'.");
  };

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: 16, fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32 }}>💊</div>
        <h1 style={{ margin: "4px 0" }}>FarmaCerca 24h</h1>
        <p style={{ margin: 0, color: "#666" }}>Ciudad o pedanía: Iznájar</p>
        <p style={{ margin: "6px 0", fontSize: 13, color: "#666" }}>Hoy: 10 / 250 &nbsp; Quedan: 240</p>
      </div>

      <label style={{ fontWeight: "bold", display: "block", marginTop: 16 }}>¿Qué necesitas?</label>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") anadir(); }}
          placeholder="Ej: Paracetamol 500..."
          style={{ flex: 1, padding: 14, borderRadius: 12, border: "1px solid #ccc", fontSize: 16 }}
        />
        <button onClick={anadir} style={{ padding: "0 16px", background: "#111", color: "white", border: "none", borderRadius: 12, fontWeight: "bold", fontSize: 20 }}>+</button>
      </div>
      <p style={{ fontSize: 12, color: "#888", margin: "6px 0" }}>Escribe un producto y pulsa + para añadir otro. Puedes poner varios.</p>

      {productos.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f1f5f9", padding: "10px 12px", borderRadius: 10, marginTop: 6 }}>
          <span>{p}</span>
          <button onClick={() => borrar(i)} style={{ background: "none", border: "none", color: "red", fontWeight: "bold" }}>X Borrar</button>
        </div>
      ))}

      {productos.length > 0 && !buscando && (
        <button onClick={() => setBuscando(true)} style={{ width: "100%", padding: 15, background: "#16a34a", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: "bold", marginTop: 12 }}>
          Comprobando disponibilidad en farmacias
        </button>
      )}

      {buscando && (
        <p style={{ textAlign: "center", color: "#16a34a", fontWeight: "bold", marginTop: 14 }}>
          Comprobando disponibilidad en farmacias...
        </p>
      )}

      <div style={{ marginTop: 20, padding: 18, borderRadius: 16, background: "#f0fdf4", border: "2px dashed #16a34a", textAlign: "center" }}>
        <div style={{ fontSize: 28 }}>⭐</div>
        <h3 style={{ margin: "8px 0 4px" }}>¡Hazte el acceso directo!</h3>
        <p style={{ margin: "0 0 12px", color: "#555", fontSize: 14 }}>Como una app, pero sin descargar nada</p>
        <button onClick={crearAcceso} style={{ padding: "12px 20px", background: "#111", color: "white", border: "none", borderRadius: 999, fontWeight: "bold" }}>
          Crear mi acceso directo
        </button>
      </div>
    </main>
  );
}
