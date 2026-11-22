export const PLANTILLA = {
  nombre: "consulta_disponibilidad_v1",
  categoria: "Utility",
  idioma: "es_ES",
};

export function crearMensajePlantilla(localidad: string, producto: string, ref: string) {
  return `Hola, somos FarmaCerca24h, plataforma informativa. No es un pedido ni una venta.

Un usuario en ${localidad} pregunta por disponibilidad informativa de: ${producto}
Ref: ${ref}

¿Puedes indicarnos la disponibilidad? Pulsa una opción. Si es otro caso, responde con texto libre.

Puedes darte de baja respondiendo BAJA.`;
}

export const BOTONES = [
  { id: "EN_STOCK", titulo: "En stock" },
  { id: "SIN_STOCK", titulo: "Sin stock" },
  { id: "BAJO_PEDIDO", titulo: "Bajo pedido" },
];
