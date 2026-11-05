'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PUEBLOS = ["Alameda","Alfarnate","Alfarnatejo","Algarrobo","Algatocín","Alhaurín de la Torre","Alhaurín el Grande","Almáchar","Almargen","Almogía","Álora","Alozaina","Alpandeire","Antequera","Árchez","Archidona","Ardales","Arenas","Arriate","Atajate","Benadalid","Benahavís","Benalauría","Benalmádena","Benamargosa","Benamocarra","Benaoján","Benarrabá","Borge, El","Burgo, El","Campillos","Canillas de Aceituno","Canillas de Albaida","Cañete la Real","Carratraca","Cartajima","Cártama","Casabermeja","Casarabonela","Casares","Coín","Colmenar","Comares","Cómpeta","Cortes de la Frontera","Cuevas Bajas","Cuevas de San Marcos","Cuevas del Becerro","Cútar","Estepona","Faraján","Frigiliana","Fuengirola","Fuente de Piedra","Gaucín","Genalguacil","Guaro","Humilladero","Igualeja","Istán","Iznate","Jimera de Líbar","Jubrique","Júzcar","Macharaviaya","Málaga","Manilva","Marbella","Mijas","Moclinejo","Mollina","Monda","Montejaque","Nerja","Ojén","Parauta","Periana","Pizarra","Pujerra","Rincón de la Victoria","Riogordo","Ronda","Salares","Sayalonga","Sedella","Sierra de Yeguas","Teba","Tolox","Torremolinos","Torrox","Totalán","Valle de Abdalajís","Vélez-Málaga","Villanueva de Algaidas","Villanueva de la Concepción","Villanueva de Tapia","Villanueva del Rosario","Villanueva del Trabuco","Viñuela","Yunquera"].sort((a,b)=>a.localeCompare(b,'es'))

const PEDANIAS: Record<string,string[]> = {
  "Vélez-Málaga": ["Vélez-Málaga","Torre del Mar","Caleta de Vélez","Almayate","Benajarafe","Chilches","Cajiz","Triana","Lagos","Mezquitilla","Trapiche"],
  "Málaga": ["Málaga Centro","Teatinos","El Palo","Pedregalejo","Churriana","Campanillas"],
  "Ronda": ["Ronda","La Cimada"],
  "Antequera": ["Antequera","Bobadilla","Cartaojal"],
  "Marbella": ["Marbella","San Pedro de Alcántara","Nueva Andalucía"],
  "Estepona": ["Estepona","Cancelada"],
  "Nerja": ["Nerja","Maro","Burriana"],
  "Torrox": ["Torrox","El Morche"],
  "Algarrobo": ["Algarrobo","Algarrobo-Costa"],
  "Rincón de la Victoria": ["Rincón de la Victoria","La Cala del Moral","Torre de Benagalbón","Benagalbón"],
}

export default function Home(){
  const [pueblo,setPueblo]=useState('')
  const [pedania,setPedania]=useState('')
  const [resultado,setResultado]=useState<any[]>([])
  const [buscado,setBuscado]=useState(false)
  const [cargando,setCargando]=useState(false)

  async function buscar(){
    if(!pueblo) return
    setCargando(true); setBuscado(true)
    const hoy = new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Madrid'})
    let q = supabase.from('farmacias').select('*').eq('pueblo',pueblo).eq('fecha_guardia',hoy)
    if(pedania) q = q.eq('pedania',pedania)
    const {data}= await q
    setResultado(data||[])
    setCargando(false)
  }

  return (
    <main style={{maxWidth:600,margin:'0 auto',padding:20,fontFamily:'sans-serif'}}>
      <h1 style={{fontSize:28,fontWeight:800}}>💊 Farmacia de Guardia<br/>Málaga</h1>
      <p>103 pueblos de Málaga, de la A a la Z. Con pedanías.</p>
      <label>Pueblo</label>
      <select value={pueblo} onChange={e=>{setPueblo(e.target.value); setPedania(''); setBuscado(false)}} style={{width:'100%',padding:14,fontSize:16,marginBottom:12}}>
        <option value="">-- Elige tu pueblo --</option>
        {PUEBLOS.map(p=><option key={p} value={p}>{p}</option>)}
      </select>
      {pueblo && PEDANIAS[pueblo] && <>
        <label>Pedanía / Zona (opcional)</label>
        <select value={pedania} onChange={e=>setPedania(e.target.value)} style={{width:'100%',padding:14,fontSize:16,marginBottom:12}}>
          <option value="">-- Todo {pueblo} --</option>
          {PEDANIAS[pueblo].map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </>}
      <button onClick={buscar} style={{width:'100%',padding:16,background:'#16a34a',color:'white',border:0,borderRadius:10,fontSize:18,fontWeight:700}}>
        {cargando?'Buscando...':'🔍 Buscar farmacia de guardia'}
      </button>
      {buscado && (
        <div style={{marginTop:20}}>
          {resultado.length===0 ? <p style={{background:'#fef3c7',padding:16,borderRadius:10}}>No hay farmacia 24h registrada en {pedania||pueblo} todavía.</p> :
          resultado.map((f:any)=>(
            <div key={f.id} style={{border:'1px solid #ddd',padding:16,borderRadius:12,marginBottom:12}}>
              <b style={{fontSize:18}}>{f.nombre}</b><br/>
              📍 {f.direccion}<br/>
              📞 <a href={`tel:${f.telefono}`}>{f.telefono}</a><br/>
              <small>{f.pueblo} - {f.pedania} - Guardia {f.fecha_guardia}</small><br/>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.direccion)}`} target="_blank" style={{display:'inline-block',marginTop:10,background:'#2563eb',color:'white',padding:'10px 16px',borderRadius:8,textDecoration:'none'}}>Cómo llegar →</a>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
