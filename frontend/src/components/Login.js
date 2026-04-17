import React, { useState, useEffect, useCallback } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const checkAuth = useCallback(async () => {
        try {
            const user = await Auth.currentAuthenticatedUser();
            if (user) {
                navigate('/');
            }
        } catch (err) {
            console.log('No hay sesión activa');
        }
    }, [navigate]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const user = await Auth.signIn(email, password);
            console.log('Usuario autenticado:', user);
            
            // Verificar si el usuario necesita cambiar su contraseña
            if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                setUser(user);
                setShowNewPasswordDialog(true);
                return;
            }
            
            onLogin(); // Notificar que el usuario ha iniciado sesión
            navigate('/');
        } catch (err) {
            console.error('Error de autenticación:', err);
            if (err.code === 'UserNotConfirmedException') {
                setError('Por favor, confirme su cuenta antes de iniciar sesión.');
            } else if (err.code === 'NotAuthorizedException') {
                setError('Email o contraseña incorrectos.');
            } else if (err.code === 'UserNotFoundException') {
                setError('Usuario no encontrado.');
            } else if (err.code === 'PasswordResetRequiredException') {
                setError('Se requiere restablecer la contraseña. Por favor, contacte al administrador.');
            } else {
                setError(err.message || 'Error al iniciar sesión');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNewPasswordSubmit = async () => {
        if (newPassword !== confirmNewPassword) {
            setPasswordError('Las contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (!user) {
            setPasswordError('Error: Sesión de usuario no válida');
            return;
        }

        setLoading(true);
        setPasswordError('');

        try {
            // Obtener los atributos del usuario del objeto user
            const userAttributes = user.attributes || {};
            
            const loggedUser = await Auth.completeNewPassword(
                user,
                newPassword,
                {
                    name: userAttributes.name || user.username
                }
            );
            
            console.log('Contraseña actualizada:', loggedUser);
            setShowNewPasswordDialog(false);
            onLogin(); // Notificar que el usuario ha iniciado sesión
            navigate('/');
        } catch (err) {
            console.error('Error al actualizar contraseña:', err);
            if (err.code === 'InvalidParameterException') {
                setPasswordError('La contraseña no cumple con los requisitos de seguridad');
            } else {
                setPasswordError(err.message || 'Error al actualizar la contraseña');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Iniciar Sesión
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Ingresar'}
                        </Button>
                    </Box>
                </Paper>
            </Box>

            {/* Diálogo para nueva contraseña */}
            <Dialog open={showNewPasswordDialog} onClose={() => !loading && setShowNewPasswordDialog(false)}>
                <DialogTitle>Establecer Nueva Contraseña</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Por favor, establece una nueva contraseña para tu cuenta.
                    </Typography>
                    {passwordError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {passwordError}
                        </Alert>
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="newPassword"
                        label="Nueva Contraseña"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmNewPassword"
                        label="Confirmar Nueva Contraseña"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        disabled={loading}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleNewPasswordSubmit}
                        disabled={loading}
                        variant="contained"
                        color="primary"
                    >
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Login; 