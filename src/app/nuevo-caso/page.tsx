'use client';

import { useMemo } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const LEGACY_FORM_URL =
  process.env.NEXT_PUBLIC_LEGACY_FORM_URL ||
  'http://10.100.1.80/avd/formulario_asistencia_victimas.html';

export default function NuevoCasoPage() {
  // Si en un futuro lo pasás a .env, queda centralizado
  const formUrl = useMemo(() => LEGACY_FORM_URL, []);

  const abrirEnNuevaPestana = () => {
    window.open(formUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Nuevo Caso
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completa el formulario legado. Si no se muestra embebido, abrilo en una pestaña nueva.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<OpenInNewIcon />}
          onClick={abrirEnNuevaPestana}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Abrir en pestaña nueva
        </Button>
      </Paper> */}

      {/* Contenedor del iframe */}
      <Box
        sx={{
          height: 'calc(100vh - 180px)', // ajuste para dejar visible la barra y el header
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <iframe
          title="Formulario Asistencia a Víctimas"
          src={formUrl}
          style={{ width: '100%', height: '100%', border: '0' }}
          // Nota: onError en iframe no siempre dispara. Dejamos el botón como fallback visible arriba.
        />
      </Box>
    </Box>
  );
}
