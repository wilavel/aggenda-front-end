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
    Checkbox,
    IconButton,
    Tooltip,
    Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

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
    const [tempPassword, setTempPassword] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [copied, setCopied] = useState(false);
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
                email: formData.email.trim().toLowerCase(),
                name: formData.name.trim(),
                phone: formData.phone || '',
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
            setSuccess(response.data.message || 'Usuario creado exitosamente.');
            setTempPassword(response.data.temp_password || '');
            setEmailSent(response.data.email_sent || false);
            setCopied(false);
            setFormData({
                email: '',
                name: '',
                phone: '',
                group: '',
                document_number: '',
                document_type: '',
                clinics: [],
            });
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
                        <Alert
                            severity={emailSent ? 'success' : 'warning'}
                            icon={emailSent ? <MarkEmailReadIcon /> : <WarningAmberIcon />}
                            sx={{ mb: 2 }}
                        >
                            {success}
                        </Alert>
                    )}

                    {tempPassword && (
                        <Paper
                            variant="outlined"
                            sx={{
                                mb: 3, p: 2,
                                borderColor: emailSent ? 'success.light' : 'warning.main',
                                bgcolor: emailSent ? '#f1f8e9' : '#fff8e1',
                            }}
                        >
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                                {emailSent
                                    ? '✅ Contraseña temporal enviada al correo'
                                    : '⚠️ Correo no enviado — comparte esta contraseña manualmente'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Box
                                    sx={{
                                        flex: 1, fontFamily: 'monospace', fontSize: 20,
                                        fontWeight: 700, letterSpacing: 3,
                                        bgcolor: 'background.paper', borderRadius: 1,
                                        px: 2, py: 1, border: '1px solid', borderColor: 'grey.300',
                                        userSelect: 'all',
                                    }}
                                >
                                    {tempPassword}
                                </Box>
                                <Tooltip title={copied ? 'Copiado' : 'Copiar contraseña'}>
                                    <IconButton
                                        onClick={() => {
                                            navigator.clipboard.writeText(tempPassword);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2500);
                                        }}
                                        color={copied ? 'success' : 'default'}
                                    >
                                        {copied ? <CheckIcon /> : <ContentCopyIcon />}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
                            </Typography>
                            {!emailSent && (
                                <Chip
                                    label="SES en modo sandbox — activa el acceso a producción en AWS para envío automático"
                                    size="small"
                                    color="warning"
                                    sx={{ mt: 1, fontSize: '0.7rem', height: 'auto', py: 0.5, whiteSpace: 'normal' }}
                                />
                            )}
                        </Paper>
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