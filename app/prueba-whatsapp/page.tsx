"use client";
import { useState } from "react";
import { crearMensajePlantilla, BOTONES } from "../../lib/plantilla";

export default function PruebaWhatsApp() {
  const [localidad, setLocalidad] = useState("Alhaurin el Grande");
  const [producto, setProducto] = useState("Ibuprofeno 600 mg, 40 comprimidos");
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<{ [key: number]: string }>({});
  const [enviando, setEnviando] = useState(false);
  const ref = "REF-48213";
  const mensaje = crearMensajePlantilla(localidad, producto, ref);

  const enviar = async () => {
    setEnviando(true);
    setPaso(0);
    setRespuestas({});
    for (let i = 0; i < 3; i++) {
      setPaso(i + 1);
      await new Promise((r) => setTimeout(r, 2000));
    }
    setEnviando(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ background: "#16a34a", color: "white", padding: 20, borderRadius: 12, textAlign: "center" }}>
        <h1>FarmaCerca 24h PRUEBA</h1>
        <p>Prueba de envio escalonado a 3 farmacias</p>
      </div>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <label>Localidad</label>
        <input value={localidad} onChange={(e) => setLocalidad(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
        <label>Producto</label>
        <input value={producto} onChange={(e) => setProducto(e.target.value)} style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
        <label>Referencia: {ref}</label>
        <p style={{ background: "#f1f5f9", padding: 12, borderRadius: 8 }}>{mensaje}</p>
        <button onClick={enviar} disabled={enviando} style={{ background: "#16a34a", color: "white", padding: 14, border: "none", borderRadius: 10, fontSize: 16, cursor: "pointer" }}>
          {enviando ? `Enviando... paso ${paso} de 3` : "Enviar prueba escalonada a 3 farmacias"}
        </button>
      </div>

      {paso > 0 && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ border: "1px solid #ddd", padding: 14, borderRadius: 10, opacity: paso >= n ? 1 : 0.4 }}>
              <b>Farmacia {n}</b>
              <p>{paso >= n ? `Enviado: ${mensaje}` : "Pendiente..."}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setRespuestas((p) => ({ ...p, [n]: BOTONES.EN_STOCK }))} style={{ background: "#16a34a", color: "white", padding: "8px 12px", border: "none", borderRadius: 8 }}>{BOTONES.EN_STOCK}</button>
                <button onClick={() => setRespuestas((p) => ({ ...p, [n]: BOTONES.SIN_STOCK }))} style={{ background: "#dc2626", color: "white", padding: "8px 12px", border: "none", borderRadius: 8 }}>{BOTONES.SIN_STOCK}</button>
                <button onClick={() => setRespuestas((p) => ({ ...p, [n]: BOTONES.PEDIR }))} style={{ background: "#f59e0b", color: "white", padding: "8px 12px", border: "none", borderRadius: 8 }}>{BOTONES.PEDIR}</button>
              </div>
              {respuestas[n] && <p style={{ marginTop: 8 }}>Respuesta: {respuestas[n]}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
