'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function Farmacia() {
  const [pregunta, setPregunta] = useState<any>(null);
  const [debug, setDebug] = useState('cargando...');
  const MI_ID = 1;

  async function buscarPendientes() {
    const { data, error } = await supabase.from('consultas').select('*').eq('farmacia_id', MI_ID).order('created_at', { ascending: false }).limit(1);
    if (error) {
      setDebug('ERROR: ' + error.message);
      return;
    }
    if (data && data.length > 0) {
      if (data[0].estado === 'si_tengo' || data[0].estado === 'no_tengo') {
        setPregunta(null);
        setDebug('Ultima ya contestada: ' + data[0].producto);
      } else {
        setPregunta(data[0]);
        setDebug('ENCONTRADA: ' + data[0].producto + ' - ' + new Date().toLocaleTimeString());
      }
    } else {
      setDebug('No hay nada para farmacia_id=' + MI_ID + ' - ' + new Date().toLocaleTimeString());
    }
  }

  useEffect(() => {
    buscarPendientes();
    const intervalo = setInterval(buscarPendientes, 3000);
    return () => clearInterval(intervalo);
  }, []);

  async function contestar(tiene: boolean) {
    if (!pregunta) return;
    await supabase.from('consultas').update({ estado: tiene ? 'si_tengo' : 'no_tengo' }).eq('id', pregunta.id);
    setPregunta(null);
    alert(tiene ? 'Has dicho SÍ LO TENGO' : 'Has dicho NO LO TENGO');
  }

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <h1>Farmacia Iznájar Centro</h1>
      <p style={{ background: '#fef3c7', padding: 10, borderRadius: 8, fontSize: 12 }}>{debug}</p>
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
