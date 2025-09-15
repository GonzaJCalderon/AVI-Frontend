'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo, useRef } from 'react'
import { obtenerIntervencionPorId } from '@/services/intervenciones'
import type { IntervencionItem as IntervencionData } from '@/services/intervenciones'
import { Button, Stack } from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import DownloadIcon from '@mui/icons-material/Download'

export default function ImprimirMultiplesFormulariosExactos() {
  const sp = useSearchParams()
  const ids = useMemo(() => sp.getAll('id').filter(Boolean), [sp])
  const [tpl, setTpl] = useState<string | null>(null)
  const [htmls, setHtmls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [departamentos, setDepartamentos] = useState<{ id: string; nombre: string }[]>([])

  // Cargar departamentos
  useEffect(() => {
    const loadDepartamentos = async () => {
      try {
        const res = await fetch('/departamentosMendoza.json')
        const data = await res.json()
        setDepartamentos(data.departamentos)
      } catch (err) {
        console.error('Error cargando departamentos', err)
      }
    }
    loadDepartamentos()
  }, [])

  // Cargar plantilla
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch('/formulario.html')
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        const html = await res.text()
        setTpl(html)
      } catch (e) {
        console.error('[ERROR cargando plantilla]', e)
        setError(`Error cargando plantilla: ${e instanceof Error ? e.message : 'Error desconocido'}`)
      }
    }
    fetchTemplate()
  }, [])

  // Funciones auxiliares (mismas que el componente individual)
  const formatDate = (date?: string) => {
    if (!date) return ''
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return ''
      const day = d.getUTCDate()
      const month = d.getUTCMonth() + 1
      const year = d.getUTCFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return ''
    }
  }

  const safeGenero = (value: any): number | null => {
    const num = Number(value)
    return isNaN(num) ? null : num
  }

  const getDepartamentoNombre = (id?: string | number) => {
    if (!id) return ''
    const depto = departamentos.find(d => d.id === String(id))
    return depto ? depto.nombre : ''
  }

  // Función para crear reemplazos detallados (misma lógica que el componente individual)
  const createDetailedReplacements = (data: IntervencionData, id: string) => {
    const d = data
    const derivacionDesc = d?.derivaciones?.[0]?.tipo_derivaciones?.descripcion?.toLowerCase().replace(/[-\s]/g, '') || '';
    const genero = safeGenero(d?.victimas?.[0]?.genero_id)

    return {
      // === DATOS INTERVENCIÓN ===
      '{{FECHA}}': formatDate(d?.fecha),
      '{{COORDINADOR}}': d?.coordinador || '',
      '{{NRO_FICHA}}': d?.numero_intervencion || id || '',
      '{{OPERADOR}}': d?.operador || '',
      '{{RESENA}}': d?.resena_hecho || '',

      // === DERIVACIÓN ===
      '{{DERIVADOR}}': d?.derivaciones?.[0]?.derivador || '',
      '{{HORA_DERIV}}': d?.derivaciones?.[0]?.fecha_derivacion?.split('T')[1]?.slice(0, 5) || '',
      '{{CEO_911}}': derivacionDesc === 'ceo911' ? 'X' : '',
      '{{MIN_SEGURIDAD}}': derivacionDesc === 'minseguridad' ? 'X' : '',
      '{{MIN_PUBLICO_FISCAL}}': derivacionDesc === 'minpublicofiscal' ? 'X' : '',
      '{{HOSPITAL}}': derivacionDesc === 'hospital' ? 'X' : '',
      '{{CENTRO_SALUD}}': derivacionDesc === 'centrodesalud' ? 'X' : '',
      '{{DEMANDA_ESPONTANEA}}': derivacionDesc === 'demandaespontanea' ? 'X' : '',
      '{{MUNICIPIO}}': derivacionDesc === 'municipio' ? 'X' : '',
      '{{OTRO_DERIVACION}}': derivacionDesc === 'otro' ? 'X' : '',
      '{{OTRO_DERIVACION_TEXTO}}': d?.derivaciones?.[0]?.otro_texto || '',

      // === HECHO DELICTIVO ===
      '{{EXPEDIENTE}}': d?.hechos_delictivos?.[0]?.expediente || '',
      '{{NRO_AGRESORES}}': String(d?.hechos_delictivos?.[0]?.num_agresores ?? ''),
      '{{DELITO_ROBO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.robo ? 'X' : '',
      '{{DELITO_ROBO_AF}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.robo_arma_fuego ? 'X' : '',
      '{{DELITO_ROBO_AB}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.robo_arma_blanca ? 'X' : '',
      '{{DELITO_HOMICIDIO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.homicidio ? 'X' : '',
      '{{DELITO_HOMICIDIO_ACCIDENTE}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.homicidio_accidente_vial ? 'X' : '',
      '{{DELITO_HOMICIDIO_AV}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.homicidio_av_hecho ? 'X' : '',
      '{{DELITO_HOMICIDIO_DELITO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.homicidio_delito ? 'X' : '',
      '{{DELITO_LESIONES}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.lesiones ? 'X' : '',
      '{{DELITO_LESIONES_AF}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.lesiones_arma_fuego ? 'X' : '',
      '{{DELITO_LESIONES_AB}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.lesiones_arma_blanca ? 'X' : '',
      '{{DELITO_AMENAZAS}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.amenazas ? 'X' : '',
      '{{DELITO_FEMICIDIO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.femicidio ? 'X' : '',
      '{{DELITO_TRANSFEMICIDIO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.transfemicidio ? 'X' : '',
      '{{DELITO_ABUSO_SIMPLE}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.abuso_sexual_simple ? 'X' : '',
      '{{DELITO_ABUSO_AGRAVADO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.abuso_sexual_agravado ? 'X' : '',
      '{{DELITO_VIOLENCIA_GENERO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.violencia_genero ? 'X' : '',
      '{{UBICACION}}': d?.hechos_delictivos?.[0]?.geo?.[0]?.domicilio || '',
      '{{DEPTO_HECHO}}': getDepartamentoNombre(d?.hechos_delictivos?.[0]?.geo?.[0]?.departamentos?.dep_id),
      '{{FECHA_HECHO}}': formatDate(d?.hechos_delictivos?.[0]?.geo?.[0]?.fecha),
      '{{HORA_HECHO}}': d?.hechos_delictivos?.[0]?.geo?.[0]?.fecha?.split('T')[1]?.slice(0, 5) || '',

      // === ACCIONES PRIMERA LÍNEA ===
      '{{ACCIONES_1L}}': d?.acciones_primera_linea?.[0]?.acciones || '',

      // === ABUSO SEXUAL ===
      '{{KIT_SI}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.kit?.toUpperCase() === 'SI' ? 'X' : '',
      '{{KIT_NO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.kit?.toUpperCase() === 'NO' ? 'X' : '',
      '{{REL_CONOCIDO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.relacion === 'Conocido' ? 'X' : '',
      '{{REL_DESCONOCIDO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.relacion === 'Desconocido' ? 'X' : '',
      '{{REL_FAMILIAR}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.relacion === 'Familiar' ? 'X' : '',
      '{{REL_PAREJA}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.relacion === 'Pareja' ? 'X' : '',
      '{{RELACION_OTRO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.relacion_otro || '',
      '{{LUGAR_INST}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.lugar_hecho === 'Institución' ? 'X' : '',
      '{{LUGAR_PUBLICA}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.lugar_hecho === 'Vía Pública' ? 'X' : '',
      '{{LUGAR_DOM}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.lugar_hecho === 'Dom. particular' ? 'X' : '',
      '{{LUGAR_TRABAJO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.lugar_hecho === 'Lugar de trab.' ? 'X' : '',
      '{{LUGAR_OTRO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.lugar_otro || '',

      // === VÍCTIMAS ===
      '{{CANT_VICTIMAS}}': String(d?.victimas?.[0]?.cantidad_victima_por_hecho ?? ''),
      '{{DNI}}': d?.victimas?.[0]?.dni || '',
      '{{APELLIDO}}': d?.victimas?.[0]?.nombre?.split(' ').slice(1).join(' ') || '',
      '{{NOMBRES}}': d?.victimas?.[0]?.nombre?.split(' ')[0] || '',
      '{{GEN_MASCULINO}}': genero === 1 ? 'X' : '',
      '{{GEN_FEMENINO}}': genero === 2 ? 'X' : '',
      '{{GEN_NO_BINARIO}}': genero === 3 ? 'X' : '',
      '{{GEN_AGENERO}}': genero === 4 ? 'X' : '',
      '{{GEN_FLUIDO}}': genero === 5 ? 'X' : '',
      '{{GEN_BIGENERO}}': genero === 6 ? 'X' : '',
      '{{GEN_TRANSGENERO}}': genero === 7 ? 'X' : '',
      '{{GEN_MUJER_TRANS}}': genero === 8 ? 'X' : '',
      '{{GEN_HOMBRE_TRANS}}': genero === 9 ? 'X' : '',
      '{{GEN_INTERGENERO}}': genero === 10 ? 'X' : '',
      '{{GEN_INTERSEX}}': genero === 11 ? 'X' : '',
      '{{GEN_OTRO}}': genero === 12 ? 'X' : '',
      '{{GEN_PREFIERO_NO_DECIRLO}}': genero === 13 ? 'X' : '',
      '{{NACIMIENTO}}': formatDate(d?.victimas?.[0]?.fecha_nacimiento),
      '{{TELEFONO}}': d?.victimas?.[0]?.telefono || '',
      '{{DIR_VICTIMA}}': d?.victimas?.[0]?.direccion
        ? `${d.victimas[0].direccion.calle_nro}, ${d.victimas[0].direccion.barrio}`
        : '',
      '{{DEPTO_VICTIMA}}': getDepartamentoNombre(d?.victimas?.[0]?.direccion?.departamento),
      '{{OCUPACION}}': d?.victimas?.[0]?.ocupacion || '',

      // === TIPO DE INTERVENCIÓN ===
      '{{TIPO_CRISIS}}': d?.intervenciones_tipo?.[0]?.crisis ? 'X' : '',
      '{{TIPO_SOCIAL}}': d?.intervenciones_tipo?.[0]?.social ? 'X' : '',
      '{{TIPO_LEGAL}}': d?.intervenciones_tipo?.[0]?.legal ? 'X' : '',
      '{{TIPO_TELEFONICA}}': d?.intervenciones_tipo?.[0]?.telefonica ? 'X' : '',
      '{{TIPO_PSICOLOGICA}}': d?.intervenciones_tipo?.[0]?.psicologica ? 'X' : '',
      '{{TIPO_MEDICA}}': d?.intervenciones_tipo?.[0]?.medica ? 'X' : '',

      // === SEGUIMIENTO ===
      '{{DETALLE_INTERV}}': d?.seguimientos?.[0]?.detalles?.[0]?.detalle || '',
      '{{SEGUIM_SI}}': d?.seguimientos?.[0]?.hubo === true ? 'X' : '',
      '{{SEGUIM_NO}}': d?.seguimientos?.[0]?.hubo === false ? 'X' : ''
    }
  }

  // Cargar todos los formularios
  useEffect(() => {
    if (!tpl || ids.length === 0 || departamentos.length === 0) return

    const fetchAll = async () => {
      setLoading(true)
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const data = await obtenerIntervencionPorId(Number(id))
              const replacements = createDetailedReplacements(data, id)
              
              console.log('[DEBUG] Replacements para ID', id, ':', Object.entries(replacements).filter(([k, v]) => v !== '').slice(0, 10))
              
              let finalHtml = tpl
              // Hacer reemplazos con más logging
     for (const [key, value] of Object.entries(replacements)) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escapedKey, 'g')
  const beforeCount = (finalHtml.match(regex) || []).length
  finalHtml = finalHtml.replace(regex, value ?? '')
  if (beforeCount > 0) {
    console.log(`[DEBUG] Reemplazado ${key} -> "${value}" (${beforeCount} veces)`)
  }
}


              return finalHtml
            } catch (error) {
              console.error(`[ERROR] Error procesando ID ${id}:`, error)
              throw error
            }
          })
        )
        setHtmls(results)
        setError(null)
      } catch (err) {
        console.error('[ERROR]', err)
        setError('Error cargando formularios.')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [tpl, ids, departamentos])

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return
    
    // Agregar clases temporales para mover bloques superiores
    setTimeout(async () => {
      const bloquesSuperior = containerRef.current?.querySelectorAll('#bloque-superior')
      bloquesSuperior?.forEach(bloque => bloque.classList.add('mover-bloque-superior'))

      const html2pdf = (await import('html2pdf.js')).default
      await html2pdf()
        .from(containerRef.current)
        .set({
          margin: 0,
          filename: `formularios_${ids.join('_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .save()

      // Quitar clases temporales
      bloquesSuperior?.forEach(bloque => bloque.classList.remove('mover-bloque-superior'))
    }, 100)
  }

  if (loading) return <div>Cargando formularios...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 16,
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Stack direction="row" spacing={2} className="no-print" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => window.print()} startIcon={<PrintIcon />}>
          Imprimir
        </Button>
        <Button variant="contained" color="success" onClick={handleDownloadPDF} startIcon={<DownloadIcon />}>
          Descargar PDF
        </Button>
      </Stack>

      <div ref={containerRef}>
        {htmls.map((html, idx) => (
          <div
            key={idx}
            dangerouslySetInnerHTML={{ __html: html }}
            style={{
              pageBreakAfter: idx < htmls.length - 1 ? 'always' : 'auto',
              marginBottom: idx < htmls.length - 1 ? 30 : 0,
              width: '100%',
              maxWidth: '210mm',
              margin: '0 auto 30px auto',
              background: '#fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          div[ref='containerRef'], 
          div[ref='containerRef'] * {
            visibility: visible;
          }
          div[ref='containerRef'] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
          .no-print {
            display: none !important;
          }
        }
        .mover-bloque-superior {
          /* Agrega aquí los estilos CSS necesarios para mover el bloque superior */
          position: relative;
          top: -10px; /* Ajusta según necesites */
        }
      `}</style>
    </div>
  )
}