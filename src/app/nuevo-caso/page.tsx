'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
  Box, Button, Checkbox, Divider, FormControl,
  FormControlLabel, Grid, InputLabel, MenuItem, Paper,
  Radio, RadioGroup, Select, TextField, Typography
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


  // ✅ Estado inicial
  const [formData, setFormData] = useState<CreateIntervencionPayload>({
    intervencion: { coordinador: '', operador: '', fecha: '', resena_hecho: '' },
    derivacion: { motivos: 0, derivador: '', fecha_derivacion: '' },
    hechoDelictivo: {
      expediente: '',
      numAgresores: 0,
      fecha: todayISO,   
      hora: '',
      ubicacion: { calleBarrio: '', departamento: 0 }, // sin localidad
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
  fechaNacimiento: todayISO, 
  telefono: '',
  ocupacion: '',
  cantidadVictimas: 1,             // ✅ BIEN
direccion: { 
  calleNro: '', 
  barrio: '', 
  departamento: 0,     // ✅ tipo number
  localidad: 0         // ✅ tipo number
}
},
    personaEntrevistada: {
      nombre: '', relacionVictima: '',
      direccion: { calleNro: '', barrio: '', departamento: 0, localidad: 0 }
    },
    tipoIntervencion: {
      crisis: false, telefonica: false, domiciliaria: false, psicologica: false,
      medica: false, social: false, legal: false, sinIntervencion: false, archivoCaso: false
    },
    seguimiento: {
      realizado: false,
      tipo: { asesoramientoLegal: false, tratamientoPsicologico: false, seguimientoLegal: false, archivoCaso: false }
    },
    detalleSeguimiento: ''
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
  };
// 🔽 JUSTO ANTES de handleSubmit
const validarFormulario = () => {
  const errores = [];

  if (!formData.intervencion.fecha) errores.push('Fecha de intervención es requerida');
  if (!formData.intervencion.coordinador) errores.push('Coordinador es requerido');
  if (!formData.victima.nombre) errores.push('Nombre de víctima es requerido');

  const fechaNac = new Date(formData.victima.fechaNacimiento);
  const hoy = new Date();
  const minFechaNacimiento = new Date();
  minFechaNacimiento.setFullYear(minFechaNacimiento.getFullYear() - 1);

  if (fechaNac > hoy) {
    errores.push('La fecha de nacimiento no puede ser en el futuro');
  }

  if (fechaNac > minFechaNacimiento) {
    errores.push('La persona debe tener al menos 1 año de edad');
  }

  return errores;
};

const handleSubmit = async () => {
  const errores = validarFormulario();
  if (errores.length > 0) {
    showNotification(`Errores en el formulario:\n${errores.join('\n')}`, 'error');
    return;
  }

  try {
    const payload = {
      ...formData,
      intervencion: {
        ...formData.intervencion,
        fecha: new Date(formData.intervencion.fecha).toISOString(),
      },
      derivacion: {
        ...formData.derivacion,
        fecha_derivacion: formData.derivacion.fecha_derivacion ? 
          new Date(formData.derivacion.fecha_derivacion).toISOString() : ''
      },
      hechoDelictivo: {
        ...formData.hechoDelictivo,
        fecha: new Date(formData.hechoDelictivo.fecha).toISOString(),
      },
      victima: {
        ...formData.victima,
        fechaNacimiento: new Date(formData.victima.fechaNacimiento).toISOString(),
      },
    };

    console.log('📦 Payload FINAL enviado al backend:', JSON.stringify(payload, null, 2));

    const res = await crearIntervencion(payload);

    showNotification('✅ Intervención creada con éxito', 'success');

    // Redirigir después de 2.5s
    setTimeout(() => {
      router.push('/inicio');
    }, 2500);

  } catch (error: any) {
    console.error('Error completo:', error);
    showNotification(`❌ Error al enviar: ${error.message}`, 'error');
  }
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
          <Grid item xs={12} md={4}>
            <TextField type="date" fullWidth label="Fecha"
              InputLabelProps={{ shrink: true }}   inputProps={{ max: todayISO }}
              value={formData.intervencion.fecha} onChange={handleChange('intervencion.fecha')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Coordinador"
              value={formData.intervencion.coordinador} onChange={handleChange('intervencion.coordinador')} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Operador"
              value={formData.intervencion.operador} onChange={handleChange('intervencion.operador')} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label="Breve reseña del hecho"
              value={formData.intervencion.resena_hecho} onChange={handleChange('intervencion.resena_hecho')} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 2. Derivación */}
        <Typography variant="h6">2. Derivación</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Nombre y Apellido del Derivador"
              value={formData.derivacion.derivador} onChange={handleChange('derivacion.derivador')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField type="datetime-local" fullWidth label="Fecha/Hora"
              InputLabelProps={{ shrink: true }} inputProps={{ max: now }}
              value={formData.derivacion.fecha_derivacion} onChange={handleChange('derivacion.fecha_derivacion')} />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {Object.entries(derivacionOptions).map(([id, label]) => (
            <Grid item xs={12} md={6} key={id}>
              <FormControlLabel
                control={<Radio checked={formData.derivacion.motivos === Number(id)}
                  onChange={() => setFormData(prev => ({ ...prev, derivacion: { ...prev.derivacion, motivos: Number(id) } }))} />}
                label={label} />
              {(Number(id) === 7 || Number(id) === 8) && formData.derivacion.motivos === Number(id) && (
                <TextField fullWidth label={label === "Municipio" ? "Ingrese Municipio" : "Especifique Otro"}
                  sx={{ mt: 1 }} value={formData.derivacion.derivador} onChange={handleChange('derivacion.derivador')} />
              )}
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 3. Hecho Delictivo */}
        <Typography variant="h6">3. Datos del Hecho Delictivo</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Expediente" value={formData.hechoDelictivo.expediente}
              onChange={handleChange('hechoDelictivo.expediente')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField type="number" fullWidth label="Nro de Agresores"
  value={formData.hechoDelictivo.numAgresores}
  onChange={e =>
    setFormData(prev => ({
      ...prev,
      hechoDelictivo: {
        ...prev.hechoDelictivo,
        numAgresores: Number(e.target.value)
      }
    }))
  }
/>

          </Grid>
          <Grid item xs={12} md={6}>
            <TextField type="date" fullWidth label="Fecha del Hecho"
              InputLabelProps={{ shrink: true }}   inputProps={{ max: todayISO }}
              value={formData.hechoDelictivo.fecha} onChange={handleChange('hechoDelictivo.fecha')} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField type="time" fullWidth label="Hora del Hecho"
              value={formData.hechoDelictivo.hora} onChange={handleChange('hechoDelictivo.hora')} />
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Ubicación del Hecho</Typography>
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    <TextField
      fullWidth
      label="Calle y Barrio"
      value={formData.hechoDelictivo.ubicacion.calleBarrio}
      onChange={handleChange('hechoDelictivo.ubicacion.calleBarrio')}
    />
  </Grid>
  <Grid item xs={12} md={6}>
    <FormControl fullWidth>
      <InputLabel>Departamento</InputLabel>
      <Select
        value={formData.hechoDelictivo.ubicacion.departamento}
        onChange={(e) =>
          setFormData(prev => ({
            ...prev,
            hechoDelictivo: {
              ...prev.hechoDelictivo,
              ubicacion: {
                ...prev.hechoDelictivo.ubicacion,
                departamento: Number(e.target.value)
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
</Grid>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Tipo de Hecho</Typography>
        <Grid container spacing={2}>
          {Object.entries(formData.hechoDelictivo.tipoHecho).map(([key, value]) => (
            <Grid item xs={6} md={4} key={key}>
              <FormControlLabel
                control={<Checkbox checked={value} onChange={handleChange(`hechoDelictivo.tipoHecho.${key}`)} />}
                label={labelMap[key] || key} />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 4. Acciones */}
        <Typography variant="h6">4. Acciones en Primera Línea</Typography>
        <TextField fullWidth multiline rows={3} label="Acciones realizadas"
          value={formData.accionesPrimeraLinea} onChange={handleChange('accionesPrimeraLinea')} />

        <Divider sx={{ my: 3 }} />

        {/* 5. Abuso Sexual */}
        <Typography variant="h6">5. Abuso Sexual</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel control={<Checkbox checked={formData.abusoSexual.simple}
              onChange={handleChange('abusoSexual.simple')} />} label="Abuso sexual simple" />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel control={<Checkbox checked={formData.abusoSexual.agravado}
              onChange={handleChange('abusoSexual.agravado')} />} label="Abuso sexual agravado" />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Kit aplicado</InputLabel>
              <Select value={formData.datosAbusoSexual.kit}
                onChange={e => setFormData(prev => ({ ...prev, datosAbusoSexual: { ...prev.datosAbusoSexual, kit: String(e.target.value) } }))}>
                <MenuItem value="">(sin seleccionar)</MenuItem>
                <MenuItem value="SI">SI</MenuItem>
                <MenuItem value="NO">NO</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Relación</InputLabel>
              <Select value={formData.datosAbusoSexual.relacion}
                onChange={e => setFormData(prev => ({ ...prev, datosAbusoSexual: { ...prev.datosAbusoSexual, relacion: String(e.target.value) } }))}>
                <MenuItem value="">(sin seleccionar)</MenuItem>
                <MenuItem value="Conocido">Conocido</MenuItem>
                <MenuItem value="Desconocido">Desconocido</MenuItem>
                <MenuItem value="Familiar">Familiar</MenuItem>
                <MenuItem value="Pareja">Pareja</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {formData.datosAbusoSexual.relacion === 'Otro' && (
            <Grid item xs={12}>
              <TextField fullWidth label="Relación (otro)"
                value={formData.datosAbusoSexual.relacionOtro}
                onChange={handleChange('datosAbusoSexual.relacionOtro')} />
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

     {/* 6. Víctima */}
<Typography variant="h6">6. Víctima</Typography>
<Grid container spacing={2}>
  <Grid item xs={12} md={4}>
    <TextField fullWidth label="DNI"
      value={formData.victima.dni}
      onChange={handleChange('victima.dni')}
    />
  </Grid>
  <Grid item xs={12} md={4}>
    <TextField fullWidth label="Nombre"
      value={formData.victima.nombre}
      onChange={handleChange('victima.nombre')}
    />
  </Grid>
  <Grid item xs={12} md={4}>
<TextField
  type="number"
  fullWidth
  label="Cantidad de víctimas"
  value={formData.victima.cantidadVictimas}             // ✅ BIEN
  onChange={handleChange('victima.cantidadVictimas')}
/>


  </Grid>
  <Grid item xs={12} md={4}>
   <TextField
  type="date"
  fullWidth
  label="Fecha Nac."
  InputLabelProps={{ shrink: true }}
  inputProps={{ max: maxBirthDateStr }}  // 👈 Fecha máxima = hoy - 1 año
  value={formData.victima.fechaNacimiento}
  onChange={handleChange('victima.fechaNacimiento')}
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
  value={formData.victima.direccion.departamento}
  onChange={(e) =>
    setFormData(prev => ({
      ...prev,
      victima: {
        ...prev.victima,
        direccion: {
          ...prev.victima.direccion,
          departamento: Number(e.target.value), // ✅ CORRECTO
          localidad: 0 // ✅ Opcional: resetea localidad
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
    <TextField fullWidth label="Nombre y Apellido"
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
    <TextField fullWidth label="Calle y Nro / Barrio"
      value={formData.personaEntrevistada.direccion.calleNro}
      onChange={handleChange('personaEntrevistada.direccion.calleNro')}
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
        <Typography variant="h6">7. Tipo de Intervención</Typography>
        <Grid container spacing={2}>
          {Object.entries(formData.tipoIntervencion).map(([key, value]) => (
            <Grid item xs={6} md={4} key={key}>
              <FormControlLabel
                control={<Checkbox checked={value} onChange={handleChange(`tipoIntervencion.${key}`)} />}
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* 8. Seguimiento */}
        <Typography variant="h6">8. Seguimiento</Typography>
        <RadioGroup row value={formData.seguimiento.realizado ? 'si' : 'no'}
          onChange={e => setFormData(prev => ({ ...prev, seguimiento: { ...prev.seguimiento, realizado: e.target.value === 'si' } }))}>
          <FormControlLabel value="si" control={<Radio />} label="Sí" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
        {formData.seguimiento.realizado && (
          <Grid container spacing={2}>
            {Object.entries(formData.seguimiento.tipo).map(([key, value]) => (
              <Grid item xs={6} md={3} key={key}>
                <FormControlLabel control={<Checkbox checked={value} onChange={handleChange(`seguimiento.tipo.${key}`)} />}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} />
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Detalle"
                value={formData.detalleSeguimiento} onChange={handleChange('detalleSeguimiento')} />
            </Grid>
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
  autoHideDuration={3000}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
    {snackbarMessage}
  </Alert>
</Snackbar>

    </Box>
  );
}
