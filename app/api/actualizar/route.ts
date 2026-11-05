import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PUEBLOS = ["Alameda","Alfarnate","Alfarnatejo","Algarrobo","Algatocín","Alhaurín de la Torre","Alhaurín el Grande","Almáchar","Almargen","Almogía","Álora","Alozaina","Alpandeire","Antequera","Árchez","Archidona","Ardales","Arenas","Arriate","Atajate","Benadalid","Benahavís","Benalauría","Benalmádena","Benamargosa","Benamocarra","Benaoján","Benarrabá","Borge, El","Burgo, El","Campillos","Canillas de Aceituno","Canillas de Albaida","Cañete la Real","Carratraca","Cartajima","Cártama","Casabermeja","Casarabonela","Casares","Coín","Colmenar","Comares","Cómpeta","Cortes de la Frontera","Cuevas Bajas","Cuevas de San Marcos","Cuevas del Becerro","Cútar","Estepona","Faraján","Frigiliana","Fuengirola","Fuente de Piedra","Gaucín","Genalguacil","Guaro","Humilladero","Igualeja","Istán","Iznate","Jimera de Líbar","Jubrique","Júzcar","Macharaviaya","Málaga","Manilva","Marbella","Mijas","Moclinejo","Mollina","Monda","Montejaque","Nerja","Ojén","Parauta","Periana","Pizarra","Pujerra","Rincón de la Victoria","Riogordo","Ronda","Salares","Sayalonga","Sedella","Sierra de Yeguas","Teba","Tolox","Torremolinos","Torrox","Totalán","Valle de Abdalajís","Vélez-Málaga","Villanueva de Algaidas","Villanueva de la Concepción","Villanueva de Tapia","Villanueva del Rosario","Villanueva del Trabuco","Viñuela","Yunquera"]

export async function GET(){
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const hoy = new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Madrid'})
  const resultados: any[] = []
  const errores: string[] = []

  // El Consejo General bloquea el scraping directo desde Vercel.
  // Por eso este robot usa la fuente abierta del Colegio de Málaga (ICOFMA)
  // que es la misma que usa Fusión Radio y la web del Consejo.
  for (const pueblo of PUEBLOS){
    try{
      const url = `https://www.cofmalaga.com/farmacias-de-guardia?localidad=${encodeURIComponent(pueblo)}`
      const res = await fetch(url, { headers: { 'User-Agent':'Mozilla/5.0' }, next:{revalidate:0} })
      const html = await res.text()
      // Buscamos nombre + dirección + teléfono en el HTML
      const nombreMatch = html.match(/Farmacia[^<]{3,80}/)
      const telMatch = html.match(/9[0-9]{2} ?[0-9]{2} ?[0-9]{2} ?[0-9]{2}/)
      if(nombreMatch){
        const nombre = nombreMatch[0].trim()
        const { error } = await supabase.from('farmacias').upsert({
          nombre,
          pueblo,
          pedania: pueblo,
          direccion: pueblo + ', Málaga',
          telefono: telMatch ? telMatch[0] : '',
          fecha_guardia: hoy
        }, { onConflict: 'nombre,fecha_guardia' })
        if(!error) resultados.push({pueblo, nombre})
      } else {
        errores.push(pueblo)
      }
    }catch(e:any){
      errores.push(pueblo+': '+e.message)
    }
  }

  return NextResponse.json({ok:true, fecha:hoy, guardadas:resultados.length, total_pueblos:PUEBLOS.length, resultados, sin_datos:errores, aviso:'Si salen muchos sin_datos es porque ICOFMA bloquea Vercel. En ese caso lo pasamos a Google Sheet que tú controlas y es 100% fiable.'})
}
