"use client";
import { useState } from "react";

export default function Prueba() {
  const [vista, setVista] = useState<"cliente" | "farmacia">("cliente");
  const [producto, setProducto] = useState("");
  const [pedido, setPedido] = useState("");
  const [respuesta, setRespuesta] = useState("");

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 12, fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>🧪 PRUEBA - No toca la página principal</h2>
      <p style={{ fontSize: 13, background: "#fef9c3", padding: 8, borderRadius: 8 }}>Esta página es solo para probar. La principal con las 389 farmacias sigue intacta.</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={()=>setVista("cliente")} style={{ flex: 1, padding: 12, borderRadius: 10, background: vista==="cliente" ? "#16a34a" : "#eee", border: "none", fontWeight: "bold", color: vista==="cliente" ? "#fff" : "#000" }}>👤 Soy CLIENTE</button>
        <button onClick={()=>setVista("farmacia")} style={{ flex: 1, padding: 12, borderRadius: 10, background: vista==="farmacia" ? "#0ea5e9" : "#eee", border: "none", fontWeight: "bold", color: vista==="farmacia" ? "#fff" : "#000" }}>🏪 Soy FARMACIA</button>
      </div>

      {vista === "cliente" && (
        <div>
          <input value={producto} onChange={(e)=>setProducto(e.target.value)} placeholder="Ej: Ibuprofeno 600mg" style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid #16a34a" }} />
          <button onClick={()=>{ if(!producto.trim()) return; setPedido(producto); setRespuesta(""); const texto = `Hola, soy FarmaCerca 24h. Cliente en Málaga pregunta:\n- ${producto}\nContesta: TENGO / NO TENGO / BAJO PEDIDO`; window.open(`https://wa.me/34634467345?text=${encodeURIComponent(texto)}`, "_blank"); }} style={{ width: "100%", padding: 14, marginTop: 10, background: "#16a34a", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold" }}>Enviar a 634467345 →</button>
          {pedido && <div style={{ background: "#f0fdf4", border: "1px solid #16a34a", padding: 12, borderRadius: 12, marginTop: 12 }}><b>Pedido:</b> {pedido}<br/><b>Respuesta farmacia:</b> {respuesta || "⏳ Esperando..."}</div>}
          <p style={{ fontSize: 12 }}>Ahora pulsa arriba “Soy FARMACIA” para simular la respuesta.</p>
        </div>
      )}

      {vista === "farmacia" && (
        <div style={{ background: "#dcfce7", padding: 14, borderRadius: 14 }}>
          <p>📩 WhatsApp recibido en 634467345:</p>
          <div style={{ background: "#fff", padding: 12, borderRadius: 12 }}>Hola, soy FarmaCerca 24h.<br/>Cliente pregunta:<br/><b>- {pedido || "Ibuprofeno 600mg (ejemplo)"}</b><br/>¿Lo tienes?</div>
          <p><b>Pulsa una opción:</b></p>
          <button onClick={()=>{setRespuesta("✅ TENGO"); setVista("cliente");}} style={{ width: "100%", padding: 14, marginBottom: 8, background: "#16a34a", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold" }}>✅ TENGO</button>
          <button onClick={()=>{setRespuesta("❌ NO TENGO"); setVista("cliente");}} style={{ width: "100%", padding: 14, marginBottom: 8, background: "#ef4444", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold" }}>❌ NO TENGO</button>
          <button onClick={()=>{setRespuesta("✏️ BAJO PEDIDO"); setVista("cliente");}} style={{ width: "100%", padding: 14, background: "#f59e0b", color: "#fff", border: "none", borderRadius: 12, fontWeight: "bold" }}>✏️ BAJO PEDIDO</button>
        </div>
      )}
    </main>
  );
}
