import { createTheme, alpha } from '@mui/material/styles';

export const billingTheme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
      light: '#34495e',
      dark: '#1a2639',
      gradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
    },
    secondary: {
      main: '#e67e22',
      light: '#f39c12',
      dark: '#d35400',
      gradient: 'linear-gradient(135deg, #e67e22 0%, #f1c40f 100%)',
    },
    success: {
      main: '#27ae60',
      light: '#2ecc71',
      dark: '#229954',
      gradient: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
    },
    warning: {
      main: '#f39c12',
      light: '#f1c40f',
      dark: '#e67e22',
      gradient: 'linear-gradient(135deg, #f39c12 0%, #f1c40f 100%)',
    },
    error: {
      main: '#e74c3c',
      light: '#e67e22',
      dark: '#c0392b',
      gradient: 'linear-gradient(135deg, #e74c3c 0%, #e67e22 100%)',
    },
    info: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2980b9',
      gradient: 'linear-gradient(135deg, #3498db 0%, #5dade2 100%)',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
      gradient: 'radial-gradient(circle at 10% 20%, rgba(44, 62, 80, 0.02) 0%, rgba(52, 152, 219, 0.02) 100%)',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', 'Segoe UI', sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 4px 6px -1px rgba(0,0,0,0.1)',
    '0 10px 15px -3px rgba(0,0,0,0.1)',
    '0 20px 25px -5px rgba(0,0,0,0.1)',
    '0 25px 35px -12px rgba(0,0,0,0.25)',
    '0 30px 40px -15px rgba(0,0,0,0.3)',
    '0 35px 45px -18px rgba(0,0,0,0.35)',
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 20px 35px -12px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});