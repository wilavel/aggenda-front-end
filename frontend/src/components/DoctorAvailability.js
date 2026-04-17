import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import {
    Container, Typography, Box, Button, Alert, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, InputLabel, Select, MenuItem, Chip,
    Checkbox, FormControlLabel, Divider, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useFetchClinics from '../hooks/useFetchClinics';

const API_URL = process.env.REACT_APP_API_URL;

const DAYS = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 0, label: 'Domingo' },
];

const WEEKDAYS = [1, 2, 3, 4, 5];

const EMPTY_DAY_TIME = { start_time: '', end_time: '' };

const EMPTY_CREATE = {
    clinic_id: '',
    days: [],          // selected day values
    dayTimes: {},      // { [dayValue]: { start_time, end_time } }
};

const EMPTY_EDIT = { clinic_id: '', day_of_week: '', start_time: '', end_time: '' };

// ─────────────────────────────────────────────────────────────────────────────

const DoctorAvailability = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [slots, setSlots] = useState([]);
    const [doctorName, setDoctorName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState(EMPTY_CREATE);
    const [createError, setCreateError] = useState('');
    const [saving, setSaving] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editSlot, setEditSlot] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY_EDIT);
    const [editError, setEditError] = useState('');
    const [editSaving, setEditSaving] = useState(false);

    const { clinics } = useFetchClinics();

    const getToken = async () => {
        const session = await Auth.currentSession();
        return session.getAccessToken().getJwtToken();
    };

    const fetchSlots = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const token = await getToken();
            const res = await axios.get(`${API_URL}/doctors/${doctorId}/availability`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSlots(res.data.slots || []);
        } catch {
            setError('Error al cargar la disponibilidad');
        } finally {
            setLoading(false);
        }
    }, [doctorId]);

    const fetchDoctorName = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await axios.get(`${API_URL}/users/${doctorId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDoctorName(res.data.name || doctorId);
        } catch {
            setDoctorName(doctorId);
        }
    }, [doctorId]);

    useEffect(() => {
        fetchSlots();
        fetchDoctorName();
    }, [fetchSlots, fetchDoctorName]);

    // ── helpers ───────────────────────────────────────────────────────────────

    const clinicName = (id) => clinics.find(c => c.id === id)?.name || id;

    const slotsByDay = DAYS.map(d => ({
        ...d,
        slots: slots.filter(s => Number(s.day_of_week) === d.value),
    })).filter(d => d.slots.length > 0);

    // ── create: day selection ─────────────────────────────────────────────────

    const toggleDay = (dayValue) => {
        setCreateForm(prev => {
            const selected = prev.days.includes(dayValue);
            const days = selected
                ? prev.days.filter(d => d !== dayValue)
                : [...prev.days, dayValue];
            const dayTimes = { ...prev.dayTimes };
            if (selected) {
                delete dayTimes[dayValue];
            } else {
                dayTimes[dayValue] = { ...EMPTY_DAY_TIME };
            }
            return { ...prev, days, dayTimes };
        });
    };

    // "Lun–Vie": select all weekdays with a shared time, deselect if all already on
    const toggleWeekdays = () => {
        setCreateForm(prev => {
            const allOn = WEEKDAYS.every(d => prev.days.includes(d));
            if (allOn) {
                // deselect weekdays
                const days = prev.days.filter(d => !WEEKDAYS.includes(d));
                const dayTimes = { ...prev.dayTimes };
                WEEKDAYS.forEach(d => delete dayTimes[d]);
                return { ...prev, days, dayTimes };
            } else {
                // select weekdays, keep existing times if already set
                const days = [...new Set([...prev.days, ...WEEKDAYS])];
                const dayTimes = { ...prev.dayTimes };
                // find first weekday that already has a time to use as reference
                const ref = WEEKDAYS.map(d => dayTimes[d]).find(t => t?.start_time);
                WEEKDAYS.forEach(d => {
                    if (!dayTimes[d]) dayTimes[d] = ref ? { ...ref } : { ...EMPTY_DAY_TIME };
                });
                return { ...prev, days, dayTimes };
            }
        });
    };

    const setDayTime = (dayValue, field, value) => {
        setCreateForm(prev => ({
            ...prev,
            dayTimes: {
                ...prev.dayTimes,
                [dayValue]: { ...prev.dayTimes[dayValue], [field]: value },
            },
        }));
    };

    // Apply a single time to all currently selected days
    const applyTimeToAll = (start, end) => {
        setCreateForm(prev => {
            const dayTimes = { ...prev.dayTimes };
            prev.days.forEach(d => { dayTimes[d] = { start_time: start, end_time: end }; });
            return { ...prev, dayTimes };
        });
    };

    const validateCreate = () => {
        if (!createForm.clinic_id) return 'Selecciona una clínica';
        if (createForm.days.length === 0) return 'Selecciona al menos un día';
        for (const d of createForm.days) {
            const t = createForm.dayTimes[d] || {};
            const label = DAYS.find(x => x.value === d)?.label || d;
            if (!t.start_time) return `Ingresa la hora de inicio para el ${label}`;
            if (!t.end_time) return `Ingresa la hora de fin para el ${label}`;
            if (t.start_time >= t.end_time) return `La hora de inicio debe ser menor a la de fin para el ${label}`;
        }
        return '';
    };

    const handleCreate = async () => {
        const err = validateCreate();
        if (err) { setCreateError(err); return; }
        setSaving(true);
        setCreateError('');
        try {
            const token = await getToken();
            await Promise.all(
                createForm.days.map(day =>
                    axios.post(
                        `${API_URL}/doctors/${doctorId}/availability`,
                        {
                            clinic_id: createForm.clinic_id,
                            day_of_week: day,
                            start_time: createForm.dayTimes[day].start_time,
                            end_time: createForm.dayTimes[day].end_time,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                )
            );
            setCreateOpen(false);
            fetchSlots();
        } catch (e) {
            setCreateError(e.response?.data?.message || 'Error al guardar los horarios');
        } finally {
            setSaving(false);
        }
    };

    // ── edit ──────────────────────────────────────────────────────────────────

    const openEdit = (slot) => {
        setEditSlot(slot);
        setEditForm({
            clinic_id: slot.clinic_id,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
        });
        setEditError('');
        setEditOpen(true);
    };

    const handleEdit = async () => {
        if (!editForm.start_time || !editForm.end_time) { setEditError('Completa los horarios'); return; }
        if (editForm.start_time >= editForm.end_time) { setEditError('La hora de inicio debe ser menor a la de fin'); return; }
        setEditSaving(true);
        setEditError('');
        try {
            const token = await getToken();
            await axios.put(
                `${API_URL}/doctors/${doctorId}/availability/${editSlot.slot_id}`,
                {
                    clinic_id: editForm.clinic_id,
                    day_of_week: Number(editForm.day_of_week),
                    start_time: editForm.start_time,
                    end_time: editForm.end_time,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEditOpen(false);
            fetchSlots();
        } catch (e) {
            setEditError(e.response?.data?.message || 'Error al guardar el horario');
        } finally {
            setEditSaving(false);
        }
    };

    // ── delete ────────────────────────────────────────────────────────────────

    const handleDelete = async (slot) => {
        if (!window.confirm(`¿Eliminar el horario del ${slot.day_name} ${slot.start_time}–${slot.end_time}?`)) return;
        try {
            const token = await getToken();
            await axios.delete(`${API_URL}/doctors/${doctorId}/availability/${slot.slot_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchSlots();
        } catch {
            setError('Error al eliminar el horario');
        }
    };

    // ── derived state for weekday shortcut ────────────────────────────────────

    const allWeekdays = WEEKDAYS.every(d => createForm.days.includes(d));
    const someWeekdays = WEEKDAYS.some(d => createForm.days.includes(d)) && !allWeekdays;

    // first weekday time (to pre-fill "apply to all" reference)
    const firstWeekdayTime = createForm.days.find(d => WEEKDAYS.includes(d));
    const weekdayRef = firstWeekdayTime ? createForm.dayTimes[firstWeekdayTime] : null;

    // sorted selected days for rendering
    const selectedDaysOrdered = DAYS.filter(d => createForm.days.includes(d.value));

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/users')}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5">Disponibilidad</Typography>
                    {doctorName && (
                        <Typography variant="subtitle1" color="text.secondary">
                            Dr. {doctorName}
                        </Typography>
                    )}
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
                    setCreateForm(EMPTY_CREATE);
                    setCreateError('');
                    setCreateOpen(true);
                }}>
                    Agregar horarios
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress />
                </Box>
            ) : slots.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No hay horarios configurados. Agrega el primero.</Typography>
                </Paper>
            ) : (
                slotsByDay.map(day => (
                    <Box key={day.value} sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>{day.label}</Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Clínica</TableCell>
                                        <TableCell>Inicio</TableCell>
                                        <TableCell>Fin</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {day.slots.map(slot => (
                                        <TableRow key={slot.slot_id}>
                                            <TableCell>{clinicName(slot.clinic_id)}</TableCell>
                                            <TableCell>{slot.start_time}</TableCell>
                                            <TableCell>{slot.end_time}</TableCell>
                                            <TableCell>
                                                <Chip label={slot.is_active ? 'Activo' : 'Inactivo'}
                                                    color={slot.is_active ? 'success' : 'default'} size="small" />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" color="primary" onClick={() => openEdit(slot)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(slot)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ))
            )}

            {/* ── Create dialog ─────────────────────────────────────────────── */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Agregar horarios</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {createError && <Alert severity="error">{createError}</Alert>}

                        {/* Clínica */}
                        <FormControl fullWidth required>
                            <InputLabel>Clínica</InputLabel>
                            <Select
                                value={createForm.clinic_id}
                                label="Clínica"
                                onChange={e => setCreateForm({ ...createForm, clinic_id: e.target.value })}
                            >
                                {clinics.map(c => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Días */}
                        <Box>
                            <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                                Selecciona los días *
                            </Typography>

                            {/* Lun–Vie shortcut */}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={allWeekdays}
                                        indeterminate={someWeekdays}
                                        onChange={toggleWeekdays}
                                        size="small"
                                    />
                                }
                                label={<Typography variant="body2" fontWeight={500}>Lunes a Viernes</Typography>}
                            />
                            <Divider sx={{ my: 0.5 }} />
                            <Grid container>
                                {DAYS.map(d => (
                                    <Grid item xs={6} key={d.value}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={createForm.days.includes(d.value)}
                                                    onChange={() => toggleDay(d.value)}
                                                    size="small"
                                                />
                                            }
                                            label={<Typography variant="body2">{d.label}</Typography>}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Horarios por día */}
                        {selectedDaysOrdered.length > 0 && (
                            <Box>
                                <Divider sx={{ mb: 1.5 }} />

                                {/* Aplicar mismo horario a todos — solo si hay >1 día */}
                                {selectedDaysOrdered.length > 1 && (
                                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                                        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                                            Aplicar mismo horario a todos los días
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <TextField
                                                label="Inicio"
                                                type="time"
                                                size="small"
                                                defaultValue=""
                                                id="global-start"
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ step: 300 }}
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                label="Fin"
                                                type="time"
                                                size="small"
                                                defaultValue=""
                                                id="global-end"
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ step: 300 }}
                                                sx={{ flex: 1 }}
                                            />
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    const start = document.getElementById('global-start').value;
                                                    const end = document.getElementById('global-end').value;
                                                    if (start && end) applyTimeToAll(start, end);
                                                }}
                                            >
                                                Aplicar
                                            </Button>
                                        </Box>
                                    </Box>
                                )}

                                {/* Fila por día */}
                                <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                                    Horario por día
                                </Typography>
                                {selectedDaysOrdered.map(d => {
                                    const t = createForm.dayTimes[d.value] || EMPTY_DAY_TIME;
                                    return (
                                        <Box
                                            key={d.value}
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{ width: 90, flexShrink: 0, fontWeight: 500 }}
                                            >
                                                {d.label}
                                            </Typography>
                                            <TextField
                                                label="Inicio"
                                                type="time"
                                                size="small"
                                                value={t.start_time}
                                                onChange={e => setDayTime(d.value, 'start_time', e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ step: 300 }}
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                label="Fin"
                                                type="time"
                                                size="small"
                                                value={t.end_time}
                                                onChange={e => setDayTime(d.value, 'end_time', e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                inputProps={{ step: 300 }}
                                                sx={{ flex: 1 }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)} disabled={saving}>Cancelar</Button>
                    <Button onClick={handleCreate} variant="contained" disabled={saving}>
                        {saving
                            ? 'Guardando...'
                            : `Crear ${createForm.days.length > 0 ? createForm.days.length : ''} horario${createForm.days.length !== 1 ? 's' : ''}`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Edit dialog ───────────────────────────────────────────────── */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Editar horario</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {editError && <Alert severity="error">{editError}</Alert>}

                        <FormControl fullWidth required>
                            <InputLabel>Clínica</InputLabel>
                            <Select
                                value={editForm.clinic_id}
                                label="Clínica"
                                onChange={e => setEditForm({ ...editForm, clinic_id: e.target.value })}
                            >
                                {clinics.map(c => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>Día</InputLabel>
                            <Select
                                value={editForm.day_of_week}
                                label="Día"
                                onChange={e => setEditForm({ ...editForm, day_of_week: e.target.value })}
                            >
                                {DAYS.map(d => (
                                    <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            required fullWidth label="Hora de inicio" type="time"
                            value={editForm.start_time}
                            onChange={e => setEditForm({ ...editForm, start_time: e.target.value })}
                            InputLabelProps={{ shrink: true }} inputProps={{ step: 300 }}
                        />
                        <TextField
                            required fullWidth label="Hora de fin" type="time"
                            value={editForm.end_time}
                            onChange={e => setEditForm({ ...editForm, end_time: e.target.value })}
                            InputLabelProps={{ shrink: true }} inputProps={{ step: 300 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)} disabled={editSaving}>Cancelar</Button>
                    <Button onClick={handleEdit} variant="contained" disabled={editSaving}>
                        {editSaving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DoctorAvailability;
