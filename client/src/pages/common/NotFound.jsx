import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Avatar, alpha } from '@mui/material';
import { SearchOff as SearchOffIcon, Home as HomeIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { platinumTheme } from '../../theme/GenLayout';

export const NotFound = ()=>{
  const navigate = useNavigate();
    
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: platinumTheme.background.default }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, maxWidth: 500 }}>
          <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3, bgcolor: alpha(platinumTheme.accent.orange, 0.1), color: platinumTheme.accent.orange }}>
            <SearchOffIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h1" sx={{ fontSize: 80, fontWeight: 800, color: platinumTheme.accent.orange, mb: 1 }}>404</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>Page Not Found</Typography>
          <Typography variant="body1" sx={{ color: platinumTheme.text.secondary, mb: 4 }}>
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>Go Home</Button>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default NotFound;