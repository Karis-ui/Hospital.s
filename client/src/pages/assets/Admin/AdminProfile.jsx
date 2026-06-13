import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Avatar, Divider, Stack, Alert, CircularProgress, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, alpha,
} from '@mui/material';
import {
  Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
  Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon,
  Lock as LockIcon, AdminPanelSettings as AdminIcon,
  Security as SecurityIcon, Verified as VerifiedIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {adminService} from '../../../services/users/admin';
import authService from '../../../services/authService';
import { platinumTheme, PremiumHeader, PremiumCard, PlatinumButton, SectionTitle } from '../../../theme/adminComponents';

export const AdminProfile = ()=>{
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [profile,setProfile] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [saving, setSaving] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

    useEffect(()=>{
        fetchProfile();
    },[]);

    const fetchProfile = async()=>{
        try{
            const res = await adminService.getAdminProfile();
            if(res.status === 'success'){
                setProfile(res.data.data);
                setFormData({
                  first_name: res.data.data.first_name || '',
                  last_name: res.data.data.last_name || '',
                  email: res.data.data.email || '',
                  phone: res.data.data.phone || '',
                  username: res.data.data.username || '',
            });
            }
        } catch (error) {
            toast.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async()=>{
        setSaving(true);
        try{
            await adminService.updateAdminProfile(formData);
            toast.success('Profile updated successfully');
            setEditing(false);
            fetchProfile();
        } catch (error) {
            toast.error('Error updating profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async()=>{
        if(passwordData.newPassword !== passwordData.confirmNewPassword){
            toast.error('New passwords do not match');
            return;
        }
        if(passwordData.newPassword.length < 8){
            toast.error('New password must be at least 8 characters long');
            return;
        }
        try{
            const res = await authService.resetPassword(passwordData);
            if(res.data.status === 'success'){
                toast.success('Password changed successfully');
                setOpenPasswordDialog(false);
                setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
                });
            }
        } catch (error) {
            toast.error('Error changing password:', error);
        }finally {
            setSaving(false);
        }
    };

    const getFullName = ()=>{
      return `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || profile?.username || 'Admin User'
    };

    if(loading){
        return(
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
    <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
      <PremiumHeader>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>👤 Admin Profile</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Manage your account settings and preferences</Typography>
        </motion.div>
      </PremiumHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <PremiumCard sx={{ textAlign: 'center', p: 3 }}>
            <Avatar sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: platinumTheme.secondary.main }}>
              <AdminIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{getFullName()}</Typography>
            <Typography variant="body2" sx={{ color: platinumTheme.text.secondary, mb: 1 }}>@{profile?.username}</Typography>
            <Chip label="Administrator" icon={<VerifiedIcon />} sx={{ mb: 2, bgcolor: alpha(platinumTheme.secondary.main, 0.1), color: platinumTheme.secondary.main }} />
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
              <SectionTitle variant="h6">Account Information</SectionTitle>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">First Name</Typography>
                  {editing ? (
                    <TextField fullWidth size="small" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                  ) : (
                    <Typography variant="body1">{profile?.first_name || 'Not set'}</Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Last Name</Typography>
                  {editing ? (
                    <TextField fullWidth size="small" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                  ) : (
                    <Typography variant="body1">{profile?.last_name || 'Not set'}</Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Username</Typography>
                  <Typography variant="body1">@{profile?.username}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Email</Typography>
                  {editing ? (
                    <TextField fullWidth size="small" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  ) : (
                    <Typography variant="body1">{profile?.email}</Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Phone Number</Typography>
                  {editing ? (
                    <TextField fullWidth size="small" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  ) : (
                    <Typography variant="body1">{profile?.phone || 'Not provided'}</Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Role</Typography>
                  <Chip label="Administrator" icon={<AdminIcon />} size="small" />
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
              <SectionTitle variant="h6">Security Information</SectionTitle>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Last Login</Typography>
                  <Typography variant="body2">{profile?.last_login ? new Date(profile.last_login).toLocaleString() : 'Never'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Account Created</Typography>
                  <Typography variant="body2">{profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString() : 'N/A'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Account Type</Typography>
                  <Chip label={profile?.is_superuser ? 'Super Administrator' : 'Staff'} size="small" />
                </Box>
              </Stack>
            </CardContent>
          </PremiumCard>
        </Grid>
      </Grid>

      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth type="password" label="Current Password" value={passwordData.current_password} onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} />
            <TextField fullWidth type="password" label="New Password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} helperText="Minimum 8 characters" />
            <TextField fullWidth type="password" label="Confirm New Password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePasswordChange}>Change Password</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProfile;