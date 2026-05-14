import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import {
    Container, Typography, Box, Button, Alert, CircularProgress,
    Paper, Dialog, DialogTitle, DialogContent, DialogActions,
    Chip, IconButton, Tooltip, Autocomplete, TextField,
    Avatar, Divider, Step, StepLabel, Stepper,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import useFetchClinics from '../hooks/useFetchClinics';

const API_URL = process.env.REACT_APP_API_URL;

const WEEK_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const APPOINTMENT_DURATION = 40;

// ── time helpers ──────────────────────────────────────────────────────────────

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

const initials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

// ── component ─────────────────────────────────────────────────────────────────

const AppointmentCalendar = ({ userGroup, currentUserEmail }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const doctorIdFromUrl  = searchParams.get('doctor');
    const patientIdFromUrl = searchParams.get('patient');
    const isDoctor = userGroup === 'Doctors';

    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );

    // step: 'patient' | 'doctor' | 'calendar'
    const [step, setStep] = useState(
        isDoctor ? 'calendar' : patientIdFromUrl ? 'doctor' : 'patient'
    );

    const [allPatients, setAllPatients] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientInput, setPatientInput] = useState('');

    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorInput, setDoctorInput] = useState('');

    const [availabilitySlots, setAvailabilitySlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loadingCalendar, setLoadingCalendar] = useState(false);

    // day-detail dialog
    const [dayDialog, setDayDialog] = useState({ open: false, day: null });

    // confirm-booking dialog
    const [bookDialog, setBookDialog] = useState({ open: false, day: null, slot: null });
    const [bookPatient, setBookPatient] = useState(null);
    const [bookPatientInput, setBookPatientInput] = useState('');
    const [bookError, setBookError] = useState('');
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');

    const { clinics } = useFetchClinics();
    const clinicMap = Object.fromEntries(clinics.map(c => [String(c.id), c.name || c.id]));

    const getToken = async () => {
        const session = await Auth.currentSession();
        return session.getAccessToken().getJwtToken();
    };

    // ── load users once ───────────────────────────────────────────────────────

    useEffect(() => {
        const load = async () => {
            try {
                const token = await getToken();
                const res = await axios.get(`${API_URL}/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const all = res.data?.users || res.data?.data || res.data || [];
                const doctorList = all.filter(u => u.group === 'Doctors');
                const patientList = all.filter(
                    u => u.group === 'Clients' || u.group === 'Patients'
                );
                setAllDoctors(doctorList);
                setAllPatients(patientList);

                // Doctor: auto-seleccionarse por email
                if (isDoctor && currentUserEmail) {
                    const self = doctorList.find(
                        d => d.email?.toLowerCase() === currentUserEmail.toLowerCase()
                    );
                    if (self) setSelectedDoctor(self);

                // Viene de DoctorList con ?doctor=: ir directo al calendario del doctor
                } else if (doctorIdFromUrl) {
                    const doc = doctorList.find(d => d.id === doctorIdFromUrl);
                    if (doc) {
                        setSelectedDoctor(doc);
                        setStep('calendar');
                    }
                }

                // Viene de PatientList con ?patient=: pre-seleccionar paciente e ir a elegir doctor
                if (patientIdFromUrl) {
                    const patient = patientList.find(p => p.id === patientIdFromUrl);
                    if (patient) {
                        setSelectedPatient(patient);
                        setStep('doctor');
                    }
                }
            } catch {
                setError('Error al cargar los datos de usuarios');
            } finally {
                setLoadingUsers(false);
            }
        };
        load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── load calendar data when doctor changes ────────────────────────────────

    const fetchCalendar = useCallback(async (doctorId) => {
        try {
            setLoadingCalendar(true);
            const token = await getToken();
            const [availRes, apptRes] = await Promise.all([
                axios.get(`${API_URL}/doctors/${doctorId}/availability`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_URL}/doctors/${doctorId}/appointments`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setAvailabilitySlots(availRes.data.slots || []);
            setAppointments(apptRes.data.appointments || []);
        } catch {
            setAvailabilitySlots([]);
            setAppointments([]);
        } finally {
            setLoadingCalendar(false);
        }
    }, []);

    useEffect(() => {
        if (selectedDoctor && step === 'calendar') fetchCalendar(selectedDoctor.id);
    }, [selectedDoctor, step, fetchCalendar]);

    // ── step navigation ───────────────────────────────────────────────────────

    const confirmPatient = () => {
        if (!selectedPatient) return;
        setStep('doctor');
    };

    const confirmDoctor = () => {
        if (!selectedDoctor) return;
        setStep('calendar');
    };

    const resetPatient = () => {
        setSelectedPatient(null);
        setPatientInput('');
        setSelectedDoctor(null);
        setDoctorInput('');
        setAvailabilitySlots([]);
        setAppointments([]);
        setStep('patient');
    };

    const resetDoctor = () => {
        setSelectedDoctor(null);
        setDoctorInput('');
        setAvailabilitySlots([]);
        setAppointments([]);
        setStep('doctor');
    };

    // ── calendar helpers ──────────────────────────────────────────────────────

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const cells = [
        ...Array(firstDayOfWeek).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const toDateStr = (day) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const appointmentsOnDay = (day) =>
        appointments.filter(
            a => a.appointment_date === toDateStr(day) && a.status !== 'cancelled'
        );

    const hasAvailability = (day) => {
        const dow = new Date(year, month, day).getDay();
        return availabilitySlots.some(
            s => Number(s.day_of_week) === dow && s.is_active !== false
        );
    };

    const isPastDay = (day) =>
        new Date(year, month, day) <
        new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const isToday = (day) =>
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const timeSlotsForDay = (day) => {
        const dow = new Date(year, month, day).getDay();
        const ds = toDateStr(day);
        const active = availabilitySlots.filter(
            s => Number(s.day_of_week) === dow && s.is_active !== false
        );
        const dayAppts = appointments.filter(
            a => a.appointment_date === ds && a.status !== 'cancelled'
        );
        const patientMap = Object.fromEntries(allPatients.map(p => [p.id, p]));

        const blocks = [];
        for (const avail of active) {
            for (const block of generateSlots(avail.start_time, avail.end_time)) {
                const appt = dayAppts.find(a => a.start_time === block.start);
                blocks.push({
                    ...block,
                    clinic_id: avail.clinic_id,
                    booked: !!appt,
                    appointment: appt || null,
                    patient: appt ? patientMap[appt.patient_id] : null,
                });
            }
        }
        return blocks.sort((a, b) => a.start.localeCompare(b.start));
    };

    // ── booking handlers ──────────────────────────────────────────────────────

    const handleDayClick = (day) => {
        if (!selectedDoctor || !hasAvailability(day) || isPastDay(day)) return;
        setDayDialog({ open: true, day });
    };

    const handleOpenBook = (day, slot) => {
        setBookPatient(selectedPatient);
        setBookPatientInput(selectedPatient?.name || '');
        setBookDialog({ open: true, day, slot });
        setBookError('');
    };

    const handleCreateAppointment = async () => {
        if (!bookPatient) { setBookError('Selecciona un paciente para continuar.'); return; }
        setSaving(true);
        setBookError('');
        try {
            const token = await getToken();
            await axios.post(
                `${API_URL}/appointments`,
                {
                    doctor_id: selectedDoctor.id,
                    patient_id: bookPatient.id,
                    appointment_date: toDateStr(bookDialog.day),
                    start_time: bookDialog.slot.start,
                    clinic_id: bookDialog.slot.clinic_id,
                },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setBookDialog({ open: false, day: null, slot: null });
            setDayDialog({ open: false, day: null });
            fetchCalendar(selectedDoctor.id);
        } catch (e) {
            setBookError(e.response?.data?.message || 'Error al crear la cita');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('¿Cancelar esta cita?')) return;
        try {
            const token = await getToken();
            await axios.delete(`${API_URL}/appointments/${appointmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchCalendar(selectedDoctor.id);
        } catch {
            setError('Error al cancelar la cita');
        }
    };

    const monthLabel = currentDate.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
    const daySlots = dayDialog.day ? timeSlotsForDay(dayDialog.day) : [];
    const bookedCount = dayDialog.day ? appointmentsOnDay(dayDialog.day).length : 0;
    const availableCount = daySlots.filter(s => !s.booked).length;

    // ── render ────────────────────────────────────────────────────────────────

    const stepIndex = step === 'patient' ? 0 : step === 'doctor' ? 1 : 2;

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="h5" fontWeight={600}>
                    Agenda de Citas
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Stepper — solo para managers */}
            {!isDoctor && (
                <Stepper activeStep={stepIndex} sx={{ mb: 3 }}>
                    <Step completed={stepIndex > 0}>
                        <StepLabel>Buscar paciente</StepLabel>
                    </Step>
                    <Step completed={stepIndex > 1}>
                        <StepLabel>Elegir doctor</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Agendar cita</StepLabel>
                    </Step>
                </Stepper>
            )}

            {/* ── STEP 1: buscar paciente ──────────────────────────────────────── */}
            {step === 'patient' && (
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PersonSearchIcon color="primary" />
                        <Typography variant="h6">Buscar paciente</Typography>
                    </Box>

                    {loadingUsers ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Autocomplete
                                options={allPatients}
                                getOptionLabel={(p) =>
                                    `${p.name}${p.document_number ? ` · ${p.document_type || ''} ${p.document_number}` : ''}`
                                }
                                filterOptions={(opts, { inputValue }) => {
                                    const q = inputValue.toLowerCase();
                                    return opts.filter(p =>
                                        p.name?.toLowerCase().includes(q) ||
                                        p.document_number?.includes(q) ||
                                        p.email?.toLowerCase().includes(q) ||
                                        p.phone?.includes(q)
                                    );
                                }}
                                value={selectedPatient}
                                inputValue={patientInput}
                                onInputChange={(_, v) => setPatientInput(v)}
                                onChange={(_, v) => setSelectedPatient(v)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Nombre, documento o correo del paciente"
                                        placeholder="Escribe para buscar..."
                                        autoFocus
                                    />
                                )}
                                noOptionsText="No se encontró ningún paciente"
                                renderOption={(props, p) => (
                                    <Box component="li" {...props} sx={{ gap: 1.5 }}>
                                        <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>
                                            {initials(p.name)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {p.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {p.document_type} {p.document_number}
                                                {p.email ? ` · ${p.email}` : ''}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            />

                            {/* Patient card preview */}
                            {selectedPatient && (
                                <Paper
                                    variant="outlined"
                                    sx={{ mt: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'primary.50' }}
                                >
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                        {initials(selectedPatient.name)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontWeight={600}>{selectedPatient.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedPatient.document_type} {selectedPatient.document_number}
                                        </Typography>
                                        {selectedPatient.phone && (
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedPatient.phone}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Chip label="Paciente seleccionado" color="primary" size="small" />
                                </Paper>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                <Button
                                    variant="contained"
                                    disabled={!selectedPatient}
                                    onClick={confirmPatient}
                                    size="large"
                                >
                                    Continuar →
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            )}

            {/* ── STEP 2: elegir doctor ────────────────────────────────────────── */}
            {step === 'doctor' && (
                <Paper sx={{ p: 3 }}>
                    {/* Selected patient summary */}
                    <Box
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 1.5, mb: 2,
                            p: 1.5, bgcolor: 'grey.50', borderRadius: 1,
                        }}
                    >
                        <PersonIcon color="primary" />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">Paciente</Typography>
                            <Typography fontWeight={600}>{selectedPatient?.name}</Typography>
                        </Box>
                        <IconButton size="small" onClick={resetPatient} title="Cambiar paciente">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <LocalHospitalIcon color="primary" />
                        <Typography variant="h6">Elegir doctor</Typography>
                    </Box>

                    <Autocomplete
                        options={allDoctors}
                        getOptionLabel={(d) => `Dr. ${d.name}`}
                        filterOptions={(opts, { inputValue }) => {
                            const q = inputValue.toLowerCase();
                            return opts.filter(d =>
                                d.name?.toLowerCase().includes(q) ||
                                d.email?.toLowerCase().includes(q)
                            );
                        }}
                        value={selectedDoctor}
                        inputValue={doctorInput}
                        onInputChange={(_, v) => setDoctorInput(v)}
                        onChange={(_, v) => setSelectedDoctor(v)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Nombre del doctor"
                                placeholder="Escribe para buscar..."
                                autoFocus
                            />
                        )}
                        noOptionsText="No se encontró ningún doctor"
                        renderOption={(props, d) => (
                            <Box component="li" {...props} sx={{ gap: 1.5 }}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'secondary.main' }}>
                                    {initials(d.name)}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        Dr. {d.name}
                                    </Typography>
                                    {d.email && (
                                        <Typography variant="caption" color="text.secondary">
                                            {d.email}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}
                    />

                    {selectedDoctor && (
                        <Paper
                            variant="outlined"
                            sx={{ mt: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                                {initials(selectedDoctor.name)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography fontWeight={600}>Dr. {selectedDoctor.name}</Typography>
                                {selectedDoctor.email && (
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedDoctor.email}
                                    </Typography>
                                )}
                            </Box>
                            <Chip label="Doctor seleccionado" color="secondary" size="small" />
                        </Paper>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button onClick={resetPatient} color="inherit">
                            ← Volver
                        </Button>
                        <Button
                            variant="contained"
                            disabled={!selectedDoctor}
                            onClick={confirmDoctor}
                            size="large"
                        >
                            Ver calendario →
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* ── STEP 3: calendario ───────────────────────────────────────────── */}
            {step === 'calendar' && (
                <>
                    {/* Context bar */}
                    <Paper
                        sx={{
                            p: 2, mb: 2,
                            display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
                        }}
                    >
                        {/* Patient — solo para managers */}
                        {!isDoctor && (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 160 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
                                        {initials(selectedPatient?.name)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Paciente
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {selectedPatient?.name}
                                        </Typography>
                                    </Box>
                                    <IconButton size="small" onClick={resetPatient} title="Cambiar paciente">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Divider orientation="vertical" flexItem />
                            </>
                        )}

                        {/* Doctor */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 160 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: 14 }}>
                                {initials(selectedDoctor?.name)}
                            </Avatar>
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Doctor
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    Dr. {selectedDoctor?.name}
                                </Typography>
                            </Box>
                            {!isDoctor && (
                                <IconButton size="small" onClick={resetDoctor} title="Cambiar doctor">
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>

                        {/* Botón disponibilidad — managers y el propio doctor */}
                        {selectedDoctor && (
                            <>
                                <Divider orientation="vertical" flexItem />
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<CalendarMonthIcon />}
                                    component={RouterLink}
                                    to={`/doctors/${selectedDoctor.id}/availability`}
                                >
                                    Gestionar disponibilidad
                                </Button>
                            </>
                        )}
                    </Paper>

                    {/* Calendar */}
                    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
                        {/* Month nav */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <IconButton onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                                <ChevronLeftIcon />
                            </IconButton>
                            <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                {monthLabel}
                            </Typography>
                            <IconButton onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                                <ChevronRightIcon />
                            </IconButton>
                        </Box>

                        {/* Day headers */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
                            {WEEK_LABELS.map(l => (
                                <Box key={l} sx={{ textAlign: 'center', py: 0.5 }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                                        {l}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Grid */}
                        {loadingCalendar ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                                {cells.map((day, idx) => {
                                    if (!day) return <Box key={`b-${idx}`} sx={{ minHeight: { xs: 60, sm: 80 } }} />;

                                    const past = isPastDay(day);
                                    const today_ = isToday(day);
                                    const avail = hasAvailability(day) && !past;
                                    const dayAppts = appointmentsOnDay(day);
                                    const clinicsOnDay = [...new Set(
                                        dayAppts.map(a => clinicMap[String(a.clinic_id)] || a.clinic_id).filter(Boolean)
                                    )];
                                    const tooltipText = past
                                        ? 'Fecha pasada'
                                        : !avail
                                        ? 'Sin disponibilidad'
                                        : `${dayAppts.length} cita(s)${clinicsOnDay.length ? ` · ${clinicsOnDay.join(', ')}` : ''}`;

                                    return (
                                        <Tooltip key={day} title={tooltipText} arrow placement="top">
                                            <Box
                                                onClick={() => handleDayClick(day)}
                                                sx={{
                                                    minHeight: { xs: 60, sm: 80 },
                                                    p: 0.5,
                                                    border: '1px solid',
                                                    borderRadius: 1,
                                                    borderColor: today_ ? 'primary.main' : avail ? 'primary.light' : 'grey.200',
                                                    bgcolor: avail ? '#e8f4fd' : past ? 'grey.50' : 'background.paper',
                                                    cursor: avail ? 'pointer' : 'default',
                                                    opacity: past ? 0.55 : 1,
                                                    transition: 'background-color 0.15s, border-color 0.15s',
                                                    '&:hover': avail ? { bgcolor: '#bbdefb', borderColor: 'primary.main' } : {},
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={today_ ? 700 : 400}
                                                    color={today_ ? 'primary.main' : 'text.primary'}
                                                    sx={{ lineHeight: 1.2, mb: 0.25 }}
                                                >
                                                    {day}
                                                </Typography>

                                                {dayAppts.slice(0, 2).map((a, i) => (
                                                    <Chip
                                                        key={i}
                                                        label={a.start_time}
                                                        size="small"
                                                        color="primary"
                                                        sx={{
                                                            fontSize: '0.6rem', height: 17, mb: 0.25, width: '100%',
                                                            '& .MuiChip-label': { px: 0.5 },
                                                        }}
                                                    />
                                                ))}
                                                {dayAppts.length > 2 && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                                                        +{dayAppts.length - 2} más
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Tooltip>
                                    );
                                })}
                            </Box>
                        )}

                        {/* Legend */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 14, height: 14, bgcolor: '#e8f4fd', border: '1px solid', borderColor: 'primary.light', borderRadius: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">Con disponibilidad</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Chip label="09:00" size="small" color="primary" sx={{ fontSize: '0.6rem', height: 16 }} />
                                <Typography variant="caption" color="text.secondary">Cita agendada</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 14, height: 14, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">Sin disponibilidad / pasado</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </>
            )}

            {/* ── Day detail dialog ─────────────────────────────────────────────── */}
            <Dialog open={dayDialog.open} onClose={() => setDayDialog({ open: false, day: null })} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Typography variant="h6">
                        {dayDialog.day} {currentDate.toLocaleString('es-CO', { month: 'long' })} {year}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Dr. {selectedDoctor?.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip label={`${bookedCount} reservada${bookedCount !== 1 ? 's' : ''}`} size="small" color="primary" />
                        <Chip label={`${availableCount} disponible${availableCount !== 1 ? 's' : ''}`} size="small" color="success" variant="outlined" />
                    </Box>
                </DialogTitle>

                <DialogContent dividers>
                    {daySlots.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            No hay turnos configurados para este día.
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {daySlots.map((slot, i) => {
                                const clinicName = clinicMap[String(slot.clinic_id)] || slot.clinic_id || '—';
                                return (
                                    <Box
                                        key={i}
                                        sx={{
                                            p: 1.25, borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: slot.booked ? 'warning.light' : 'success.light',
                                            bgcolor: slot.booked ? '#fff8e1' : '#f1f8e9',
                                        }}
                                    >
                                        {/* Fila superior: hora + clínica */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                            <Typography variant="body2" fontWeight={600} sx={{ minWidth: 110 }}>
                                                {slot.start} – {slot.end}
                                            </Typography>
                                            <Chip
                                                icon={<BusinessIcon sx={{ fontSize: '0.75rem !important' }} />}
                                                label={clinicName}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.65rem', height: 20, ml: 1 }}
                                            />
                                        </Box>

                                        {/* Fila inferior: paciente / estado + acciones */}
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {slot.booked ? (
                                                <>
                                                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }} noWrap>
                                                        {slot.patient?.name || 'Paciente'}
                                                    </Typography>
                                                    <Chip label="Reservado" size="small" color="warning" sx={{ mr: 1, fontSize: '0.65rem' }} />
                                                    <Tooltip title="Historia clínica">
                                                        <IconButton
                                                            size="small"
                                                            sx={{ color: 'info.main' }}
                                                            onClick={() => navigate(`/patients/${slot.appointment.patient_id}/medical-record`)}
                                                        >
                                                            <MedicalServicesIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <IconButton size="small" color="error" title="Cancelar cita"
                                                        onClick={() => handleCancelAppointment(slot.appointment.id)}>
                                                        <CancelIcon fontSize="small" />
                                                    </IconButton>
                                                </>
                                            ) : (
                                                <>
                                                    <Typography variant="body2" color="success.dark" sx={{ flex: 1 }}>
                                                        Disponible
                                                    </Typography>
                                                    <Button
                                                        size="small" variant="contained" color="success"
                                                        startIcon={<AddIcon />}
                                                        onClick={() => handleOpenBook(dayDialog.day, slot)}
                                                    >
                                                        Agendar
                                                    </Button>
                                                </>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setDayDialog({ open: false, day: null })}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* ── Confirm booking dialog ────────────────────────────────────────── */}
            <Dialog open={bookDialog.open} onClose={() => setBookDialog({ open: false, day: null, slot: null })} maxWidth="xs" fullWidth>
                <DialogTitle>Confirmar cita</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {bookError && <Alert severity="error">{bookError}</Alert>}

                        {/* Patient selector — visible when no patient was pre-selected */}
                        <Autocomplete
                            options={allPatients}
                            getOptionLabel={(p) => p.name || ''}
                            filterOptions={(opts, { inputValue }) => {
                                const q = inputValue.toLowerCase();
                                return opts.filter(p =>
                                    p.name?.toLowerCase().includes(q) ||
                                    p.document_number?.includes(q) ||
                                    p.email?.toLowerCase().includes(q)
                                );
                            }}
                            value={bookPatient}
                            inputValue={bookPatientInput}
                            onInputChange={(_, v) => setBookPatientInput(v)}
                            onChange={(_, v) => setBookPatient(v)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Paciente *"
                                    placeholder="Buscar paciente..."
                                    size="small"
                                    error={!!bookError && !bookPatient}
                                />
                            )}
                            noOptionsText="No se encontró ningún paciente"
                        />

                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {[
                                ['Doctor', `Dr. ${selectedDoctor?.name}`],
                                ['Clínica', bookDialog.slot ? (clinicMap[String(bookDialog.slot.clinic_id)] || bookDialog.slot.clinic_id || '—') : '—'],
                                ['Fecha', bookDialog.day ? `${String(bookDialog.day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}` : ''],
                                ['Horario', bookDialog.slot ? `${bookDialog.slot.start} – ${bookDialog.slot.end} (${APPOINTMENT_DURATION} min)` : ''],
                            ].map(([label, value]) => (
                                <Box key={label}>
                                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                                    <Typography variant="body1" fontWeight={500}>{value}</Typography>
                                </Box>
                            ))}
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBookDialog({ open: false, day: null, slot: null })} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleCreateAppointment} variant="contained" disabled={saving || !bookPatient}>
                        {saving ? 'Guardando...' : 'Confirmar cita'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AppointmentCalendar;
