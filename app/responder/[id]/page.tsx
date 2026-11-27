"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type EstadoProducto = "EN_STOCK" | "SIN_STOCK" | "BAJO_PEDIDO" | "OTRO";

type SolicitudFarmaciaRow = {
  id: string;
  consulta_grupo_id: string;
  localidad: string;
  horario: string;
  farmacia_key: string;
  farmacia_nombre: string;
  farmacia_direccion: string;
  productos: string[];
  respuestas: Record<string, EstadoProducto>;
  nota_farmacia: string;
  estado: string;
  responded_at: string | null;
};

const OPCIONES: { valor: EstadoProducto; etiqueta: string; color: string }[] = [
  { valor: "EN_STOCK", etiqueta: "✓ En stock", color: "#16a34a" },
  { valor: "SIN_STOCK", etiqueta: "✗ Sin stock", color: "#dc2626" },
  { valor: "BAJO_PEDIDO", etiqueta: "✏️ Bajo pedido", color: "#d97706" },
  { valor: "OTRO", etiqueta: "👁 Alternativa", color: "#0284c7" },
];

export default function ResponderFarmaciaPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [consulta, setConsulta] = useState<SolicitudFarmaciaRow | null>(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [respuestas, setRespuestas] = useState<Record<string, EstadoProducto>>({});
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    const cargar = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from("solicitudes_farmacias")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setNoEncontrada(true);
      } else {
        const fila = data as SolicitudFarmaciaRow;
        setConsulta(fila);
        setRespuestas(fila.respuestas || {});
        setNota(fila.nota_farmacia || "");
        if (fila.estado === "RESPONDIDA") {
          setGuardadoOk(true);
        }
      }
      setCargando(false);
    };
    cargar();
  }, [id]);

  const marcarProducto = (producto: string, valor: EstadoProducto) => {
    setRespuestas((prev) => ({ ...prev, [producto]: valor }));
    setGuardadoOk(false);
    setErrorMsg("");
  };

  const enviarRespuesta = async () => {
    if (!consulta) return;
    const faltan = consulta.productos.filter((p) => !respuestas[p]);
    if (faltan.length > 0) {
      setErrorMsg("Marca una opción en todos los productos antes de enviar.");
      return;
    }

    setGuardando(true);
    setErrorMsg("");
    const { error } = await supabase
      .from("solicitudes_farmacias")
      .update({
        respuestas,
        nota_farmacia: nota.trim(),
        estado: "RESPONDIDA",
        responded_at: new Date().toISOString(),
      })
      .eq("id", consulta.id);

    setGuardando(false);
    if (error) {
      setErrorMsg("No se pudo guardar la respuesta. Inténtalo de nuevo.");
      return;
    }
    setGuardadoOk(true);
  };

  if (cargando) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: 16, fontFamily: "sans-serif" }}>
        <p style={{ textAlign: "center", fontWeight: "bold" }}>⏳ Cargando consulta...</p>
      </main>
    );
  }

  if (noEncontrada || !consulta) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: 16, fontFamily: "sans-serif" }}>
        <div style={{ border: "2px solid #dc2626", background: "#fee2e2", borderRadius: 12, padding: 14 }}>
          <b>Consulta no encontrada</b>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>
            El enlace no es válido o la consulta ya no existe.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, width: "100%", margin: "0 auto", padding: 14, fontFamily: "sans-serif", background: "#fff", boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <img src="/logo.png" alt="FarmaCerca 24h" style={{ height: 68, width: "auto", margin: "0 auto", display: "block" }} />
        <h2 style={{ color: "#16a34a", margin: "8px 0 4px", fontSize: 20 }}>🏪 Respuesta de Farmacia</h2>
      </div>

      <div style={{ background: "#f0fdf4", border: "1.5px solid #16a34a", borderRadius: 12, padding: 12, marginBottom: 14 }}>
        <b style={{ display: "block", fontSize: 15 }}>{consulta.farmacia_nombre}</b>
        <span style={{ display: "block", fontSize: 13, color: "#444", marginTop: 2 }}>
          📍 {consulta.farmacia_direccion} ({consulta.localidad})
        </span>
        <span style={{ display: "block", fontSize: 12, color: "#0369a1", fontWeight: "bold", marginTop: 4 }}>
          🕒 Consulta en horario: {consulta.horario}
        </span>
      </div>

      <p style={{ fontWeight: "bold", fontSize: 15, margin: "0 0 8px" }}>
        Indica la disponibilidad de cada producto solicitado:
      </p>

      {consulta.productos.map((prod, idx) => {
        const seleccion = respuestas[prod];
        return (
          <div key={idx} style={{ border: "1.5px solid #d1d5db", borderRadius: 12, padding: 10, marginBottom: 10, background: "#fafafa" }}>
            <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 8 }}>💊 {prod}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {OPCIONES.map((op) => {
                const activo = seleccion === op.valor;
                return (
                  <button
                    key={op.valor}
                    type="button"
                    onClick={() => marcarProducto(prod, op.valor)}
                    style={{
                      padding: "10px 8px",
                      borderRadius: 8,
                      border: `2px solid ${op.color}`,
                      background: activo ? op.color : "#fff",
                      color: activo ? "#fff" : op.color,
                      fontWeight: "bold",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {op.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <label style={{ display: "block", fontWeight: "bold", fontSize: 14, marginTop: 10, marginBottom: 4 }}>
        Nota opcional para el cliente (alternativa, hora de llegada...):
      </label>
      <textarea
        value={nota}
        onChange={(e) => { setNota(e.target.value); setGuardadoOk(false); }}
        rows={2}
        style={{ width: "100%", padding: 10, borderRadius: 10, border: "1.5px solid #16a34a", fontSize: 14, boxSizing: "border-box" }}
      />

      {errorMsg && (
        <p style={{ color: "#dc2626", fontWeight: "bold", fontSize: 13, marginTop: 8 }}>{errorMsg}</p>
      )}

      {guardadoOk && (
        <div style={{ background: "#dcfce7", border: "2px solid #16a34a", borderRadius: 10, padding: 10, marginTop: 10, fontSize: 14, fontWeight: "bold", color: "#166534" }}>
          ✅ Respuesta enviada al cliente correctamente. Ya puede cerrar esta ventana.
        </div>
      )}

      <button
        type="button"
        disabled={guardando}
        onClick={enviarRespuesta}
        style={{
          width: "100%",
          marginTop: 12,
          padding: 14,
          borderRadius: 12,
          border: "none",
          background: guardando ? "#9ca3af" : "#16a34a",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 16,
          cursor: guardando ? "not-allowed" : "pointer",
        }}
      >
        {guardando ? "⏳ Enviando..." : "📨 Enviar respuesta al cliente"}
      </button>
    </main>
  );
}
