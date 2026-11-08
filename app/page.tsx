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

  // --- ACCESO DIRECTO / INSTALAR ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  // ESTA ES LA FUNCION NUEVA, SIN ALERT, INSTALA DIRECTO
  const instalarApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstall(false)
      }
    }
  }

  // AVISO SOLO A LOS 2 SEGUNDOS DE ENTRAR
  useEffect(() => {
    if (deferredPrompt) {
      const timer = setTimeout(() => {
        deferredPrompt.prompt()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [deferredPrompt])

  // --- CONTADOR ---
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
    <div className="min-h-screen bg-white p-4 max-w-md mx-auto">
      {/* LOGO + TITULO */}
      <div className="text-center">
        <img src="/icon-512.png" alt="FarmaCerca 24h" className="w-20 h-20 mx-auto rounded-2xl mb-2" />
        <h1 className="text-3xl font-black text-green-600">FarmaCerca 24h</h1>
        <p className="text-gray-500 text-sm mt-1">Preguntamos por ti a 3 farmacias a la vez</p>
      </div>

      {/* BOTON ACCESO DIRECTO - INSTALA DIRECTO */}
      <button
        onClick={instalarApp}
        className="w-full bg-black text-white font-bold py-4 rounded-xl mt-4 text-lg"
      >
        📱 Crear acceso directo en tu móvil
      </button>
      <p className="text-center text-xs text-gray-500 mt-1">
        1 toque y te queda el icono en pantalla como una app
      </p>

      {/* CONTADOR */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-4 text-center">
        <p className="font-bold text-green-700">Hoy: {contador.usadas} / 250 &nbsp; Quedan: {contador.quedan}</p>
      </div>

      {/* BUSCADOR */}
      <div className="mt-4 space-y-3">
        <label className="block text-sm font-bold">Pueblo</label>
        <input value={pueblo} onChange={(e) => setPueblo(e.target.value)} className="w-full border rounded-xl p-3" placeholder="Iznájar" />
        <label className="block text-sm font-bold">¿Qué necesitas?</label>
        <input value={producto} onChange={(e) => setProducto(e.target.value)} className="w-full border rounded-xl p-3" placeholder="Ej: Paracetamol 500..." />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={quierePedir} onChange={(e) => setQuierePedir(e.target.checked)} />
          Quiero pedirlo si lo tienen
        </label>
        <button onClick={buscar} disabled={buscando} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl">
          {buscando ? 'Buscando...' : '🔍 Buscar en farmacias'}
        </button>
        {mensaje && <p className="text-center text-sm text-gray-600">{mensaje}</p>}
      </div>

      {/* RESULTADO */}
      {farmaciasTanda.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="font-bold">Tanda {tandaActual} - Preguntando a:</p>
          {farmaciasTanda.map((f: any, i: number) => (
            <div key={i} className="border rounded-xl p-3">
              <p className="font-bold">{f.nombre || `Farmacia ${i + 1}`}</p>
              <p className="text-sm text-gray-500">{f.pueblo}</p>
            </div>
          ))}
          {consultaId && <p className="text-xs text-center text-gray-400">Consulta #{consultaId}</p>}
        </div>
      )}
    </div>
  )
}
