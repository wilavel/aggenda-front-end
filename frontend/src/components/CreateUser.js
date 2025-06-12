import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert,
    Grid,
    CircularProgress
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL;

const CreateUser = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setCheckingAuth(true);
                const session = await Auth.currentSession();
                if (!session) {
                    throw new Error('No hay sesión activa');
                }
                console.log('Sesión válida encontrada');
            } catch (err) {
                console.error('Error de autenticación:', err);
                setError('Por favor, inicie sesión para continuar');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validar campos requeridos
            if (!formData.username || !formData.email || !formData.name) {
                throw new Error('Por favor complete todos los campos requeridos');
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('Por favor ingrese un email válido');
            }

            // Obtener el token de la sesión actual
            const session = await Auth.currentSession();
            const token = session.getAccessToken().getJwtToken();
            console.log('Token obtenido:', token.substring(0, 20) + '...');

            // Preparar los datos como en Postman
            const requestData = {
                name: formData.name,
                email: formData.email,
                password: "UnaContraseñaSegura123!"
            };

            // Configurar la petición
            const config = {
                method: 'post',
                url: `${API_URL}/users`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: requestData
            };

            // Imprimir información detallada de la petición
            console.log('Configuración de la petición:', config);
            
            // Realizar la petición con axios
            const response = await axios(config);
            
            console.log('Respuesta del servidor:', response.data);
            setSuccess('Usuario creado exitosamente');
            setFormData({
                username: '',
                email: '',
                name: '',
                phone: ''
            });
            
            setTimeout(() => {
                navigate('/users');
            }, 2000);
        } catch (err) {
            console.error('Error detallado:', err);
            console.error('Error completo:', {
                message: err.message,
                name: err.name,
                stack: err.stack,
                response: err.response,
                request: err.request
            });

            if (err.message === 'No current user') {
                setError('Sesión expirada. Por favor, vuelva a iniciar sesión.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else if (err.message === 'Network Error') {
                setError('Error de conexión. Por favor, verifique que el servidor esté corriendo en ' + API_URL);
            } else if (err.response) {
                // Error de la API
                console.error('Error de la API:', err.response);
                setError(err.response.data?.message || 'Error al crear el usuario');
            } else {
                setError(err.message || 'Error al crear el usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <Container component="main" maxWidth="md">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <CircularProgress />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Verificando autenticación...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="md">
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
                        Crear Nuevo Usuario
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Nombre de Usuario"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={loading}
                                    error={error && !formData.username}
                                    helperText={error && !formData.username ? 'Este campo es requerido' : ''}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    error={error && !formData.email}
                                    helperText={error && !formData.email ? 'Este campo es requerido' : ''}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Nombre Completo"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                    error={error && !formData.name}
                                    helperText={error && !formData.name ? 'Este campo es requerido' : ''}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Teléfono"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/users')}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? 'Creando...' : 'Crear Usuario'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default CreateUser; 