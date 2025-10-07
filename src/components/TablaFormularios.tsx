'use client';
import { useRouter } from 'next/navigation'
import React from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Divider,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Formulario } from '@/types/formulario';

interface Props {
  formulariosPagina: Formulario[];
  formulariosFiltradosLength: number;
  seleccionados: string[];
  toggleSeleccionado: (id: string) => void;
  toggleTodos: () => void;
  handleOpenMenu: (e: React.MouseEvent<HTMLButtonElement>, id: string) => void;
  handleCloseMenu: () => void;
  handleAccion: (accion: string) => void;
  anchorEl: null | HTMLElement;
  pagina: number;
  setPagina: (page: number) => void;
  formatearFecha: (fecha: string) => string;
  selectedId: string | null;
  renderEstadoChip: (estado: string) => React.ReactNode;
}

export default function TablaFormularios({
  formulariosPagina,
  formulariosFiltradosLength,
  seleccionados,
  toggleSeleccionado,
  toggleTodos,
  handleOpenMenu,
  handleCloseMenu,
  handleAccion,
  anchorEl,
  pagina,
  setPagina,
  formatearFecha,
  selectedId,
  renderEstadoChip,
}: Props) {
  const formulariosPorPagina = 5;
  const router = useRouter();

  // ---- Normalización de estado y selección actual
  const norm = (s?: string) => (s || '').toLowerCase();
  const formularioSeleccionado = formulariosPagina.find(f => f.id.toString() === selectedId);

  const esEliminado = !!(formularioSeleccionado?.eliminado || norm(formularioSeleccionado?.estado) === 'eliminada');
  const esActivo    = norm(formularioSeleccionado?.estado) === 'activa';
  const esArchivado = norm(formularioSeleccionado?.estado) === 'archivada';

  // ✅ Helpers que leen directamente del tipo Formulario
  const obtenerDelitos = (formulario: Formulario): string => formulario.delito || '—';
  const obtenerDepartamento = (formulario: Formulario): string => formulario.departamento || '—';
  const obtenerVictima = (formulario: Formulario): string => formulario.victima || '—';
  const obtenerDNI = (formulario: Formulario): string => formulario.dni || '—';

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Formularios encontrados
        </Typography>
        <Button
          onClick={() => router.push('/listar-formularios')}
          variant="outlined"
          size="small"
          startIcon={<span>📋</span>}
        >
          Listar Todos
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    seleccionados.length > 0 &&
                    seleccionados.length < formulariosPagina.filter(f => !f.eliminado).length
                  }
                  checked={
                    formulariosPagina.filter(f => !f.eliminado).length > 0 &&
                    formulariosPagina.filter(f => !f.eliminado).every(f => seleccionados.includes(f.id.toString()))
                  }
                  onChange={toggleTodos}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Coordinador</TableCell>
              <TableCell>Operador</TableCell>
              <TableCell>Víctima(s)</TableCell>
              <TableCell>Número</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Delito</TableCell>
              <TableCell>Reseña Hechos</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formulariosPagina.map((f) => (
              <TableRow
                key={f.id}
                sx={{
                  opacity: f.eliminado ? 0.6 : 1,
                  backgroundColor: f.eliminado ? '#f5f5f5' : 'inherit'
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={seleccionados.includes(f.id.toString())}
                    onChange={() => toggleSeleccionado(f.id.toString())}
                    disabled={f.eliminado}
                  />
                </TableCell>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.coordinador}</TableCell>
                <TableCell>{f.operador}</TableCell>
                <TableCell>{obtenerVictima(f)}</TableCell>
                <TableCell>{f.numero_intervencion}</TableCell>
                <TableCell>{obtenerDNI(f)}</TableCell>
                <TableCell>{formatearFecha(f.fecha)}</TableCell>
                <TableCell>{renderEstadoChip(f.estado || 'sin estado')}</TableCell>
                <TableCell>{obtenerDelitos(f)}</TableCell>
                <TableCell>{(f as any).reseña_hecho || '—'}</TableCell>
                <TableCell>{obtenerDepartamento(f)}</TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={(e) => handleOpenMenu(e, f.id.toString())}
                    disabled={f.eliminado}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={Math.ceil(formulariosFiltradosLength / formulariosPorPagina)}
          page={pagina}
          onChange={(_, value) => setPagina(value)}
          color="primary"
        />
      </Box>

      {/* Menú contextual por fila */}
   <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
  {!esEliminado && (
    <MenuItem key="editar" onClick={() => handleAccion('editar')}>✏️ Editar</MenuItem>
  )}

  <MenuItem key="ver" onClick={() => handleAccion('ver')}>👁️ Ver</MenuItem>
  <MenuItem key="imprimir" onClick={() => handleAccion('imprimir')}>🖨️ Imprimir</MenuItem>
  <MenuItem key="descargar" onClick={() => handleAccion('descargar')}>⬇️ Descargar</MenuItem>

  <Divider />

  {!esEliminado && !esActivo && (
    <MenuItem key="activar" onClick={() => handleAccion('activar')}>✅ Activar</MenuItem>
  )}

  {!esEliminado && !esArchivado && (
    <MenuItem key="archivar" onClick={() => handleAccion('archivar')}>📁 Archivar</MenuItem>
  )}
</Menu>

    </Paper>
  );
}
