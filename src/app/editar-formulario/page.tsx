'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import EditarFormularioVictima from '@/components/EditarFormularioVictima';
import { IntervencionItem, obtenerIntervencionPorId } from '@/services/intervenciones';

import { CircularProgress, Box, Alert } from '@mui/material';



export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [data, setData] = useState<IntervencionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No se proporcionó ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const intervencion = await obtenerIntervencionPorId(Number(id));
        setData(intervencion);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 5 }}>
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  return <EditarFormularioVictima selected={data} />;
}
