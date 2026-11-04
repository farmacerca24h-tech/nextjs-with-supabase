"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Farmacia = {
  id: number;
  nombre: string;
  pueblo: string;
  direccion: string;
  telefono: string;
  guardia: string | null;
};

const PUEBLOS = ["Vélez-Málaga", "Torre del Mar", "Algarrobo", "Torrox", "Nerja", "Rincón de la Victoria"];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [puebloSel, setPuebloSel] = useState("Vélez-Málaga");
  const [hoy, setHoy] = useState("");
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setHoy(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const { data } = await supabase
        .from("farmacias")
        .select("*")
        .eq("pueblo", puebloSel)
        .order("nombre");
      setFarmacias(data || []);
      setCargando(false);
    }
    cargar();
  }, [puebloSel]);

  const deGuardia = farmacias.filter((f) => f.guardia === hoy);
  const resto = farmacias.filter((f) => f.guardia !== hoy);

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>💊 Farmacias de guardia</h1>
      <p>Selecciona tu pueblo para ver la farmacia de guardia hoy.</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {PUEBLOS.map((p) => (
          <button
            key={p}
            onClick={() => setPuebloSel(p)}
            style={{
              padding: "8px 14px",
              borderRadius: 20,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: p === puebloSel ? "#16a34a" : "white",
              color: p === puebloSel ? "white" : "black",
              fontWeight: p === puebloSel ? "bold" : "normal",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <>
          <h2>🟢 De guardia hoy en {puebloSel}</h2>
          {deGuardia.length === 0 ? (
            <p>No hay farmacia de guardia registrada hoy.</p>
          ) : (
            deGuardia.map((f) => (
              <div key={f.id} style={{ border: "2px solid #16a34a", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <strong>{f.nombre}</strong>
                <div>{f.direccion}</div>
                <div>📞 {f.telefono}</div>
              </div>
            ))
          )}

          <h3 style={{ marginTop: 30 }}>Otras farmacias en {puebloSel}</h3>
          {resto.map((f) => (
            <div key={f.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 8 }}>
              <strong>{f.nombre}</strong>
              <div>{f.direccion} - 📞 {f.telefono}</div>
              {f.guardia && <small>Guardia: {f.guardia}</small>}
            </div>
          ))}
        </>
      )}
    </main>
  );
}
