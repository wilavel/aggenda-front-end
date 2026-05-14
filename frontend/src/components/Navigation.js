import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const ROLE_LABEL = {
    Doctors:        { text: 'Doctor',    color: '#d4f4f4', bg: '#0b6b6b22' },
    Managers:       { text: 'Gerente',   color: '#fef3c7', bg: '#f59e0b22' },
    Administrators: { text: 'Admin',     color: '#fee2e2', bg: '#c6282822' },
    Patients:       { text: 'Paciente',  color: '#dcfce7', bg: '#2e7d5222' },
};

const ToothIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path d="M12 2C9.5 2 7 3.5 6 6C5.2 7.8 5 9.5 5 11C5 13.5 5.5 16 6.5 18.5C7.2 20.4 8 22 9 22C10 22 10.5 20 11 18C11.3 16.8 11.6 16 12 16C12.4 16 12.7 16.8 13 18C13.5 20 14 22 15 22C16 22 16.8 20.4 17.5 18.5C18.5 16 19 13.5 19 11C19 9.5 18.8 7.8 18 6C17 3.5 14.5 2 12 2Z" fill="white" fillOpacity="0.9"/>
    </svg>
);

const Navigation = ({ userGroup }) => {
    const isManager = userGroup === 'Managers' || userGroup === 'Administrators';
    const isDoctor  = userGroup === 'Doctors';
    const roleInfo  = ROLE_LABEL[userGroup];

    const navLinks = isManager
        ? [
            { to: '/users',       label: 'Usuarios'      },
            { to: '/clinics',     label: 'Clínicas'      },
            { to: '/appointments',label: 'Agenda'         },
            { to: '/create-user', label: 'Crear Usuario' },
          ]
        : isDoctor
        ? [
            { to: '/appointments', label: 'Mi Agenda' },
          ]
        : [];

    return (
        <AppBar position="static" elevation={0}>
            <Toolbar sx={{ gap: 1, minHeight: 64 }}>
                {/* Brand */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 3 }}>
                    <ToothIcon />
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, letterSpacing: -0.5, lineHeight: 1, color: '#fff' }}
                        >
                            Central Dent
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, textTransform: 'uppercase', lineHeight: 1 }}>
                            Gestión Clínica
                        </Typography>
                    </Box>
                </Box>

                {/* Separador */}
                <Box sx={{ width: 1, height: 28, bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />

                {/* Nav links */}
                <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
                    {navLinks.map(link => (
                        <Button
                            key={link.to}
                            component={RouterLink}
                            to={link.to}
                            sx={{
                                color: 'rgba(255,255,255,0.85)',
                                fontWeight: 500,
                                px: 1.5,
                                borderRadius: 2,
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' },
                            }}
                        >
                            {link.label}
                        </Button>
                    ))}
                </Box>

                {/* Role badge + logout */}
                {roleInfo && (
                    <Chip
                        label={roleInfo.text}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.15)',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            border: '1px solid rgba(255,255,255,0.25)',
                        }}
                    />
                )}
                <LogoutButton />
            </Toolbar>
        </AppBar>
    );
};

export default Navigation;
