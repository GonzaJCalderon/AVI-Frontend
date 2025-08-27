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
  const formularioSeleccionado = formulariosPagina.find(f => f.id === selectedId);
  const esEliminado = formularioSeleccionado?.estado === 'Eliminado';
  const esActivo = formularioSeleccionado?.estado === 'Activo';
  const esArchivado = formularioSeleccionado?.estado === 'Archivado';

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Formularios encontrados
        </Typography>
       <Button
  onClick={() =>router.push('/listar-formularios')
}
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
                    seleccionados.length < formulariosPagina.filter(f => f.estado !== 'Eliminado').length
                  }
                  checked={
                    formulariosPagina.filter(f => f.estado !== 'Eliminado').length > 0 &&
                    formulariosPagina.filter(f => f.estado !== 'Eliminado').every(f => seleccionados.includes(f.id))
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
              <TableCell>Departamento</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formulariosPagina.map((f) => (
              <TableRow
                key={f.id}
                sx={{
                  opacity: f.estado === 'Eliminado' ? 0.6 : 1,
                  backgroundColor: f.estado === 'Eliminado' ? '#f5f5f5' : 'inherit'
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={seleccionados.includes(f.id)}
                    onChange={() => toggleSeleccionado(f.id)}
                    disabled={f.estado === 'Eliminado'}
                  />
                </TableCell>
                <TableCell>{f.id}</TableCell>
                <TableCell>{f.coordinador}</TableCell>
                <TableCell>{f.operador}</TableCell>
                <TableCell>{f.victima}</TableCell>
                <TableCell>{f.numero}</TableCell>
                <TableCell>{f.dni}</TableCell>
                <TableCell>{formatearFecha(f.fecha)}</TableCell>
                <TableCell>{renderEstadoChip(f.estado)}</TableCell>
                <TableCell>{f.delito}</TableCell>
                <TableCell>{f.departamento}</TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={(e) => handleOpenMenu(e, f.id)}
                    disabled={f.estado === 'Eliminado'}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(formulariosFiltradosLength / formulariosPorPagina)}
          page={pagina}
          onChange={(_, value) => setPagina(value)}
          color="primary"
        />
      </Box>

      {/* Menú contextual por fila */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {[
          <MenuItem key="ver" onClick={() => handleAccion('ver')}>👁️ Ver</MenuItem>,
          !esEliminado && (
            <MenuItem key="editar" onClick={() => handleAccion('editar')}>✏️ Editar</MenuItem>
          ),
          <MenuItem key="imprimir" onClick={() => handleAccion('imprimir')}>🖨️ Imprimir</MenuItem>,

          <Divider key="divider-1" />,

          !esEliminado && (
            <MenuItem key="estado" onClick={() => handleAccion('estado')}>🔄 Cambiar estado</MenuItem>
          ),
          
          !esEliminado && !esArchivado && (
            <MenuItem key="archivar" onClick={() => handleAccion('archivar')}>📁 Archivar</MenuItem>
          ),

          !esEliminado && <Divider key="divider-2" />,

          !esEliminado && (
            <MenuItem
              key="eliminar"
              onClick={() => handleAccion('eliminar')}
              sx={{ color: 'error.main' }}
            >
              🗑️ Eliminar
            </MenuItem>
          )
        ].filter(Boolean)}
      </Menu>
    </Paper>
  );
}
