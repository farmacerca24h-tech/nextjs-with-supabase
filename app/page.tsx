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
  const [chat, setChat] = useState<any[]>([])
  const [numeroCopiado, setNumeroCopiado] = useState(false)
  const chatRef = useRef<any>(null)

  const [promptInstalar, setPromptInstalar] = useState<any>(null)
  const [yaInstalada, setYaInstalada] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) setYaInstalada(true)
    const handler = (e: any) => { e.preventDefault(); setPromptInstalar(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const instalarApp = async () => {
    if (yaInstalada) { alert('Ya la tienes instalada. NO la borres. Se actualiza sola. Solo cierra la app y vuelve a abrirla.'); return }
    if (!promptInstalar) { alert('En Android: 3 puntos de Chrome > Instalar app / Añadir a pantalla de inicio. En iPhone: Compartir > Añadir a pantalla de inicio.'); return }
    promptInstalar.prompt()
    const res = await promptInstalar.userChoice
    if (res && res.outcome === 'accepted') setYaInstalada(true)
  }

  const [notificaciones, setNotificaciones] = useState(false)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') setNotificaciones(true)
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

  const buscar = async () => {
    if (!producto) return alert('Escribe un producto')
    setEstado('buscando'); setNumeroCopiado(false)
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
    setChat([...chat, { de: 'farmacia', nombre: farmacia.nombre, texto: 'Hola! Sí, lo tenemos en stock ✅ ¿Te lo reservo?', hora }])
    avisar(farmacia.nombre + ': Sí, lo tenemos ✅ ¿Te lo reservo?')
    bajarChat()
    await supabase.from('consultas_farmacias').update({ estado: 'si_tiene' }).eq('consulta_id', consultaId).eq('farmacia_id', farmacia.id)
    await supabase.from('consultas').update({ estado: 'encontrado', farmacia_encontrada_id: farmacia.id }).eq('id', consultaId)
  }
  const simularNoTanda = async () => {
    const todas = JSON.parse(localStorage.getItem('farmacias_busqueda') || '[]')
    const sig = tandaActual + 1; const inicio = (sig - 1) * 3; const siguientes = todas.slice(inicio, inicio + 3)
    if (siguientes.length === 0) { setEstado('sin_stock'); return }
    setTandaActual(sig); setFarmaciasTanda(siguientes)
    setChat([...chat, { de: 'sistema', texto: 'Las 3 primeras dicen que NO. Pasando a tanda ' + sig, hora: '' }])
    bajarChat()
    for (const f of siguientes) { await supabase.from('consultas_farmacias').insert({ consulta_id: consultaId, farmacia_id: f.id, tanda: sig, estado: 'enviado' }) }
  }

  // --- ARREGLO PARA PC ---
  const hablarDirecto = () => {
    if (!farmaciaEncontrada) return
    const tel = (farmaciaEncontrada.whatsapp || farmaciaEncontrada.telefono || '').toString().replace(/[^0-9]/g, '')
    const texto = encodeURIComponent('Hola, soy de FarmaCerca 24h. Me han dicho que teneis ' + producto + '. Me lo podeis reservar?')
    const esMovil = /Android|iPhone|iPad/i.test(navigator.userAgent)
    if (esMovil) {
      window.open('https://wa.me/' + tel + '?text=' + texto, '_blank')
    } else {
      // En PC abre WhatsApp Web, que si funciona en el navegador
      window.open('https://web.whatsapp.com/send?phone=' + tel + '&text=' + texto, '_blank')
    }
  }
  const llamar = () => {
    if (!farmaciaEncontrada) return
    window.location.href = 'tel:' + farmaciaEncontrada.telefono
  }
  const copiarNumero = async () => {
    if (!farmaciaEncontrada) return
    try { await navigator.clipboard.writeText(farmaciaEncontrada.telefono); setNumeroCopiado(true) }
    catch (e) { prompt('Copia el numero:', farmaciaEncontrada.telefono) }
  }

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-white">
      <div className="text-center">
        <img src="/icon-512.png" alt="FarmaCerca" className="w-20 h-20 mx-auto mb-2 object-contain" />
        <h1 className="text-4xl font-bold text-green-600">FarmaCerca 24h</h1>
        <p className="text-gray-500 text-lg mt-2">Preguntamos por ti a 3 farmacias a la vez</p>
        <p className="text-xs text-gray-400 mt-1">Versión 2.4 - Se actualiza sola, no borres el icono</p>
      </div>

      <button onClick={instalarApp} className="w-full mt-4 bg-black text-white font-bold py-4 rounded-2xl text-lg">
        📱 {yaInstalada ? 'Ya tienes la app instalada - Se actualiza sola' : 'Crear acceso directo en tu móvil'}
      </button>
      <p className="text-center text-gray-400 text-sm mt-1">No lo borres nunca. Cuando haga cambios, solo cierra la app y vuelve a abrirla.</p>

      <button onClick={activarNotificaciones} className="w-full mt-3 bg-black text-white font-bold py-3 rounded-2xl text-base">
        {notificaciones ? '🔔 Notificaciones ACTIVADAS' : '🔔 Activar notificaciones cuando contesten'}
      </button>

      <div className="bg-green-50 rounded-2xl p-3 mt-4 text-center text-green-700 font-bold text-lg">
        Hoy: {contador.usadas} / 250 &nbsp; Quedan: {contador.quedan}
      </div>

      <label className="block font-bold text-lg mt-5 mb-1">Pueblo</label>
      <input value={pueblo} onChange={e => setPueblo(e.target.value)} className="w-full border rounded-2xl p-4 text-lg" />
      <label className="block font-bold text-lg mt-4 mb-1">¿Qué necesitas?</label>
      <textarea value={producto} onChange={e => setProducto(e.target.value)} placeholder="Ej: Paracetamol 500..." className="w-full border rounded-2xl p-4 text-lg h-24" />
      <button onClick={buscar} className="w-full mt-4 bg-green-500 text-white font-bold py-4 rounded-2xl text-xl">Preguntar a 3 farmacias</button>

      {chat.length > 0 && (
        <div ref={chatRef} className="mt-4 bg-[#ECE5DD] rounded-2xl p-3 max-h-[400px] overflow-y-auto">
          <div className="text-center text-xs bg-[#FFF3C4] rounded-lg py-1 px-2 mb-3">💬 Chat de FarmaCerca</div>
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
          <p className="text-sm text-gray-600 mt-1">Tel: {farmaciaEncontrada.telefono}</p>
          <button onClick={hablarDirecto} className="w-full mt-3 bg-green-600 text-white font-bold py-3 rounded-xl">💬 Hablar directo con esa farmacia por chat</button>
          <div className="flex gap-2 mt-2">
            <button onClick={llamar} className="flex-1 bg-white border font-bold py-3 rounded-xl">📞 Llamar</button>
            <button onClick={copiarNumero} className="flex-1 bg-white border font-bold py-3 rounded-xl">{numeroCopiado ? '✅ Copiado!' : '📋 Copiar número'}</button>
          </div>
          <p className="text-xs text-gray-400 mt-2">En PC se abre WhatsApp Web. Si no lo tienes vinculado, entra primero en web.whatsapp.com y escanea el código con tu móvil.</p>
        </div>
      )}
    </div>
  )
}
