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
  const [estado, setEstado] = useState('idle')
  const [farmaciaEncontrada, setFarmaciaEncontrada] = useState<any>(null)
  const [mensaje, setMensaje] = useState('')
  const [respuestaCorregida, setRespuestaCorregida] = useState('')

  useEffect(() => {
    const cargarContador = async () => {
      const hoy = new Date(); hoy.setHours(0,0,0,0)
      const { data } = await supabase.from('consultas_farmacias').select('farmacia_id').gte('created_at', hoy.toISOString())
      const unicas = new Set(data?.map((d:any) => d.farmacia_id) || []).size
      setContador({ usadas: unicas, quedan: 250 - unicas })
    }
    cargarContador()
  }, [estado])

  const buscar = async () => {
    if (!producto) return alert('Escribe un producto')
    if (contador.usadas >= 250) return alert('Hoy hemos llegado a 250')
    setEstado('buscando')
    setFarmaciaEncontrada(null)
    setRespuestaCorregida('')
    setMensaje(`Preguntando a las 3 más cercanas... Tanda 1 ${quierePedir ? ' - Cliente QUIERE PEDIRLO' : ' - Solo consultar'}`)
    const { data: consulta } = await supabase.from('consultas').insert({
      producto, pueblo, estado: 'buscando',
      quiere_pedir: quierePedir,
      modo_pedido: quierePedir ? 'quiero_pedirlo' : 'solo_consultar'
    }).select().single()
    setConsultaId(consulta.id)
    setTandaActual(1)
    const { data: farmacias } = await supabase.from('farmacias').select('*').ilike('pueblo', `%${pueblo}%`).limit(30)
    if (!farmacias || farmacias.length === 0) {
      setEstado('sin_stock'); setMensaje('No hay farmacias registradas en ese pueblo'); return
    }
    const tanda1 = farmacias.slice(0, 3)
    setFarmaciasTanda(tanda1)
    localStorage.setItem('farmacias_busqueda', JSON.stringify(farmacias))
    for (const f of tanda1) {
      await supabase.from('consultas_farmacias').insert({ consulta_id: consulta.id, farmacia_id: f.id, tanda: 1, estado: 'enviado' })
    }
  }

  const simularRespuesta = async (farmacia: any, tipo: string) => {
    if (tipo === 'si_tiene') {
      setFarmaciaEncontrada(farmacia); setEstado('encontrado')
      setMensaje(`✅ ${farmacia.nombre} SÍ lo tiene ${quierePedir ? 'y te lo reserva' : ''}`)
      await supabase.from('consultas_farmacias').update({ estado: 'si_tiene' }).eq('consulta_id', consultaId).eq('farmacia_id', farmacia.id)
      await supabase.from('consultas').update({ estado: 'encontrado', farmacia_encontrada_id: farmacia.id }).eq('id', consultaId)
    }
    if (tipo === 'lo_puedo_pedir') {
      setFarmaciaEncontrada(farmacia); setEstado('encontrado')
      setMensaje(`📦 ${farmacia.nombre} NO lo tiene, pero TE LO PUEDE PEDIR para mañana`)
      await supabase.from('consultas_farmacias').update({ estado: 'lo_puedo_pedir' }).eq('consulta_id', consultaId).eq('farmacia_id', farmacia.id)
    }
  }

  const simularNoTanda = async () => {
    const todas = JSON.parse(localStorage.getItem('farmacias_busqueda') || '[]')
    const siguienteTanda = tandaActual + 1
    const siguientes = todas.slice((siguienteTanda - 1) * 3, (siguienteTanda - 1) * 3 + 3)
    if (siguientes.length === 0) { setEstado('sin_stock'); setMensaje('Ninguna farmacia de la zona lo tiene.'); return }
    setTandaActual(siguienteTanda); setFarmaciasTanda(siguientes)
    setMensaje(`Las 3 dijeron NO. Pasando a Tanda ${siguienteTanda}...`)
    for (const f of siguientes) {
      await supabase.from('consultas_farmacias').insert({ consulta_id: consultaId, farmacia_id: f.id, tanda: siguienteTanda, estado: 'enviado' })
    }
  }

  const simularCorregir = async (farmacia: any, nuevaRespuesta: string) => {
    setRespuestaCorregida(`⚠️ ${farmacia.nombre} se había equivocado. Respuesta corregida: ${nuevaRespuesta === 'si_tiene' ? 'SÍ lo tiene' : nuevaRespuesta === 'no_tiene' ? 'NO lo tiene' : 'Lo puede pedir'}`)
    await supabase.from('consultas_farmacias').update({
      estado: nuevaRespuesta, corregido: true, respuesta_anterior: 'no_tiene', corregido_at: new Date().toISOString()
    }).eq('consulta_id', consultaId).eq('farmacia_id', farmacia.id)
    if (nuevaRespuesta === 'si_tiene') simularRespuesta(farmacia, 'si_tiene')
    if (nuevaRespuesta === 'lo_puedo_pedir') simularRespuesta(farmacia, 'lo_puedo_pedir')
    if (nuevaRespuesta === 'no_tiene') { setEstado('buscando'); simularNoTanda() }
  }

  const hablarDirecto = () => {
    if (!farmaciaEncontrada) return
    const telefono = farmaciaEncontrada.whatsapp || farmaciaEncontrada.telefono
    const texto = encodeURIComponent(quierePedir ? `Hola, soy de FarmaCerca 24h. Me habéis dicho que tenéis ${producto} y QUIERO PEDIRLO. ¿Me lo reserváis?` : `Hola, soy de FarmaCerca 24h. Me habéis dicho que tenéis ${producto}.`)
    window.open(`https://wa.me/${telefono}?text=${texto}`, '_blank')
  }

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-gray-50">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 text-sm">
        <div className="flex justify-between font-bold"><span>📊 Hoy: {contador.usadas} / 250</span><span>Quedan: {contador.quedan}</span></div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="h-2 rounded-full bg-green-500" style={{ width: `${(contador.usadas / 250) * 100}%` }} /></div>
      </div>
      <h1 className="text-2xl font-bold text-center">FarmaCerca 24h</h1>
      <p className="text-center text-gray-500 text-sm mb-4">Preguntamos por ti a 3 farmacias a la vez</p>
      <input value={pueblo} onChange={e => setPueblo(e.target.value)} placeholder="Pueblo" className="w-full border rounded-xl p-3 mb-2" />
      <input value={producto} onChange={e => setProducto(e.target.value)} placeholder="¿Qué buscas? Ej: Paracetamol" className="w-full border rounded-xl p-3 mb-3" />
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => setQuierePedir(false)} className={`py-3 rounded-xl font-bold text-sm border ${!quierePedir ? 'bg-blue-600 text-white' : 'bg-white'}`}>🔍 Solo saber si lo tienen</button>
        <button onClick={() => setQuierePedir(true)} className={`py-3 rounded-xl font-bold text-sm border ${quierePedir ? 'bg-green-600 text-white' : 'bg-white'}`}>🛒 Quiero pedirlo / reservar</button>
      </div>
      <button onClick={buscar} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl">🔍 Preguntar stock automáticamente</button>
      {mensaje && <div className="mt-4 bg-white border rounded-xl p-3 text-sm font-medium">{mensaje}</div>}
      {respuestaCorregida && <div className="mt-2 bg-yellow-100 border border-yellow-400 rounded-xl p-3 text-sm font-bold">{respuestaCorregida}</div>}
      {estado === 'buscando' && (
        <div className="mt-4 bg-white border rounded-xl p-3">
          <p className="font-bold text-sm mb-2">Tanda {tandaActual} - Preguntando a:</p>
          {farmaciasTanda.map((f: any) => (
            <div key={f.id} className="border-b py-2 last:border-0">
              <div className="flex justify-between items-center"><span className="text-sm font-bold">{f.nombre}</span><span className="text-xs text-gray-500">📞 {f.whatsapp}</span></div>
              <div className="flex gap-1 mt-1">
                <button onClick={() => simularRespuesta(f, 'si_tiene')} className="flex-1 bg-green-100 text-green-700 text-xs font-bold px-1 py-1 rounded">1 = SÍ</button>
                <button onClick={() => simularRespuesta(f, 'lo_puedo_pedir')} className="flex-1 bg-blue-100 text-blue-700 text-xs font-bold px-1 py-1 rounded">3 = Lo pido</button>
                <button onClick={() => simularCorregir(f, 'si_tiene')} className="flex-1 bg-yellow-100 text-yellow-700 text-xs font-bold px-1 py-1 rounded">0 = Corregir a SÍ</button>
              </div>
            </div>
          ))}
          <button onClick={simularNoTanda} className="w-full mt-3 bg-orange-100 text-orange-700 font-bold py-2 rounded-lg text-sm">Las 3 dicen NO → Siguiente tanda</button>
          <p className="text-[11px] text-gray-400 mt-2 text-center">En real: 1=SÍ, 2=NO, 3=Lo pido, 0=Corregir</p>
        </div>
      )}
      {estado === 'encontrado' && farmaciaEncontrada && (
        <div className="mt-4 bg-green-50 border border-green-300 rounded-xl p-4 text-center">
          <p className="font-bold text-green-800">✅ Encontrado en {farmaciaEncontrada.nombre}</p>
          <p className="text-xs">📞 {farmaciaEncontrada.whatsapp}</p>
          <button onClick={hablarDirecto} className="w-full mt-3 bg-green-600 text-white font-bold py-3 rounded-xl">{quierePedir ? '🛒 Pedir / Reservar en esa farmacia' : '💬 Hablar con esa farmacia'}</button>
        </div>
      )}
      {estado === 'sin_stock' && (
        <div className="mt-4 bg-red-50 border border-red-300 rounded-xl p-4 text-center font-bold text-red-700">❌ Ninguna farmacia lo tiene</div>
      )}
    </div>
  )
}
