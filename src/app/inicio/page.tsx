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

import { departments, delitos, estados } from '@/utils/constants';

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

import { listarIntervenciones, IntervencionItem } from '@/services/intervenciones';

type Formulario = {
  id: string;
  coordinador: string;
  operador: string;
  victima: string;
  numero: string;
  dni: string;
  fecha: string;
  estado: string;
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
  const [nuevoEstado, setNuevoEstado] = useState('');

  // Carga real desde /api/intervenciones
  useEffect(() => {
    const load = async () => {
      setCargando(true);
      setError(null);
      try {
        const data: IntervencionItem[] = await listarIntervenciones();
        // console.log('[DEBUG] Respuesta del backend:', data);

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

          const dniParsed = victima?.dni || '—';
          const victimaNombre = victima?.nombre || '—';

          return {
            id: String(it.id),
            coordinador: it.coordinador || '—',
            operador: it.operador || '—',
            victima: victimaNombre,
            numero: it.numero_intervencion || '—',
            dni: dniParsed,
            fecha: new Date(it.fecha).toISOString().slice(0, 10),
            estado: 'Pendiente',
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

  // ÚNICA declaración, se usa en toda la página y para Excel
  const estadoColorMap: Record<string, string> = {
    Pendiente: '#FBC02D',
    Finalizado: '#4CAF50',
    Archivado: '#2196F3',
  };

  function EstadoDot({ estado }: { estado: string }) {
    return (
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: estadoColorMap[estado] || 'grey.500',
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
    if (seleccionados.length === 0) return;
    seleccionados.forEach((id) => {
      window.open(`/imprimir-formulario?id=${id}`, '_blank');
    });
  };

  const handleEliminarSeleccionados = () => {
    if (seleccionados.length === 0) return;
    const confirmado = confirm(`¿Seguro que deseas eliminar ${seleccionados.length} formularios?`);
    if (!confirmado) return;
    setFormularios((prev) => prev.filter((f) => !seleccionados.includes(f.id)));
    setSeleccionados([]);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleAccion = (accion: string) => {
    if (!selectedId) return;
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
        setSeleccionados([selectedId]);
        setOpenEstadoDialog(true);
        break;
    }
    handleCloseMenu();
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
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleTodos = () => {
    if (formulariosPagina.every((f) => seleccionados.includes(f.id))) {
      setSeleccionados((prev) => prev.filter((id) => !formulariosPagina.some((f) => f.id === id)));
    } else {
      const nuevosIds = formulariosPagina.map((f) => f.id);
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
          const hex = (estadoColorMap[estado] || '#9E9E9E').replace('#', '').toUpperCase();
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
    const colorMap: Record<'Pendiente' | 'Finalizado' | 'Archivado' | string, any> = {
      Pendiente: 'warning',
      Finalizado: 'success',
      Archivado: 'info',
    };
    const color = colorMap[estado] || 'default';
    return <Chip label={estado} color={color} size="small" />;
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
    setOpenEstadoDialog(true);
  };

  const confirmarCambioEstado = () => {
    if (!nuevoEstado || !estados.includes(nuevoEstado)) {
      alert('Estado inválido');
      return;
    }

    setFormularios((prev) => prev.map((f) => (seleccionados.includes(f.id) ? { ...f, estado: nuevoEstado } : f)));

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
 <Paper id="busqueda-avanzada" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Búsqueda avanzada
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Coordinador"
              name="coordinador"
              value={filtro.coordinador}
              onChange={handleFiltroInput}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Operador" name="operador" value={filtro.operador} onChange={handleFiltroInput} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Víctima" name="victima" value={filtro.victima} onChange={handleFiltroInput} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Número" name="numero" value={filtro.numero} onChange={handleFiltroInput} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="DNI" name="dni" value={filtro.dni} onChange={handleFiltroInput} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="delito-label">Delito</InputLabel>
              <Select
                labelId="delito-label"
                label="Delito"
                name="delito"
                value={filtro.delito}
                onChange={handleFiltroSelect}
              >
                <MenuItem value="">Todos</MenuItem>
                {delitos.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="departamento-label">Departamento</InputLabel>
              <Select
                labelId="departamento-label"
                label="Departamento"
                name="departamento"
                value={filtro.departamento}
                onChange={handleFiltroSelect}
              >
                <MenuItem value="">Todos</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select
                labelId="estado-label"
                label="Estado"
                name="estado"
                value={filtro.estado}
                onChange={handleFiltroSelect}
                renderValue={(selected) => {
                  if (selected === 'Todos' || selected === '') return 'Todos';
                  return (
                    <Box display="flex" alignItems="center" gap={1}>
                      <EstadoDot estado={selected as string} />
                      {selected as string}
                    </Box>
                  );
                }}
              >
                <MenuItem value="Todos">Todos</MenuItem>
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
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Fecha desde"
              name="fechaDesde"
              value={filtro.fechaDesde}
              onChange={handleFiltroInput}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Fecha hasta"
              name="fechaHasta"
              value={filtro.fechaHasta}
              onChange={handleFiltroInput}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button fullWidth variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportarExcel}>
              Exportar Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Formularios encontrados
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={seleccionados.length > 0 && seleccionados.length < formulariosPagina.length}
                    checked={formulariosPagina.length > 0 && seleccionados.length === formulariosPagina.length}
                    onChange={toggleTodos}
                  />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Coordinador</TableCell>
                <TableCell>Operador</TableCell>
                <TableCell>Víctima(s)</TableCell>
                <TableCell>Número</TableCell>
                <TableCell>DNI</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Delito</TableCell>
                <TableCell>Departamento</TableCell>
                {/* <TableCell>Resumen</TableCell> */}
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {formulariosPagina.map((f) => (
                <TableRow key={f.id}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={seleccionados.includes(f.id)} onChange={() => toggleSeleccionado(f.id)} />
                  </TableCell>
                  <TableCell>{f.id}</TableCell>
                  <TableCell>{f.coordinador}</TableCell>
                  <TableCell>{f.operador}</TableCell>
                  <TableCell>{f.victima}</TableCell>
                  <TableCell>{f.numero}</TableCell>
                  <TableCell>{f.dni}</TableCell>
                  <TableCell>{formatearFecha(f.fecha)}</TableCell>
                  <TableCell>{renderEstadoChip(f.estado)}</TableCell>
                  <TableCell>{f.delito}</TableCell>
                  <TableCell>{f.departamento}</TableCell>
                  {/* <TableCell>{renderResumen(f)}</TableCell> */}
                  <TableCell align="center">
                    <IconButton onClick={(e) => handleOpenMenu(e, f.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(formulariosFiltrados.length / formulariosPorPagina)}
            page={pagina}
            onChange={(_, value) => setPagina(value)}
            color="primary"
          />
        </Box>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          <MenuItem onClick={() => handleAccion('ver')}>Ver</MenuItem>
          <MenuItem onClick={() => handleAccion('editar')}>Editar</MenuItem>
          <MenuItem onClick={() => handleAccion('imprimir')}>Imprimir</MenuItem>
          <MenuItem onClick={() => handleAccion('estado')}>Cambiar estado</MenuItem>
          <MenuItem onClick={() => handleAccion('listar')}>Listar Todos</MenuItem>
        </Menu>
      </Paper>

      <Dialog open={openEstadoDialog} onClose={() => setOpenEstadoDialog(false)}>
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
              onChange={(e) => setNuevoEstado(e.target.value as string)}
              renderValue={(selected) =>
                selected ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <EstadoDot estado={selected as string} />
                    {selected as string}
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
          <Button onClick={() => setOpenEstadoDialog(false)}>Cancelar</Button>
          <Button onClick={confirmarCambioEstado} variant="contained" disabled={!nuevoEstado}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
