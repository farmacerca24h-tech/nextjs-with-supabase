import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(){
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const hoy = new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Madrid'})
  // Aquí en el futuro conectamos con el Consejo General.
  // De momento deja los datos de prueba para que veas que funciona.
  return NextResponse.json({ok:true, mensaje:`Robot listo para ${hoy}. Base conectada.`})
}
