import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#10b981' : '#059669',
      light: mode === 'dark' ? '#34d399' : '#10b981',
      dark: mode === 'dark' ? '#059669' : '#047857',
    },
    secondary: {
      main: mode === 'dark' ? '#8b5cf6' : '#7c3aed',
      light: mode === 'dark' ? '#a78bfa' : '#8b5cf6',
      dark: mode === 'dark' ? '#7c3aed' : '#6d28d9',
    },
    background: {
      default: mode === 'dark' ? '#050505' : '#f8fafc',
      paper: mode === 'dark' ? '#111111' : '#ffffff',
      glass: mode === 'dark' ? 'rgba(10, 10, 10, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#0f172a',
      secondary: mode === 'dark' ? '#cbd5e1' : '#475569',
    },
    error: {
      main: mode === 'dark' ? '#f87171' : '#ef4444',
    },
    warning: {
      main: mode === 'dark' ? '#fbbf24' : '#f59e0b',
    },
    success: {
      main: mode === 'dark' ? '#34d399' : '#10b981',
    },
    info: {
      main: mode === 'dark' ? '#60a5fa' : '#3b82f6',
    },
    divider: mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.12)',
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 500,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'dark' 
              ? '0 8px 16px rgba(0, 0, 0, 0.4)' 
              : '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.4)' 
            : 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(24px) saturate(200%)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.05)' 
            : '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.2)'
            : '0 8px 32px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'dark' 
            ? 'rgba(30, 41, 59, 0.3)' 
            : 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(30px) saturate(200%)',
          border: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.08)' 
            : '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: 24,
          boxShadow: mode === 'dark'
            ? '0 12px 40px rgba(0, 0, 0, 0.3)'
            : '0 12px 40px rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'dark' 
            ? 'rgba(15, 23, 42, 0.6)' 
            : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderBottom: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.08)' 
            : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: 'none',
          color: mode === 'dark' ? '#f1f5f9' : '#0f172a',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.5)' 
              : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: mode === 'dark' 
                ? 'rgba(15, 23, 42, 0.7)' 
                : 'rgba(255, 255, 255, 0.7)',
            },
          },
        },
      },
    },
  },
});
