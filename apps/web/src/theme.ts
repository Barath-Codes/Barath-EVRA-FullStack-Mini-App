import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6C63FF',
      light: '#8B83FF',
      dark: '#4A42D4',
    },
    secondary: {
      main: '#00E5A0',
      light: '#33EBB3',
      dark: '#00B37D',
    },
    error: {
      main: '#FF5C5C',
      light: '#FF7D7D',
      dark: '#D44848',
    },
    warning: {
      main: '#FFB347',
      light: '#FFC56C',
      dark: '#D49038',
    },
    success: {
      main: '#00E5A0',
      light: '#33EBB3',
      dark: '#00B37D',
    },
    background: {
      default: '#0D0D1A',
      paper: '#151528',
    },
    text: {
      primary: '#EAEAFF',
      secondary: '#9D9DB8',
    },
    divider: 'rgba(108, 99, 255, 0.15)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
      color: '#9D9DB8',
    },
    button: {
      textTransform: 'none',
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
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.9rem',
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B83FF 100%)',
            boxShadow: '0 4px 20px rgba(108, 99, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5A52E0 0%, #7B73FF 100%)',
              boxShadow: '0 6px 28px rgba(108, 99, 255, 0.45)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(108, 99, 255, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#9D9DB8',
          borderBottom: '1px solid rgba(108, 99, 255, 0.15)',
        },
        body: {
          borderBottom: '1px solid rgba(108, 99, 255, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: '1px solid rgba(108, 99, 255, 0.2)',
          background: '#1A1A35',
        },
      },
    },
  },
});

export default theme;
