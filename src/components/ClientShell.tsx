'use client';

import * as React from 'react';
import { Box } from '@mui/material';

type Props = { children: React.ReactNode };

export default function ClientShell({ children }: Props) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  );
}
