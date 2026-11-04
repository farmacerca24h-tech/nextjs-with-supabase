"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TODOS LOS PUEBLOS DE MÁLAGA + PEDANÍAS
const PUEBLOS = [
  "Alameda", "Alcaucín", "Alfarnate", "Alfarnatejo", "Algarrobo", "Algatocín",
  "Alhaurín de la Torre", "Alhaurín el Grande", "Almáchar", "Almargen", "Almogía",
  "Álora", "Alozaina", "Alpandeire", "Antequera", "Árchez", "Archidona", "Ardales",
  "Arenas", "Arriate", "Atajate", "Benadalid", "Benahavís", "Benalauría",
  "Benalmádena", "Benamargosa", "Benamocarra", "Benaoján", "Benarrabá", "El Borge",
  "El Burgo", "Campillos", "Canillas de Aceituno", "Canillas de Albaida", "Cañete la Real",
  "Carratraca", "Cartajima", "Cártama", "Casabermeja", "Casarabonela", "Casares",
  "Coín", "Colmenar", "Comares", "Cómpeta", "Cortes de la Frontera", "Cuevas Bajas",
  "Cuevas del Becerro", "Cuevas de San Marcos", "Cútar", "Estepona", "Faraján",
  "Frigiliana", "Fuengirola", "Fuente de Piedra", "Gaucín", "Genalguacil",
  "Guaro", "Humilladero", "Igualeja", "Istán", "Iznate", "Jimera de Líbar",
  "Jubrique", "Júzcar", "Macharaviaya", "Málaga", "Manilva", "Marbella", "Mijas",
  "Moclinejo", "Mollina", "Monda", "Montejaque", "Nerja", "Ojén", "Parauta",
  "Periana", "Pizarra", "Pujerra", "Rincón de la Victoria", "Riogordo", "Ronda",
  "Salares", "Sayalonga", "Sedella", "Sierra de Yeguas", "Teba", "Tolox",
  "Torremolinos", "Torrox", "Totalán", "Valle de Abdalajís", "Vélez-Málaga",
  "Villanueva de Algaidas", "Villanueva del Rosario", "Villanueva del Trabuco",
  "Villanueva de Tapia", "Viñuela", "Yunquera",
  // PEDANÍAS Y BARRIADAS
  "Torre del Mar", "Caleta de Vélez", "Almayate", "Chilches", "Benajarafe",
  "Torre de Benagalbón", "La Cala del Moral", "La Cala de Mijas", "Las Lagunas",
  "San Pedro de Alcántara", "Nueva Andalucía", "Puerto Banús", "El Palo",
  "Pedregalejo", "Churriana", "Campanillas", "Puerto de la Torre", "Teatinos",
  "Arroyo de la Miel", "Benalmádena Costa", "Benalmádena Pueblo", "Torremuelle",
  "Torreblanca", "Los Boliches", "Carvajal", "El Chaparral", "La Carihuela",
  "Montemar", "Los Álamos", "Playamar", "La Colina", "El Sexmo", "Cala de Mijas",
  "Riviera del Sol", "Calanova", "La Butibamba", "Cancelada", "Elviria",
  "Cabopino", "La Alquería", "Santa Rosalía", "Maqueda", "Chaparral"
];

type Farmacia = {
  id: number;
  nombre: string;
  direccion: string;
  pueblo: string;
  telefono: string | null;
  guardia_24h: boolean;
  latitud: number | null;
  longitud: number | null;
};

export default function Home() {
  const [pueblo, setPueblo] = useState("");
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  async function buscar() {
    if (!pueblo) {
      alert("Elige un pueblo primero");
      return;
    }
    setBuscando(true);
    setBuscado(true);

    const { data, error } = await supabase
      .from("farmacias")
      .select("*")
      .ilike("pueblo", `%${pueblo}%`)
      .eq("guardia_24h", true);

    if (error) {
      console.log(error);
      setFarmacias([]);
    } else {
      setFarmacias(data || []);
    }
    setBuscando(false);
  }

  // Cuando cambia el pueblo, buscar automáticamente
  useEffect(() => {
    if (pueblo) {
      buscar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pueblo]);

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#0a7a42" }}>💊 Farmacerca 24h</h1>
      <p style={{ textAlign: "center" }}>Farmacias de guardia 24h en Málaga</p>

      <label style={{ fontWeight: "bold" }}>Elige tu pueblo:</label>
      <select
        value={pueblo}
        onChange={(e) => setPueblo(e.target.value)}
        style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 8, borderRadius: 8, border: "1px solid #ccc" }}
      >
        <option value="">-- Elige un pueblo --</option>
        {PUEBLOS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <button
        onClick={buscar}
        style={{ width: "100%", padding: 14, marginTop: 12, background: "#0a7a42", color: "white", border: "none", borderRadius: 8, fontSize: 17, fontWeight: "bold", cursor: "pointer" }}
      >
        {buscando ? "Buscando..." : "🔍 Buscar farmacia 24h"}
      </button>

      {buscado && !buscando && (
        <div style={{ marginTop: 20 }}>
          {farmacias.length === 0 ? (
            <p style={{ textAlign: "center", background: "#fff3cd", padding: 15, borderRadius: 8 }}>
              No hay farmacia 24h registrada en {pueblo} todavía.
            </p>
          ) : (
            farmacias.map((f) => (
              <div key={f.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 15, marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>{f.nombre}</h3>
                <p style={{ margin: "6px 0" }}>📍 {f.direccion} - {f.pueblo}</p>
                {f.telefono && <p style={{ margin: "6px 0" }}>📞 <a href={`tel:${f.telefono}`}>{f.telefono}</a></p>}
                <span style={{ background: "#0a7a42", color: "white", padding: "4px 10px", borderRadius: 20, fontSize: 13 }}>ABIERTA 24H</span>
                {f.latitud && f.longitud && (
                  <div style={{ marginTop: 10 }}>
                    <a href={`https://www.google.com/maps?q=${f.latitud},${f.longitud}`} target="_blank" rel="noreferrer" style={{ color: "#0a7a42", fontWeight: "bold" }}>
                      📍 Cómo llegar en Google Maps
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
