'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Divider,
  RadioGroup,
  Radio,
  FormLabel,
  Button,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

import { useRouter } from 'next/navigation';
import { actualizarIntervencion, type IntervencionItem } from '@/services/intervenciones';

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
    geo?: Array<{ domicilio?: string; departamento_id?: number | string; fecha?: string }>;
    relaciones?: Array<Record<string, boolean>>;
  };
  hechos_delictivos?: Array<{
    id?: number;
    expediente?: string;
    num_agresores?: number;
    geo?: Array<{ domicilio?: string; departamento_id?: number | string; fecha?: string }>;
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
const toDateInput = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toTimeInput = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${toDateInput(value)}T${toTimeInput(value)}`;
};

const toValidPositiveNumber = (v: string | number | ''): number => {
  const n = Number(v);
  return !isNaN(n) && n > 0 ? n : 0; // Siempre devuelve un número (0 si no es válido)
};

// ✅ O si prefieres que sea opcional en el payload, usa esta versión:
const toOptionalPositiveNumber = (v: string | number | ''): number | null => {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return !isNaN(n) && n > 0 ? n : null;
};

const sanitizeNumber = (v: any): number | null => {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};


// ✅ Crea un objeto con una key numérica solo si hay número (evita undefined)
const withNumber = <K extends string>(key: K, maybe: number | null) =>
  (maybe !== null ? { [key]: maybe } as Record<K, number> : {});



/** ========================
 *  Catálogos
 *  ======================== */
const motivosDerivacion = [
  { value: 1, label: 'CEO-911' },
  { value: 2, label: 'Ministerio Público Fiscal' },
  { value: 3, label: 'Hospital' },
  { value: 4, label: 'Ministerio de Seguridad' },
  { value: 5, label: 'Centro de Salud' },
  { value: 6, label: 'Municipio' },
  { value: 7, label: 'Demanda Espontanea' },
  { value: 8, label: 'Otro' },
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
  motivoDerivacion: number | '';
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
  departamentoHecho: string | number | '';
  calleBarrioHecho: string;
  fechaHecho: string;
  horaHecho: string;
  accionesPrimeraLinea: string;
  abusoSexualSimple: boolean;
  abusoSexualAgravado: boolean;
  kitAplicado: 'si' | 'no' | '';
  relacionAgresor: 'conocido' | 'familiar' | 'desconocido' | '';
  otroRelacion: string;
  tipoLugar: 'institucion' | 'viaPublica' | 'domParticular' | '';
  otroLugar: string;
  dni: string;
  nombreVictima: string;
  genero: string | number | '';
  fechaNacimiento: string;
  telefono: string;
  calleNro: string;
  barrio: string;
  departamento: string | number | '';
  localidad: string | number | '';
  ocupacion: string;
  entrevistadoNombre: string;
  entrevistadoCalle: string;
  entrevistadoBarrio: string;
  entrevistadoDepartamento: string | number | '';
  entrevistadoLocalidad: string | number | '';
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
  seguimientoRealizado: 'si' | 'no' | '';
  segAsesoramientoLegal: boolean;
  segTratamientoPsicologico: boolean;
  segSeguimientoLegal: boolean;
  segArchivoCaso: boolean;
  detalleSeguimiento: string;
};

/** ========================
 *  TextField sin lag (commit onBlur)
 *  ======================== */
type FastTextFieldProps = Omit<React.ComponentProps<typeof TextField>, 'defaultValue' | 'onBlur' | 'value' | 'onChange'> & {
  name: keyof FormState;
  value: string;
  onCommit: (name: keyof FormState, next: string) => void;
  version: number;
};

const FastTextField: React.FC<FastTextFieldProps> = ({ name, value, onCommit, version, ...props }) => {
  const localRef = useRef<string>(value);
  const [key, setKey] = useState<number>(version);
  useEffect(() => setKey(version), [version]);

  return (
    <TextField
      key={`${String(name)}-${key}`}
      defaultValue={value ?? ''}
      onBlur={(e) => {
        const v = e.target.value ?? '';
        if (v !== localRef.current) {
          localRef.current = v;
          onCommit(name, v);
        }
      }}
      {...props}
    />
  );
};

/** ========================
 *  Mapeo de datos API -> FormState
 *  ======================== */
const mapearDatosAPI = (api: IntervencionDetalle): FormState => {
  // Datos básicos
  const fechaIntervencion = toDateInput(api.fecha);
  const coordinador = api.coordinador ?? '';
  const operador = api.operador ?? '';
  const observaciones = api.resena_hecho ?? '';

  // Derivación
  const deriv = api.derivaciones?.[0];
  const derivadorNombre = deriv?.derivador ?? '';
  const horaDerivacion = toDateTimeLocal(deriv?.fecha_derivacion);
  let motivoDerivacion: number | '' = typeof deriv?.motivos === 'number' ? deriv.motivos : '';
  if (!motivoDerivacion && deriv?.tipo_derivacion_id) motivoDerivacion = deriv.tipo_derivacion_id;

  // Hecho delictivo
  const hd: any = api.hechoDelictivo ?? api.hechos_delictivos?.[0] ?? {};
  const nroExpediente = hd.expediente ?? '';
  const nroAgresores = String(hd.numAgresores ?? hd.num_agresores ?? '');
  const geo0 = hd.geo?.[0];
  const calleBarrioHecho = hd.ubicacion?.calleBarrio ?? geo0?.domicilio ?? '';
  const departamentoHecho = hd.ubicacion?.departamento ?? geo0?.departamento_id ?? '';
  const fechaHecho = toDateInput(geo0?.fecha);
  const horaHecho = toTimeInput(geo0?.fecha);

  const th = hd.tipoHecho ?? hd.relaciones?.[0] ?? {};
  const robo = !!th.robo;
  const roboArmaFuego = !!(th.roboArmaFuego ?? th.robo_arma_fuego);
  const roboArmaBlanca = !!(th.roboArmaBlanca ?? th.robo_arma_blanca);
  const amenazas = !!th.amenazas;
  const lesiones = !!th.lesiones;
  const lesionesArmaFuego = !!(th.lesionesArmaFuego ?? th.lesiones_arma_fuego);
  const lesionesArmaBlanca = !!(th.lesionesArmaBlanca ?? th.lesiones_arma_blanca);
  const homicidioDelito = !!(th.homicidioDelito ?? th.homicidio_delito);
  const homicidioAccidenteVial = !!(th.homicidioAccidenteVial ?? th.homicidio_accidente_vial);
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
  const accionesPrimeraLinea = api.acciones_primera_linea?.[0]?.acciones ?? '';

  // Abuso sexual
  const abuso = api.abusos_sexuales?.[0];
  const abusoSexualSimple = abuso?.tipo_abuso === 1;
  const abusoSexualAgravado = abuso?.tipo_abuso === 2;
  const abusoDatos = abuso?.datos?.[0];
  const kitStr = (abusoDatos?.kit || '').toString().trim().toLowerCase();
  const kitAplicado: FormState['kitAplicado'] = kitStr === 'si' ? 'si' : kitStr === 'no' ? 'no' : '';

  let relacionAgresor: FormState['relacionAgresor'] = '';
  const rel = (abusoDatos?.relacion || '').toLowerCase();
  if (rel === 'conocido' || rel === 'familiar' || rel === 'desconocido') relacionAgresor = rel as any;
  const otroRelacion = relacionAgresor ? '' : abusoDatos?.relacion_otro ?? '';

  let tipoLugar: FormState['tipoLugar'] = '';
  const lugar = (abusoDatos?.lugar_hecho || '').toLowerCase();
  if (lugar === 'institucion') tipoLugar = 'institucion';
  else if (['vía pública', 'via publica', 'viapublica'].includes(lugar)) tipoLugar = 'viaPublica';
  else if (['domicilio particular', 'dom particular', 'domparticular'].includes(lugar)) tipoLugar = 'domParticular';
  const otroLugar = tipoLugar ? '' : abusoDatos?.lugar_otro ?? '';

  // Víctima
  const vict = api.victimas?.[0];
  const dni = vict?.dni ?? '';
  const nombreVictima = vict?.nombre ?? '';
  const genero = (vict?.genero ?? vict?.genero_id) ?? '';
  const fechaNacimiento = toDateInput(vict?.fecha_nacimiento);
  const telefono = vict?.telefono ?? '';
  const calleNro = vict?.direccion?.calle_nro ?? '';
  const barrio = vict?.direccion?.barrio ?? '';
  const departamento = vict?.direccion?.departamento ?? '';
  const localidad = vict?.direccion?.localidad ?? '';
  const ocupacion = vict?.ocupacion ?? '';

  const ent = vict?.personas_entrevistadas?.[0];
  const entrevistadoNombre = ent?.nombre ?? '';
  const entrevistadoCalle = ent?.direccion?.calle_nro ?? '';
  const entrevistadoBarrio = ent?.direccion?.barrio ?? '';
  const entrevistadoDepartamento = ent?.direccion?.departamento ?? '';
  const entrevistadoLocalidad = ent?.direccion?.localidad ?? '';
  const entrevistadoRelacion = ent?.relacion_victima ?? '';

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
  const seguimientoRealizado: FormState['seguimientoRealizado'] = seg?.hubo ? 'si' : 'no';
  const segTipo = seg?.tipo?.[0];
  const segAsesoramientoLegal = !!segTipo?.asesoramientolegal;
  const segTratamientoPsicologico = !!segTipo?.tratamientopsicologico;
  const segSeguimientoLegal = !!segTipo?.seguimientolegal;
  const segArchivoCaso = !!segTipo?.archivocaso;
  const detalleSeguimiento = seg?.detalles?.[0]?.detalle ?? '';
  

  return {
    fechaIntervencion,
    coordinador,
    operador,
    observaciones,
    derivadorNombre,
    horaDerivacion,
    motivoDerivacion,
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
    departamentoHecho: departamentoHecho ?? '',
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
    departamento,
    localidad,
    ocupacion,
    entrevistadoNombre,
    entrevistadoCalle,
    entrevistadoBarrio,
    entrevistadoDepartamento,
    entrevistadoLocalidad,
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
const [departamentos, setDepartamentos] = useState<Array<{
  id: string;
  nombre: string;
}>>([]);

const [localidades, setLocalidades] = useState<Array<{
  id: string;
  nombre: string;
  departamento_id: string;
}>>([]);


fetch('/departamentosMendoza.json')
  .then(res => res.json())
  .then(data => setDepartamentos(data.departamentos || []))
  .catch(err => console.error('Error cargando departamentos:', err));


fetch('/localidadesMendoza.json')
  .then(res => res.json())
  .then(data => setLocalidades(data.localidades || []))
  .catch(err => console.error('Error cargando localidades:', err));



  // Buffer mutable (no re-render por tecla en FastTextField)
  const bufferRef = useRef<FormState>({
    fechaIntervencion: '',
    coordinador: '',
    operador: '',
    observaciones: '',
    derivadorNombre: '',
    horaDerivacion: '',
    motivoDerivacion: '',
    nroExpediente: '',
    nroAgresores: '',
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
    departamentoHecho: '',
    calleBarrioHecho: '',
    fechaHecho: '',
    horaHecho: '',
    accionesPrimeraLinea: '',
    abusoSexualSimple: false,
    abusoSexualAgravado: false,
    kitAplicado: '',
    relacionAgresor: '',
    otroRelacion: '',
    tipoLugar: '',
    otroLugar: '',
    dni: '',
    nombreVictima: '',
    genero: '',
    fechaNacimiento: '',
    telefono: '',
    calleNro: '',
    barrio: '',
    departamento: '',
    localidad: '',
    ocupacion: '',
    entrevistadoNombre: '',
    entrevistadoCalle: '',
    entrevistadoBarrio: '',
    entrevistadoDepartamento: '',
    entrevistadoLocalidad: '',
    entrevistadoRelacion: '',
    crisis: false,
    telefonica: false,
    domiciliaria: false,
    psicologica: false,
    medica: false,
    social: false,
    legal: false,
    sinIntervencion: false,
    archivoCaso: false,
    seguimientoRealizado: '',
    segAsesoramientoLegal: false,
    segTratamientoPsicologico: false,
    segSeguimientoLegal: false,
    segArchivoCaso: false,
    detalleSeguimiento: '',
  });

  // Inicialización desde selected (una sola vez y cuando cambie)
  useEffect(() => {
    const formData = mapearDatosAPI(selected as unknown as IntervencionDetalle);
    bufferRef.current = formData;
    setVersion((v) => v + 1);
  }, [selected]);

  // Commit genérico (no forza re-render por defecto para no laggear textos)
  const commit = useCallback((name: keyof FormState, next: string | number | boolean) => {
    (bufferRef.current as any)[name] = next;
  }, []);

  // Handlers que SÍ fuerzan re-render para controles que lo necesitan
  const forceCommit = useCallback((name: keyof FormState, next: string | number | boolean) => {
    (bufferRef.current as any)[name] = next;
    setVersion((v) => v + 1); // ✅ necesario para Checkboxes/Radio
  }, []);

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

  // Guardar cambios
  const handleGuardarCambios = async () => {
  console.log('✅ Entró a handleGuardarCambios');
    try {
      setGuardando(true);
      setMensaje(null);
      setError(null);

      const f = bufferRef.current;

      // Helpers de fechas/horas
      const derivFechaISO =
        f.horaDerivacion && f.horaDerivacion.includes('T') ? f.horaDerivacion : ''; // YYYY-MM-DDTHH:mm
      const hechoFechaISO = f.fechaHecho || '';     // YYYY-MM-DD
      const hechoHoraStr  = f.horaHecho || '';      // HH:mm

      // Normalizaciones abuso sexual
      const simple   = !!f.abusoSexualSimple;
      const agravado = !!f.abusoSexualAgravado;
      const relacion = f.relacionAgresor ? f.relacionAgresor : (f.otroRelacion ? 'otro' : '');
      const lugarHecho =
        f.tipoLugar === 'institucion'   ? 'institucion' :
        f.tipoLugar === 'viaPublica'    ? 'via pública' :
        f.tipoLugar === 'domParticular' ? 'domicilio particular' :
        (f.otroLugar ? 'otro' : '');

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
  motivos: f.motivoDerivacion === '' ? 0 : Number(f.motivoDerivacion),
  hora: derivFechaISO.replace('T', ' '), // <-- este es el nombre correcto
},


  hechoDelictivo: {
    expediente: f.nroExpediente,
    numAgresores: parseInt(f.nroAgresores || '0', 10) || 0,
    fecha: hechoFechaISO || '',
    hora: hechoHoraStr || '',
   ubicacion: {
  calleBarrio: f.calleBarrioHecho,
    departamento: toValidPositiveNumber(f.departamentoHecho) || 0,
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
 travestisidio_transfemicidio: f.transfemicidio,
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
    kit: f.kitAplicado || '',
    relacion,
    relacionOtro: f.otroRelacion,
    lugarHecho,
    lugarOtro: f.otroLugar,
  },
 
  victima: {
  cantidadVictimas: 1,
  dni: f.dni,
  nombre: f.nombreVictima,
  genero: f.genero === '' ? 0 : Number(f.genero),
  fechaNacimiento: f.fechaNacimiento || '',
  telefono: f.telefono,
  ocupacion: f.ocupacion,
direccion: {
  calleNro: f.calleNro,
  barrio: f.barrio,
  departamento: toValidPositiveNumber(f.departamento),
  localidad: toValidPositiveNumber(f.localidad),
}

},

personaEntrevistada: {
  nombre: f.entrevistadoNombre,
  relacionVictima: f.entrevistadoRelacion,
  direccion: {
    calleNro: f.entrevistadoCalle,
    barrio: f.entrevistadoBarrio,
departamento: toValidPositiveNumber(f.entrevistadoDepartamento),

 localidad: toOptionalPositiveNumber(f.entrevistadoLocalidad),
  }
},





  seguimiento: {
    realizado: f.seguimientoRealizado === 'si',
    tipo: {
      asesoramientoLegal: f.segAsesoramientoLegal,
      tratamientoPsicologico: f.segTratamientoPsicologico,
      seguimientoLegal: f.segSeguimientoLegal,
      archivoCaso: f.segArchivoCaso,
    },
  },
  detalleSeguimiento: f.detalleSeguimiento,
};

try {
  console.log('Payload enviado:', JSON.stringify(payload, null, 2));
} catch (e) {
  console.error('Error al hacer JSON.stringify del payload', e);
  console.log('Payload crudo:', payload);
}

console.log('🧪 Payload FINAL que se enviará al backend:', JSON.stringify(payload, null, 2));

      await actualizarIntervencion(selected.id, payload);
      setMensaje('Cambios guardados correctamente ✅');
      setTimeout(() => router.push('/inicio'), 1200);
    } catch (e: any) {
      console.error('Error al guardar', e);
      setError('Ocurrió un error al guardar. Revisa los campos e intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };
  const f = bufferRef.current;

  const localidadesVictima = localidades.filter(
  (l) => Number(l.departamento_id) === Number(f.departamento)
);



 const localidadesEntrevistado = Array.isArray(localidades)
  ? localidades.filter((l) => Number(l.departamento_id) === Number(f.entrevistadoDepartamento))
  : [];



  return (
    <Box sx={{ p: 4, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">
          Editar Intervención {selected.numero_intervencion}
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/inicio')} disabled={guardando}>
          Cancelar
        </Button>
      </Box>

      {/* 1. Intervención */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>1. Datos de la Intervención</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Fecha de Intervención"
              type="date"
              fullWidth
              value={f.fechaIntervencion}
              onChange={(e) => forceCommit('fechaIntervencion', e.target.value)}
              InputLabelProps={{ shrink: true }}
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
        <Typography variant="h6" gutterBottom>2. Derivación</Typography>
        <Grid container spacing={2}>
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
          <Grid item xs={12} md={6}>
            <TextField
              label="Fecha y Hora de Derivación"
              type="datetime-local"
              fullWidth
              value={f.horaDerivacion}
              onChange={(e) => forceCommit('horaDerivacion', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="motivo-derivacion">Motivo</InputLabel>
              <Select
                labelId="motivo-derivacion"
                label="Motivo"
                value={f.motivoDerivacion === '' ? '' : Number(f.motivoDerivacion)}
                onChange={(e) =>
                  forceCommit('motivoDerivacion', e.target.value === '' ? '' : Number(e.target.value))
                }
              >
                {motivosDerivacion.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Hecho delictivo */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>3. Datos del Hecho Delictivo</Typography>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={12} md={10}>
            <FastTextField
              name="nroExpediente"
              label="Número de Expediente"
              fullWidth
              value={f.nroExpediente}
              onCommit={commit}
              version={version}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Nro Agresores"
              type="number"
              fullWidth
              value={f.nroAgresores}
              onChange={(e) => forceCommit('nroAgresores', e.target.value)}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        <FormLabel>Hecho delictivo</FormLabel>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {([
            ['robo', 'Robo'],
            ['roboArmaFuego', 'Robo con arma de fuego'],
            ['roboArmaBlanca', 'Robo con arma blanca'],
            ['amenazas', 'Amenazas'],
            ['lesiones', 'Lesiones'],
            ['lesionesArmaFuego', 'Lesiones con arma de fuego'],
            ['lesionesArmaBlanca', 'Lesiones con arma blanca'],
            ['homicidioDelito', 'Homicidio por Delito'],
            ['homicidioAccidenteVial', 'Homicidio por Accidente Vial'],
            ['homicidioAvHecho', 'Homicidio / Av. Hecho'],
            ['femicidio', 'Femicidio'],
            ['transfemicidio', 'Travestisidio / Transfemicidio'],
            ['violenciaGenero', 'Violencia de género'],
            ['otros', 'Otros'],
          ] as const).map(([key, label]) => (
            <Grid item xs={12} md={6} key={key}>
              <FormControlLabel
                control={
                  // ✅ CONTROLADO (sin defaultChecked)
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
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FastTextField
              name="calleBarrioHecho"
              label="Calle y Nro / Barrio / Lugar"
              fullWidth
              value={f.calleBarrioHecho}
              onCommit={commit}
              version={version}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FastTextField
              name="departamentoHecho"
              label="Departamento (ID / nombre)"
              fullWidth
              value={String(f.departamentoHecho ?? '')}
              onCommit={commit}
              version={version}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Fecha del hecho"
              type="date"
              fullWidth
              value={f.fechaHecho}
              onChange={(e) => forceCommit('fechaHecho', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Hora del hecho"
              type="time"
              fullWidth
              value={f.horaHecho}
              onChange={(e) => forceCommit('horaHecho', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 4. Acciones primera línea */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>4. Acciones Realizadas en Primera Línea</Typography>
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

      {/* 5. Abuso sexual */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>5. ¿Hubo Abuso Sexual?</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={f.abusoSexualSimple}
                onChange={onCheck('abusoSexualSimple')}
              />
            }
            label="Abuso Sexual Simple"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.abusoSexualAgravado}
                onChange={onCheck('abusoSexualAgravado')}
              />
            }
            label="Abuso Sexual Agravado"
          />
        </FormGroup>
      </Paper>

      {/* 5.1 Datos del abuso sexual */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>5.1 Datos del Abuso Sexual</Typography>
        <FormLabel>¿Se aplicó el kit?</FormLabel>
        <RadioGroup
          row
          value={f.kitAplicado}
          onChange={(e) => onRadio('kitAplicado')(e as any)}
          sx={{ mb: 2 }}
        >
          <FormControlLabel value="si" control={<Radio />} label="Sí" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
        <FormLabel>Relación entre la víctima y el presunto agresor</FormLabel>
        <RadioGroup
          row
          value={f.relacionAgresor}
          onChange={(e) => onRadio('relacionAgresor')(e as any)}
        >
          <FormControlLabel value="conocido" control={<Radio />} label="Conocido" />
          <FormControlLabel value="familiar" control={<Radio />} label="Familiar" />
          <FormControlLabel value="desconocido" control={<Radio />} label="Desconocido" />
        </RadioGroup>
        <FastTextField
          sx={{ mt: 2 }}
          name="otroRelacion"
          label="Otro (especificar)"
          fullWidth
          value={f.otroRelacion}
          onCommit={commit}
          version={version}
        />
        <Divider sx={{ my: 2 }} />
        <FormLabel>Tipo de lugar del hecho</FormLabel>
        <RadioGroup
          row
          value={f.tipoLugar}
          onChange={(e) => onRadio('tipoLugar')(e as any)}
        >
          <FormControlLabel value="institucion" control={<Radio />} label="Institución" />
          <FormControlLabel value="viaPublica" control={<Radio />} label="Vía Pública" />
          <FormControlLabel value="domParticular" control={<Radio />} label="Domicilio Particular" />
        </RadioGroup>
        <FastTextField
          sx={{ mt: 2 }}
          name="otroLugar"
          label="Otro lugar (especificar)"
          fullWidth
          value={f.otroLugar}
          onCommit={commit}
          version={version}
        />
      </Paper>

      {/* 6. Víctima */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>6. Datos de la Víctima</Typography>
        
        {/* Información sobre víctimas */}
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
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
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          Identificación (Solo una persona) - Apellido y Nombre es un campo obligatorio
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
              <InputLabel id="genero-select-label">Seleccioná un género</InputLabel>
              <Select
                labelId="genero-select-label"
                label="Seleccioná un género"
                value={f.genero === '' ? '' : Number(f.genero)}
                onChange={(e) => forceCommit('genero', e.target.value === '' ? '' : Number(e.target.value))}
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
              onChange={(e) => forceCommit('fechaNacimiento', e.target.value)}
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

    
);

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
        value={f.departamento === '' ? '' : Number(f.departamento)}
        onChange={(e) => {
          forceCommit('departamento', e.target.value);
          forceCommit('localidad', ''); // limpiamos localidad si cambia departamento
        }}
      >
        <MenuItem value="">--Seleccione Departamento--</MenuItem>
        {departamentos.map((d) => (
          <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>

  <Grid item xs={12} md={4}>
    <FormControl fullWidth>
      <InputLabel>--Seleccione Localidad--</InputLabel>
      <Select
        label="--Seleccione Localidad--"
        value={f.localidad === '' ? '' : Number(f.localidad)}
        onChange={(e) => forceCommit('localidad', e.target.value)}
      >
        <MenuItem value="">--Seleccione Localidad--</MenuItem>
        {localidadesVictima.map((l) => (
          <MenuItem key={l.id} value={l.id}>{l.nombre}</MenuItem>
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
       <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
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
        value={f.entrevistadoDepartamento === '' ? '' : Number(f.entrevistadoDepartamento)}
        onChange={(e) => {
          forceCommit('entrevistadoDepartamento', e.target.value);
          forceCommit('entrevistadoLocalidad', ''); // Limpia localidad al cambiar depto
        }}
      >
        <MenuItem value="">--Seleccione Departamento--</MenuItem>
        {departamentos.map((d) => (
          <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>

  <Grid item xs={12} md={4}>
    <FormControl fullWidth>
      <InputLabel>--Seleccione Localidad--</InputLabel>
      <Select
        label="--Seleccione Localidad--"
        value={f.entrevistadoLocalidad === '' ? '' : Number(f.entrevistadoLocalidad)}
        onChange={(e) => forceCommit('entrevistadoLocalidad', e.target.value)}
      >
        <MenuItem value="">--Seleccione Localidad--</MenuItem>
        {localidadesEntrevistado.map((l) => (
          <MenuItem key={l.id} value={l.id}>{l.nombre}</MenuItem>
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
        <Typography variant="h6" gutterBottom>7. Tipo de Intervención</Typography>
        <Grid container spacing={1}>
          {([
            ['crisis', 'Intervención en Crisis'],
            ['telefonica', 'Intervención Telefónica'],
            ['domiciliaria', 'Intervención Domiciliaria'],
            ['psicologica', 'Intervención Psicológica'],
            ['medica', 'Intervención Médica'],
            ['social', 'Intervención Social'],
            ['legal', 'Intervención Legal'],
            ['sinIntervencion', 'Sin Intervención'],
            ['archivoCaso', 'Archivo del Caso'],
          ] as const).map(([key, label]) => (
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

      {/* 7.1 Seguimiento */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>7.1 Seguimiento</Typography>
        <FormLabel>¿Se realizó seguimiento?</FormLabel>
        <RadioGroup
          row
          value={f.seguimientoRealizado}
          onChange={(e) => onRadio('seguimientoRealizado')(e as any)}
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
                onChange={onCheck('segAsesoramientoLegal')}
              />
            }
            label="Asesoramiento Legal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.segTratamientoPsicologico}
                onChange={onCheck('segTratamientoPsicologico')}
              />
            }
            label="Tratamiento Psicológico"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.segSeguimientoLegal}
                onChange={onCheck('segSeguimientoLegal')}
              />
            }
            label="Seguimiento Legal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={f.segArchivoCaso}
                onChange={onCheck('segArchivoCaso')}
              />
            }
            label="Archivo del Caso"
          />
        </FormGroup>
      </Paper>

      {/* 7.2 Detalle seguimiento */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>7.2 Detalle de Seguimiento</Typography>
        <FastTextField
          name="detalleSeguimiento"
          label="Detalle de seguimiento"
          fullWidth
          multiline
          rows={3}
          value={f.detalleSeguimiento}
          onCommit={commit}
          version={version}
        />
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
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => router.push('/inicio')}
          disabled={guardando}
        >
          Cancelar
        </Button>
      </Box>

      <Snackbar open={!!mensaje} autoHideDuration={5000} onClose={() => setMensaje(null)}>
        <Alert severity="success" onClose={() => setMensaje(null)}>{mensaje}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(EditarFormularioVictima);
