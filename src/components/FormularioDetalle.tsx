'use client'

import { TextField, Typography, Box } from '@mui/material'

type Props = {
  modo: 'ver' | 'editar' | 'imprimir'
  datos: {
    id: string
    nombre: string
    apellido: string
    delito: string
  }
  onChange?: (campo: string, valor: string) => void
}

export default function FormularioDetalle({ modo, datos, onChange }: Props) {
  const soloLectura = modo !== 'editar'

  const handleChange =
    (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange?.(campo, e.target.value)

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="subtitle1">ID: {datos.id}</Typography>

      <TextField
        label="Nombre"
        value={datos.nombre}
        InputProps={{ readOnly: soloLectura }}
        onChange={handleChange('nombre')}
      />

      <TextField
        label="Apellido"
        value={datos.apellido}
        InputProps={{ readOnly: soloLectura }}
        onChange={handleChange('apellido')}
      />

      <TextField
        label="Delito"
        value={datos.delito}
        InputProps={{ readOnly: soloLectura }}
        onChange={handleChange('delito')}
      />

      {modo === 'imprimir' && (
        <Typography variant="body2" mt={2}>
          Este formulario está listo para impresión.
        </Typography>
      )}
    </Box>
  )
}
