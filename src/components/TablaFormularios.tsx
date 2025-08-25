'use client';

import {
  Box,
  Checkbox,
  Chip,
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

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Formularios encontrados
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    seleccionados.length > 0 && seleccionados.length < formulariosPagina.length
                  }
                  checked={
                    formulariosPagina.length > 0 &&
                    seleccionados.length === formulariosPagina.length
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
              <TableRow key={f.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={seleccionados.includes(f.id)}
                    onChange={() => toggleSeleccionado(f.id)}
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
                  <IconButton onClick={(e) => handleOpenMenu(e, f.id)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(formulariosFiltradosLength / formulariosPorPagina)}
          page={pagina}
          onChange={(_, value) => setPagina(value)}
          color="primary"
        />
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => handleAccion('ver')}>Ver</MenuItem>
        <MenuItem onClick={() => handleAccion('editar')}>Editar</MenuItem>
        <MenuItem onClick={() => handleAccion('imprimir')}>Imprimir</MenuItem>
        <MenuItem onClick={() => handleAccion('estado')}>Cambiar estado</MenuItem>
        <MenuItem onClick={() => handleAccion('listar')}>Listar Todos</MenuItem>
      </Menu>
    </Paper>
  );
}
