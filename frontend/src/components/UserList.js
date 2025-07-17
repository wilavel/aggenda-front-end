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
    Dialog
    
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import EditUser from './EditUser';

const API_URL = process.env.REACT_APP_API_URL;


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
        console.log("Usuario seleccionado:", user);
        setSelectedUser(user);
        console.log("Usuario seleccionado:", selectedUser);
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
            <Dialog open={editDialogOpen} onClose={() => {
                setEditDialogOpen(false);
                checkAuthAndFetchUsers();
            }} maxWidth="md" fullWidth>
                {selectedUser && (
                  <EditUser id={selectedUser.id} onClose={() => {
                    setEditDialogOpen(false);
                    checkAuthAndFetchUsers();
                  }} />
                )}
            </Dialog>

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

           
        </Container>
    );
};

export default UserList;
