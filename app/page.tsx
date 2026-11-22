"use client";
import { useState, useEffect } from "react";

const TELEFONO_PRUEBA = "34634467345"; // 634467345 para pruebas
const FARMACIAS: string[][] = [
  ["AGUILAR HURTADO FELISA", "Málaga", "C/ TOMÁS HEREDIA, 23 - 29001"],
  ["LEDRO CARABAÑO BLANCA", "Málaga", "C/ PASEO MARÍTIMO ANTONIO MACHADO, 60 - 29002"],
  ["MUÑOZ ESTRADA CARMEN", "Málaga", "C/ SOR TERESA PRAT, 54 - 29003"],
  ["CASTRO ROSALES MANUEL DE", "Málaga", "C/ CAMINO DEL PATIO, 21 EDIFICIO LAS PIRÁMIDES - 29004"],
  ["FAJARDO PAREDES PALOMA CRISTINA", "Málaga", "C/ PICO DE LAS PALOMAS, 34-36 - 29005"],
  ["RICO NISTAVES MARIA CRISTINA", "Málaga", "C/ PUERTA DEL MAR NUM. 5 Y 7 - 29005"],
  ["AMARES LABRADOR MARIA ESTELA", "Málaga", "C/ ORTEGA Y GASSET, 80 - 29006"],
  ["JURADO RUIZ ELVIRA PATRICIA - RUIZ LOBATO Mª ANGELES", "Málaga", "C/ AVDA. ANDALUCIA, 7C - HORACIO LENGO, 19 - 29006"],
  ["GARCÍA DELGADO PILAR", "Málaga", "C/ AV. JOSE ORTEGA Y GASSET, 190 - 29006"],
  ["CHACÓN AGUILAR ISABEL", "Málaga", "C/ CAPITÁN HUELIN, 40 - 29007"],
  ["RODRÍGUEZ SIERRAS FRANCISCO JOSE", "Málaga", "C/ DON JUAN DE AUSTRIA, 32 - 29007"],
  ["MACHADO REYERO Mª PRESENTACIÓN Y Mª ELENA", "Málaga", "C/ MÁLAGA, 156 - 29007"],
  ["HURTADO RUIZ EMILIO - GONZÁLEZ BALBA AGUEDA", "Málaga", "C/ ORIÓN MELLES, 8 - 29007"],
  ["ZAMORANO TORO MARIA INMACULADA", "Málaga", "C/ POETA XIMÉNEZ MOLINA, 1 BAJO, SAN MARTÍN - 29007"],
  ["SÁNCHEZ COBOS CONCEPCIÓN", "Málaga", "C/ AV. JOSE RIBERA 16, COLONIA STA. INÉS - 29007"],
  ["GALLARDO DE LA CUEVA MATILDE", "Málaga", "C/ INGENIERO CARLOS MAYA, 58 - 29007"],
  ["HERMOSO SÁNCHEZ JAVIER MANUEL", "Málaga", "C/ CAMINO DE SUÁREZ, 99 - 29007"],
  ["MUÑOZ FERNÁNDEZ ELISA", "Málaga", "C/ FERNANDO ROSILLO, 1 - 29007"],
  ["PICO NISTAVES MARIA CONCEPCIÓN", "Málaga", "C/ ANTONIO LUIS, 1 Y 10 - 29007"],
  // --- AQUÍ SIGUE EL RESTO DE TU LISTA DE 273 LÍNEAS ---
  // Pega aquí el resto de tus líneas tal cual, en el mismo formato:
  // ["NOMBRE", "Málaga", "C/ DIRECCIÓN - CP"],
];

const MAX_CONSULTAS_DIA = 10;

export default function Page() {
  const [zona, setZona] = useState("Málaga");
  const [horario, setHorario] = useState<"diurno" | "festivo" | "guardia">("diurno");
  const [producto, setProducto] = useState("");
  const [resultados, setResultados] = useState<string[][]>([]);
  const [mensaje, setMensaje] = useState("");
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [quedan, setQuedan] = useState(10);
  const [bajaNombre, setBajaNombre] = useState("");
  const [bajaTelefono, setBajaTelefono] = useState("");
  const [mensajeBaja, setMensajeBaja] = useState("");

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    const datos = JSON.parse(localStorage.getItem("consultasFarmaCerca") || '{"fecha":"","count":0}');
    if (datos.fecha !== hoy) setQuedan(10);
    else setQuedan(10 - datos.count);
  }, []);

  function puedeConsultar() {
    const hoy = new Date().toISOString().slice(0, 10);
    const datos = JSON.parse(localStorage.getItem("consultasFarmaCerca") || '{"fecha":"","count":0}');
    if (datos.fecha !== hoy) {
      localStorage.setItem("consultasFarmaCerca", JSON.stringify({ fecha: hoy, count: 0 }));
      return true;
    }
    return datos.count < 10;
  }

  function contarConsulta() {
    const hoy = new Date().toISOString().slice(0, 10);
    const datos = JSON.parse(localStorage.getItem("consultasFarmaCerca") || '{"fecha":"","count":0}');
    const nuevo = datos.fecha !== hoy ? { fecha: hoy, count: 1 } : { fecha: hoy, count: datos.count + 1 };
    localStorage.setItem("consultasFarmaCerca", JSON.stringify(nuevo));
    setQuedan(10 - nuevo.count);
  }

  function estaDeBaja(nombre: string) {
    const bajas = JSON.parse(localStorage.getItem("farmaciasDeBaja") || "[]");
    return bajas.some((b: any) => b.nombre.toLowerCase() === nombre.toLowerCase());
  }

  function darseDeBaja() {
    if (!bajaNombre || !bajaTelefono) { alert("Escribe tu nombre de farmacia y tu WhatsApp para darte de baja"); return; }
    if (!confirm("¿Seguro que quieres darte de baja? Ya no te llegarán consultas.")) return;
    const bajas = JSON.parse(localStorage.getItem("farmaciasDeBaja") || "[]");
    bajas.push({ nombre: bajaNombre, telefono: bajaTelefono, fecha: new Date().toISOString() });
    localStorage.setItem("farmaciasDeBaja", JSON.stringify(bajas));
    setMensajeBaja("Baja confirmada para " + bajaNombre + ". Ya no recibirás más consultas. Si quieres volver, escribe a contacto@farmacerca24h.es");
  }

  function buscar(tipo?: "diurno" | "festivo" | "guardia") {
    const h = tipo || horario;
    if (!puedeConsultar()) {
      setMensaje("⛔ Ya no puedes hacer más consultas hoy. Has llegado al máximo de 10 consultas al día. Vuelve mañana. Si es urgente, ve a tu farmacia de guardia más cercana.");
      return;
    }
    contarConsulta();
    setMensaje("");
    let lista = FARMACIAS.filter((f) => !estaDeBaja(f[0] || ""));
    setResultados(lista.slice(0, 3));
    if (lista.length === 0) setMensaje("No hay farmacias en " + zona + " para " + h + ". Prueba con Farmacias de guardia.");
  }

  function enviarA3() {
    if (!puedeConsultar()) { alert("Ya has hecho 10 consultas hoy."); return; }
    if (resultados.length === 0) { alert("Primero busca tu zona"); return; }
    resultados.forEach((f, i) => {
      setTimeout(() => {
        const texto = `Hola ${f[0]}, soy cliente de FarmaCerca 24h de ${zona}. Horario: ${horario}. Necesito: ${producto || "Consulta general"}. ¿Lo tenéis en stock? Gracias`;
        window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(texto)}`, "_blank");
      }, i * 5000);
    });
  }

  function chatUna(f: string[]) {
    if (!puedeConsultar()) { alert("Ya has hecho 10 consultas hoy."); return; }
    contarConsulta();
    const texto = `Hola ${f[0]}, soy cliente de FarmaCerca 24h de ${zona}. Horario: ${horario}. Necesito: ${producto || "Consulta general"}. ¿Lo tenéis en stock? Gracias`;
    window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(texto)}`, "_blank");
  }

  const textoHorario = horario === "diurno" ? "Día normal: solo farmacias normales de tu zona" : horario === "festivo" ? "Día fiesta: solo las abiertas por la fiesta" : "Noche: solo farmacias de guardia";
  const productosEjemplo = ["Ibuprofeno 600 mg - 1 caja", "Paracetamol 1 g - 1 caja", "Crema hidratante - 1 ud."];

  return (
    <div style={{ fontFamily: "Arial", maxWidth: 600, margin: "0 auto", padding: 12 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #00a651", paddingBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/logo.png" alt="FarmaCerca 24h" style={{ height: "48px", width: "auto" }} />
          <div style={{ fontSize: 13, fontWeight: "normal" }}>A un mensaje de ti</div>
        </div>
        <button style={{ background: "#0090ff", color: "#fff", border: 0, padding: "8px 12px", borderRadius: 8, fontWeight: "bold" }}>⬇ Descargar acceso directo</button>
      </header>

      <p><b>Elige:</b></p>
      <select value={zona} onChange={(e) => setZona(e.target.value)} style={{ width: "100%", padding: 12, border: "2px solid #00a651", borderRadius: 10, fontSize: 16 }}>
        <option value="Málaga">📍 Málaga</option>
        <option value="Alaró">📍 Alaró</option>
        <option value="Inca">📍 Inca</option>
        <option value="Manacor">📍 Manacor</option>
      </select>

      <p><b>Para el Chat, marcar si estamos en horario:</b></p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}><input type="checkbox" checked={horario === "diurno"} onChange={() => setHorario("diurno")} /> ☀️ Diurno</label>
        <label style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}><input type="checkbox" checked={horario === "guardia"} onChange={() => setHorario("guardia")} /> 🌙 De guardia</label>
        <label style={{ border: "1px solid #ddd", padding: 8, borderRadius: 8 }}><input type="checkbox" checked={horario === "festivo"} onChange={() => setHorario("festivo")} /> 📅 Festivo</label>
      </div>
      <small style={{ color: "#008040", fontWeight: "bold" }}>{textoHorario}</small>

      <h3 style={{ color: "#008040" }}>💬 Chat de consulta</h3>
      <div style={{ display: "flex", gap: 5 }}>
        <input value={producto} onChange={(e) => setProducto(e.target.value)} placeholder="🔍 ¿Qué necesitas? Escribe el producto..." style={{ flex: 1, padding: 12, border: "2px solid #00a651", borderRadius: "10px 0 0 10px", fontSize: 16 }} />
        <button onClick={() => buscar()} style={{ background: "#00a651", color: "#fff", border: 0, padding: "12px 18px", borderRadius: "0 10px 10px 0", fontWeight: "bold" }}>Enviar</button>
      </div>
      <p style={{ fontSize: 13, color: "#008040", fontWeight: "bold" }}>Te quedan {quedan} consultas hoy (máximo 10 al día)</p>
      {mensaje && <div style={{ border: "2px solid #c00", borderRadius: 12, padding: 15, background: "#fff5f5", textAlign: "center", fontWeight: "bold" }}>{mensaje}</div>}

      <p>✓ en stock &nbsp; ✗ Sin stock &nbsp; 👁 otro &nbsp; ✏️ Bajo pedido</p>
      <h3 style={{ color: "#008040" }}>💬 Obteniendo respuestas...</h3>

      {resultados.map((f, i) => (
        <div key={f[0] + i} style={{ border: "2px solid #00a651", borderRadius: 12, padding: 10, margin: "10px 0", display: "flex", gap: 10 }}>
          <div style={{ background: "#00a651", color: "#fff", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 20 }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <b>{f[0]}</b><br />📍 {f[2]} - {f[1]}<br />
            <button onClick={() => chatUna(f)} style={{ background: "#00c853", color: "#fff", border: 0, padding: "8px 14px", borderRadius: 8, fontWeight: "bold", marginRight: 6 }}>💬 Chat</button>
            <button onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(f[0] + " " + f[2])}`, "_blank")} style={{ background: "#0090ff", color: "#fff", border: 0, padding: "8px 14px", borderRadius: 8, fontWeight: "bold" }}>✈ Cómo llegar</button>
          </div>
          <div><small>{producto || "Consulta general"}<br />✓ en stock<br />✏️ Bajo pedido<br />👁 otro</small></div>
        </div>
      ))}

      {resultados.length > 0 && (
        <>
          <button onClick={enviarA3} style={{ width: "100%", background: "#00c853", color: "#fff", border: 0, padding: 15, borderRadius: 10, fontWeight: "bold", fontSize: 18 }}>ENVIAR A LAS 3 POR WHATSAPP</button>
          <button onClick={() => buscar()} style={{ width: "100%", padding: 12, marginTop: 8, borderRadius: 10, fontWeight: "bold" }}>BUSCAR EN OTRAS 3 →</button>
        </>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => buscar("guardia")} style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: "bold", background: "#dbeafe", border: "1px solid #0090ff" }}>🌙 Farmacias de guardia →</button>
        <button onClick={() => buscar("diurno")} style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: "bold", background: "#e6f7ee", border: "1px solid #00a651" }}>📍 Farmacias de la zona →</button>
      </div>

      <div style={{ background: "#e6f7ee", border: "2px solid #00a651", borderRadius: 12, padding: 12, marginTop: 12 }}>
        <b>Contacto FarmaCerca 24 h</b><br />¿Dudas o ayuda? Pulsa para escribirnos.
        <button onClick={() => window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent("Hola FarmaCerca 24h, tengo una duda, ¿me ayudáis?")}`, "_blank")} style={{ width: "100%", background: "#00c853", color: "#fff", border: 0, padding: 10, borderRadius: 8, fontWeight: "bold", marginTop: 8 }}>💬 Chat →</button>
        <div style={{ background: "#fff", border: "1px solid #ccc", borderRadius: 8, padding: 10, marginTop: 8 }}>✉️ E-mail: contacto@farmacerca24h.es</div>
      </div>

      <div style={{ borderTop: "4px solid #00a651", padding: 12, marginTop: 20, background: "#f9fffb" }}>
        <div style={{ background: "#0a8f2e", padding: 10, borderRadius: 10 }}><b style={{ color: "#fff" }}>💬 Vista FARMACIA - Prueba</b> / Te ha llegado este mensaje</div>
        <h2 style={{ color: "#008040", marginTop: 16 }}>NUEVA CONSULTA - CLIENTE Nº 1</h2>
        <p style={{ color: "#1a2a9a", fontWeight: "bold" }}>Marcar respuesta para el cliente:</p>
        {productosEjemplo.map((prod) => (
          <div key={prod} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, border: "1px solid #ddd", borderRadius: 10, marginTop: 8 }}>
            <div><b>{prod}</b></div>
            <div style={{ display: "flex", gap: 4 }}>
              {["✓", "X", "👁", "✏️"].map((s) => (
                <button key={s} onClick={() => setRespuestas((p) => ({ ...p, [prod]: s }))} style={{ padding: 8, borderRadius: 8, fontWeight: "bold", background: respuestas[prod] === s ? "#0090ff" : "#fff", color: respuestas[prod] === s ? "#fff" : "#000", border: "2px solid #00a651" }}>{s}</button>
              ))}
            </div>
          </div>
        ))}
        <p><b style={{ color: "#008040" }}>ATAJOS - Marca todo de una vez:</b></p>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { const n: any = {}; productosEjemplo.forEach((p) => n[p] = "✓"); setRespuestas(n); }} style={{ flex: 1, padding: 10, border: "1px solid #008040", borderRadius: 8, background: "#fff", color: "#008040", fontWeight: "bold" }}>LO TENGO TODO</button>
          <button onClick={() => { const n: any = {}; productosEjemplo.forEach((p) => n[p] = "X"); setRespuestas(n); }} style={{ flex: 1, padding: 10, border: "1px solid #c00", borderRadius: 8, background: "#fff", color: "#900", fontWeight: "bold" }}>NO TENGO NADA</button>
          <button onClick={() => { const n: any = {}; productosEjemplo.forEach((p) => n[p] = "✏️"); setRespuestas(n); }} style={{ flex: 1, padding: 10, border: "1px solid #333", borderRadius: 8, background: "#fff", fontWeight: "bold" }}>PEDIR TODO</button>
        </div>
        <button onClick={() => alert("Respuesta lista para enviar por enlace WhatsApp al cliente. La farmacia solo informa de disponibilidad.")} style={{ width: "100%", background: "#00c853", color: "#fff", border: 0, padding: 15, borderRadius: 10, fontWeight: "bold", fontSize: 18, marginTop: 10 }}>ENVIAR RESPUESTA</button>
        <button onClick={() => setRespuestas({})} style={{ width: "100%", background: "#ffecec", color: "#900", border: "1px solid #c00", padding: 12, borderRadius: 10, fontWeight: "bold", marginTop: 8 }}>X &nbsp; BORRAR RESPUESTA / REESCRIBIR</button>

        <div style={{ border: "2px solid #c00", borderRadius: 12, padding: 12, marginTop: 12, background: "#fff5f5" }}>
          <b style={{ color: "#900" }}>¿Eres farmacia y te quieres dar de baja?</b><br />
          <small>Si te das de baja, ya no te llegarán más consultas de FarmaCerca 24h.</small><br /><br />
          <input value={bajaNombre} onChange={(e) => setBajaNombre(e.target.value)} placeholder="Nombre de tu farmacia..." style={{ width: "100%", padding: 10, marginBottom: 6, borderRadius: 8, border: "1px solid #ccc", boxSizing: "border-box" }} />
          <input value={bajaTelefono} onChange={(e) => setBajaTelefono(e.target.value)} placeholder="Tu WhatsApp (ej: 346...)" style={{ width: "100%", padding: 10, marginBottom: 6, borderRadius: 8, border: "1px solid #ccc", boxSizing: "border-box" }} />
          <button onClick={darseDeBaja} style={{ width: "100%", background: "#fff", color: "#900", border: "2px solid #c00", padding: 12, borderRadius: 10, fontWeight: "bold" }}>DARME DE BAJA</button>
          <p style={{ color: "#900", fontWeight: "bold" }}>{mensajeBaja}</p>
        </div>
        <div style={{ background: "#2563eb", color: "#fff", padding: 12, borderRadius: 10, marginTop: 12 }}><b>Ver Aviso Legal completo y Politica de Privacidad &gt;</b><br /><small>Enlace WhatsApp Farmacia</small></div>
      </div>

      <footer style={{ textAlign: "center", padding: 15, fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <img src="/logo.png" alt="FarmaCerca 24h" style={{ height: "48px", width: "auto" }} />
          <div style={{ fontSize: 13, fontWeight: "normal" }}>A un mensaje de ti</div>
        </div>
        <div style={{ background: "#e6f7ee", border: "1px solid #00a651", borderRadius: 10, padding: 10, margin: 10 }}><b>Aviso Legal • Privacidad • Términos • Cookies</b></div>
        <p>FarmaCerca 24 h solo informa de disponibilidad.<br />La venta y dispensación la realiza la farmacia autorizada.</p>
      </footer>
    </div>
  );
}
