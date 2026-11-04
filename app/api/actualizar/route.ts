import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET() {
  const supabase = getSupabase();
  const hoy = new Date().toISOString().slice(0, 10);

  await supabase.from("guardias_hoy").delete().neq("id", 0);

  let guardias: any[] = [];
  let fuente = "icofma.es";
  try {
    const res = await fetch("https://icofma.es/es/farmacias-de-guardia", {
      headers: { "User-Agent": "Mozilla/5.0 Farmacerca24h" },
      cache: "no-store",
    });
    const html = await res.text();
    const regex = /Farmacia[^<]{2,120}/g;
    const encontrados = [...new Set(html.match(regex) || [])].slice(0, 100);
    for (const nombre of encontrados) {
      const limpio = nombre.replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
      guardias.push({
        nombre: limpio,
        direccion: "",
        pueblo: "Málaga",
        telefono: "",
        fecha_guardia: hoy,
      });
    }
  } catch (e) {
    fuente = "error: " + String(e);
  }

  if (guardias.length > 0) {
    await supabase.from("guardias_hoy").insert(guardias);
  }

  return NextResponse.json({
    fecha: hoy,
    fuente,
    guardias_encontradas: guardias.length,
    mensaje: guardias.length > 0
      ? "Actualizado automáticamente desde el Colegio"
      : "El Colegio bloqueó la lectura automática.",
  });
}
