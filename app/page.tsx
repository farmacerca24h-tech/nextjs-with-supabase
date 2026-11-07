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
  const [contador, setContador] = useState({ usadas: 0, quedan: 250 })
  const [consultaId, setConsultaId] = useState<number | null>(null)
  const [tandaActual, setTandaActual] = useState(1)
  const [farmaciasTanda, setFarmaciasTanda] = useState<any[]>([])
  const [estado, setEstado] = useState('idle') // idle, buscando, encontrado, sin_stock
  const [farmaciaEncontrada, setFarmaciaEncontrada] = useState<any>(null)
  const [mensaje, setMensaje] = useState('')

  // Contador de hoy
  useEffect(() => {
    const cargarContador = async () => {
      const hoy = new Date(); hoy.setHours(0,0,0,0)
      const { data } = await supabase
        .from('consultas_farmacias')
        .select('farmacia_id')
        .gte('created_at', hoy.toISOString())
      const unicas = new Set(data?.map((d:any) => d.farmacia_id) || []).size
      setContador({ usadas: unicas, quedan: 250 - unicas })
    }
    cargarContador()
  }, [estado])

  const buscar = async () => {
    if (!producto) return alert('Escribe un producto')
    if (contador.usadas >= 250) return alert('Hoy hemos llegado al límite de 250, inténtalo mañana')

    setEstado('buscando')
    setMensaje(`Preguntando a las 3 más cercanas... Tanda ${1}`)
    
    // 1. Crear consulta
    const { data: consulta } = await supabase
      .from('consultas')
      .insert({ producto, pueblo, estado: 'buscando' })
      .select().single()
    
    setConsultaId(consulta.id)
    setTandaActual(1)

    // 2. Coger farmacias ordenadas (por ahora por pueblo, luego por distancia)
    const { data: farmacias } = await supabase
      .from('farmacias')
      .select('*')
      .ilike('pueblo', `%${pueblo}%`)
      .limit(30)

    if (!farmacias || farmacias.length === 0) {
      setEstado('sin_stock')
      setMensaje('No hay farmacias registradas en ese pueblo')
      return
    }

    // 3. Primera tanda de 3
    const tanda1 = farmacias.slice(0, 3)
    setFarmaciasTanda(tanda1)

    // Guardar en consultas_farmacias
    for (const f of tanda1) {
      await supabase.from('consultas_farmacias').insert({
        consulta_id: consulta.id,
        farmacia_id: f.id,
        tanda: 1,
        estado: 'enviado'
      })
    }

    // Guardar lista completa en localStorage para pasar a siguiente tanda en pruebas
    localStorage.setItem('farmacias_busqueda', JSON.stringify(farmacias))
  }

  // SIMULACIÓN - En real esto lo haría el webhook de WhatsApp
  const simularSi = async (farmacia: any) => {
    setFarmaciaEncontrada(farmacia)
    setEstado('encontrado')
    setMensaje(`✅ ${farmacia.nombre} SÍ lo tiene`)
    await supabase.from('consultas_farmacias')
      .update({ estado: 'si_tiene' })
      .eq('consulta_id', consultaId)
      .eq('farmacia_id', farmacia.id)
    await supabase.from('consultas')
      .update({ estado: 'encontrado', farmacia_encontrada_id: farmacia.id })
      .eq('id', consultaId)
  }

  const simularNoTanda = async () => {
    const todas = JSON.parse(localStorage.getItem('farmacias_busqueda') || '[]')
    const siguienteTanda = tandaActual + 1
    const inicio = (siguienteTanda - 1) * 3
    const siguientes = todas.slice(inicio, inicio + 3)

    if (siguientes.length === 0) {
      setEstado('sin_stock')
      setMensaje('Ninguna farmacia de la zona lo tiene. Lo sentimos.')
      return
    }

    setTandaActual(siguienteTanda)
    setFarmaciasTanda(siguientes)
    setMensaje(`Las 3 primeras dijeron NO. Pasando a la siguiente tanda (${siguienteTanda})... Eres una de las 3 siguientes farmacias.`)

    for (const f of siguientes) {
      await supabase.from('consultas_farmacias').insert({
        consulta_id: consultaId,
        farmacia_id: f.id,
        tanda: siguienteTanda,
        estado: 'enviado'
      })
    }
  }

  const hablarDirecto = () => {
    if (!farmaciaEncontrada) return
    const telefono = farmaciaEncontrada.whatsapp || farmaciaEncontrada.telefono
    const texto = encodeURIComponent(`Hola, soy de FarmaCerca 24h. Me han dicho que tenéis ${producto}. ¿Me lo podéis reservar?`)
    window.open(`https://wa.me/${telefono}?text=${texto}`, '_blank')
  }

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-50">
      {/* CONTADOR - Solo para ti */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm">
        <div className="flex justify-between font-bold">
          <span>📊 Hoy: {contador.usadas} / 250 farmacias</span>
          <span>Quedan: {contador.quedan}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div className={`h-2 rounded-full ${contador.usadas > 200 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(contador.usadas / 250) * 100}%` }} />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center mb-1">FarmaCerca 24h</h1>
      <p className="text-center text-gray-500 text-sm mb-4">Preguntamos por ti a 3 farmacias a la vez</p>

      <input value={pueblo} onChange={e => setPueblo(e.target.value)} placeholder="Pueblo" className="w-full border rounded-xl p-3 mb-2" />
      <input value={producto} onChange={e => setProducto(e.target.value)} placeholder="¿Qué buscas? Ej: Paracetamol" className="w-full border rounded-xl p-3 mb-3" />
      <button onClick={buscar} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl">🔍 Preguntar stock automáticamente</button>

      {mensaje && <div className="mt-4 bg-white border rounded-xl p-3 text-sm font-medium">{mensaje}</div>}

      {estado === 'buscando' && (
        <div className="mt-4 bg-white border rounded-xl p-3">
          <p className="font-bold text-sm mb-2">Tanda {tandaActual} - Preguntando a:</p>
          {farmaciasTanda.map((f: any) => (
            <div key={f.id} className="flex justify-between items-center border-b py-2 last:border-0">
              <span className="text-sm">{f.nombre}</span>
              <button onClick={() => simularSi(f)} className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Simular SÍ</button>
            </div>
          ))}
          <button onClick={simularNoTanda} className="w-full mt-3 bg-orange-100 text-orange-700 font-bold py-2 rounded-lg text-sm">
            Simular: Las 3 dicen NO → Siguiente tanda
          </button>
          <p className="text-[11px] text-gray-400 mt-2 text-center">En modo real, esto lo contestan las farmacias por WhatsApp con 1 = SÍ, 2 = NO</p>
        </div>
      )}

      {estado === 'encontrado' && farmaciaEncontrada && (
        <div className="mt-4 bg-green-50 border border-green-300 rounded-xl p-4 text-center">
          <p className="font-bold text-green-800">✅ Encontrado en {farmaciaEncontrada.nombre}</p>
          <button onClick={hablarDirecto} className="w-full mt-3 bg-green-600 text-white font-bold py-3 rounded-xl">💬 Hablar directo con esa farmacia</button>
        </div>
      )}

      {estado === 'sin_stock' && (
        <div className="mt-4 bg-red-50 border rounded-xl p-3 text-center text-sm">❌ {mensaje}</div>
      )}
    </div>
  )
}
