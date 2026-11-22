"use client";
import { useState } from "react";
import { crearMensajePlantilla, BOTONES } from "../lib/plantilla";

export default function PruebaWhatsApp() {
  const [localidad, setLocalidad] = useState("Alhaurín el Grande");
  const [producto, setProducto] = useState("Ibuprofeno 600 mg, 40 comprimidos");
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<{[key:number]:string}>({});
  const [enviando, setEnviando] = useState(false);
  const ref = "REF-4821";
  const mensaje = crearMensajePlantilla(localidad, producto, ref);

  const enviar = async () => {
    setEnviando(true); setPaso(0); setRespuestas({});
    for (let i=0;i<3;i++){ setPaso(i+1); await new Promise(r=>setTimeout(r,2000)); }
    setEnviando(false);
  };

  return (
    <main style={{maxWidth:480,margin:"0 auto",padding:12,fontFamily:"sans-serif"}}>
      <h2>FarmaCerca 24h <span style={{background:"#16a34a",color:"#fff",padding:"2px 10px",borderRadius:20,fontSize:14}}>PRUEBA</span></h2>
      <p style={{fontSize:13,background:"#fef9c3",padding:10,borderRadius:10}}>PRUEBA SIN BORRAR NADA. Simulado, no se envía a farmacias reales.</p>
      <label><b>Localidad</b></label>
      <input value={localidad} onChange={e=>setLocalidad(e.target.value)} style={{width:"100%",padding:12,borderRadius:10,border:"1px solid #ccc",marginBottom:8}} />
      <label><b>Producto</b></label>
      <input value={producto} onChange={e=>setProducto(e.target.value)} style={{width:"100%",padding:12,borderRadius:10,border:"1px solid #ccc",marginBottom:10}} />
      <button onClick={enviar} disabled={enviando} style={{width:"100%",padding:14,background:"#16a34a",color:"#fff",border:"none",borderRadius:12,fontWeight:"bold"}}>
        {enviando ? `Enviando a farmacia ${paso} de 3...` : "Enviar prueba escalonada a 3 farmacias"}
      </button>
      {paso>0 && <div style={{marginTop:14,border:"1px solid #ddd",borderRadius:12,padding:12,background:"#f8fafc"}}><b>Mensaje que recibiría la farmacia:</b><pre style={{whiteSpace:"pre-wrap",fontSize:13,background:"#fff",padding:10,borderRadius:8}}>{mensaje}</pre></div>}
      {paso===3 && !enviando && [1,2,3].map((n,idx)=>(
        <div key={idx} style={{border:"2px solid #16a34a",borderRadius:14,padding:12,marginTop:12}}>
          <b>{n}. Farmacia Prueba {n}</b><div style={{fontSize:13}}>Ref: {ref} - {producto}</div>
          <div style={{display:"flex",gap:6,marginTop:8}}>{BOTONES.map(b=>(
            <button key={b.id} onClick={()=>setRespuestas({...respuestas,[idx]:b.titulo})} style={{flex:1,padding:10,borderRadius:8,border:"none",fontWeight:"bold",background:b.id==="EN_STOCK"?"#16a34a":b.id==="SIN_STOCK"?"#ef4444":"#f59e0b",color:"#fff",fontSize:12}}>{b.titulo}</button>
          ))}</div>
          {respuestas[idx] && <div style={{background:"#dcfce7",padding:8,borderRadius:8,marginTop:8,textAlign:"center"}}>✅ Respuesta: <b>{respuestas[idx]}</b></div>}
        </div>
      ))}
    </main>
  );
}
