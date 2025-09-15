import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Typography,
  Grid,
  Box,
  Divider,
  FormControl,
  FormLabel,
  FormGroup
} from '@mui/material';

interface FormData {
  // Datos de la Intervención
  fecha: string;
  coordinador: string;
  nroFicha: string;
  operador: string;
  breveResena: string;
  
  // Derivación
  nombreDerivador: string;
  hora: string;
  derivacionTipo: string[];
  municipio: string;
  otro: string;
  
  // Datos del Hecho Delictivo
  numeroExpediente: string;
  nrosAgresores: string;
  tipoDelito: string[];
  otrosDelitos: string;
  ubicacionGeografica: string;
  departamento: string;
  fechaHecho: string;
  horaHecho: string;
  
  // Acciones Primera Línea
  accionesPrimeraLinea: string;
  
  // Abuso Sexual
  aplicacionKit: string;
  relacionVictimaAgresor: string;
  tipoLugarHecho: string;
  
  // Víctima
  cantidadVictimas: string;
  dni: string;
  apellido: string;
  nombres: string;
  genero: string;
  fechaNacimiento: string;
  telefono: string;
  direccionVictima: string;
  departamentoVictima: string;
  ocupacion: string;
  
  // Persona Entrevistada
  nombreEntrevistado: string;
  direccionEntrevistado: string;
  departamentoEntrevistado: string;
  relacionConVictima: string;
  
  // Tipo de Intervención
  tipoIntervencion: string[];
  detalleIntervencion: string;
  realizoSeguimiento: string;
  tipoSeguimiento: string[];
}

interface FormularioModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export default function FormularioModal({ open, onClose, onSubmit }: FormularioModalProps) {
  const [formData, setFormData] = useState<FormData>({
    fecha: '',
    coordinador: '',
    nroFicha: '',
    operador: '',
    breveResena: '',
    nombreDerivador: '',
    hora: '',
    derivacionTipo: [],
    municipio: '',
    otro: '',
    numeroExpediente: '',
    nrosAgresores: '',
    tipoDelito: [],
    otrosDelitos: '',
    ubicacionGeografica: '',
    departamento: '',
    fechaHecho: '',
    horaHecho: '',
    accionesPrimeraLinea: '',
    aplicacionKit: '',
    relacionVictimaAgresor: '',
    tipoLugarHecho: '',
    cantidadVictimas: '',
    dni: '',
    apellido: '',
    nombres: '',
    genero: '',
    fechaNacimiento: '',
    telefono: '',
    direccionVictima: '',
    departamentoVictima: '',
    ocupacion: '',
    nombreEntrevistado: '',
    direccionEntrevistado: '',
    departamentoEntrevistado: '',
    relacionConVictima: '',
    tipoIntervencion: [],
    detalleIntervencion: '',
    realizoSeguimiento: '',
    tipoSeguimiento: []
  });

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCheckboxChange = (field: keyof FormData, value: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (event.target.checked) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      }
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        Formulario de Asistencia a Víctimas
        <Typography variant="body2" color="text.secondary">
          Complete los datos para generar el PDF
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          
          {/* 1. DATOS DE LA INTERVENCIÓN */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>1. Datos de la Intervención</Typography>
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              value={formData.fecha}
              onChange={handleInputChange('fecha')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Coordinador"
              value={formData.coordinador}
              onChange={handleInputChange('coordinador')}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Nro de Ficha"
              value={formData.nroFicha}
              onChange={handleInputChange('nroFicha')}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Operador"
              value={formData.operador}
              onChange={handleInputChange('operador')}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Breve reseña del hecho"
              multiline
              rows={3}
              value={formData.breveResena}
              onChange={handleInputChange('breveResena')}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 2. DERIVACIÓN */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>2. Derivación</Typography>
          </Grid>
          
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Nombre y Apellido del Derivador"
              value={formData.nombreDerivador}
              onChange={handleInputChange('nombreDerivador')}
            />
          </Grid>
          
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Hora"
              type="time"
              value={formData.hora}
              onChange={handleInputChange('hora')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Derivación desde:</FormLabel>
              <FormGroup row>
                {['CEO 911', 'Min. Seguridad', 'Min. Público', 'Fiscal', 'Hospital', 'Centro de Salud', 'Demanda espontánea'].map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={formData.derivacionTipo.includes(option)}
                        onChange={handleCheckboxChange('derivacionTipo', option)}
                      />
                    }
                    label={option}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Municipio"
              value={formData.municipio}
              onChange={handleInputChange('municipio')}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Otro"
              value={formData.otro}
              onChange={handleInputChange('otro')}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 3. DATOS DEL HECHO DELICTIVO */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>3. Datos del Hecho Delictivo</Typography>
          </Grid>

          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Número de Expediente"
              value={formData.numeroExpediente}
              onChange={handleInputChange('numeroExpediente')}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Nros de Agresores"
              value={formData.nrosAgresores}
              onChange={handleInputChange('nrosAgresores')}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Tipo de Delito:</FormLabel>
              <FormGroup>
                <Grid container>
                  {[
                    'Robo', 'Homicidio', 'Violencia de género',
                    'Robo con arma de fuego', 'Homicidio por accidente vial', 'Abuso sexual simple',
                    'Robo con arma blanca', 'Homicidio/ Av. Hecho', 'Abuso sexual agravado',
                    'Lesiones', 'Homicidio por delito', 'Travestisidio/ transfemicidio',
                    'Lesiones con arma de fuego', 'Amenazas', 'Femicidio',
                    'Lesiones con arma blanca'
                  ].map((delito) => (
                    <Grid item xs={6} md={4} key={delito}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.tipoDelito.includes(delito)}
                            onChange={handleCheckboxChange('tipoDelito', delito)}
                          />
                        }
                        label={delito}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ubicación geográfica del hecho (Calle y nro / Barrio/ Lugar)"
              value={formData.ubicacionGeografica}
              onChange={handleInputChange('ubicacionGeografica')}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Departamento"
              value={formData.departamento}
              onChange={handleInputChange('departamento')}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Fecha del hecho"
              type="date"
              value={formData.fechaHecho}
              onChange={handleInputChange('fechaHecho')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Hora del hecho"
              type="time"
              value={formData.horaHecho}
              onChange={handleInputChange('horaHecho')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* 6. VÍCTIMA */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>6. Víctima</Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Cantidad de víctimas"
              value={formData.cantidadVictimas}
              onChange={handleInputChange('cantidadVictimas')}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="DNI"
              value={formData.dni}
              onChange={handleInputChange('dni')}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Apellido"
              value={formData.apellido}
              onChange={handleInputChange('apellido')}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Nombres"
              value={formData.nombres}
              onChange={handleInputChange('nombres')}
            />
          </Grid>

          <Grid item xs={4}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Género:</FormLabel>
              <RadioGroup
                row
                value={formData.genero}
                onChange={handleInputChange('genero')}
              >
                <FormControlLabel value="M" control={<Radio />} label="M" />
                <FormControlLabel value="F" control={<Radio />} label="F" />
                <FormControlLabel value="X" control={<Radio />} label="X" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Fecha de nacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={handleInputChange('fechaNacimiento')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.telefono}
              onChange={handleInputChange('telefono')}
            />
          </Grid>

          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Dirección (Calle y nro / Barrio/ Lugar)"
              value={formData.direccionVictima}
              onChange={handleInputChange('direccionVictima')}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Departamento"
              value={formData.departamentoVictima}
              onChange={handleInputChange('departamentoVictima')}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Ocupación"
              value={formData.ocupacion}
              onChange={handleInputChange('ocupacion')}
            />
          </Grid>

          {/* 7. TIPO DE INTERVENCIÓN */}
          <Grid item xs={12}>
            <Divider />
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>7. Tipo de Intervención</Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Tipo de Intervención:</FormLabel>
              <FormGroup>
                <Grid container>
                  {[
                    'Intervención en crisis', 'Intervención social', 'Intervención legal',
                    'Intervención telefónica', 'Intervención Psicológica', 'Intervención médica',
                    'Intervención domiciliaria', 'Sin intervención', 'Archivo'
                  ].map((intervencion) => (
                    <Grid item xs={6} md={4} key={intervencion}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.tipoIntervencion.includes(intervencion)}
                            onChange={handleCheckboxChange('tipoIntervencion', intervencion)}
                          />
                        }
                        label={intervencion}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Detalle de la intervención"
              multiline
              rows={4}
              value={formData.detalleIntervencion}
              onChange={handleInputChange('detalleIntervencion')}
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Se realizó seguimiento:</FormLabel>
              <RadioGroup
                row
                value={formData.realizoSeguimiento}
                onChange={handleInputChange('realizoSeguimiento')}
              >
                <FormControlLabel value="SI" control={<Radio />} label="SI" />
                <FormControlLabel value="NO" control={<Radio />} label="NO" />
              </RadioGroup>
            </FormControl>
          </Grid>

        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Generar PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}