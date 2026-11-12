'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

// 1 DE VERDAD, 2 DE PRUEBA
const FARMACIAS = [
  { id: 1, nombre: "Farmacia Iznájar Centro", telefono: "34634467345", real: true },
  { id: 2, nombre: "Farmacia Iznájar Norte", telefono: null as string | null, real: false },
  { id: 3, nombre: "Farmacia Iznájar Sur", telefono: null as string | null, real: false },
];

export default function Home() {
  const [pueblo, setPueblo] = useState('Iznájar')
  const [producto, setProducto] = useState('')
  const [contador, setContador] = useState({ usadas: 3, quedan: 247 })
  const [consultaId, setConsultaId] = useState<any>(null)
  const [tandaActual, setTandaActual] = useState(1)
  const [farmaciasTanda, setFarmaciasTanda] = useState<any[]>([])
  const [estado, setEstado] = useState('idle')
  const [respuesta, setRespuesta] = useState('')

  // Escucha la respuesta de la farmacia en tiempo real
  useEffect(() => {
    if (!consultaId) return
    const channel = supabase
      .channel('respuesta-farmacia')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'consultas', filter: `id=eq.${consultaId}` }, (payload: any) => {
        const r = payload.new
        if (r.estado === 'si_tengo') {
          setRespuesta(`✅ ${r.farmacia} SÍ tiene ${r.producto}`)
          setEstado('tiene')
          if (Notification.permission === 'granted') {
            new Notification(`1 farmacia tiene ${r.producto}`)
          }
        }
        if (r.estado === 'no_tengo') {
          setRespuesta(`❌ ${r.farmacia} NO tiene ${r.producto}`)
          setEstado('no_tiene')
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [consultaId])

  // CLIENTE: PREGUNTA -> WhatsApp de verdad a 634467345
  async function preguntar() {
    if (!producto) { alert('Escribe el medicamento'); return }
    if (Notification.permission !== 'granted') { await Notification.requestPermission() }

    const farmaciaReal = FARMACIAS.find(f => f.real)
    setFarmaciasTanda(FARMACIAS)
    setEstado('enviado')
    setRespuesta('')

    const { data } = await supabase.from('consultas').insert({
      pueblo: pueblo,
      producto: producto,
      farmacia_id: farmaciaReal?.id,
      estado: 'pendiente'
    }).select().single()

    if (data) setConsultaId(data.id)

    const linkContestar = `${window.location.origin}/contestar?id=${data?.id}`
    const mensaje = `Hola, busco ${producto} en ${pueblo}. ¿Lo tienes? Contesta aquí: ${linkContestar}`
    window.open(`https://wa.me/34634467345?text=${encodeURIComponent(mensaje)}`, "_blank")
  }

  // FARMACIA: CONTESTA SÍ / NO
  async function contestarFarmacia(tiene: boolean) {
    if (!consultaId) return
    await supabase.from('consultas').update({
      estado: tiene ? 'si_tengo' : 'no_tengo',
      farmacia: 'Farmacia Iznájar Centro'
    }).eq('id', consultaId)
    setRespuesta(tiene ? 'Has dicho SÍ LO TENGO' : 'Has dicho NO LO TENGO')
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#16a34a' }}>FarmaCerca 24h</h1>
      <p>Encuentra tu farmacia con stock cerca de ti</p>

      <label>Pueblo</label>
      <input value={pueblo} onChange={e => setPueblo(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 8, border: '1px solid #ccc' }} />

      <label>¿Qué medicamento buscas?</label>
      <input value={producto} onChange={e => setProducto(e.target.value)} placeholder="Ej: Paracetamol" style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 8, border: '1px solid #ccc' }} />

      <button onClick={preguntar} style={{ width: '100%', padding: 14, background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, fontWeight: 'bold' }}>
        Preguntar a 3 farmacias
      </button>

      <p style={{ fontSize: 13, color: '#666' }}>Consultas usadas: {contador.usadas} - Quedan: {contador.quedan}</p>

      {estado === 'enviado' && (
        <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 10 }}>
          <p><b>Pregunta enviada a:</b></p>
          {farmaciasTanda.map(f => (
            <p key={f.id}>🏪 {f.nombre} {f.real ? '(REAL - 634467345)' : '(Prueba)'}</p>
          ))}
          <p>Esperando respuesta de la farmacia...</p>
        </div>
      )}

      {respuesta && (
        <div style={{ marginTop: 16, padding: 14, background: '#dcfce7', borderRadius: 10, fontWeight: 'bold' }}>
          {respuesta}
        </div>
      )}

      {/* ESTOS 2 BOTONES SON LOS DE LA FARMACIA - los ve quien abre el enlace del WhatsApp */}
      {consultaId && estado === 'enviado' && (
        <div style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 16 }}>
          <p><b>¿Eres la farmacia? Contesta:</b></p>
          <button onClick={() => contestarFarmacia(true)} style={{ width: '100%', padding: 12, background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, marginBottom: 8 }}>SÍ LO TENGO</button>
          <button onClick={() => contestarFarmacia(false)} style={{ width: '100%', padding: 12, background: '#dc2626', color: 'white', border: 'none', borderRadius: 10 }}>NO LO TENGO</button>
        </div>
      )}
    </div>
  )
}
