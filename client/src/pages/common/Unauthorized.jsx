import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Avatar, alpha } from '@mui/material';
import { Error as ErrorIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { platinumTheme } from '../../theme/GenLayout';

export const Unauthorized = ()=>{
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: platinumTheme.background.default }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, maxWidth: 500 }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: alpha(platinumTheme.accent.orange, 0.1), color: platinumTheme.accent.orange }}>
                <ErrorIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontSize: 80, fontWeight: 800, mb: 2 }}>Access Denied</Typography>
              <Typography variant="body1" sx={{ color: platinumTheme.text.secondary, mb: 4 }}>
                You are not authorized to access this page. Please contact your administrator if you believe this is an error.
              </Typography>
              <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>Go Back</Button>
            </Paper>
          </motion.div>
        </Box>
    );
};

export default Unauthorized;