'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Button,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  TableSortLabel,
  Pagination
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { listarIntervenciones, IntervencionItem } from '@/services/intervenciones';
import { normalizeEstado, type EstadoUI, estadoColorMap } from '@/utils/constants';

// Tipo mejorado basado en la respuesta real de la API
type FormularioDisplay = {
  id: string;
  numero: string;
  coordinador: string;
  operador: string;
  victima: string;
  fecha: string;
  estado: EstadoUI;
  delito: string;
  departamento: string;
  reseña: string; // Nueva columna agregada
  counts: {
    derivaciones: number;
    hechos_delictivos: number;
    victimas: number;
    seguimientos: number;
  };
};

// Configuración de paginación y filtros
const ITEMS_PER_PAGE = 10;
const MAX_RESEÑA_LENGTH = 100;

// Tipos para ordenamiento
type SortField = keyof FormularioDisplay | 'counts';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export default function ListarFormulariosPage() {
  const [formularios, setFormularios] = useState<FormularioDisplay[]>([]);
  const [filteredFormularios, setFilteredFormularios] = useState<FormularioDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReseña, setSelectedReseña] = useState<{ titulo: string; contenido: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'fecha', direction: 'desc' });
  const router = useRouter();

  // Función para truncar texto de reseña
  const truncateText = useCallback((text: string, maxLength: number = MAX_RESEÑA_LENGTH): string => {
    if (!text) return 'Sin reseña';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  // Función para obtener datos mejorada
  const obtenerDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Obteniendo intervenciones desde la API...');
      const data: IntervencionItem[] = await listarIntervenciones();
      console.log('Datos recibidos:', data);
      
      // Transformar los datos con la nueva columna de reseña
      const formulariosTransformados: FormularioDisplay[] = data.map((item) => {
  const victima = item.victimas?.[0];

  // Extraer relaciones delictivas (delitos)
  const relaciones = item.hechos_delictivos?.[0]?.relaciones || [];
  const delitos: string[] = relaciones.flatMap(rel => 
    Object.entries(rel)
      .filter(([key, value]) => 
        typeof value === 'boolean' && value === true && key !== 'id' && key !== 'hecho_delictivo_id'
      )
      .map(([key]) => key.replace(/_/g, ' '))
  );
  const delitoParsed = delitos.length > 0 ? delitos.join(', ') : 'No especificado';

  // Extraer departamento
  const departamento =
    item.hechos_delictivos?.[0]?.geo?.[0]?.departamentos?.descripcion || 'No especificado';

  return {
    id: String(item.id),
    numero: item.numero_intervencion || 'Sin número',
    coordinador: item.coordinador || 'No asignado',
    operador: item.operador || 'No asignado',
    victima: victima?.nombre || 'No registrada',
    fecha: new Date(item.fecha).toISOString().slice(0, 10),
    estado: normalizeEstado(item.estado, item.eliminado),
    delito: delitoParsed,
    departamento: departamento,
    reseña: item.reseña_hecho || 'Sin reseña',
    counts: {
      derivaciones: item.derivaciones?.length ?? 0,
      hechos_delictivos: item.hechos_delictivos?.length ?? 0,
      victimas: item.victimas?.length ?? 0,
      seguimientos: item.seguimientos?.length ?? 0,
    },
  };
});


      setFormularios(formulariosTransformados);
      console.log(`Cargados ${formulariosTransformados.length} formularios`);
      
    } catch (err: any) {
      console.error('Error obteniendo intervenciones:', err);
      
      let mensajeError = 'Error desconocido';
      if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        mensajeError = 'Error de autenticación. Por favor inicia sesión nuevamente.';
      } else if (err.message?.includes('Network Error') || err.message?.includes('fetch')) {
        mensajeError = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (err.message?.includes('500')) {
        mensajeError = 'Error interno del servidor. Inténtalo más tarde.';
      } else if (err.message) {
        mensajeError = err.message;
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  // Función de filtrado mejorada
  const filtrarFormularios = useCallback((formularios: FormularioDisplay[], term: string) => {
    if (!term.trim()) return formularios;
    
    const searchTerm = term.toLowerCase().trim();
    return formularios.filter(formulario => 
      formulario.numero.toLowerCase().includes(searchTerm) ||
      formulario.coordinador.toLowerCase().includes(searchTerm) ||
      formulario.operador.toLowerCase().includes(searchTerm) ||
      formulario.victima.toLowerCase().includes(searchTerm) ||
      formulario.delito.toLowerCase().includes(searchTerm) ||
      formulario.departamento.toLowerCase().includes(searchTerm) ||
      formulario.reseña.toLowerCase().includes(searchTerm) ||
      formulario.estado.toLowerCase().includes(searchTerm)
    );
  }, []);

  // Función de ordenamiento
  const sortFormularios = useCallback((formularios: FormularioDisplay[], config: SortConfig) => {
    return [...formularios].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (config.field === 'counts') {
        // Ordenar por total de conteos
        aValue = Object.values(a.counts).reduce((sum, val) => sum + val, 0);
        bValue = Object.values(b.counts).reduce((sum, val) => sum + val, 0);
      } else if (config.field === 'fecha') {
        aValue = new Date(a[config.field]).getTime();
        bValue = new Date(b[config.field]).getTime();
      } else {
        aValue = a[config.field];
        bValue = b[config.field];
      }

      if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, []);

  // Datos procesados con filtro y ordenamiento
  const processedData = useMemo(() => {
    const filtered = filtrarFormularios(formularios, searchTerm);
    const sorted = sortFormularios(filtered, sortConfig);
    
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginated = sorted.slice(startIndex, endIndex);
    
    return {
      items: paginated,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE)
    };
  }, [formularios, searchTerm, sortConfig, currentPage, filtrarFormularios, sortFormularios]);

  // Manejadores de eventos
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset a primera página
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  }, []);

  const handleViewReseña = useCallback((formulario: FormularioDisplay) => {
    setSelectedReseña({
      titulo: `Reseña - ${formulario.numero}`,
      contenido: formulario.reseña || 'Sin reseña disponible'
    });
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedReseña(null);
  }, []);

  // Función para formatear fecha
  const formatearFecha = useCallback((fecha: string) => {
    try {
      const [a, m, d] = fecha.split('-');
      return `${d}/${m}/${a}`;
    } catch {
      return fecha;
    }
  }, []);

  // Función para renderizar chip de estado
  const renderEstadoChip = useCallback((estado: EstadoUI) => {
    const colorMap: Record<EstadoUI, 'success' | 'info' | 'default'> = {
      Activo: 'success',
      Archivado: 'info',
      Eliminado: 'default',
    };
    
    return (
      <Chip 
        label={estado} 
        color={colorMap[estado] || 'default'} 
        size="small"
        sx={{ fontWeight: 'bold' }}
      />
    );
  }, []);

  // Función para renderizar conteos
  const renderCounts = useCallback((counts: FormularioDisplay['counts']) => {
    const totalCount = Object.values(counts).reduce((sum, val) => sum + val, 0);
    
    return (
      <Tooltip 
        title={
          <Box>
            <Typography variant="caption" display="block">Derivaciones: {counts.derivaciones}</Typography>
            <Typography variant="caption" display="block">Hechos: {counts.hechos_delictivos}</Typography>
            <Typography variant="caption" display="block">Víctimas: {counts.victimas}</Typography>
            <Typography variant="caption" display="block">Seguimientos: {counts.seguimientos}</Typography>
          </Box>
        }
        arrow
      >
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', cursor: 'pointer' }}>
          <Chip 
            label={`Total: ${totalCount}`} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
          <Chip label={`D:${counts.derivaciones}`} size="small" variant="outlined" />
          <Chip label={`H:${counts.hechos_delictivos}`} size="small" variant="outlined" />
          <Chip label={`V:${counts.victimas}`} size="small" variant="outlined" />
          <Chip label={`S:${counts.seguimientos}`} size="small" variant="outlined" />
        </Box>
      </Tooltip>
    );
  }, []);

  // Función para renderizar reseña con vista previa
  const renderReseña = useCallback((formulario: FormularioDisplay) => {
    const hasReseña = formulario.reseña && formulario.reseña !== 'Sin reseña';
    
    if (!hasReseña) {
      return (
        <Typography variant="body2" color="text.disabled" fontStyle="italic">
          Sin reseña
        </Typography>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: 200 }}>
        <Tooltip title={formulario.reseña} arrow>
          <Typography 
            variant="body2" 
            sx={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              cursor: 'pointer'
            }}
            onClick={() => handleViewReseña(formulario)}
          >
            {truncateText(formulario.reseña, 80)}
          </Typography>
        </Tooltip>
        {formulario.reseña.length > 80 && (
          <IconButton 
            size="small" 
            onClick={() => handleViewReseña(formulario)}
            sx={{ p: 0.5 }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  }, [handleViewReseña, truncateText]);

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Listado Completo de Intervenciones
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={obtenerDatos} 
              variant="outlined" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : undefined}
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button onClick={() => router.back()} variant="outlined">
              ← Volver
            </Button>
          </Box>
        </Box>

        {/* Barra de búsqueda y filtros */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por número, coordinador, operador, víctima, delito, departamento o reseña..."
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 300, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Chip 
            icon={<FilterIcon />}
            label={`${processedData.totalItems} registros`}
            variant="outlined"
            color="primary"
          />
        </Box>

        {/* Estados de carga y error */}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Box textAlign="center">
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography color="text.secondary">Cargando intervenciones...</Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} action={
            <Button color="inherit" size="small" onClick={obtenerDatos}>
              Reintentar
            </Button>
          }>
            <Typography variant="subtitle1" fontWeight="bold">
              Error al cargar los datos
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        )}

        {!loading && !error && formularios.length === 0 && (
          <Alert severity="info">
            No se encontraron intervenciones registradas.
          </Alert>
        )}

        {/* Tabla de datos */}
        {!loading && !error && formularios.length > 0 && (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {processedData.items.length} de {processedData.totalItems} intervenciones
                {searchTerm && ` (filtradas de ${formularios.length} totales)`}
              </Typography>
            </Box>
            
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table sx={{ minWidth: 1200 }} stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.field === 'id'}
                        direction={sortConfig.field === 'id' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('id')}
                      >
                        <strong>ID</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.field === 'numero'}
                        direction={sortConfig.field === 'numero' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('numero')}
                      >
                        <strong>Número</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.field === 'coordinador'}
                        direction={sortConfig.field === 'coordinador' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('coordinador')}
                      >
                        <strong>Coordinador</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.field === 'operador'}
                        direction={sortConfig.field === 'operador' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('operador')}
                      >
                        <strong>Operador</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.field === 'victima'}
                        direction={sortConfig.field === 'victima' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('victima')}
                      >
                        <strong>Víctima</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.field === 'fecha'}
                        direction={sortConfig.field === 'fecha' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('fecha')}
                      >
                        <strong>Fecha</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.field === 'estado'}
                        direction={sortConfig.field === 'estado' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('estado')}
                      >
                        <strong>Estado</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.field === 'delito'}
                        direction={sortConfig.field === 'delito' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('delito')}
                      >
                        <strong>Delito</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.field === 'departamento'}
                        direction={sortConfig.field === 'departamento' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('departamento')}
                      >
                        <strong>Departamento</strong>
                      </TableSortLabel>
                    </TableCell>
                    {/* Nueva columna de reseñas */}
                    <TableCell sx={{ minWidth: 200 }}>
                      <TableSortLabel
                        active={sortConfig.field === 'reseña'}
                        direction={sortConfig.field === 'reseña' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('reseña')}
                      >
                        <strong>Reseña del Hecho</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.field === 'counts'}
                        direction={sortConfig.field === 'counts' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('counts')}
                      >
                        <strong>Conteos</strong>
                      </TableSortLabel>
                    </TableCell>
                     <TableCell align="center">
      <strong>Ver</strong>
    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processedData.items.map((formulario) => (
                    <TableRow 
                      key={formulario.id}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: 'grey.25' },
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formulario.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {formulario.numero}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formulario.coordinador}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formulario.operador}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formulario.victima}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {formatearFecha(formulario.fecha)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {renderEstadoChip(formulario.estado)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={formulario.delito} arrow>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 150, 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {formulario.delito}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formulario.departamento}
                        </Typography>
                      </TableCell>
                      {/* Nueva celda de reseñas */}
                      <TableCell sx={{ minWidth: 200 }}>
                        {renderReseña(formulario)}
                      </TableCell>
                      <TableCell>
                        {renderCounts(formulario.counts)}
                      </TableCell>
                       <TableCell align="center">
        <Tooltip title="Ver detalle" arrow>
          <IconButton 
            color="primary" 
         onClick={() => router.push(`/ver-formularios?id=${formulario.id}`)}

          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            {processedData.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={processedData.totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}

        {/* Dialog para ver reseña completa */}
        <Dialog 
          open={!!selectedReseña} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {selectedReseña?.titulo}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                pt: 1
              }}
            >
              {selectedReseña?.contenido}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}