'use client';
import { useEffect, useState } from 'react';
import { listarNoActivas, IntervencionItem } from '@/services/intervenciones';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

export default function IntervencionesNoActivasPage() {
  const [data, setData] = useState<IntervencionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await listarNoActivas();
        setData(res);
      } catch (e: any) {
        setError(e?.message || 'Error al obtener no activas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Box p={4}><CircularProgress/></Box>;
  if (error) return <Box p={4}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>Intervenciones No Activas</Typography>
      <Paper sx={{p:2}}>
        {data.length === 0 ? (
          <Typography color="text.secondary">Sin resultados</Typography>
        ) : (
          data.map(i => (
            <Box key={i.id} sx={{py:1, borderBottom: '1px solid #eee'}}>
              <Typography><b>#{i.numero_intervencion}</b> — {i.coordinador ?? '—'} — {new Date(i.fecha).toLocaleDateString('es-AR')}</Typography>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}
