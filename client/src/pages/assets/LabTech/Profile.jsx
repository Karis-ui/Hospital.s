import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  LinearProgress,
  alpha,
  useTheme,
  Switch,
  FormControlLabel,
  Badge,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as VerifiedIcon,
  Timeline as TimelineIcon,
  MedicalServices as LabIcon,
  History as HistoryIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  LocationCity as LocationIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {useAuth} from '../../../context/authContext';
import { labServices } from '../../../services/users/labtech';

const ProfileHeader = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.info.main} 100%)`,
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 300,
    height: 300,
    background: `radial-gradient(circle, ${alpha('#fff', 0.2)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${alpha('#fff', 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid white`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  backgroundColor: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  height: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&::before': {
    content: '""',
    width: 4,
    height: 24,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
    borderRadius: 4,
  },
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(color, 0.05)} 100%)`,
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(color, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 35px -12px ${alpha(color, 0.3)}`,
  },
}));

const StatusBadge = styled(Chip)(({ theme, isAvailable }) => ({
  backgroundColor: isAvailable ? '#e8f5e9' : '#ffebee',
  color: isAvailable ? '#2e7d32' : '#c62828',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: isAvailable ? '#2e7d32' : '#c62828',
  },
}));

const EditButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: alpha(theme.palette.common.white, 0.2),
  color: 'white',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.3),
  },
}));

export const Profile = ()=>{
    const {user} = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const [profile,setProfile] = useState(null);
    const [loading,setLoading] = useState(true);
    const [editing,setEditing] = useState(false);
    const [saving,setSaving] = useState(false);
    const [editForm,setEditForm] = useState([]);
    const [stats,setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        approvalRate: 0,
    });
    const [snackbar,setSnackbar] = useState({open:false,message:'',severity:'success'});

    useEffect(()=>{
        fetchProfile();
        fetchStats();
    },[]);

    const fetchProfile = async()=>{
        setLoading(true);
        try{
            const response = await labServices.labProfile();
            if(response.data.status === 'success'){
                setProfile(response.data.data);
                setEditForm(response.data.data);
            }else{
                throw new Error('Failed to load profile.');
            }
        }catch(err){
            console.error('Something went wrong.Try again please.');
            toast.error(err.response?.data?.message);
        }finally{
            setLoading(false);
        }
    };


    const fetchStats = async()=>{
        try{
            const response = await labServices.stats();
            if(response.data.status ==='status'){
                setStats(response.data.data);
            }
        }catch(err){
            console.error('Error fetching your stats:',err);
        }
    } ;

    const handleEdit = async()=>{
        setEditing(true);
        const response = await labServices.updateProfile();
    };

    const handleSave = async()=>{
        setSaving(true);
        try{
            const response = await labServices.updateProfile(editForm);
            if(response.data.status === 'success'){
                setProfile(response.data.data);
                setEditing(false);
                toast.success('Profile updated successfully.');
                setSnackbar({open:true,message:'Profile updated successfully.',severity:'success'});
            }else{
                throw new Error('Failed to update profile.Try again.');
            }
        }catch(err){
            toast.error(err.response?.data?.message);
            setSnackbar({open:true,message:'Failed to update profile',severity:'error'});
        }finally{setLoading(false);}
    };

const handleToggleAvailability = (id) => {
  console.log('Toggle availability for:', id);
};

const handleCancel = () => {
  console.log('Cancel action');
  navigate('/lab-techs');
};

    const handleChange = (field,value)=>{
        setEditForm(prev =>({...prev,[field]:value}));
    };

    const getInitials =(name)=>{
        return name?.split(' ').map(word =>word[0]).join('').toUpperCase().slIce(0,2) || 'LT';
    };

    const formatDate = (date)=>{
        if(!date) return 'Not Provided';
        return format(new Date(date), 'MMMMM dd yyyy');
    };
    if(loading){
        return(
            <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'400px'}}><CircularProgress/></Box>
        );
    }
    if(!profile){
        return(
            <Box sx={{p:2}}>
                <Alert severity='error' sx={{borderRadius:3}}>Failed to load profile data.</Alert>
            </Box>
        );
    }

    return (
    <Box sx={{ p: 3 }}>
      <ProfileHeader>
        <EditButton onClick={handleEdit} disabled={editing}>
          <EditIcon />
        </EditButton>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <ProfileAvatar>
            {getInitials(profile.full_name)}
          </ProfileAvatar>
          
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            {profile.full_name}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Chip
              icon={<LabIcon />}
              label="Lab Technician"
              size="small"
              sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}
            />
            <StatusBadge
              icon={profile.is_available ? <VerifiedIcon /> : <CancelIcon />}
              label={profile.is_available ? 'Available' : 'Unavailable'}
              isAvailable={profile.is_available}
              size="small"
            />
          </Box>
          
          <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 500 }}>
            Licensed Laboratory Technician with expertise in clinical diagnostics and quality assurance
          </Typography>
        </Box>
      </ProfileHeader>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color={theme.palette.primary.main}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Tests
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1 }}>
                    {stats.totalTests}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 56, height: 56 }}>
                  <LabIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#2e7d32">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Completed Tests
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: '#2e7d32' }}>
                    {stats.completedTests}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#2e7d32', 0.1), color: '#2e7d32', width: 56, height: 56 }}>
                  <VerifiedIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#ed6c02">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Pending Tests
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: '#ed6c02' }}>
                    {stats.pendingTests}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#ed6c02', 0.1), color: '#ed6c02', width: 56, height: 56 }}>
                  <TimelineIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#0288d1">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Approval Rate
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, color: '#0288d1' }}>
                    {stats.approvalRate}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha('#0288d1', 0.1), color: '#0288d1', width: 56, height: 56 }}>
                  <AssignmentIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <PersonIcon /> Personal Information
              </SectionTitle>
              
              <Stack spacing={1}>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Full Name:</Typography>
                  {editing ? (
                    <TextField
                      size="small"
                      value={editForm.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      sx={{ width: '60%' }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile.full_name}</Typography>
                  )}
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Email Address:</Typography>
                  {editing ? (
                    <TextField
                      size="small"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      sx={{ width: '60%' }}
                    />
                  ) : (
                    <Typography variant="body2">{profile.email}</Typography>
                  )}
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Phone Number:</Typography>
                  {editing ? (
                    <TextField
                      size="small"
                      value={editForm.phone_number}
                      onChange={(e) => handleChange('phone_number', e.target.value)}
                      sx={{ width: '60%' }}
                    />
                  ) : (
                    <Typography variant="body2">{profile.phone_number || 'Not provided'}</Typography>
                  )}
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Date of Birth:</Typography>
                  {editing ? (
                    <TextField
                      size="small"
                      type="date"
                      value={editForm.date_of_birth || ''}
                      onChange={(e) => handleChange('date_of_birth', e.target.value)}
                      sx={{ width: '60%' }}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <Typography variant="body2">{formatDate(profile.date_of_birth)}</Typography>
                  )}
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Gender:</Typography>
                  {editing ? (
                    <TextField
                      size="small"
                      select
                      value={editForm.gender || ''}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      sx={{ width: '60%' }}
                      SelectProps={{ native: true }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </TextField>
                  ) : (
                    <Typography variant="body2">{profile.gender || 'Not specified'}</Typography>
                  )}
                </DetailRow>
              </Stack>
            </CardContent>
          </InfoCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <WorkIcon /> Professional Information
              </SectionTitle>
              
              <Stack spacing={1}>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">License Number:</Typography>
                  {editing ? (
                    <TextField
                      size="small"
                      value={editForm.license_number}
                      onChange={(e) => handleChange('license_number', e.target.value)}
                      sx={{ width: '60%' }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{profile.license_number || 'Not provided'}</Typography>
                  )}
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Qualifications:</Typography>
                  {editing ? (
                    <TextField
                      size="small"
                      multiline
                      rows={2}
                      value={editForm.qualifications}
                      onChange={(e) => handleChange('qualifications', e.target.value)}
                      sx={{ width: '60%' }}
                    />
                  ) : (
                    <Typography variant="body2">{profile.qualifications || 'Not provided'}</Typography>
                  )}
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Status:</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile.is_available}
                        onChange={handleToggleAvailability}
                        color="success"
                      />
                    }
                    label={profile.is_available ? 'Available for tests' : 'Unavailable'}
                  />
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Member Since:</Typography>
                  <Typography variant="body2">
                    {profile.date_joined ? format(new Date(profile.date_joined), 'MMMM dd, yyyy') : 'N/A'}
                  </Typography>
                </DetailRow>
              </Stack>
            </CardContent>
          </InfoCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <HistoryIcon /> Recent Activity
              </SectionTitle>
              
              {profile.recent_activity && profile.recent_activity.length > 0 ? (
                <Stack spacing={2}>
                  {profile.recent_activity.map((activity, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {activity.action}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {activity.description}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(activity.timestamp), 'MMM dd, hh:mm a')}
                        </Typography>
                      </Box>
                      {index < profile.recent_activity.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  No recent activity
                </Typography>
              )}
            </CardContent>
          </InfoCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <SecurityIcon /> Account Security
              </SectionTitle>
              
              <Stack spacing={2}>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Username:</Typography>
                  <Typography variant="body2">{profile.user?.username || 'N/A'}</Typography>
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Last Login:</Typography>
                  <Typography variant="body2">
                    {profile.last_login ? format(new Date(profile.last_login), 'MMM dd, yyyy hh:mm a') : 'Never'}
                  </Typography>
                </DetailRow>
                
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Account Status:</Typography>
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Active"
                    size="small"
                    sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                  />
                </DetailRow>
                
                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={() => navigate('/change-password')}
                  fullWidth
                  sx={{ mt: 2, borderRadius: 2 }}
                >
                  Change Password
                </Button>
              </Stack>
            </CardContent>
          </InfoCard>
        </Grid>
      </Grid>

      {editing && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            p: 2,
            borderRadius: 3,
            boxShadow: theme.shadows[10],
            bgcolor: theme.palette.background.paper,
            zIndex: 1000,
          }}
        >
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}