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
    TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const DOCUMENT_TYPES = [
    { value: 'C.C', label: 'C.C' },
    { value: 'T.I', label: 'T.I' },
    { value: 'C.E', label: 'C.E' }
];

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        document_number: '',
        document_type: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthAndFetchUsers();
    }, []);

    const checkAuthAndFetchUsers = async () => {
        try {
            setLoading(true);
            setError('');

            // Verificar la autenticación primero
            const user = await Auth.currentAuthenticatedUser();
            if (!user) {
                throw new Error('No hay usuario autenticado');
            }

            // Obtener la sesión actual
            const session = await Auth.currentSession();
            const token = session.getAccessToken().getJwtToken();

            // Configurar la petición
            const config = {
                url: `${API_URL}/users`,
                method: 'GET',
                timeout: 0,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            const response = await axios(config);
            console.log('Respuesta completa:', response);
            
            if (response.data) {
                setUsers(response.data);
            } else {
                throw new Error('No se recibieron datos de la API');
            }
        } catch (err) {
            console.error('Error completo:', err);
            if (err.message === 'No current user' || err.message === 'No hay usuario autenticado') {
                setError('Sesión expirada. Redirigiendo al login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else if (err.response?.status === 401) {
                setError('Sesión expirada. Redirigiendo al login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(err.message || 'Error al cargar los usuarios');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            document_number: user.document_number || '',
            document_type: user.document_type || ''
        });
        setEditDialogOpen(true);
    };

    const handleDeleteClick = async (userId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
            try {
                const session = await Auth.currentSession();
                const token = session.getAccessToken().getJwtToken();

                await axios.delete(`${API_URL}/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                setUsers(users.filter(user => user.id !== userId));
            } catch (err) {
                console.error('Error al eliminar usuario:', err);
                setError('Error al eliminar el usuario');
            }
        }
    };

    const handleEditSubmit = async () => {
        try {
            const session = await Auth.currentSession();
            const token = session.getAccessToken().getJwtToken();

            await axios.put(`${API_URL}/users/${selectedUser.id}`, editFormData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setUsers(users.map(user => 
                user.id === selectedUser.id ? { ...user, ...editFormData } : user
            ));
            setEditDialogOpen(false);
        } catch (err) {
            console.error('Error al actualizar usuario:', err);
            setError('Error al actualizar el usuario');
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
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
                Lista de Usuarios
            </Typography>

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
                            <TableCell>Email</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Número de Documento</TableCell>
                            <TableCell>Tipo de Documento</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone || '-'}</TableCell>
                                <TableCell>{user.document_number || '-'}</TableCell>
                                <TableCell>{user.document_type || '-'}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => handleEditClick(user)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error" 
                                        onClick={() => handleDeleteClick(user.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No hay usuarios registrados
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Nombre"
                        name="name"
                        value={editFormData.name}
                        onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Email"
                        name="email"
                        value={editFormData.email}
                        disabled
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Teléfono"
                        name="phone"
                        value={editFormData.phone}
                        onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Número de Documento"
                        name="document_number"
                        value={editFormData.document_number}
                        onChange={e => setEditFormData({ ...editFormData, document_number: e.target.value })}
                    />
                    <Box sx={{ mt: 2 }}>
                        <label>Tipo de Documento</label>
                        <select
                            name="document_type"
                            value={editFormData.document_type}
                            onChange={e => setEditFormData({ ...editFormData, document_type: e.target.value })}
                            style={{ width: '100%', padding: '8px', marginTop: '8px' }}
                        >
                            <option value="">Seleccione...</option>
                            {DOCUMENT_TYPES.map((doc) => (
                                <option key={doc.value} value={doc.value}>{doc.label}</option>
                            ))}
                        </select>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleEditSubmit} variant="contained" color="primary">
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserList; 