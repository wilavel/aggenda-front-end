import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const Navigation = ({ userGroup }) => {
    const isManager = userGroup === 'Managers' || userGroup === 'Administrators';
    const isDoctor = userGroup === 'Doctors';

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {isDoctor ? 'Mi Agenda' : 'Gestor de Usuarios'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {isManager && (
                        <>
                            <Button color="inherit" component={RouterLink} to="/users">
                                Usuarios
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/clinics">
                                Clínicas
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/appointments">
                                Agenda
                            </Button>
                            <Button color="inherit" component={RouterLink} to="/create-user">
                                Crear Usuario
                            </Button>
                        </>
                    )}
                    {isDoctor && (
                        <Button color="inherit" component={RouterLink} to="/appointments">
                            Mi Agenda
                        </Button>
                    )}
                    <LogoutButton />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation; 