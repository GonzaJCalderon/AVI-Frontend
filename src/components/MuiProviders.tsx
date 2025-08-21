'use client';

import { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ClientShell from './ClientShell';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6d44b8' },   // tu violeta
    secondary: { main: '#00796b' }, // tu verde
    background: { default: '#fafafa' },
  },
  typography: {
    // Usa Poppins: el <body> ya tiene la clase de next/font, pero dejamos el fallback
    fontFamily: '"Poppins","Helvetica","Arial",sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 700 } },
    },
    MuiChip: {
      styleOverrides: { label: { fontWeight: 700 } },
    },
  },
});

export default function MuiProviders({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ClientShell>{children}</ClientShell>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
