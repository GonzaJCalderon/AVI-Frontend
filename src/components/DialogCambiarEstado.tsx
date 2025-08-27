import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  DialogContentText,
} from '@mui/material';
import { EstadoUI } from '@/utils/constants';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirmar: () => void;
  nuevoEstado: EstadoUI | '';
  setNuevoEstado: (estado: EstadoUI | '') => void;
  EstadoDot: ({ estado }: { estado: string }) => React.ReactElement;
  estadosDisponibles?: EstadoUI[]; // ✅ Nueva prop opcional
}

export default function DialogCambiarEstado({
  open,
  onClose,
  onConfirmar,
  nuevoEstado,
  setNuevoEstado,
  EstadoDot,
  estadosDisponibles = ['Activo', 'Archivado'], // ✅ Por defecto excluye "Eliminado"
}: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cambiar estado</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <DialogContentText sx={{ mb: 2 }}>
          Seleccioná el nuevo estado para los formularios seleccionados:
        </DialogContentText>
        
        <FormControl fullWidth>
          <InputLabel id="nuevo-estado-label">Estado</InputLabel>
          <Select
            labelId="nuevo-estado-label"
            label="Estado"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value as EstadoUI | '')}
            renderValue={(selected) =>
              selected ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <EstadoDot estado={selected} />
                  {selected}
                </Box>
              ) : (
                'Seleccionar'
              )
            }
          >
            {/* ✅ Usar estadosDisponibles en lugar de ESTADOS_UI completo */}
            {estadosDisponibles.map((estado: EstadoUI) => (
              <MenuItem key={estado} value={estado}>
                <Box display="flex" alignItems="center" gap={1}>
                  <EstadoDot estado={estado} />
                  {estado}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={onConfirmar}
          variant="contained"
          disabled={!nuevoEstado}
        >
          Confirmar
        </Button>
      </DialogActions>
      </Dialog>
);
}