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




  useEffect(() => {
    fetch('/departamentosMendoza.json')
      .then(res => res.json())
      .then(data => setDepartamentos(data.departamentos || []));
    fetch('/localidadesMendoza.json')
      .then(res => res.json())
      .then(data => setLocalidades(data.localidades || []));
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
  intervencion: { coordinador: '', operador: '', fecha: '', resena_hecho: '' },
  derivacion: { motivos: 0, derivador: '', fecha_derivacion: '' },
  hechoDelictivo: {
    expediente: '',
    numAgresores: 0,
    fecha: '',
    hora: '',
    ubicacion: { calleBarrio: '', departamento: 0, localidad: 0    },
    tipoHecho: {
      robo: false, roboArmaFuego: false, roboArmaBlanca: false,
      amenazas: false, lesiones: false, lesionesArmaFuego: false, lesionesArmaBlanca: false,
      homicidioDelito: false, homicidioAccidenteVial: false, homicidioAvHecho: false,
      femicidio: false, travestisidioTransfemicidio: false, violenciaGenero: false, otros: false
    }
  },
  accionesPrimeraLinea: '',
  abusoSexual: { simple: false, agravado: false },
  datosAbusoSexual: { kit: '', relacion: '', relacionOtro: '', lugarHecho: '', lugarOtro: '' },
  victima: {
    dni: '',
    nombre: '',
    genero: 0,
    fechaNacimiento: '',
    telefono: '',
    ocupacion: '',
    cantidadVictimas: 1,
    direccion: { calleNro: '', barrio: '', departamento: 0, localidad: 0 }
  },
  personaEntrevistada: {
    nombre: '',
    relacionVictima: '',
    direccion: { calleNro: '', barrio: '', departamento: 0, localidad: 0 }
  },
  tipoIntervencion: {
    crisis: false, telefonica: false, domiciliaria: false, psicologica: false,
    medica: false, social: false, legal: false, sinIntervencion: false, archivoCaso: false
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
  setFormData(prev => {
    const newData: any = { ...prev };
    const keys = path.split('.');
    let ref = newData;
    for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
    ref[keys[keys.length - 1]] = value;
    return newData;
  });

  // Limpiar error del campo al editar
  setFormErrors(prev => {
    const newErrors = { ...prev };
    delete newErrors[path];
    return newErrors;
  });
};




// 🔽 JUSTO ANTES de handleSubmit
// También actualiza la validación del formulario para ser más específica:
const validarFormulario = (): string[] => {
  const nuevosErrores: string[] = [];

  // 1️⃣ Coordinador
  if (!formData.intervencion.coordinador.trim()) {
    nuevosErrores.push("El nombre y apellido del coordinador es obligatorio");
  }

  // 2️⃣ Tipo de delito
  if (!Object.values(formData.hechoDelictivo.tipoHecho).some(v => v === true)) {
    nuevosErrores.push("Debe marcar al menos un tipo de delito");
  }

  // 3️⃣ Ubicación geográfica del hecho
  if (!formData.hechoDelictivo.ubicacion.calleBarrio.trim()) {
    nuevosErrores.push("La ubicación geográfica del hecho es obligatoria");
  }

  // 4️⃣ Departamento de la ubicación
  if (!formData.hechoDelictivo.ubicacion.departamento || formData.hechoDelictivo.ubicacion.departamento === 0) {
    nuevosErrores.push("Debe seleccionar un departamento para el hecho");
  }

  // 5️⃣ Fecha del hecho
  if (!formData.hechoDelictivo.fecha) {
    nuevosErrores.push("La fecha del hecho es obligatoria");
  }

  // 6️⃣ Acciones en primera línea
  if (!formData.accionesPrimeraLinea.trim()) {
    nuevosErrores.push("Debe detallar las acciones realizadas en primera línea");
  }


  // 7️⃣ Abuso sexual
// 7️⃣ Abuso sexual
const huboAbuso = formData.abusoSexual.simple || formData.abusoSexual.agravado;

if (huboAbuso) {
  // Validación: Kit obligatorio SOLO si se marcó algún abuso sexual
  if (formData.datosAbusoSexual.kit.trim() === '') {
    nuevosErrores.push("Debe indicar si se aplicó el kit cuando hubo abuso sexual");
  }

  // Validación: Relación obligatoria SOLO si se marcó algún abuso sexual
  if (formData.datosAbusoSexual.relacion.trim() === '') {
    nuevosErrores.push("Debe indicar la relación entre la víctima y el presunto agresor");
  }

  // Validación: Lugar del hecho obligatorio SOLO si se marcó algún abuso sexual
  if (formData.datosAbusoSexual.lugarHecho.trim() === '') {
    nuevosErrores.push("Debe indicar el tipo de lugar del hecho");
  }
}



  // 8️⃣ Victima - Nombre
  if (!formData.victima.nombre.trim()) {
    nuevosErrores.push("El nombre de la víctima es obligatorio");
  }

  // Nombre de la persona entrevistada obligatorio
if (!formData.personaEntrevistada.nombre.trim()) {
  nuevosErrores.push("El nombre y apellido de la persona entrevistada es obligatorio");
}

  // 9️⃣ Tipo de intervención
  if (!Object.values(formData.tipoIntervencion).some(v => v === true)) {
    nuevosErrores.push("Debe marcar al menos un tipo de intervención");
  }

// Detalle de la intervención obligatorio
if (!formData.detalleIntervencion.trim()) {
  nuevosErrores.push("Debe completar el detalle de la intervención");
}

  // 1️⃣1️⃣ Tipo de seguimiento
  if (!Object.values(formData.seguimiento.tipo).some(v => v === true)) {
    nuevosErrores.push("Debe marcar al menos un tipo de seguimiento");
  }

  return nuevosErrores;
};



const handleSubmit = async () => {
  setMostrarErrores(true);
  const erroresValidados = validarFormulario();
  setErrores(erroresValidados);

  if (erroresValidados.length > 0) {
    showNotification(`Errores en el formulario:\n${erroresValidados.join('\n')}`, 'error');
    return;
  }

  try {
   const payload: CreateIntervencionPayload = {
  ...formData,
  intervencion: {
    ...formData.intervencion,
    fecha: new Date(formData.intervencion.fecha).toISOString(),
  },
  derivacion: {
    ...formData.derivacion,
    fecha_derivacion: formData.derivacion.fecha_derivacion
      ? new Date(formData.derivacion.fecha_derivacion).toISOString()
      : '',
  },
  hechoDelictivo: {
    ...formData.hechoDelictivo,
    fecha: new Date(formData.hechoDelictivo.fecha).toISOString(),
  },
  victima: {
    ...formData.victima,
    fechaNacimiento: new Date(formData.victima.fechaNacimiento).toISOString(),
    direccion: {
      ...formData.victima.direccion,
      departamento: Number(formData.victima.direccion.departamento),
      localidad: Number(formData.victima.direccion.localidad),
    },
  },
};


    // 🚨 Elimina detalleSeguimiento si todavía existe
    delete (payload as any).detalleSeguimiento;

    console.log('📦 Payload FINAL enviado al backend:', JSON.stringify(payload, null, 2));

    await crearIntervencion(payload);
    showNotification('✅ Intervención creada con éxito', 'success');

    setTimeout(() => {
      router.push('/inicio');
    }, 2500);
  } catch (error: any) {
    console.error('Error completo:', error);
    showNotification(`❌ Error al enviar: ${error.message}`, 'error');
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
        setFormData(prev => ({
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
      setFormData(prev => ({
        ...prev,
        hechoDelictivo: {
          ...prev.hechoDelictivo,
          fecha: val
        }
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

    // Detecta el año ingresado
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const currentYear = new Date().getFullYear();

      if (year > currentYear) {
        // 🔹 Corrige automáticamente a la fecha máxima permitida
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
    // Bloqueo directo mientras escribe
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
      ];
      const isNumber = /\d/.test(e.key);
      const isDash = e.key === '-';

      if (!allowedKeys.includes(e.key) && !isNumber && !isDash) {
        e.preventDefault();
      }
    },
    // Bloquea pegado de fechas inválidas
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
      value={formData.derivacion.derivador}
      onChange={handleChange('derivacion.derivador')}
    />
  </Grid>

  {/* Fecha/Hora */}
  <Grid item xs={12} md={6}>
    <TextField
      type="datetime-local"
      label="Fecha/Hora"
      value={formData.derivacion.fecha_derivacion}
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
  <Grid item xs={12} md={1}>
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
                },
              }))
            }
          />
        }
        label={label}
      />
      {(Number(id) === 7 || Number(id) === 8) &&
        formData.derivacion.motivos === Number(id) && (
          <TextField
            fullWidth
            label={
              label === "Municipio" ? "Ingrese Municipio" : "Especifique Otro"
            }
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
      label="Fecha del Hecho"
      value={formData.hechoDelictivo.fecha}
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
                departamento: Number(e.target.value),
                localidad: 0, // Reinicia localidad cuando cambia departamento
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
                localidad: Number(e.target.value), // Guarda la localidad seleccionada
              },
            },
          }))
        }
        disabled={!formData.hechoDelictivo.ubicacion.departamento} // Deshabilitado si no hay departamento
      >
        <MenuItem value="">Seleccione...</MenuItem>
        {localidades
          .filter(
            (loc) =>
              Number(loc.departamento_id) ===
              formData.hechoDelictivo.ubicacion.departamento
          )
          .map((loc) => (
            <MenuItem key={loc.id} value={Number(loc.id)}>
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
              checked={value}
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
  type="date"
  fullWidth
  label="Fecha Nac. *"
  InputLabelProps={{ shrink: true }}
  inputProps={{
    max: new Date().toISOString().split('T')[0], // Solo hasta hoy
    min: '1900-01-01',
    // Prevenir entrada manual de fechas inválidas
    onKeyDown: (e: React.KeyboardEvent) => {
      // Permitir teclas de navegación y borrado
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (allowedKeys.includes(e.key)) return;
      
      // Permitir números y guiones
      if (!/[\d-]/.test(e.key)) {
        e.preventDefault();
      }
    }
  }}
  value={formData.victima.fechaNacimiento}
  onChange={handleFechaNacimientoChange}
  error={!!formErrors['victima.fechaNacimiento']}
  helperText={formErrors['victima.fechaNacimiento']}
  required
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
      value={formData.victima.telefono}
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
  value={formData.victima.direccion.departamento || ''}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      victima: {
        ...prev.victima,
        direccion: {
          ...prev.victima.direccion,
          // 👇 Usar e.target.value y asegurarse que sea numérico
          departamento: Number(e.target.value),
          localidad: 0, // Reinicia localidad al cambiar departamento
        },
      },
    }))
  }
  inputProps={{
    inputMode: 'numeric', // Muestra teclado numérico en móviles
    pattern: '[0-9]*',
    onKeyDown: (e) => {
      const allowedKeys = [
        'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'
      ];
      // Bloquea cualquier tecla que no sea número ni permitida
      if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    },
    onInput: (e) => {
      // Evita que se peguen letras u otros caracteres
      e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
    },
  }}
>
  <MenuItem value="">Seleccione un departamento</MenuItem>
  {departamentos.map((dep) => (
    <MenuItem key={dep.id} value={dep.id}>
      {dep.nombre} {/* 👈 Usa la propiedad correcta según tu JSON */}
    </MenuItem>
  ))}
</Select>

    </FormControl>
  </Grid>
  <Grid item xs={12} md={6}>
    <FormControl fullWidth>
      <InputLabel>Localidad</InputLabel>
      <Select
        value={formData.victima.direccion.localidad || ''}
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
  label="Nombre y Apellido de la Persona Entrevistada *"
  value={formData.personaEntrevistada.nombre}
  onChange={handleChange('personaEntrevistada.nombre')}
  error={mostrarErrores && formData.personaEntrevistada.nombre.trim() === ""}
  helperText={
    mostrarErrores && formData.personaEntrevistada.nombre.trim() === ""
      ? "El nombre y apellido de la persona entrevistada es obligatorio"
      : ""
  }
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
  label="Calle y Nro / Barrio / Lugar *"  // <-- Cambiar label
  value={formData.hechoDelictivo.ubicacion.calleBarrio}
  onChange={handleChange('hechoDelictivo.ubicacion.calleBarrio')}
  required
/>

  </Grid>
  <Grid item xs={12} md={3}>
 <FormControl fullWidth>
  <InputLabel>Departamento</InputLabel>
 <Select
  value={formData.personaEntrevistada.direccion.departamento}
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
        value={formData.personaEntrevistada.direccion.localidad || ''}
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
              checked={value}
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
        ? '' // Sin selección inicial
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
          // Si se selecciona "No", se limpian los tipos
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
