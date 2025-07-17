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
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox
} from '@mui/material';

import useFetchClinics from '../hooks/useFetchClinics';
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

const CreateUser = () => {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phone: '',
        group: '',
        document_number: '',
        document_type: '',
        clinics: [] // ids de clínicas seleccionadas
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const navigate = useNavigate();
    const { clinics, loading: loadingClinics, error: errorClinics } = useFetchClinics();

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

    // Para el selector múltiple de clínicas
    const handleClinicsChange = (e) => {
        setFormData({
            ...formData,
            clinics: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validar campos requeridos
            if (!formData.email || !formData.name || !formData.group || !formData.document_number || !formData.document_type) {
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

            // Preparar los datos
            const requestData = {
                email: formData.email,
                name: formData.name,
                phone: formData.phone || '',
                password: "UnaContraseñaSegura123!",
                group: formData.group,
                document_number: formData.document_number,
                document_type: formData.document_type,
                clinics: formData.group === 'Doctors' ? formData.clinics.map(String) : []
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
                email: '',
                name: '',
                phone: '',
                group: '',
                document_number: '',
                document_type: ''
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
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
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
                            {formData.group === 'Doctors' && (
    <Grid item xs={12}>
        <FormControl component="fieldset" fullWidth required>
            <label style={{marginBottom: 8, fontWeight: 500}}>Clínicas</label>
            <FormGroup row>
                {loadingClinics ? (
                    <span style={{marginLeft: 8}}>Cargando clínicas...</span>
                ) : errorClinics ? (
                    <span style={{marginLeft: 8, color: 'red'}}>Error al cargar clínicas</span>
                ) : clinics.length === 0 ? (
                    <span style={{marginLeft: 8}}>No hay clínicas registradas</span>
                ) : (
                    clinics.map((clinic) => (
                        <FormControlLabel
                            key={clinic.id}
                            control={
                                <Checkbox
                                    checked={formData.clinics.includes(clinic.id)}
                                    onChange={e => {
                                        const checked = e.target.checked;
                                        setFormData(prev => ({
                                            ...prev,
                                            clinics: checked
                                                ? [...prev.clinics, clinic.id]
                                                : prev.clinics.filter(id => id !== clinic.id)
                                        }));
                                    }}
                                    name={clinic.name}
                                    color="primary"
                                />
                            }
                            label={clinic.name}
                        />
                    ))
                )}
            </FormGroup>
        </FormControl>
    </Grid>
)}
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
                            {loading ? 'Creando usuario...' : 'Crear Usuario'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default CreateUser; 