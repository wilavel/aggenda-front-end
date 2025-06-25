import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const Navigation = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Gestor de Usuarios
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        color="inherit" 
                        component={RouterLink} 
                        to="/users"
                    >
                        Usuarios
                    </Button>
                    <Button 
                        color="inherit" 
                        component={RouterLink} 
                        to="/clinics"
                    >
                        Clínicas
                    </Button>
                    <Button 
                        color="inherit" 
                        component={RouterLink} 
                        to="/create-user"
                    >
                        Crear Usuario
                    </Button>
                    <Button 
                        color="inherit" 
                        component={RouterLink} 
                        to="/token"
                    >
                        Ver Token
                    </Button>
                    <LogoutButton />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation; 