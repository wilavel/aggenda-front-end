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
    Box
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone || '-'}</TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
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