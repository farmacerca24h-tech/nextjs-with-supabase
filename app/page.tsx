"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
type FarmaciaRow = { pharmacy_key: string; titular: string; direccion: string; codigo_postal: string; localidad: string; sector: string; horario_habitual: string; service_status: string; };
type GuardiaRow = { id: number; fecha: string; localidad: string; sector: string; direccion: string; tipo_guardia: string; horario: string; titular: string; };
function getAhoraMadrid(): { fecha: string; horaDecimal: number; diaMes: string } {
  const ahora = new Date();
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(ahora);
  const getPart = (t: string) => partes.find((p) => p.type === t)?.value || "00";
  const horaDecimal = Number(getPart("hour")) + Number(getPart("minute")) / 60;
  const fecha = `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
  const diaMes = `${Number(getPart("day"))}/${Number(getPart("month"))}`;
  return { fecha, horaDecimal, diaMes };
}
function getFechaGuardiaActivaMadrid(): string {
  const { fecha, horaDecimal } = getAhoraMadrid();
  if (horaDecimal < 9.5) { const d = new Date(fecha + "T12:00:00"); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }
  return fecha;
}
const TELEFONO_PRUEBA = "34634467345";
const FESTIVOS_LOCALES: { [key: string]: string[] } = { "Málaga": ["19/8", "8/9"], "Coín": ["4/5", "1/6"], "Guaro": ["18/5", "31/8"], "Alhaurín de la Torre": ["20/1", "24/6"], "Alhaurín el Grande": ["29/5", "1/6"], "Comares": ["12/1", "25/5"], "Antequera": ["21/8", "8/9"], "Villanueva de Algaidas": ["15/5", "8/9"], "Campillos": ["10/7", "17/8"], "Jimera de Líbar": ["7/8", "10/8"], "Ronda": ["24/1", "3/9"], "Yunquera": ["4/6", "7/10"], "Montecorto": ["16/7", "16/10"], "Pujerra": ["13/6", "3/11"], "Faraján": ["10/8", "9/12"], "Júzcar": ["19/3", "6/4"], "Benadalid": ["27/4", "7/10"], "Carratraca": ["17/8", "7/9"], "Marbella": ["11/6", "19/10"], "Torremolinos": ["16/7", "29/9"], "Benalmádena": ["24/6", "16/7"], "Benalmádena Costa": ["24/6", "16/7"], "Arroyo de la Miel": ["24/6", "16/7"], "Fuengirola": ["16/7", "7/10"], "Mijas": ["8/9", "15/10"], "Mijas Costa": ["8/9", "15/10"], "Las Lagunas": ["8/9", "15/10"], "Vélez-Málaga": ["24/6", "29/9"], "Torre del Mar": ["24/6", "29/9"], "Caleta de Vélez": ["24/6", "29/9"], "Almayate": ["24/6", "29/9"], "Benajarafe": ["24/6", "29/9"], "Torre de Benagalbón": ["24/6", "29/9"], "Almáchar": ["4/5", "27/7"], "Torrox": ["5/8", "2/10"], "Nerja": ["15/5", "24/6"], "Rincón de la Victoria": ["2/2", "16/7"], "Cuevas del Becerro": ["7/1", "31/8"], "Pizarra": ["15/5", "19/8"], "Campanillas": ["19/8", "8/9"], "Álora": ["7/8", "8/9"], "Estepona": ["15/5", "16/7"], "San Pedro Alcántara": ["11/6", "19/10"], "Benahavís": ["17/8", "7/10"], "El Burgo": ["6/4", "28/8"] };
const FESTIVOS_GENERALES = ["1/1", "6/1", "28/2", "2/4", "3/4", "1/5", "15/8", "12/10", "2/11", "7/12", "8/12", "25/12"];
export default function Page() {
  const [vista, setVista] = useState<"cliente" | "farmacia">("cliente");
  const [localidad, setLocalidad] = useState("");
  const [busquedaCiudad, setBusquedaCiudad] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [diurno, setDiurno] = useState(true);
  const [guardia, setGuardia] = useState(false);
  const [festivo, setFestivo] = useState(false);
  const [texto, setTexto] = useState("");
  const [productos, setProductos] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  const [respuestas, setRespuestas] = useState<{ [key: number]: string }>({});
  const [farmaciasDb, setFarmaciasDb] = useState<FarmaciaRow[]>([]);
  const [guardiasReales, setGuardiasReales] = useState<GuardiaRow[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorCiudad, setErrorCiudad] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [enviadasA, setEnviadasA] = useState<string[]>([]);
  const [mostrarDesplegableFarmacias, setMostrarDesplegableFarmacias] = useState(true);
  const [busquedaFarmacia, setBusquedaFarmacia] = useState("");
  useEffect(() => {
    const cargarDatos = async () => {
      setCargandoDatos(true);
      const fechaActiva = getFechaGuardiaActivaMadrid();
      const [farmRes, guardRes] = await Promise.all([
        supabase.from("farmacias_malaga").select("pharmacy_key, titular, direccion, codigo_postal, localidad, sector, horario_habitual, service_status").order("localidad", { ascending: true }).range(0, 999),
        supabase.from("guardias_malaga").select("id, fecha, localidad, sector, direccion, tipo_guardia, horario, titular").eq("fecha", fechaActiva).order("tipo_guardia", { ascending: true }),
      ]);
      if (!farmRes.error && farmRes.data) setFarmaciasDb(farmRes.data as FarmaciaRow[]);
      if (!guardRes.error && guardRes.data) setGuardiasReales(guardRes.data as GuardiaRow[]);
      setCargandoDatos(false);
    };
    cargarDatos();
  }, []);
  useEffect(() => {
    const { horaDecimal, diaMes } = getAhoraMadrid();
    const festivosDeEsaCiudad = FESTIVOS_LOCALES[localidad] || [];
    const esFestivo = FESTIVOS_GENERALES.includes(diaMes) || festivosDeEsaCiudad.includes(diaMes);
    if (esFestivo) { setFestivo(true); setDiurno(false); setGuardia(true); }
    else if (horaDecimal >= 9 && horaDecimal < 21.5) { setDiurno(true); setGuardia(false); setFestivo(false); }
    else { setDiurno(false); setGuardia(true); setFestivo(false); }
  }, [localidad]);
  const modoSoloGuardia = guardia && !diurno;
  const farmaciasLista: string[][] = farmaciasDb.map((f) => [f.titular || "Farmacia", f.localidad, `${f.direccion}${f.codigo_postal ? ` - ${f.codigo_postal}` : ""}`, f.service_status !== "STANDARD" ? f.horario_habitual : "", f.pharmacy_key]);
  const guardiasLista: string[][] = guardiasReales.map((g) => [g.titular || (g.tipo_guardia === "24H" ? "Farmacia de Guardia 24H" : "Farmacia Horario Ampliado"), g.localidad, `${g.direccion}${g.sector ? ` (${g.sector})` : ""}`, g.horario, `guardia-${g.id}`]);
  const listaActiva = modoSoloGuardia ? guardiasLista : farmaciasLista;
  const localidades = Array.from(new Set([...farmaciasLista.map((f) => f[1]), ...guardiasLista.map((g) => g[1])])).sort();
  const horario = [diurno ? "Diurno" : "", guardia ? "De guardia" : "", festivo ? "Festivo" : ""].filter(Boolean).join(", ") || "Diurno";
  const filtradas = listaActiva.filter((f) => !localidad || f[1] === localidad);
  const tres = filtradas;
  const normalizar = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const sugerencias = busquedaCiudad.trim() === "" ? localidades : localidades.filter((l) => normalizar(l).includes(normalizar(busquedaCiudad)));
  const farmaciasFiltradasDesplegable = busquedaFarmacia.trim() === "" ? filtradas : filtradas.filter((f) => normalizar(f[0] + " " + f[2]).includes(normalizar(busquedaFarmacia)));
  const seleccionadasLista = filtradas.filter((f) => seleccionadas.includes(f[4]));
  const elegirCiudad = (ciudad: string) => { setLocalidad(ciudad); setBusquedaCiudad(ciudad); setMostrarSugerencias(false); setEnviado(false); setErrorCiudad(false); setSeleccionadas([]); setEnviadasA([]); setBusquedaFarmacia(""); setMostrarDesplegableFarmacias(true); };
  const pedirCiudad = () => { if (!localidad) { setErrorCiudad(true); setMostrarSugerencias(true); setTimeout(() => setErrorCiudad(false), 3000); return false; } setErrorCiudad(false); return true; };
  const toggleSeleccion = (key: string) => { if (seleccionadas.includes(key)) setSeleccionadas(seleccionadas.filter((x) => x !== key)); else setSeleccionadas([...seleccionadas, key]); };
  const enviarAUna = (f: string[]) => { if (!pedirCiudad()) return; if (!seleccionadas.includes(f[4])) { alert("Marca primero la casilla de esta farmacia en el desplegable para enviarle solo a ella."); return; } setEnviado(true); if (!enviadasA.includes(f[4])) setEnviadasA([...enviadasA, f[4]]); const textoPlano = `Hola ${f[0]}, soy cliente de FarmaCerca 24h de ${localidad || f[1]}. Horario: ${horario}. Necesito: ${productos.join(", ") || texto.trim() || "Consulta general"}. ¿Lo tenéis en stock? Gracias. Contesta con: TENGO / NO TENGO / BAJO PEDIDO`; window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(textoPlano)}`, "_blank"); };
  const enviar = () => { if (!pedirCiudad()) return; if (texto.trim()) { setProductos([...productos, texto.trim()]); setTexto(""); } setEnviado(true); const lista = texto.trim() ? [...productos, texto.trim()] : productos; const textoPlano = `Hola, soy FarmaCerca 24h. Cliente en ${localidad} (${horario}) pregunta:\n` + (lista.length ? lista.map((p) => `- ${p}`).join("\n") : `- Consulta general`) + `\nContesta con: TENGO / NO TENGO / BAJO PEDIDO`; window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(textoPlano)}`, "_blank"); };
  const buscarCercanas = () => { if (!pedirCiudad()) return; setGuardia(false); setDiurno(true); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("farmacias en " + localidad)}`, "_blank"); };
  const buscarGuardia = () => { if (!pedirCiudad()) return; setGuardia(true); setDiurno(false); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("farmacia de guardia en " + localidad)}`, "_blank"); };
  const rosa = errorCiudad && !localidad;
  return (
    <main style={{ maxWidth: 480, width: "100%", margin: "0 auto", padding: 12, fontFamily: "sans-serif", background: "#fff", boxSizing: "border-box", overflowX: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box" }}>
        <img src="/logo.png" alt="Farmacerca 24h - A un mensaje de ti" style={{ height: "80px", width: "auto", maxWidth: "100%", display: "block" }} />
        <button onClick={() => alert("Para descargar el acceso directo: en tu móvil pulsa Compartir y luego Añadir a pantalla de inicio.")} style={{ background: "#0090ff", color: "#fff", border: "none", padding: "12px 12px", borderRadius: 10, fontWeight: "bold", fontSize: 14, width: "100%", boxSizing: "border-box", whiteSpace: "normal", textAlign: "center" }}>⬇ Descargar acceso directo</button>
      </div>
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <button onClick={() => setVista("cliente")} style={{ flex: 1, padding: 10, borderRadius: 10, background: vista === "cliente" ? "#16a34a" : "#eee", color: vista === "cliente" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}>👤 Soy CLIENTE</button>
        <button onClick={() => setVista("farmacia")} style={{ flex: 1, padding: 10, borderRadius: 10, background: vista === "farmacia" ? "#0ea5e9" : "#eee", color: vista === "farmacia" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}>🏪 Soy FARMACIA (Prueba)</button>
      </div>
      {vista === "cliente" && (
        <>
          <p style={{ fontWeight: "bold", margin: "8px 0 4px", fontSize: 18 }}>1º Elige tu ciudad o pedanía:</p>
          <div style={{ position: "relative", width: "100%" }}>
            <input value={busquedaCiudad} onChange={(e) => { setBusquedaCiudad(e.target.value); setMostrarSugerencias(true); setErrorCiudad(false); if (e.target.value === "") setLocalidad(""); }} onFocus={() => setMostrarSugerencias(true)} placeholder="🔍 Escribe tu ciudad... ej: Marbella" style={{ width: "100%", padding: 14, borderRadius: 12, border: rosa ? "3px solid #ec4899" : "2px solid #16a34a", fontSize: 16, background: rosa ? "#fce7f3" : "#f0fdf4", boxSizing: "border-box" }} />
            {localidad && <button onClick={() => { setLocalidad(""); setBusquedaCiudad(""); setSeleccionadas([]); setEnviadasA([]); }} style={{ position: "absolute", right: 10, top: 10, background: "#eee", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: 14 }}>❌</button>}
            {mostrarSugerencias && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "2px solid #16a34a", borderTop: "none", borderRadius: "0 0 12px 12px", maxHeight: 220, overflowY: "auto", zIndex: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                {sugerencias.length === 0 && <div style={{ padding: 12, fontSize: 14, color: "#666" }}>No hay ninguna ciudad con ese nombre. Prueba con otra.</div>}
                {sugerencias.map((l) => (
                  <div key={l} onClick={() => elegirCiudad(l)} style={{ padding: "12px 14px", borderBottom: "1px solid #eee", fontSize: 16, cursor: "pointer", background: localidad === l ? "#f0fdf4" : "#fff", fontWeight: localidad === l ? "bold" : "normal" }}>📍 {l} <span style={{ color: "#16a34a", fontSize: 13 }}>({listaActiva.filter((f) => f[1] === l).length})</span></div>
                ))}
              </div>
            )}
          </div>
          {rosa && (<p style={{ background: "#fce7f3", border: "2px solid #ec4899", color: "#9d174d", padding: 10, borderRadius: 10, fontSize: 14, fontWeight: "bold", margin: "8px 0 0", textAlign: "center" }}>💗 ¡Elige primero tu ciudad o pedanía aquí arriba! 💗<br /><span style={{ fontWeight: "normal", fontSize: 13 }}>Sin ciudad no puedes escribir ni ver farmacias.</span></p>)}
          {localidad && <p style={{ fontSize: 13, color: "#16a34a", fontWeight: "bold", margin: "6px 0 0" }}>✅ Has elegido: {localidad} ({listaActiva.filter((f) => f[1] === localidad).length} farmacias)</p>}
          <p style={{ fontWeight: "bold", margin: "12px 0 6px", fontSize: 17 }}>Para el Chat, marcar si estamos en horario:</p>
          {guardia && !festivo && <p style={{ background: "#fef3c7", border: "1px solid #f59e0b", padding: 8, borderRadius: 8, fontSize: 13, margin: "6px 0" }}>🌙 Es de noche: las farmacias diurnas ya han cerrado. Se marcará solo <b>De guardia</b> para que solo escribas a las de guardia.</p>}
          {festivo && <p style={{ background: "#fee2e2", border: "1px solid #ef4444", padding: 8, borderRadius: 8, fontSize: 13, margin: "6px 0" }}>📅 Hoy es <b>Festivo en {localidad || "tu ciudad"}</b>: las farmacias diurnas están cerradas. Solo quedan las de guardia.</p>}
          <div style={{ display: "flex", flexWrap: "nowrap", justifyContent: "space-between", alignItems: "center", gap: 4, width: "100%", boxSizing: "border-box", fontSize: 13, fontWeight: "bold" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", flexShrink: 0 }}><input type="checkbox" checked={diurno} onChange={() => setDiurno(!diurno)} style={{ width: 18, height: 18, margin: 0 }} /> ☀️ Diurno</label>
            <label style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", flexShrink: 0 }}><input type="checkbox" checked={guardia} onChange={() => setGuardia(!guardia)} style={{ width: 18, height: 18, margin: 0 }} /> 🌙 Guardia</label>
            <label style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", flexShrink: 0 }}><input type="checkbox" checked={festivo} onChange={() => setFestivo(!festivo)} style={{ width: 18, height: 18, margin: 0 }} /> 📅 Festivo</label>
          </div>
          <h3 style={{ color: localidad ? "#16a34a" : "#999", fontSize: 22, margin: "14px 0 8px" }}>💬 Chat de consulta {!localidad && "🔒"}</h3>
          <div onClick={() => { if (!localidad) pedirCiudad(); }} style={{ display: "flex", border: `2px solid ${rosa ? "#ec4899" : localidad ? "#16a34a" : "#ccc"}`, borderRadius: 12, overflow: "hidden", background: rosa ? "#fce7f3" : localidad ? "#f0fdf4" : "#f5f5f5", width: "100%", boxSizing: "border-box" }}>
            <input value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { if (!pedirCiudad()) return; enviar(); } }} onFocus={() => { if (!localidad) pedirCiudad(); }} placeholder={localidad ? "🔍 ¿Qué necesitas? Escribe el producto..." : "🔒 Primero elige tu ciudad arriba..."} style={{ flex: 1, minWidth: 0, padding: 14, border: "none", background: "transparent", fontSize: 16 }} />
            <button onClick={() => { if (!pedirCiudad()) return; enviar(); }} style={{ background: localidad ? "#16a34a" : "#ec4899", color: "#fff", border: "none", padding: "0 22px", fontWeight: "bold", fontSize: 18, whiteSpace: "nowrap" }}>Enviar</button>
          </div>
          {rosa && <p style={{ color: "#be185d", fontSize: 13, fontWeight: "bold", margin: "6px 0 0" }}>💗 No puedes escribir todavía. Elige tu ciudad arriba.</p>}
          {productos.map((p, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", background: "#f0fdf4", padding: 10, borderRadius: 10, marginTop: 8, border: "1px solid #bbf7d0" }}><span>💊 {p}</span><button onClick={() => setProductos(productos.filter((_, x) => x !== i))} style={{ border: "none", background: "none", fontSize: 16 }}>❌</button></div>))}
          <p style={{ fontWeight: "bold", fontSize: 14, margin: "10px 0 2px" }}><span style={{ color: "#16a34a" }}>✓</span> en stock &nbsp; <span style={{ color: "#dc2626" }}>✗</span> Sin stock &nbsp; 👁 otro &nbsp; ✏️ Bajo pedido</p>
          {!localidad ? (
            <div style={{ border: "2px dashed #ec4899", borderRadius: 10, padding: 14, marginTop: 8, textAlign: "center", background: rosa ? "#fce7f3" : "#fffbeb" }}><p style={{ fontSize: 16, fontWeight: "bold", margin: 0, color: "#9d174d" }}>💗 Elige tu ciudad o pedanía</p><p style={{ fontSize: 13, margin: "6px 0 0" }}>Aquí saldrán las farmacias cuando elijas tu ciudad en el buscador de arriba.</p></div>
          ) : (
            <>
              <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", borderRadius: 12, padding: 10, marginTop: 8 }}>
                <button onClick={() => setMostrarDesplegableFarmacias(!mostrarDesplegableFarmacias)} style={{ width: "100%", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", padding: 0 }}>
                  <p style={{ fontWeight: "bold", fontSize: 16, margin: "0 0 4px", color: "#000" }}>2º Elige a qué farmacias enviar {mostrarDesplegableFarmacias ? "▲" : "▼"}</p>
                  <p style={{ fontSize: 13, margin: "0", color: "#333" }}>Todas las farmacias de {localidad} ({filtradas.length}) - Marca con ☑️ las que quieras. Las elegidas se ponen en verde.</p>
                </button>
                {seleccionadas.length > 0 && <p style={{ fontSize: 13, fontWeight: "bold", color: "#16a34a", margin: "8px 0 0" }}>✅ Has seleccionado {seleccionadas.length} farmacia{seleccionadas.length > 1 ? "s" : ""} {enviadasA.length > 0 ? `• Ya enviado a ${enviadasA.length}` : ""}</p>}
                {seleccionadas.length === 0 && <p style={{ fontSize: 12, color: "#666", margin: "8px 0 0" }}>Todavía no has marcado ninguna. Abre el desplegable y marca la casilla.</p>}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button onClick={() => setSeleccionadas(filtradas.map((f) => f[4]))} style={{ flex: 1, background: "#16a34a", color: "#fff", border: "none", padding: "8px 4px", borderRadius: 8, fontWeight: "bold", fontSize: 12 }}>☑️ Seleccionar todas</button>
                  <button onClick={() => setSeleccionadas([])} style={{ flex: 1, background: "#fff", color: "#333", border: "1.5px solid #ccc", padding: "8px 4px", borderRadius: 8, fontWeight: "bold", fontSize: 12 }}>Quitar selección</button>
                </div>
                {mostrarDesplegableFarmacias && (
                  <div style={{ marginTop: 10 }}>
                    <input value={busquedaFarmacia} onChange={(e) => setBusquedaFarmacia(e.target.value)} placeholder="🔍 Buscar farmacia por nombre o calle..." style={{ width: "100%", padding: 10, borderRadius: 10, border: "1.5px solid #16a34a", fontSize: 14, boxSizing: "border-box", background: "#fff" }} />
                    <div style={{ maxHeight: 300, overflowY: "auto", marginTop: 8, border: "1.5px solid #16a34a", borderRadius: 10, background: "#fff", overflow: "hidden" }}>
                      {farmaciasFiltradasDesplegable.length === 0 && <div style={{ padding: 12, fontSize: 13, color: "#666" }}>No hay farmacias con ese nombre en {localidad}.</div>}
                      {farmaciasFiltradasDesplegable.map((f, idx) => { const esta = seleccionadas.includes(f[4]); return (<label key={f[4] + idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 10px", borderBottom: "1px solid #eee", cursor: "pointer", background: esta ? "#bbf7d0" : "#fff" }}><input type="checkbox" checked={esta} onChange={() => toggleSeleccion(f[4])} style={{ width: 24, height: 24, minWidth: 24, marginTop: 2, accentColor: "#16a34a" }} /><span style={{ flex: 1 }}><b style={{ fontSize: 14, display: "block", lineHeight: 1.2 }}>{f[0]}</b><span style={{ fontSize: 12, color: "#555", display: "block", marginTop: 2 }}>📍 {f[2]}</span>{f[3] && <span style={{ fontSize: 12, color: "#0369a1", fontWeight: "bold" }}>🕒 {f[3]}</span>}{esta && <span style={{ fontSize: 12, color: "#166534", fontWeight: "bold", display: "block" }}>✅ Elegida</span>}</span><span style={{ fontSize: 20 }}>{esta ? "☑️" : "⬜"}</span></label>); })}
                    </div>
                    <button onClick={() => setMostrarDesplegableFarmacias(false)} style={{ width: "100%", background: "#16a34a", color: "#fff", border: "none", padding: "10px", borderRadius: 10, fontWeight: "bold", marginTop: 8, fontSize: 14 }}>✅ Listo, cerrar desplegable</button>
                  </div>
                )}
              </div>
              <h3 style={{ color: "#16a34a", fontSize: 18, margin: "12px 0 6px" }}>{cargandoDatos ? "⏳ Cargando farmacias actualizadas..." : seleccionadas.length === 0 ? `💬 Marca farmacias en el desplegable de arriba` : `💬 Tus farmacias elegidas en ${localidad} (${seleccionadasLista.length})`}</h3>
              {seleccionadas.length === 0 && (<div style={{ border: "2px dashed #16a34a", borderRadius: 10, padding: 14, textAlign: "center", background: "#f0fdf4" }}><p style={{ fontSize: 14, fontWeight: "bold", margin: 0 }}>👆 Marca primero en el desplegable de arriba</p><p style={{ fontSize: 13, margin: "6px 0 0" }}>Ahí están todas las farmacias de {localidad}. Cuando las marques en verde, aparecerán aquí abajo para enviarles una a una.</p></div>)}
              {seleccionadasLista.map((f, idx) => { const yaEnviada = enviadasA.includes(f[4]); return (<div key={f[4]} style={{ border: "2.5px solid #16a34a", borderRadius: 10, padding: 8, marginBottom: 8, display: "flex", gap: 8, boxSizing: "border-box", minHeight: 132, alignItems: "stretch", background: "#f0fdf4" }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><div style={{ background: "#16a34a", color: "#fff", width: 32, height: 32, minWidth: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18 }}>{idx + 1}</div><span style={{ fontSize: 20 }}>☑️</span><button onClick={() => toggleSeleccion(f[4])} style={{ background: "#fff", border: "1px solid #ccc", borderRadius: 6, fontSize: 11, padding: "4px 6px" }}>Quitar ❌</button></div><div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}><div><b style={{ fontSize: 14, lineHeight: 1.2, display: "block" }}>{f[0]}</b><span style={{ fontSize: 12, lineHeight: 1.3, display: "block", marginTop: 3 }}>📍 {f[2]} - {f[1]}</span>{f[3] && <><span style={{ fontSize: 12, color: "#0369a1", fontWeight: "bold" }}>🕒 {f[3]}</span><br /></>}{yaEnviada && <span style={{ fontSize: 12, color: "#16a34a", fontWeight: "bold" }}>✅ Ya enviado a esta</span>}</div><button onClick={() => enviarAUna(f)} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 8, fontWeight: "bold", marginTop: 8, fontSize: 13, alignSelf: "flex-start" }}>💬 {yaEnviada ? "Volver a enviar" : "Enviar solo a esta"}</button></div><div style={{ borderLeft: "1.5px solid #ccc", paddingLeft: 8, width: 118, minWidth: 118, display: "flex", flexDirection: "column", justifyContent: "space-between" }}><div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, fontSize: 12, lineHeight: 1.3 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}><span style={{ flex: 1, textAlign: "left" }}>{productos[0] || "Ibuprofeno 600mg"}</span><span style={{ color: "#16a34a", fontWeight: "bold", fontSize: 16, minWidth: 18, textAlign: "center" }}>✓</span></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}><span style={{ flex: 1, textAlign: "left" }}>{productos[1] || "Paracetamol 1g"}</span><span style={{ fontSize: 14, minWidth: 18, textAlign: "center" }}>✏️</span></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}><span style={{ flex: 1, textAlign: "left" }}>{productos[2] || "Crema"}</span><span style={{ fontSize: 14, minWidth: 18, textAlign: "center" }}>👁</span></div></div><button onClick={() => { if (!pedirCiudad()) return; window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Farmacia " + f[0] + " " + f[2])}`, "_blank"); }} style={{ background: "#0090ff", color: "#fff", border: "none", padding: "7px 6px", borderRadius: 8, marginTop: 8, fontWeight: "bold", width: "100%", fontSize: 12 }}>✈ Cómo llegar</button></div></div>); })}
            </>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
            <button onClick={() => { if (!pedirCiudad()) return; buscarGuardia(); }} style={{ flex: 1, padding: 8, borderRadius: 10, fontWeight: "bold", background: rosa ? "#fce7f3" : "#dbeafe", border: `1.5px solid ${rosa ? "#ec4899" : "#0090ff"}`, fontSize: 13, color: rosa ? "#9d174d" : "#000" }}>🌙 Farmacias de guardia →<br /><span style={{ fontWeight: "normal", fontSize: 11 }}>{localidad ? "Guardias de hoy en Maps" : "💗 Elige ciudad primero"}</span></button>
            <button onClick={() => { if (!pedirCiudad()) return; buscarCercanas(); }} style={{ flex: 1, padding: 8, borderRadius: 10, fontWeight: "bold", background: rosa ? "#fce7f3" : "#e6f7ee", border: `1.5px solid ${rosa ? "#ec4899" : "#16a34a"}`, fontSize: 13, color: rosa ? "#9d174d" : "#000" }}>📍 Farmacias cercanas →<br /><span style={{ fontWeight: "normal", fontSize: 11 }}>{localidad ? "Cerca de ti en Maps" : "💗 Elige ciudad primero"}</span></button>
          </div>
          <div style={{ background: "#e6f7ee", border: "1.5px solid #16a34a", borderRadius: 10, padding: 8, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}><div style={{ fontSize: 13 }}><b>Contacto FarmaCerca 24 h</b><br /><span style={{ fontSize: 12 }}>¿Dudas o ayuda? Pulsa para escribirnos.</span></div><button onClick={() => window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent("Hola FarmaCerca 24h, tengo una duda, ¿me ayudáis?")}`, "_blank")} style={{ background: "#fff", color: "#16a34a", border: "1.5px solid #16a34a", padding: "6px 10px", borderRadius: 8, fontWeight: "bold", fontSize: 13, whiteSpace: "nowrap" }}>💬 Chat →</button></div>
            <div style={{ background: "#fff", border: "1px solid #16a34a", borderRadius: 8, padding: 8, marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 13 }}><span>✉️ E-mail: contacto@farmacerca24h.es</span><span style={{ color: "#16a34a", fontWeight: "bold" }}>Pulsa →</span></div>
          </div>
        </>
      )}
      {vista === "farmacia" && (
        <div>
          <p style={{ background: "#e0f2fe", padding: 10, borderRadius: 10 }}>🏪 <b>Vista FARMACIA - Prueba</b><br />Te ha llegado este WhatsApp al 634467345:</p>
          <div style={{ background: "#dcfce7", padding: 12, borderRadius: 12 }}><b>Hola, soy FarmaCerca 24h.</b><br />Cliente en {localidad || "Málaga"} ({horario}) pregunta:<br />{productos.length === 0 ? <i>- (Ejemplo) Ibuprofeno 600mg - escribe un producto como cliente primero</i> : productos.map((p, i) => <div key={i}>- {p}</div>)}<p><b>¿Lo tienes? Pulsa una opción:</b></p></div>
          {seleccionadasLista.slice(0, 3).map((f, idx) => (<div key={idx} style={{ border: "1px solid #ccc", borderRadius: 12, padding: 10, marginTop: 10 }}><b>{idx + 1}. {f[0]} - {f[1]}</b><div style={{ display: "flex", gap: 6, marginTop: 8 }}><button onClick={() => { setRespuestas({ ...respuestas, [idx]: "✅ TENGO" }); setVista("cliente"); }} style={{ flex: 1, padding: 10, background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontWeight: "bold" }}>✅ TENGO</button><button onClick={() => { setRespuestas({ ...respuestas, [idx]: "❌ NO TENGO" }); setVista("cliente"); }} style={{ flex: 1, padding: 10, background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontWeight: "bold" }}>❌ NO TENGO</button><button onClick={() => { setRespuestas({ ...respuestas, [idx]: "✏️ BAJO PEDIDO" }); setVista("cliente"); }} style={{ flex: 1, padding: 10, background: "#f59e0b", color: "#fff", border: "none", borderRadius: 10, fontWeight: "bold" }}>✏️ PEDIDO</button></div></div>))}
          {seleccionadasLista.length === 0 && tres.slice(0, 3).map((f, idx) => (<div key={idx} style={{ border: "1px solid #ccc", borderRadius: 12, padding: 10, marginTop: 10 }}><b>{idx + 1}. {f[0]} - {f[1]}</b><div style={{ display: "flex", gap: 6, marginTop: 8 }}><button onClick={() => { setRespuestas({ ...respuestas, [idx]: "✅ TENGO" }); setVista("cliente"); }} style={{ flex: 1, padding: 10, background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontWeight: "bold" }}>✅ TENGO</button><button onClick={() => { setRespuestas({ ...respuestas, [idx]: "❌ NO TENGO" }); setVista("cliente"); }} style={{ flex: 1, padding: 10, background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontWeight: "bold" }}>❌ NO TENGO</button><button onClick={() => { setRespuestas({ ...respuestas, [idx]: "✏️ BAJO PEDIDO" }); setVista("cliente"); }} style={{ flex: 1, padding: 10, background: "#f59e0b", color: "#fff", border: "none", borderRadius: 10, fontWeight: "bold" }}>✏️ PEDIDO</button></div></div>))}
        </div>
      )}
      <footer style={{ textAlign: "center", padding: "12px 0 6px" }}>
        <img src="/logo.png" alt="Farmacerca 24h - A un mensaje de ti" style={{ height: "62px", width: "auto", display: "block", margin: "0 auto" }} />
        <div style={{ background: "#e6f7ee", border: "1.5px solid #16a34a", borderRadius: 16, padding: 8, margin: "8px 0", fontWeight: "bold", fontSize: 13 }}>Aviso Legal &nbsp;•&nbsp; Privacidad &nbsp;•&nbsp; Términos &nbsp;•&nbsp; Cookies</div>
        <p style={{ fontSize: 12 }}>Farmacerca 24 h solo informa de disponibilidad.<br />La venta y dispensación la realiza la farmacia autorizada.</p>
        <p style={{ fontSize: 11, color: "#666" }}>{farmaciasLista.length} farmacias • {localidades.length} ciudades y pedanías</p>
      </footer>
    </main>
  );
}
