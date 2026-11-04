"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Farmacia = {
  id: number;
  nombre: string;
  pueblo: string;
  direccion: string;
  telefono: string;
  guardia: string | null;
};

const PUEBLOS = ["Vélez-Málaga", "Torre del Mar", "Algarrobo", "Torrox", "Nerja", "Rincón de la Victoria"];

export default function Home() {
  const [puebloSel, setPuebloSel] = useState("Vélez-Málaga");
  const [hoy, setHoy] = useState("");
  const [farmacias, setFarmacias] = useState<Farmacia[]>([]);
  const [cargando, setCargando] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    setHoy(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const { data } = await supabase
        .from("farmacias")
        .select("*")
        .eq("pueblo", puebloSel);

      if (data) {
        setFarmacias(data as Farmacia[]);
      } else {
        setFarmacias([]);
      }
      setCargando(false);
    }
    cargar();
  }, [puebloSel]);

  const deGuardia = farmacias.filter((f) => f.guardia === hoy);
  const resto = farmacias.filter((f) => f.guardia !== hoy);

  return (
    <main className="min-h-screen bg-white p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center">💊 Farmacerca24h</h1>
      <p className="text-center text-gray-600 mt-1">
        Encuentra tu farmacia de guardia
      </p>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-1">Elige tu pueblo</label>
        <select
          value={puebloSel}
          onChange={(e) => setPuebloSel(e.target.value)}
          className="w-full border rounded-lg p-3"
        >
          {PUEBLOS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">
        Hoy: {hoy || "cargando..."} - {puebloSel}
      </p>

      {cargando ? (
        <p className="text-center mt-8">Cargando farmacias...</p>
      ) : (
        <>
          <h2 className="text-xl font-bold mt-8 mb-3 text-green-700">
            🟢 De guardia hoy
          </h2>
          {deGuardia.length === 0 ? (
            <p className="bg-green-50 border border-green-200 rounded-lg p-4">
              No hay farmacia de guardia registrada hoy en {puebloSel}.
            </p>
          ) : (
            deGuardia.map((f) => (
              <div key={f.id} className="border rounded-lg p-4 mb-3 bg-green-50">
                <p className="font-bold">{f.nombre}</p>
                <p className="text-sm">{f.direccion}</p>
                <p className="text-sm">📞 {f.telefono}</p>
              </div>
            ))
          )}

          <h2 className="text-xl font-bold mt-8 mb-3">Todas en {puebloSel}</h2>
          {resto.map((f) => (
            <div key={f.id} className="border rounded-lg p-4 mb-3">
              <p className="font-bold">{f.nombre}</p>
              <p className="text-sm">{f.direccion}</p>
              <p className="text-sm">📞 {f.telefono}</p>
            </div>
          ))}
        </>
      )}
    </main>
  );
}
