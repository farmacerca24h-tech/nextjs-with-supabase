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

type Estado = "stock" | "nostock" | "otro" | "pedido";
const farmaciasDemo = [
  { nombre: "Farmacia Central", dir: "Calle Ejemplo 12, Málaga, 952 123 456", estados: ["stock","stock","pedido"] as Estado[] },
  { nombre: "Farmacia La Luz", dir: "Av. Andalucía 20, Málaga, 952 654 321", estados: ["stock","nostock","otro"] as Estado[] },
  { nombre: "Farmacia Salud", dir: "Calle Mayor 5, Málaga, 952 987 654", estados: ["stock","stock","pedido"] as Estado[] },
];
const icono = (e: Estado) => e==="stock" ? "✅" : e==="nostock" ? "❌" : e==="otro" ? "👁️" : "✏️";

export default function Page() {
  const [localidad, setLocalidad] = useState("");
  const [diurno, setDiurno] = useState(true);
  const [guardia, setGuardia] = useState(false);
  const [festivo, setFestivo] = useState(false);
  const [texto, setTexto] = useState("");
  const [productos, setProductos] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  const [vista, setVista] = useState<"cliente"|"farmacia">("cliente");
  const [resp, setResp] = useState<Estado[]>(["stock","otro","pedido"]);

  const horario = [diurno?"Diurno":"", guardia?"De guardia":"", festivo?"Festivo":""].filter(Boolean).join(", ") || "Diurno";
  const mensajeBase = `Hola, soy cliente de FarmaCerca 24h. Estoy en ${localidad || "Málaga"} (${horario}). ¿Tienes en stock?%0A` + productos.map(p=>`- ${p}`).join("%0A") + `%0A¿Me confirmas disponibilidad? Solo información, no venta. Gracias.`;

  const anadir = () => { if(!texto.trim()) return; setProductos([...productos, texto.trim()]); setTexto(""); setEnviado(false); };
  const enviarTodo = () => { if(!localidad) { alert("Elige primero tu ciudad o pedanía"); return; } if(productos.length===0) { alert("Escribe al menos 1 producto"); return; } setEnviado(true); };

  const abrirWhats = (tel: string) => {
    window.open(`https://wa.me/${tel}?text=${mensajeBase}`, "_blank");
  };

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 12, fontFamily: "sans-serif", background: "#fff" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 36 }}>➕</div>
          <div><div style={{ fontSize: 24, fontWeight: 900 }}>Farmacerca <span style={{ background: "#16a34a", color: "#fff", padding: "2px 10px", borderRadius: 20 }}>24h</span></div><div style={{ fontSize: 14 }}>A un mensaje de ti</div></div>
        </div>
        <button onClick={() => alert("En iPhone: Compartir > Añadir a pantalla de inicio. En Android: 3 puntos > Añadir a pantalla de inicio")} style={{ background: "#0ea5e9", color: "#fff", border: "none", padding: "8px 10px", borderRadius: 8, fontWeight: "bold" }}>⬇ Descargar acceso directo</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={()=>setVista("cliente")} style={{ flex: 1, padding: 10, borderRadius: 10, background: vista==="cliente" ? "#16a34a" : "#eee", color: vista==="cliente" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}>Vista Cliente</button>
        <button onClick={()=>setVista("farmacia")} style={{ flex: 1, padding: 10, borderRadius: 10, background: vista==="farmacia" ? "#16a34a" : "#eee", color: vista==="farmacia" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}>Vista Farmacia (probar)</button>
      </div>

      {vista === "cliente" ? (
        <>
          <p style={{ fontWeight: "bold", margin: "14px 0 6px" }}>Elige:</p>
          <select value={localidad} onChange={(e)=>{setLocalidad(e.target.value); setEnviado(false);}} style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid #16a34a", fontSize: 16 }}>
            <option value="">📍 Ciudad o pedanía...</option>
            {localidades.map(l=><option key={l} value={l}>{l}</option>)}
          </select>
          {localidad && <p style={{ textAlign: "center" }}>📍 Ubicando en: <b>{localidad}</b> • {horario}</p>}

          <p style={{ fontWeight: "bold" }}>Para el Chat, marcar si estamos en horario:</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 15 }}>
            <label><input type="checkbox" checked={diurno} onChange={()=>setDiurno(!diurno)} /> ☀️ Diurno</label>
            <label><input type="checkbox" checked={guardia} onChange={()=>setGuardia(!guardia)} /> 🌙 De guardia</label>
            <label><input type="checkbox" checked={festivo} onChange={()=>setFestivo(!festivo)} /> 📅 Festivo</label>
          </div>

          <h3 style={{ color: "#16a34a", margin: "14px 0 6px" }}>💬 Chat de consulta</h3>
          <div style={{ display: "flex", border: "1px solid #16a34a", borderRadius: 12, overflow: "hidden" }}>
            <input value={texto} onChange={(e)=>setTexto(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") anadir();}} placeholder="¿Qué necesitas? Escribe el producto..." style={{ flex: 1, padding: 14, border: "none", fontSize: 15 }} />
            <button onClick={anadir} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "0 18px", fontWeight: "bold", fontSize: 16 }}>Enviar</button>
          </div>

          {/* CASILLEROS */}
          {productos.map((p,i)=>(
            <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "#f0fdf4", padding: 12, borderRadius: 10, marginTop: 8, border: "1px solid #bbf7d0" }}>
              <span>💊 {p}</span><button onClick={()=>setProductos(productos.filter((_,x)=>x!==i))} style={{ border: "none", background: "none", fontSize: 18 }}>❌</button>
            </div>
          ))}
          {productos.length>0 && <button onClick={enviarTodo} style={{ width: "100%", padding: 14, marginTop: 10, background: "#16a34a", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold", fontSize: 16 }}>Buscar en 3 farmacias a la vez →</button>}

          <p style={{ fontWeight: "bold" }}>✅ en stock &nbsp; ❌ Sin stock &nbsp; 👁️ otro &nbsp; ✏️ Bajo pedido</p>

          {enviado && <h3 style={{ color: "#16a34a" }}>💬 Obteniendo respuestas...</h3>}
          {enviado && farmaciasDemo.map((f, idx)=>(
            <div key={idx} style={{ border: "2px solid #16a34a", borderRadius: 14, padding: 12, marginBottom: 12, display: "flex", gap: 10 }}>
              <div style={{ background: "#16a34a", color: "#fff", width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 20, flexShrink: 0 }}>{idx+1}</div>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 17 }}>{f.nombre}</b><div style={{ fontSize: 13 }}>📍 {f.dir}</div>
                <button onClick={()=>abrirWhats("3460000000"+idx)} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, marginTop: 8, fontWeight: "bold" }}>💬 Chat</button>
              </div>
              <div style={{ borderLeft: "1px solid #ddd", paddingLeft: 10, flex: 1 }}>
                {productos.map((p,i)=><div key={i} style={{ fontSize: 14 }}>{p}</div>)}
                <button onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.nombre+" "+f.dir)}`, "_blank")} style={{ background: "#0ea5e9", color: "#fff", border: "none", padding: "8px 10px", borderRadius: 10, marginTop: 8, fontWeight: "bold" }}>✈️ Cómo llegar</button>
              </div>
              <div style={{ fontSize: 20, display: "flex", flexDirection: "column", gap: 4 }}>{f.estados.slice(0, productos.length).map((e,i)=><span key={i}>{icono(e)}</span>)}</div>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={()=>{setGuardia(true); setEnviado(true);}} style={{ flex: 1, padding: 12, borderRadius: 10, background: "#dbeafe", border: "1px solid #16a34a", fontWeight: "bold" }}>🌙 Farmacias de guardia →</button>
            <button onClick={()=>{if(localidad) setEnviado(true);}} style={{ flex: 1, padding: 12, borderRadius: 10, background: "#dcfce7", border: "1px solid #16a34a", fontWeight: "bold" }}>📍 Farmacias de la zona →</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ background: "#16a34a", color: "#fff", padding: 12, borderRadius: 10, marginTop: 12 }}><b style={{ fontSize: 20 }}>FarmaCerca 24 h en línea</b></div>
          <h2 style={{ color: "#15803d" }}>NUEVA CONSULTA - CLIENTE Nº 1</h2>
          <p style={{ color: "#1e3a8a", fontWeight: "bold" }}>Marcar respuesta para el cliente:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 60px 60px 60px", gap: 6, alignItems: "center", fontSize: 13, fontWeight: "bold" }}>
            <span></span><span style={{ color: "#15803d" }}>Tengo stock</span><span style={{ color: "#991b1b" }}>No tengo</span><span style={{ color: "#4c1d95" }}>Ver otro</span><span style={{ color: "#a16207" }}>Bajo pedido</span>
            {productos.length===0 ? ["Ibuprofeno 600 mg","Paracetamol 1 g","Crema hidratante"].map((p,i)=>(
              <div key={i} style={{ display: "contents" }}><b>{p}<br/><span style={{ color: "#666", fontWeight: "normal" }}>1 caja</span></b>{(["stock","nostock","otro","pedido"] as Estado[]).map((t)=>(<button key={t} onClick={()=>{const n=[...resp]; n[i]=t; setResp(n);}} style={{ padding: 10, fontSize: 18, borderRadius: 10, background: resp[i]===t ? "#0ea5e9" : "#fff", border: "1px solid #ccc" }}>{t==="stock"?"✅":t==="nostock"?"❌":t==="otro"?"👁️":"✏️"}</button>))}</div>
            )) : productos.map((p,i)=>(
              <div key={i} style={{ display: "contents" }}><b>{p}</b>{(["stock","nostock","otro","pedido"] as Estado[]).map((t)=>(<button key={t} onClick={()=>{const n=[...resp]; n[i]=t; setResp(n);}} style={{ padding: 10, fontSize: 18, borderRadius: 10, background: resp[i]===t ? "#0ea5e9" : "#fff", border: "1px solid #ccc" }}>{t==="stock"?"✅":t==="nostock"?"❌":t==="otro"?"👁️":"✏️"}</button>))}</div>
            ))}
          </div>
          <p style={{ color: "#15803d", fontWeight: "bold" }}>ATAJOS - Marca todo de una vez:</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={()=>setResp(resp.map(()=> "stock" as Estado))} style={{ flex: 1, padding: 10, borderRadius: 10, background: "#fff", border: "1px solid #15803d", color: "#15803d", fontWeight: "bold" }}>LO TENGO TODO</button>
            <button onClick={()=>setResp(resp.map(()=> "nostock" as Estado))} style={{ flex: 1, padding: 10, borderRadius: 10, background: "#fff", border: "1px solid #991b1b", color: "#991b1b", fontWeight: "bold" }}>NO TENGO NADA</button>
            <button onClick={()=>setResp(resp.map(()=> "pedido" as Estado))} style={{ flex: 1, padding: 10, borderRadius: 10, background: "#fff", border: "1px solid #000", fontWeight: "bold" }}>PEDIR TODO</button>
          </div>
          <button onClick={()=>alert("Respuesta enviada al cliente: " + resp.map(r=>icono(r)).join(" "))} style={{ width: "100%", padding: 16, marginTop: 14, background: "#22c55e", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold", fontSize: 17 }}>ENVIAR RESPUESTA</button>
          <button onClick={()=>setResp(["stock","otro","pedido"])} style={{ width: "100%", padding: 12, marginTop: 8, background: "#fef2f2", color: "#991b1b", border: "1px solid #991b1b", borderRadius: 12, fontWeight: "bold" }}>X &nbsp; BORRAR RESPUESTA / REESCRIBIR</button>
          <p style={{ fontSize: 12, fontWeight: "bold" }}>Farmacia independiente - Solo informacion de disponibilidad.</p>
        </>
      )}

      <div style={{ background: "#dcfce7", border: "1px solid #16a34a", borderRadius: 12, padding: 12, marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><b>Contacto FarmaCerca 24 h</b><div style={{ fontSize: 13 }}>¿Dudas o ayuda? Pulsa para escribirnos.</div></div><button onClick={()=>window.open("https://wa.me/34600000000?text=Hola%20FarmaCerca,%20tengo%20una%20duda", "_blank")} style={{ background: "#fff", border: "1px solid #16a34a", padding: "8px 12px", borderRadius: 10, color: "#16a34a", fontWeight: "bold" }}>💬 Chat →</button></div>
        <div style={{ display: "flex", justifyContent: "space-between", background: "#fff", padding: 10, borderRadius: 8, marginTop: 8 }}><span>✉️ E-mail: contacto@farmacerca24h.es</span><a href="mailto:contacto@farmacerca24h.es" style={{ color: "#16a34a", fontWeight: "bold", textDecoration: "none" }}>Pulsa →</a></div>
      </div>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>➕ Farmacerca <span style={{ background: "#16a34a", color: "#fff", padding: "0 8px", borderRadius: 12 }}>24h</span></div>
        <div style={{ fontSize: 13 }}>A un mensaje de ti</div>
        <div style={{ border: "1px solid #16a34a", borderRadius: 10, padding: 8, marginTop: 10, background: "#dcfce7", fontWeight: "bold", fontSize: 13 }}>Aviso Legal • Privacidad • Términos • Cookies</div>
        <p style={{ fontSize: 11, color: "#444" }}>FarmaCerca 24 h solo informa de disponibilidad.<br/>La venta y dispensación la realiza la farmacia autorizada.</p>
      </div>
    </main>
  );
}
