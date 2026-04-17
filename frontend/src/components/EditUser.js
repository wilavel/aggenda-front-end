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
    MenuItem,
    FormGroup,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import useFetchClinics from '../hooks/useFetchClinics';

const API_URL = process.env.REACT_APP_API_URL;

const USER_GROUPS = [
    { value: 'Doctors', label: 'Doctor' },
    { value: 'Managers', label: 'Gerente' },
    { value: 'Patients', label: 'Paciente' }
];
const DOCUMENT_TYPES = [
    { value: 'C.C', label: 'C.C' },
    { value: 'T.I', label: 'T.I' },
    { value: 'C.E', label: 'C.E' }
];

const EditUser = ({ id: propId, onClose }) => {
    const id = propId;
   
   
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        group: '',
        document_number: '',
        document_type: '',
        clinics: [] // ids de clínicas seleccionadas
    });
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const navigate = useNavigate();
   

    useEffect(() => {
        const checkAuthAndLoadUser = async () => {
            try {
                console.log('Cargando datos del usuario...' + id);
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
                console.log('Datos del usuario:', response.data);
                setFormData({
                    name: response.data.name || '',
                    phone: response.data.phone || '',
                    group: response.data.group || '',
                    document_number: response.data.document_number || '',
                    document_type: response.data.document_type || '',
                    clinics: Array.isArray(response.data.clinics) ? response.data.clinics.map(String) : []
                });
                setEmail(response.data.email || '');
            } catch (err) {
                console.log('Error al cargar datos del usuario:', err);
                setError('Por favor, inicie sesión para continuar xxxx');
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

    // Para el selector múltiple de clínicas
    const handleClinicsChange = (e) => {
        setFormData({
            ...formData,
            clinics: e.target.value
        });
    };

    const { clinics: clinicsList, loading: loadingClinics, error: errorClinics } = useFetchClinics();

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
                document_type: formData.document_type,
                clinics: formData.group === 'Doctors' ? formData.clinics.map(String) : []
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
            if (onClose) onClose();
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
                            {formData.group === 'Doctors' && (
                                <Grid item xs={12}>
                                    <FormControl component="fieldset" fullWidth required>
                                        <label style={{marginBottom: 8, fontWeight: 500}}>Clínicas</label>
                                        <FormGroup row>
                                            {loadingClinics ? (
                                                <span style={{marginLeft: 8}}>Cargando clínicas...</span>
                                            ) : errorClinics ? (
                                                <span style={{marginLeft: 8, color: 'red'}}>Error al cargar clínicas</span>
                                            ) : clinicsList.length === 0 ? (
                                                <span style={{marginLeft: 8}}>No hay clínicas registradas</span>
                                            ) : (
                                                clinicsList.map((clinic) => (
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
                            {loading ? 'Actualizando usuario...' : 'Actualizar Usuario'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default EditUser; 