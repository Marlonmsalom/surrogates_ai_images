import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './styles/index.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E91E63',
      light: '#F8BBD9',
      dark: '#AD1457',
    },
    secondary: {
      main: '#FF7043',
      light: '#FFE0B2',
      dark: '#BF360C',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: 'rgba(26, 26, 26, 0.7)',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FF9800',
    },
    error: {
      main: '#F44336',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '6rem',
      letterSpacing: '-0.02em',
      '@media (max-width:768px)': {
        fontSize: '3rem',
      },
    },
    h3: {
      fontWeight: 800,
      fontSize: '2.5rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.25rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
