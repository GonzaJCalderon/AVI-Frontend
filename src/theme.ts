// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6d44b8' },
    secondary: { main: '#00796b' },
    background: { default: '#fafafa' },
  },
  shape: { borderRadius: 8 },
});

export default theme;
