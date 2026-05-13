import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './config/dev';

const theme = createTheme({
    palette: {
        primary:    { main: '#0b6b6b', dark: '#084f4f', light: '#0f9292', contrastText: '#fff' },
        secondary:  { main: '#f59e0b', dark: '#c47c08', light: '#fbbf24', contrastText: '#1a1a1a' },
        success:    { main: '#2e7d52' },
        warning:    { main: '#d97706' },
        error:      { main: '#c62828' },
        background: { default: '#f0f5f5', paper: '#ffffff' },
        text:       { primary: '#0f172a', secondary: '#64748b' },
    },
    typography: {
        fontFamily: '"DM Sans", sans-serif',
        h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
        h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
        h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
        h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
        h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
        h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
        button: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600, textTransform: 'none', letterSpacing: 0.2 },
        overline: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, letterSpacing: 1.2 },
    },
    shape: { borderRadius: 10 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' }, borderRadius: 8 },
                containedPrimary: { background: 'linear-gradient(135deg, #0b6b6b 0%, #0f9292 100%)' },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
                outlined: { borderColor: '#e2e8f0' },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-root': {
                        backgroundColor: '#f8fafc',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        color: '#64748b',
                        borderBottom: '2px solid #e2e8f0',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': { backgroundColor: '#f0f9f9' },
                    '&:last-child td': { borderBottom: 0 },
                },
            },
        },
        MuiChip: {
            styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } },
        },
        MuiAlert: {
            styleOverrides: { root: { borderRadius: 8 } },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #073f3f 0%, #0b6b6b 100%)',
                    boxShadow: '0 2px 16px rgba(11,107,107,0.25)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: { borderRadius: 14 },
            },
        },
        MuiTextField: {
            defaultProps: { variant: 'outlined' },
        },
        MuiInputBase: {
            styleOverrides: {
                root: { fontFamily: '"DM Sans", sans-serif' },
            },
        },
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
