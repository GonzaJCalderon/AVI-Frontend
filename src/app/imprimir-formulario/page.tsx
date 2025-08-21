'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Button
} from '@mui/material'

type Formulario = {
  id: string
  nombre: string
  apellido: string
  delito: string
  estado: string
  fecha: string
  numero: string
  departamento: string
}

export default function ImprimirFormularioPage() {
  const id = useSearchParams().get('id')
  const [formulario, setFormulario] = useState<Formulario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const obtenerDatos = async () => {
      try {
        const res = await fetch(`http://10.100.1.80/avd/api/ver_formulario.php?id=${id}`)
        if (!res.ok) throw new Error('Error de red')

        const data = await res.json()
        if (!data || !data.id) throw new Error('Datos inválidos')

        setFormulario(data)
      } catch (err) {
        console.warn('FALLBACK MOCK ACTIVADO')
        setFormulario({
          id: id || '0',
          nombre: 'Mock Nombre',
          apellido: 'Mock Apellido',
          numero: 'A12345',
          fecha: '2025-07-29',
          estado: 'Pendiente',
          delito: 'Robo',
          departamento: 'Capital'
        })
      } finally {
        setLoading(false)
      }
    }

    obtenerDatos()
  }, [id])

  const handlePrintPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.getElementById('pdf-content')
    if (!element) return

    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `formulario_${formulario?.id}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .save()
  }

  const handlePrintBrowser = () => {
    window.print()
  }

  return (
    <Box sx={{ p: 4, maxWidth: '800px', margin: '0 auto' }}>
      {loading ? (
        <CircularProgress />
      ) : formulario ? (
        <>
          <Box id="pdf-content" sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" fontWeight="bold">
                Formulario #{formulario.id}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Fecha: {formulario.fecha}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography><strong>Nombre:</strong> {formulario.nombre}</Typography>
            <Typography><strong>Apellido:</strong> {formulario.apellido}</Typography>
            <Typography><strong>Número de caso:</strong> {formulario.numero}</Typography>
            <Typography><strong>Delito:</strong> {formulario.delito}</Typography>
            <Typography><strong>Departamento:</strong> {formulario.departamento}</Typography>
            <Typography><strong>Estado:</strong> {formulario.estado}</Typography>
          </Box>

          <Box mt={4} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrintPDF}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              📄 Descargar como PDF
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={handlePrintBrowser}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              🖨️ Imprimir
            </Button>
          </Box>
        </>
      ) : (
        <Typography color="error">No se pudo cargar el formulario.</Typography>
      )}
    </Box>
  )
}
