import React, { useState } from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel, TextField, Button, Stack, Divider, Avatar, alpha, MenuItem } from '@mui/material';
import { Notifications as NotificationsIcon, DarkMode as DarkModeIcon, Language as LanguageIcon, Security as SecurityIcon, Email as EmailIcon, Backup as BackupIcon } from '@mui/icons-material';
import { platinumTheme, PremiumHeader } from '../../theme/GenLayout';

export const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'en',
    security: true,
    smsAlerts: false,
    emailAlerts: true,
    autoUpdates: true,
    backup: true,
  });
  return (
    <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
      <PremiumHeader>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>⚙️ Settings</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>Customize your application preferences</Typography>
      </PremiumHeader>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}><NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Notifications</Typography>
          <FormControlLabel control={<Switch checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} />} label="Email Notifications" />
          <FormControlLabel control={<Switch checked={settings.smsAlerts} onChange={(e) => setSettings({ ...settings, smsAlerts: e.target.checked })} />} label="SMS Alerts" />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}><DarkModeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Appearance</Typography>
          <FormControlLabel control={<Switch checked={settings.darkMode} onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })} />} label="Dark Mode" />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}><LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Language & Region</Typography>
          <TextField select label="Language" value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} size="small" sx={{ width: 200 }}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="sw">Swahili</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="es">Kikuyu</MenuItem>
          </TextField>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}><SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Security</Typography>
          <TextField select label="Security" value={settings.security} onChange={(e) => setSettings({ ...settings, security: e.target.value })} size="small" sx={{ width: 200 }}>
            <MenuItem value="account">Account Security</MenuItem>
            <MenuItem value="network">Network Protection</MenuItem>
            <MenuItem value="enhanced">Enhanced Security</MenuItem>
          </TextField>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}><BackupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Backup</Typography>
          <TextField select label="Language" value={settings.backup} onChange={(e) => setSettings({ ...settings, backup: e.target.value })} size="small" sx={{ width: 200 }}>
            <MenuItem value="backup">Backup Security</MenuItem>
          </TextField>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}><SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Privacy</Typography>
          <Button variant="outlined" color="error">Delete Account</Button>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained">Save Settings</Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;