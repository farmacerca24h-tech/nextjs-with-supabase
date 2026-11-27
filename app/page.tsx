"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type FarmaciaRow = {
  pharmacy_key: string;
  titular: string;
  direccion: string;
  codigo_postal: string;
  localidad: string;
  sector: string;
  horario_habitual: string;
  service_status: string;
  lat: number | null;
  lng: number | null;
};

type GuardiaRow = {
  id: number;
  fecha: string;
  localidad: string;
  sector: string;
  direccion: string;
  tipo_guardia: string;
  horario: string;
  titular: string;
  lat: number | null;
  lng: number | null;
};

type FarmaciaItem = {
  key: string;
  nombre: string;
  localidad: string;
  direccion: string;
  horario: string;
  lat: number | null;
  lng: number | null;
};

type EstadoProducto = "EN_STOCK" | "SIN_STOCK" | "BAJO_PEDIDO" | "OTRO";

type SolicitudRow = {
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

type TiempoViaje = {
  cocheMin: number | null;
  andandoMin: number | null;
};

function getAhoraMadrid(): { fecha: string; horaDecimal: number; diaMes: string } {
  const ahora = new Date();
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(ahora);
  const getPart = (t: string) => partes.find((p) => p.type === t)?.value || "00";
  const horaDecimal = Number(getPart("hour")) + Number(getPart("minute")) / 60;
  const fecha = `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
  const diaMes = `${Number(getPart("day"))}/${Number(getPart("month"))}`;
  return { fecha, horaDecimal, diaMes };
}

function getFechaGuardiaActivaMadrid(): string {
  const { fecha, horaDecimal } = getAhoraMadrid();
  if (horaDecimal < 9.5) {
    const d = new Date(fecha + "T12:00:00");
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  return fecha;
}

function normalizar(s: string): string {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function generarUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function iconoEstadoProducto(estado?: EstadoProducto): { texto: string; color: string } {
  if (estado === "EN_STOCK") return { texto: "✓", color: "#16a34a" };
  if (estado === "SIN_STOCK") return { texto: "✗", color: "#dc2626" };
  if (estado === "BAJO_PEDIDO") return { texto: "✏️", color: "#d97706" };
  if (estado === "OTRO") return { texto: "👁", color: "#0284c7" };
  return { texto: "⏳", color: "#6b7280" };
}

const TELEFONO_PRUEBA = "34634467345";
const TAMANO_TANDA = 3;

const FESTIVOS_LOCALES: { [key: string]: string[] } = {
  "Málaga": ["19/8", "8/9"],
  "Coín": ["4/5", "1/6"],
  "Guaro": ["18/5", "31/8"],
  "Alhaurín de la Torre": ["20/1", "24/6"],
  "Alhaurín el Grande": ["29/5", "1/6"],
  "Comares": ["12/1", "25/5"],
  "Antequera": ["21/8", "8/9"],
  "Villanueva de Algaidas": ["15/5", "8/9"],
  "Campillos": ["10/7", "17/8"],
  "Jimera de Líbar": ["7/8", "10/8"],
  "Ronda": ["24/1", "3/9"],
  "Yunquera": ["4/6", "7/10"],
  "Montecorto": ["16/7", "16/10"],
  "Pujerra": ["13/6", "3/11"],
  "Faraján": ["10/8", "9/12"],
  "Júzcar": ["19/3", "6/4"],
  "Benadalid": ["27/4", "7/10"],
  "Carratraca": ["17/8", "7/9"],
  "Marbella": ["11/6", "19/10"],
  "Torremolinos": ["16/7", "29/9"],
  "Benalmádena": ["24/6", "16/7"],
  "Benalmádena Costa": ["24/6", "16/7"],
  "Arroyo de la Miel": ["24/6", "16/7"],
  "Fuengirola": ["16/7", "7/10"],
  "Mijas": ["8/9", "15/10"],
  "Mijas Costa": ["8/9", "15/10"],
  "Las Lagunas": ["8/9", "15/10"],
  "Vélez-Málaga": ["24/6", "29/9"],
  "Torre del Mar": ["24/6", "29/9"],
  "Caleta de Vélez": ["24/6", "29/9"],
  "Almayate": ["24/6", "29/9"],
  "Benajarafe": ["24/6", "29/9"],
  "Torre de Benagalbón": ["24/6", "29/9"],
  "Almáchar": ["4/5", "27/7"],
  "Torrox": ["5/8", "2/10"],
  "Nerja": ["15/5", "24/6"],
  "Rincón de la Victoria": ["2/2", "16/7"],
  "Cuevas del Becerro": ["7/1", "31/8"],
  "Pizarra": ["15/5", "19/8"],
  "Campanillas": ["19/8", "8/9"],
  "Álora": ["7/8", "8/9"],
  "Estepona": ["15/5", "16/7"],
  "San Pedro Alcántara": ["11/6", "19/10"],
  "Benahavís": ["17/8", "7/10"],
  "El Burgo": ["6/4", "28/8"],
};
const FESTIVOS_GENERALES = ["1/1", "6/1", "28/2", "2/4", "3/4", "1/5", "15/8", "12/10", "2/11", "7/12", "8/12", "25/12"];

export default function Page() {
  const [vista, setVista] = useState<"cliente" | "farmacia">("cliente");
  const [localidad, setLocalidad] = useState("");
  const [busquedaCiudad, setBusquedaCiudad] = useState("");
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [busquedaFarmacia, setBusquedaFarmacia] = useState("");
  const [mostrarSugerenciasFarmacias, setMostrarSugerenciasFarmacias] = useState(false);
  const [diurno, setDiurno] = useState(true);
  const [guardia, setGuardia] = useState(false);
  const [festivo, setFestivo] = useState(false);
  const [texto, setTexto] = useState("");
  const [productos, setProductos] = useState<string[]>([]);
  const [errorCiudad, setErrorCiudad] = useState(false);

  const [farmaciasDb, setFarmaciasDb] = useState<FarmaciaRow[]>([]);
  const [guardiasReales, setGuardiasReales] = useState<GuardiaRow[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Geolocalización y tiempos gratuitos OSRM
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{ lat: number; lng: number } | null>(null);
  const [tiemposPorFarmacia, setTiemposPorFarmacia] = useState<Record<string, TiempoViaje>>({});

  // Selección de 3 en 3 sin repetir
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [usadas, setUsadas] = useState<string[]>([]);
  const [enviadasA, setEnviadasA] = useState<string[]>([]);

  // Consultas reales en Supabase + respuestas en directo
  const [consultaGrupoId, setConsultaGrupoId] = useState<string | null>(null);
  const [solicitudesActivas, setSolicitudesActivas] = useState<SolicitudRow[]>([]);
  const [enviandoConsulta, setEnviandoConsulta] = useState(false);

  // 1. Pedir permiso de geolocalización al cargar (si rechaza, se mantiene el orden normal sin tiempos)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicacionUsuario({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setUbicacionUsuario(null);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  // 2. Cargar farmacias y guardias desde Supabase
  useEffect(() => {
    const cargarDatos = async () => {
      setCargandoDatos(true);
      const fechaActiva = getFechaGuardiaActivaMadrid();
      const [farmRes, guardRes] = await Promise.all([
        supabase
          .from("farmacias_malaga")
          .select("pharmacy_key, titular, direccion, codigo_postal, localidad, sector, horario_habitual, service_status, lat, lng")
          .order("localidad", { ascending: true })
          .range(0, 999),
        supabase
          .from("guardias_malaga")
          .select("id, fecha, localidad, sector, direccion, tipo_guardia, horario, titular, lat, lng")
          .eq("fecha", fechaActiva)
          .order("tipo_guardia", { ascending: true }),
      ]);
      if (!farmRes.error && farmRes.data) setFarmaciasDb(farmRes.data as FarmaciaRow[]);
      if (!guardRes.error && guardRes.data) setGuardiasReales(guardRes.data as GuardiaRow[]);
      setCargandoDatos(false);
    };
    cargarDatos();
  }, []);

  // 3. Detectar horario automático (hora de Madrid + festivo general/local)
  useEffect(() => {
    const { horaDecimal, diaMes } = getAhoraMadrid();
    const festivosDeEsaCiudad = FESTIVOS_LOCALES[localidad] || [];
    const esFestivo = FESTIVOS_GENERALES.includes(diaMes) || festivosDeEsaCiudad.includes(diaMes);
    if (esFestivo) {
      setFestivo(true);
      setDiurno(false);
      setGuardia(true);
    } else if (horaDecimal >= 9 && horaDecimal < 21.5) {
      setDiurno(true);
      setGuardia(false);
      setFestivo(false);
    } else {
      setDiurno(false);
      setGuardia(true);
      setFestivo(false);
    }
  }, [localidad]);

  const modoSoloGuardia = guardia && !diurno;

  // Reiniciar selección si el usuario cambia de ciudad o cambia entre Diurno y Guardia
  useEffect(() => {
    setSeleccionadas([]);
    setUsadas([]);
    setEnviadasA([]);
    setMostrarSugerenciasFarmacias(false);
  }, [localidad, modoSoloGuardia]);

  const farmaciasLista: FarmaciaItem[] = useMemo(
    () =>
      farmaciasDb.map((f) => ({
        key: f.pharmacy_key,
        nombre: f.titular || "Farmacia",
        localidad: f.localidad,
        direccion: `${f.direccion}${f.codigo_postal ? ` - ${f.codigo_postal}` : ""}`,
        horario: f.service_status !== "STANDARD" ? f.horario_habitual : "",
        lat: typeof f.lat === "number" ? f.lat : null,
        lng: typeof f.lng === "number" ? f.lng : null,
      })),
    [farmaciasDb]
  );

  // Si una guardia no tiene lat/lng aún, intenta heredarla de farmacias_malaga por localidad + dirección
  const guardiasLista: FarmaciaItem[] = useMemo(
    () =>
      guardiasReales.map((g) => {
        let lat = typeof g.lat === "number" ? g.lat : null;
        let lng = typeof g.lng === "number" ? g.lng : null;
        if (lat === null || lng === null) {
          const dirNorm = normalizar(g.direccion).slice(0, 16);
          const locNorm = normalizar(g.localidad);
          const coincidencia = farmaciasDb.find(
            (f) =>
              typeof f.lat === "number" &&
              typeof f.lng === "number" &&
              normalizar(f.localidad) === locNorm &&
              dirNorm.length >= 6 &&
              normalizar(f.direccion).includes(dirNorm)
          );
          if (coincidencia) {
            lat = coincidencia.lat;
            lng = coincidencia.lng;
          }
        }
        return {
          key: `guardia-${g.id}`,
          nombre:
            g.titular ||
            (g.tipo_guardia === "24H"
              ? "Farmacia de Guardia 24H"
              : "Farmacia Horario Ampliado"),
          localidad: g.localidad,
          direccion: `${g.direccion}${g.sector ? ` (${g.sector})` : ""}`,
          horario: g.horario,
          lat,
          lng,
        };
      }),
    [guardiasReales, farmaciasDb]
  );

  const listaActiva = modoSoloGuardia ? guardiasLista : farmaciasLista;

  const localidades = useMemo(
    () =>
      Array.from(
        new Set([
          ...farmaciasLista.map((f) => f.localidad),
          ...guardiasLista.map((g) => g.localidad),
        ])
      ).sort(),
    [farmaciasLista, guardiasLista]
  );

  const horario =
    [diurno ? "Diurno" : "", guardia ? "De guardia" : "", festivo ? "Festivo" : ""]
      .filter(Boolean)
      .join(", ") || "Diurno";

  // Filtrar por localidad y ordenar por cercanía SOLO si el usuario concedió ubicación
  const filtradas: FarmaciaItem[] = useMemo(() => {
    const base = listaActiva.filter((f) => !localidad || f.localidad === localidad);
    if (!ubicacionUsuario) return base;

    return [...base].sort((a, b) => {
      const distA =
        a.lat !== null && a.lng !== null
          ? distanciaKm(ubicacionUsuario.lat, ubicacionUsuario.lng, a.lat, a.lng)
          : Number.POSITIVE_INFINITY;
      const distB =
        b.lat !== null && b.lng !== null
          ? distanciaKm(ubicacionUsuario.lat, ubicacionUsuario.lng, b.lat, b.lng)
          : Number.POSITIVE_INFINITY;
      return distA - distB;
    });
  }, [listaActiva, localidad, ubicacionUsuario]);

  // 4. Calcular tiempos reales gratis en coche y andando (OSRM) SOLO si hay permiso de ubicación
  const candidatasOsrm = useMemo(() => {
    if (!ubicacionUsuario || !localidad) return [];
    return filtradas.filter((f) => f.lat !== null && f.lng !== null).slice(0, 25);
  }, [ubicacionUsuario, localidad, filtradas]);

  const firmaOsrm = useMemo(
    () => candidatasOsrm.map((f) => f.key).join("|"),
    [candidatasOsrm]
  );

  useEffect(() => {
    if (!ubicacionUsuario || candidatasOsrm.length === 0) {
      setTiemposPorFarmacia({});
      return;
    }

    let cancelado = false;

    const calcularTiempos = async () => {
      const coords = [
        `${ubicacionUsuario.lng},${ubicacionUsuario.lat}`,
        ...candidatasOsrm.map((f) => `${f.lng},${f.lat}`),
      ].join(";");
      const destIndices = candidatasOsrm.map((_, idx) => idx + 1).join(";");

      const fetchPerfil = async (perfilUrl: string): Promise<(number | null)[]> => {
        try {
          const resp = await fetch(
            `${perfilUrl}/${coords}?sources=0&destinations=${destIndices}&annotations=duration`
          );
          if (!resp.ok) return [];
          const data = await resp.json();
          if (data?.code === "Ok" && Array.isArray(data.durations?.[0])) {
            return data.durations[0] as (number | null)[];
          }
        } catch {
          return [];
        }
        return [];
      };

      const [durCoche, durPie] = await Promise.all([
        fetchPerfil("https://routing.openstreetmap.de/routed-car/table/v1/driving"),
        fetchPerfil("https://routing.openstreetmap.de/routed-foot/table/v1/foot"),
      ]);

      if (cancelado) return;

      const mapa: Record<string, TiempoViaje> = {};
      candidatasOsrm.forEach((f, idx) => {
        const segCoche = durCoche[idx];
        const segPie = durPie[idx];
        const cocheMin =
          typeof segCoche === "number" ? Math.max(1, Math.round(segCoche / 60)) : null;
        const andandoMin =
          typeof segPie === "number" ? Math.max(1, Math.round(segPie / 60)) : null;
        if (cocheMin !== null || andandoMin !== null) {
          mapa[f.key] = { cocheMin, andandoMin };
        }
      });
      setTiemposPorFarmacia(mapa);
    };

    calcularTiempos();
    return () => {
      cancelado = true;
    };
  }, [ubicacionUsuario, firmaOsrm, candidatasOsrm]);

  // 5. Recargar y escuchar en tiempo real respuestas de farmacias desde /responder/[id]
  const recargarSolicitudes = useCallback(async (grupoId: string) => {
    const { data, error } = await supabase
      .from("solicitudes_farmacias")
      .select("*")
      .eq("consulta_grupo_id", grupoId);
    if (!error && data) {
      setSolicitudesActivas(data as SolicitudRow[]);
    }
  }, []);

  useEffect(() => {
    if (!consultaGrupoId) return;

    const channel = supabase
      .channel(`solicitudes-${consultaGrupoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "solicitudes_farmacias",
          filter: `consulta_grupo_id=eq.${consultaGrupoId}`,
        },
        (payload) => {
          const actualizada = payload.new as SolicitudRow;
          setSolicitudesActivas((prev) =>
            prev.map((s) => (s.id === actualizada.id ? actualizada : s))
          );
        }
      )
      .subscribe();

    const alVolver = () => {
      if (document.visibilityState === "visible") {
        recargarSolicitudes(consultaGrupoId);
      }
    };
    window.addEventListener("focus", alVolver);
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", alVolver);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [consultaGrupoId, recargarSolicitudes]);

  const sugerencias =
    busquedaCiudad.trim() === ""
      ? localidades
      : localidades.filter((l) => normalizar(l).includes(normalizar(busquedaCiudad)));

  const sugerenciasFarmacias =
    busquedaFarmacia.trim() === ""
      ? filtradas
      : filtradas.filter((f) =>
          normalizar(f.nombre + " " + f.direccion).includes(normalizar(busquedaFarmacia))
        );

  const seleccionadasLista = filtradas.filter((f) => seleccionadas.includes(f.key));
  const disponiblesSinRepetir = filtradas.filter(
    (f) => !usadas.includes(f.key) && !enviadasA.includes(f.key)
  );

  const solicitudPorFarmacia = useMemo(() => {
    const mapa: Record<string, SolicitudRow> = {};
    solicitudesActivas.forEach((s) => {
      mapa[s.farmacia_key] = s;
    });
    return mapa;
  }, [solicitudesActivas]);

  const solicitudesRespondidas = useMemo(
    () => solicitudesActivas.filter((s) => s.estado === "RESPONDIDA"),
    [solicitudesActivas]
  );

  const textoTiempo = (key: string): string => {
    if (!ubicacionUsuario) return "";
    const t = tiemposPorFarmacia[key];
    if (!t) return "";
    const partes: string[] = [];
    if (t.cocheMin !== null) partes.push(`🚗 ${t.cocheMin} min en coche`);
    if (t.andandoMin !== null) partes.push(`🚶 ${t.andandoMin} min andando`);
    return partes.join(" · ");
  };

  const pedirCiudad = () => {
    if (!localidad) {
      setErrorCiudad(true);
      setMostrarSugerencias(true);
      setTimeout(() => setErrorCiudad(false), 3000);
      return false;
    }
    setErrorCiudad(false);
    return true;
  };

  const elegirCiudad = (ciudad: string) => {
    setLocalidad(ciudad);
    setBusquedaCiudad(ciudad);
    setMostrarSugerencias(false);
    setErrorCiudad(false);
    setSeleccionadas([]);
    setUsadas([]);
    setEnviadasA([]);
    setBusquedaFarmacia("");
    setMostrarSugerenciasFarmacias(false);
    setConsultaGrupoId(null);
    setSolicitudesActivas([]);
  };

  const elegirSiguienteTanda = () => {
    const siguientes = disponiblesSinRepetir.slice(0, TAMANO_TANDA).map((f) => f.key);
    if (siguientes.length === 0) return;
    setSeleccionadas(siguientes);
    setUsadas((prev) => Array.from(new Set([...prev, ...siguientes])));
    setMostrarSugerenciasFarmacias(false);
  };

  const reiniciarTandas = () => {
    setSeleccionadas([]);
    setUsadas([]);
    setEnviadasA([]);
    setConsultaGrupoId(null);
    setSolicitudesActivas([]);
  };

  const toggleSeleccion = (key: string) => {
    if (seleccionadas.includes(key)) {
      setSeleccionadas((prev) => prev.filter((x) => x !== key));
      if (!enviadasA.includes(key)) {
        setUsadas((prev) => prev.filter((x) => x !== key));
      }
      return;
    }
    if (usadas.includes(key) || enviadasA.includes(key)) {
      alert("Esta farmacia ya se usó en una tanda anterior. Pulsa Reiniciar si quieres empezar de nuevo.");
      return;
    }
    if (seleccionadas.length >= TAMANO_TANDA) {
      alert("Puedes elegir hasta 3 farmacias por tanda. Quita una o pulsa el botón de siguiente tanda de 3.");
      return;
    }
    setSeleccionadas((prev) => [...prev, key]);
    setUsadas((prev) => Array.from(new Set([...prev, key])));
  };

  const agregarProducto = () => {
    if (!pedirCiudad()) return;
    const limpio = texto.trim();
    if (!limpio) return;
    setProductos((prev) => [...prev, limpio]);
    setTexto("");
  };

  // Botón final de confirmación: guarda en Supabase, genera enlaces /responder/[id] y abre WhatsApp
  const confirmarYEnviarConsulta = async () => {
    if (!pedirCiudad()) return;

    const listaProductos = texto.trim() ? [...productos, texto.trim()] : [...productos];
    if (listaProductos.length === 0) {
      alert("Escribe y añade al menos un medicamento o producto antes de enviar.");
      return;
    }
    if (seleccionadasLista.length === 0) {
      alert("Elige al menos 1 farmacia (o pulsa el botón de elegir 3) antes de enviar.");
      return;
    }

    const confirmar = window.confirm(
      `¿Confirmas enviar la consulta de ${listaProductos.length} producto(s) a ${seleccionadasLista.length} farmacia(s) de ${localidad}?`
    );
    if (!confirmar) return;

    if (texto.trim()) {
      setProductos(listaProductos);
      setTexto("");
    }

    setEnviandoConsulta(true);
    const grupoId = consultaGrupoId || generarUuid();
    setConsultaGrupoId(grupoId);

    const filasInsert = seleccionadasLista.map((f) => ({
      consulta_grupo_id: grupoId,
      localidad,
      horario,
      farmacia_key: f.key,
      farmacia_nombre: f.nombre,
      farmacia_direccion: f.direccion,
      productos: listaProductos,
      respuestas: {},
      nota_farmacia: "",
      estado: "PENDIENTE",
    }));

    const { data, error } = await supabase
      .from("solicitudes_farmacias")
      .insert(filasInsert)
      .select("*");

    setEnviandoConsulta(false);

    if (error || !data) {
      alert("Error al crear el formulario de consulta. Revisa la conexión e inténtalo de nuevo.");
      return;
    }

    const creadas = data as SolicitudRow[];
    setSolicitudesActivas((prev) => {
      const sinDuplicar = prev.filter(
        (p) => !creadas.some((c) => c.farmacia_key === p.farmacia_key)
      );
      return [...sinDuplicar, ...creadas];
    });
    setEnviadasA((prev) => Array.from(new Set([...prev, ...creadas.map((c) => c.farmacia_key)])));
    setUsadas((prev) => Array.from(new Set([...prev, ...creadas.map((c) => c.farmacia_key)])));

    const origen = typeof window !== "undefined" ? window.location.origin : "";
    const enlacesTexto = creadas
      .map((c, idx) => `${idx + 1}. ${c.farmacia_nombre}:\n${origen}/responder/${c.id}`)
      .join("\n\n");

    const mensaje =
      `Hola, soy FarmaCerca 24h. Cliente en ${localidad} (${horario}) consulta disponibilidad de:\n` +
      listaProductos.map((p) => `- ${p}`).join("\n") +
      `\n\nResponde marcando qué tienes en este enlace:\n${enlacesTexto}`;

    window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const enviarWhatsAppIndividual = (f: FarmaciaItem) => {
    if (!pedirCiudad()) return;
    const sol = solicitudPorFarmacia[f.key];
    const origen = typeof window !== "undefined" ? window.location.origin : "";
    const lista = sol?.productos?.length ? sol.productos : productos;
    const enlace = sol ? `\n\nResponder aquí: ${origen}/responder/${sol.id}` : "";
    const mensaje =
      `Hola ${f.nombre}, soy cliente de FarmaCerca 24h en ${localidad || f.localidad} (${horario}). Necesito:\n` +
      (lista.length ? lista.map((p) => `- ${p}`).join("\n") : `- Consulta general`) +
      enlace;
    window.open(`https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const buscarCercanas = () => {
    if (!pedirCiudad()) return;
    setGuardia(false);
    setDiurno(true);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("farmacias en " + localidad)}`,
      "_blank"
    );
  };

  const buscarGuardia = () => {
    if (!pedirCiudad()) return;
    setGuardia(true);
    setDiurno(false);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("farmacia de guardia en " + localidad)}`,
      "_blank"
    );
  };

  const rojoCiudad = errorCiudad && !localidad;

  return (
    <main
      style={{
        maxWidth: 480,
        width: "100%",
        margin: "0 auto",
        padding: 12,
        fontFamily: "sans-serif",
        background: "#fff",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box" }}>
        <img src="/logo.png" alt="Farmacerca 24h - A un mensaje de ti" style={{ height: "80px", width: "auto", maxWidth: "100%", display: "block" }} />
        <button
          type="button"
          onClick={() => alert("Para descargar el acceso directo: en tu móvil pulsa Compartir y luego Añadir a pantalla de inicio.")}
          style={{ background: "#0090ff", color: "#fff", border: "none", padding: "12px 12px", borderRadius: 10, fontWeight: "bold", fontSize: 14, width: "100%", boxSizing: "border-box", whiteSpace: "normal", textAlign: "center" }}
        >
          ⬇ Descargar acceso directo
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <button
          type="button"
          onClick={() => setVista("cliente")}
          style={{ flex: 1, padding: 10, borderRadius: 10, background: vista === "cliente" ? "#16a34a" : "#eee", color: vista === "cliente" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}
        >
          👤 Soy CLIENTE
        </button>
        <button
          type="button"
          onClick={() => setVista("farmacia")}
          style={{ flex: 1, padding: 10, borderRadius: 10, background: vista === "farmacia" ? "#0ea5e9" : "#eee", color: vista === "farmacia" ? "#fff" : "#000", border: "none", fontWeight: "bold" }}
        >
          🏪 Soy FARMACIA (Prueba)
        </button>
      </div>

      {vista === "cliente" && (
        <>
          <p style={{ fontWeight: "bold", margin: "8px 0 4px", fontSize: 18 }}>1º Elige tu ciudad o pedanía:</p>
          <div style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
            <input
              value={busquedaCiudad}
              onChange={(e) => {
                setBusquedaCiudad(e.target.value);
                setMostrarSugerencias(true);
                setErrorCiudad(false);
                if (e.target.value === "") setLocalidad("");
              }}
              onFocus={() => setMostrarSugerencias(true)}
              placeholder="🔍 Escribe tu ciudad... ej: Vélez-Málaga"
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: rojoCiudad ? "3px solid #dc2626" : "2px solid #16a34a",
                fontSize: 16,
                background: rojoCiudad ? "#fee2e2" : "#f0fdf4",
                boxSizing: "border-box",
              }}
            />
            {localidad && (
              <button
                type="button"
                onClick={() => {
                  setLocalidad("");
                  setBusquedaCiudad("");
                  setSeleccionadas([]);
                  setUsadas([]);
                  setEnviadasA([]);
                  setBusquedaFarmacia("");
                  setConsultaGrupoId(null);
                  setSolicitudesActivas([]);
                }}
                style={{ position: "absolute", right: 10, top: 10, background: "#eee", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: 14 }}
              >
                ❌
              </button>
            )}
            {mostrarSugerencias && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "2px solid #16a34a", borderTop: "none", borderRadius: "0 0 12px 12px", maxHeight: 220, overflowY: "auto", zIndex: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", boxSizing: "border-box" }}>
                {sugerencias.length === 0 && (
                  <div style={{ padding: 12, fontSize: 14, color: "#666" }}>
                    No hay ninguna ciudad con ese nombre. Prueba con otra.
                  </div>
                )}
                {sugerencias.map((l) => (
                  <div
                    key={l}
                    onClick={() => elegirCiudad(l)}
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #eee",
                      fontSize: 16,
                      cursor: "pointer",
                      background: localidad === l ? "#f0fdf4" : "#fff",
                      fontWeight: localidad === l ? "bold" : "normal",
                    }}
                  >
                    📍 {l}{" "}
                    <span style={{ color: "#16a34a", fontSize: 13 }}>
                      ({listaActiva.filter((f) => f.localidad === l).length})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {localidad && (
            <p style={{ fontSize: 13, color: "#16a34a", fontWeight: "bold", margin: "6px 0 0" }}>
              ✅ Has elegido: {localidad} ({filtradas.length} farmacias{ubicacionUsuario ? " • ordenadas por cercanía" : ""})
            </p>
          )}

          <p style={{ fontWeight: "bold", margin: "12px 0 6px", fontSize: 17 }}>Para el Chat, marcar si estamos en horario:</p>
          <div style={{ display: "flex", flexWrap: "nowrap", justifyContent: "space-between", alignItems: "center", gap: 4, width: "100%", boxSizing: "border-box", fontSize: 13, fontWeight: "bold" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", flexShrink: 0 }}>
              <input type="checkbox" checked={diurno} onChange={() => setDiurno(!diurno)} style={{ width: 18, height: 18, margin: 0 }} /> ☀️ Diurno
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", flexShrink: 0 }}>
              <input type="checkbox" checked={guardia} onChange={() => setGuardia(!guardia)} style={{ width: 18, height: 18, margin: 0 }} /> 🌙 Guardia
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap", flexShrink: 0 }}>
              <input type="checkbox" checked={festivo} onChange={() => setFestivo(!festivo)} style={{ width: 18, height: 18, margin: 0 }} /> 📅 Festivo
            </label>
          </div>

          <p style={{ fontWeight: "bold", margin: "14px 0 6px", fontSize: 18 }}>
            2º Elige farmacias (de 3 en 3 sin repetir):
          </p>

          {localidad && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <button
                type="button"
                onClick={elegirSiguienteTanda}
                disabled={disponiblesSinRepetir.length === 0}
                style={{
                  flex: 1,
                  background: disponiblesSinRepetir.length > 0 ? "#16a34a" : "#9ca3af",
                  color: "#fff",
                  border: "none",
                  padding: "11px 10px",
                  borderRadius: 10,
                  fontWeight: "bold",
                  fontSize: 13,
                  cursor: disponiblesSinRepetir.length > 0 ? "pointer" : "not-allowed",
                }}
              >
                {disponiblesSinRepetir.length > 0
                  ? `🎯 Elegir siguientes ${Math.min(TAMANO_TANDA, disponiblesSinRepetir.length)}${ubicacionUsuario ? " más cercanas" : ""} (${disponiblesSinRepetir.length} quedan)`
                  : `✅ Todas elegidas (${filtradas.length}/${filtradas.length})`}
              </button>
              {usadas.length > 0 && (
                <button
                  type="button"
                  onClick={reiniciarTandas}
                  style={{
                    background: "#fff",
                    color: "#16a34a",
                    border: "2px solid #16a34a",
                    padding: "10px 10px",
                    borderRadius: 10,
                    fontWeight: "bold",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  🔄 Reiniciar
                </button>
              )}
            </div>
          )}

          <div style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
            <input
              value={busquedaFarmacia}
              onChange={(e) => {
                setBusquedaFarmacia(e.target.value);
                setMostrarSugerenciasFarmacias(true);
              }}
              onFocus={() => {
                if (!localidad) pedirCiudad();
                else setMostrarSugerenciasFarmacias(true);
              }}
              placeholder={
                localidad
                  ? `🔍 Ver o buscar entre las ${filtradas.length} farmacias...`
                  : "🔒 Primero elige tu ciudad arriba..."
              }
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "2px solid #16a34a", fontSize: 16, background: "#f0fdf4", boxSizing: "border-box" }}
            />
            {busquedaFarmacia && (
              <button
                type="button"
                onClick={() => {
                  setBusquedaFarmacia("");
                  setMostrarSugerenciasFarmacias(true);
                }}
                style={{ position: "absolute", right: 10, top: 10, background: "#eee", border: "none", borderRadius: "50%", width: 28, height: 28, fontSize: 14 }}
              >
                ❌
              </button>
            )}
            {mostrarSugerenciasFarmacias && localidad && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "2px solid #16a34a", borderTop: "none", borderRadius: "0 0 12px 12px", maxHeight: 280, overflowY: "auto", zIndex: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", boxSizing: "border-box" }}>
                {sugerenciasFarmacias.length === 0 && (
                  <div style={{ padding: 12, fontSize: 14, color: "#666" }}>
                    No hay ninguna farmacia con ese nombre en {localidad}.
                  </div>
                )}
                {sugerenciasFarmacias.map((f, idx) => {
                  const esta = seleccionadas.includes(f.key);
                  const yaEnviada = enviadasA.includes(f.key);
                  const yaUsadaAntes = !esta && (usadas.includes(f.key) || yaEnviada);
                  const tiempo = textoTiempo(f.key);
                  return (
                    <div
                      key={f.key}
                      onClick={() => {
                        if (!yaUsadaAntes) toggleSeleccion(f.key);
                      }}
                      style={{
                        padding: "11px 12px",
                        borderBottom: "1px solid #eee",
                        fontSize: 14,
                        cursor: yaUsadaAntes ? "not-allowed" : "pointer",
                        background: esta ? "#dcfce7" : yaUsadaAntes ? "#f3f4f6" : "#fff",
                        opacity: yaUsadaAntes ? 0.65 : 1,
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ fontSize: 17 }}>{esta ? "✅" : yaUsadaAntes ? "🔒" : "🏪"}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ display: "block", lineHeight: 1.3 }}>
                          {idx + 1}. {f.nombre}
                        </b>
                        <span style={{ fontSize: 12, color: "#555", display: "block", marginTop: 2, lineHeight: 1.3 }}>
                          📍 {f.direccion}
                        </span>
                        {tiempo && (
                          <span style={{ fontSize: 12, color: "#15803d", fontWeight: "bold", display: "block", marginTop: 2 }}>
                            {tiempo}
                          </span>
                        )}
                        {f.horario && (
                          <span style={{ fontSize: 12, color: "#0369a1", fontWeight: "bold", display: "block" }}>
                            🕒 {f.horario}
                          </span>
                        )}
                        {esta && (
                          <span style={{ fontSize: 12, color: "#166534", fontWeight: "bold", display: "block" }}>
                            ✅ En tanda actual (pulsa para quitar)
                          </span>
                        )}
                        {yaUsadaAntes && (
                          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: "bold", display: "block" }}>
                            {yaEnviada ? "📨 Ya consultada (no repetir)" : "✓ Ya usada en tanda anterior"}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
                <div
                  onClick={() => setMostrarSugerenciasFarmacias(false)}
                  style={{ padding: 12, textAlign: "center", background: "#16a34a", color: "#fff", fontWeight: "bold", fontSize: 14, cursor: "pointer" }}
                >
                  ✅ Listo, cerrar
                </div>
              </div>
            )}
          </div>
          {seleccionadas.length > 0 && (
            <p style={{ fontSize: 13, color: "#16a34a", fontWeight: "bold", margin: "6px 0 0" }}>
              ✅ {seleccionadas.length}/{TAMANO_TANDA} farmacia{seleccionadas.length > 1 ? "s" : ""} en esta tanda • {disponiblesSinRepetir.length} sin usar
            </p>
          )}

          <h3 style={{ color: localidad ? "#16a34a" : "#999", fontSize: 20, margin: "14px 0 8px" }}>
            3º Añade tus medicamentos o productos {!localidad && "🔒"}
          </h3>
          <div
            onClick={() => {
              if (!localidad) pedirCiudad();
            }}
            style={{
              display: "flex",
              border: `2px solid ${localidad ? "#16a34a" : "#ccc"}`,
              borderRadius: 12,
              overflow: "hidden",
              background: localidad ? "#f0fdf4" : "#f5f5f5",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  agregarProducto();
                }
              }}
              onFocus={() => {
                if (!localidad) pedirCiudad();
              }}
              placeholder={
                localidad
                  ? "🔍 Escribe un producto y pulsa + Añadir..."
                  : "🔒 Primero elige tu ciudad arriba..."
              }
              style={{ flex: 1, minWidth: 0, padding: 14, border: "none", background: "transparent", fontSize: 16 }}
            />
            <button
              type="button"
              onClick={agregarProducto}
              style={{ background: localidad ? "#16a34a" : "#999", color: "#fff", border: "none", padding: "0 16px", fontWeight: "bold", fontSize: 16, whiteSpace: "nowrap", cursor: "pointer" }}
            >
              + Añadir
            </button>
          </div>

          {productos.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", background: "#f0fdf4", padding: 10, borderRadius: 10, marginTop: 8, border: "1px solid #bbf7d0" }}>
              <span>💊 {p}</span>
              <button
                type="button"
                onClick={() => setProductos(productos.filter((_, x) => x !== i))}
                style={{ border: "none", background: "none", fontSize: 16, cursor: "pointer" }}
              >
                ❌
              </button>
            </div>
          ))}

          {localidad && (
            <button
              type="button"
              disabled={enviandoConsulta}
              onClick={confirmarYEnviarConsulta}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "14px 12px",
                borderRadius: 12,
                border: "none",
                background:
                  enviandoConsulta || (productos.length === 0 && !texto.trim()) || seleccionadasLista.length === 0
                    ? "#9ca3af"
                    : "#15803d",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 15,
                cursor: enviandoConsulta ? "not-allowed" : "pointer",
                boxSizing: "border-box",
              }}
            >
              {enviandoConsulta
                ? "⏳ Creando formularios..."
                : `📲 Confirmar y enviar consulta (${productos.length + (texto.trim() ? 1 : 0)} prod. a ${seleccionadasLista.length} farm.)`}
            </button>
          )}

          {/* Panel de respuestas recibidas en tiempo real */}
          {solicitudesActivas.length > 0 && (
            <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", borderRadius: 12, padding: 10, marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <b style={{ fontSize: 15, color: "#166534" }}>
                  📩 Respuestas de farmacias ({solicitudesRespondidas.length}/{solicitudesActivas.length})
                </b>
                {consultaGrupoId && (
                  <button
                    type="button"
                    onClick={() => recargarSolicitudes(consultaGrupoId)}
                    style={{ background: "#fff", color: "#16a34a", border: "1px solid #16a34a", borderRadius: 8, padding: "4px 8px", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}
                  >
                    🔄 Actualizar
                  </button>
                )}
              </div>

              {solicitudesRespondidas.length === 0 ? (
                <p style={{ fontSize: 13, color: "#4b5563", margin: "6px 0 0" }}>
                  ⏳ Esperando a que las farmacias marquen disponibilidad en el formulario...
                </p>
              ) : (
                solicitudesRespondidas.map((s) => {
                  const enStock = s.productos.filter((p) => s.respuestas?.[p] === "EN_STOCK");
                  const bajoPedido = s.productos.filter((p) => s.respuestas?.[p] === "BAJO_PEDIDO");
                  const otro = s.productos.filter((p) => s.respuestas?.[p] === "OTRO");
                  const sinStock = s.productos.filter((p) => s.respuestas?.[p] === "SIN_STOCK");
                  return (
                    <div key={s.id} style={{ background: "#fff", border: "1px solid #86efac", borderRadius: 10, padding: 8, marginTop: 8, fontSize: 13 }}>
                      <b style={{ display: "block", color: "#166534" }}>🏪 {s.farmacia_nombre}</b>
                      {enStock.length > 0 && (
                        <div style={{ color: "#15803d", fontWeight: "bold", marginTop: 3 }}>
                          ✓ Tiene en stock: {enStock.join(", ")}
                        </div>
                      )}
                      {bajoPedido.length > 0 && (
                        <div style={{ color: "#b45309", marginTop: 2 }}>
                          ✏️ Bajo pedido: {bajoPedido.join(", ")}
                        </div>
                      )}
                      {otro.length > 0 && (
                        <div style={{ color: "#0369a1", marginTop: 2 }}>
                          👁 Alternativa disponible: {otro.join(", ")}
                        </div>
                      )}
                      {sinStock.length > 0 && (
                        <div style={{ color: "#dc2626", marginTop: 2 }}>
                          ✗ Sin stock: {sinStock.join(", ")}
                        </div>
                      )}
                      {s.nota_farmacia && (
                        <div style={{ color: "#374151", marginTop: 4, fontStyle: "italic" }}>
                          💬 Nota: {s.nota_farmacia}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          <p style={{ fontWeight: "bold", fontSize: 14, margin: "10px 0 6px" }}>
            <span style={{ color: "#16a34a" }}>✓</span> en stock &nbsp;{" "}
            <span style={{ color: "#dc2626" }}>✗</span> Sin stock &nbsp; 👁 otro &nbsp; ✏️ Bajo pedido
          </p>

          {cargandoDatos && (
            <p style={{ fontSize: 13, color: "#16a34a", fontWeight: "bold" }}>⏳ Cargando farmacias actualizadas...</p>
          )}

          {!localidad ? (
            <div style={{ border: "2px dashed #ccc", borderRadius: 10, padding: 14, textAlign: "center", background: "#fffbeb" }}>
              <p style={{ fontSize: 16, fontWeight: "bold", margin: 0, color: "#333" }}>🔴 Elige tu ciudad o pedanía</p>
              <p style={{ fontSize: 13, margin: "6px 0 0" }}>
                Aquí saldrán las farmacias cuando elijas tu ciudad en el buscador de arriba.
              </p>
            </div>
          ) : (
            seleccionadasLista.map((f, idx) => {
              const sol = solicitudPorFarmacia[f.key];
              const respondida = sol?.estado === "RESPONDIDA";
              const yaEnviada = enviadasA.includes(f.key);
              const tiempo = textoTiempo(f.key);
              const productosTarjeta =
                sol?.productos?.length ? sol.productos : productos.length ? productos : ["Añade un producto arriba"];

              return (
                <div
                  key={f.key}
                  style={{
                    border: respondida ? "3px solid #15803d" : "2px solid #16a34a",
                    borderRadius: 10,
                    padding: 8,
                    marginTop: 8,
                    display: "flex",
                    gap: 8,
                    boxSizing: "border-box",
                    minHeight: 132,
                    alignItems: "stretch",
                    background: respondida ? "#dcfce7" : "#f0fdf4",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ background: "#16a34a", color: "#fff", width: 32, height: 32, minWidth: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 18 }}>
                      {idx + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSeleccion(f.key)}
                      style={{ background: "#fff", border: "1px solid #ccc", borderRadius: 6, fontSize: 11, padding: "4px 6px", cursor: "pointer" }}
                    >
                      Quitar ❌
                    </button>
                  </div>

                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <b style={{ fontSize: 14, lineHeight: 1.2, display: "block" }}>{f.nombre}</b>
                      <span style={{ fontSize: 12, lineHeight: 1.3, display: "block", marginTop: 3 }}>
                        📍 {f.direccion} - {f.localidad}
                      </span>
                      {tiempo && (
                        <span style={{ fontSize: 12, color: "#15803d", fontWeight: "bold", display: "block", marginTop: 2 }}>
                          {tiempo}
                        </span>
                      )}
                      {f.horario && (
                        <span style={{ fontSize: 12, color: "#0369a1", fontWeight: "bold", display: "block", marginTop: 2 }}>
                          🕒 {f.horario}
                        </span>
                      )}
                      {yaEnviada && !respondida && (
                        <span style={{ fontSize: 12, color: "#15803d", fontWeight: "bold", display: "block", marginTop: 3 }}>
                          ⏳ Consulta enviada • esperando respuesta
                        </span>
                      )}
                      {respondida && (
                        <span style={{ fontSize: 12, color: "#166534", fontWeight: "bold", display: "block", marginTop: 3 }}>
                          ✅ ¡Respuesta recibida!
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => enviarWhatsAppIndividual(f)}
                        style={{ background: "#16a34a", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 8, fontWeight: "bold", fontSize: 12, cursor: "pointer" }}
                      >
                        💬 WhatsApp
                      </button>
                      {sol && (
                        <button
                          type="button"
                          onClick={() => window.open(`/responder/${sol.id}`, "_blank")}
                          style={{ background: "#fff", color: "#0369a1", border: "1.5px solid #0369a1", padding: "5px 8px", borderRadius: 8, fontWeight: "bold", fontSize: 11, cursor: "pointer" }}
                        >
                          📋 Formulario
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ borderLeft: "1.5px solid #ccc", paddingLeft: 8, width: 124, minWidth: 124, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5, fontSize: 12, lineHeight: 1.3 }}>
                      {productosTarjeta.slice(0, 4).map((prod, pIdx) => {
                        const simbolo = sol
                          ? iconoEstadoProducto(sol.respuestas?.[prod])
                          : { texto: "•", color: "#6b7280" };
                        return (
                          <div key={pIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                            <span style={{ flex: 1, textAlign: "left", wordBreak: "break-word" }}>{prod}</span>
                            <span style={{ color: simbolo.color, fontWeight: "bold", fontSize: 15, minWidth: 18, textAlign: "center" }}>
                              {simbolo.texto}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!pedirCiudad()) return;
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Farmacia " + f.nombre + " " + f.direccion)}`,
                          "_blank"
                        );
                      }}
                      style={{ background: "#0090ff", color: "#fff", border: "none", padding: "7px 6px", borderRadius: 8, marginTop: 8, fontWeight: "bold", width: "100%", fontSize: 12, cursor: "pointer" }}
                    >
                      ✈ Cómo llegar
                    </button>
                  </div>
                </div>
              );
            })
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={buscarGuardia}
              style={{ flex: 1, padding: 8, borderRadius: 10, fontWeight: "bold", background: "#dbeafe", border: "1.5px solid #0090ff", fontSize: 13, color: "#000" }}
            >
              🌙 Farmacias de guardia →<br />
              <span style={{ fontWeight: "normal", fontSize: 11 }}>
                {localidad ? "Guardias de hoy en Maps" : "🔴 Elige ciudad primero"}
              </span>
            </button>
            <button
              type="button"
              onClick={buscarCercanas}
              style={{ flex: 1, padding: 8, borderRadius: 10, fontWeight: "bold", background: "#e6f7ee", border: "1.5px solid #16a34a", fontSize: 13, color: "#000" }}
            >
              📍 Farmacias cercanas →<br />
              <span style={{ fontWeight: "normal", fontSize: 11 }}>
                {localidad ? "Cerca de ti en Maps" : "🔴 Elige ciudad primero"}
              </span>
            </button>
          </div>

          <div style={{ background: "#e6f7ee", border: "1.5px solid #16a34a", borderRadius: 10, padding: 8, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 13 }}>
                <b>Contacto FarmaCerca 24 h</b>
                <br />
                <span style={{ fontSize: 12 }}>¿Dudas o ayuda? Pulsa para escribirnos.</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  window.open(
                    `https://wa.me/${TELEFONO_PRUEBA}?text=${encodeURIComponent("Hola FarmaCerca 24h, tengo una duda, ¿me ayudáis?")}`,
                    "_blank"
                  )
                }
                style={{ background: "#fff", color: "#16a34a", border: "1.5px solid #16a34a", padding: "6px 10px", borderRadius: 8, fontWeight: "bold", fontSize: 13, whiteSpace: "nowrap" }}
              >
                💬 Chat →
              </button>
            </div>
            <div style={{ background: "#fff", border: "1px solid #16a34a", borderRadius: 8, padding: 8, marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>✉️ E-mail: contacto@farmacerca24h.es</span>
              <span style={{ color: "#16a34a", fontWeight: "bold" }}>Pulsa →</span>
            </div>
          </div>
        </>
      )}

      {vista === "farmacia" && (
        <div>
          <p style={{ background: "#e0f2fe", padding: 10, borderRadius: 10 }}>
            🏪 <b>Vista FARMACIA - Prueba</b>
            <br />
            Aquí puedes abrir directamente el formulario real que recibe cada farmacia tras pulsar <b>Confirmar y enviar consulta</b>:
          </p>
          {solicitudesActivas.length === 0 ? (
            <div style={{ background: "#fffbeb", border: "1.5px solid #f59e0b", padding: 12, borderRadius: 12, fontSize: 14 }}>
              Todavía no has confirmado ninguna consulta en la vista <b>Soy CLIENTE</b>. Elige ciudad, farmacias, añade productos y pulsa <b>Confirmar y enviar consulta</b> para generar aquí los enlaces de prueba.
            </div>
          ) : (
            solicitudesActivas.map((s, idx) => (
              <div key={s.id} style={{ border: "1.5px solid #16a34a", borderRadius: 12, padding: 10, marginTop: 10, background: "#f0fdf4" }}>
                <b style={{ display: "block" }}>
                  {idx + 1}. {s.farmacia_nombre} ({s.localidad})
                </b>
                <span style={{ fontSize: 12, color: "#4b5563", display: "block", marginTop: 2 }}>
                  Estado: <b>{s.estado}</b> • Productos: {s.productos.join(", ")}
                </span>
                <button
                  type="button"
                  onClick={() => window.open(`/responder/${s.id}`, "_blank")}
                  style={{ marginTop: 8, width: "100%", padding: 10, background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}
                >
                  📋 Abrir formulario de esta farmacia →
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <footer style={{ textAlign: "center", padding: "12px 0 6px" }}>
        <img src="/logo.png" alt="Farmacerca 24h - A un mensaje de ti" style={{ height: "62px", width: "auto", display: "block", margin: "0 auto" }} />
        <div style={{ background: "#e6f7ee", border: "1.5px solid #16a34a", borderRadius: 16, padding: 8, margin: "8px 0", fontWeight: "bold", fontSize: 13 }}>
          Aviso Legal &nbsp;•&nbsp; Privacidad &nbsp;•&nbsp; Términos &nbsp;•&nbsp; Cookies
        </div>
        <p style={{ fontSize: 12 }}>
          Farmacerca 24 h solo informa de disponibilidad.
          <br />
          La venta y dispensación la realiza la farmacia autorizada.
        </p>
        <p style={{ fontSize: 11, color: "#666" }}>
          {farmaciasLista.length} farmacias • {localidades.length} ciudades y pedanías
        </p>
      </footer>
    </main>
  );
}
