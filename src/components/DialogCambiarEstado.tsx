'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

import { estados } from '@/utils/constants';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirmar: (estado: string) => void;
  nuevoEstado: string;
  setNuevoEstado: (estado: string) => void;
  EstadoDot: ({ estado }: { estado: string }) => JSX.Element;
}

export default function DialogCambiarEstado({
  open,
  onClose,
  onConfirmar,
  nuevoEstado,
  setNuevoEstado,
  EstadoDot,
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
            onChange={(e) => setNuevoEstado(e.target.value)}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onConfirmar(nuevoEstado)} variant="contained" disabled={!nuevoEstado}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
