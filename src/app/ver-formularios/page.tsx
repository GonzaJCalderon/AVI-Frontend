'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { obtenerIntervencion } from '@/services/intervenciones';
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';

export default function VerFormulariosPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [intervencion, setIntervencion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('ID no provisto');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await obtenerIntervencion(Number(id));
        console.log('[DEBUG] Intervención:', response);
        setIntervencion(response);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la intervención');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatFecha = (input?: string) => {
    if (!input) return '—';
    const d = new Date(input);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString('es-AR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
  };

  const renderChips = (obj: any) =>
    Object.entries(obj)
      .filter(([k, v]) => typeof v === 'boolean' && v)
      .map(([k]) => (
        <Chip key={k} label={k} size="small" sx={{ mr: 1, mb: 1 }} />
      ));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
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

  if (!intervencion) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No se encontró la intervención.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4, maxWidth: 1000, margin: 'auto' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Intervención #{intervencion.numero_intervencion}
        </Typography>

        <Typography><strong>Coordinador:</strong> {intervencion.coordinador}</Typography>
        <Typography><strong>Operador:</strong> {intervencion.operador}</Typography>
        <Typography><strong>Fecha:</strong> {formatFecha(intervencion.fecha)}</Typography>

        <Divider sx={{ my: 3 }} />

        {/* Derivaciones */}
        <Typography variant="h6" gutterBottom><strong>Derivación</strong></Typography>
        {intervencion.derivaciones?.map((d: any) => (
          <Box key={d.id} mb={2}>
            <Typography><strong>Derivador:</strong> {d.derivador}</Typography>
            <Typography><strong>Tipo:</strong> {d.tipo_derivaciones?.descripcion}</Typography>
            <Typography><strong>Fecha:</strong> {formatFecha(d.fecha_derivacion)}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Hechos Delictivos */}
        <Typography variant="h6" gutterBottom><strong>Hechos Delictivos</strong></Typography>
        {intervencion.hechos_delictivos?.map((h: any) => (
          <Box key={h.id} mb={2}>
            <Typography><strong>Expediente:</strong> {h.expediente}</Typography>
            <Typography><strong>Agresores:</strong> {h.num_agresores}</Typography>
            <Typography><strong>Ubicación:</strong> {h.geo?.[0]?.domicilio} — {h.geo?.[0]?.departamentos?.descripcion}</Typography>
            <Typography><strong>Tipo de hecho:</strong></Typography>
            {renderChips(h.relaciones?.[0] || {})}
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Víctimas */}
        <Typography variant="h6" gutterBottom><strong>Víctimas</strong></Typography>
        {intervencion.victimas?.map((v: any) => (
          <Box key={v.id} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <Typography><strong>Nombre:</strong> {v.nombre}</Typography>
            <Typography><strong>DNI:</strong> {v.dni}</Typography>
            <Typography><strong>Género:</strong> {v.generos?.descripcion}</Typography>
            <Typography><strong>Nacimiento:</strong> {formatFecha(v.fecha_nacimiento)}</Typography>
            <Typography><strong>Teléfono:</strong> {v.telefono}</Typography>
            <Typography><strong>Ocupación:</strong> {v.ocupacion}</Typography>
            <Typography><strong>Dirección:</strong> {v.direccion?.calle_nro}, {v.direccion?.barrio}</Typography>

            {v.personas_entrevistadas?.map((p: any) => (
              <Box key={p.id} mt={1}>
                <Typography variant="subtitle2">Persona Entrevistada:</Typography>
                <Typography><strong>Nombre:</strong> {p.nombre}</Typography>
                <Typography><strong>Relación:</strong> {p.relacion_victima}</Typography>
                <Typography><strong>Dirección:</strong> {p.direccion?.calle_nro}, {p.direccion?.barrio}</Typography>
              </Box>
            ))}
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Abusos Sexuales */}
        <Typography variant="h6" gutterBottom><strong>Abuso Sexual</strong></Typography>
        {intervencion.abusos_sexuales?.map((a: any) => (
          <Box key={a.id}>
            <Typography><strong>Tipo:</strong> {a.tipo_abuso === 1 ? 'Agravado' : 'Simple'}</Typography>
            <Typography><strong>Kit:</strong> {a.datos?.[0]?.kit || '—'}</Typography>
            <Typography><strong>Relación:</strong> {a.datos?.[0]?.relacion || '—'}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Acciones de Primera Línea */}
        <Typography variant="h6" gutterBottom><strong>Acciones de Primera Línea</strong></Typography>
        {intervencion.acciones_primera_linea?.map((a: any) => (
          <Typography key={a.id}>{a.acciones}</Typography>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Tipos de Intervención */}
        <Typography variant="h6" gutterBottom><strong>Tipo de Intervención</strong></Typography>
        {intervencion.intervenciones_tipo?.map((t: any) => (
          <Box key={t.id}>
            {renderChips(t)}
          </Box>
        ))}

        <Divider sx={{ my: 3 }} />

        {/* Seguimientos */}
        <Typography variant="h6" gutterBottom><strong>Seguimiento</strong></Typography>
        {intervencion.seguimientos?.map((s: any) => (
          <Box key={s.id}>
            <Typography><strong>Hubo seguimiento:</strong> {s.hubo ? 'Sí' : 'No'}</Typography>

            {s.tipo?.[0] && (
              <>
                <Typography><strong>Tipos:</strong></Typography>
                {renderChips(s.tipo[0])}
              </>
            )}
            {s.detalles?.[0]?.detalle && (
              <>
                <Typography mt={1}><strong>Detalle:</strong></Typography>
                <Typography>{s.detalles[0].detalle}</Typography>
              </>
            )}
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
