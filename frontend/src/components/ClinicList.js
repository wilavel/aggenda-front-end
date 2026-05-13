import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Grid, Tooltip, Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const EMPTY_FORM = { name: '', address: '', phone: '', email: '' };

const ClinicList = () => {
    const [clinics, setClinics]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [dialogOpen, setDialogOpen]   = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [formData, setFormData]       = useState(EMPTY_FORM);
    const navigate = useNavigate();

    useEffect(() => { fetchClinics(); }, []);

    const fetchClinics = async () => {
        try {
            setLoading(true);
            setError('');
            const session = await Auth.currentSession();
            const token   = session.getAccessToken().getJwtToken();
            const res     = await axios.get(`${API_URL}/clinics`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = Array.isArray(res.data) ? res.data : (res.data.clinics || res.data.data || []);
            setClinics(data);
        } catch (err) {
            if (err.message === 'No current user') {
                setError('Sesión expirada. Redirigiendo...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Error al cargar las clínicas');
            }
            setClinics([]);
        } finally {
            setLoading(false);
        }
    };

    const openDialog = (clinic = null) => {
        setSelectedClinic(clinic);
        setFormData(clinic ? { name: clinic.name, address: clinic.address || '', phone: clinic.phone || '', email: clinic.email || '' } : EMPTY_FORM);
        setError('');
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setSelectedClinic(null);
        setFormData(EMPTY_FORM);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) { setError('El nombre de la clínica es requerido'); return; }
        try {
            const session = await Auth.currentSession();
            const token   = session.getAccessToken().getJwtToken();
            const data    = { name: formData.name.trim(), address: formData.address?.trim() || '', phone: formData.phone?.trim() || '', email: formData.email?.trim() || '' };
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
            if (selectedClinic) {
                await axios.put(`${API_URL}/clinics/${selectedClinic.id}`, data, { headers });
            } else {
                await axios.post(`${API_URL}/clinics`, data, { headers });
            }
            closeDialog();
            fetchClinics();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error al guardar la clínica');
        }
    };

    const handleDelete = async (clinicId) => {
        if (!window.confirm('¿Eliminar esta clínica?')) return;
        try {
            const session = await Auth.currentSession();
            const token   = session.getAccessToken().getJwtToken();
            await axios.delete(`${API_URL}/clinics/${clinicId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchClinics();
        } catch {
            setError('Error al eliminar la clínica');
        }
    };

    const field = (key, label, type = 'text', required = false) => (
        <Grid item xs={12}>
            <TextField
                fullWidth required={required} label={label} type={type}
                value={formData[key]}
                onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
            />
        </Grid>
    );

    if (loading) return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 2 }}>
            <CircularProgress color="primary" />
            <Typography color="text.secondary">Cargando clínicas...</Typography>
        </Box>
    );

    return (
        <Container maxWidth="lg">
            {/* ── Header ── */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mt: 4, mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Clínicas</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {clinics.length} sede{clinics.length !== 1 ? 's' : ''} registrada{clinics.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openDialog()}
                    sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 600 }}
                >
                    Nueva Clínica
                </Button>
            </Box>

            {error && !dialogOpen && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* ── Tabla ── */}
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['Clínica', 'Dirección', 'Teléfono', 'Email', ''].map(h => (
                                    <TableCell key={h} align={h === '' ? 'right' : 'left'}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clinics.map(clinic => (
                                <TableRow key={clinic.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.light', fontSize: 16 }}>
                                                <LocalHospitalIcon sx={{ fontSize: 18, color: '#fff' }} />
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={600}>{clinic.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{clinic.address || '—'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{clinic.phone || '—'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{clinic.email || '—'}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => openDialog(clinic)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(clinic.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {clinics.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                        <LocalHospitalIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                        <Typography color="text.secondary">No hay clínicas registradas</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* ── Dialog ── */}
            <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
                <Box sx={{ height: 4, bgcolor: 'primary.main', borderRadius: '14px 14px 0 0' }} />
                <DialogTitle sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, pb: 1 }}>
                    {selectedClinic ? 'Editar Clínica' : 'Nueva Clínica'}
                </DialogTitle>
                <DialogContent>
                    {error && dialogOpen && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Box component="form" id="clinic-form" onSubmit={handleSubmit}>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            {field('name',    'Nombre de la clínica', 'text', true)}
                            {field('address', 'Dirección')}
                            {field('phone',   'Teléfono', 'tel')}
                            {field('email',   'Correo electrónico', 'email')}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                    <Button onClick={closeDialog} color="inherit">Cancelar</Button>
                    <Button type="submit" form="clinic-form" variant="contained" sx={{ px: 4 }}>
                        {selectedClinic ? 'Guardar cambios' : 'Crear Clínica'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ClinicList;
