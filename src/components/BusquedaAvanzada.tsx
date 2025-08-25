'use client';

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
} from '@mui/material';

import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { departments, delitos, estados } from '@/utils/constants';

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
    delito: string;
    departamento: string;
  };
  handleFiltroInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFiltroSelect: (e: any) => void;
  handleExportarExcel: () => void;
  EstadoDot: ({ estado }: { estado: string }) => JSX.Element;
}

export default function BusquedaAvanzada({
  filtro,
  handleFiltroInput,
  handleFiltroSelect,
  handleExportarExcel,
  EstadoDot,
}: Props) {
  return (
    <Paper id="busqueda-avanzada" sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Búsqueda avanzada
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Coordinador" name="coordinador" value={filtro.coordinador} onChange={handleFiltroInput} />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Operador" name="operador" value={filtro.operador} onChange={handleFiltroInput} />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Víctima" name="victima" value={filtro.victima} onChange={handleFiltroInput} />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Número" name="numero" value={filtro.numero} onChange={handleFiltroInput} />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="DNI" name="dni" value={filtro.dni} onChange={handleFiltroInput} />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="delito-label">Delito</InputLabel>
            <Select
              labelId="delito-label"
              label="Delito"
              name="delito"
              value={filtro.delito}
              onChange={handleFiltroSelect}
            >
              <MenuItem value="">Todos</MenuItem>
              {delitos.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="departamento-label">Departamento</InputLabel>
            <Select
              labelId="departamento-label"
              label="Departamento"
              name="departamento"
              value={filtro.departamento}
              onChange={handleFiltroSelect}
            >
              <MenuItem value="">Todos</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select
              labelId="estado-label"
              label="Estado"
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
              {estados.map((estado) => (
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

        <Grid item xs={12} sm={6} md={4}>
          <Button fullWidth variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportarExcel}>
            Exportar Excel
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
