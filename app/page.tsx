"use client";
import { useState } from "react";

const localidades = [
  "Málaga Centro", "El Palo", "Pedregalejo", "El Limonar", "Churriana", "Campanillas", "Santa Rosalía", "Puerto de la Torre", "Teatinos", "Carretera de Cádiz", "Huelin", "La Malagueta", "Ciudad Jardín", "Bailén-Miraflores", "Palma-Palmilla", "Cruz de Humilladero", "Guadalmar", "El Atabal", "Maqueda", "Castañetas", "Colmenarejo", "Los Asperones",
  "Alameda", "Alcaucín", "Alfarnate", "Alfarnatejo", "Algarrobo", "Algarrobo-Costa", "Mezquitilla - Algarrobo", "Trayamar", "Algatocín", "Alhaurín de la Torre", "El Peñón", "Torrealquería", "Santa Amalia - Alhaurín", "Pinos de Alhaurín", "Alhaurín el Grande", "Villafranco del Guadalhorce", "Almáchar", "Almargen", "Almogía", "Arroyo Coche", "Álora", "El Chorro", "El Hacho", "Las Mellizas", "Bellavista", "Alozaina", "Alpandeire",
  "Antequera", "Cartaojal", "Bobadilla", "Bobadilla Estación", "Villanueva de Cauche", "La Joya", "Los Nogales", "La Higuera", "Cañadas de Pareja",
  "Árchez", "Archidona", "Salinas", "Huertas del Río", "Estación de Archidona", "Ardales", "Arenas", "Daimalos", "Arriate", "Atajate", "Benadalid", "Benahavís", "El Madroñal", "La Quinta", "Benalauría",
  "Benalmádena", "Benalmádena Pueblo", "Benalmádena Costa", "Arroyo de la Miel", "Torremuelle", "Carvajal", "Benamargosa", "Benamocarra", "Benaoján", "Benaoján Estación", "Benarrabá", "El Borge", "El Burgo", "Campillos", "Canillas de Aceituno", "Canillas de Albaida", "Cañete la Real", "Carratraca", "Cartajima",
  "Cártama", "Cártama Pueblo", "Estación de Cártama", "El Sexmo", "Doña Ana", "Casabermeja", "Casarabonela", "Casares", "Casares Costa", "Secadero", "Coín", "Colmenar", "Las Palomas", "Comares", "Cómpeta",
  "Cortes de la Frontera", "Estación de Cortes", "El Colmenar", "Cañada del Real Tesoro", "Cuevas Bajas", "Cuevas del Becerro", "Cuevas de San Marcos", "Cútar", "Salto del Negro",
  "Estepona", "Cancelada", "El Padrón", "Bahía Dorada", "Isdabe", "Atalaya - Estepona", "Faraján", "Frigiliana",
  "Fuengirola", "Los Boliches", "Torreblanca", "El Boquetillo", "Los Pacos", "Fuente de Piedra", "Gaucín", "Genalguacil", "Guaro", "Humilladero", "Igualeja", "Istán", "Iznate", "Jimera de Líbar", "Estación de Jimera", "Jubrique", "Júzcar",
  "Macharaviaya", "Benaque", "Vallejo", "Manilva", "Manilva Pueblo", "Sabinillas", "Castillo de la Duquesa",
  "Marbella", "San Pedro de Alcántara", "Nueva Andalucía", "Puerto Banús", "Las Chapas", "Elviria", "Cabopino", "Guadalmina", "La Campana",
  "Mijas", "Mijas Pueblo", "Las Lagunas", "La Cala de Mijas", "Calanova", "Riviera del Sol", "El Chaparral", "Moclinejo", "El Valdés", "Mollina", "La Herriza", "Monda", "Montecorto", "Montejaque",
  "Nerja", "Burriana", "Maro", "Torrecilla", "Ojén", "Parauta", "Periana", "Mondrón", "La Muela", "Guerola", "Pizarra", "Zalea", "Cerralba", "Pujerra",
  "Rincón de la Victoria", "La Cala del Moral", "Torre de Benagalbón", "Benagalbón", "Añoreta", "El Cantal", "Los Rubios", "Riogordo",
  "Ronda", "La Cimada", "Serrato", "Salares", "Sayalonga", "Corumbela", "Sedella", "Sierra de Yeguas", "Navahermosa", "Teba", "Huertas de Guillén", "Tolox",
  "Torremolinos", "La Carihuela", "El Bajondillo", "Montemar", "El Calvario", "Playamar", "Los Álamos",
  "Torrox", "Torrox Pueblo", "Torrox Costa", "El Morche", "Ferrara", "El Peñoncillo", "Totalán", "Valle de Abdalajís",
  "Vélez-Málaga", "Torre del Mar", "Caleta de Vélez", "Almayate", "Almayate Alto", "Almayate Bajo", "Benajarafe", "Chilches", "Cajiz", "Lagos", "Mezquitilla", "Trapiche", "Triana", "Cabrillas", "Valle-Niza",
  "Villanueva de Algaidas", "Villanueva del Rosario", "Villanueva del Trabuco", "Villanueva de Tapia", "Viñuela", "Los Romanes", "Yunquera"
];

export default function Page() {
  const [localidad, setLocalidad] = useState("");
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
    alert("Para crear el acceso directo: En iPhone: Pulsa Compartir y luego 'Añadir a pantalla de inicio'. En Android: Pulsa los 3 puntos y 'Añadir a pantalla de inicio'");
  };

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: 16, fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 33 }}>💊</div>
        <h1 style={{ margin: "4px 0" }}>FarmaCerca 24h</h1>
        <p style={{ margin: "4px 0", color: "#666" }}>¿Qué necesitas hoy?</p>
        <p style={{ margin: "4px 0", fontSize: 13, color: "#666" }}>Hoy: 30 / 200 códigos. Quedan: 200</p>
      </div>

      <label style={{ fontWeight: "bold", display: "block", marginTop: 16 }}>1. ¿Dónde estás?</label>
      <select value={localidad} onChange={(e) => setLocalidad(e.target.value)} style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #ccc", fontSize: 16, marginTop: 8 }}>
        <option value="">Elige tu pueblo o pedanía...</option>
        {localidades.map((l) => (<option key={l} value={l}>{l}</option>))}
      </select>
      {localidad && <p style={{ textAlign: "center" }}>Buscando en: <b>{localidad}</b></p>}

      <label style={{ fontWeight: "bold", display: "block", marginTop: 16 }}>2. ¿Qué necesitas?</label>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") anadir(); }} placeholder="Ej: Paracetamol 500..." style={{ flex: 1, padding: 14, borderRadius: 12, border: "1px solid #ccc", fontSize: 16 }} />
        <button onClick={anadir} style={{ padding: 14, color: "white", background: "#16a34a", border: "none", borderRadius: 12, fontSize: 16, fontWeight: "bold" }}>+ Añadir</button>
      </div>

      {productos.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f5f5f5", padding: 12, borderRadius: 10, marginTop: 8 }}>
          <span>💊 {p}</span>
          <button onClick={() => borrar(i)} style={{ border: "none", background: "none", fontSize: 18 }}>❌</button>
        </div>
      ))}

      <button onClick={crearAcceso} style={{ width: "100%", padding: 14, marginTop: 16, background: "#16a34a", color: "white", border: "none", borderRadius: 12, fontSize: 17, fontWeight: "bold" }}>Buscar en farmacias 24h cerca de mí</button>
      <p style={{ textAlign: "center", fontSize: 13, color: "#666" }}>Escribe tu producto y pulsa + para añadir otro. Puedes poner varios.</p>
    </main>
  );
}
