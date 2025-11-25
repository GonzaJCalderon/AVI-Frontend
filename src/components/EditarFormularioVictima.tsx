"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { useMemo } from "react";

// Material UI
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  Snackbar,
} from "@mui/material";

import MuiAlert from "@mui/material/Alert";

// Servicios
import { actualizarIntervencion, listarIntervenciones } from "@/services/intervenciones";

// Tipado que te está faltando
import type { IntervencionItem } from "@/types/intervencion"; // 🔁 Asegurate de tener este tipo definido

/** ========================
 *  Tipos flexibles (API)
 *  ======================== */
export type IntervencionDetalle = {
  id: number;
  numero_intervencion?: string;
  fecha?: string;
  coordinador?: string;
  operador?: string;
  resena_hecho?: string;
  derivaciones?: Array<{
    id?: number;
    tipo_derivacion_id?: number;
    derivador?: string;
    fecha_derivacion?: string;
    motivos?: number;
    tipo_derivaciones?: { descripcion?: string };
  }>;
  hechoDelictivo?: {
    expediente?: string;
    numAgresores?: number;
    ubicacion?: { calleBarrio?: string; departamento?: number | string };
    tipoHecho?: Record<string, any>;
    geo?: Array<{
      domicilio?: string;
      departamento_id?: number | string;
      fecha?: string;
    }>;
    relaciones?: Array<Record<string, boolean>>;
  };
  hechos_delictivos?: Array<{
    id?: number;
    expediente?: string;
    num_agresores?: number;
    geo?: Array<{
      domicilio?: string;
      departamento_id?: number | string;
      localidad_id?: number | string; 
      fecha?: string;
    }>;
    relaciones?: Array<Record<string, boolean>>;
  }>;
  acciones_primera_linea?: Array<{ id?: number; acciones?: string }>;
  abusos_sexuales?: Array<{
    id?: number;
    tipo_abuso?: number;
    datos?: Array<{
      kit?: string;
      relacion?: string;
      relacion_otro?: string;
      lugar_hecho?: string;
      lugar_otro?: string;
    }>;
  }>;
  intervenciones_tipo?: Array<{
    id?: number;
    crisis?: boolean;
    telefonica?: boolean;
    domiciliaria?: boolean;
    psicologica?: boolean;
    medica?: boolean;
    social?: boolean;
    legal?: boolean;
    sin_intervencion?: boolean;
    archivo_caso?: boolean;
  }>;
  seguimientos?: Array<{
    id?: number;
    hubo?: boolean;
    tipo?: Array<{
      id?: number;
      asesoramientolegal?: boolean;
      tratamientopsicologico?: boolean;
      seguimientolegal?: boolean;
      archivocaso?: boolean;
    }>;
    detalles?: Array<{ id?: number; detalle?: string }>;
  }>;
  victimas?: Array<{
    id?: number;
    dni?: string;
    nombre?: string;
    genero?: number | string;
    genero_id?: number | string;
    fecha_nacimiento?: string;
    telefono?: string;
    ocupacion?: string;
    direccion?: {
      calle_nro?: string;
      barrio?: string;
      departamento?: number | string;
      localidad?: number | string;
    };
    personas_entrevistadas?: Array<{
      nombre?: string;
      relacion_victima?: string;
      direccion?: {
        calle_nro?: string;
        barrio?: string;
        departamento?: number | string;
        localidad?: number | string;
      };
    }>;
  }>;
};

/** ========================
 *  Helpers de fecha/hora
 *  ======================== */
const toDateInput = (value?: string | null) => {
  if (!value || value === null) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};


const toTimeInput = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${toDateInput(value)}T${toTimeInput(value)}`;
};

const toValidPositiveNumber = (v: string | number | ""): number => {
  const n = Number(v);
  return !isNaN(n) && n > 0 ? n : 0; // Siempre devuelve un número (0 si no es válido)
};

// ✅ O si prefieres que sea opcional en el payload, usa esta versión:
const toOptionalPositiveNumber = (v: string | number | ""): number | null => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return !isNaN(n) && n > 0 ? n : null;
};

// 🔍 Buscar nombre de un departamento por su ID
function getNombreDepartamento(
  id: string | number,
  departamentos: { id: string; nombre: string }[]
): string {
  const dep = departamentos.find((d) => String(d.id) === String(id));
  return dep?.nombre ?? "";
}

// 🔍 Buscar nombre de una localidad por su ID
function getNombreLocalidad(
  id: string | number,
  localidades: { id: string; nombre: string; departamento_id: string }[]
): string {
  const loc = localidades.find((l) => String(l.id) === String(id));
  return loc?.nombre ?? "";
}

const sanitizeNumber = (v: any): number | null => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

// ✅ Crea un objeto con una key numérica solo si hay número (evita undefined)
const withNumber = <K extends string>(key: K, maybe: number | null) =>
  maybe !== null ? ({ [key]: maybe } as Record<K, number>) : {};

/** ========================
 *  Catálogos
 *  ======================== */
const motivosDerivacion = [
  { value: 1, label: "CEO-911" },
  { value: 2, label: "Ministerio Público Fiscal" },
  { value: 3, label: "Hospital" },
  { value: 4, label: "Ministerio de Seguridad" },
  { value: 5, label: "Centro de Salud" },
  { value: 6, label: "Municipio" },
  { value: 7, label: "Demanda Espontanea" },
  { value: 8, label: "Otro" },
];

/** ========================
 *  Estado plano
 *  ======================== */
type FormState = {
  fechaIntervencion: string;
  coordinador: string;
  operador: string;
  observaciones: string;
  derivadorNombre: string;
  horaDerivacion: string;
  motivoDerivacion: number | "";
  motivoDerivacionOtro: string;  // 👈 NUEVA LÍNEA
  nroExpediente: string;
  nroAgresores: string;
  robo: boolean;
  roboArmaFuego: boolean;
  roboArmaBlanca: boolean;
  amenazas: boolean;
  lesiones: boolean;
  lesionesArmaFuego: boolean;
  lesionesArmaBlanca: boolean;
  homicidioDelito: boolean;
  homicidioAccidenteVial: boolean;
  homicidioAvHecho: boolean;
  femicidio: boolean;
  transfemicidio: boolean;
  violenciaGenero: boolean;
  otros: boolean;
  departamentoHecho: string | number | "";
  localidadHecho: string | number | "";
  calleBarrioHecho: string;
  fechaHecho: string;
  horaHecho: string;
  accionesPrimeraLinea: string;
  abusoSexualSimple: boolean;
  abusoSexualAgravado: boolean;
  kitAplicado: "si" | "no" | "";
  relacionAgresor:
    | "Conocido"
    | "Desconocido"
    | "Familiar"
    | "Pareja"
    | "Otro"
    | "";
  otroRelacion: string;
  tipoLugar:
    | "Institución"
    | "Vía Pública"
    | "Domicilio Particular"
    | "Lugar de Trabajo"
    | "Otro"
    | "";
  otroLugar: string;
  dni: string;
  nombreVictima: string;
  genero: string | number | "";
  fechaNacimiento: string;
  telefono: string;
  calleNro: string;
  barrio: string;
  departamento: string | number | "";
  localidad: string | number | "";
  ocupacion: string;
  entrevistadoNombre: string;
  entrevistadoCalle: string;
  entrevistadoBarrio: string;
  entrevistadoDepartamento: string | number | "";
  entrevistadoLocalidad: string | number | "";
  entrevistadoRelacion: string;
  crisis: boolean;
  telefonica: boolean;
  domiciliaria: boolean;
  psicologica: boolean;
  medica: boolean;
  social: boolean;
  legal: boolean;
  sinIntervencion: boolean;
  archivoCaso: boolean;
  seguimientoRealizado: "si" | "no" | "";
  segAsesoramientoLegal: boolean;
  segTratamientoPsicologico: boolean;
  segSeguimientoLegal: boolean;
  segArchivoCaso: boolean;
  detalleSeguimiento: string;
};

/** ========================
 *  TextField sin lag (commit onBlur)
 *  ======================== */
type FastTextFieldProps = Omit<
  React.ComponentProps<typeof TextField>,
  "defaultValue" | "onBlur" | "value" | "onChange"
> & {
  name: keyof FormState;
  value: string;
  onCommit: (name: keyof FormState, next: string) => void;
  version: number;
};
const FastTextField: React.FC<FastTextFieldProps> = ({
  name,
  value,
  onCommit,
  version,
  ...props
}) => {
  const localRef = useRef<string>(value);
  const [key, setKey] = useState<number>(version);
  useEffect(() => setKey(version), [version]);

  return (
    <TextField
      key={`${String(name)}-${key}`}
      defaultValue={value ?? ""}
      onChange={(e) => {
        localRef.current = e.target.value; // ✅ mantiene en sync lo que el usuario escribe
      }}
      onBlur={(e) => {
        const v = e.target.value ?? "";
        if (v !== localRef.current) {
          localRef.current = v;
          onCommit(name, v);
        } else {
          onCommit(name, v); // ✅ fuerza commit del valor actual incluso si no cambió
        }
      }}
      {...props}
    />
  );
};


/** ========================
 *  Mapeo de datos API -> FormState
 *  ======================== */
const mapearDatosAPI = (
  api: IntervencionDetalle,
  departamentos: Array<{ id: string; nombre: string }>,
  localidades: Array<{ id: string; nombre: string; departamento_id: string }>
): FormState => {
  // Datos básicos
  const fechaIntervencion = toDateInput(api.fecha);
  const coordinador = api.coordinador ?? "";
  const operador = api.operador ?? "";
  const observaciones = api.resena_hecho ?? "";

  // Derivación
  const deriv = api.derivaciones?.[0];
  const derivadorNombre = deriv?.derivador ?? "";
  const horaDerivacion = toDateTimeLocal(deriv?.fecha_derivacion);
  let motivoDerivacion: number | "" =
    typeof deriv?.motivos === "number" ? deriv.motivos : "";
  if (!motivoDerivacion && deriv?.tipo_derivacion_id)
    motivoDerivacion = deriv.tipo_derivacion_id;

  // Hecho delictivo
  const hd: any = api.hechoDelictivo ?? api.hechos_delictivos?.[0] ?? {};
  const nroExpediente = hd.expediente ?? "";
  const nroAgresores = String(hd.numAgresores ?? hd.num_agresores ?? "");
  const geo0 = hd.geo?.[0];
  const calleBarrioHecho = hd.ubicacion?.calleBarrio ?? geo0?.domicilio ?? "";
  const departamentoHechoID =
    hd.ubicacion?.departamento ?? geo0?.departamento_id ?? "";
  const departamentoHechoNombre = getNombreDepartamento(
    departamentoHechoID,
    departamentos
  );
  const localidadHechoID = geo0?.localidad_id ||  ""; //hd.localidad_id
  const localidadHechoNombre = getNombreLocalidad(
    localidadHechoID,
    localidades
  );

  const fechaHecho = toDateInput(geo0?.fecha);
  const horaHecho = toTimeInput(geo0?.fecha);

  const th = hd.tipoHecho ?? hd.relaciones?.[0] ?? {};
  const robo = !!th.robo;
  const roboArmaFuego = !!(th.roboArmaFuego ?? th.robo_arma_fuego);
  const roboArmaBlanca = !!(th.roboArmaBlanca ?? th.robo_arma_blanca);
  const amenazas = !!th.amenazas;
  const lesiones = !!th.lesiones;
  const lesionesArmaFuego = !!(th.lesionesArmaFuego ?? th.lesiones_arma_fuego);
  const lesionesArmaBlanca = !!(
    th.lesionesArmaBlanca ?? th.lesiones_arma_blanca
  );
  const homicidioDelito = !!(th.homicidioDelito ?? th.homicidio_delito);
  const homicidioAccidenteVial = !!(
    th.homicidioAccidenteVial ?? th.homicidio_accidente_vial
  );
  const homicidioAvHecho = !!(th.homicidioAvHecho ?? th.homicidio_av_hecho);
  const femicidio = !!th.femicidio;
  const transfemicidio = !!(
    th.travestisidioTransfemicidio ??
    th.travestisidio_transfemicidio ??
    th.transfemicidio
  );
  const violenciaGenero = !!(th.violenciaGenero ?? th.violencia_genero);
  const otros = !!th.otros;

 // Acciones primera línea
  const accionesPrimeraLinea = api.acciones_primera_linea?.[0]?.acciones ?? "";

  // Abuso sexual
  const abuso = api.abusos_sexuales?.[0];
  const abusoSexualSimple = abuso?.tipo_abuso === 1;
  const abusoSexualAgravado = abuso?.tipo_abuso === 2;
  const abusoDatos = abuso?.datos?.[0];
  const kitStr = (abusoDatos?.kit || "").toString().trim().toLowerCase();
  const kitAplicado: FormState["kitAplicado"] =
    kitStr === "si" ? "si" : kitStr === "no" ? "no" : "";

 let relacionAgresor: FormState["relacionAgresor"] = "";
const rel = (abusoDatos?.relacion || "").trim();

// Normalizar valores con mayúscula inicial
if (rel.toLowerCase() === "conocido") {
  relacionAgresor = "Conocido";
} else if (rel.toLowerCase() === "desconocido") {
  relacionAgresor = "Desconocido";
} else if (rel.toLowerCase() === "familiar") {
  relacionAgresor = "Familiar";
} else if (rel.toLowerCase() === "pareja") {
  relacionAgresor = "Pareja";
} else if (rel.toLowerCase() === "otro") {
  relacionAgresor = "Otro";
}

const otroRelacion = relacionAgresor === "Otro" ? (abusoDatos?.relacion_otro ?? "") : "";

 let tipoLugar: FormState["tipoLugar"] = "";
const lugar = (abusoDatos?.lugar_hecho || "").toLowerCase().trim();

if (lugar === "institucion" || lugar === "institución") {
  tipoLugar = "Institución";
} else if (["vía pública", "via publica", "viapublica", "vía publica"].includes(lugar)) {
  tipoLugar = "Vía Pública";
} else if (["domicilio particular", "dom particular", "domparticular", "dom. particular"].includes(lugar)) {
  tipoLugar = "Domicilio Particular";
} else if (["lugar de trabajo", "trabajo", "lugar trabajo"].includes(lugar)) {
  tipoLugar = "Lugar de Trabajo";
} else if (lugar === "otro") {
  tipoLugar = "Otro";
}

const otroLugar = tipoLugar === "Otro" ? (abusoDatos?.lugar_otro ?? "") : "";
  // Víctima
  const vict = api.victimas?.[0];
  const dni = vict?.dni ?? "";
  const nombreVictima = vict?.nombre ?? "";
  const genero = vict?.genero ?? vict?.genero_id ?? "";
const fechaNacimiento = vict?.fecha_nacimiento ? toDateInput(vict.fecha_nacimiento) : "";
  const telefono = vict?.telefono ?? "";
  const calleNro = vict?.direccion?.calle_nro ?? "";
  const barrio = vict?.direccion?.barrio ?? "";
  const departamentoID = vict?.direccion?.departamento ?? "";
  const localidadID = vict?.direccion?.localidad ?? "";
  const departamentoNombre = getNombreDepartamento(
    departamentoID,
    departamentos
  );
  const localidadNombre = getNombreLocalidad(localidadID, localidades);

  const ocupacion = vict?.ocupacion ?? "";
const ent = vict?.personas_entrevistadas?.[0];
const entrevistadoNombre = ent?.nombre ?? "";


  const entrevistadoCalle = ent?.direccion?.calle_nro ?? "";
  const entrevistadoBarrio = ent?.direccion?.barrio ?? "";
  const entrevistadoDepartamentoID = ent?.direccion?.departamento ?? "";
  const entrevistadoDepartamentoNombre = getNombreDepartamento(
    entrevistadoDepartamentoID,
    departamentos
  );

  const entrevistadoLocalidadID = ent?.direccion?.localidad ?? "";
  const entrevistadoLocalidadNombre = getNombreLocalidad(
    entrevistadoLocalidadID,
    localidades
  );

  const entrevistadoRelacion = ent?.relacion_victima ?? "";

  // Intervenciones
  const inter = api.intervenciones_tipo?.[0];
  const crisis = !!inter?.crisis;
  const telefonica = !!inter?.telefonica;
  const domiciliaria = !!inter?.domiciliaria;
  const psicologica = !!inter?.psicologica;
  const medica = !!inter?.medica;
  const social = !!inter?.social;
  const legal = !!inter?.legal;
  const sinIntervencion = !!inter?.sin_intervencion;
  const archivoCaso = !!inter?.archivo_caso;

  const seg = api.seguimientos?.[0];
  const seguimientoRealizado: FormState["seguimientoRealizado"] = seg?.hubo
    ? "si"
    : "no";
  const segTipo = seg?.tipo?.[0];
  const segAsesoramientoLegal = !!segTipo?.asesoramientolegal;
  const segTratamientoPsicologico = !!segTipo?.tratamientopsicologico;
  const segSeguimientoLegal = !!segTipo?.seguimientolegal;
  const segArchivoCaso = !!segTipo?.archivocaso;
  const detalleSeguimiento = seg?.detalles?.[0]?.detalle ?? "";

return {
    fechaIntervencion,
    coordinador,
    operador,
    observaciones,
    derivadorNombre,
    horaDerivacion,
    motivoDerivacion,
    motivoDerivacionOtro: "",  // 👈 NUEVA LÍNEA
    nroExpediente,
    nroAgresores,
    robo,
    roboArmaFuego,
    roboArmaBlanca,
    amenazas,
    lesiones,
    lesionesArmaFuego,
    lesionesArmaBlanca,
    homicidioDelito,
    homicidioAccidenteVial,
    homicidioAvHecho,
    femicidio,
    transfemicidio,
    violenciaGenero,
    otros,

    // 🔹 Aquí corregido
    departamentoHecho: String(departamentoHechoID || ""),
    localidadHecho: String(localidadHechoID || ""),

    calleBarrioHecho,
    fechaHecho,
    horaHecho,
    accionesPrimeraLinea,
    abusoSexualSimple,
    abusoSexualAgravado,
    kitAplicado,
    relacionAgresor,
    otroRelacion,
    tipoLugar,
    otroLugar,
    dni,
    nombreVictima,
    genero,
    fechaNacimiento,
    telefono,
    calleNro,
    barrio,

    departamento: String(departamentoID || ""),
    localidad: String(localidadID || ""),

    ocupacion,
    entrevistadoNombre,
    entrevistadoCalle,
    entrevistadoBarrio,

    // 🔹 Aquí corregido
    entrevistadoDepartamento: String(entrevistadoDepartamentoID || ""),
    entrevistadoLocalidad: String(entrevistadoLocalidadID || ""),

    entrevistadoRelacion,
    crisis,
    telefonica,
    domiciliaria,
    psicologica,
    medica,
    social,
    legal,
    sinIntervencion,
    archivoCaso,
    seguimientoRealizado,
    segAsesoramientoLegal,
    segTratamientoPsicologico,
    segSeguimientoLegal,
    segArchivoCaso,
    detalleSeguimiento,
  };
};

/** ========================
 *  Props (Opción A)
 *  ======================== */
type Props = {
  selected: IntervencionItem; // viene desde page.tsx
};

/** ========================
 *  Componente principal (controlado)
 *  ======================== */
const EditarFormularioVictima: React.FC<Props> = ({ selected }) => {
  const router = useRouter();

  // Estado para UI
  const [version, setVersion] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [intervenciones, setIntervenciones] = useState<IntervencionItem[]>([]);

useEffect(() => {
  const fetchIntervenciones = async () => {
    try {
      const data = await listarIntervenciones();
      console.log("📦 Intervenciones cargadas:", data); // 🧪 Agregado
      setIntervenciones(data);
    } catch (error) {
      console.error("Error al cargar las intervenciones:", error);
    }
  };

  fetchIntervenciones();
}, []);


  const [departamentos, setDepartamentos] = useState<
    Array<{
      id: string;
      nombre: string;
    }>
  >([]);

  const [localidades, setLocalidades] = useState<
    Array<{
      id: string;
      nombre: string;
      departamento_id: string;
    }>
  >([]);

  // ✅ Estados para manejo de errores y alertas
  const [errores, setErrores] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const showNotification = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    // Cargar departamentos
    fetch("/departamentosMendoza.json")
      .then((res) => res.json())
      .then((data) => setDepartamentos(data.departamentos || []))
      .catch((err) => console.error("Error cargando departamentos:", err));

    // Cargar localidades
    fetch("/localidadesMendoza.json")
      .then((res) => res.json())
      .then((data) => setLocalidades(data.localidades || []))
      .catch((err) => console.error("Error cargando localidades:", err));
  }, []); // Se ejecuta una sola vez al montar el componente

  // Buffer mutable (no re-render por tecla en FastTextField)
  const [formState, setFormState] = useState<FormState>({ 
    
  fechaIntervencion: "",
  coordinador: "",
  operador: "",
  observaciones: "",
derivadorNombre: "",
  horaDerivacion: "",
  motivoDerivacion: "",
  motivoDerivacionOtro: "",  // 👈 NUEVA LÍNEA
  nroExpediente: "",
  nroAgresores: "",
  robo: false,
  roboArmaFuego: false,
  roboArmaBlanca: false,
  amenazas: false,
  lesiones: false,
  lesionesArmaFuego: false,
  lesionesArmaBlanca: false,
  homicidioDelito: false,
  homicidioAccidenteVial: false,
  homicidioAvHecho: false,
  femicidio: false,
  transfemicidio: false,
  violenciaGenero: false,
  otros: false,
  departamentoHecho: "",
  localidadHecho: "",
  calleBarrioHecho: "",
  fechaHecho: "",
  horaHecho: "",
  accionesPrimeraLinea: "",
  abusoSexualSimple: false,
  abusoSexualAgravado: false,
  kitAplicado: "",
  relacionAgresor: "",
  otroRelacion: "",
  tipoLugar: "",
  otroLugar: "",
  dni: "",
  nombreVictima: "",
  genero: "",
  fechaNacimiento: "",
  telefono: "",
  calleNro: "",
  barrio: "",
  departamento: "",
  localidad: "",
  ocupacion: "",
  entrevistadoNombre: "",
  entrevistadoCalle: "",
  entrevistadoBarrio: "",
  entrevistadoDepartamento: "",
  entrevistadoLocalidad: "",
  entrevistadoRelacion: "",
  crisis: false,
  telefonica: false,
  domiciliaria: false,
  psicologica: false,
  medica: false,
  social: false,
  legal: false,
  sinIntervencion: false,
  archivoCaso: false,
  seguimientoRealizado: "",
  segAsesoramientoLegal: false,
  segTratamientoPsicologico: false,
  segSeguimientoLegal: false,
  segArchivoCaso: false,
  detalleSeguimiento: "",
});
const f = formState; 

const commitDebounced = useMemo(() => {
  return debounce((name: keyof FormState, value: any) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, 300);
}, []);

const commit = useCallback(
  (name: keyof FormState, value: string | number | boolean) => {
    commitDebounced(name, value);
  },
  [commitDebounced]
);

const forceCommit = useCallback(
  (name: keyof FormState, value: string | number | boolean) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
    setVersion((v) => v + 1);
  },
  []
);


const [inicializado, setInicializado] = useState(false); // ⬅️ Agregá esto arriba del useEffect

useEffect(() => {
  if (
    inicializado ||
    !selected ||
    departamentos.length === 0 ||
    localidades.length === 0
  )
    return;

  const formData = mapearDatosAPI(
    selected as unknown as IntervencionDetalle,
    departamentos,
    localidades
  );

  setFormState(formData);
  setVersion((v) => v + 1);
  setInicializado(true); // ✅ Evita volver a pisar el estado
}, [selected, departamentos, localidades, inicializado]);




  const onCheck = useCallback(
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      forceCommit(k, e.target.checked);
    },
    [forceCommit]
  );

  const onRadio = useCallback(
    (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      forceCommit(k, e.target.value as any);
    },
    [forceCommit]
  );

  if (!selected) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Cargando intervención...</Typography>
      </Box>
    );
  }

const validarFormulario = (): string[] => {
  const nuevosErrores: string[] = [];

  if (!f.nroExpediente.trim()) {
    nuevosErrores.push("El número de expediente es obligatorio");
  }
const expedienteActual = f.nroExpediente.trim().toLowerCase();

const expedienteDuplicado = intervenciones.some((i) => {
  if (String(i.id) === String(selected.id)) return false;

  const hechos = i.hechos_delictivos ?? [];

  return hechos.some((hd) => {
    const expedienteBD = (hd?.expediente ?? "").trim().toLowerCase();
    return expedienteBD === expedienteActual;
  });
});


  if (expedienteDuplicado) {
    nuevosErrores.push(
      "Ya existe una intervención con el mismo número de expediente"
    );
  }

 if (!f.fechaHecho) {
  nuevosErrores.push("La fecha del hecho es obligatoria");
}

if (!f.horaHecho) {
  nuevosErrores.push("La hora del hecho es obligatoria");
}

if (!f.calleBarrioHecho.trim()) {
  nuevosErrores.push("La calle o barrio es obligatorio");
}

if (!f.departamentoHecho) {
  nuevosErrores.push("El departamento es obligatorio");
}

if (!f.localidadHecho) {
  nuevosErrores.push("La localidad es obligatoria");
}

if (!f.nroAgresores || parseInt(f.nroAgresores) < 1) {
  nuevosErrores.push("Debe haber al menos un agresor");
}

// Acá podés validar si al menos un tipo de hecho fue marcado:
const hayAlgunHecho =
  f.robo || f.roboArmaFuego || f.roboArmaBlanca ||
  f.amenazas || f.lesiones || f.lesionesArmaFuego ||
  f.lesionesArmaBlanca || f.homicidioDelito ||
  f.homicidioAccidenteVial || f.homicidioAvHecho ||
  f.femicidio || f.transfemicidio || f.violenciaGenero || f.otros;

if (!hayAlgunHecho) {
  nuevosErrores.push("Debe seleccionar al menos un tipo de hecho delictivo");
}


  return nuevosErrores;
};

  // Guardar cambios
// Guardar cambios - VERSIÓN CORREGIDA
const handleGuardarCambios = async () => {
  console.log("✅ Entró a handleGuardarCambios");

  // 🔥 Forzar flush del debounce y esperar el próximo tick
  commitDebounced.flush();
  await new Promise(resolve => setTimeout(resolve, 50));

  try {
    setGuardando(true);
    setMensaje(null);
    setError(null);

    const erroresValidados = await validarFormulario();
    setErrores(erroresValidados);

    if (erroresValidados.length > 0) {
      showNotification(
        `Errores en el formulario:\n${erroresValidados.join("\n")}`,
        "error"
      );
      setGuardando(false); // ✅ Desactivar loader si hay errores de validación
      return;
    }

    console.log("DEBUG departamentoHecho crudo:", f.departamentoHecho);

    // Helpers de fechas/horas
    const derivFechaISO =
      f.horaDerivacion && f.horaDerivacion.includes("T")
        ? f.horaDerivacion
        : "";
    const hechoFechaISO = f.fechaHecho || "";
    const hechoHoraStr = f.horaHecho || "";

    // Normalizaciones abuso sexual
    const simple = !!f.abusoSexualSimple;
    const agravado = !!f.abusoSexualAgravado;
    const relacion = f.relacionAgresor
      ? f.relacionAgresor
      : f.otroRelacion
      ? "otro"
      : "";

    const lugarHecho = (() => {
      const tipo = f.tipoLugar?.trim().toLowerCase();
      if (tipo === "institución" || tipo === "institucion") return "institucion";
      if (tipo === "vía pública" || tipo === "via pública" || tipo === "vía publica" || tipo === "via publica") return "vía pública";
      if (tipo === "domicilio particular") return "domicilio particular";
      if (tipo === "lugar de trabajo") return "lugar de trabajo";
      if (tipo === "otro") return "otro";
      return "";
    })();

    // 🧹 Normalizamos y validamos todos los campos del entrevistado
    const nombreEntrev = f.entrevistadoNombre.trim();
    const relacionEntrev = f.entrevistadoRelacion.trim();
    const calleEntrev = f.entrevistadoCalle.trim();
    const barrioEntrev = f.entrevistadoBarrio.trim();
    const deptoEntrev = toValidPositiveNumber(f.entrevistadoDepartamento);
    const locEntrev = toValidPositiveNumber(f.entrevistadoLocalidad);

    const personaEntrevistada =
      nombreEntrev ||
      relacionEntrev ||
      calleEntrev ||
      barrioEntrev ||
      deptoEntrev > 0 ||
      locEntrev > 0
        ? {
            nombre: nombreEntrev,
            relacionVictima: relacionEntrev,
            direccion: {
              calleNro: calleEntrev,
              barrio: barrioEntrev,
              departamento: deptoEntrev,
              localidad: locEntrev,
            },
          }
        : null;

    const payload = {
      intervencion: {
        fecha: f.fechaIntervencion,
        coordinador: f.coordinador,
        operador: f.operador,
        resena_hecho: f.observaciones,
      },
      tipoIntervencion: {
        crisis: f.crisis,
        telefonica: f.telefonica,
        domiciliaria: f.domiciliaria,
        psicologica: f.psicologica,
        medica: f.medica,
        social: f.social,
        legal: f.legal,
        sinIntervencion: f.sinIntervencion,
        archivoCaso: f.archivoCaso,
      },
      derivacion: {
        derivador: f.derivadorNombre,
        motivos: f.motivoDerivacion === "" ? 0 : Number(f.motivoDerivacion),
        fecha_derivacion: derivFechaISO.replace("T", " "),
      },
      hechoDelictivo: {
        expediente: f.nroExpediente,
        numAgresores: parseInt(f.nroAgresores || "0", 10) || 0,
        fecha: hechoFechaISO || "",
        hora: hechoHoraStr || "",
        ubicacion: {
          calleBarrio: f.calleBarrioHecho,
          departamento: (() => {
            if (!f.departamentoHecho) return 0;
            if (!isNaN(Number(f.departamentoHecho))) {
              return Number(f.departamentoHecho);
            }
            const dep = departamentos.find(
              (d) => d.nombre === String(f.departamentoHecho).trim()
            );
            return dep ? Number(dep.id) : 0;
          })(),
          localidad: toOptionalPositiveNumber(f.localidadHecho) ?? 0,
        },
        tipoHecho: {
          robo: f.robo,
          roboArmaFuego: f.roboArmaFuego,
          roboArmaBlanca: f.roboArmaBlanca,
          amenazas: f.amenazas,
          lesiones: f.lesiones,
          lesionesArmaFuego: f.lesionesArmaFuego,
          lesionesArmaBlanca: f.lesionesArmaBlanca,
          homicidioDelito: f.homicidioDelito,
          homicidioAccidenteVial: f.homicidioAccidenteVial,
          homicidioAvHecho: f.homicidioAvHecho,
          femicidio: f.femicidio,
          travestisidioTransfemicidio: f.transfemicidio,
          violenciaGenero: f.violenciaGenero,
          otros: f.otros,
        },
      },
      accionesPrimeraLinea: f.accionesPrimeraLinea,
      abusoSexual: {
        simple,
        agravado,
      },
      datosAbusoSexual: {
        kit: f.kitAplicado || "",
        relacion,
        relacionOtro: f.otroRelacion,
        lugarHecho,
        lugarOtro: f.otroLugar,
      },
  victima: {
        cantidadVictimas: 1,
        dni: f.dni,
        nombre: f.nombreVictima,
        genero: f.genero === "" ? 0 : Number(f.genero),
        fechaNacimiento: f.fechaNacimiento && f.fechaNacimiento.trim() ? f.fechaNacimiento : null,
        telefono: f.telefono,
        ocupacion: f.ocupacion,
        direccion: {
          calleNro: f.calleNro,
          barrio: f.barrio,
          departamento: toValidPositiveNumber(f.departamento),
          localidad: toValidPositiveNumber(f.localidad),
        }
      },
      personaEntrevistada: personaEntrevistada
        ? {
            nombre: personaEntrevistada.nombre,
            relacionVictima: personaEntrevistada.relacionVictima,
            direccion: {
              calleNro: personaEntrevistada.direccion.calleNro,
              barrio: personaEntrevistada.direccion.barrio,
              departamento: personaEntrevistada.direccion.departamento,
              localidad: personaEntrevistada.direccion.localidad,
            },
          }
        : undefined,
      seguimiento: {
        realizado: f.seguimientoRealizado === "si",
        tipo: {
          asesoramientoLegal: f.segAsesoramientoLegal,
          tratamientoPsicologico: f.segTratamientoPsicologico,
          seguimientoLegal: f.segSeguimientoLegal,
          archivoCaso: f.segArchivoCaso,
        },
      },
      detalleIntervencion: f.detalleSeguimiento,
    };

    console.log("🧪 Payload FINAL:", JSON.stringify(payload, null, 2));

    // ✅ Enviar al backend
    await actualizarIntervencion(selected.id, payload);
    
    // ✅ Mostrar mensaje de éxito
    setMensaje("Cambios guardados correctamente ✅");
    
    // ✅ Esperar para que el usuario vea el mensaje
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // ✅ Redirigir (el loader sigue visible)
    router.push("/inicio");
    
  } catch (e: any) {
    console.error("Error al guardar", e);
    setError(
      "Ocurrió un error al guardar. Revisa los campos e intenta nuevamente."
    );
    setGuardando(false); // ✅ Solo desactivar en caso de error
  }
  // ❌ NO usar finally, se maneja manualmente
};


  const localidadesVictima = localidades.filter(
    (l) => Number(l.departamento_id) === Number(f.departamento)
  );

  const localidadesEntrevistado = Array.isArray(localidades)
    ? localidades.filter(
        (l) => Number(l.departamento_id) === Number(f.entrevistadoDepartamento)
      )
    : [];

  // 📍 Filtrar localidades según el departamento seleccionado en el hecho delictivo
  const localidadesHecho = localidades.filter(
    (loc: { id: string; nombre: string; departamento_id: string }) =>
      Number(loc.departamento_id) === Number(f.departamentoHecho)
  );

  return (
    <Box sx={{ p: 4, maxWidth: 1100, mx: "auto" }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Editar Intervención {selected.numero_intervencion}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => router.push("/inicio")}
          disabled={guardando}
        >
          Cancelar
        </Button>
      </Box>

      {/* 1. Intervención */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          1. Datos de la Intervención
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              type="date"
              label="Fecha de Intervención *"
              fullWidth
              value={f.fechaIntervencion}
              onChange={(e) => {
                const value = e.target.value;
                const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (match) {
                  const year = parseInt(match[1], 10);
                  const currentYear = new Date().getFullYear();
                  if (year > currentYear) {
                    const fixedDate = `${currentYear}-${match[2]}-${match[3]}`;
                    forceCommit("fechaIntervencion", fixedDate);
                    return;
                  }
                }
                forceCommit("fechaIntervencion", value);
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: new Date().toISOString().split("T")[0],
                min: "1900-01-01",
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "Tab",
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "ArrowDown",
                  ];
                  const isNumber = /\d/.test(e.key);
                  const isDash = e.key === "-";
                  if (!allowedKeys.includes(e.key) && !isNumber && !isDash) {
                    e.preventDefault();
                  }
                },
                onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
                  const pasted = e.clipboardData.getData("text");
                  const match = pasted.match(/^(\d{4})/);
                  if (match) {
                    const year = parseInt(match[1], 10);
                    const currentYear = new Date().getFullYear();
                    if (year > currentYear || year < 1900) {
                      e.preventDefault();
                    }
                  }
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FastTextField
              name="coordinador"
              label="Coordinador"
              fullWidth
              value={f.coordinador}
              onCommit={commit}
              version={version}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FastTextField
              name="operador"
              label="Operador"
              fullWidth
              value={f.operador}
              onCommit={commit}
              version={version}
            />
          </Grid>
          <Grid item xs={12}>
            <FastTextField
              name="observaciones"
              label="Breve reseña del hecho"
              fullWidth
              multiline
              rows={3}
              value={f.observaciones}
              onCommit={commit}
              version={version}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Derivación */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          2. Derivación
        </Typography>

        <Grid container spacing={2}>
          {/* Derivador */}
          <Grid item xs={12} md={6}>
            <FastTextField
              name="derivadorNombre"
              label="Nombre y Apellido del Derivador"
              fullWidth
              value={f.derivadorNombre}
              onCommit={commit}
              version={version}
            />
          </Grid>

          {/* Fecha/Hora */}
          <Grid item xs={12} md={6}>
            <TextField
              type="datetime-local"
              label="Fecha/Hora"
              value={f.horaDerivacion}
              onChange={(e) => forceCommit("horaDerivacion", e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: "1900-01-01T00:00",
                max: new Date().toISOString().slice(0, 16), // ahora
              }}
              fullWidth
            />
          </Grid>

          {/* Número de Expediente */}
          <Grid item xs={12} md={6}>
            <FastTextField
              name="nroExpediente"
              label="Número de Expediente"
              placeholder="Ej. 1234/2023"
              fullWidth
              value={f.nroExpediente}
              onCommit={commit}
              version={version}
            />
          </Grid>

          {/* Cantidad de Agresores */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Cantidad de agresores"
              value={f.nroAgresores}
              onChange={(e) => forceCommit("nroAgresores", e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>

 {/* Motivos de Derivación */}
<Grid container spacing={2} sx={{ mt: 2 }}>
  {motivosDerivacion.map(({ value, label }) => (
    <Grid item xs={12} md={6} key={value}>
      <FormControlLabel
        control={
          <Radio
            checked={f.motivoDerivacion === value}
            onChange={() => {
              forceCommit("motivoDerivacion", value);
              // Limpiar campo adicional al cambiar de opción
              if (value !== 6 && value !== 8) {
                forceCommit("motivoDerivacionOtro", "");
              }
            }}
          />
        }
        label={label}
      />

      {/* Si selecciona Municipio (6) → mostrar SELECT con departamentos */}
      {value === 6 && f.motivoDerivacion === value && (
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Seleccione Municipio</InputLabel>
          <Select
            value={f.motivoDerivacionOtro}
            onChange={(e) => forceCommit("motivoDerivacionOtro", e.target.value)}
          >
            <MenuItem value="">--Seleccione Municipio--</MenuItem>
            {departamentos.map((d) => (
              <MenuItem key={d.id} value={d.nombre}>
                {d.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Si selecciona Otro (8) → mostrar TextField */}
      {value === 8 && f.motivoDerivacion === value && (
        <FastTextField
          name="motivoDerivacionOtro"
          label="Especifique Otro"
          fullWidth
          sx={{ mt: 1 }}
          value={f.motivoDerivacionOtro}
          onCommit={commit}
          version={version}
        />
      )}
    </Grid>
  ))}
</Grid>


        <Divider sx={{ my: 3 }} />
      </Paper>

      {/* 3. Hecho Delictivo */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">3. Datos del Hecho Delictivo</Typography>

        {/* Fecha y Hora del Hecho */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Fecha */}
          <Grid item xs="auto">
            <TextField
              type="date"
              label="Fecha del Hecho"
              value={f.fechaHecho}
              onChange={(e) => {
                const value = e.target.value;
                const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (match) {
                  const year = parseInt(match[1], 10);
                  const currentYear = new Date().getFullYear();
                  if (year > currentYear) {
                    const fixedDate = `${currentYear}-${match[2]}-${match[3]}`;
                    forceCommit("fechaHecho", fixedDate);
                    return;
                  }
                }
                forceCommit("fechaHecho", value);
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: new Date().toISOString().split("T")[0],
                min: "1900-01-01",
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "Tab",
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "ArrowDown",
                  ];
                  const isNumber = /\d/.test(e.key);
                  const isDash = e.key === "-";
                  if (!allowedKeys.includes(e.key) && !isNumber && !isDash) {
                    e.preventDefault();
                  }
                },
                onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
                  const pasted = e.clipboardData.getData("text");
                  const match = pasted.match(/^(\d{4})/);
                  if (match) {
                    const year = parseInt(match[1], 10);
                    const currentYear = new Date().getFullYear();
                    if (year > currentYear || year < 1900) {
                      e.preventDefault();
                    }
                  }
                },
              }}
              sx={{ width: 180 }}
            />
          </Grid>

          {/* Hora */}
          <Grid item xs="auto">
            <TextField
              type="time"
              label="Hora del Hecho *"
              value={f.horaHecho}
              onChange={(e) => forceCommit("horaHecho", e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 60 }}
              sx={{ width: 120 }}
            />
          </Grid>
        </Grid>

        {/* Ubicación */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Ubicación del Hecho
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {/* Calle y Barrio */}
          <Grid item xs={12} md={6}>
            <FastTextField
              name="calleBarrioHecho"
              label="Calle y Barrio *"
              placeholder="Ingrese la calle y barrio donde ocurrió el hecho"
              fullWidth
              value={f.calleBarrioHecho}
              onCommit={commit}
              version={version}
            />
          </Grid>

          {/* Departamento */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>--Seleccione Departamento--</InputLabel>
              <Select
                value={f.departamentoHecho?.toString() ?? ""}
                onChange={(e) => {
                  forceCommit("departamentoHecho", e.target.value);
                  forceCommit("localidadHecho", ""); // limpiar localidad cuando cambia depto
                }}
              >
                <MenuItem value="">--Seleccione Departamento--</MenuItem>
                {departamentos.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Localidad */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>--Seleccione Localidad--</InputLabel>
              <Select
                value={f.localidadHecho?.toString() ?? ""}
                onChange={(e) => forceCommit("localidadHecho", e.target.value)}
              >
                <MenuItem value="">--Seleccione Localidad--</MenuItem>
                {localidadesHecho.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Tipo de Hecho */}
        <FormControl component="fieldset" sx={{ width: "100%", mt: 3 }}>
          <Typography variant="subtitle1">
            Tipo de Hecho <span style={{ color: "red" }}>*</span>
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {(
              [
                ["robo", "Robo"],
                ["roboArmaFuego", "Robo con arma de fuego"],
                ["roboArmaBlanca", "Robo con arma blanca"],
                ["amenazas", "Amenazas"],
                ["lesiones", "Lesiones"],
                ["lesionesArmaFuego", "Lesiones con arma de fuego"],
                ["lesionesArmaBlanca", "Lesiones con arma blanca"],
                ["homicidioDelito", "Homicidio por Delito"],
                ["homicidioAccidenteVial", "Homicidio por Accidente Vial"],
                ["homicidioAvHecho", "Homicidio / Av. Hecho"],
                ["femicidio", "Femicidio"],
                ["transfemicidio", "Travestisidio / Transfemicidio"],
                ["violenciaGenero", "Violencia de género"],
                ["otros", "Otros"],
              ] as const
            ).map(([key, label]) => (
              <Grid item xs={6} md={4} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean((f as any)[key])}
                      onChange={() => forceCommit(key, !(f as any)[key])}
                    />
                  }
                  label={label}
                />
              </Grid>
            ))}
          </Grid>
        </FormControl>

        <Divider sx={{ my: 3 }} />
      </Paper>

      {/* 4. Acciones primera línea */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          4. Acciones Realizadas en Primera Línea
        </Typography>
        <FastTextField
          name="accionesPrimeraLinea"
          label="Detalle de acciones"
          fullWidth
          multiline
          rows={3}
          value={f.accionesPrimeraLinea}
          onCommit={commit}
          version={version}
        />
      </Paper>

     <Paper sx={{ p: 3, mb: 3 }}>
      {/* 5. Abuso Sexual */}
      <Typography variant="h6">5. Abuso Sexual</Typography>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Abuso sexual simple */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={f.abusoSexualSimple}
                onChange={() =>
                  forceCommit("abusoSexualSimple", !f.abusoSexualSimple)
                }
              />
            }
            label="Abuso sexual simple"
          />
        </Grid>

        {/* Abuso sexual agravado */}
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={f.abusoSexualAgravado}
                onChange={() =>
                  forceCommit("abusoSexualAgravado", !f.abusoSexualAgravado)
                }
              />
            }
            label="Abuso sexual agravado"
          />
        </Grid>

       {/* Kit aplicado */}
{(f.abusoSexualSimple || f.abusoSexualAgravado) && (
  <Grid item xs={12} md={6}>
    <FormControl fullWidth variant="outlined">
      <InputLabel id="kit-label">Kit aplicado *</InputLabel>
      <Select
        labelId="kit-label"
        id="kit-aplicado"
        value={f.kitAplicado}
        onChange={(e) => forceCommit("kitAplicado", e.target.value)}
        label="Kit aplicado *" // ✅ importante
        sx={{
          color:
            f.kitAplicado === "si"
              ? "success.main"
              : f.kitAplicado === "no"
              ? "error.main"
              : "text.primary",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor:
              f.kitAplicado === "si"
                ? "#2e7d32"
                : f.kitAplicado === "no"
                ? "#d32f2f"
                : "rgba(0,0,0,0.23)",
          },
          backgroundColor:
            f.kitAplicado === "si"
              ? "rgba(46, 125, 50, 0.08)"
              : f.kitAplicado === "no"
              ? "rgba(211, 47, 47, 0.08)"
              : "transparent",
        }}
      >
        <MenuItem value="">Seleccione...</MenuItem>
        <MenuItem value="si">SI</MenuItem>
        <MenuItem value="no">NO</MenuItem>
      </Select>
      <FormHelperText>
        {f.kitAplicado
          ? f.kitAplicado === "si"
            ? "Se aplicó el kit médico."
            : "No se aplicó el kit médico."
          : "Seleccione una opción"}
      </FormHelperText>
    </FormControl>
  </Grid>
)}
{(f.abusoSexualSimple || f.abusoSexualAgravado) && (
  <>
    {/* Relación con el agresor */}
    <Grid item xs={12}>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Relación entre la víctima y el presunto agresor:
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Relación</InputLabel>
        <Select
          value={f.relacionAgresor}
          onChange={(e) => forceCommit("relacionAgresor", e.target.value)}
        >
          <MenuItem value="">Seleccione...</MenuItem>
          <MenuItem value="Conocido">Conocido</MenuItem>
          <MenuItem value="Desconocido">Desconocido</MenuItem>
          <MenuItem value="Familiar">Familiar</MenuItem>
          <MenuItem value="Pareja">Pareja</MenuItem>
          <MenuItem value="Otro">Otro</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    {f.relacionAgresor === "Otro" && (
      <Grid item xs={12}>
        <FastTextField
          name="otroRelacion"
          label="Especifique relación"
          fullWidth
          value={f.otroRelacion}
          onCommit={commit}
          version={version}
        />
      </Grid>
    )}

    {/* Tipo del lugar del hecho */}
    <Grid item xs={12}>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Tipo del lugar del hecho:
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Seleccione lugar</InputLabel>
        <Select
          value={f.tipoLugar}
          onChange={(e) => forceCommit("tipoLugar", e.target.value)}
        >
          <MenuItem value="">Seleccione...</MenuItem>
          <MenuItem value="Institución">Institución</MenuItem>
          <MenuItem value="Vía Pública">Vía Pública</MenuItem>
          <MenuItem value="Domicilio Particular">Domicilio Particular</MenuItem>
          <MenuItem value="Lugar de Trabajo">Lugar de Trabajo</MenuItem>
          <MenuItem value="Otro">Otro</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    {f.tipoLugar === "Otro" && (
      <Grid item xs={12}>
        <FastTextField
          name="otroLugar"
          label="Especifique lugar"
          fullWidth
          value={f.otroLugar}
          onCommit={commit}
          version={version}
        />
      </Grid>
    )}
  </>
)}

      </Grid>
       </Paper>

      {/* 6. Víctima */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          6. Datos de la Víctima
        </Typography>

        {/* Información sobre víctimas */}
        <Typography variant="subtitle2" sx={{ mb: 2, color: "text.secondary" }}>
          Información sobre víctimas
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Cantidad de Víctimas"
              type="number"
              fullWidth
              value="1"
              disabled
              inputProps={{ min: 1, step: 1 }}
            />
          </Grid>
        </Grid>

        {/* Identificación */}
        <Typography variant="subtitle2" sx={{ mb: 2, color: "text.secondary" }}>
          Identificación (Solo una persona) - Apellido y Nombre es un campo
          obligatorio
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FastTextField
              name="dni"
              label="DNI"
              fullWidth
              value={f.dni}
              onCommit={commit}
              version={version}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <FastTextField
              name="nombreVictima"
              label="Datos de la Víctima: Nombre y Apellido"
              fullWidth
              required
              value={f.nombreVictima}
              onCommit={commit}
              version={version}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="genero-select-label">
                Seleccioná un género
              </InputLabel>
              <Select
                labelId="genero-select-label"
                label="Seleccioná un género"
                value={f.genero === "" ? "" : Number(f.genero)}
                onChange={(e) =>
                  forceCommit(
                    "genero",
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              >
                <MenuItem value={1}>Masculino</MenuItem>
                <MenuItem value={2}>Femenino</MenuItem>
                <MenuItem value={3}>No binario</MenuItem>
                <MenuItem value={4}>Agénero</MenuItem>
                <MenuItem value={5}>Género fluido</MenuItem>
                <MenuItem value={6}>Bigénero</MenuItem>
                <MenuItem value={7}>Transgénero</MenuItem>
                <MenuItem value={8}>Mujer trans</MenuItem>
                <MenuItem value={9}>Hombre trans</MenuItem>
                <MenuItem value={10}>Intergénero</MenuItem>
                <MenuItem value={11}>Intersex</MenuItem>
                <MenuItem value={12}>Otro</MenuItem>
                <MenuItem value={13}>Prefiero no decirlo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              fullWidth
              value={f.fechaNacimiento}
              onChange={(e) => forceCommit("fechaNacimiento", e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="dd/mm/aaaa"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FastTextField
              name="telefono"
              label="Teléfono"
              fullWidth
              value={f.telefono}
              onCommit={commit}
              version={version}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <FastTextField
              name="calleNro"
              label="Calle y Nro"
              fullWidth
              value={f.calleNro}
              onCommit={commit}
              version={version}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FastTextField
              name="barrio"
              label="Barrio M"
              fullWidth
              value={f.barrio}
              onCommit={commit}
              version={version}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>--Seleccione Departamento--</InputLabel>
              <Select
                label="--Seleccione Departamento--"
                value={f.departamento?.toString() ?? ""}
                onChange={(e) => {
                  forceCommit("departamento", e.target.value);
                  forceCommit("localidad", ""); // limpiamos localidad si cambia departamento
                }}
              >
                <MenuItem value="">--Seleccione Departamento--</MenuItem>
                {departamentos.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>--Seleccione Localidad--</InputLabel>
              <Select
                label="--Seleccione Localidad--"
                value={String(f.localidad)} // ✅ siempre en String
                onChange={(e) => forceCommit("localidad", e.target.value)}
              >
                <MenuItem value="">--Seleccione Localidad--</MenuItem>
                {localidadesVictima.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <FastTextField
              name="ocupacion"
              label="Ocupación"
              fullWidth
              value={f.ocupacion}
              onCommit={commit}
              version={version}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Persona entrevistada */}
        <Typography variant="subtitle2" sx={{ mb: 2, color: "text.secondary" }}>
          Persona entrevistada
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FastTextField
              name="entrevistadoNombre"
              label="Nombre y Apellido"
              fullWidth
              value={f.entrevistadoNombre}
              onCommit={commit}
              version={version}
            />
          </Grid>
          <Grid item xs={12}>
            <FastTextField
              name="entrevistadoCalle"
              label="Calle y Nro"
              fullWidth
              value={f.entrevistadoCalle}
              onCommit={commit}
              version={version}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FastTextField
              name="entrevistadoBarrio"
              label="Barrio M"
              fullWidth
              value={f.entrevistadoBarrio}
              onCommit={commit}
              version={version}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>--Seleccione Departamento--</InputLabel>
              <Select
                label="--Seleccione Departamento--"
                value={f.entrevistadoDepartamento?.toString() ?? ""}
                onChange={(e) => {
                  forceCommit("entrevistadoDepartamento", e.target.value);
                  forceCommit("entrevistadoLocalidad", ""); // Limpia localidad al cambiar depto
                }}
              >
                <MenuItem value="">--Seleccione Departamento--</MenuItem>
                {departamentos.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>--Seleccione Localidad--</InputLabel>
              <Select
                label="--Seleccione Localidad--"
                value={f.entrevistadoLocalidad?.toString() ?? ""}
                onChange={(e) =>
                  forceCommit("entrevistadoLocalidad", e.target.value)
                }
              >
                <MenuItem value="">--Seleccione Localidad--</MenuItem>
                {localidadesEntrevistado.map((l) => (
                  <MenuItem key={l.id} value={l.id}>
                    {l.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FastTextField
              name="entrevistadoRelacion"
              label="Relación con la víctima"
              fullWidth
              value={f.entrevistadoRelacion}
              onCommit={commit}
              version={version}
            />
          </Grid>
        </Grid>
      </Paper>
      {/* 7. Tipo de intervención */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          7. Tipo de Intervención
        </Typography>
        <Grid container spacing={1}>
          {(
            [
              ["crisis", "Intervención en Crisis"],
              ["telefonica", "Intervención Telefónica"],
              ["domiciliaria", "Intervención Domiciliaria"],
              ["psicologica", "Intervención Psicológica"],
              ["medica", "Intervención Médica"],
              ["social", "Intervención Social"],
              ["legal", "Intervención Legal"],
              ["sinIntervencion", "Sin Intervención"],
              ["archivoCaso", "Archivo del Caso"],
            ] as const
          ).map(([key, label]) => (
            <Grid item xs={12} md={6} key={key}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean((f as any)[key])}
                    onChange={onCheck(key)}
                  />
                }
                label={label}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

         {/*. Detalle de la Intervención */}
<Paper sx={{ p: 3, mb: 3 }}>
  <Typography variant="h6" gutterBottom>
     Detalle de la Intervención
  </Typography>
  <FastTextField
    name="detalleSeguimiento"
    label="Detalle de la intervención"
    fullWidth
    multiline
    rows={3}
    value={f.detalleSeguimiento}
    onCommit={commit}
    version={version}
  />
</Paper>


      {/* 7.1 Seguimiento */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          7.1 Seguimiento
        </Typography>
        <FormLabel>¿Se realizó seguimiento?</FormLabel>
        <RadioGroup
          row
          value={f.seguimientoRealizado}
          onChange={(e) => onRadio("seguimientoRealizado")(e as any)}
          sx={{ mb: 2 }}
        >
          <FormControlLabel value="si" control={<Radio />} label="Sí" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={f.segAsesoramientoLegal}
                onChange={onCheck("segAsesoramientoLegal")}
              />
            }
            label="Asesoramiento Legal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.segTratamientoPsicologico}
                onChange={onCheck("segTratamientoPsicologico")}
              />
            }
            label="Tratamiento Psicológico"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.segSeguimientoLegal}
                onChange={onCheck("segSeguimientoLegal")}
              />
            }
            label="Seguimiento Legal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.segArchivoCaso}
                onChange={onCheck("segArchivoCaso")}
              />
            }
            label="Archivo del Caso"
          />
        </FormGroup>
      </Paper>


     



      <Box textAlign="center" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={handleGuardarCambios}
          disabled={guardando}
          sx={{ mr: 2 }}
        >
          {guardando ? "Guardando..." : "Guardar Cambios"}
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => router.push("/inicio")}
          disabled={guardando}
        >
          Cancelar
        </Button>
      </Box>

      <Snackbar
        open={!!mensaje}
        autoHideDuration={5000}
        onClose={() => setMensaje(null)}
      >
        <MuiAlert severity="success" onClose={() => setMensaje(null)}>
          {mensaje}
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <MuiAlert severity="error" onClose={() => setError(null)}>
          {error}
        </MuiAlert>
      </Snackbar>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          elevation={6}
          variant="filled"
          sx={{
            width: "100%",
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          {snackbarMessage.split("\n").map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(EditarFormularioVictima);
