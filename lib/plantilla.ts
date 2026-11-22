export const BOTONES = {
  EN_STOCK: "Tengo stock",
  SIN_STOCK: "No tengo stock",
  PEDIR: "Lo pido",
};

export function crearMensajePlantilla(
  localidad: string,
  producto: string,
  ref: string
): string {
  return `Hola, soy Farmacerca 24h. Necesito en ${localidad}: ${producto} (Ref: ${ref}). ¿Tienes stock?`;
}
