import { NextResponse } from "next/server";

export async function GET() {
  const hoy = new Date();
  const fecha = hoy.toISOString().slice(0, 10);

  return NextResponse.json({
    ok: true,
    fecha: fecha,
    mensaje: "Robot funcionando correctamente",
  });
}
