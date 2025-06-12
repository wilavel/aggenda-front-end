import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const Navigation = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Agenda
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/users"
                        sx={{ mr: 2 }}
                    >
                        Usuarios
                    </Button>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/create-user"
                        sx={{ mr: 2 }}
                    >
                        Crear Usuario
                    </Button>
                    <LogoutButton />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation; 