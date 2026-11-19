"use client";
import { useState } from "react";

const TELEFONO_PRUEBA = "34634467345";

export default function Page() {
  const [vista, setVista] = useState<"cliente" | "farmacia">("cliente");
  const [producto, setProducto] = useState("");
  const [pedido, setPedido] = useState("");
  const [respuesta, setRespuesta] = useState("");

  // Cuando el cliente pulsa Buscar, guardamos el pedido
  const enviarPedido = () => {
    if(!producto.trim()) return;
    setPedido(producto);
    setRespuesta("");
    // Esto es lo que le llegaría a la farmacia por WhatsApp en modo prueba
    const texto = `Hola, soy FarmaCerca 24h. Cliente en Málaga pregunta:\n- ${producto}\nContesta con: TENGO / NO TENGO / BAJO PEDIDO`;
    window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(texto)}`, "_blank");
  };

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 12, fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>FarmaCerca 24h <span style={{ background: "#16a34a", color: "#fff", padding: "2px 10px", borderRadius: 20 }}>PRUEBA</span></h2>

      {/* BOTONES PARA CAMBIAR DE ROL EN LA PRUEBA */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={()=>setVista("cliente")} style={{ flex: 1, padding: 12, borderRadius: 10, background: vista==="cliente" ? "#16a34a" : "#eee", color: vista==="cliente" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}>👤 Soy CLIENTE</button>
        <button onClick={()=>setVista("farmacia")} style={{ flex: 1, padding: 12, borderRadius: 10, background: vista==="farmacia" ? "#0ea5e9" : "#eee", color: vista==="farmacia" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}>🏪 Soy FARMACIA</button>
      </div>

      {vista === "cliente" && (
        <div>
          <p><b>1. ¿Qué necesitas?</b></p>
          <input value={producto} onChange={(e)=>setProducto(e.target.value)} placeholder="Ej: Ibuprofeno 600mg" style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid #16a34a" }} />
          <button onClick={enviarPedido} style={{ width: "100%", padding: 14, marginTop: 10, background: "#16a34a", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold" }}>Enviar a farmacia de prueba →</button>
          <p style={{ fontSize: 13, color: "#555" }}>Te va a abrir WhatsApp al 634467345. Dale a Enviar. Es la prueba.</p>
          {pedido && (
            <div style={{ background: "#f0fdf4", border: "1px solid #16a34a", padding: 12, borderRadius: 12, marginTop: 12 }}>
              <b>Pedido enviado:</b> {pedido}<br/>
              <b>Respuesta de la farmacia:</b> {respuesta ? respuesta : "⏳ Esperando que la farmacia pulse un botón..."}
              {respuesta && <div style={{ marginTop: 8, fontSize: 20 }}>{respuesta}</div>}
            </div>
          )}
          <p style={{ fontSize: 12 }}>Ahora pulsa arriba <b>“Soy FARMACIA”</b> para simular que eres la farmacia.</p>
        </div>
      )}

      {vista === "farmacia" && (
        <div style={{ background: "#dcfce7", padding: 14, borderRadius: 14 }}>
          <p style={{ fontSize: 13 }}>📩 WhatsApp recibido en 634467345:</p>
          <div style={{ background: "#fff", padding: 12, borderRadius: 12 }}>
            <b>Hola, soy FarmaCerca 24h.</b><br/>
            Cliente en Málaga pregunta:<br/>
            <b>- {pedido || "Ibuprofeno 600mg (ejemplo)"}</b><br/>
            ¿Lo tienes?
          </div>
          <p style={{ fontWeight: "bold", marginTop: 12 }}>Pulsa una opción:</p>
          <button onClick={()=>{setRespuesta("✅ TENGO"); setVista("cliente");}} style={{ width: "100%", padding: 14, marginBottom: 8, background: "#16a34a", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold" }}>✅ TENGO</button>
          <button onClick={()=>{setRespuesta("❌ NO TENGO"); setVista("cliente");}} style={{ width: "100%", padding: 14, marginBottom: 8, background: "#ef4444", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold" }}>❌ NO TENGO</button>
          <button onClick={()=>{setRespuesta("✏️ BAJO PEDIDO - Mañana lo tengo"); setVista("cliente");}} style={{ width: "100%", padding: 14, background: "#f59e0b", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold" }}>✏️ BAJO PEDIDO</button>
        </div>
      )}
    </main>
  );
}
