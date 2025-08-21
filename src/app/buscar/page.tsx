'use client'

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress
} from '@mui/material'
import { useState } from 'react'
import { estados, departments, delitos } from '@/utils/constants'
import * as XLSX from 'xlsx'

type ResultadoFormulario = {
  id: string
  nombre: string
  apellido: string
  dni: string
  numero: string
  fecha: string
  estado: string
  delito: string
  departamento: string
}

export default function BuscarFormularioPage() {
  const [filtros, setFiltros] = useState({
    nombre: '',
    apellido: '',
    numero: '',
    dni: '',
    delito: '',
    estado: '',
    departamento: '',
    fechaDesde: '',
    fechaHasta: ''
  })

  const [resultados, setResultados] = useState<ResultadoFormulario[]>([])
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }

  const handleBuscar = async () => {
    setLoading(true)
    setResultados([])

    try {
      const params = new URLSearchParams()

      for (const key in filtros) {
        const valor = filtros[key as keyof typeof filtros]
        if (valor.trim()) {
          params.append(key, valor)
        }
      }

      const res = await fetch(
        `http://localhost:8000/api/buscar_formularios.php?${params.toString()}`
      )
      const data = await res.json()

      if (Array.isArray(data)) {
        setResultados(data)
      }
    } catch (err) {
      alert('Error al buscar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleExportar = () => {
    const ws = XLSX.utils.json_to_sheet(resultados)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados')
    XLSX.writeFile(wb, 'auditoria_formularios.xlsx')
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Auditoría de Formularios
        </Typography>

        <Grid container spacing={2}>
          {['nombre', 'apellido', 'dni', 'numero'].map((name) => (
            <Grid item xs={12} sm={6} md={3} key={name}>
              <TextField
                fullWidth
                label={name.toUpperCase()}
                name={name}
                value={(filtros as any)[name]}
                onChange={handleChange}
              />
            </Grid>
          ))}

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Delito"
              name="delito"
              select
              fullWidth
              value={filtros.delito}
              onChange={handleChange}
            >
              <MenuItem value="">Todos</MenuItem>
              {delitos.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Departamento"
              name="departamento"
              select
              fullWidth
              value={filtros.departamento}
              onChange={handleChange}
            >
              <MenuItem value="">Todos</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Estado"
              name="estado"
              select
              fullWidth
              value={filtros.estado}
              onChange={handleChange}
            >
              <MenuItem value="">Todos</MenuItem>
              {estados.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              name="fechaDesde"
              label="Desde"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filtros.fechaDesde}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              type="date"
              name="fechaHasta"
              label="Hasta"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filtros.fechaHasta}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button variant="contained" fullWidth onClick={handleBuscar}>
              Buscar
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              disabled={resultados.length === 0}
              onClick={handleExportar}
            >
              Exportar Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>DNI</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Delito</TableCell>
                  <TableCell>Departamento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.nombre}</TableCell>
                    <TableCell>{r.apellido}</TableCell>
                    <TableCell>{r.dni}</TableCell>
                    <TableCell>{r.numero}</TableCell>
                    <TableCell>{r.fecha}</TableCell>
                    <TableCell>{r.estado}</TableCell>
                    <TableCell>{r.delito}</TableCell>
                    <TableCell>{r.departamento}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  )
}
