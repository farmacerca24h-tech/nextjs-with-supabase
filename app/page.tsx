'use client'
import { useState } from 'react'
import BuscadorFarmaCerca from "@/components/BuscadorFarmaCerca";

export default function Home() {
  const [pueblo, setPueblo] = useState("Iznájar");

  return (
    <main style={{ padding: 20, background: "white", minHeight: "100vh", maxWidth: 600, margin: "0 auto" }}>
      
      {/* TU LOGO */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <img src="/logo.png" alt="FarmaCerca 24h" style={{ width: 180, maxWidth: "80%" }} />
      </div>

      <h1 style={{ textAlign: "center", color: "#16a34a", fontSize: 28, fontWeight: "bold", margin: 0 }}>
        FarmaCerca 24h
      </h1>

      {/* MENSAJE EN VERDE */}
      <p style={{ textAlign: "center", background: "#dcfce7", color: "#166534", padding: 14, borderRadius: 12, fontSize: 16, fontWeight: "bold", marginTop: 12 }}>
        Encuentra tu farmacia con stock cerca de ti 💊
      </p>

      {/* PUEBLO */}
      <label style={{ display: "block", fontSize: 18, marginTop: 20, marginBottom: 6 }}>Pueblo</label>
      <input
        value={pueblo}
        onChange={(e) => setPueblo(e.target.value)}
        style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #ddd", fontSize: 18, boxSizing: "border-box" }}
      />

      {/* BUSCADOR NUEVO */}
      <div style={{ marginTop: 20 }}>
        <BuscadorFarmaCerca />
      </div>

      <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginTop: 20 }}>
        Pueblo seleccionado: {pueblo}
      </p>
    </main>
  );
}
