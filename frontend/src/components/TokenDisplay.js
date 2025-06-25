import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const TokenDisplay = () => {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        getToken();
    }, []);

    const getToken = async () => {
        try {
            setLoading(true);
            setError('');
            const session = await Auth.currentSession();
            const accessToken = session.getAccessToken().getJwtToken();
            setToken(accessToken);
        } catch (err) {
            console.error('Error getting token:', err);
            setError('Error al obtener el token. Asegúrate de estar autenticado.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Access Token
                </Typography>
                <Box sx={{ 
                    bgcolor: 'grey.100', 
                    p: 2, 
                    borderRadius: 1,
                    wordBreak: 'break-all',
                    mb: 2
                }}>
                    <Typography variant="body2" component="pre" sx={{ m: 0 }}>
                        {token}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<ContentCopyIcon />}
                    onClick={copyToClipboard}
                >
                    {copied ? '¡Copiado!' : 'Copiar Token'}
                </Button>
            </Paper>
        </Box>
    );
};

export default TokenDisplay; 