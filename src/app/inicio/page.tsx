'use client';

import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Button,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tooltip,
} from '@mui/material';
import BusquedaAvanzada from '@/components/BusquedaAvanzada';
import TablaFormularios from '@/components/TablaFormularios';
import DialogCambiarEstado from '@/components/DialogCambiarEstado';
import { ESTADOS_UI, estadoColorMap, normalizeEstado, type EstadoUI } from '@/utils/constants';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useState, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import GavelIcon from '@mui/icons-material/Gavel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import * as XLSX from 'xlsx-js-style';
import {
  listarIntervenciones,
  IntervencionItem,
  eliminarIntervencionSoft,
  cerrarIntervencion,
  archivarIntervencion,
  cambiarEstadoMultipleConVerificacion, 
  debugCambioEstado, 
} from '@/services/intervenciones';

type Formulario = {
  id: string;
  coordinador: string;
  operador: string;
  victima: string;
  numero: string;
  dni: string;
  fecha: string;
  estado: EstadoUI;
  delito: string;
  departamento: string;
  counts?: {
    derivaciones: number;
    hechos_delictivos: number;
    victimas: number;
    seguimientos: number;
  };
};

export default function InicioPage() {
  const router = useRouter();

  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtro, setFiltro] = useState({
    coordinador: '',
    operador: '',
    victima: '',
    numero: '',
    dni: '',
    fechaDesde: '',
    fechaHasta: '',
    estado: 'Todos',
    delito: '',
    departamento: '',
  });

  const [pagina, setPagina] = useState(1);
  const formulariosPorPagina = 5;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [openEstadoDialog, setOpenEstadoDialog] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoUI | ''>('');

  // ✅ Estados seleccionables (excluye "Eliminado")
  const ESTADOS_SELECCIONABLES: EstadoUI[] = ['Activo', 'Archivado'];

  // Carga real desde /api/intervenciones
  useEffect(() => {
    const load = async () => {
      setCargando(true);
      setError(null);
      try {
        const data: IntervencionItem[] = await listarIntervenciones();

        const mapped: Formulario[] = data.map((it) => {
          const victima = it.victimas?.[0]; // primera víctima si existe

          const delitoParsed = it.hechoDelictivo?.tipoHecho
            ? Object.entries(it.hechoDelictivo.tipoHecho)
                .filter(([_, value]) => value === true)
                .map(([key]) => key)
                .join(', ')
            : '—';

          const departamentoParsed =
            typeof it.hechoDelictivo?.ubicacion?.departamento === 'number'
              ? String(it.hechoDelictivo.ubicacion.departamento)
              : typeof victima?.direccion?.departamento === 'number'
              ? String(victima.direccion.departamento)
              : '—';

          return {
            id: String(it.id),
            coordinador: it.coordinador || '—',
            operador: it.operador || '—',
            victima: victima?.nombre || '—',
            numero: it.numero_intervencion || '—',
            dni: victima?.dni || '—',
            fecha: new Date(it.fecha).toISOString().slice(0, 10),
            estado: normalizeEstado(it.estado, it.eliminado),
            delito: delitoParsed,
            departamento: departamentoParsed,
            counts: {
              derivaciones: it._count?.derivaciones ?? 0,
              hechos_delictivos: it._count?.hechos_delictivos ?? 0,
              victimas: it._count?.victimas ?? 0,
              seguimientos: it._count?.seguimientos ?? 0,
            },
          };
        });
        setFormularios(mapped);
      } catch (e: any) {
        setError(e?.message || 'No se pudieron cargar las intervenciones');
      } finally {
        setCargando(false);
      }
    };
    load();
  }, []);

  function EstadoDot({ estado }: { estado: string }) {
    // Verificación de tipo segura para indexar estadoColorMap
    const colorKey = ESTADOS_UI.includes(estado as EstadoUI) ? estado as EstadoUI : 'Eliminado';
    const color = estadoColorMap[colorKey] || 'grey';
    return (
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: color,
          mr: 1,
        }}
      />
    );
  }

  const handleFiltroInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltro((prev) => ({ ...prev, [name]: value }));
    setPagina(1);
  };

  const handleFiltroSelect = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFiltro((prev) => ({ ...prev, [name]: value }));
    setPagina(1);
  };

  const handleImprimirSeleccionados = () => {
  if (seleccionados.length === 0) return

  const query = seleccionados.map(id => `id=${id}`).join('&')
  const url = `/imprimir-multiples-formularios?${query}`

  window.open(url, '_blank')
}


  const handleEliminarSeleccionados = async () => {
    if (seleccionados.length === 0) return;
    const confirmado = confirm(`¿Seguro que deseas eliminar ${seleccionados.length} formularios?`);
    if (!confirmado) return;

    try {
      await Promise.all(seleccionados.map(id => eliminarIntervencionSoft(Number(id))));
      // ✅ Actualizar estado a "Eliminado" en lugar de remover del array
      setFormularios(prev => 
        prev.map(f => 
          seleccionados.includes(f.id) 
            ? { ...f, estado: 'Eliminado' as EstadoUI }
            : f
        )
      );
      setSeleccionados([]);
    } catch (e: any) {
      alert(e?.message || 'No se pudieron eliminar algunos elementos');
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleAccion = async (accion: string) => {
    if (!selectedId) return;

    try {
      switch (accion) {
        case 'ver':
          router.push(`/ver-formularios?id=${selectedId}`);
          break;

        case 'editar':
          router.push(`/editar-formulario?id=${selectedId}`);
          break;

        case 'imprimir':
          window.open(`/imprimir-formulario?id=${selectedId}`, '_blank');
          break;

        case 'listar':
          router.push(`/listar-formularios`);
          break;

        case 'estado':
          // ✅ Solo permitir cambio de estado si NO está eliminado
          const formulario = formularios.find(f => f.id === selectedId);
          if (formulario?.estado === 'Eliminado') {
            alert('No se puede cambiar el estado de una intervención eliminada');
            break;
          }
          setSeleccionados([selectedId]);
          setOpenEstadoDialog(true);
          break;

     

        case 'archivar': {
          // ✅ Archivar: mueve directamente a archivo (cualquier estado -> Archivado) 
          // Esta acción es administrativa, no implica resolución del caso
          await archivarIntervencion(Number(selectedId));
          setFormularios(prev =>
            prev.map(f => f.id === selectedId ? { ...f, estado: 'Archivado' as EstadoUI } : f)
          );
          break;
        }

        case 'eliminar': {
          const ok = confirm('¿Seguro que deseas eliminar esta intervención?');
          if (!ok) break;
          await eliminarIntervencionSoft(Number(selectedId));
          // ✅ Cambiar estado a "Eliminado" en lugar de remover
          setFormularios(prev => 
            prev.map(f => f.id === selectedId ? { ...f, estado: 'Eliminado' as EstadoUI } : f)
          );
          break;
        }
      }
    } catch (err: any) {
      alert(err?.message || 'Ocurrió un error realizando la acción');
    } finally {
      handleCloseMenu();
    }
  };

  // Navega a creación de caso
  const handleNuevoCaso = () => {
    router.push('/nuevo-caso');
  };

  const formulariosFiltrados = formularios.filter((f) => {
    const coincideCoordinador = f.coordinador.toLowerCase().includes(filtro.coordinador.toLowerCase());
    const coincideOperador = f.operador.toLowerCase().includes(filtro.operador.toLowerCase());
    const coincideVictima = f.victima.toLowerCase().includes(filtro.victima.toLowerCase());
    const coincideNumero = f.numero.includes(filtro.numero);
    const coincideDni = !filtro.dni || f.dni?.includes(filtro.dni);
    const coincideDelito = !filtro.delito || f.delito === filtro.delito;
    const coincideDepartamento = !filtro.departamento || f.departamento === filtro.departamento;
    const coincideEstado = filtro.estado === 'Todos' || f.estado.toLowerCase() === filtro.estado.toLowerCase();

    const fechaForm = new Date(f.fecha);
    const fechaDesde = filtro.fechaDesde ? new Date(filtro.fechaDesde) : null;
    const fechaHasta = filtro.fechaHasta ? new Date(filtro.fechaHasta) : null;
    const coincideFecha = (!fechaDesde || fechaForm >= fechaDesde) && (!fechaHasta || fechaForm <= fechaHasta);

    return (
      coincideCoordinador &&
      coincideOperador &&
      coincideVictima &&
      coincideNumero &&
      coincideDni &&
      coincideDelito &&
      coincideDepartamento &&
      coincideEstado &&
      coincideFecha
    );
  });

  const formulariosPagina = formulariosFiltrados.slice(
    (pagina - 1) * formulariosPorPagina,
    pagina * formulariosPorPagina
  );

  const formatearFecha = (fecha: string) => {
    const [a, m, d] = fecha.split('-');
    return `${d}/${m}/${a}`;
  };

  const toggleSeleccionado = (id: string) => {
    // ✅ No permitir seleccionar formularios eliminados
    const formulario = formularios.find(f => f.id === id);
    if (formulario?.estado === 'Eliminado') {
      return; // No hacer nada si está eliminado
    }
    
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleTodos = () => {
    // ✅ Solo seleccionar formularios que NO estén eliminados
    const formulariosSinEliminar = formulariosPagina.filter(f => f.estado !== 'Eliminado');
    
    if (formulariosSinEliminar.every((f) => seleccionados.includes(f.id))) {
      setSeleccionados((prev) => prev.filter((id) => !formulariosSinEliminar.some((f) => f.id === id)));
    } else {
      const nuevosIds = formulariosSinEliminar.map((f) => f.id);
      setSeleccionados((prev) => [...new Set([...prev, ...nuevosIds])]);
    }
  };

  // ======== EXPORTACIÓN A EXCEL CON ESTILOS ========
  const handleExportarExcel = () => {
    const rows =
      seleccionados.length > 0 ? formularios.filter((f) => seleccionados.includes(f.id)) : formulariosFiltrados;

    const headers = [
      'ID',
      'Coordinador',
      'Operador',
      'Víctima',
      'Número',
      'DNI',
      'Fecha',
      'Estado',
      'Delito',
      'Departamento',
    ];

    const data = [
      headers,
      ...rows.map((f) => [
        f.id,
        f.coordinador,
        f.operador,
        f.victima,
        f.numero,
        f.dni,
        formatearFecha(f.fecha),
        f.estado,
        f.delito,
        f.departamento,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // 10 columnas (A..J)
    (ws as any)['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
    ];

    // A1:J1
    (ws as any)['!autofilter'] = { ref: `A1:J1` };

    const range = XLSX.utils.decode_range((ws as any)['!ref']);

    const borderThin: any = {
      top: { style: 'thin', color: { rgb: 'DDDDDD' } },
      bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
      left: { style: 'thin', color: { rgb: 'DDDDDD' } },
      right: { style: 'thin', color: { rgb: 'DDDDDD' } },
    };

    const headerStyle: any = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { patternType: 'solid', fgColor: { rgb: '6D44B8' } },
      border: borderThin,
    };

    const zebraFill = (isEven: boolean): any => ({
      patternType: 'solid',
      fgColor: { rgb: isEven ? 'F7F7FB' : 'FFFFFF' },
    });

    // Encabezados
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      const cell = (ws as any)[cellRef] || {};
      cell.s = headerStyle;
      (ws as any)[cellRef] = cell;
    }

    // Filas + Estado
    const estadoColIdx = 7; // 0-based (columna "Estado")
    for (let r = 1; r <= range.e.r; r++) {
      const isEven = r % 2 === 0;

      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        const cell = (ws as any)[cellRef] || {};

        const baseStyle: any = {
          fill: zebraFill(isEven),
          border: borderThin,
          alignment: { vertical: 'center' },
        };

        if (c === 0) {
          baseStyle.font = { bold: true, color: { rgb: '333333' } };
          baseStyle.alignment = { ...baseStyle.alignment, horizontal: 'center' };
        }

        if (c === 5) {
          baseStyle.alignment = { ...baseStyle.alignment, horizontal: 'center' };
        }

        if (c === estadoColIdx) {
          const estado = String(cell.v || '');
          // Verificación de tipo segura
          const colorKey = ESTADOS_UI.includes(estado as EstadoUI) ? estado as EstadoUI : 'Eliminado';
          const hex = (estadoColorMap[colorKey] || '#9E9E9E').replace('#', '').toUpperCase();
          baseStyle.fill = { patternType: 'solid', fgColor: { rgb: hex } };
          baseStyle.font = { bold: true, color: { rgb: 'FFFFFF' } };
          baseStyle.alignment = { horizontal: 'center', vertical: 'center' };
        }

        cell.s = baseStyle;
        (ws as any)[cellRef] = cell;
      }
    }

    (ws as any)['!rows'] = [{ hpt: 24 }, ...Array(range.e.r).fill({ hpt: 18 })];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Formularios');

    const fechaNow = new Date();
    const nombreArchivo = `formularios_${fechaNow.getFullYear()}-${String(fechaNow.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(fechaNow.getDate()).padStart(2, '0')}.xlsx`;

    XLSX.writeFile(wb, nombreArchivo);
  };
  // ======== FIN EXPORTACIÓN ========

  const renderEstadoChip = (estado: string) => {
    const muiColorMap: Record<EstadoUI, 'success' | 'info' | 'default'> = {
      Activo: 'success',
      Archivado: 'info',
      Eliminado: 'default',
    };
    // Verificación de tipo segura
    const colorKey = ESTADOS_UI.includes(estado as EstadoUI) ? estado as EstadoUI : 'Eliminado';
    return <Chip label={estado} color={muiColorMap[colorKey] || 'default'} size="small" />;
  };

  // Resumen con Material Icons + tooltip + etiqueta en grilla 2×2
  const renderResumen = (f: Formulario) => {
    const c = f.counts || { derivaciones: 0, hechos_delictivos: 0, victimas: 0, seguimientos: 0 };

    const goTo = (path: string) => router.push(path);

    const Stat = ({
      title,
      icon,
      value,
      path,
    }: {
      title: string;
      icon: ReactElement;
      value: number;
      path: string;
    }) => {
      const clickable = value > 0;
      const chipProps = {
        size: 'small',
        variant: clickable ? 'filled' : 'outlined',
        color: clickable ? 'primary' : 'default',
      } as const;

      return (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Tooltip title={title} arrow>
            <Chip
              icon={icon}
              label={value}
              {...chipProps}
              onClick={clickable ? () => goTo(path) : undefined}
              component={clickable ? 'button' : 'div'}
              sx={{
                cursor: clickable ? 'pointer' : 'default',
                '& .MuiChip-icon': { fontSize: 18 },
                fontWeight: 'bold',
                minWidth: 72,
                justifyContent: 'center',
              }}
            />
          </Tooltip>
          <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', textAlign: 'center' }}>
            {title}
          </Typography>
        </Box>
      );
    };

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
          gap: 1.5,
          alignItems: 'center',
          justifyItems: 'center',
          width: '100%',
        }}
      >
        <Stat
          title="Derivaciones"
          icon={<CallSplitIcon fontSize="small" />}
          value={c.derivaciones}
          path={`/intervencion/${f.id}/derivaciones`}
        />
        <Stat
          title="Hechos delictivos"
          icon={<GavelIcon fontSize="small" />}
          value={c.hechos_delictivos}
          path={`/intervencion/${f.id}/hechos`}
        />
        <Stat
          title="Víctimas"
          icon={<PersonIcon fontSize="small" />}
          value={c.victimas}
          path={`/intervencion/${f.id}/victimas`}
        />
        <Stat
          title="Seguimientos"
          icon={<TrendingUpIcon fontSize="small" />}
          value={c.seguimientos}
          path={`/intervencion/${f.id}/seguimientos`}
        />
      </Box>
    );
  };

  const handleCambiarEstadoSeleccionados = () => {
    if (seleccionados.length === 0) return;
    
    // ✅ Verificar que no haya formularios eliminados en la selección
    const hayEliminados = seleccionados.some(id => {
      const formulario = formularios.find(f => f.id === id);
      return formulario?.estado === 'Eliminado';
    });
    
    if (hayEliminados) {
      alert('No se puede cambiar el estado de intervenciones eliminadas');
      return;
    }
    
    setOpenEstadoDialog(true);
  };

// Reemplaza la función confirmarCambioEstado en InicioPage.tsx

const confirmarCambioEstado = async () => {
  if (!nuevoEstado || !ESTADOS_SELECCIONABLES.includes(nuevoEstado as EstadoUI)) {
    alert('Estado inválido');
    return;
  }

  // Mostrar loading
  const loading = document.createElement('div');
  loading.textContent = `Cambiando estado a "${nuevoEstado}"...`;
  loading.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8); color: white; padding: 20px;
    border-radius: 8px; z-index: 9999; font-family: Arial, sans-serif;
  `;
  document.body.appendChild(loading);

  try {
    // Convertir IDs de string a number
    const idsNumero = seleccionados.map(id => Number(id));
    
    // ✅ Usar la nueva función con verificación
    console.log(`Cambiando estado de ${idsNumero.length} intervenciones a "${nuevoEstado}"`);
    await cambiarEstadoMultipleConVerificacion(idsNumero, nuevoEstado);
    
    // ✅ Actualizar el estado local SOLO después de verificación exitosa
    setFormularios(prev =>
      prev.map(f => (seleccionados.includes(f.id) ? { ...f, estado: nuevoEstado as EstadoUI } : f))
    );
    
    console.log(`Estado cambiado y verificado exitosamente a "${nuevoEstado}"`);
    
    // Mostrar mensaje de éxito
    alert(`Estado cambiado exitosamente a "${nuevoEstado}" para ${seleccionados.length} intervenciones`);
    
  } catch (error: any) {
    console.error('Error cambiando estado:', error);
    
    // Mostrar error detallado
    const mensaje = error.message || error.toString();
    alert(
      `Error cambiando estado: ${mensaje}\n\n` +
      `Esto puede indicar que el backend no está persistiendo correctamente los cambios. ` +
      `Verifica que el endpoint esté funcionando correctamente.`
    );
    
    // NO cerrar el diálogo si hay error
    document.body.removeChild(loading);
    return;
  }

  // Limpiar y cerrar solo si todo fue exitoso
  document.body.removeChild(loading);
  setSeleccionados([]);
  setSelectedId(null);
  setNuevoEstado('');
  setOpenEstadoDialog(false);
};

  if (cargando) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Cargando intervenciones...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* BÚSQUEDA AVANZADA */}
      <BusquedaAvanzada
        filtro={filtro}
        handleFiltroInput={handleFiltroInput}
        handleFiltroSelect={handleFiltroSelect}
        handleExportarExcel={handleExportarExcel}
        EstadoDot={EstadoDot}
      />

      <Box display="flex" gap={2} mb={2}>
        <Button
          variant="contained"
          color="secondary"
          disabled={seleccionados.length === 0}
          onClick={handleCambiarEstadoSeleccionados}
        >
          🔄 Cambiar estado seleccionados
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={seleccionados.length === 0}
          onClick={handleImprimirSeleccionados}
        >
          🖨️ Imprimir seleccionados
        </Button>

        <Button
          variant="outlined"
          color="error"
          disabled={seleccionados.length === 0}
          onClick={handleEliminarSeleccionados}
        >
          🗑️ Eliminar seleccionados
        </Button>
      </Box>

      <Box display="flex" justifyContent="flex-start" mb={2} gap={2}>
        <Button
          variant="contained"
          onClick={() => router.push('/admin')}
          startIcon={<PersonIcon sx={{ color: '#fff' }} />}
          sx={{
            backgroundColor: '#00796b',
            color: '#fff',
            fontWeight: 'bold',
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': { backgroundColor: '#004d40' },
          }}
        >
          Gestión de Usuarios
        </Button>

        <Button
          variant="contained"
          onClick={handleNuevoCaso}
          sx={{
            backgroundColor: '#6d44b8',
            color: '#fff',
            fontWeight: 'bold',
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': { backgroundColor: '#573b8a' },
          }}
          startIcon={<AddIcon sx={{ color: '#fff' }} />}
        >
          Nuevo Caso
        </Button>
      </Box>

      {/* TABLA DE RESULTADOS */}
      <TablaFormularios
        formulariosPagina={formulariosPagina}
        formulariosFiltradosLength={formulariosFiltrados.length}
        seleccionados={seleccionados}
        toggleSeleccionado={toggleSeleccionado}
        toggleTodos={toggleTodos}
        handleOpenMenu={handleOpenMenu}
        handleCloseMenu={handleCloseMenu}
        handleAccion={handleAccion}
        anchorEl={anchorEl}
        pagina={pagina}
        setPagina={setPagina}
        formatearFecha={formatearFecha}
        selectedId={selectedId}
        renderEstadoChip={renderEstadoChip}
      />

      {/* ✅ Pasar solo estados seleccionables al dialog */}
      <DialogCambiarEstado
        open={openEstadoDialog}
        onClose={() => setOpenEstadoDialog(false)}
        onConfirmar={confirmarCambioEstado}
        nuevoEstado={nuevoEstado}
        setNuevoEstado={setNuevoEstado}
        EstadoDot={EstadoDot}
        estadosDisponibles={ESTADOS_SELECCIONABLES} // ✅ Nueva prop
      />
    </Box>
  );
}