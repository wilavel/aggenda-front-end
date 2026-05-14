import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    Chip, Avatar, Button, Divider, IconButton, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import useFetchClinics from '../hooks/useFetchClinics';

const API_URL = process.env.REACT_APP_API_URL;
const APPOINTMENT_DURATION = 40;

const STATUS_META = {
    scheduled: { label: 'Agendada',   color: 'primary' },
    cancelled:  { label: 'Cancelada',  color: 'error'   },
    completed:  { label: 'Completada', color: 'success' },
};

const getToken = async () => {
    const session = await Auth.currentSession();
    return session.getAccessToken().getJwtToken();
};

const initials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fromMins = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const generateSlots = (start, end) => {
    const slots = [];
    let cur = toMins(start);
    const fin = toMins(end);
    while (cur + APPOINTMENT_DURATION <= fin) {
        slots.push({ start: fromMins(cur), end: fromMins(cur + APPOINTMENT_DURATION) });
        cur += APPOINTMENT_DURATION;
    }
    return slots;
};

const PatientAppointments = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient]           = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors]           = useState({});
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');

    const [cancelDialog, setCancelDialog]   = useState({ open: false, appt: null });
    const [cancelling, setCancelling]       = useState(false);

    const [rescheduleDialog, setRescheduleDialog] = useState({ open: false, appt: null });
    const [rescheduleDate, setRescheduleDate]     = useState('');
    const [availableSlots, setAvailableSlots]     = useState([]);
    const [selectedSlot, setSelectedSlot]         = useState(null);
    const [loadingSlots, setLoadingSlots]         = useState(false);
    const [rescheduling, setRescheduling]         = useState(false);
    const [rescheduleError, setRescheduleError]   = useState('');

    const { clinics } = useFetchClinics();
    const clinicMap = Object.fromEntries(clinics.map(c => [String(c.id), c.name || c.id]));

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };

            const [patientRes, apptRes, usersRes] = await Promise.all([
                axios.get(`${API_URL}/users/${patientId}`, { headers }),
                axios.get(`${API_URL}/patients/${patientId}/appointments`, { headers }),
                axios.get(`${API_URL}/users`, { headers }),
            ]);

            setPatient(patientRes.data);

            const raw = Array.isArray(apptRes.data)
                ? apptRes.data
                : (apptRes.data.appointments || []);
            setAppointments(raw.sort((a, b) =>
                `${b.appointment_date}${b.start_time}`.localeCompare(`${a.appointment_date}${a.start_time}`)
            ));

            const all = Array.isArray(usersRes.data)
                ? usersRes.data
                : (usersRes.data.users || []);
            setDoctors(Object.fromEntries(
                all.filter(u => u.group === 'Doctors').map(d => [d.id, d])
            ));
        } catch {
            setError('Error al cargar las citas del paciente');
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => { load(); }, [load]);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            const token = await getToken();
            await axios.delete(`${API_URL}/appointments/${cancelDialog.appt.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCancelDialog({ open: false, appt: null });
            load();
        } catch {
            setError('Error al cancelar la cita');
            setCancelDialog({ open: false, appt: null });
        } finally {
            setCancelling(false);
        }
    };

    useEffect(() => {
        if (!rescheduleDialog.open || !rescheduleDate || !rescheduleDialog.appt) return;

        const fetchSlots = async () => {
            setLoadingSlots(true);
            setAvailableSlots([]);
            setSelectedSlot(null);
            setRescheduleError('');
            try {
                const token = await getToken();
                const headers = { Authorization: `Bearer ${token}` };
                const doctorId = rescheduleDialog.appt.doctor_id;

                const [availRes, apptRes] = await Promise.all([
                    axios.get(`${API_URL}/doctors/${doctorId}/availability`, { headers }),
                    axios.get(`${API_URL}/doctors/${doctorId}/appointments`, { headers }),
                ]);

                const todayStr = new Date().toISOString().slice(0, 10);
                if (rescheduleDate <= todayStr) {
                    setAvailableSlots([]);
                    return;
                }

                const bookedAppts = (apptRes.data.appointments || []).filter(
                    a => a.appointment_date === rescheduleDate &&
                         a.status !== 'cancelled' &&
                         a.id !== rescheduleDialog.appt.id
                );
                const bookedTimes = new Set(bookedAppts.map(a => a.start_time));

                const dow = new Date(rescheduleDate + 'T12:00:00').getDay();
                const activeSlots = (availRes.data.slots || []).filter(
                    s => Number(s.day_of_week) === dow && s.is_active !== false
                );

                const generated = [];
                for (const avail of activeSlots) {
                    for (const block of generateSlots(avail.start_time, avail.end_time)) {
                        if (!bookedTimes.has(block.start)) {
                            generated.push({ ...block, clinic_id: avail.clinic_id });
                        }
                    }
                }
                setAvailableSlots(generated.sort((a, b) => a.start.localeCompare(b.start)));
            } catch {
                setRescheduleError('Error al cargar los horarios disponibles');
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [rescheduleDate, rescheduleDialog.open, rescheduleDialog.appt]);

    const handleReschedule = async () => {
        if (!selectedSlot) return;
        setRescheduling(true);
        setRescheduleError('');
        try {
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
            const old = rescheduleDialog.appt;

            await axios.delete(`${API_URL}/appointments/${old.id}`, { headers });
            await axios.post(`${API_URL}/appointments`, {
                doctor_id: old.doctor_id,
                patient_id: patientId,
                appointment_date: rescheduleDate,
                start_time: selectedSlot.start,
                clinic_id: selectedSlot.clinic_id,
            }, { headers });

            setRescheduleDialog({ open: false, appt: null });
            setRescheduleDate('');
            setSelectedSlot(null);
            load();
        } catch (e) {
            setRescheduleError(e.response?.data?.message || 'Error al reagendar la cita');
        } finally {
            setRescheduling(false);
        }
    };

    const openReschedule = (appt) => {
        setRescheduleDialog({ open: true, appt });
        setRescheduleDate('');
        setAvailableSlots([]);
        setSelectedSlot(null);
        setRescheduleError('');
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    const today = new Date().toISOString().slice(0, 10);
    const upcoming = appointments.filter(a => a.appointment_date >= today && a.status !== 'cancelled');
    const past     = appointments.filter(a => a.appointment_date <  today || a.status === 'cancelled');

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4, mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/pacientes')}
                    color="inherit"
                    sx={{ fontWeight: 600 }}
                >
                    Pacientes
                </Button>
                <Divider orientation="vertical" flexItem />
                {patient && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        <Avatar sx={{ bgcolor: 'success.main', width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>
                            {initials(patient.name)}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight={700} lineHeight={1}>{patient.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {patient.document_type} {patient.document_number}
                                {patient.email ? ` · ${patient.email}` : ''}
                            </Typography>
                        </Box>
                    </Box>
                )}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/appointments?patient=${patientId}`)}
                    sx={{ borderRadius: 2, px: 3, fontWeight: 600, boxShadow: 'none', flexShrink: 0 }}
                >
                    Nueva Cita
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {appointments.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    <Typography color="text.secondary">Este paciente no tiene citas registradas.</Typography>
                </Paper>
            ) : (
                <>
                    {upcoming.length > 0 && (
                        <Section title="Próximas citas" count={upcoming.length}>
                            <AppointmentTable
                                rows={upcoming}
                                doctors={doctors}
                                clinicMap={clinicMap}
                                onCancel={(appt) => setCancelDialog({ open: true, appt })}
                                onReschedule={openReschedule}
                            />
                        </Section>
                    )}
                    {past.length > 0 && (
                        <Section title="Historial" count={past.length} sx={{ mt: 3 }}>
                            <AppointmentTable rows={past} doctors={doctors} clinicMap={clinicMap} muted />
                        </Section>
                    )}
                </>
            )}

            {/* Cancel confirm dialog */}
            <Dialog
                open={cancelDialog.open}
                onClose={() => !cancelling && setCancelDialog({ open: false, appt: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>¿Cancelar esta cita?</DialogTitle>
                <DialogContent>
                    {cancelDialog.appt && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                            <Typography variant="body2">
                                <strong>Fecha:</strong>{' '}
                                {cancelDialog.appt.appointment_date?.split('-').reverse().join('/')}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Horario:</strong> {cancelDialog.appt.start_time} – {cancelDialog.appt.end_time}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Doctor:</strong> Dr. {doctors[cancelDialog.appt.doctor_id]?.name || '—'}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialog({ open: false, appt: null })} disabled={cancelling}>
                        Volver
                    </Button>
                    <Button onClick={handleCancel} color="error" variant="contained" disabled={cancelling}>
                        {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reschedule dialog */}
            <Dialog
                open={rescheduleDialog.open}
                onClose={() => !rescheduling && setRescheduleDialog({ open: false, appt: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Reagendar cita</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {rescheduleError && <Alert severity="error">{rescheduleError}</Alert>}

                        {rescheduleDialog.appt && (
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                                <Typography variant="caption" color="text.secondary">Cita actual</Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {rescheduleDialog.appt.appointment_date?.split('-').reverse().join('/')}
                                    {' · '}
                                    {rescheduleDialog.appt.start_time} – {rescheduleDialog.appt.end_time}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Dr. {doctors[rescheduleDialog.appt.doctor_id]?.name || '—'}
                                </Typography>
                            </Paper>
                        )}

                        <TextField
                            label="Nueva fecha"
                            type="date"
                            value={rescheduleDate}
                            onChange={e => { setRescheduleDate(e.target.value); setSelectedSlot(null); }}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: new Date(Date.now() + 86400000).toISOString().slice(0, 10) }}
                            fullWidth
                        />

                        {rescheduleDate && (
                            loadingSlots ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : availableSlots.length === 0 ? (
                                <Alert severity="info">No hay horarios disponibles para esta fecha.</Alert>
                            ) : (
                                <Box>
                                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                                        Horarios disponibles
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {availableSlots.map((slot, i) => {
                                            const clinicName = clinicMap[String(slot.clinic_id)] || '—';
                                            const selected = selectedSlot?.start === slot.start;
                                            return (
                                                <Chip
                                                    key={i}
                                                    label={`${slot.start} · ${clinicName}`}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    color={selected ? 'primary' : 'default'}
                                                    variant={selected ? 'filled' : 'outlined'}
                                                    sx={{ fontWeight: selected ? 700 : 400 }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Box>
                            )
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setRescheduleDialog({ open: false, appt: null })}
                        disabled={rescheduling}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleReschedule}
                        variant="contained"
                        disabled={!selectedSlot || rescheduling}
                    >
                        {rescheduling ? 'Reagendando...' : 'Confirmar reagendamiento'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

// ── sub-components ────────────────────────────────────────────────────────────

const Section = ({ title, count, children, sx }) => (
    <Box sx={sx}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
            {title}
            <Chip label={count} size="small" sx={{ ml: 1, fontWeight: 600, fontSize: '0.72rem' }} />
        </Typography>
        {children}
    </Box>
);

const AppointmentTable = ({ rows, doctors, clinicMap, muted, onCancel, onReschedule }) => (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', opacity: muted ? 0.8 : 1 }}>
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                        {['Fecha', 'Horario', 'Doctor', 'Clínica', 'Estado', ...(onCancel ? [''] : [])].map(h => (
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
                    {rows.map(appt => {
                        const doctor = doctors[appt.doctor_id];
                        const clinic = clinicMap[String(appt.clinic_id)] || '—';
                        const meta   = STATUS_META[appt.status] || { label: appt.status, color: 'default' };
                        const [y, m, d] = (appt.appointment_date || '').split('-');
                        const dateLabel = y ? `${d}/${m}/${y}` : '—';

                        return (
                            <TableRow
                                key={appt.id}
                                sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>{dateLabel}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {appt.start_time} – {appt.end_time}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {appt.duration_minutes} min
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {doctor ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: 11 }}>
                                                {initials(doctor.name)}
                                            </Avatar>
                                            <Typography variant="body2">Dr. {doctor.name}</Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.disabled">—</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <BusinessIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                        <Typography variant="body2">{clinic}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={meta.label}
                                        color={meta.color}
                                        size="small"
                                        sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                                    />
                                </TableCell>
                                {onCancel && (
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                            <Tooltip title="Reagendar">
                                                <IconButton size="small" color="primary" onClick={() => onReschedule(appt)}>
                                                    <EventRepeatIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Cancelar cita">
                                                <IconButton size="small" color="error" onClick={() => onCancel(appt)}>
                                                    <CancelIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
);

export default PatientAppointments;
