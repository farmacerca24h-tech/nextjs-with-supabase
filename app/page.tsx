'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
)

export default function Home() {
  const [pueblo, setPueblo] = useState('Iznájar')
  const [producto, setProducto] = useState('')
  const [contador, setContador] = useState({ usadas: 3, quedan: 247 })
  const [consultaId, setConsultaId] = useState<any>(null)
  const [tandaActual, setTandaActual] = useState(1)
  const [farmaciasTanda, setFarmaciasTanda] = useState<any[]>([])
  const [estado, setEstado] = useState('idle')
  const [farmaciaEncontrada, setFarmaciaEncontrada] = useState<any>(null)
  const [mensaje, setMensaje] = useState('')
  const [chat, setChat] = useState<any[]>([])
  const chatRef = useRef<any>(null)

  // NOTIFICACIONES AUTOMATICAS AL ABRIR
  const [notificaciones, setNotificaciones] = useState(false)
  useEffect(() => {
    const auto = async () => {
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          setNotificaciones(true)
          return
        }
        // Intenta pedir permiso solo al abrir, sin tocar nada
        if ('Notification' in window && Notification.permission === 'default') {
          const permiso = await Notification.requestPermission()
          if (permiso === 'granted') setNotificaciones(true)
        }
      } catch (e) {}
    }
    // Espera 1 segundo para que cargue la app y lo pide solo
    const t = setTimeout(auto, 1000)
    return () => clearTimeout(t)
  }, [])

  const activarNotificaciones = async () => {
    const permiso = await Notification.requestPermission()
    if (permiso === 'granted') setNotificaciones(true)
  }

  const avisar = (texto: string) => {
    try {
      if (Notification.permission === 'granted') {
        new Notification('FarmaCerca 24h', { body: texto, icon: '/icon-512.png' })
        if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      }
    } catch (e) {}
  }

  const bajarChat = () => {
    setTimeout(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, 100)
  }

  useEffect(() => {
    const cargar = async () => {
      const hoy = new Date(); hoy.setHours(0,0,0,0)
      const { data } = await supabase.from('consultas_farmacias').select('farmacia_id').gte('created_at', hoy.toISOString())
      const unicas = new Set((data || []).map((d: any) => d.farmacia_id)).size
      if (unicas > 0) setContador({ usadas: unicas, quedan: 250 - unicas })
    }
    cargar()
  }, [estado])

  const buscar = async () => {
    if (!producto) return alert('Escribe un producto')
    setEstado('buscando'); setMensaje('Preguntando a las 3 mas cercanas... Tanda 1')
    setChat([
      { de: 'tu', texto: 'Hola, busco ' + producto + ' en ' + pueblo + '. ¿Lo tenéis?', hora: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) },
      { de: 'sistema', texto: 'Enviando a 3 farmacias...', hora: '' }
    ])
    bajarChat()
    const { data: consulta } = await supabase.from('consultas').insert({ producto, pueblo, estado: 'buscando' }).select().single()
    if (!consulta) return
    setConsultaId(consulta.id); setTandaActual(1)
    const { data: farmacias } = await supabase.from('farmacias').select('*').ilike('pueblo', '%' + pueblo + '%').limit(30)
    if (!farmacias || farmacias.length === 0) { setEstado('sin_stock'); return }
    const tanda1 = farmacias.slice(0, 3); setFarmaciasTanda(tanda1)
    for (const f of tanda1) { await supabase.from('consultas_farmacias').insert({ consulta_id: consulta.id, farmacia_id: f.id, tanda: 1, estado: 'enviado' }) }
    localStorage.setItem('farmacias_busqueda', JSON.stringify(farmacias))
  }

  const simularSi = async (farmacia: any) => {
    setFarmaciaEncontrada(farmacia); setEstado('encontrado')
    const hora = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    const nuevoChat = [
      ...chat,
      { de: 'farmacia', nombre: farmacia.nombre, texto: 'Hola! Sí, lo tenemos en stock ✅ ¿Te lo reservo?', hora: hora }
    ]
    setChat(nuevoChat)
    setMensaje(farmacia.nombre + ' SI lo tiene')
    avisar(farmacia.nombre + ': Sí, lo tenemos ✅ ¿Te lo reservo?')
    bajarChat()
    await supabase.from('consultas_farmacias').update({ estado: 'si_tiene' }).eq('consulta_id', consultaId).eq('farmacia_id', farmacia.id)
    await supabase.from('consultas').update({ estado: 'encontrado', farmacia_encontrada_id: farmacia.id }).eq('id', consultaId)
  }

  const simularNoTanda = async () => {
    const todas = JSON.parse(localStorage.getItem('farmacias_busqueda') || '[]')
    const sig = tandaActual + 1; const inicio = (sig - 1) * 3; const siguientes = todas.slice(inicio, inicio + 3)
    if (siguientes.length === 0) { setEstado('sin_stock'); setMensaje('Ninguna farmacia lo tiene.'); return }
    setTandaActual(sig); setFarmaciasTanda(siguientes)
    setChat([...chat, { de: 'sistema', texto: 'Las 3 primeras dicen que NO. Pasando a la siguiente tanda ' + sig, hora: '' }])
    bajarChat()
    for (const f of siguientes) { await supabase.from('consultas_farmacias').insert({ consulta_id: consultaId, farmacia_id: f.id, tanda: sig, estado: 'enviado' }) }
  }

  const hablarDirecto = () => {
    if (!farmaciaEncontrada) return
    const tel = farmaciaEncontrada.whatsapp || farmaciaEncontrada.telefono
    const texto = encodeURIComponent('Hola, soy de FarmaCerca 24h. Me han dicho que teneis ' + producto + '. Me lo podeis reservar?')
    window.open('https://wa.me/' + tel + '?text=' + texto, '_blank')
  }

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-white">
      <div className="text-center">
        <img src="/icon-512.png" alt="FarmaCerca" className="w-20 h-20 mx-auto mb-2 object-contain" />
        <h1 className="text-4xl font-bold text-green-600">FarmaCerca 24h</h1>
        <p className="text-gray-500 text-lg mt-2">Preguntamos por ti a 3 farmacias a la vez</p>
      </div>

      <button onClick={activarNotificaciones} className="w-full mt-4 bg-black text-white font-bold py-3 rounded-2xl text-base">
        {notificaciones ? '🔔 Notificaciones ACTIVADAS' : '🔔 Activar notificaciones cuando contesten'}
      </button>
      <p className="text-center text-gray-400 text-xs mt-1">Ahora se pide sola al abrir la app. Si no sale, dale aquí.</p>

      <div className="bg-green-50 rounded-2xl p-3 mt-3 text-center text-green-700 font-bold text-lg">
        Hoy: {contador.usadas} / 250 &nbsp; Quedan: {contador.quedan}
      </div>

      <label className="block font-bold text-lg mt-5 mb-1">Pueblo</label>
      <input value={pueblo} onChange={e => setPueblo(e.target.value)} className="w-full border rounded-2xl p-4 text-lg" />
      <label className="block font-bold text-lg mt-4 mb-1">¿Qué necesitas?</label>
      <textarea value={producto} onChange={e => setProducto(e.target.value)} placeholder="Ej: Paracetamol 500..." className="w-full border rounded-2xl p-4 text-lg h-24" />
      <button onClick={buscar} className="w-full mt-4 bg-green-500 text-white font-bold py-4 rounded-2xl text-xl">Preguntar a 3 farmacias</button>

      {/* CHAT TIPO WHATSAPP */}
      {chat.length > 0 && (
        <div ref={chatRef} className="mt-4 bg-[#ECE5DD] rounded-2xl p-3 max-h-[400px] overflow-y-auto">
          <div className="text-center text-xs bg-[#FFF3C4] rounded-lg py-1 px-2 mb-3">🔒 Los mensajes están cifrados de extremo a extremo</div>
          {chat.map((m: any, i: number) => (
            <div key={i} className={'flex mb-2 ' + (m.de === 'tu' ? 'justify-end' : m.de === 'sistema' ? 'justify-center' : 'justify-start')}>
              {m.de === 'sistema' ? (
                <div className="bg-white text-xs text-gray-500 rounded-lg px-2 py-1">{m.texto}</div>
              ) : (
                <div className={'max-w-[80%] rounded-lg px-3 py-2 shadow text-[15px] ' + (m.de === 'tu' ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none')}>
                  {m.de === 'farmacia' && <div className="text-[13px] font-bold text-green-600">{m.nombre}</div>}
                  <div>{m.texto}</div>
                  <div className="text-right text-[11px] text-gray-400 mt-1">{m.hora} {m.de === 'tu' ? '✓✓' : ''}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {estado === 'buscando' && (
        <div className="mt-3 bg-white border rounded-xl p-3">
          <p className="font-bold text-sm mb-2">Tanda {tandaActual} - Preguntando a:</p>
          {farmaciasTanda.map((f: any) => (
            <div key={f.id} className="flex justify-between items-center border-b py-2 last:border-0">
              <span className="text-sm">{f.nombre}</span>
              <button onClick={() => simularSi(f)} className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Simular SI</button>
            </div>
          ))}
          <button onClick={simularNoTanda} className="w-full mt-3 bg-orange-100 text-orange-700 font-bold py-2 rounded-lg text-sm">Simular: Las 3 dicen NO - Siguiente tanda</button>
        </div>
      )}

      {estado === 'encontrado' && farmaciaEncontrada && (
        <div className="mt-4 bg-green-50 border border-green-300 rounded-xl p-4 text-center">
          <p className="font-bold text-green-800">Encontrado en {farmaciaEncontrada.nombre}</p>
          <button onClick={hablarDirecto} className="w-full mt-3 bg-green-600 text-white font-bold py-3 rounded-xl">Hablar directo con esa farmacia en WhatsApp</button>
        </div>
      )}
    </div>
  )
}
