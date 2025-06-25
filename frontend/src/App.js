import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import './config/dev';
import Login from './components/Login';
import CreateUser from './components/CreateUser';
import UserList from './components/UserList';
import ClinicList from './components/ClinicList';
import Navigation from './components/Navigation';
import TokenDisplay from './components/TokenDisplay';
import { Box } from '@mui/material';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            await Auth.currentSession();
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return null; // O un componente de loading si prefieres
    }

    return (
        <Router>
            {isAuthenticated && <Navigation />}
            <Box sx={{ p: 3 }}>
            <Routes>
                    <Route 
                        path="/" 
                        element={
                            isAuthenticated ? 
                            <Navigate to="/users" replace /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    <Route 
                        path="/login" 
                        element={
                            isAuthenticated ? 
                            <Navigate to="/users" replace /> : 
                            <Login onLogin={() => setIsAuthenticated(true)} />
                        } 
                    />
                    <Route 
                        path="/create-user" 
                        element={
                            isAuthenticated ? 
                            <CreateUser /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    <Route 
                        path="/users" 
                        element={
                            isAuthenticated ? 
                            <UserList /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    <Route 
                        path="/clinics" 
                        element={
                            isAuthenticated ? 
                            <ClinicList /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
                    <Route 
                        path="/token" 
                        element={
                            isAuthenticated ? 
                            <TokenDisplay /> : 
                            <Navigate to="/login" replace />
                        } 
                    />
            </Routes>
            </Box>
        </Router>
    );
};

export default App; 