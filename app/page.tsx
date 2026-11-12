'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export default function Home() {
  const [pueblo, setPueblo] = useState('Iznájar')
  const [producto, setProducto] = useState('')
  const [grupoId, setGrupoId] = useState<string | null>(null)
  const [farmaciasTanda, setFarmaciasTanda] = useState<any[]>([])
  const [estado, setEstado] = useState('idle')
  const [respuesta, setRespuesta] = useState('')

  useEffect(() => {
    if (!grupoId) return
    const channel = supabase
      .channel('respuesta-cliente-' + grupoId)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'consultas', filter: `grupo_id=eq.${grupoId}` }, (payload: any) => {
        const r = payload.new
        if (r.estado === 'si_tengo') {
          setRespuesta(`✅ ${r.farmacia} SÍ tiene ${r.producto}`)
          setEstado('tiene')
          if (Notification.permission === 'granted') new Notification(`1 farmacia tiene ${r.producto}`)
        }
        if (r.estado === 'no_tengo') {
          setRespuesta(`❌ ${r.farmacia} NO tiene ${r.producto}`)
          setEstado('no_tiene')
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [grupoId])

  async function preguntar() {
    if (!producto) { alert('Escribe el medicamento'); return }
    if (Notification.permission !== 'granted') { await Notification.requestPermission() }

    const productoLimpio = producto.replace(/tienes|tiene|busco|hay|¿|\?/gi, '').trim();
    const nuevoGrupo = crypto.randomUUID();
    setGrupoId(nuevoGrupo);
    setEstado('enviado');
    setRespuesta('Buscando farmacias de ' + pueblo + '...');

    const { data: farmacias } = await supabase
      .from('farmacias')
      .select('*')
      .eq('pueblo', pueblo)
      .limit(3);

    if (!farmacias || farmacias.length === 0) {
      setRespuesta('No hay farmacias para ese pueblo');
      return;
    }

    setFarmaciasTanda(farmacias);

    farmacias.forEach((farmacia, index) => {
      setTimeout(async () => {
        await supabase.from('consultas').insert({
          id: `${nuevoGrupo}-${farmacia.id}`,
          grupo_id: nuevoGrupo,
          pueblo: pueblo,
          producto: productoLimpio,
          farmacia_id: farmacia.id,
          farmacia: farmacia.nombre,
          estado: 'pendiente'
        });
        setRespuesta(`Pregunta enviada a ${farmacia.nombre}...`);
      }, (index + 1) * 3000);
    });
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
      {estado === 'enviado' && (
        <div style={{ marginTop: 16, padding: 12, background: '#f0fdf4', borderRadius: 10 }}>
          <p><b>Pregunta enviada a:</b></p>
          {farmaciasTanda.map(f => (
            <p key={f.id}>🏪 {f.nombre} - {f.whatsapp}</p>
          ))}
        </div>
      )}
      {respuesta && (
        <div style={{ marginTop: 16, padding: 14, background: '#dcfce7', borderRadius: 10, fontWeight: 'bold' }}>
          {respuesta}
        </div>
      )}
    </div>
  )
}
