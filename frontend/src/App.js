import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import './config/dev';
import Login from './components/Login';
import CreateUser from './components/CreateUser';
import UserList from './components/UserList';
import ClinicList from './components/ClinicList';
import Navigation from './components/Navigation';
import TokenDisplay from './components/TokenDisplay';
import HomePage from './components/HomePage';
import ClientList from './components/ClientList';
import DoctorAvailability from './components/DoctorAvailability';
import AppointmentCalendar from './components/AppointmentCalendar';
import MedicalRecord from './components/MedicalRecord';
import { Box } from '@mui/material';
import FloatingSocialButtons from './components/FloatingSocialButtons';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userGroup, setUserGroup] = useState(null);
    const [currentUserEmail, setCurrentUserEmail] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const session = await Auth.currentSession();
            const payload = session.getIdToken().decodePayload();
            const groups = payload['cognito:groups'] || [];
            setUserGroup(groups[0] || null);
            setCurrentUserEmail(payload.email || null);
            setIsAuthenticated(true);
        } catch {
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        try {
            const session = await Auth.currentSession();
            const payload = session.getIdToken().decodePayload();
            const groups = payload['cognito:groups'] || [];
            setUserGroup(groups[0] || null);
            setCurrentUserEmail(payload.email || null);
        } catch {}
        setIsAuthenticated(true);
    };

    if (isLoading) return null;

    const isAdmin = userGroup === 'Administrators';
    const isManager = userGroup === 'Managers' || isAdmin;
    const isDoctor = userGroup === 'Doctors';
    const homeRedirect = isDoctor ? '/appointments' : '/users';

    return (
        <Router>
            {isAuthenticated && <Navigation userGroup={userGroup} />}
            <FloatingSocialButtons />
            <Box sx={{ p: 3 }}>
                <Routes>
                    <Route
                        path="/"
                        element={isAuthenticated ? <Navigate to={homeRedirect} replace /> : <HomePage />}
                    />
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to={homeRedirect} replace /> : <Login onLogin={handleLogin} />}
                    />
                    <Route
                        path="/create-user"
                        element={isAuthenticated && isManager ? <CreateUser /> : isAuthenticated ? <Navigate to={homeRedirect} replace /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/users"
                        element={isAuthenticated && isManager ? <UserList /> : isAuthenticated ? <Navigate to={homeRedirect} replace /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/clinics"
                        element={isAuthenticated && isManager ? <ClinicList /> : isAuthenticated ? <Navigate to={homeRedirect} replace /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/token"
                        element={isAuthenticated ? <TokenDisplay /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/doctors/:doctorId/availability"
                        element={isAuthenticated ? <DoctorAvailability /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/appointments"
                        element={isAuthenticated ? <AppointmentCalendar userGroup={userGroup} currentUserEmail={currentUserEmail} /> : <Navigate to="/login" replace />}
                    />
                    <Route
                        path="/patients/:patientId/medical-record"
                        element={isAuthenticated ? <MedicalRecord userGroup={userGroup} /> : <Navigate to="/login" replace />}
                    />
                    <Route path="/clientes" element={<ClientList />} />
                </Routes>
            </Box>
        </Router>
    );
};

export default App;
