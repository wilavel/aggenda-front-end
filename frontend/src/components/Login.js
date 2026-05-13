import { useState, useEffect, useCallback } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, TextField, Typography, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, Paper,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

/* ── Ilustración SVG diente ───────────────────────────────────────────────── */
const ToothIllustration = () => (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 160, opacity: 0.18 }}>
        <path d="M100 10C72 10 45 28 35 58C26 83 25 105 25 120C25 155 32 185 45 205C54 220 65 228 76 228C89 228 95 210 100 192C105 210 111 228 124 228C135 228 146 220 155 205C168 185 175 155 175 120C175 105 174 83 165 58C155 28 128 10 100 10Z" fill="white"/>
        <path d="M60 80C60 80 75 95 100 95C125 95 140 80 140 80" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

/* ── Panel izquierdo ─────────────────────────────────────────────────────── */
const LeftPanel = () => (
    <Box
        sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '45%',
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #073f3f 0%, #0b6b6b 55%, #0f9292 100%)',
            p: 6,
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        {/* Círculo decorativo */}
        <Box sx={{
            position: 'absolute', top: -80, right: -80,
            width: 300, height: 300, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
        }} />
        <Box sx={{
            position: 'absolute', bottom: -60, left: -60,
            width: 240, height: 240, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
        }} />

        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, zIndex: 1 }}>
            <Box sx={{
                width: 40, height: 40, borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <span className="material-icons" style={{ color: '#fff', fontSize: 22 }}>local_hospital</span>
            </Box>
            <Box>
                <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 800, color: '#fff', fontSize: '1.3rem', lineHeight: 1 }}>
                    Central Dent
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.65rem', letterSpacing: 2, textTransform: 'uppercase' }}>
                    Gestión Clínica
                </Typography>
            </Box>
        </Box>

        {/* Centro */}
        <Box sx={{ zIndex: 1, textAlign: 'center' }}>
            <ToothIllustration />
            <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700, fontSize: '2rem', color: '#fff', lineHeight: 1.2, mt: 2 }}>
                Tu sonrisa,<br />nuestra misión
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.65)', mt: 2, fontSize: '0.95rem', lineHeight: 1.7 }}>
                Plataforma de gestión integral para<br />profesionales de la salud oral.
            </Typography>
        </Box>

        {/* Features */}
        <Box sx={{ zIndex: 1 }}>
            {['Agenda de citas en tiempo real', 'Gestión de doctores y pacientes', 'Control de disponibilidad por clínica'].map(f => (
                <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>{f}</Typography>
                </Box>
            ))}
        </Box>
    </Box>
);

/* ── Login ───────────────────────────────────────────────────────────────── */
const Login = ({ onLogin }) => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const [showNewPasswordDialog, setShowNewPasswordDialog]   = useState(false);
    const [newPassword, setNewPassword]                       = useState('');
    const [confirmNewPassword, setConfirmNewPassword]         = useState('');
    const [passwordError, setPasswordError]                   = useState('');
    const [user, setUser]                                     = useState(null);

    const navigate = useNavigate();

    const checkAuth = useCallback(async () => {
        try {
            const u = await Auth.currentAuthenticatedUser();
            if (u) navigate('/');
        } catch {}
    }, [navigate]);

    useEffect(() => { checkAuth(); }, [checkAuth]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const u = await Auth.signIn(email, password);
            if (u.challengeName === 'NEW_PASSWORD_REQUIRED') {
                setUser(u);
                setShowNewPasswordDialog(true);
                return;
            }
            await onLogin();
            navigate('/');
        } catch (err) {
            if (err.code === 'NotAuthorizedException')       setError('Email o contraseña incorrectos.');
            else if (err.code === 'UserNotFoundException')   setError('Usuario no encontrado.');
            else if (err.code === 'UserNotConfirmedException') setError('Confirma tu cuenta antes de iniciar sesión.');
            else                                             setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleNewPasswordSubmit = async () => {
        if (newPassword !== confirmNewPassword) { setPasswordError('Las contraseñas no coinciden'); return; }
        if (newPassword.length < 8)             { setPasswordError('Mínimo 8 caracteres');           return; }
        if (!user)                              { setPasswordError('Sesión no válida');               return; }
        setLoading(true);
        setPasswordError('');
        try {
            const attrs = user.attributes || {};
            await Auth.completeNewPassword(user, newPassword, { name: attrs.name || user.username });
            setShowNewPasswordDialog(false);
            await onLogin();
            navigate('/');
        } catch (err) {
            setPasswordError(err.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <LeftPanel />

            {/* ── Formulario ── */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 3, md: 6 },
            }}>
                <Box sx={{ width: '100%', maxWidth: 420 }}>
                    {/* Móvil: mini brand */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 4 }}>
                        <span className="material-icons" style={{ color: '#0b6b6b', fontSize: 28 }}>local_hospital</span>
                        <Typography sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 800, color: '#0b6b6b', fontSize: '1.4rem' }}>
                            Central Dent
                        </Typography>
                    </Box>

                    <Box sx={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0b6b6b, #0f9292)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mb: 3,
                    }}>
                        <LockOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
                    </Box>

                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
                        Bienvenido
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Inicia sesión para acceder a la plataforma
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth required
                            label="Correo electrónico"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={loading}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth required
                            label="Contraseña"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ py: 1.6, fontSize: '1rem', fontWeight: 700 }}
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </Button>
                    </Box>

                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>
                        © {new Date().getFullYear()} Central Dent · Todos los derechos reservados
                    </Typography>
                </Box>
            </Box>

            {/* ── Diálogo nueva contraseña ── */}
            <Dialog open={showNewPasswordDialog} onClose={() => !loading && setShowNewPasswordDialog(false)}>
                <DialogTitle sx={{ fontFamily: '"Outfit",sans-serif', fontWeight: 700 }}>
                    Establece tu contraseña
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Es tu primer ingreso. Por favor crea una nueva contraseña segura.
                    </Typography>
                    {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
                    <TextField
                        fullWidth required label="Nueva contraseña" type="password"
                        value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        disabled={loading} sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth required label="Confirmar contraseña" type="password"
                        value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)}
                        disabled={loading}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleNewPasswordSubmit} variant="contained" disabled={loading} fullWidth size="large">
                        {loading ? 'Guardando...' : 'Actualizar contraseña'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Login;
