'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { obtenerIntervencionPorId } from '@/services/intervenciones'
import { CircularProgress, Alert, Button, Stack } from '@mui/material'

export default function VerFormularioPage() {
  const sp = useSearchParams()
  const id = sp.get('id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tpl, setTpl] = useState<string | null>(null)
  const [data, setData] = useState<any>(null) // <-- luego tipar bien

  useEffect(() => {
    if (!id) {
      setError('ID no provisto')
      setLoading(false)
      return
    }

    (async () => {
      try {
        setLoading(true)

        // cargar plantilla exacta
        const tplResp = await fetch('/formulario.html')
        const tplText = await tplResp.text()
        setTpl(tplText)

        // cargar datos
        const resp = await obtenerIntervencionPorId(Number(id))
        setData(resp)
      } catch (e: any) {
        setError(e.message || 'Error al cargar')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const replacements = useMemo(() => {
    if (!data) return {}
    return {
      '{{FECHA}}': data.fecha || '',
      '{{COORDINADOR}}': data.coordinador || '',
      '{{NRO_FICHA}}': data.numero_intervencion || id || '',
      // ... (todos los placeholders que ya definiste antes)
    }
  }, [data, id])

  const finalHtml = useMemo(() => {
    if (!tpl || !data) return null
    let html = tpl
    for (const [ph, value] of Object.entries(replacements)) {
      html = html.split(ph).join(value || '')
    }
    return html
  }, [tpl, data, replacements])

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!finalHtml) return <Alert severity="warning">Sin datos</Alert>

  return (
    <div style={{ padding: 16, background: '#f5f5f5', minHeight: '100vh' }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => window.print()}>
          🖨️ Imprimir
        </Button>
      </Stack>
      {/* Render exacto del formulario */}
      <div
        className="sheet"
        dangerouslySetInnerHTML={{ __html: finalHtml }}
      />
    </div>
  )
}
