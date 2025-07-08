import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate, useParams } from 'react-router-dom';
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
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL;

const USER_GROUPS = [
    { value: 'Administrators', label: 'Administrador' },
    { value: 'Doctors', label: 'Doctor' },
    { value: 'Managers', label: 'Gerente' },
    { value: 'Clients', label: 'Paciente' }
];
const DOCUMENT_TYPES = [
    { value: 'C.C', label: 'C.C' },
    { value: 'T.I', label: 'T.I' },
    { value: 'C.E', label: 'C.E' }
];

const EditUser = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        group: '',
        document_number: '',
        document_type: ''
    });
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const checkAuthAndLoadUser = async () => {
            try {
                setCheckingAuth(true);
                const session = await Auth.currentSession();
                if (!session) {
                    throw new Error('No hay sesión activa');
                }
                // Cargar datos del usuario
                const token = session.getAccessToken().getJwtToken();
                const response = await axios.get(`${API_URL}/users/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setFormData({
                    name: response.data.name || '',
                    phone: response.data.phone || '',
                    group: response.data.group || '',
                    document_number: response.data.document_number || '',
                    document_type: response.data.document_type || ''
                });
                setEmail(response.data.email || '');
            } catch (err) {
                setError('Por favor, inicie sesión para continuar');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuthAndLoadUser();
    }, [navigate, id]);

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
            if (!formData.name || !formData.group || !formData.document_number || !formData.document_type) {
                throw new Error('Por favor complete todos los campos requeridos');
            }

            // Obtener el token de la sesión actual
            const session = await Auth.currentSession();
            const token = session.getAccessToken().getJwtToken();

            // Preparar los datos
            const requestData = {
                name: formData.name,
                phone: formData.phone || '',
                group: formData.group,
                document_number: formData.document_number,
                document_type: formData.document_type
            };

            // PUT para actualizar
            const response = await axios.put(
                `${API_URL}/users/${id}`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setSuccess('Usuario actualizado exitosamente');
            setTimeout(() => {
                navigate('/users');
            }, 2000);
        } catch (err) {
            if (err.message === 'No current user') {
                setError('Sesión expirada. Por favor, vuelva a iniciar sesión.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else if (err.response) {
                setError(err.response.data?.message || 'Error al actualizar el usuario');
            } else {
                setError(err.message || 'Error al actualizar el usuario');
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
                        Editar Usuario
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
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="email"
                                    label="Email"
                                    name="email"
                                    value={email}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="name"
                                    label="Nombre"
                                    name="name"
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="phone"
                                    label="Teléfono"
                                    name="phone"
                                    autoComplete="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel id="group-label">Grupo</InputLabel>
                                    <Select
                                        labelId="group-label"
                                        id="group"
                                        name="group"
                                        value={formData.group}
                                        label="Grupo"
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        {USER_GROUPS.map((group) => (
                                            <MenuItem key={group.value} value={group.value}>
                                                {group.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="document_number"
                                    label="Número de Documento"
                                    name="document_number"
                                    value={formData.document_number}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel id="document_type-label">Tipo de Documento</InputLabel>
                                    <Select
                                        labelId="document_type-label"
                                        id="document_type"
                                        name="document_type"
                                        value={formData.document_type}
                                        label="Tipo de Documento"
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        {DOCUMENT_TYPES.map((doc) => (
                                            <MenuItem key={doc.value} value={doc.value}>
                                                {doc.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Actualizando usuario...' : 'Actualizar Usuario'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default EditUser; 