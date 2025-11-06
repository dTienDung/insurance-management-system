import { createTheme } from '@mui/material/styles';

export const pjicoTheme = createTheme({
  palette: {
    primary: {
      main: '#0066cc',  // PJICO Blue
      light: '#3385d6',
      dark: '#004d99',
    },
    secondary: {
      main: '#004d99',
    },
    success: {
      main: '#52c41a',
    },
    warning: {
      main: '#faad14',
    },
    error: {
      main: '#ff4d4f',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});