'use client';

import { useEffect, useState } from 'react';
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
  Button
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { departments, delitos, ESTADOS_UI } from '@/utils/constants';
import { apiFetch } from '@/services/api';

type Formulario = {
  id: string;
  nombre: string;
  apellido: string;
  numero: string;
  fecha: string;
  estado: string;
  delito: string;
  departamento: string;
};

export default function ListarFormulariosPage() {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

 useEffect(() => {
  const obtenerDatos = async () => {
    try {
      const response = await apiFetch<{ data: Formulario[] }>('/intervenciones');
      console.log('✅ Respuesta de /intervenciones:', response);
      setFormularios(response.data ?? []);
    } catch (err: any) {
      console.log('[Mock] Backend no disponible, usando datos locales');
      setFormularios([
        {
          id: '1',
          nombre: 'Juan',
          apellido: 'Pérez',
          numero: 'F123',
          fecha: '2025-07-20',
          estado: 'Pendiente',
          delito: 'Robo',
          departamento: 'Capital'
        },
        {
          id: '2',
          nombre: 'Ana',
          apellido: 'Gómez',
          numero: 'F456',
          fecha: '2025-07-21',
          estado: 'Finalizado',
          delito: 'Estafa',
          departamento: 'Guaymallén'
        }
      ]);
      setError('No se pudo conectar al backend. Mostrando datos simulados.');
    } finally {
      setLoading(false);
    }
  };

  obtenerDatos();
}, []);


  const formatearFecha = (fecha: string) => {
    const [a, m, d] = fecha.split('-');
    return `${d}/${m}/${a}`;
  };

  const getEstadoColor = (estado: string): string => {
    switch (estado) {
      case 'Finalizado':
        return 'success.main';
      case 'Pendiente':
        return 'warning.main';
      case 'Eliminado':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Listado de Formularios
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        {!loading && formularios.length === 0 && (
          <Typography>No se encontraron formularios.</Typography>
        )}

        {!loading && formularios.length > 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Delito</TableCell>
                  <TableCell>Departamento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formularios.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.id}</TableCell>
                    <TableCell>{f.nombre}</TableCell>
                    <TableCell>{f.apellido}</TableCell>
                    <TableCell>{f.numero}</TableCell>
                    <TableCell>{formatearFecha(f.fecha)}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color={getEstadoColor(f.estado)}>
                        {f.estado}
                      </Typography>
                    </TableCell>
                    <TableCell>{f.delito}</TableCell>
                    <TableCell>{f.departamento}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display="flex" justifyContent="flex-start" mt={3}>
          <Button onClick={() => router.back()} variant="text">
            ← Volver
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
