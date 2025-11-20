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
import PrintIcon from '@mui/icons-material/Print';

import BusquedaAvanzada from '@/components/BusquedaAvanzada';
import TablaFormularios from '@/components/TablaFormularios';
import DialogCambiarEstado from '@/components/DialogCambiarEstado';
import { ESTADOS_UI, estadoColorMap, normalizeEstado, type EstadoUI, delitoKeyMap } from '@/utils/constants';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useState, useMemo, useCallback, useRef, ReactElement  } from 'react';

import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import GavelIcon from '@mui/icons-material/Gavel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import * as XLSX from 'xlsx-js-style';
import {
  IntervencionItem,
  eliminarIntervencionSoft,
  cerrarIntervencion,
  archivarIntervencion,
  cambiarEstadoMultipleConVerificacion, 
  debugCambioEstado,
  activarIntervencion, 
  obtenerIntervencionPorId,
} from '@/services/intervenciones';
import { listarIntervenciones } from '@/services/intervenciones'

// ✅ Importar el tipo desde el archivo de tipos
import { Formulario } from '@/types/formulario';
import html2pdf from 'html2pdf.js';

interface Departamento {
  id: string;
  nombre: string;
}

type FiltroFormularios = {
  coordinador: string;
  operador: string;
  victima: string;
  numero: string;
  dni: string;
  fechaDesde: string;
  fechaHasta: string;
  estado: string;
  delito: string[];
  departamento: string[];
  localidad: string;
};

export default function InicioPage() {
  const router = useRouter();

  // ========== TODOS LOS ESTADOS Y REFS PRIMERO ==========
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const departamentosRef = useRef<Departamento[]>([]);

  const filtrosIniciales: FiltroFormularios = {
    coordinador: '',
    operador: '',
    victima: '',
    numero: '',
    dni: '',
    fechaDesde: '',
    fechaHasta: '',
    estado: 'Todos',
    delito: [],
    departamento: [],
    localidad: '',
  };

  const [filtro, setFiltro] = useState<FiltroFormularios>(filtrosIniciales);
  const [pagina, setPagina] = useState(1);
  const formulariosPorPagina = 5;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [openEstadoDialog, setOpenEstadoDialog] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoUI | ''>('');

  // ✅ Estados seleccionables (excluye "Eliminado")
  const ESTADOS_SELECCIONABLES: EstadoUI[] = ['Activo', 'Archivado'];
  const ESTADO_TODOS = 'Todos';

  // ========== TODOS LOS useEffect ==========
useEffect(() => {
  const verificarSesion = () => {
    const data = localStorage.getItem('user');

    if (data) {
      try {
        const userData = JSON.parse(data);
        setUser(userData);
      } catch (e) {
        console.error('❌ Usuario inválido:', e);
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }

    setLoadingUser(false);
  };

  verificarSesion();
}, [router]);




  // Carga real desde /api/intervenciones
  useEffect(() => {
    const load = async () => {
      setCargando(true);
      setError(null);

      try {
        const [data, depRes] = await Promise.all([
          listarIntervenciones(),
          fetch('/departamentosMendoza.json'),
        ]);

        const departamentosJson = await depRes.json();
        departamentosRef.current = departamentosJson.departamentos;

        const mapped: Formulario[] = data.map((it) => {
          const victima = it.victimas?.[0];

          const delitoParsed = it.hechos_delictivos?.[0]?.relaciones?.[0]
            ? Object.entries(it.hechos_delictivos[0].relaciones[0])
                .filter(([key, val]) => val === true && key !== 'id' && key !== 'hecho_delictivo_id')
                .map(([key]) => delitoKeyMap[key] || key.replaceAll('_', ' '))
                .join(', ')
            : '—';

          const departamentoIdParsed = String(
            it.hechos_delictivos?.[0]?.geo?.[0]?.departamentos?.dep_id || ''
          );

          const departamentoNombre = departamentoIdParsed 
            ? departamentosRef.current.find(d => d.id === departamentoIdParsed)?.nombre || '—'
            : '—';

          const localidadParsed = it.hechos_delictivos?.[0]?.geo?.[0]?.domicilio || '—';
          const reseñaParsed = it.resena_hecho?.trim() || '—';

          return {
            id: String(it.id),
            coordinador: it.coordinador || '—',
            operador: it.operador || '—',
            victima: victima?.nombre || '—',
            numero: it.numero_intervencion || '—',
            numero_intervencion: it.numero_intervencion,
            dni: victima?.dni || '—',
            fecha: new Date(it.fecha).toISOString().slice(0, 10),
            estado: normalizeEstado(it.estado, it.eliminado),
            eliminado: it.eliminado,
            delito: delitoParsed,
            departamentoId: departamentoIdParsed,
            departamento: departamentoNombre,
            localidad: localidadParsed,
            reseña_hecho: reseñaParsed,
            counts: {
              derivaciones: it.derivaciones?.length ?? 0,
              hechos_delictivos: it.hechos_delictivos?.length ?? 0,
              victimas: it.victimas?.length ?? 0,
              seguimientos: it.seguimientos?.length ?? 0,
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

  // ========== TODOS LOS useMemo ==========
  const formulariosFiltrados = useMemo(() => {
    console.log('🔄 Recalculating filtered formularios...', { 
      totalFormularios: formularios.length,
      activeFilters: Object.entries(filtro).filter(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value && value !== 'Todos';
      }).map(([key]) => key)
    });

    const startTime = performance.now();
    
    const hasCoordinadorFilter = Boolean(filtro.coordinador);
    const hasOperadorFilter = Boolean(filtro.operador);
    const hasVictimaFilter = Boolean(filtro.victima);
    const hasNumeroFilter = Boolean(filtro.numero);
    const hasDniFilter = Boolean(filtro.dni);
    const hasDelitoFilter = filtro.delito.length > 0;
    const hasDepartamentoFilter = filtro.departamento.length > 0;
    const hasLocalidadFilter = Boolean(filtro.localidad);
    const hasEstadoFilter = filtro.estado && filtro.estado !== 'Todos';
    const hasFechaDesdeFilter = Boolean(filtro.fechaDesde);
    const hasFechaHastaFilter = Boolean(filtro.fechaHasta);
    
    const coordinadorLower = hasCoordinadorFilter ? filtro.coordinador.toLowerCase() : '';
    const operadorLower = hasOperadorFilter ? filtro.operador.toLowerCase() : '';
    const victimaLower = hasVictimaFilter ? filtro.victima.toLowerCase() : '';
    const numeroLower = hasNumeroFilter ? filtro.numero.toLowerCase() : '';
    const dniLower = hasDniFilter ? filtro.dni.toLowerCase() : '';
    const delitosLower = hasDelitoFilter ? filtro.delito.map(d => d.toLowerCase()) : [];
    
    const fechaDesde = hasFechaDesdeFilter ? new Date(filtro.fechaDesde) : null;
    const fechaHasta = hasFechaHastaFilter ? new Date(filtro.fechaHasta) : null;
    
    const filtered = formularios.filter((f) => {
      if (hasCoordinadorFilter && !f.coordinador.toLowerCase().includes(coordinadorLower)) return false;
      if (hasOperadorFilter && !f.operador.toLowerCase().includes(operadorLower)) return false;
      if (hasVictimaFilter && !f.victima.toLowerCase().includes(victimaLower)) return false;
      if (hasNumeroFilter && !f.numero.toLowerCase().includes(numeroLower)) return false;
      if (hasDniFilter && !f.dni?.toLowerCase().includes(dniLower)) return false;
      
      if (hasDelitoFilter) {
        const delitoLower = f.delito?.toLowerCase() || '';
        if (!delitosLower.some(delitoFiltro => delitoLower.includes(delitoFiltro))) return false;
      }
      
      if (hasDepartamentoFilter) {
        if (!filtro.departamento.includes(String(f.departamentoId))) return false;
      }

      if (hasLocalidadFilter && f.localidad !== filtro.localidad) return false;
      if (hasEstadoFilter && f.estado !== filtro.estado) return false;
      
      if (hasFechaDesdeFilter || hasFechaHastaFilter) {
        const fechaFormulario = f.fecha ? new Date(f.fecha) : null;
        if (!fechaFormulario) return false;
        
        if (fechaDesde && fechaFormulario < fechaDesde) return false;
        if (fechaHasta && fechaFormulario > fechaHasta) return false;
      }
      
      return true;
    });
    
    const endTime = performance.now();
    console.log(`✅ Filtering completed in ${(endTime - startTime).toFixed(2)}ms. Found ${filtered.length}/${formularios.length} results`);
    
    return filtered;
  }, [formularios, filtro]);

  const formulariosPagina = useMemo(() => {
    const startIndex = (pagina - 1) * formulariosPorPagina;
    const endIndex = startIndex + formulariosPorPagina;
    return formulariosFiltrados.slice(startIndex, endIndex);
  }, [formulariosFiltrados, pagina, formulariosPorPagina]);

  // ========== TODOS LOS useCallback ==========
  const handleFiltroInputOptimized = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltro((prev) => ({ ...prev, [name]: value }));
    setPagina(1);
  }, []);

  const handleFiltroSelectOptimized = useCallback((event: SelectChangeEvent<string> | { target: { name: string; value: string } }) => {
    const { name, value } = event.target;

    if (value === '__reset__') {
      setFiltro({
        coordinador: '',
        operador: '',
        victima: '',
        numero: '',
        dni: '',
        fechaDesde: '',
        fechaHasta: '',
        estado: 'Todos',
        delito: [],
        departamento: [],
        localidad: '',
      });
      setPagina(1);
      return;
    }

    setFiltro((prev) => ({ ...prev, [name]: value }));
    setPagina(1);
  }, []);

  // ========== FUNCIONES REGULARES ==========
  function EstadoDot({ estado }: { estado: string }) {
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

  const resetFiltros = () => {
    setFiltro(filtrosIniciales);
    setPagina(1);
  };

  const handleFiltroInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dni') {
      const soloNumeros = value.replace(/[^0-9]/g, '');
      setFiltro((prev) => ({ ...prev, [name]: soloNumeros }));
    } else {
      setFiltro((prev) => ({ ...prev, [name]: value }));
    }
    
    setPagina(1);
  };

  const handleFiltroSelect = (
    event: SelectChangeEvent<string> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = event.target;

    if (value === '') {
      setFiltro((prev) => ({
        ...prev,
        [name]: '',
        ...(name === 'departamento' && { localidad: '' }),
      }));
      setPagina(1);
      return;
    }

    setFiltro((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'departamento' && { localidad: '' }),
    }));
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltro({
      coordinador: '',
      operador: '',
      victima: '',
      numero: '',
      dni: '',
      fechaDesde: '',
      fechaHasta: '',
      estado: 'Todos',
      delito: [],
      departamento: [],
      localidad: '',
    });
  };

  const handleImprimirFormularioPDF = () => {
    const win = window.open('/formulario.pdf', '_blank');
    if (win) {
      win.focus();
      win.onload = () => {
        setTimeout(() => {
          win.print();
        }, 500);
      };
    } else {
      alert('No se pudo abrir el PDF');
    }
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
  case 'ver': {
  const url = `/imprimir-formulario?id=${selectedId}&modo=ver`;
  window.open(url, '_blank');
  break;
}


      case 'imprimir': {
  const url = `/imprimir-formulario?id=${selectedId}&modo=imprimir`;
  window.open(url, '_blank');
  break;
}


        case 'descargar':
          router.push(`/imprimir-formulario?id=${selectedId}&modo=descargar`);
          break;

        case 'editar':
          router.push(`/editar-formulario?id=${selectedId}`);
          break;

        case 'listar':
          router.push(`/listar-formularios`);
          break;

        case 'estado': {
          const formulario = formularios.find(f => f.id === selectedId);
          if (formulario?.estado === 'Eliminado') {
            alert('No se puede cambiar el estado de una intervención eliminada');
            break;
          }
          setSeleccionados([selectedId]);
          setOpenEstadoDialog(true);
          break;
        }

        case 'archivar': {
          await archivarIntervencion(Number(selectedId));
          setFormularios(prev =>
            prev.map(f =>
              f.id === selectedId ? { ...f, estado: 'Archivado' as EstadoUI } : f
            )
          );
          break;
        }

        case 'activar': {
          const formulario = formularios.find(f => f.id === selectedId);
          if (formulario?.estado === 'Eliminado') {
            alert('No se puede activar una intervención eliminada');
            break;
          }
          await activarIntervencion(Number(selectedId));
          setFormularios(prev =>
            prev.map(f =>
              f.id === selectedId ? { ...f, estado: 'Activo' as EstadoUI } : f
            )
          );
          router.refresh?.();
          break;
        }

        case 'eliminar': {
          const ok = confirm('¿Seguro que deseas eliminar esta intervención?');
          if (!ok) break;
          await eliminarIntervencionSoft(Number(selectedId));
          setFormularios(prev =>
            prev.map(f =>
              f.id === selectedId ? { ...f, estado: 'Eliminado' as EstadoUI } : f
            )
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

  const handleNuevoCaso = () => {
    router.push('/nuevo-caso');
  };

  const formatearFecha = (fecha: string) => {
    const [a, m, d] = fecha.split('-');
    return `${d}/${m}/${a}`;
  };

  const toggleSeleccionado = (id: string) => {
    const formulario = formularios.find(f => f.id === id);
    if (formulario?.estado === 'Eliminado') {
      return;
    }
    
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleTodos = () => {
    const formulariosSinEliminar = formulariosPagina.filter(f => f.estado !== 'Eliminado');
    
    if (formulariosSinEliminar.every((f) => seleccionados.includes(f.id))) {
      setSeleccionados((prev) => prev.filter((id) => !formulariosSinEliminar.some((f) => f.id === id)));
    } else {
      const nuevosIds = formulariosSinEliminar.map((f) => f.id);
      setSeleccionados((prev) => [...new Set([...prev, ...nuevosIds])]);
    }
  };

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

    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      const cell = (ws as any)[cellRef] || {};
      cell.s = headerStyle;
      (ws as any)[cellRef] = cell;
    }

    const estadoColIdx = 7;
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

  const renderEstadoChip = (estado: string) => {
    const muiColorMap: Record<EstadoUI, 'success' | 'info' | 'default'> = {
      Activo: 'success',
      Archivado: 'info',
      Eliminado: 'default',
    };
    const colorKey = ESTADOS_UI.includes(estado as EstadoUI) ? estado as EstadoUI : 'Eliminado';
    return <Chip label={estado} color={muiColorMap[colorKey] || 'default'} size="small" />;
  };

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

  const confirmarCambioEstado = async () => {
    if (!nuevoEstado || !ESTADOS_SELECCIONABLES.includes(nuevoEstado as EstadoUI)) {
      alert('Estado inválido');
      return;
    }

    const loading = document.createElement('div');
    loading.textContent = `Cambiando estado a "${nuevoEstado}"...`;
    loading.style.cssText = `
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8); color: white; padding: 20px;
      border-radius: 8px; z-index: 9999; font-family: Arial, sans-serif;
    `;
    document.body.appendChild(loading);

    try {
      const idsNumero = seleccionados.map(id => Number(id));
      
      console.log(`Cambiando estado de ${idsNumero.length} intervenciones a "${nuevoEstado}"`);
      await cambiarEstadoMultipleConVerificacion(idsNumero, nuevoEstado);
      
      setFormularios(prev =>
        prev.map(f => (seleccionados.includes(f.id) ? { ...f, estado: nuevoEstado as EstadoUI } : f))
      );
      
      console.log(`Estado cambiado y verificado exitosamente a "${nuevoEstado}"`);
      
      alert(`Estado cambiado exitosamente a "${nuevoEstado}" para ${seleccionados.length} intervenciones`);
      
    } catch (error: any) {
      console.error('Error cambiando estado:', error);
      
      const mensaje = error.message || error.toString();
      alert(
        `Error cambiando estado: ${mensaje}\n\n` +
        `Esto puede indicar que el backend no está persistiendo correctamente los cambios. ` +
        `Verifica que el endpoint esté funcionando correctamente.`
      );
      
      document.body.removeChild(loading);
      return;
    }

    document.body.removeChild(loading);
    setSeleccionados([]);
    setSelectedId(null);
    setNuevoEstado('');
    setOpenEstadoDialog(false);
  };

  // ========== EARLY RETURNS AL FINAL (después de todos los hooks) ==========
  if (loadingUser) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Verificando sesión...</Typography>
      </Box>
    );
  }

  // Si no hay usuario, el useEffect ya redirigió a /login
  if (!user) {
    return null;
  }

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

  // ========== RENDER PRINCIPAL ==========
  return (
    <Box sx={{ p: 4 }}>
      {/* BÚSQUEDA AVANZADA */}
      <BusquedaAvanzada
        filtro={filtro}
        handleFiltroInput={handleFiltroInput}
        handleFiltroSelect={handleFiltroSelect}
        handleExportarExcel={handleExportarExcel}
        EstadoDot={EstadoDot}
        onReset={resetFiltros}
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
          variant="contained"
          color="success"
          onClick={handleImprimirFormularioPDF}
          startIcon={<PrintIcon />}
          sx={{
            backgroundColor: '#43a047',
            color: '#fff',
            fontWeight: 'bold',
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': { backgroundColor: '#388e3c' },
          }}
        >
          Imprimir Formulario en Blanco
        </Button>
      </Box>

      <Box display="flex" justifyContent="flex-start" mb={2} gap={2}>
        {!loadingUser && user?.rol === 'admin' && (
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
        )}

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

      {/* DIALOG CAMBIAR ESTADO */}
      <DialogCambiarEstado
        open={openEstadoDialog}
        onClose={() => setOpenEstadoDialog(false)}
        onConfirmar={confirmarCambioEstado}
        nuevoEstado={nuevoEstado}
        setNuevoEstado={setNuevoEstado}
        EstadoDot={EstadoDot}
        estadosDisponibles={ESTADOS_SELECCIONABLES}
      />
    </Box>
  );
}