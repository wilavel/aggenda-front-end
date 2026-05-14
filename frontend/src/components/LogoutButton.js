import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Limpiar el almacenamiento local
            localStorage.clear();
            sessionStorage.clear();
            
            // Cerrar sesión en Cognito
            await Auth.signOut({ global: true });
            
            // Forzar una recarga de la página para limpiar todo el estado
            window.location.href = '/login';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Aún así, intentar redirigir al login
            window.location.href = '/login';
        }
    };

    return (
        <Button
            variant="text"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
                ml: 1,
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 500,
                fontSize: '0.85rem',
                '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                },
            }}
        >
            Salir
        </Button>
    );
};

export default LogoutButton; 