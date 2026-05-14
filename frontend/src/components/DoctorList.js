import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    Box, IconButton, Dialog, Tooltip, Avatar, InputBase, Button, Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios';
import EditUser from './EditUser';

const API_URL = process.env.REACT_APP_API_URL;

const initials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const DoctorList = ({ userGroup }) => {
    const isAdmin = userGroup === 'Administrators' || userGroup === 'Managers';

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => { fetchDoctors(); }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            setError('');
            const session = await Auth.currentSession();
            const token = session.getAccessToken().getJwtToken();
            const response = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const all = Array.isArray(response.data)
                ? response.data
                : (response.data.users || []);
            setDoctors(all.filter(u => u.group === 'Doctors'));
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar los doctores');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('¿Eliminar este doctor?')) return;
        try {
            const session = await Auth.currentSession();
            const token = session.getAccessToken().getJwtToken();
            await axios.delete(`${API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDoctors(prev => prev.filter(u => u.id !== userId));
        } catch {
            setError('Error al eliminar el doctor');
        }
    };

    const filtered = doctors.filter(u => {
        const q = search.toLowerCase();
        return (
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.document_number?.includes(q) ||
            u.phone?.includes(q)
        );
    });

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 2 }}>
                    <CircularProgress />
                    <Typography color="text.secondary">Cargando doctores...</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mt: 4, mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Doctores</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {doctors.length} doctor{doctors.length !== 1 ? 'es' : ''} registrado{doctors.length !== 1 ? 's' : ''}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/create-user?group=Doctors')}
                    sx={{ borderRadius: 2, px: 3, py: 1.2, fontWeight: 600, boxShadow: 'none' }}
                >
                    Nuevo Doctor
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper
                variant="outlined"
                sx={{ mb: 2, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2 }}
            >
                <SearchIcon sx={{ color: 'text.disabled' }} />
                <InputBase
                    placeholder="Buscar por nombre, email o documento..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    fullWidth
                    sx={{ fontSize: '0.95rem' }}
                />
            </Paper>

            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                {['Doctor', 'Contacto', 'Documento', 'Clínicas', ''].map(h => (
                                    <TableCell
                                        key={h}
                                        align={h === '' ? 'right' : 'left'}
                                        sx={{
                                            fontWeight: 700, fontSize: '0.72rem',
                                            textTransform: 'uppercase', letterSpacing: 0.6,
                                            color: 'text.secondary', py: 1.5,
                                        }}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map(user => (
                                <TableRow
                                    key={user.id}
                                    sx={{ '&:hover': { bgcolor: 'action.hover' }, '&:last-child td': { border: 0 } }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: 13, fontWeight: 700 }}>
                                                {initials(user.name)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>Dr. {user.name}</Typography>
                                                {user.email && (
                                                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2">{user.email}</Typography>
                                        {user.phone && (
                                            <Typography variant="caption" color="text.secondary">{user.phone}</Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {user.document_type && user.document_number
                                                ? `${user.document_type} ${user.document_number}`
                                                : '—'}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {user.clinics?.length
                                                ? user.clinics.map((c, i) => (
                                                    <Chip key={i} label={c} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                ))
                                                : <Typography variant="caption" color="text.disabled">—</Typography>
                                            }
                                        </Box>
                                    </TableCell>

                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25 }}>
                                            <Tooltip title="Ver agenda">
                                                <IconButton size="small" color="primary" onClick={() => navigate(`/appointments?doctor=${user.id}`)}>
                                                    <CalendarMonthIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Gestionar disponibilidad">
                                                <IconButton size="small" color="secondary" onClick={() => navigate(`/doctors/${user.id}/availability`)}>
                                                    <EventNoteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {isAdmin && (
                                                <>
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small" onClick={() => { setSelectedUser(user); setEditDialogOpen(true); }}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Eliminar">
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary">
                                            {search ? 'No se encontraron doctores con ese criterio' : 'No hay doctores registrados'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog
                open={editDialogOpen}
                onClose={() => { setEditDialogOpen(false); fetchDoctors(); }}
                maxWidth="md"
                fullWidth
            >
                {selectedUser && (
                    <EditUser
                        id={selectedUser.id}
                        onClose={() => { setEditDialogOpen(false); fetchDoctors(); }}
                    />
                )}
            </Dialog>
        </Container>
    );
};

export default DoctorList;
