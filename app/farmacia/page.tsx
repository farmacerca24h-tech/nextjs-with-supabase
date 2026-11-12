'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function Farmacia() {
  const [pregunta, setPregunta] = useState<any>(null);
  const MI_ID = 1;

  useEffect(() => {
    Notification.requestPermission();
    const channel = supabase
      .channel('pedidos-farmacia-' + MI_ID)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'consultas', filter: `farmacia_id=eq.${MI_ID}` }, (payload: any) => {
        setPregunta(payload.new);
        if (Notification.permission === 'granted') {
          new Notification(`Nuevo pedido: ${payload.new.producto} en ${payload.new.pueblo}`);
        }
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel) };
  }, []);

  async function contestar(tiene: boolean) {
    if (!pregunta) return;
    await supabase.from('consultas').update({
      estado: tiene ? 'si_tengo' : 'no_tengo'
    }).eq('id', pregunta.id);
    setPregunta(null);
    alert(tiene ? 'Has dicho SÍ LO TENGO' : 'Has dicho NO LO TENGO');
  }

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <h1>Farmacia Iznájar Centro</h1>
      <p>634467345 - Deja esta página abierta. Te llegará solo.</p>
      {!pregunta && <p>Esperando preguntas...</p>}
      {pregunta && (
        <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 10 }}>
          <h2>¿Tienes {pregunta.producto}?</h2>
          <p>Pueblo: {pregunta.pueblo}</p>
          <button onClick={() => contestar(true)} style={{ width: '100%', padding: 14, background: '#16a34a', color: 'white', border: 'none', borderRadius: 10, marginBottom: 8, fontWeight: 'bold' }}>SÍ LO TENGO</button>
          <button onClick={() => contestar(false)} style={{ width: '100%', padding: 14, background: '#dc2626', color: 'white', border: 'none', borderRadius: 10, fontWeight: 'bold' }}>NO LO TENGO</button>
        </div>
      )}
    </div>
  );
}
