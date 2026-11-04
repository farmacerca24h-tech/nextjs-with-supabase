"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// TODOS LOS PUEBLOS DE MÁLAGA + PEDANÍAS
const PUEBLOS = [
  "Alameda","Alcaucín","Alfarnate","Alfarnatejo","Algarrobo","Algatocín","Alhaurín de la Torre","Alhaurín el Grande","Almáchar","Almargen","Almogía","Álora","Alozaina","Alpandeire","Antequera","Árchez","Archidona","Ardales","Arenas","Arriate","Atajate","Benadalid","Benahavís","Benalauría","Benalmádena","Benamargosa","Benamocarra","Benaoján","Benarrabá","El Borge","El Burgo","Campillos","Canillas de Aceituno","Canillas de Albaida","Cañete la Real","Carratraca","Cartajima","Cártama","Casabermeja","Casarabonela","Casares","Coín","Colmenar","Comares","Cómpeta","Cortes de la Frontera","Cuevas Bajas","Cuevas del Becerro","Cuevas de San Marcos","Cútar","Estepona","Faraján","Frigiliana","Fuengirola","Fuente de Piedra","Gaucín","Genalguacil","Guaro","Humilladero","Igualeja","Istán","Iznate","Jimera de Líbar","Jubrique","Júzcar","Macharaviaya","Málaga","Manilva","Marbella","Mijas","Moclinejo","Mollina","Monda","Montecorto","Montejaque","Nerja","Ojén","Parauta","Periana","Pizarra","Pujerra","Rincón de la Victoria","Riogordo","Ronda","Salares","Sayalonga","Sedella","Serrato","Sierra de Yeguas","Teba","Tolox","Torremolinos","Torrox","Totalán","Valle de Abdalajís","Vélez-Málaga","Villanueva de Algaidas","Villanueva del Rosario","Villanueva del Trabuco","Villanueva de Tapia","La Viñuela","Yunquera",
  // PEDANÍAS IMPORTANTES
  "Torre del Mar","San Pedro Alcántara","La Cala de Mijas","Las Lagunas","Churriana","Campanillas","Puerto de la Torre","El Palo","Pedregalejo","Almayate","Caleta de Vélez","Benagalbón","Torre de Benagalbón"
];

type Farmacia = {
  id: number;
  nombre: string;
  pueblo: string;
  direccion: string;
  telefono: string;
  guardia: string | null;
};

export default function Home() {
  const [pueblo, setPueblo] = useState("Vélez-Málaga");
  const [busqueda, setBusqueda] = useState("");
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [cargando, setCargando] = useState(true);

  const hoy = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const { data } = await supabase
        .from("farmacias")
        .select("*")
        .eq("pueblo", pueblo)
        .order("nombre");
      setFarmacias(data || []);
      setCargando(false);
    }
    cargar();
  }, [pueblo]);

  const pueblosFiltrados = PUEBLOS.filter((p) =>
    p.toLowerCase().includes(busqueda.toLowerCase())
  );

  const deGuardia = farmacias.filter((f) => f.guardia === hoy);
  const otras = farmacias.filter((f) => f.guardia !== hoy);

  return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: 16, fontFamily: "sans-serif", background: "#f6f6f6", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", fontSize: 26, marginBottom: 4 }}>💊 Farmacias de Guardia</h1>
      <p style={{ textAlign: "center", color: "#666", marginTop: 0 }}>Málaga y todos sus pueblos</p>

      {/* BUSCADOR */}
      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="🔍 Escribe tu pueblo... Ej: Nerja, Ronda, Marbella"
        style={{ width: "100%", padding: 14, fontSize: 16, borderRadius: 12, border: "1px solid #ddd", boxSizing: "border-box" }}
      />

      {/* LISTA DE PUEBLOS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12, maxHeight: busqueda ? 200 : 120, overflowY: "auto", background: "white", padding: 10, borderRadius: 12 }}>
        {pueblosFiltrados.map((p) => (
          <button
            key={p}
            onClick={() => { setPueblo(p); setBusqueda(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{
              padding: "8px 12px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background: p === pueblo ? "#007a33" : "#eee",
              color: p === pueblo ? "white" : "black",
              fontWeight: p === pueblo ? "bold" : "normal",
            }}
          >
            {p}
          </button>
        ))}
        {pueblosFiltrados.length === 0 && <p>No hay pueblo con ese nombre</p>}
      </div>

      <h2 style={{ marginTop: 20 }}>De guardia hoy en {pueblo}</h2>
      <p style={{ color: "#666", fontSize: 13 }}>{new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>

      {cargando ? (
        <p>Cargando...</p>
      ) : deGuardia.length === 0 ? (
        <div style={{ background: "#fff3cd", padding: 14, borderRadius: 12 }}>
          <b>No tenemos registrada la guardia de hoy en nuestra base de datos.</b>
          <br />Mira la oficial abajo, que esa nunca falla.
        </div>
      ) : (
        deGuardia.map((f) => (
          <div key={f.id} style={{ background: "#d4edda", border: "2px solid #007a33", padding: 16, borderRadius: 12, marginBottom: 10 }}>
            <b style={{ fontSize: 18 }}>🟢 {f.nombre}</b>
            <p style={{ margin: "6px 0" }}>{f.direccion}</p>
            <a href={`tel:${f.telefono}`} style={{ display: "inline-block", background: "#007a33", color: "white", padding: "10px 16px", borderRadius: 10, textDecoration: "none", fontWeight: "bold" }}>📞 Llamar {f.telefono}</a>
            <a href={`https://www.google.com/maps/search/${encodeURIComponent(f.nombre + " " + f.direccion + " " + pueblo)}`} target="_blank" style={{ display: "inline-block", background: "white", color: "black", padding: "10px 16px", borderRadius: 10, textDecoration: "none", marginLeft: 8, border: "1px solid #007a33" }}>📍 Cómo llegar</a>
          </div>
        ))
      )}

      {/* BOTÓN OFICIAL - CONSEJO */}
      <a
        href="https://farmaciasguardia.farmaceuticos.com/web_guardias/publico/Provincia_pNew.asp?id=29"
        target="_blank"
        style={{ display: "block", background: "#007a33", color: "white", textAlign: "center", padding: 16, borderRadius: 12, fontWeight: "bold", marginTop: 12, textDecoration: "none", fontSize: 16 }}
      >
        ✅ Ver guardia oficial HOY en el Consejo de Farmacéuticos
      </a>
      <p style={{ fontSize: 12, textAlign: "center", color: "#666" }}>
        Se abre la web oficial de Málaga (id=29). Elige tu pueblo y la fecha de hoy.
      </p>

      <h3 style={{ marginTop: 24 }}>Otras farmacias en {pueblo}</h3>
      {otras.length === 0 ? (
        <p style={{ color: "#888" }}>Todavía no hay farmacias metidas para este pueblo.</p>
      ) : (
        otras.map((f) => (
          <div key={f.id} style={{ background: "white", padding: 14, borderRadius: 12, marginBottom: 8, border: "1px solid #eee" }}>
            <b>{f.nombre}</b>
            <p style={{ margin: "4px 0", color: "#555" }}>{f.direccion}</p>
            <a href={`tel:${f.telefono}`} style={{ color: "#007a33", fontWeight: "bold", textDecoration: "none" }}>📞 {f.telefono}</a>
            {f.guardia && <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>Próxima guardia: {f.guardia}</p>}
          </div>
        ))
      )}

      <p style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 30 }}>
        Datos de guardias: Consejo General de Colegios Oficiales de Farmacéuticos
      </p>
    </main>
  );
}
