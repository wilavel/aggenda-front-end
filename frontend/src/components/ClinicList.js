import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ClinicList = () => {
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            setLoading(true);
            setError('');

            const session = await Auth.currentSession();
            const token = session.getAccessToken().getJwtToken();

            const response = await axios.get(`${API_URL}/clinics`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Ensure we're working with an array
            const clinicsData = Array.isArray(response.data) ? response.data : 
                              (response.data.clinics || response.data.data || []);
            
            setClinics(clinicsData);
        } catch (err) {
            console.error('Error al cargar clínicas:', err);
            if (err.message === 'No current user') {
                setError('Sesión expirada. Redirigiendo al login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Error al cargar las clínicas');
            }
            // Set empty array in case of error
            setClinics([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (clinic = null) => {
        if (clinic) {
            setSelectedClinic(clinic);
            setFormData({
                name: clinic.name,
                address: clinic.address || '',
                phone: clinic.phone || '',
                email: clinic.email || ''
            });
        } else {
            setSelectedClinic(null);
            setFormData({
                name: '',
                address: '',
                phone: '',
                email: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedClinic(null);
        setFormData({
            name: '',
            address: '',
            phone: '',
            email: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const session = await Auth.currentSession();
            const token = session.getAccessToken().getJwtToken();

            // Validar campos requeridos
            if (!formData.name) {
                throw new Error('El nombre de la clínica es requerido');
            }

            // Preparar los datos
            const requestData = {
                name: formData.name.trim(),
                address: formData.address?.trim() || '',
                phone: formData.phone?.trim() || '',
                email: formData.email?.trim() || ''
            };

            console.log('Enviando datos:', requestData);

            if (selectedClinic) {
                // Actualizar clínica existente
                const response = await axios.put(
                    `${API_URL}/clinics/${selectedClinic.id}`, 
                    requestData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log('Respuesta de actualización:', response.data);
            } else {
                // Crear nueva clínica
                const response = await axios.post(
                    `${API_URL}/clinics`, 
                    requestData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log('Respuesta de creación:', response.data);
            }

            handleCloseDialog();
            fetchClinics();
        } catch (err) {
            console.error('Error completo:', err);
            console.error('Detalles del error:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                headers: err.response?.headers
            });

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Error al guardar la clínica');
            }
        }
    };

    const handleDelete = async (clinicId) => {
        if (window.confirm('¿Está seguro de que desea eliminar esta clínica?')) {
            try {
                const session = await Auth.currentSession();
                const token = session.getAccessToken().getJwtToken();

                await axios.delete(`${API_URL}/clinics/${clinicId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                fetchClinics();
            } catch (err) {
                console.error('Error al eliminar clínica:', err);
                setError('Error al eliminar la clínica');
            }
        }
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
                <Typography variant="h4" component="h1">
                    Clínicas
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nueva Clínica
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Dirección</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {clinics.map((clinic) => (
                            <TableRow key={clinic.id}>
                                <TableCell>{clinic.name}</TableCell>
                                <TableCell>{clinic.address}</TableCell>
                                <TableCell>{clinic.phone}</TableCell>
                                <TableCell>{clinic.email}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleOpenDialog(clinic)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(clinic.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {clinics.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No hay clínicas registradas
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedClinic ? 'Editar Clínica' : 'Nueva Clínica'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Nombre"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Dirección"
                                    name="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Teléfono"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedClinic ? 'Guardar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ClinicList; 