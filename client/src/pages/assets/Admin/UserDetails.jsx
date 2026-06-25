import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  Divider, Stack, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Avatar, IconButton, Tooltip, MenuItem, alpha
} from '@mui/material';
import {
  ArrowBack as BackIcon, Edit as EditIcon, Save as SaveIcon,
  Cancel as CancelIcon, Email as EmailIcon, Phone as PhoneIcon,
  Lock as LockIcon, CheckCircle as ActiveIcon, Block as InactiveIcon,
  AdminPanelSettings as AdminIcon, MedicalServices as DoctorIcon,
  Science as LabIcon, Person as PatientIcon, Group as StaffIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from "react-toastify";
import { authService } from '../../../services/authService';
import { adminService } from "../../../services/users/admin";
import {
  platinumTheme, PremiumHeader, Statcard, PremiumCard, PremiumTableContainer, GlassCard,
  StatusChip, RoleBadge, GlassSearchBar, SectionTitle, PageTitle, ActionIconButton, PlatinumButton
} from '../../../theme/GenLayout';

export const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [openResetDialog, setOpenResetDialog] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await adminService.getUser(id);
      if (response.data.status === 'sucess') {
        setUser(response.data.data);
        setEditForm(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    setSaving(true);
    try {
      await adminService.updateUser(id);
      toast.success('User updated successfully.');
      setEditing(false);
      fetchUserDetails();
    } catch (err) {
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleEditPatient = async()=>{
    setSaving(true);
    try {
      await adminService.editPatient(id);
      toast.success('Patient editted successfully.');
      setEditing(false);
      fetchUserDetails();
    } catch (err) {
      toast.error('Failed to edit patient');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const res = await authService.resetPassword(id);
      toast.success('Reset password link sent.');
    } catch (err) {
      toast.error('Failed to reset password.Try agin please!');
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin': return <AdminIcon sx={{ fontSize: 60 }} />;
      case 'doctor': return <DoctorIcon sx={{ fontSize: 60 }} />;
      case 'lab_technician': return <LabIcon sx={{ fontSize: 60 }} />;
      case 'operator': return <StaffIcon sx={{ fontSize: 60 }} />;
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;
  if (!user) return <Alert severity="error">User not found!</Alert>;

  return (
    <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
      <Button startIcon={<BackIcon />} onClick={() => navigate('/admin/users')} sx={{ mb: 3, color: platinumTheme.text.secondary }}>Back to Users</Button>

      <PremiumHeader>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>👤 User Details</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>View and manage user information</Typography>
        </motion.div>
      </PremiumHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <GlassCard sx={{ p: 3, textAlign: 'center' }}>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
              <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, background: `linear-gradient(135deg, ${platinumTheme.primary.main}, ${platinumTheme.secondary.main})` }}>
                {getRoleIcon()}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700, color: platinumTheme.text.primary }}>{user.full_name}</Typography>
              <RoleBadge role={user.role} label={user.role?.replace('_', ' ')} sx={{ mt: 1, mb: 2 }} />
              <StatusChip status={user.is_active ? 'active' : 'inactive'} label={user.is_active ? 'Active' : 'Inactive'} size="small" />
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <PlatinumButton startIcon={<EditIcon />} onClick={() => setEditing(true)} fullWidth>Edit Profile</PlatinumButton>
                <Button startIcon={<LockIcon />} variant="outlined" onClick={() => setOpenResetDialog(true)} fullWidth sx={{ borderRadius: 2, textTransform: 'none' }}>Reset Password</Button>
              </Stack>
            </motion.div>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <PremiumCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">Account Information</SectionTitle>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Full Name</Typography>
                  {editing ? <TextField fullWidth size="small" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} /> :
                    <Typography variant="body1" sx={{ color: platinumTheme.text.primary }}>{user.full_name}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Username</Typography>
                  {editing ? <TextField fullWidth size="small" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} /> :
                    <Typography variant="body1" sx={{ color: platinumTheme.text.primary }}>@{user.username}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Email</Typography>
                  {editing ? <TextField fullWidth size="small" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /> :
                    <Typography variant="body1" sx={{ color: platinumTheme.text.primary }}>{user.email}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Phone Number</Typography>
                  {editing ? <TextField fullWidth size="small" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /> :
                    <Typography variant="body1" sx={{ color: platinumTheme.text.primary }}>{user.phone || 'Not provided'}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Role</Typography>
                  {editing ? <TextField fullWidth size="small" select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                    <MenuItem value="admin">Admin</MenuItem><MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="lab_technician">Lab Technician</MenuItem><MenuItem value="patient">Patient</MenuItem>
                  </TextField> : <Typography variant="body1" sx={{ color: platinumTheme.text.primary }}>{user.role?.replace('_', ' ')}</Typography>}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Status</Typography>
                  {editing ? <TextField fullWidth size="small" select value={editForm.is_active ? 'active' : 'inactive'} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'active' })}>
                    <MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem>
                  </TextField> : <StatusChip status={user.is_active ? 'active' : 'inactive'} label={user.is_active ? 'Active' : 'Inactive'} size="small" />}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Last Login</Typography>
                  <Typography variant="body1" sx={{ color: platinumTheme.text.primary }}>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Date Joined</Typography>
                  <Typography variant="body1" sx={{ color: platinumTheme.text.primary }}>{new Date(user.date_joined).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>

              {editing && (
                <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => { setEditing(false); setEditForm(user); }}>Cancel</Button>
                  <PlatinumButton startIcon={<SaveIcon />} onClick={handleUpdateUser} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</PlatinumButton>
                  <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => { setEditing(false); setEditForm(user); }}>Cancel</Button>
                  <PlatinumButton startIcon={<SaveIcon />} onClick={handleEditPatient} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</PlatinumButton>
                </Stack>
              )}
            </CardContent>
          </PremiumCard>
        </Grid>
      </Grid>

      <Dialog open={openResetDialog} onClose={() => setOpenResetDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: alpha(platinumTheme.accent.orange, 0.05) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon sx={{ color: platinumTheme.accent.orange }} />
            <Typography variant="h6">Reset Password</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>⚠️ This will send a password reset email to the user.</Alert>
          <Typography>Send password reset link to <strong>{user.email}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleResetPassword}>Send Reset Email</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};