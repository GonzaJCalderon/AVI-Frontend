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
  const [data, setData] = useState<any>(null)
  const [departamentos, setDepartamentos] = useState<{ id: string; nombre: string }[]>([])

  useEffect(() => {
    if (!id) {
      setError('ID no provisto')
      setLoading(false)
      return
    }

    (async () => {
      try {
        setLoading(true)

        const tplResp = await fetch('/formulario.html')
        const tplText = await tplResp.text()
        setTpl(tplText)

        const resp = await obtenerIntervencionPorId(Number(id))
        setData(resp)

        const deptoRes = await fetch('/departamentosMendoza.json')
        const deptoData = await deptoRes.json()
        setDepartamentos(deptoData.departamentos || [])
      } catch (e: any) {
        setError(e.message || 'Error al cargar')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const getDepartamentoNombre = (id?: string | number) => {
    if (!id) return ''
    const depto = departamentos.find(d => d.id === String(id))
    return depto?.nombre || ''
  }

  const replacements = useMemo(() => {
    if (!data) return {}

    const victima = data.victimas?.[0]
    const entrevistada = victima?.personas_entrevistadas?.[0]

    const mismaPersona =
      entrevistada &&
      victima &&
      entrevistada.nombre?.toLowerCase().trim() === victima.nombre?.toLowerCase().trim() &&
      entrevistada.direccion_id === victima.direccion_id

 return {
  '{{FECHA}}': data.fecha || '',
  '{{COORDINADOR}}': data.coordinador || '',
  '{{NRO_FICHA}}': data.numero_intervencion || id || '',
  '{{OPERADOR}}': data.operador || '',
  '{{RESENA}}': data.resena_hecho || '',

  // Dirección víctima
  '{{DIR_VICTIMA}}': victima?.direccion
    ? [
        victima.direccion?.calle_nro,
        victima.direccion?.barrio,
        getDepartamentoNombre(victima.direccion?.departamento),
        victima.direccion?.localidad,
      ]
        .filter(Boolean)
        .join(', ')
    : '',

  // Datos víctima
  '{{DNI}}': victima?.dni || '',
  '{{NOMBRES}}': victima?.nombre?.split(' ')[0] || '',
  '{{APELLIDO}}': victima?.nombre?.split(' ').slice(1).join(' ') || '',
  '{{GEN_MASCULINO}}': victima?.genero_id === 1 ? 'X' : '',
  '{{GEN_FEMENINO}}': victima?.genero_id === 2 ? 'X' : '',
  '{{GEN_OTRO}}': victima?.genero_id > 2 ? 'X' : '',
  '{{NACIMIENTO}}': victima?.fecha_nacimiento?.split('T')[0] || '',
  '{{TELEFONO}}': victima?.telefono || '',
  '{{OCUPACION}}': victima?.ocupacion || '',
  '{{CANT_VICTIMAS}}': String(victima?.cantidad_victima_por_hecho ?? ''),

  // Persona entrevistada
  '{{ENTREV_NOMBRE}}': entrevistada?.nombre || '',
  '{{ENTREV_RELACION}}': entrevistada?.relacion_victima || '',
  '{{ENTREV_DIRECCION}}': mismaPersona
    ? victima?.direccion?.calle_nro || ''
    : entrevistada?.direccion?.calle_nro || '',
  '{{ENTREV_DEPARTAMENTO}}': mismaPersona
    ? getDepartamentoNombre(victima?.direccion?.departamento)
    : getDepartamentoNombre(entrevistada?.direccion?.departamento),
  '{{ENTREV_LOCALIDAD}}': mismaPersona
    ? victima?.direccion?.localidad || ''
    : entrevistada?.direccion?.localidad || '',

// === DERIVACIÓN ===
  '{{DERIVADOR}}': data?.derivaciones?.[0]?.derivador || '',
  '{{FECHA_DERIV}}':
    data?.derivaciones?.[0]?.fecha_derivacion?.split('T')?.[0] ||
    data?.derivaciones?.[0]?.fecha_derivacion?.split(' ')?.[0] ||
    '',
  '{{HORA_DERIV}}':
    data?.derivaciones?.[0]?.fecha_derivacion?.split('T')?.[1]?.slice(0, 5) ||
    data?.derivaciones?.[0]?.fecha_derivacion?.split(' ')?.[1]?.slice(0, 5) ||
    '',

  // Checkboxes de organismos derivadores (usando motivos como ID)
  '{{CEO_911}}': data?.derivaciones?.[0]?.motivos === 1 ? 'X' : '',
  '{{MIN_SEGURIDAD}}': data?.derivaciones?.[0]?.motivos === 2 ? 'X' : '',
  '{{MIN_PUBLICO_FISCAL}}': data?.derivaciones?.[0]?.motivos === 3 ? 'X' : '',
  '{{HOSPITAL}}': data?.derivaciones?.[0]?.motivos === 4 ? 'X' : '',
  '{{CENTRO_SALUD}}': data?.derivaciones?.[0]?.motivos === 5 ? 'X' : '',
  '{{DEMANDA_ESPONTANEA}}': data?.derivaciones?.[0]?.motivos === 6 ? 'X' : '',
  '{{MUNICIPIO}}': data?.derivaciones?.[0]?.motivos === 7 ? 'X' : '',
  '{{MUNICIPIO_NOMBRE}}': data?.derivaciones?.[0]?.motivos === 7 
    ? data?.derivaciones?.[0]?.derivador || ''
    : '',
  '{{OTRO_DERIVACION}}': data?.derivaciones?.[0]?.motivos === 8 ? 'X' : '',
  '{{OTRO_DERIVACION_TEXTO}}': data?.derivaciones?.[0]?.motivos === 8
    ? data?.derivaciones?.[0]?.derivador || ''
    : '',

  // === HECHO DELICTIVO ===
  '{{DEPTO_HECHO}}': getDepartamentoNombre(
    data?.hechos_delictivos?.[0]?.geo?.[0]?.departamentos?.dep_id
  ),
  '{{UBICACION}}': data?.hechos_delictivos?.[0]?.geo?.[0]?.domicilio || '',
  '{{FECHA_HECHO}}':
    data?.hechos_delictivos?.[0]?.geo?.[0]?.fecha?.split('T')[0] || '',
  '{{HORA_HECHO}}':
    data?.hechos_delictivos?.[0]?.geo?.[0]?.fecha?.split('T')[1]?.slice(0, 5) ||
    '',

  '{{EXPEDIENTE}}': data?.hechos_delictivos?.[0]?.expediente || '',
  '{{NRO_AGRESORES}}': String(data?.hechos_delictivos?.[0]?.num_agresores ?? ''),

  '{{ACCIONES_1L}}': data?.acciones_primera_linea?.[0]?.acciones || '',
  '{{DETALLE_INTERV}}': data?.seguimientos?.[0]?.detalles?.[0]?.detalle || '',

  '{{SEGUIM_SI}}': data?.seguimientos?.[0]?.hubo === true ? 'X' : '',
  '{{SEGUIM_NO}}': data?.seguimientos?.[0]?.hubo === false ? 'X' : '',

  '{{TIPO_CRISIS}}': data?.intervenciones_tipo?.[0]?.crisis ? 'X' : '',
  '{{TIPO_SOCIAL}}': data?.intervenciones_tipo?.[0]?.social ? 'X' : '',
  '{{TIPO_LEGAL}}': data?.intervenciones_tipo?.[0]?.legal ? 'X' : '',
  '{{TIPO_TELEFONICA}}':
    data?.intervenciones_tipo?.[0]?.telefonica ? 'X' : '',
  '{{TIPO_PSICOLOGICA}}':
    data?.intervenciones_tipo?.[0]?.psicologica ? 'X' : '',
  '{{TIPO_MEDICA}}': data?.intervenciones_tipo?.[0]?.medica ? 'X' : '',
}

  }, [data, id, departamentos])

  const finalHtml = useMemo(() => {
    if (!tpl || !data) return null
    let html = tpl
    for (const [ph, value] of Object.entries(replacements)) {
      html = html.split(ph).join(value || '')
    }
    return html
  }, [tpl, data, replacements])

const handlePrint = async () => {
  try {
    const tplResp = await fetch('/formulario.html')
    const tplHtml = await tplResp.text()

    if (!tplHtml || !data) return

    // Aplicar reemplazos
    let html = tplHtml
    for (const [ph, value] of Object.entries(replacements)) {
      html = html.split(ph).join(value || '')
    }

// Obtener el contenido del CSS manualmente (como string)
const cssResp = await fetch('/formulario-imprimir.css')
const cssText = await cssResp.text()

// Armar <style> con el contenido
const estilosImpresion = `<style>${cssText}</style>`

// 1. Eliminar el <link> que tiene el id="css-temporal"
html = html.replace(/<link[^>]*id=["']css-temporal["'][^>]*>/, '')

// 2. Inyectar el CSS en el <head>
html = html.replace('</head>', `${estilosImpresion}</head>`)



    const win = window.open('', '_blank')
    if (win) {
      win.document.open()
      win.document.write(html)
      win.document.close()
      setTimeout(() => {
        win.focus()
        win.print()
        win.close()
      }, 500)
    }
  } catch (error) {
    console.error('Error al imprimir:', error)
  }
}


  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!finalHtml) return <Alert severity="warning">Sin datos</Alert>

  return (
    <div style={{ padding: 16, background: '#f5f5f5', minHeight: '100vh' }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
   <Button variant="contained" onClick={handlePrint}>
  🖨️ Imprimir
</Button>

      </Stack>

      <div
        className="sheet"
        dangerouslySetInnerHTML={{ __html: finalHtml }}
      />
    </div>
  )
}
