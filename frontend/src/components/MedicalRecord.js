import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import axios from 'axios';
import {
    Container, Typography, Box, Button, Alert, CircularProgress,
    Paper, Divider, Chip, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, IconButton, Tooltip, Accordion,
    AccordionSummary, AccordionDetails, List, ListItem, ListItemText,
    ListItemSecondaryAction, Tab, Tabs,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

const API_URL = process.env.REACT_APP_API_URL;

const WRITE_GROUPS = new Set(['Doctors', 'Administrators', 'Managers']);

const emptyRecord = { blood_type: '', allergies: [], chronic_diseases: [], current_medications: [], notes: '' };
const emptyNote = { subjective: '', objective: '', assessment: '', plan: '', date: '', attachments: [] };

const getToken = async () => {
    const session = await Auth.currentSession();
    return session.getAccessToken().getJwtToken();
};

const tagChips = (items = [], color = 'default') =>
    items.map((item, i) => (
        <Chip key={i} label={item} size="small" color={color}
            sx={{ mr: 0.5, mb: 0.5, fontWeight: 500, fontSize: '0.78rem' }} />
    ));

// ── MedicalRecord component ───────────────────────────────────────────────────

const MedicalRecord = ({ patientId: propPatientId, userGroup, readOnly: propReadOnly }) => {
    const { patientId: paramPatientId } = useParams();
    const patientId = propPatientId || paramPatientId;
    const canWrite = WRITE_GROUPS.has(userGroup) && !propReadOnly;

    const [tab, setTab] = useState(0);
    const [record, setRecord] = useState(null);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notesLoading, setNotesLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Record edit dialog
    const [recordDialog, setRecordDialog] = useState(false);
    const [recordForm, setRecordForm] = useState(emptyRecord);
    const [recordSaving, setRecordSaving] = useState(false);

    // Note dialog
    const [noteDialog, setNoteDialog] = useState(false);
    const [noteForm, setNoteForm] = useState(emptyNote);
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [noteSaving, setNoteSaving] = useState(false);

    // Attachment input
    const [attachUrl, setAttachUrl] = useState('');
    const [attachName, setAttachName] = useState('');

    // ── data fetching ──────────────────────────────────────────────────────────

    const fetchRecord = useCallback(async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const res = await axios.get(`${API_URL}/patients/${patientId}/medical-record`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecord(res.data.medical_record);
        } catch (err) {
            if (err.response?.status === 404) {
                setRecord(null);
            } else {
                setError('Error al cargar la historia clínica');
            }
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    const fetchNotes = useCallback(async () => {
        try {
            setNotesLoading(true);
            const token = await getToken();
            const res = await axios.get(`${API_URL}/patients/${patientId}/medical-record/notes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotes(res.data.notes || []);
        } catch {
            setError('Error al cargar las notas clínicas');
        } finally {
            setNotesLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchRecord();
        fetchNotes();
    }, [fetchRecord, fetchNotes]);

    // ── record save ────────────────────────────────────────────────────────────

    const openRecordDialog = () => {
        setRecordForm(record
            ? { ...record, allergies: [...(record.allergies || [])], chronic_diseases: [...(record.chronic_diseases || [])], current_medications: [...(record.current_medications || [])] }
            : emptyRecord
        );
        setRecordDialog(true);
    };

    const saveRecord = async () => {
        try {
            setRecordSaving(true);
            const token = await getToken();
            const method = record ? 'put' : 'post';
            const res = await axios[method](
                `${API_URL}/patients/${patientId}/medical-record`,
                recordForm,
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setRecord(res.data.medical_record);
            setRecordDialog(false);
            setSuccess('Historia clínica guardada correctamente');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Error al guardar la historia clínica');
        } finally {
            setRecordSaving(false);
        }
    };

    // ── note save ──────────────────────────────────────────────────────────────

    const openCreateNote = () => {
        setEditingNoteId(null);
        setNoteForm({ ...emptyNote, date: new Date().toISOString().slice(0, 10) });
        setAttachUrl('');
        setAttachName('');
        setNoteDialog(true);
    };

    const openEditNote = (note) => {
        setEditingNoteId(note.note_id);
        setNoteForm({
            subjective: note.subjective || '',
            objective: note.objective || '',
            assessment: note.assessment || '',
            plan: note.plan || '',
            date: note.date || '',
            attachments: [...(note.attachments || [])],
        });
        setAttachUrl('');
        setAttachName('');
        setNoteDialog(true);
    };

    const addAttachment = () => {
        if (!attachUrl.trim()) return;
        setNoteForm(prev => ({
            ...prev,
            attachments: [...prev.attachments, { file_name: attachName || attachUrl, s3_url: attachUrl }],
        }));
        setAttachUrl('');
        setAttachName('');
    };

    const removeAttachment = (idx) => {
        setNoteForm(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== idx),
        }));
    };

    const saveNote = async () => {
        try {
            setNoteSaving(true);
            const token = await getToken();
            if (editingNoteId) {
                await axios.put(
                    `${API_URL}/patients/${patientId}/medical-record/notes/${editingNoteId}`,
                    noteForm,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
            } else {
                await axios.post(
                    `${API_URL}/patients/${patientId}/medical-record/notes`,
                    noteForm,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
            }
            setNoteDialog(false);
            fetchNotes();
            setSuccess('Nota guardada correctamente');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError('Error al guardar la nota');
        } finally {
            setNoteSaving(false);
        }
    };

    const deleteNote = async (noteId) => {
        if (!window.confirm('¿Eliminar esta nota clínica?')) return;
        try {
            const token = await getToken();
            await axios.delete(`${API_URL}/patients/${patientId}/medical-record/notes/${noteId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotes(prev => prev.filter(n => n.note_id !== noteId));
        } catch {
            setError('Error al eliminar la nota');
        }
    };

    // ── helpers ────────────────────────────────────────────────────────────────

    const listFieldAdd = (field, value) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        setRecordForm(prev => ({ ...prev, [field]: [...prev[field], trimmed] }));
    };

    const listFieldRemove = (field, idx) => {
        setRecordForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
    };

    // ── render ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MedicalServicesIcon color="primary" />
                    <Typography variant="h5" fontWeight={700}>Historia Clínica</Typography>
                </Box>
                {canWrite && (
                    <Button variant="contained" startIcon={<EditIcon />} onClick={openRecordDialog}
                        sx={{ borderRadius: 2, boxShadow: 'none', fontWeight: 600 }}>
                        {record ? 'Editar perfil' : 'Crear perfil'}
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="Perfil de salud" />
                <Tab label={`Notas clínicas (${notes.length})`} />
            </Tabs>

            {/* ── Tab 0: Perfil ── */}
            {tab === 0 && (
                !record ? (
                    <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                        <MedicalServicesIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">
                            No hay historia clínica registrada para este paciente.
                        </Typography>
                        {canWrite && (
                            <Button variant="outlined" sx={{ mt: 2 }} onClick={openRecordDialog}>
                                Crear historia clínica
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ px: 3, py: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.72rem' }}>
                                Datos clínicos generales
                            </Typography>
                        </Box>
                        <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                            <InfoSection label="Tipo de sangre">
                                <Chip label={record.blood_type || '—'} color="error" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
                            </InfoSection>
                            <InfoSection label="Alergias">
                                {record.allergies?.length ? tagChips(record.allergies, 'warning') : <Typography variant="body2" color="text.disabled">Ninguna registrada</Typography>}
                            </InfoSection>
                            <InfoSection label="Enfermedades crónicas">
                                {record.chronic_diseases?.length ? tagChips(record.chronic_diseases) : <Typography variant="body2" color="text.disabled">Ninguna registrada</Typography>}
                            </InfoSection>
                            <InfoSection label="Medicamentos actuales">
                                {record.current_medications?.length ? tagChips(record.current_medications, 'primary') : <Typography variant="body2" color="text.disabled">Ninguno registrado</Typography>}
                            </InfoSection>
                            {record.notes && (
                                <Box sx={{ gridColumn: '1 / -1' }}>
                                    <InfoSection label="Observaciones generales">
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{record.notes}</Typography>
                                    </InfoSection>
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ px: 3, pb: 2 }}>
                            <Typography variant="caption" color="text.disabled">
                                Actualizado: {record.updated_at ? new Date(record.updated_at).toLocaleString('es-CO') : '—'}
                            </Typography>
                        </Box>
                    </Paper>
                )
            )}

            {/* ── Tab 1: Notas ── */}
            {tab === 1 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        {canWrite && (
                            <Button variant="contained" startIcon={<NoteAddIcon />} onClick={openCreateNote}
                                sx={{ borderRadius: 2, boxShadow: 'none', fontWeight: 600 }}>
                                Nueva nota
                            </Button>
                        )}
                    </Box>

                    {notesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : notes.length === 0 ? (
                        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                            <Typography color="text.secondary">No hay notas clínicas registradas.</Typography>
                        </Paper>
                    ) : (
                        notes.map(note => (
                            <Accordion key={note.note_id} variant="outlined"
                                sx={{ mb: 1.5, borderRadius: '12px !important', '&:before': { display: 'none' } }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 1 }}>
                                        <Chip label={note.date || '—'} size="small" color="primary" variant="outlined"
                                            sx={{ fontWeight: 600, minWidth: 100 }} />
                                        <Typography variant="body2" fontWeight={500} noWrap sx={{ flexGrow: 1 }}>
                                            {note.assessment || note.subjective || 'Sin diagnóstico'}
                                        </Typography>
                                        {note.attachments?.length > 0 && (
                                            <Chip icon={<AttachFileIcon />} label={note.attachments.length}
                                                size="small" variant="outlined" />
                                        )}
                                        {canWrite && (
                                            <Box onClick={e => e.stopPropagation()} sx={{ display: 'flex', gap: 0.5 }}>
                                                <Tooltip title="Editar nota">
                                                    <IconButton size="small" onClick={() => openEditNote(note)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar nota">
                                                    <IconButton size="small" color="error" onClick={() => deleteNote(note.note_id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        )}
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ pt: 0 }}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                        <SoapField label="S — Subjetivo" value={note.subjective} />
                                        <SoapField label="O — Objetivo" value={note.objective} />
                                        <SoapField label="A — Evaluación" value={note.assessment} />
                                        <SoapField label="P — Plan" value={note.plan} />
                                    </Box>
                                    {note.attachments?.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" color="text.secondary"
                                                sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                                Archivos adjuntos
                                            </Typography>
                                            <List dense disablePadding>
                                                {note.attachments.map((att, i) => (
                                                    <ListItem key={i} disableGutters>
                                                        <AttachFileIcon fontSize="small" sx={{ mr: 1, color: 'text.disabled' }} />
                                                        <ListItemText
                                                            primary={
                                                                <a href={att.s3_url} target="_blank" rel="noreferrer"
                                                                    style={{ color: 'inherit', textDecoration: 'underline', fontSize: '0.875rem' }}>
                                                                    {att.file_name || att.s3_url}
                                                                </a>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
                                        Registrado: {note.created_at ? new Date(note.created_at).toLocaleString('es-CO') : '—'}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </Box>
            )}

            {/* ── Dialog: Record Profile ── */}
            <Dialog open={recordDialog} onClose={() => setRecordDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {record ? 'Editar perfil clínico' : 'Crear perfil clínico'}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        <TextField
                            label="Tipo de sangre"
                            value={recordForm.blood_type}
                            onChange={e => setRecordForm(p => ({ ...p, blood_type: e.target.value }))}
                            placeholder="Ej: O+"
                            size="small"
                            fullWidth
                        />
                        <ChipListEditor
                            label="Alergias"
                            items={recordForm.allergies}
                            onAdd={v => listFieldAdd('allergies', v)}
                            onRemove={i => listFieldRemove('allergies', i)}
                            color="warning"
                        />
                        <ChipListEditor
                            label="Enfermedades crónicas"
                            items={recordForm.chronic_diseases}
                            onAdd={v => listFieldAdd('chronic_diseases', v)}
                            onRemove={i => listFieldRemove('chronic_diseases', i)}
                        />
                        <ChipListEditor
                            label="Medicamentos actuales"
                            items={recordForm.current_medications}
                            onAdd={v => listFieldAdd('current_medications', v)}
                            onRemove={i => listFieldRemove('current_medications', i)}
                            color="primary"
                        />
                        <TextField
                            label="Observaciones generales"
                            value={recordForm.notes}
                            onChange={e => setRecordForm(p => ({ ...p, notes: e.target.value }))}
                            multiline
                            rows={3}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setRecordDialog(false)} color="inherit">Cancelar</Button>
                    <Button onClick={saveRecord} variant="contained" disabled={recordSaving}
                        sx={{ borderRadius: 2, boxShadow: 'none', fontWeight: 600 }}>
                        {recordSaving ? 'Guardando…' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Dialog: Note ── */}
            <Dialog open={noteDialog} onClose={() => setNoteDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {editingNoteId ? 'Editar nota clínica' : 'Nueva nota clínica'}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Fecha"
                            type="date"
                            value={noteForm.date}
                            onChange={e => setNoteForm(p => ({ ...p, date: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ maxWidth: 200 }}
                        />
                        <TextField
                            label="S — Subjetivo (motivo de consulta, síntomas)"
                            value={noteForm.subjective}
                            onChange={e => setNoteForm(p => ({ ...p, subjective: e.target.value }))}
                            multiline rows={3} fullWidth
                        />
                        <TextField
                            label="O — Objetivo (hallazgos clínicos, examen)"
                            value={noteForm.objective}
                            onChange={e => setNoteForm(p => ({ ...p, objective: e.target.value }))}
                            multiline rows={3} fullWidth
                        />
                        <TextField
                            label="A — Evaluación / Diagnóstico"
                            value={noteForm.assessment}
                            onChange={e => setNoteForm(p => ({ ...p, assessment: e.target.value }))}
                            multiline rows={2} fullWidth
                        />
                        <TextField
                            label="P — Plan de tratamiento"
                            value={noteForm.plan}
                            onChange={e => setNoteForm(p => ({ ...p, plan: e.target.value }))}
                            multiline rows={2} fullWidth
                        />

                        {/* Adjuntos */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                Archivos adjuntos (URLs)
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <TextField
                                    label="Nombre del archivo"
                                    value={attachName}
                                    onChange={e => setAttachName(e.target.value)}
                                    size="small"
                                    sx={{ flex: 1 }}
                                />
                                <TextField
                                    label="URL del archivo (S3)"
                                    value={attachUrl}
                                    onChange={e => setAttachUrl(e.target.value)}
                                    size="small"
                                    sx={{ flex: 2 }}
                                />
                                <Button variant="outlined" onClick={addAttachment} startIcon={<AddIcon />}
                                    sx={{ whiteSpace: 'nowrap', borderRadius: 2 }}>
                                    Agregar
                                </Button>
                            </Box>
                            {noteForm.attachments.length > 0 && (
                                <List dense>
                                    {noteForm.attachments.map((att, i) => (
                                        <ListItem key={i} disableGutters>
                                            <AttachFileIcon fontSize="small" sx={{ mr: 1, color: 'text.disabled' }} />
                                            <ListItemText
                                                primary={att.file_name}
                                                secondary={att.s3_url}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton size="small" edge="end" color="error" onClick={() => removeAttachment(i)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setNoteDialog(false)} color="inherit">Cancelar</Button>
                    <Button onClick={saveNote} variant="contained" disabled={noteSaving}
                        sx={{ borderRadius: 2, boxShadow: 'none', fontWeight: 600 }}>
                        {noteSaving ? 'Guardando…' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

// ── sub-components ────────────────────────────────────────────────────────────

const InfoSection = ({ label, children }) => (
    <Box>
        <Typography variant="caption" color="text.secondary"
            sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: '0.7rem', display: 'block', mb: 0.75 }}>
            {label}
        </Typography>
        {children}
    </Box>
);

const SoapField = ({ label, value }) => (
    <Box>
        <Typography variant="caption" fontWeight={700} color="primary.main"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
            {label}
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: value ? 'text.primary' : 'text.disabled' }}>
            {value || 'Sin registrar'}
        </Typography>
    </Box>
);

const ChipListEditor = ({ label, items = [], onAdd, onRemove, color = 'default' }) => {
    const [input, setInput] = useState('');
    return (
        <Box>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>{label}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                    size="small"
                    fullWidth
                    placeholder={`Agregar ${label.toLowerCase()}...`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { onAdd(input); setInput(''); } }}
                />
                <Button variant="outlined" onClick={() => { onAdd(input); setInput(''); }}
                    sx={{ minWidth: 80, borderRadius: 2 }}>
                    Agregar
                </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {items.map((item, i) => (
                    <Chip key={i} label={item} size="small" color={color} onDelete={() => onRemove(i)}
                        sx={{ fontWeight: 500 }} />
                ))}
            </Box>
        </Box>
    );
};

export default MedicalRecord;
