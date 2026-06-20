import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Avatar, Divider, Stack, Alert, CircularProgress, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, alpha,
} from '@mui/material';
import {
  Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
  Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon,
  Lock as LockIcon, Receipt as OperatorIcon, Verified as VerifiedIcon,
  Badge as BadgeIcon, Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import OperatorService from '../../../services/users/operator';
import authService from '../../../services/authService';
import { platinumTheme, PremiumHeader, PremiumCard, PlatinumButton, SectionTitle } from '../../../theme/adminComponents';

export const OperatorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await OperatorService.getStaffProfile();
      if (response.data.status === 'success') {
        setProfile(response.data.data);
        setFormData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await OperatorService.updateStaffProfile(formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await authService.resetPassword(passwordData);
      toast.success('Password changed successfully');
      setOpenPasswordDialog(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleUploadPhoto = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        setPhotoUploading(true);
      };
      reader.readAsDataURL(file);
    };
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
      <PremiumHeader>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>🧾 Operator Profile</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Manage your billing operator account</Typography>
        </motion.div>
      </PremiumHeader>

      <Grid container spacing={3}>]
        <Grid item xs={12} md={4}>
          <PremiumCard sx={{ textAlign: 'center', p: 3 }}>
            <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: platinumTheme.accent.teal }}>
              <OperatorIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{profile?.full_name || 'Operator User'}</Typography>
            <Typography variant="body2" sx={{ color: platinumTheme.text.secondary, mb: 1 }}>@{profile?.username}</Typography>
            <Chip label="Bill Operator" icon={<VerifiedIcon />} sx={{ mb: 2, bgcolor: alpha(platinumTheme.accent.teal, 0.1), color: platinumTheme.accent.teal }} />
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(true)} fullWidth>Edit Profile</Button>
              <Button variant="outlined" startIcon={<LockIcon />} onClick={() => setOpenPasswordDialog(true)} fullWidth>Change Password</Button>
            </Stack>
          </PremiumCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <PremiumCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">Personal Information</SectionTitle>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Full Name</Typography>
                  {editing ? <TextField fullWidth size="small" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} /> : <Typography variant="body1">{profile?.full_name || 'N/A'}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Username</Typography>
                  {editing ? <TextField fullWidth size="small" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} /> : <Typography variant="body1">@{profile?.username}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Email</Typography>
                  {editing ? <TextField fullWidth size="small" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /> : <Typography variant="body1">{profile?.email}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Phone Number</Typography>
                  {editing ? <TextField fullWidth size="small" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /> : <Typography variant="body1">{profile?.phone || 'Not provided'}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Department</Typography>
                  <Typography variant="body1">Billing Department</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Shift</Typography>
                  <Chip label={profile?.shift_time || 'Day Shift'} size="small" icon={<ScheduleIcon />} />
                </Grid>
              </Grid>

              {editing && (
                <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => { setEditing(false); setFormData(profile); }}>Cancel</Button>
                  <PlatinumButton startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />} onClick={handleSave} disabled={saving}>Save Changes</PlatinumButton>
                </Stack>
              )}
            </CardContent>
          </PremiumCard>

          <PremiumCard sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">Work Information</SectionTitle>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Employee ID</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile?.employee_id || 'OP-001'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Join Date</Typography>
                  <Typography variant="body2">{profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Status</Typography>
                  <Chip label={profile?.is_active ? 'Active' : 'Inactive'} size="small" color={profile?.is_active ? 'success' : 'error'} />
                </Box>
              </Stack>
            </CardContent>
          </PremiumCard>
        </Grid>
      </Grid>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ mt: 1 }}><TextField fullWidth type="password" label="Current Password" value={passwordData.current_password} onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} /><TextField fullWidth type="password" label="New Password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} helperText="Minimum 8 characters" /><TextField fullWidth type="password" label="Confirm New Password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} /></Stack></DialogContent>
        <DialogActions><Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button><Button variant="contained" onClick={handlePasswordChange}>Change Password</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default OperatorProfile;