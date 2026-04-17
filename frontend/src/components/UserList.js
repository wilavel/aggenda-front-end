import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    Box, IconButton, Dialog, Tooltip, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import axios from 'axios';
import EditUser from './EditUser';

const API_URL = process.env.REACT_APP_API_URL;

const GROUP_LABELS = {
    Doctors: { label: 'Doctor', color: 'primary' },
    Patients: { label: 'Paciente', color: 'success' },
    Managers: { label: 'Gerente', color: 'warning' },
    Administrators: { label: 'Admin', color: 'error' },
};

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const user = await Auth.currentAuthenticatedUser();
            if (!user) throw new Error('No hay usuario autenticado');

            const session = await Auth.currentSession();
            const token = session.getAccessToken().getJwtToken();

            const response = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const items = Array.isArray(response.data)
                ? response.data
                : (response.data.users || []);
            setUsers(items);
        } catch (err) {
            if (err.message === 'No current user' || err.message === 'No hay usuario autenticado' || err.response?.status === 401) {
                setError('Sesión expirada. Redirigiendo al login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(err.message || 'Error al cargar los usuarios');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = async (userId) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este usuario?')) return;
        try {
            const session = await Auth.currentSession();
            const token = session.getAccessToken().getJwtToken();
            await axios.delete(`${API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            setError('Error al eliminar el usuario');
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

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Dialog open={editDialogOpen} onClose={() => { setEditDialogOpen(false); fetchUsers(); }} maxWidth="md" fullWidth>
                {selectedUser && (
                    <EditUser id={selectedUser.id} onClose={() => { setEditDialogOpen(false); fetchUsers(); }} />
                )}
            </Dialog>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell>Documento</TableCell>
                            <TableCell>Grupo</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => {
                            const groupMeta = GROUP_LABELS[user.group] || { label: user.group || '-', color: 'default' };
                            return (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone || '-'}</TableCell>
                                    <TableCell>
                                        {user.document_type && user.document_number
                                            ? `${user.document_type} ${user.document_number}`
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={groupMeta.label}
                                            color={groupMeta.color}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {user.group === 'Doctors' && (
                                            <>
                                                <Tooltip title="Ver agenda de citas">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => navigate(`/appointments?doctor=${user.id}`)}
                                                    >
                                                        <CalendarMonthIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Gestionar disponibilidad">
                                                    <IconButton
                                                        color="secondary"
                                                        onClick={() => navigate(`/doctors/${user.id}/availability`)}
                                                    >
                                                        <EventNoteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                        <Tooltip title="Editar">
                                            <IconButton
                                                color="primary"
                                                onClick={() => { setSelectedUser(user); setEditDialogOpen(true); }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton color="error" onClick={() => handleDeleteClick(user.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
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
