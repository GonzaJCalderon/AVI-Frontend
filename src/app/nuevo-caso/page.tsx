'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { 
  validateInterventionDate, 
  validateBirthDate, 
  validateIncidentDate, 
  validateDateTimeInput 
} from '@/utils/dateValidation';

import {
  Box, Button, Checkbox, Divider, FormControl,
  FormControlLabel, Grid, InputLabel, MenuItem, Paper,
  Radio, RadioGroup, Select, TextField, Typography, FormHelperText,
} from '@mui/material';
import { crearIntervencion, CreateIntervencionPayload } from '@/services/intervenciones';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';


// ✅ Labels para tipo de hecho delictivo
const labelMap: Record<string, string> = {
  robo: "Robo",
  roboArmaFuego: "Robo con arma de fuego",
  roboArmaBlanca: "Robo con arma blanca",
  amenazas: "Amenazas",
  lesiones: "Lesiones",
  lesionesArmaFuego: "Lesiones con arma de fuego",
  lesionesArmaBlanca: "Lesiones con arma blanca",
  homicidioDelito: "Homicidio por delito",
  homicidioAccidenteVial: "Homicidio por accidente vial",
  homicidioAvHecho: "Homicidio/ Av. Hecho",
  femicidio: "Femicidio",
  travestisidioTransfemicidio: "Travestisidio / Transfemicidio",
  violenciaGenero: "Violencia de género",
  otros: "Otros"
};



const preventInvalidDateYear = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
  const isNumber = /\d/.test(e.key);
  const isDash = e.key === '-';

  if (!allowedKeys.includes(e.key) && !isNumber && !isDash) {
    e.preventDefault();
    return;
  }

  // Validar que el año no pueda ser mayor al actual
  const input = e.currentTarget;
  const nextValue = input.value.slice(0, input.selectionStart || 0) + e.key + input.value.slice(input.selectionEnd || 0);

  // Si se ha completado un año de 4 dígitos al inicio
  const match = nextValue.match(/^(\d{4})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      e.preventDefault();
    }
  }
};


const dateFieldStyles = {
  width: '180px',
  '& input': {
    fontSize: '0.9rem',
    padding: '10.5px 14px',
  },
  '& label': {
    fontSize: '0.85rem',
  },
};


// ✅ Opciones de derivación
const derivacionOptions: Record<number, string> = {
  1: "CEO 911",
  2: "Min. Seguridad",
  3: "Min. Público Fiscal",
  4: "Hospital",
  5: "Centro de Salud",
  6: "Demanda espontánea",
  7: "Municipio",
  8: "Otro"
};



export default function NuevoCasoPage() {
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [localidades, setLocalidades] = useState<any[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');
const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
const [formErrors, setFormErrors] = useState<Record<string, string>>({});
const [mostrarErrores, setMostrarErrores] = useState(false);
const [errores, setErrores] = useState<string[]>([])
const [fechaNacimientoInput, setFechaNacimientoInput] = useState('');




useEffect(() => {
  const loadData = async () => {
    try {
      const [depRes, locRes] = await Promise.all([
        fetch('/departamentosMendoza.json'),
        fetch('/localidadesMendoza.json'),
      ]);

      const deps = await depRes.json();
      const locs = await locRes.json();

      setDepartamentos(deps.departamentos || deps);
      setLocalidades(locs.localidades || locs);

      console.log('📦 Departamentos cargados:', deps.departamentos?.length || deps.length);
      console.log('📦 Localidades cargadas:', locs.localidades?.length || locs.length);
    } catch (error) {
      console.error('❌ Error cargando JSONs:', error);
    }
  };

  loadData();
}, []);


  


 const today = new Date().toISOString().split('T')[0];
const now = new Date().toISOString().slice(0, 16);
const todayISO = today;

const Alert = MuiAlert as React.ComponentType<any>;

const showNotification = (message: string, severity: 'success' | 'error') => {
  setSnackbarMessage(message);
  setSnackbarSeverity(severity);
  setSnackbarOpen(true);
};

const handleCloseSnackbar = () => {
  setSnackbarOpen(false);
};




// ✅ Fecha mínima permitida para nacimiento (mínimo 1 año de edad)
const maxBirthDate = new Date();
maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 1);
const maxBirthDateStr = maxBirthDate.toISOString().split('T')[0];

const router = useRouter();

const [formData, setFormData] = useState<CreateIntervencionPayload>({
  intervencion: { 
    coordinador: '', 
    operador: '', 
    fecha: '', 
    resena_hecho: '' 
  },
  derivacion: { 
    motivos: 0, 
    derivador: null, 
    fecha_derivacion: '',

    expediente: null,       // 🆕 agregado
    departamento: null,     // 🆕 agregado
    localidad: null         // 🆕 agregado
  },
  hechoDelictivo: {
    expediente: '',
    numAgresores: 0,
    fecha: null,
    hora: '',
    ubicacion: { 
      calleBarrio: '', 
      departamento: null, 
      localidad: null 
    },
    tipoHecho: {
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
      travestisidioTransfemicidio: false,
      violenciaGenero: false,
      otros: false
    }
  },
  accionesPrimeraLinea: '',
  abusoSexual: { 
    simple: false, 
    agravado: false 
  },
  datosAbusoSexual: { 
    kit: '', 
    relacion: '', 
    relacionOtro: '', 
    lugarHecho: '', 
    lugarOtro: '' 
  },
  victima: {
    dni: '',
    nombre: '',
    genero: 1,
   fechaNacimiento: null,

    telefono: '',
    ocupacion: '',
    cantidadVictimas: 1,
direccion: {
  calleNro: '',
  barrio: '',
  departamento: '', 
  localidad: ''     
}

  },
  personaEntrevistada: {
    nombre: '',
    relacionVictima: '',
    direccion: { 
      calleNro: '', 
      barrio: '', 
      departamento: 0, 
      localidad: 0 
    }
  },
  tipoIntervencion: {
    crisis: false,
    telefonica: false,
    domiciliaria: false,
    psicologica: false,
    medica: false,
    social: false,
    legal: false,
    sinIntervencion: false,
    archivoCaso: false
  },
  seguimiento: {
    realizado: null,
    tipo: {
      asesoramientoLegal: false,
      tratamientoPsicologico: false,
      seguimientoLegal: false,
      archivoCaso: false
    }
  },
  detalleIntervencion: ''
});








  // ✅ handler genérico
const handleChange = (path: string) => (e: any) => {
  const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  setFormData((prev: CreateIntervencionPayload) => {
    const newData: any = { ...prev };
    const keys = path.split('.');
    let ref = newData;
    for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
    ref[keys[keys.length - 1]] = value;
    return newData as CreateIntervencionPayload;
  });

  setFormErrors((prev: Record<string, string>) => {
    const newErrors = { ...prev };
    delete newErrors[path];
    return newErrors;
  });
};


const validarFormulario = (): string[] => {
  const nuevosErrores: string[] = [];

  if (!formData.intervencion.coordinador.trim()) {
    nuevosErrores.push("El nombre y apellido del coordinador es obligatorio");
  }

  if (!formData.intervencion.fecha) {
    nuevosErrores.push("La fecha de la intervención es obligatoria");
  }

  if (!Object.values(formData.hechoDelictivo.tipoHecho).some(v => v === true)) {
    nuevosErrores.push("Debe marcar al menos un tipo de delito");
  }

  if (!formData.hechoDelictivo.ubicacion.calleBarrio.trim()) {
    nuevosErrores.push("La ubicación geográfica del hecho es obligatoria");
  }

  if (!formData.hechoDelictivo.ubicacion.departamento || formData.hechoDelictivo.ubicacion.departamento === 0) {
    nuevosErrores.push("Debe seleccionar un departamento para el hecho");
  }

  if (!formData.hechoDelictivo.fecha) {
    nuevosErrores.push("La fecha del hecho es obligatoria");
  }

const { sinIntervencion, ...resto } = formData.tipoIntervencion as CreateIntervencionPayload['tipoIntervencion'];



// Solución 2: actualizar el uso
const huboIntervencion = Object.values(resto).some(v => v === true);


  const huboAbuso = formData.abusoSexual.simple || formData.abusoSexual.agravado;

  if (huboAbuso) {
    if (formData.datosAbusoSexual.kit.trim() === '') {
      nuevosErrores.push("Debe indicar si se aplicó el kit cuando hubo abuso sexual");
    }

    if (formData.datosAbusoSexual.relacion.trim() === '') {
      nuevosErrores.push("Debe indicar la relación entre la víctima y el presunto agresor");
    }

    if (formData.datosAbusoSexual.lugarHecho.trim() === '') {
      nuevosErrores.push("Debe indicar el tipo de lugar del hecho");
    }
  }

  if (!formData.victima.nombre.trim()) {
    nuevosErrores.push("El nombre de la víctima es obligatorio");
  }

  if (!Object.values(formData.tipoIntervencion).some(v => v === true)) {
    nuevosErrores.push("Debe marcar al menos un tipo de intervención");
  }

  if (!formData.detalleIntervencion.trim()) {
    nuevosErrores.push("Debe completar el detalle de la intervención");
  }

  if (formData.seguimiento.realizado === true) {
    const algunoSeleccionado = Object.values(formData.seguimiento.tipo).some((v) => v === true);
    if (!algunoSeleccionado) {
      nuevosErrores.push("Debe marcar al menos un tipo de seguimiento");
    }
  }

  return nuevosErrores;
};

// 🆕 Función para combinar fecha y hora
const combinarFechaHoraHecho = (fecha: string, hora: string): string => {
  const [year, month, day] = fecha.split("-").map(Number);
  const [hours, minutes] = hora.split(":").map(Number);

  const localDate = new Date();
  localDate.setFullYear(year);
  localDate.setMonth(month - 1);
  localDate.setDate(day);
  localDate.setHours(hours);
  localDate.setMinutes(minutes);
  localDate.setSeconds(0);
  localDate.setMilliseconds(0);

  const iso = new Date(
    Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      localDate.getHours(),
      localDate.getMinutes()
    )
  ).toISOString();

  return iso;
};


const parseISODate = (input: string): string | null => {
  console.log('🔄 parseISODate - INPUT:', input);

  if (!input || input.trim() === '') {
    console.log('❌ Input vacío → devolviendo null');
    return null; // ✅ antes devolvía '', ahora null
  }

  // Si ya viene en formato ISO completo
  if (input.includes('T') && input.includes('Z')) {
    console.log('✅ Ya es ISO completo:', input);
    return input;
  }

  try {
    // YYYY-MM-DD
    if (input.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const resultado = new Date(input + 'T00:00:00.000Z').toISOString();
      console.log('✅ Convertido de YYYY-MM-DD:', resultado);
      return resultado;
    }

    // YYYY-MM-DDTHH:mm
    if (input.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      const resultado = new Date(input + ':00.000Z').toISOString();
      console.log('✅ Convertido de datetime-local:', resultado);
      return resultado;
    }

    const date = new Date(input);
    if (!isNaN(date.getTime())) {
      const resultado = date.toISOString();
      console.log('✅ Parseado directo:', resultado);
      return resultado;
    }

    console.log('❌ No se pudo parsear → devolviendo null');
    return null;
  } catch (error) {
    console.error('❌ Error en parseISODate:', error);
    return null;
  }
};

const normalizarPayloadParaBackend = (payload: CreateIntervencionPayload): any => {
  const toEmptyString = (val: any): string => {
    if (val === null || val === undefined || val === '') return '';
    return String(val);
  };
  
  const toNumberOrZero = (val: any): number => {
    const num = Number(val);
    return !isNaN(num) && num > 0 ? num : 0;
  };

  // ✅ Construir objeto victima sin fechaNacimiento si está vacío
  const victimaData: any = {
    dni: toEmptyString(payload.victima.dni),
    nombre: toEmptyString(payload.victima.nombre),
    genero: Number(payload.victima.genero) || 1,
    telefono: toEmptyString(payload.victima.telefono),
    ocupacion: toEmptyString(payload.victima.ocupacion),
    cantidadVictimas: Number(payload.victima.cantidadVictimas) || 1,
    direccion: {
      calleNro: toEmptyString(payload.victima.direccion.calleNro),
      barrio: toEmptyString(payload.victima.direccion.barrio),
      departamento: Number(payload.victima.direccion.departamento) || 0,
      localidad: payload.victima.direccion.localidad
        ? Number(payload.victima.direccion.localidad)
        : null,
    },
  };

  // ✅ Solo agregar fechaNacimiento si tiene un valor válido
  if (
    typeof payload.victima.fechaNacimiento === 'string' && 
    payload.victima.fechaNacimiento.trim() &&
    payload.victima.fechaNacimiento !== ''
  ) {
    victimaData.fechaNacimiento = payload.victima.fechaNacimiento.split('T')[0];
  }
  
  return {
    intervencion: {
      fecha: payload.intervencion.fecha || '',
      coordinador: toEmptyString(payload.intervencion.coordinador),
      operador: toEmptyString(payload.intervencion.operador),
      resena_hecho: toEmptyString(payload.intervencion.resena_hecho),
    },
    derivacion: {
      motivos: toNumberOrZero(payload.derivacion.motivos) || 1,
      derivador: toEmptyString(payload.derivacion.derivador),
      fecha_derivacion: payload.derivacion.fecha_derivacion || '',
    },
    hechoDelictivo: {
      expediente: toEmptyString(payload.hechoDelictivo.expediente),
      numAgresores: toNumberOrZero(payload.hechoDelictivo.numAgresores),
      fecha: payload.hechoDelictivo.fecha === '' ? null : payload.hechoDelictivo.fecha,
      hora: toEmptyString(payload.hechoDelictivo.hora),
      ubicacion: {
        calleBarrio: toEmptyString(payload.hechoDelictivo.ubicacion.calleBarrio),
        departamento: toNumberOrZero(payload.hechoDelictivo.ubicacion.departamento),
        localidad: toNumberOrZero(payload.hechoDelictivo.ubicacion.localidad),
      },
      tipoHecho: payload.hechoDelictivo.tipoHecho,
    },
    accionesPrimeraLinea: toEmptyString(payload.accionesPrimeraLinea),
    abusoSexual: payload.abusoSexual,
    datosAbusoSexual: {
      kit: toEmptyString(payload.datosAbusoSexual.kit),
      relacion: toEmptyString(payload.datosAbusoSexual.relacion),
      relacionOtro: toEmptyString(payload.datosAbusoSexual.relacionOtro),
      lugarHecho: toEmptyString(payload.datosAbusoSexual.lugarHecho),
      lugarOtro: toEmptyString(payload.datosAbusoSexual.lugarOtro),
    },
    victima: victimaData, // ✅ Usar el objeto construido
    personaEntrevistada: {
      nombre: toEmptyString(payload.personaEntrevistada.nombre),
      relacionVictima: toEmptyString(payload.personaEntrevistada.relacionVictima),
      direccion: {
        calleNro: toEmptyString(payload.personaEntrevistada.direccion.calleNro),
        barrio: toEmptyString(payload.personaEntrevistada.direccion.barrio),
        departamento: Number(payload.personaEntrevistada.direccion.departamento) || 0,
        localidad:
          payload.personaEntrevistada.direccion.localidad === '' ||
          payload.personaEntrevistada.direccion.localidad === null
            ? null
            : Number(payload.personaEntrevistada.direccion.localidad),
      },
    },
    tipoIntervencion: payload.tipoIntervencion,
    seguimiento: {
      realizado: payload.seguimiento.realizado ?? false,
      tipo: payload.seguimiento.tipo,
    },
    detalleIntervencion: toEmptyString(payload.detalleIntervencion),
  };
};

const handleSubmit = async () => {
  console.log('🚀 ==================== INICIO SUBMIT ====================');
  console.log('📊 Estado actual de formData:', JSON.stringify(formData, null, 2));
  
  setMostrarErrores(true);
  const erroresValidados = validarFormulario();
  setErrores(erroresValidados);

  if (erroresValidados.length > 0) {
    console.log('❌ Errores de validación:', erroresValidados);
    showNotification(`Errores en el formulario:\n${erroresValidados.join('\n')}`, 'error');
    return;
  }

  console.log('✅ Validación pasada, construyendo payload...');
  
  try {
    const fechaHechoCombinada = combinarFechaHoraHecho(
      formData.hechoDelictivo.fecha || '',
      formData.hechoDelictivo.hora || ''
    );

    console.log('🔗 Fecha+Hora combinada FINAL:', fechaHechoCombinada);
    
    // Construir payload base
    const payloadBase: CreateIntervencionPayload = {
      ...formData,
      intervencion: {
        fecha: formData.intervencion.fecha
          ? parseISODate(formData.intervencion.fecha)
          : null,
        coordinador: formData.intervencion.coordinador,
        operador: formData.intervencion.operador,
        resena_hecho: formData.intervencion.resena_hecho,
      },
      derivacion: {
        ...formData.derivacion,
        expediente: formData.hechoDelictivo.expediente, // ✅ Mover expediente aquí
        fecha_derivacion: formData.derivacion.fecha_derivacion
          ? parseISODate(formData.derivacion.fecha_derivacion)
          : null,
      },
      hechoDelictivo: {
        ...formData.hechoDelictivo,
        fecha: fechaHechoCombinada,
        hora: formData.hechoDelictivo.hora,
      },
      victima: {
        ...formData.victima,
        fechaNacimiento: formData.victima.fechaNacimiento
          ? parseISODate(formData.victima.fechaNacimiento)
          : null,
      },
    };

    // ✅ Normalizar payload completo
    const payloadNormalizado = normalizarPayloadParaBackend(payloadBase);

    console.log('📦 ==================== PAYLOAD NORMALIZADO ====================');
    console.log(JSON.stringify(payloadNormalizado, null, 2));
    console.log('==============================================================');

    await crearIntervencion(payloadNormalizado);
      
    console.log('✅ Intervención creada exitosamente');
    showNotification('Intervención creada con éxito', 'success');

    setTimeout(() => {
      router.push('/inicio');
    }, 2500);
  } catch (error: any) {
    console.error('❌ ==================== ERROR ====================');
    console.error('Error completo:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('================================================');
    showNotification(`Error al enviar: ${error.message}`, 'error');
  }
};





const handleFechaIntervencionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);

    const currentYear = new Date().getFullYear();

    const isValidDate = !isNaN(new Date(value).getTime());

    if (!isValidDate) {
      setFormErrors(prev => ({
        ...prev,
        ['intervencion.fecha']: 'Fecha inválida'
      }));
      return;
    }

    if (year > currentYear) {
      setFormErrors(prev => ({
        ...prev,
        ['intervencion.fecha']: `El año no puede ser mayor a ${currentYear}`
      }));
      return;
    }

    if (year < 1900) {
      setFormErrors(prev => ({
        ...prev,
        ['intervencion.fecha']: 'El año no puede ser menor a 1900'
      }));
      return;
    }

    // Si pasa todo:
    setFormErrors(prev => {
      const copy = { ...prev };
      delete copy['intervencion.fecha'];
      return copy;
    });
validateInterventionDate(
  value,
  'intervencion.fecha',
  (val) =>
    setFormData((prev: CreateIntervencionPayload) => ({
      ...prev,
      intervencion: {
        ...prev.intervencion,
        fecha: val,
      }
    })),
  setFormErrors
);
  } else {
    // No coincide formato
    setFormErrors(prev => ({
      ...prev,
      ['intervencion.fecha']: 'Formato inválido (AAAA-MM-DD)'
    }));
  }
};



const handleFechaDerivacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  
  validateDateTimeInput({
    value,
    min: '1900-01-01T00:00',
    fieldKey: 'derivacion.fecha_derivacion',
    setData: (val) =>
      setFormData(prev => ({
        ...prev,
        derivacion: {
          ...prev.derivacion,
          fecha_derivacion: val,
        }
      })),
    setErrors: setFormErrors,
    allowFuture: false
  });
};


const handleFechaHechoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      value = `${currentYear}-${match[2]}-${match[3]}`;
    }
  }

  validateIncidentDate(
    value,
    'hechoDelictivo.fecha',
    (val) =>
      setFormData((prev: CreateIntervencionPayload) => ({
        ...prev,
        hechoDelictivo: {
          ...prev.hechoDelictivo,
          fecha: val,
        },
      })),
    setFormErrors
  );
};



const handleFechaNacimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      value = `${currentYear}-${match[2]}-${match[3]}`;
    }
  }

  validateBirthDate(
    value,
    'victima.fechaNacimiento',
    (val) =>
      setFormData(prev => ({
        ...prev,
        victima: {
          ...prev.victima,
          fechaNacimiento: val
        }
      })),
    setFormErrors,
    1
  );
};





  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
          Protocolo de Asistencia
        </Typography>
        <Divider sx={{ my: 3 }} />

       {/* 1. Intervención */}
<Typography variant="h6">1. Datos de la Intervención</Typography>
<Grid container spacing={2}>
<Grid item xs="auto">
  <TextField
    type="date"
    label="Fecha *"
    value={formData.intervencion.fecha}
    onChange={(e) => {
      const value = e.target.value;

      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        const year = parseInt(match[1], 10);
        const currentYear = new Date().getFullYear();

        if (year > currentYear) {
          const fixedDate = `${currentYear}-${match[2]}-${match[3]}`;
          setFormData((prev) => ({
            ...prev,
            intervencion: { ...prev.intervencion, fecha: fixedDate },
          }));
          return;
        }
      }

      setFormData((prev) => ({
        ...prev,
        intervencion: { ...prev.intervencion, fecha: value },
      }));
    }}
    error={!!formErrors['intervencion.fecha']}
    helperText={formErrors['intervencion.fecha']}
    InputLabelProps={{ shrink: true }}
    inputProps={{
      max: todayISO,
      min: '1900-01-01',
      onKeyDown: preventInvalidDateYear,
      onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData('text');
        const match = pasted.match(/^(\d{4})/);
        if (match) {
          const year = parseInt(match[1], 10);
          const currentYear = new Date().getFullYear();
          if (year > currentYear || year < 1900) {
            e.preventDefault();
          }
        }
      }
    }}
    sx={dateFieldStyles}
  />
</Grid>



  <Grid item xs={12} md={4}>
   <TextField
  label="Nombre y apellido del Coordinador *"
  value={formData.intervencion.coordinador}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      intervencion: { ...prev.intervencion, coordinador: e.target.value },
    }))
  }
  fullWidth
  error={mostrarErrores && formData.intervencion.coordinador.trim() === ""}
  helperText={
    mostrarErrores && formData.intervencion.coordinador.trim() === ""
      ? "El nombre y apellido del coordinador es obligatorio"
      : ""
  }
/>

  </Grid>

  <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="Operador"
      value={formData.intervencion.operador}
      onChange={handleChange('intervencion.operador')}
      placeholder="Nombre y apellido del operador"
    />
  </Grid>

  <Grid item xs={12}>
    <TextField
      fullWidth
      multiline
      rows={3}
      label="Breve reseña del hecho"
      value={formData.intervencion.resena_hecho}
      onChange={handleChange('intervencion.resena_hecho')}
      placeholder="Describa brevemente lo ocurrido..."
    />
  </Grid>
</Grid>

<Divider sx={{ my: 3 }} />

{/* 2. Derivación */}
<Typography variant="h6">2. Derivación</Typography>

<Grid container spacing={2}>
  {/* Derivador */}
  <Grid item xs={12} md={6}>
    <TextField
      fullWidth
      label="Nombre y Apellido del Derivador"
      value={formData.derivacion.derivador ?? ''}


      onChange={handleChange('derivacion.derivador')}
    />
  </Grid>

  {/* Fecha/Hora */}
  <Grid item xs={12} md={6}>
    <TextField
      type="datetime-local"
      label="Fecha/Hora"
value={formData.derivacion.fecha_derivacion || ''}




      onChange={handleFechaDerivacionChange}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        max: now,
        min: '1900-01-01T00:00',
        onKeyDown: preventInvalidDateYear
      }}
      sx={dateFieldStyles}
      fullWidth
    />
  </Grid>

  {/* Número de Expediente */}
  <Grid item xs={12} md={6}>
    <TextField
      fullWidth
      label="Número de Expediente"
      placeholder="Ej. 1234/2023"
      value={formData.hechoDelictivo.expediente}
      onChange={handleChange('hechoDelictivo.expediente')}
    />
  </Grid>

  {/* Cantidad de Agresores */}
  <Grid item xs={12} md={2}>
    <TextField
      fullWidth
      type="number"
      label="Cantidad de agresores"
      value={formData.hechoDelictivo.numAgresores}
      onChange={(e) => {
        const value = parseInt(e.target.value, 10);
        setFormData((prev) => ({
          ...prev,
          hechoDelictivo: {
            ...prev.hechoDelictivo,
            numAgresores: isNaN(value) ? 0 : Math.max(0, value),
          },
        }));
      }}
      inputProps={{ min: 0 }}
    />
  </Grid>
</Grid>

<Grid container spacing={2} sx={{ mt: 2 }}>
  {Object.entries(derivacionOptions).map(([id, label]) => (
    <Grid item xs={12} md={6} key={id}>
      <FormControlLabel
        control={
          <Radio
            checked={formData.derivacion.motivos === Number(id)}
            onChange={() =>
              setFormData((prev) => ({
                ...prev,
                derivacion: {
                  ...prev.derivacion,
                  motivos: Number(id),
                  // Limpiar derivador si cambia a una opción distinta
                  derivador:
                    Number(id) === 7 || Number(id) === 8
                      ? prev.derivacion.derivador
                      : '',
                },
              }))
            }
          />
        }
        label={label}
      />

      {/* 🟢 Municipio: Mostrar Select de departamentos */}
      {Number(id) === 7 &&
        formData.derivacion.motivos === Number(id) && (
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Seleccione Municipio</InputLabel>
            <Select
              value={formData.derivacion.derivador}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  derivacion: {
                    ...prev.derivacion,
                    derivador: String(e.target.value),
                  },
                }))
              }
            >
              <MenuItem value="">Seleccione...</MenuItem>
              {departamentos.map((dep) => (
                <MenuItem key={dep.id} value={dep.nombre}>
                  {dep.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

      {/* 🟣 Otro: Mostrar campo de texto libre */}
      {Number(id) === 8 &&
        formData.derivacion.motivos === Number(id) && (
          <TextField
            fullWidth
            label="Especifique Otro"
            sx={{ mt: 1 }}
            value={formData.derivacion.derivador}
            onChange={handleChange("derivacion.derivador")}
          />
        )}
    </Grid>
  ))}
</Grid>


<Divider sx={{ my: 3 }} />


{/* 3. Hecho Delictivo */}
<Typography variant="h6">3. Datos del Hecho Delictivo</Typography>

<Grid container spacing={2}>
  {/* Fecha del Hecho */}
  <Grid item xs="auto">
<TextField
  type="date"
  value={formData.hechoDelictivo.fecha ?? ''}
 
      onChange={handleFechaHechoChange}
      error={!!formErrors['hechoDelictivo.fecha']}
      helperText={formErrors['hechoDelictivo.fecha']}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        max: todayISO,
        min: '1900-01-01',
        onKeyDown: preventInvalidDateYear, // Evita escribir fechas inválidas
      }}
      sx={{ width: 180 }} // Ancho fijo para la fecha
    />
  </Grid>

  {/* Hora del Hecho */}
  <Grid item xs="auto">
    <TextField
      type="time"
      label="Hora del Hecho *"
      value={formData.hechoDelictivo.hora}
      onChange={handleChange('hechoDelictivo.hora')}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        step: 60, // Intervalo en minutos
      }}
      error={!!formErrors['hechoDelictivo.hora']}
      helperText={formErrors['hechoDelictivo.hora']}
      sx={{ width: 120 }} // Ancho reducido para HH:mm
    />
  </Grid>
</Grid>

{/* Ubicación del Hecho */}
<Typography variant="subtitle1" sx={{ mt: 2 }}>
  Ubicación del Hecho
</Typography>

<Grid container spacing={2}>
  {/* Calle y Barrio */}
  <Grid item xs={12} md={6}>
    <TextField
      fullWidth
      label="Calle y Barrio"
      value={formData.hechoDelictivo.ubicacion.calleBarrio}
      onChange={handleChange('hechoDelictivo.ubicacion.calleBarrio')}
      required
    />
  </Grid>

  {/* Departamento */}
  <Grid item xs={12} md={6}>
    <FormControl
      fullWidth
      error={
        mostrarErrores &&
        (!formData.hechoDelictivo.ubicacion.departamento ||
          formData.hechoDelictivo.ubicacion.departamento === 0)
      }
    >
      <InputLabel>Departamento *</InputLabel>
      <Select
  value={formData.hechoDelictivo.ubicacion.departamento || ''}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      hechoDelictivo: {
        ...prev.hechoDelictivo,
        ubicacion: {
          ...prev.hechoDelictivo.ubicacion,
          departamento: e.target.value, // ✅ string, no Number()
          localidad: '',
        },
      },
    }))
  }
>
  <MenuItem value="">Seleccione...</MenuItem>
  {departamentos.map((dep) => (
    <MenuItem key={dep.id} value={dep.id}>
      {dep.nombre}
    </MenuItem>
  ))}
</Select>

      <FormHelperText>
        {mostrarErrores &&
        (!formData.hechoDelictivo.ubicacion.departamento ||
          formData.hechoDelictivo.ubicacion.departamento === 0)
          ? 'Debe seleccionar un departamento para el hecho'
          : ''}
      </FormHelperText>
    </FormControl>
  </Grid>

  {/* Localidad */}
  <Grid item xs={12} md={6}>
<FormControl fullWidth>
  <InputLabel>Localidad *</InputLabel>
  <Select
    value={formData.hechoDelictivo.ubicacion.localidad || ''}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        hechoDelictivo: {
          ...prev.hechoDelictivo,
          ubicacion: {
            ...prev.hechoDelictivo.ubicacion,
            localidad: e.target.value, // ✅ sin Number()
          },
        },
      }))
    }
    disabled={!formData.hechoDelictivo.ubicacion.departamento}
  >
    <MenuItem value="">Seleccione...</MenuItem>
    {localidades
      .filter(
        (loc) =>
          loc.departamento_id ===
          String(formData.hechoDelictivo.ubicacion.departamento) // ✅ compara como string
      )
      .map((loc) => (
        <MenuItem key={loc.id} value={loc.id}>
          {loc.nombre}
        </MenuItem>
      ))}
  </Select>
</FormControl>

  </Grid>
</Grid>

{/* Tipo de Hecho */}
<FormControl
  component="fieldset"
  error={
    mostrarErrores &&
    !Object.values(formData.hechoDelictivo.tipoHecho).some((v) => v === true)
  }
  sx={{ width: '100%', mt: 2 }}
>
  <Typography variant="subtitle1">
    Tipo de Hecho <span style={{ color: 'red' }}>*</span>
  </Typography>

  <Grid container spacing={2}>
   {Object.entries(formData.hechoDelictivo.tipoHecho).map(([key, value]) => (
  <Grid item xs={6} md={4} key={key}>
    <FormControlLabel
      control={
        <Checkbox
          checked={Boolean(value)} // ✅ Asegurar que sea boolean
          onChange={handleChange(`hechoDelictivo.tipoHecho.${key}`)}
        />
      }
      label={labelMap[key] || key}
    />
  </Grid>
))}
  </Grid>

  <FormHelperText>
    {mostrarErrores &&
    !Object.values(formData.hechoDelictivo.tipoHecho).some((v) => v === true)
      ? 'Debe marcar al menos un tipo de delito'
      : ''}
  </FormHelperText>
</FormControl>

<Divider sx={{ my: 3 }} />


        {/* 4. Acciones */}
        <Typography variant="h6">4. Acciones en Primera Línea</Typography>
        <TextField fullWidth multiline required rows={3} label="Acciones realizadas"
          value={formData.accionesPrimeraLinea} onChange={handleChange('accionesPrimeraLinea')} />

        <Divider sx={{ my: 3 }} />

{/* 5. Abuso Sexual */}
<Typography variant="h6">5. Abuso Sexual</Typography>

<Grid container spacing={2} sx={{ mt: 2 }}>
  {/* Abuso sexual simple */}
  <Grid item xs={12} md={6}>
    <FormControlLabel
      control={
        <Checkbox
          checked={formData.abusoSexual.simple}
          onChange={handleChange('abusoSexual.simple')}
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
          checked={formData.abusoSexual.agravado}
          onChange={handleChange('abusoSexual.agravado')}
        />
      }
      label="Abuso sexual agravado"
    />
  </Grid>

  {/* Kit aplicado - Solo se muestra si hay algún tipo de abuso seleccionado */}
  {(formData.abusoSexual.simple || formData.abusoSexual.agravado) && (
    <Grid item xs={12} md={6}>
      <FormControl
        fullWidth
        error={mostrarErrores && formData.datosAbusoSexual.kit.trim() === ''}
      >
        <InputLabel>Kit aplicado *</InputLabel>
        <Select
          value={formData.datosAbusoSexual.kit}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              datosAbusoSexual: {
                ...prev.datosAbusoSexual,
                kit: String(e.target.value),
              },
            }))
          }
        >
          <MenuItem value="">Seleccione...</MenuItem>
          <MenuItem value="SI">SI</MenuItem>
          <MenuItem value="NO">NO</MenuItem>
        </Select>
        {mostrarErrores && formData.datosAbusoSexual.kit.trim() === '' && (
          <FormHelperText>Debe indicar si se aplicó el kit</FormHelperText>
        )}
      </FormControl>
    </Grid>
  )}

  {/* Relación entre víctima y agresor */}
  <Grid item xs={12}>
    <Typography variant="subtitle1" sx={{ mt: 2 }}>
      Relación entre la víctima y el presunto agresor:
    </Typography>
    <FormControl fullWidth>
      <InputLabel>Relación</InputLabel>
      <Select
        value={formData.datosAbusoSexual.relacion}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            datosAbusoSexual: {
              ...prev.datosAbusoSexual,
              relacion: String(e.target.value),
            },
          }))
        }
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

  {/* Campo adicional cuando elige "Otro" en relación */}
  {formData.datosAbusoSexual.relacion === 'Otro' && (
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Especifique relación"
        value={formData.datosAbusoSexual.relacionOtro}
        onChange={handleChange('datosAbusoSexual.relacionOtro')}
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
        value={formData.datosAbusoSexual.lugarHecho}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            datosAbusoSexual: {
              ...prev.datosAbusoSexual,
              lugarHecho: String(e.target.value),
            },
          }))
        }
      >
        <MenuItem value="">Seleccione...</MenuItem>
        <MenuItem value="Institución">Institución</MenuItem>
        <MenuItem value="Vía pública">Vía Pública</MenuItem>
        <MenuItem value="Domicilio particular">Dom. Particular</MenuItem>
        <MenuItem value="Lugar de trabajo">Lugar de trabajo</MenuItem>
        <MenuItem value="Otro">Otro</MenuItem>
      </Select>
    </FormControl>
  </Grid>

  {/* Campo adicional cuando elige "Otro" en lugar del hecho */}
  {formData.datosAbusoSexual.lugarHecho === 'Otro' && (
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Especifique lugar"
        value={formData.datosAbusoSexual.lugarOtro}
        onChange={handleChange('datosAbusoSexual.lugarOtro')}
      />
    </Grid>
  )}
</Grid>





     {/* 6. Víctima */}
<Typography variant="h6">6. Víctima</Typography>
<Grid container spacing={2}>
    <Grid item xs={12} md={4}>
    <TextField
      fullWidth
      label="DNI"
      value={formData.victima.dni}
      onChange={handleChange('victima.dni')}
      inputProps={{
        inputMode: 'numeric',     // Para mostrar teclado numérico en móviles
        pattern: '[0-9]*',        // Patrón para solo números
        maxLength: 8,             // Límite de dígitos (opcional)
        onKeyDown: (e) => {
          const allowedKeys = [
            'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'
          ];
          if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
            e.preventDefault(); // Bloquea todo excepto números y teclas permitidas
          }
        },
        onInput: (e) => {
          // Elimina cualquier caracter no numérico pegado
          e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
        }
      }}
    />
  </Grid>


  <Grid item xs={12} md={4}>
 <TextField
  fullWidth
  label="Nombre de la Víctima *"
  value={formData.victima.nombre}
  onChange={handleChange('victima.nombre')}
  error={mostrarErrores && formData.victima.nombre.trim() === ""}
  helperText={
    mostrarErrores && formData.victima.nombre.trim() === ""
      ? "El nombre de la víctima es obligatorio"
      : ""
  }
/>


  </Grid>
  <Grid item xs={12} md={4}>
<TextField
  type="number"
  fullWidth
  label="Cantidad de víctimas *"
  value={formData.victima.cantidadVictimas}
  onChange={handleChange('victima.cantidadVictimas')}
  required
  inputProps={{ min: 1 }}
/>



  </Grid>
 
<Grid item xs={12} md={4}>
  <TextField
    label="Fecha de Nacimiento"
    placeholder="dd/mm/aaaa"
value={formData.victima.fechaNacimiento ? formData.victima.fechaNacimiento.split('T')[0] : ''}

    fullWidth
    InputLabelProps={{ shrink: true }}
   error={!!formErrors['victima.fechaNacimiento']}
helperText={formErrors['victima.fechaNacimiento'] || ''} // No mostrar si está vacío

    inputProps={{
      maxLength: 10,
      inputMode: 'numeric',
      onPaste: (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
        if (pasted.length > 8) {
          e.preventDefault();
        }
      }
    }}
   
    onChange={(e) => {
  let raw = e.target.value.replace(/\D/g, '');
  if (raw.length > 8) raw = raw.slice(0, 8);
  
  let formatted = raw;
  if (raw.length >= 5) {
    formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
  } else if (raw.length >= 3) {
    formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
  }

  setFechaNacimientoInput(formatted);

  if (formatted === '') {
    setFormErrors(prev => {
      const copy = { ...prev };
      delete copy['victima.fechaNacimiento'];
      return copy;
    });
    setFormData(prev => ({
      ...prev,
      victima: {
        ...prev.victima,
        fechaNacimiento: ''
      }
    }));
    return;
  }

  if (formatted.length === 10) {
    const [dd, mm, yyyy] = formatted.split('/');
    const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    const date = new Date(iso);
    const minDate = new Date('1900-01-01');
    const today = new Date();

    if (isNaN(date.getTime()) || date < minDate || date > today) {
      setFormErrors(prev => ({
        ...prev,
        'victima.fechaNacimiento': 'Fecha fuera de rango o inválida',
      }));
      setFormData(prev => ({
        ...prev,
        victima: {
          ...prev.victima,
          fechaNacimiento: '',
        },
      }));
      return;
    }

    setFormErrors(prev => {
      const copy = { ...prev };
      delete copy['victima.fechaNacimiento'];
      return copy;
    });
    setFormData(prev => ({
      ...prev,
      victima: {
        ...prev.victima,
        fechaNacimiento: iso,
      },
    }));
  } else {
    setFormErrors(prev => {
      const copy = { ...prev };
      delete copy['victima.fechaNacimiento'];
      return copy;
    });
  }
}}

  />
</Grid>

  <Grid item xs={12} md={4}>
  <FormControl fullWidth>
    <InputLabel>Género</InputLabel>
    <Select
      value={formData.victima.genero || ''}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          victima: { ...prev.victima, genero: Number(e.target.value) }
        }))
      }
    >
      <MenuItem value={1}>Masculino</MenuItem>
      <MenuItem value={2}>Femenino</MenuItem>
      <MenuItem value={3}>Otro</MenuItem>
    </Select>
  </FormControl>
</Grid>

  <Grid item xs={12} md={4}>
    <TextField fullWidth label="Teléfono"
     value={formData.victima.telefono ?? ''}
      onChange={handleChange('victima.telefono')}
    />
  </Grid>
  <Grid item xs={12} md={4}>
    <TextField fullWidth label="Ocupación"
      value={formData.victima.ocupacion}
      onChange={handleChange('victima.ocupacion')}
    />
  </Grid>
  <Grid item xs={12} md={6}>
  <FormControl fullWidth>
  <InputLabel>Departamento</InputLabel>
  <Select
    value={formData.victima.direccion.departamento || ''} // ✅ Usar string vacío en lugar de 0
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        victima: {
          ...prev.victima,
          direccion: {
            ...prev.victima.direccion,
            departamento: Number(e.target.value),
            localidad: 0,
          },
        },
      }))
    }
  >
    <MenuItem value="">Seleccione un departamento</MenuItem> {/* ✅ Agregar opción vacía */}
    {departamentos.map((dep) => (
      <MenuItem key={dep.id} value={dep.id}>
        {dep.nombre}
      </MenuItem>
    ))}
  </Select>
</FormControl>
  </Grid>
  <Grid item xs={12} md={6}>
    <FormControl fullWidth>
      <InputLabel>Localidad</InputLabel>
      <Select
     value={formData.victima.direccion.localidad ?? ''}

       onChange={(e) =>
  setFormData(prev => ({
    ...prev,
    victima: {
      ...prev.victima,
      direccion: {
        ...prev.victima.direccion,
        localidad: Number(e.target.value) // ✅ convertir string → number
      }
    }
  }))
}

      >
        {localidades
          .filter(loc => Number(loc.departamento_id) === formData.victima.direccion.departamento)
          .map(loc => (
            <MenuItem key={loc.id} value={Number(loc.id)}>
              {loc.nombre}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  </Grid>
</Grid>

<Typography variant="subtitle1" sx={{ mt: 3 }}>
  Persona Entrevistada
</Typography>
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
<TextField
  fullWidth
  label="Nombre y Apellido de la Persona Entrevistada (opcional)"
  value={formData.personaEntrevistada.nombre}
  onChange={handleChange('personaEntrevistada.nombre')}
/>


  </Grid>
  <Grid item xs={12} md={6}>
    <TextField fullWidth label="Relación con la víctima"
      value={formData.personaEntrevistada.relacionVictima}
      onChange={handleChange('personaEntrevistada.relacionVictima')}
    />
  </Grid>
  <Grid item xs={12} md={6}>
  <TextField
  fullWidth
  label="Calle y Nro / Barrio / Lugar"
  value={formData.personaEntrevistada.direccion.calleNro}
  onChange={handleChange('personaEntrevistada.direccion.calleNro')}
/>


  </Grid>
  <Grid item xs={12} md={3}>
 <FormControl fullWidth>
  <InputLabel>Departamento</InputLabel>
 <Select
 value={formData.personaEntrevistada.direccion.departamento ?? ''}

  onChange={(e) =>
    setFormData(prev => ({
      ...prev,
      personaEntrevistada: {
        ...prev.personaEntrevistada,
        direccion: {
          ...prev.personaEntrevistada.direccion,
          departamento: Number(e.target.value), // ✅ Correcto
          localidad: 0 // ✅ Resetear localidad cuando cambia departamento
        }
      }
    }))
  }
>

    {departamentos.map(dep => (
      <MenuItem key={dep.id} value={Number(dep.id)}>
        {dep.nombre}
      </MenuItem>
    ))}
  </Select>
</FormControl>

  </Grid>
  <Grid item xs={12} md={3}>
    <FormControl fullWidth>
      <InputLabel>Localidad</InputLabel>
      <Select
value={formData.personaEntrevistada.direccion.localidad ?? ''}


        onChange={(e) =>
          setFormData(prev => ({
            ...prev,
            personaEntrevistada: {
              ...prev.personaEntrevistada,
              direccion: {
                ...prev.personaEntrevistada.direccion,
                localidad: Number(e.target.value)
              }
            }
          }))
        }
      >
        {localidades
          .filter(loc => Number(loc.departamento_id) === formData.personaEntrevistada.direccion.departamento)
          .map(loc => (
            <MenuItem key={loc.id} value={Number(loc.id)}>
              {loc.nombre}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  </Grid>
</Grid>

<Divider sx={{ my: 3 }} />


     {/* 7. Tipo de Intervención */}
<FormControl
  component="fieldset"
  required
  error={mostrarErrores && !Object.values(formData.tipoIntervencion).some(v => v === true)}
  sx={{ width: '100%', mt: 2 }}
>
  <Typography variant="h6">
    7. Tipo de Intervención <span style={{ color: 'red' }}>*</span>
  </Typography>

  {/* Checkboxes */}
  <Grid container spacing={2} sx={{ mt: 1 }}>
    {Object.entries(formData.tipoIntervencion).map(([key, value]) => (
      <Grid item xs={6} md={4} key={key}>
        <FormControlLabel
          control={
            <Checkbox
           checked={Boolean(value)} 
              onChange={handleChange(`tipoIntervencion.${key}`)}
            />
          }
          label={key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())}
        />
      </Grid>
    ))}
  </Grid>

  {/* Error mensaje si no se marca ningún checkbox */}
  <FormHelperText>
    {mostrarErrores && !Object.values(formData.tipoIntervencion).some(v => v === true)
      ? "Debe marcar al menos un tipo de intervención"
      : ""}
  </FormHelperText>
</FormControl>

{/* Detalle obligatorio */}
<TextField
  fullWidth
  multiline
  rows={3}
  sx={{ mt: 3 }}
  label="Detalle de la Intervención *"  // ✅ Nombre correcto
  value={formData.detalleIntervencion}  // ✅ Usar estado correcto
  onChange={handleChange('detalleIntervencion')}
  error={mostrarErrores && formData.detalleIntervencion.trim() === ""}
  helperText={
    mostrarErrores && formData.detalleIntervencion.trim() === ""
      ? "Debe completar el detalle de la intervención"
      : ""
  }
/>


<Divider sx={{ my: 3 }} />

{/* 8. Seguimiento */}
<Typography variant="h6">8. Seguimiento</Typography>

<FormControl
  error={mostrarErrores && formData.seguimiento.realizado === null}
  sx={{ mt: 2 }}
>
  <Typography>¿Se realizó seguimiento? *</Typography>
  <RadioGroup
    row
    value={
      formData.seguimiento.realizado === null
        ? ''
        : formData.seguimiento.realizado
        ? 'si'
        : 'no'
    }
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        seguimiento: {
          ...prev.seguimiento,
          realizado: e.target.value === 'si',
          tipo:
            e.target.value === 'no'
              ? {
                  asesoramientoLegal: false,
                  tratamientoPsicologico: false,
                  seguimientoLegal: false,
                  archivoCaso: false,
                }
              : prev.seguimiento.tipo,
        },
      }))
    }
  >
    <FormControlLabel value="si" control={<Radio />} label="Sí" />
    <FormControlLabel value="no" control={<Radio />} label="No" />
  </RadioGroup>
  <FormHelperText>
    {mostrarErrores && formData.seguimiento.realizado === null
      ? 'Debe seleccionar una opción'
      : ''}
  </FormHelperText>
</FormControl>



{/* Si la respuesta es "Sí", mostrar los tipos de seguimiento */}
{formData.seguimiento.realizado && (
  <Grid container spacing={2} sx={{ mt: 2 }}>
    <Typography variant="subtitle1" sx={{ mb: 2, ml: 1 }}>
      Tipos de seguimiento
    </Typography>

    {Object.entries(formData.seguimiento.tipo).map(([key, value]) => (
      <Grid item xs={6} md={3} key={key}>
        <FormControlLabel
          control={
            <Checkbox
              checked={value}
              onChange={handleChange(`seguimiento.tipo.${key}`)}
            />
          }
          label={
            key === 'archivoCaso'
              ? 'Archivo'
              : key
                  .replace(/([A-Z])/g, ' $1') // Separar palabras por mayúsculas
                  .replace(/^./, (str) => str.toUpperCase()) // Capitalizar primera letra
          }
        />
      </Grid>
    ))}
  </Grid>
)}

        <Box textAlign="center" mt={5}>
          <Button variant="contained" color="primary" size="large" onClick={handleSubmit}>
            Guardar Intervención
          </Button>
        </Box>
      </Paper>
    <Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  sx={{
    mt: 2,
    zIndex: 1400, // asegura que esté sobre Paper
    maxWidth: '90%',
    left: '50%',
    transform: 'translateX(-50%)',
  }}
>
  <Alert
    onClose={handleCloseSnackbar}
    severity={snackbarSeverity}
    sx={{
      width: '100%',
      fontSize: '1rem',
      fontWeight: 500,
      boxShadow: 4,
    }}
    elevation={6}
    variant="filled"
  >
    {snackbarMessage.split('\n').map((line, idx) => (
      <div key={idx}>{line}</div>
    ))}
  </Alert>
</Snackbar>


    </Box>
  );
}
