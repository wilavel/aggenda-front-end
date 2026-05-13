import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Button, TextField, Typography, Alert, Grid, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, FormGroup, FormControlLabel,
    Checkbox, Avatar, Divider, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
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

const EditUser = ({ id, onClose }) => {
    const [formData, setFormData] = useState({
        name: '', phone: '', group: '', document_number: '', document_type: '', clinics: [],
    });
    const [email, setEmail]     = useState('');
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const navigate = useNavigate();
    const { clinics: clinicsList, loading: loadingClinics, error: errorClinics } = useFetchClinics();

    useEffect(() => {
        const load = async () => {
            try {
                const session = await Auth.currentSession();
                const token   = session.getAccessToken().getJwtToken();
                const res     = await axios.get(`${API_URL}/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEmail(res.data.email || '');
                setFormData({
                    name:            res.data.name            || '',
                    phone:           res.data.phone           || '',
                    group:           res.data.group           || '',
                    document_number: res.data.document_number || '',
                    document_type:   res.data.document_type   || '',
                    clinics:         Array.isArray(res.data.clinics) ? res.data.clinics.map(String) : [],
                });
            } catch {
                setError('Error al cargar los datos del usuario');
                setTimeout(() => navigate('/login'), 2000);
            } finally {
                setFetching(false);
            }
        };
        load();
    }, [id, navigate]);

    const handleChange = (e) =>
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            if (!formData.name || !formData.group || !formData.document_number || !formData.document_type) {
                throw new Error('Por favor complete todos los campos requeridos');
            }
            const session = await Auth.currentSession();
            const token   = session.getAccessToken().getJwtToken();
            await axios.put(
                `${API_URL}/users/${id}`,
                {
                    name:            formData.name,
                    phone:           formData.phone || '',
                    group:           formData.group,
                    document_number: formData.document_number,
                    document_type:   formData.document_type,
                    clinics:         formData.group === 'Doctors' ? formData.clinics.map(String) : [],
                },
                { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
            );
            setSuccess('Usuario actualizado exitosamente');
            if (onClose) onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al actualizar el usuario');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                <CircularProgress />
                <Typography color="text.secondary">Cargando datos...</Typography>
            </Box>
        );
    }

    return (
        <>
            <DialogTitle sx={{ pb: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontWeight: 700 }}>
                        {initials(formData.name)}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                            {formData.name || 'Editar Usuario'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{email}</Typography>
                    </Box>
                </Box>
                {/* Barra de acento */}
                <Box sx={{ height: 3, bgcolor: 'primary.main', mt: 2, mx: -3, borderRadius: 0 }} />
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box component="form" id="edit-user-form" onSubmit={handleSubmit}>

                    {/* ── Información personal ── */}
                    <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>
                        Información personal
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 0.5, mb: 3 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField required fullWidth label="Nombre completo" name="name"
                                value={formData.name} onChange={handleChange} disabled={loading} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Teléfono" name="phone" type="tel"
                                value={formData.phone} onChange={handleChange} disabled={loading} />
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 3 }} />

                    {/* ── Cuenta ── */}
                    <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1 }}>
                        Cuenta
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 0.5, mb: 3 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField fullWidth label="Email" value={email} disabled />
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
                                ) : clinicsList.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">No hay clínicas registradas</Typography>
                                ) : clinicsList.map(clinic => (
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

                    {/* ── Documento ── */}
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
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button onClick={onClose} disabled={loading} color="inherit">
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    form="edit-user-form"
                    variant="contained"
                    disabled={loading}
                    sx={{ px: 4, fontWeight: 700, boxShadow: 'none' }}
                >
                    {loading ? 'Guardando...' : 'Guardar cambios'}
                </Button>
            </DialogActions>
        </>
    );
};

export default EditUser;
