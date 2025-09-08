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
  onReset: () => void; // 👈 nuevo
}

export default function BusquedaAvanzada({
  filtro,
  handleFiltroInput,
  handleFiltroSelect,
  handleExportarExcel,
  EstadoDot,
  estadosParaFiltro = [...ESTADOS_UI],
  onReset, // 👈 nuevo
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

  return (
    <Paper id="busqueda-avanzada" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Búsqueda avanzada
      </Typography>

      <Grid container spacing={2}>
        {/* CAMPOS DE TEXTO */}
        {[
          ['Coordinador', 'coordinador'],
          ['Operador', 'operador'],
          ['Víctima', 'victima'],
          ['Número', 'numero'],
          ['DNI', 'dni'],
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

        {/* SELECT MULTIPLE DE DELITOS */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="delito-label">Delitos</InputLabel>
            <Select
              labelId="delito-label"
              name="delito"
              multiple
              value={filtro.delito}
              onChange={handleFiltroSelect}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {delitos.map((delito) => (
                <MenuItem key={delito} value={delito}>
                  <Checkbox checked={filtro.delito.includes(delito)} />
                  {delito}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

        {/* SELECT LOCALIDAD (si lo querés visible, descomenta)
        {filtro.departamento && (
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="localidad-label">Localidad</InputLabel>
              <Select
                labelId="localidad-label"
                name="localidad"
                value={filtro.localidad || ''}
                onChange={handleFiltroSelect}
              >
                <MenuItem value="">Todas</MenuItem>
                {localidadesFiltradas.map((loc) => (
                  <MenuItem key={loc.id} value={loc.nombre}>
                    {loc.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )} */}

        {/* SELECT ESTADO */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select
              labelId="estado-label"
              name="estado"
              value={filtro.estado}
              onChange={handleFiltroSelect}
              renderValue={(selected) => {
                if (selected === 'Todos' || selected === '') return 'Todos';
                return (
                  <Box display="flex" alignItems="center" gap={1}>
                    <EstadoDot estado={selected} />
                    {selected}
                  </Box>
                );
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
            </Select>
          </FormControl>
        </Grid>

        {/* FECHAS */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="date"
            label="Fecha desde"
            name="fechaDesde"
            value={filtro.fechaDesde}
            onChange={handleFiltroInput}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            type="date"
            label="Fecha hasta"
            name="fechaHasta"
            value={filtro.fechaHasta}
            onChange={handleFiltroInput}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* BOTONES: Exportar / Limpiar */}
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
