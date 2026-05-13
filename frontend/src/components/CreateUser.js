import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Button, TextField, Typography, Container, Paper, Alert,
    Grid, CircularProgress, FormControl, InputLabel, Select,
    MenuItem, FormGroup, FormControlLabel, Checkbox, Avatar, Divider
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import useFetchClinics from '../hooks/useFetchClinics';

const API_URL = process.env.REACT_APP_API_URL;

const USER_GROUPS = [
    { value: 'Doctors',  label: 'Doctor'   },
    { value: 'Managers', label: 'Gerente'  },
    { value: 'Patients', label: 'Paciente' },
];

const DOCUMENT_TYPES = [
    { value: 'C.C', label: 'C.C' },
    { value: 'T.I', label: 'T.I' },
    { value: 'C.E', label: 'C.E' },
];

const initials = (name = '') =>
    name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const CreateUser = () => {
    const [formData, setFormData] = useState({
        email: '', name: '', phone: '', group: '',
        document_number: '', document_type: '', clinics: [],
    });
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const navigate = useNavigate();
    const { clinics, loading: loadingClinics, error: errorClinics } = useFetchClinics();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await Auth.currentSession();
                if (!session) throw new Error('No hay sesión activa');
            } catch {
                setError('Por favor, inicie sesión para continuar');
                setTimeout(() => navigate('/login'), 2000);
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, [navigate]);

    const handleChange = (e) =>
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            if (!formData.email || !formData.name || !formData.group || !formData.document_number || !formData.document_type) {
                throw new Error('Por favor complete todos los campos requeridos');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) throw new Error('Por favor ingrese un email válido');

            const session = await Auth.currentSession();
            const token   = session.getAccessToken().getJwtToken();
            await axios({
                method: 'post',
                url: `${API_URL}/users`,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                data: {
                    email:           formData.email.trim().toLowerCase(),
                    name:            formData.name.trim(),
                    phone:           formData.phone || '',
                    group:           formData.group,
                    document_number: formData.document_number,
                    document_type:   formData.document_type,
                    clinics:         formData.group === 'Doctors' ? formData.clinics.map(String) : [],
                },
            });
            setSuccess('Usuario creado exitosamente. Se envió la contraseña temporal al correo registrado.');
            setFormData({ email: '', name: '', phone: '', group: '', document_number: '', document_type: '', clinics: [] });
            setTimeout(() => navigate('/users'), 2000);
        } catch (err) {
            if (err.response) {
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 2 }}>
                <CircularProgress />
                <Typography color="text.secondary">Verificando sesión...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonAddIcon color="primary" sx={{ fontSize: 28 }} />
                <Box>
                    <Typography variant="h5" fontWeight={700}>Nuevo Usuario</Typography>
                    <Typography variant="body2" color="text.secondary">Completa la información para crear la cuenta</Typography>
                </Box>
            </Box>

            {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {/* Barra de color superior */}
                <Box sx={{ height: 4, bgcolor: 'primary.main' }} />

                <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>

                    {/* ── Sección: Información personal ── */}
                    <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>
                        Información personal
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 0.5, mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="Nombre completo" name="name"
                                value={formData.name} onChange={handleChange} disabled={loading}
                                InputProps={{
                                    startAdornment: formData.name ? (
                                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.light', fontSize: 11 }}>
                                            {initials(formData.name)}
                                        </Avatar>
                                    ) : null,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Teléfono" name="phone" type="tel"
                                value={formData.phone} onChange={handleChange} disabled={loading} />
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 3 }} />

                    {/* ── Sección: Cuenta ── */}
                    <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>
                        Cuenta
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 0.5, mb: 3 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField required fullWidth label="Email" name="email" type="email"
                                value={formData.email} onChange={handleChange} disabled={loading} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth required>
                                <InputLabel>Rol</InputLabel>
                                <Select name="group" value={formData.group} label="Rol" onChange={handleChange} disabled={loading}>
                                    {USER_GROUPS.map(g => (
                                        <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {formData.group === 'Doctors' && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Clínicas asignadas
                            </Typography>
                            <FormGroup row sx={{ mt: 1 }}>
                                {loadingClinics ? (
                                    <Typography variant="body2" color="text.secondary">Cargando clínicas...</Typography>
                                ) : errorClinics ? (
                                    <Typography variant="body2" color="error">Error al cargar clínicas</Typography>
                                ) : clinics.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">No hay clínicas registradas</Typography>
                                ) : clinics.map(clinic => (
                                    <FormControlLabel
                                        key={clinic.id}
                                        label={clinic.name}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={formData.clinics.includes(clinic.id)}
                                                onChange={e => {
                                                    const checked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        clinics: checked
                                                            ? [...prev.clinics, clinic.id]
                                                            : prev.clinics.filter(id => id !== clinic.id),
                                                    }));
                                                }}
                                            />
                                        }
                                    />
                                ))}
                            </FormGroup>
                        </Box>
                    )}

                    <Divider sx={{ mb: 3 }} />

                    {/* ── Sección: Documento ── */}
                    <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>
                        Documento de identidad
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth required>
                                <InputLabel>Tipo</InputLabel>
                                <Select name="document_type" value={formData.document_type} label="Tipo" onChange={handleChange} disabled={loading}>
                                    {DOCUMENT_TYPES.map(d => (
                                        <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField required fullWidth label="Número de documento" name="document_number"
                                value={formData.document_number} onChange={handleChange} disabled={loading} />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 4, py: 1.4, fontWeight: 700, borderRadius: 2, boxShadow: 'none' }}
                    >
                        {loading ? 'Creando usuario...' : 'Crear Usuario'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateUser;
