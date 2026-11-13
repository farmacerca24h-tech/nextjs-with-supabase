'use client'
import BuscadorFarmaCerca from "@/components/BuscadorFarmaCerca";

export default function Home() {
  return (
    <main style={{ padding: 20, background: "#f0f2f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        FarmaCerca 24h
      </h1>
      <BuscadorFarmaCerca />
    </main>
  );
}
