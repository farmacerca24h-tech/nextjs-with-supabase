'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [pueblo, setPueblo] = useState('Iznájar')
  const [producto, setProducto] = useState('')
  const [quierePedir, setQuierePedir] = useState(false)
  const [contador, setContador] = useState({ usadas: 0, quedan: 250 })
  const [consultaId, setConsultaId] = useState<number | null>(null)
  const [tandaActual, setTandaActual] = useState(1)
  const [farmaciasTanda, setFarmaciasTanda] = useState<any[]>([])
  const [buscando, setBuscando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [mostrarAyuda, setMostrarAyuda] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const instalarApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null)
        setMostrarAyuda(false)
      }
    } else {
      setMostrarAyuda(true)
    }
  }

  useEffect(() => {
    const cargarContador = async () => {
      const { data } = await supabase.from('consultas').select('id', { count: 'exact' })
      const usadas = data?.length || 0
      setContador({ usadas, quedan: Math.max(0, 250 - usadas) })
    }
    cargarContador()
  }, [])

  const buscar = async () => {
    if (!producto.trim()) return
    setBuscando(true)
    setMensaje('')
    const { data: farmacias } = await supabase.from('farmacias').select('*').eq('pueblo', pueblo).limit(3)
    if (!farmacias || farmacias.length === 0) {
      setMensaje('No hay farmacias en ese pueblo todavía.')
      setBuscando(false)
      return
    }
    const { data: consulta } = await supabase.from('consultas').insert([{ pueblo, producto, quiere_pedir: quierePedir }]).select().single()
    if (consulta) setConsultaId(consulta.id)
    setFarmaciasTanda(farmacias)
    setTandaActual(1)
    setMensaje('Preguntando a 3 farmacias a la vez...')
    setBuscando(false)
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: '16px', fontFamily: 'system-ui, sans-serif', background: 'white', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/icon-192.png" alt="FarmaCerca 24h" style={{ width: '80px', height: '80px', borderRadius: '18px', objectFit: 'cover', display: 'block', margin: '0 auto 8px' }} />
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#16a34a', margin: 0 }}>FarmaCerca 24h</h1>
        <p style={{ color: '#666', fontSize: '14px', margin: '6px 0' }}>Preguntamos por ti a 3 farmacias a la vez</p>
      </div>

      <button onClick={instalarApp} style={{ width: '100%', background: 'black', color: 'white', fontWeight: 700, padding: '16px', borderRadius: '12px', marginTop: '12px', fontSize: '16px', border: 'none' }}>
        📱 Crear acceso directo en tu móvil
      </button>
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', margin: '6px 0' }}>1 toque y te queda el icono en pantalla como una app</p>

      {mostrarAyuda && (
        <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '12px', padding: '14px', marginTop: '10px', fontSize: '14px' }}>
          <p style={{ fontWeight: 700, margin: '0 0 8px' }}>Para instalarlo en 5 segundos:</p>
          <p style={{ margin: '0 0 6px' }}>1. Dale a los <b>3 puntitos ⋮</b> arriba a la derecha</p>
          <p style={{ margin: '0 0 6px' }}>2. Dale a <b>Añadir a pantalla de inicio</b></p>
          <p style={{ margin: 0 }}>3. Dale a <b>Añadir / Instalar</b></p>
          <button onClick={() => setMostrarAyuda(false)} style={{ marginTop: '10px', background: 'black', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px' }}>Entendido</button>
        </div>
      )}

      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px', textAlign: 'center', marginTop: '12px' }}>
        <p style={{ fontWeight: 700, color: '#15803d', margin: 0 }}>Hoy: {contador.usadas} / 250 &nbsp; Quedan: {contador.quedan}</p>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontWeight: 700, fontSize: '14px' }}>Pueblo</label>
        <input value={pueblo} onChange={(e) => setPueblo(e.target.value)} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '12px', padding: '12px', fontSize: '16px', boxSizing: 'border-box' }} placeholder="Iznájar" />
        <label style={{ fontWeight: 700, fontSize: '14px' }}>¿Qué necesitas?</label>
        <input value={producto} onChange={(e) => setProducto(e.target.value)} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '12px', padding: '12px', fontSize: '16px', boxSizing: 'border-box' }} placeholder="Ej: Paracetamol 500..." />
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <input type="checkbox" checked={quierePedir} onChange={(e) => setQuierePedir(e.target.checked)} />
          Quiero pedirlo si lo tienen
        </label>
        <button onClick={buscar} disabled={buscando} style={{ width: '100%', background: '#16a34a', color: 'white', fontWeight: 700, padding: '14px', borderRadius: '12px', fontSize: '16px', border: 'none' }}>
          {buscando ? 'Buscando...' : '🔍 Buscar en farmacias'}
        </button>
        {mensaje && <p style={{ textAlign: 'center', fontSize: '14px', color: '#555' }}>{mensaje}</p>}
      </div>

      {farmaciasTanda.length > 0 && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontWeight: 700 }}>Tanda {tandaActual} - Preguntando a:</p>
          {farmaciasTanda.map((f: any, i: number) => (
            <div key={i} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '12px' }}>
              <p style={{ fontWeight: 700, margin: 0 }}>{f.nombre || `Farmacia ${i + 1}`}</p>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{f.pueblo}</p>
            </div>
          ))}
          {consultaId && <p style={{ fontSize: '12px', textAlign: 'center', color: '#aaa' }}>Consulta #{consultaId}</p>}
        </div>
      )}
    </div>
  )
}
