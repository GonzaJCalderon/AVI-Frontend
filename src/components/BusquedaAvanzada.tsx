'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Checkbox,
  Chip,
} from '@mui/material';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearAllIcon from '@mui/icons-material/ClearAll';

import { delitos, ESTADOS_UI } from '@/utils/constants';

interface Departamento {
  id: string;
  nombre: string;
}

interface Localidad {
  id: string;
  nombre: string;
  departamento_id: string;
}

interface Props {
  filtro: {
    coordinador: string;
    operador: string;
    victima: string;
    numero: string;
    dni: string;
    fechaDesde: string;
    fechaHasta: string;
    estado: string;
    delito: string[];
    departamento: string;
    localidad?: string;
  };
  handleFiltroInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFiltroSelect: (e: any) => void;
  handleExportarExcel: () => void;
  EstadoDot: ({ estado }: { estado: string }) => React.ReactElement;
  estadosParaFiltro?: string[];
  onReset: () => void;
}

export default function BusquedaAvanzada({
  filtro,
  handleFiltroInput,
  handleFiltroSelect,
  handleExportarExcel,
  EstadoDot,
  estadosParaFiltro = [...ESTADOS_UI],
  onReset,
}: Props) {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const depRes = await fetch('/departamentosMendoza.json');
        const locRes = await fetch('/localidadesMendoza.json');

        const depData = await depRes.json();
        const locData = await locRes.json();

        setDepartamentos(depData.departamentos);
        setLocalidades(locData.localidades);
      } catch (error) {
        console.error('Error cargando datos de departamentos o localidades', error);
      }
    };
    fetchData();
  }, []);

  const departamentoSeleccionado = departamentos.find(
    (dep) => dep.id === filtro.departamento
  );

  const localidadesFiltradas = departamentoSeleccionado
    ? localidades.filter((l) => l.departamento_id === departamentoSeleccionado.id)
    : [];

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 8);
    handleFiltroInput({
      ...e,
      target: {
        ...e.target,
        value: onlyNumbers,
      },
    });
  };

  return (
    <Paper id="busqueda-avanzada" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Búsqueda avanzada
      </Typography>

      <Grid container spacing={2}>
        {/* CAMPOS DE TEXTO COMUNES */}
        {[
          ['Coordinador', 'coordinador'],
          ['Operador', 'operador'],
          ['Víctima', 'victima'],
          ['Número', 'numero'],
        ].map(([label, name]) => (
          <Grid item xs={12} sm={6} md={4} key={name}>
            <TextField
              fullWidth
              label={label}
              name={name}
              value={filtro[name as keyof typeof filtro] as string}
              onChange={handleFiltroInput}
            />
          </Grid>
        ))}

        {/* CAMPO DNI NUMÉRICO */}
     <Grid item xs={12} sm={6} md={4}>
<TextField
  label="DNI"
  name="dni"
  value={filtro.dni}
  onChange={handleFiltroInput}
  onKeyPress={(e) => {
    // Prevenir entrada de caracteres que no sean números
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
      e.preventDefault();
    }
  }}
  placeholder="Solo números"
  inputProps={{
    maxLength: 8, // Opcional: limitar a 8 dígitos típicos del DNI argentino
    pattern: '[0-9]*', // Patrón HTML5 para solo números
    inputMode: 'numeric' // Mostrar teclado numérico en móviles
  }}
  size="small"
  sx={{ minWidth: 120 }}
/>
</Grid>


        {/* SELECT MULTIPLE DE DELITOS */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            select
            label="Delitos"
            name="delito"
            value={filtro.delito}
            onChange={handleFiltroSelect}
            InputLabelProps={{ shrink: true }}
            SelectProps={{
              multiple: true,
              displayEmpty: true,
              renderValue: (selected) => {
                const values = selected as string[];
                if (!values.length) return 'Todos';
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {values.map((v) => (
                      <Chip key={v} label={v} />
                    ))}
                  </Box>
                );
              },
            }}
          >
            {delitos.map((delito) => (
              <MenuItem key={delito} value={delito}>
                <Checkbox checked={filtro.delito.includes(delito)} />
                {delito}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* SELECT DEPARTAMENTO */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="departamento-label">Departamento</InputLabel>
            <Select
              labelId="departamento-label"
              name="departamento"
              value={filtro.departamento}
              onChange={handleFiltroSelect}
            >
              <MenuItem value="">Todos</MenuItem>
              {departamentos.map((dep) => (
                <MenuItem key={dep.id} value={dep.id.toString()}>
                  {dep.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* SELECT ESTADO */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            select
            label="Estado"
            name="estado"
            value={filtro.estado}
            onChange={handleFiltroSelect}
            InputLabelProps={{ shrink: true }}
            SelectProps={{
              renderValue: (selected) => {
                if (selected === 'Todos' || selected === '') return 'Todos';
                return (
                  <Box display="flex" alignItems="center" gap={1}>
                    <EstadoDot estado={selected as string} />
                    {selected as string}
                  </Box>
                );
              },
            }}
          >
            <MenuItem value="Todos">Todos</MenuItem>
            {estadosParaFiltro.map((estado) => (
              <MenuItem key={estado} value={estado}>
                <Box display="flex" alignItems="center" gap={1}>
                  <EstadoDot estado={estado} />
                  {estado}
                </Box>
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* FECHAS */}
        <Grid item xs={12} sm={12} md={4}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              type="date"
              label="Desde"
              name="fechaDesde"
              value={filtro.fechaDesde}
              onChange={handleFiltroInput}
              InputLabelProps={{ shrink: true, sx: { fontSize: '0.8rem' } }}
            />
            <TextField
              fullWidth
              type="date"
              label="Hasta"
              name="fechaHasta"
              value={filtro.fechaHasta}
              onChange={handleFiltroInput}
              InputLabelProps={{ shrink: true, sx: { fontSize: '0.8rem' } }}
            />
          </Box>
        </Grid>

        {/* BOTONES */}
        <Grid item xs={12} sm={12} md={4}>
          <Box display="flex" gap={1} width="100%">
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportarExcel}
            >
              Exportar Excel
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<ClearAllIcon />}
              onClick={onReset}
            >
              Limpiar
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
