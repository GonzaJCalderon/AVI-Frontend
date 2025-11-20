'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo, useRef } from 'react'
import { obtenerIntervencionPorId } from '@/services/intervenciones'
import type { IntervencionItem as IntervencionData } from '@/services/intervenciones'
import { Button, Stack } from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import DownloadIcon from '@mui/icons-material/Download'


export default function ImprimirFormularioExacto() {
const searchParams = useSearchParams()
const id = searchParams.get('id')
const modo = searchParams.get('modo')

  console.log('[🟡 ID de búsqueda]', id)

  const [tpl, setTpl] = useState<string | null>(null)
  const [data, setData] = useState<IntervencionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [departamentos, setDepartamentos] = useState<{ id: string; nombre: string }[]>([])
  const [localidades, setLocalidades] = useState<{ id: string; nombre: string }[]>([])


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

  useEffect(() => {
  const loadLocalidades = async () => {
    try {
      const res = await fetch('/localidadesMendoza.json')
      const data = await res.json()
      setLocalidades(data.localidades)
    } catch (err) {
      console.error('Error cargando localidades', err)
    }
  }
  loadLocalidades()
}, [])


  // === Cargar plantilla HTML ===
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch('/formulario.html')
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        const html = await response.text()
        console.log('[📄 Plantilla HTML cargada]', html.slice(0, 200) + '...')
        setTpl(html)
      } catch (e) {
        console.error('[❌ ERROR cargando plantilla]', e)
        setError(`Error cargando plantilla: ${e instanceof Error ? e.message : 'Error desconocido'}`)
        setTpl(null)
      }
    }

    loadTemplate()
  }, [])

  // 🔥 NUEVO: Cargar los estilos del formulario
 useEffect(() => {
  const loadFormStyles = async () => {
    const existing = document.getElementById('formulario-styles');
    if (existing) return; // ya está cargado

    try {
      const res = await fetch('/formulario-imprimir.css');
      const css = await res.text();
      const styleTag = document.createElement('style');
      styleTag.id = 'formulario-styles';
      styleTag.textContent = css;
      document.head.appendChild(styleTag);
    } catch (err) {
      console.error('No se pudo cargar formulario-imprimir.css', err);
    }
  };

  loadFormStyles();
}, []);


  // === Cargar datos desde backend ===
useEffect(() => {
  if (!id) {
    setError('ID de intervención no proporcionado')
    setLoading(false)
    return
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const json = await obtenerIntervencionPorId(Number(id))
      console.log('[✅ Datos de intervención cargados]', json)

      if (!json) throw new Error('No se encontraron datos para la intervención')

      setData(json)
      setError(null)
    } catch (error) {
      console.error('[❌ ERROR AL CARGAR INTERVENCIÓN]', error)
      setError(`Error cargando intervención: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  loadData()
}, [id])

useEffect(() => {
  if (data?.hechos_delictivos) {
    console.log('DEBUG geo completo:', data.hechos_delictivos[0]?.geo);
  }
}, [data]);

useEffect(() => {
  if (modo === 'imprimir') {
    const timeout = setTimeout(() => {
      window.print()
      // Restaurar scroll/zoom si es necesario
      document.body.style.zoom = '100%';
    }, 500)
    return () => {
      clearTimeout(timeout)
      document.body.style.zoom = '100%';
    }
  }
}, [modo])

useEffect(() => {
  const cssTag = document.getElementById('formulario-styles');
  if (cssTag) {
    const newTag = cssTag.cloneNode(true);
    cssTag.remove();
    document.head.appendChild(newTag);
  }
}, [modo])


useEffect(() => {
  if (data?.abusos_sexuales?.[0]?.datos?.[0]) {
    console.log('🔍 Lugar del hecho:', data.abusos_sexuales[0].datos[0].lugar_hecho);
  }
  if (data?.hechos_delictivos?.[0]?.geo?.[0]) {
    console.log('🔍 Geo lugar:', data.hechos_delictivos[0].geo[0]);
  }
}, [data]); 

// Función para extraer hora soportando "T" o espacio
const extractTime = (dateString?: string | null) => {
  if (!dateString || typeof dateString !== 'string') return '';
  
  // Si viene como "2025-11-05T14:30:00" usa 'T', si viene como SQL usa ' '
  const separator = dateString.includes('T') ? 'T' : ' ';
  const parts = dateString.split(separator);

  // Si tenemos la parte de la hora, devolvemos los primeros 5 carácteres (HH:MM)
  if (parts.length > 1) {
    return parts[1].substring(0, 5);
  }
  
  return '';
};

const formatDate = (date?: string | null) => {
  if (!date || typeof date !== 'string' || !date.includes('-')) return '';

  try {
    const soloFecha = date.split('T')[0];
    const [year, month, day] = soloFecha.split('-');

    if (
      isNaN(Number(year)) ||
      isNaN(Number(month)) ||
      isNaN(Number(day)) ||
      Number(year) < 1900
    ) {
      return '';
    }

    return `${day}/${month}/${year}`;
  } catch {
    return '';
  }
};


  const safeGenero = (value: any): number | null => {
    const num = Number(value)
    return isNaN(num) ? null : num
  }

  const getDepartamentoNombre = (id?: string | number) => {
    if (!id) return ''
    const depto = departamentos.find(d => d.id === String(id))
    return depto ? depto.nombre : ''
  }

const getLocalidadNombre = (id?: string | number) => {
  if (!id) return ''
  const loc = localidades.find(l => String(l.id) === String(id))
  return loc ? loc.nombre : ''
}


const clean = (str: string) => str.toLowerCase().replace(/[-\s]+/g, '');

console.log("🧪 Fecha de nacimiento recibida:", data?.victimas?.[0]?.fecha_nacimiento);


// === Generar reemplazos ===
const replacements = useMemo(() => {
  
  if (!data) return {}

  const d = data

  const clean = (str: string) => str.toLowerCase().replace(/[-\s]+/g, '')

  const derivacionRaw = d?.derivaciones?.[0]?.tipo_derivaciones?.descripcion?.trim() || ''
  const derivacionDesc = clean(derivacionRaw)

  const derivacionOpciones = [
    'CEO 911',
    'Min. Seguridad',
    'Ministerio Público Fiscal',
    'Hospital',
    'Centro de Salud',
    'Demanda espontánea',
    'Municipio'
  ].map(clean)

  const genero = safeGenero(d?.victimas?.[0]?.genero_id)

  const lugarHecho = d?.abusos_sexuales?.[0]?.datos?.[0]?.lugar_hecho?.trim() || ''
  const lugarClean = clean(lugarHecho)

 const nombreCompleto = d?.victimas?.[0]?.nombre || '';
const partesNombre = nombreCompleto.split(' ');
 
  return {
    // === DATOS INTERVENCIÓN ===
    '{{FECHA}}': formatDate(d?.fecha),
    '{{COORDINADOR}}': d?.coordinador || '',
    '{{NRO_FICHA}}': d?.numero_intervencion || id || '',
    '{{OPERADOR}}': d?.operador || '',
    '{{RESENA}}': d?.resena_hecho || '',

    // === DERIVACIÓN ===
    '{{DERIVADOR}}': d?.derivaciones?.[0]?.derivador || '',
    '{{FECHA_DERIV}}': d?.derivaciones?.[0]?.fecha_derivacion
      ? formatDate(d.derivaciones[0].fecha_derivacion)
      : '',
'{{HORA_DERIV}}': extractTime(d?.derivaciones?.[0]?.fecha_derivacion),


    '{{CEO_911}}': derivacionDesc === clean('CEO 911') ? 'X' : '',
    '{{MIN_SEGURIDAD}}': derivacionDesc === clean('Min. Seguridad') ? 'X' : '',
    '{{MIN_PUBLICO_FISCAL}}': derivacionDesc === clean('Ministerio Público Fiscal') ? 'X' : '',
    '{{HOSPITAL}}': derivacionDesc === clean('Hospital') ? 'X' : '',
    '{{CENTRO_SALUD}}': derivacionDesc === clean('Centro de Salud') ? 'X' : '',
    '{{DEMANDA_ESPONTANEA}}': derivacionDesc === clean('Demanda espontánea') ? 'X' : '',
    '{{MUNICIPIO}}': derivacionDesc === clean('Municipio') ? 'X' : '',

    '{{MUNICIPIO_NOMBRE}}': derivacionDesc === clean('Municipio')
      ? d?.derivaciones?.[0]?.municipio || ''
      : '',

    '{{OTRO_DERIVACION}}': !derivacionOpciones.includes(derivacionDesc) ? 'X' : '',
    '{{OTRO_DERIVACION_TEXTO}}': !derivacionOpciones.includes(derivacionDesc)
      ? derivacionRaw
      : '',

    // === HECHO DELICTIVO ===
    '{{EXPEDIENTE}}': d?.hechos_delictivos?.[0]?.expediente || '',
    '{{NRO_AGRESORES}}': String(d?.hechos_delictivos?.[0]?.num_agresores ?? ''),

    '{{DELITO_ROBO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.robo ? 'X' : '',
    '{{DELITO_ROBO_AF}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.robo_arma_fuego ? 'X' : '',
    '{{DELITO_ROBO_AB}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.robo_arma_blanca ? 'X' : '',
    '{{DELITO_HOMICIDIO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.homicidio ? 'X' : '',
    '{{DELITO_HOMICIDIO_ACCIDENTE}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]
      ?.homicidio_accidente_vial
      ? 'X'
      : '',
    '{{DELITO_HOMICIDIO_AV}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.homicidio_av_hecho
      ? 'X'
      : '',
    '{{DELITO_HOMICIDIO_DELITO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.homicidio_delito
      ? 'X'
      : '',
    '{{DELITO_LESIONES}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.lesiones ? 'X' : '',
    '{{DELITO_LESIONES_AF}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.lesiones_arma_fuego
      ? 'X'
      : '',
    '{{DELITO_LESIONES_AB}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.lesiones_arma_blanca
      ? 'X'
      : '',
    '{{DELITO_AMENAZAS}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.amenazas ? 'X' : '',
    '{{DELITO_FEMICIDIO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.femicidio ? 'X' : '',
    '{{DELITO_TRANSFEMICIDIO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.transfemicidio
      ? 'X'
      : '',
    '{{DELITO_ABUSO_SIMPLE}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.abuso_sexual_simple
      ? 'X'
      : '',
    '{{DELITO_ABUSO_AGRAVADO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.abuso_sexual_agravado
      ? 'X'
      : '',
    '{{DELITO_VIOLENCIA_GENERO}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.violencia_genero
      ? 'X'
      : '',
    '{{DELITO_OTROS}}': d?.hechos_delictivos?.[0]?.relaciones?.[0]?.otros ? 'X' : '',

    // === UBICACIÓN DEL HECHO ===
    '{{UBICACION}}': d?.hechos_delictivos?.[0]?.geo?.[0]?.domicilio || '',
    '{{DEPTO_HECHO}}': getDepartamentoNombre(
      d?.hechos_delictivos?.[0]?.geo?.[0]?.departamentos?.dep_id
    ),
    '{{LOC_HECHO}}': getLocalidadNombre(
      d?.hechos_delictivos?.[0]?.geo?.[0]?.localidad_id
    ),
    '{{FECHA_HECHO}}': formatDate(d?.hechos_delictivos?.[0]?.geo?.[0]?.fecha),
  '{{HORA_HECHO}}': (() => {
  const fecha = d?.hechos_delictivos?.[0]?.geo?.[0]?.fecha;
  if (!fecha) return '';
  const partes = fecha.split(' ');
  return partes[1] ? partes[1].slice(0, 5) : '';
})(),



    // === ACCIONES PRIMERA LÍNEA ===
    '{{ACCIONES_1L}}': d?.acciones_primera_linea?.[0]?.acciones || '',

    // === ABUSO SEXUAL ===
    '{{ABUSO_SIMPLE}}': d?.abusos_sexuales?.[0]?.tipo_abuso === 1 ? 'X' : '',
    '{{ABUSO_AGRAVADO}}': d?.abusos_sexuales?.[0]?.tipo_abuso === 2 ? 'X' : '',
    '{{KIT_SI}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.kit?.toUpperCase() === 'SI' ? 'X' : '',
    '{{KIT_NO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.kit?.toUpperCase() === 'NO' ? 'X' : '',
    '{{REL_CONOCIDO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.relacion === 'Conocido' ? 'X' : '',
    '{{REL_DESCONOCIDO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.relacion === 'Desconocido' ? 'X' : '',
    '{{REL_FAMILIAR}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.relacion === 'Familiar' ? 'X' : '',
    '{{REL_PAREJA}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.relacion === 'Pareja' ? 'X' : '',
    '{{RELACION_OTRO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.relacion_otro || '',
    
    '{{LUGAR_INST}}': lugarClean === clean('Institución') ? 'X' : '',
    '{{LUGAR_PUBLICA}}': (lugarClean === clean('Vía Pública') || lugarClean === clean('Vía pública')) ? 'X' : '',
    '{{LUGAR_DOM}}': (lugarClean === clean('Dom. particular') || lugarClean === clean('Domicilio particular')) ? 'X' : '',
    '{{LUGAR_TRABAJO}}': (lugarClean === clean('Lugar de trabajo') || lugarClean === clean('Lugar de trab.')) ? 'X' : '',
    '{{LUGAR_OTRO}}': d?.abusos_sexuales?.[0]?.datos?.[0]?.lugar_otro || '',

    // === VÍCTIMA ===
    '{{CANT_VICTIMAS}}': String(d?.victimas?.[0]?.cantidad_victima_por_hecho ?? ''),
    '{{DNI}}': d?.victimas?.[0]?.dni || '',
   
'{{NOMBRES}}': partesNombre[0] || '',
'{{APELLIDO}}': partesNombre.length > 1 ? partesNombre.slice(1).join(' ') : '',

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
'{{NACIMIENTO}}': d?.victimas?.[0]?.fecha_nacimiento 
  ? formatDate(d.victimas[0].fecha_nacimiento) 
  : '',
    '{{TELEFONO}}': d?.victimas?.[0]?.telefono || '',
    '{{DIR_VICTIMA}}': d?.victimas?.[0]?.direccion
      ? `${d.victimas[0].direccion.calle_nro}, ${d.victimas[0].direccion.barrio}`
      : '',
    '{{DEPTO_VICTIMA}}': getDepartamentoNombre(d?.victimas?.[0]?.direccion?.departamento),
    '{{LOC_VICTIMA}}': getLocalidadNombre(d?.victimas?.[0]?.direccion?.localidad),
    '{{OCUPACION}}': d?.victimas?.[0]?.ocupacion || '',

    // === PERSONA ENTREVISTADA ===
    '{{ENTREV_NOMBRE}}': d?.victimas?.[0]?.personas_entrevistadas?.[0]?.nombre || '',
    '{{ENTREV_RELACION}}': d?.victimas?.[0]?.personas_entrevistadas?.[0]?.relacion_victima || '',
    '{{ENTREV_CALLE}}': d?.victimas?.[0]?.personas_entrevistadas?.[0]?.direccion
      ? `${d.victimas[0].personas_entrevistadas[0].direccion.calle_nro || ''}, ${d.victimas[0].personas_entrevistadas[0].direccion.barrio || ''}`
      : '',
    '{{ENTREV_DEPTO}}': getDepartamentoNombre(
      d?.victimas?.[0]?.personas_entrevistadas?.[0]?.direccion?.departamento
    ),
    '{{ENTREV_LOCALIDAD}}': getLocalidadNombre(
      d?.victimas?.[0]?.personas_entrevistadas?.[0]?.direccion?.localidad
    ),

    // === TIPO DE INTERVENCIÓN ===
    '{{TIPO_CRISIS}}': d?.intervenciones_tipo?.[0]?.crisis ? 'X' : '',
    '{{TIPO_SOCIAL}}': d?.intervenciones_tipo?.[0]?.social ? 'X' : '',
    '{{TIPO_LEGAL}}': d?.intervenciones_tipo?.[0]?.legal ? 'X' : '',
    '{{TIPO_TELEFONICA}}': d?.intervenciones_tipo?.[0]?.telefonica ? 'X' : '',
    '{{TIPO_PSICOLOGICA}}': d?.intervenciones_tipo?.[0]?.psicologica ? 'X' : '',
    '{{TIPO_MEDICA}}': d?.intervenciones_tipo?.[0]?.medica ? 'X' : '',
    '{{TIPO_DOMICILIARIA}}': d?.intervenciones_tipo?.[0]?.domiciliaria ? 'X' : '',
    '{{TIPO_SIN_INTERV}}': d?.intervenciones_tipo?.[0]?.sin_intervencion ? 'X' : '',
    '{{TIPO_ARCHIVO_CASO}}': d?.intervenciones_tipo?.[0]?.archivo_caso ? 'X' : '',

    // === SEGUIMIENTO ===
    '{{DETALLE_INTERV}}': d?.seguimientos?.[0]?.detalles?.[0]?.detalle || '',
    '{{SEGUIM_SI}}': d?.seguimientos?.[0]?.hubo === true ? 'X' : '',
    '{{SEGUIM_NO}}': d?.seguimientos?.[0]?.hubo === false ? 'X' : '',
    '{{SEG_AS_LEGAL}}': d?.seguimientos?.[0]?.tipo?.[0]?.asesoramientolegal ? 'X' : '',
    '{{SEG_TRAT_PSICO}}': d?.seguimientos?.[0]?.tipo?.[0]?.tratamientopsicologico ? 'X' : '',
    '{{SEG_SEGUIMIENTO_LEGAL}}': d?.seguimientos?.[0]?.tipo?.[0]?.seguimientolegal ? 'X' : '',
    '{{SEG_ARCHIVO_CASO}}': d?.seguimientos?.[0]?.tipo?.[0]?.archivocaso ? 'X' : '',

  }
}, [data, id, departamentos, localidades])


 const finalHtml = useMemo(() => {
    if (!tpl || !data) return null
    let html = tpl
    for (const [placeholder, value] of Object.entries(replacements)) {
      html = html.split(placeholder).join(value || '')
    }
    return html
  }, [tpl, data, replacements])

  // === Descargar como PDF ===
const handleDownloadPDF = async () => {
  if (!formRef.current) return;

  const element = formRef.current;

  setTimeout(async () => {
    const bloqueSuperior = element.querySelector('#bloque-superior');
    console.log('[DEBUG] Bloque superior encontrado:', bloqueSuperior);

    if (!bloqueSuperior) {
      console.error('[DEBUG] NO se encontró el bloque-superior');
      return;
    }

    bloqueSuperior.classList.add('mover-bloque-superior');

    const html2pdf = (await import('html2pdf.js')).default;

    const opt = {
      margin: 0,
      filename: `formulario_${id || 'sin_id'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    await html2pdf().from(element).set(opt).save();

    bloqueSuperior.classList.remove('mover-bloque-superior');
  }, 100);
};


  if (loading) return <div>Cargando datos...</div>
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
      <Stack
        direction="row"
        spacing={2}
        className="no-print"
        sx={{ mb: 2 }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
        >
          Imprimir
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={() => {
            Promise.resolve().then(() => handleDownloadPDF());
          }}
        >
          Descargar PDF
        </Button>
      </Stack>



<div
  ref={formRef}
  data-formulario-container
  dangerouslySetInnerHTML={{ __html: finalHtml || '' }}
  style={{
    width: '100%',
    maxWidth: '210mm',
    background: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    marginBottom: 20,
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '14px',
    lineHeight: '1.5',
  }}
/>


    </div>
  )
}