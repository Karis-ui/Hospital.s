import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Zoom,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Badge,
  LinearProgress,
  InputAdornment,
  Tab,
  Tabs,
  Radio,
  RadioGroup,
  FormLabel,
  Rating,
  AvatarGroup,
  Autocomplete,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Verified as VerifiedIcon,
  Badge as IdIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Language as LanguageIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
  MedicalServices as MedicalIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Backup as BackupIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Settings,
  Delete,
  CheckCircle,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';
import { doctorSevice } from '../../../services/users/doctor';
import authService from '../../../services/authService';
import { formatDate, formatTime, getInitials } from '../../../formatters';

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[5],
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    opacity: 0.8,
  },
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[5],
  },
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.1)} 0%, ${alpha(color || theme.palette.primary.main, 0.05)} 100%)`,
  borderLeft: `5px solid ${color || theme.palette.primary.main}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  minHeight: 48,
}));

export const DoctorProfile = () =>{
    const navigate = useNavigate();
    const {user,updateUser} = useAuth();
    const [loading,setLoading] = useState(true);
    const [saving,setSaving] = useState(false);
    const [error,setError] = useState('');
    const [profile,setProfile] = useState(null);
    const [editMode,setEditMode] = useState(false);
    const [tabValue,setTabValue] = useState(0);
    const [stats,setStats] = useState({totalPatients: 0,
      totalAppointments: 0,
      completedAppointments: 0,
      pendingLabRequests: 0,
      averageRating: 4.8,
    });
    const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    
    specialization: '',
    licenseNumber: '',
    npi: '',
    qualifications: [],
    certifications: [],
    yearsOfExperience: 0,
    languages: '',
    
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'KENYA',
    officePhone: '',
    bio: '',
    
    consultationFee: 0,
    acceptsInsurance: true,
    insuranceProviders: [],
    availableDays: [],
    availableHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: null, end: null },
      sunday: { start: null, end: null },
    },
    
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    labResultAlerts: true,
    });
    const [passwordDialog,setPasswordDialog] = useState(false);
    const [photoDialog,setPhototDialog] = useState(false);
    const [qualifications,setQualificationDialog] = useState(false);
    const [languageDialog,setLanguageDialog] = useState(false);
    const [newQualification, setNewQualification] = useState('');
    const [newCertification, setNewCertification] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [passwordData,setPasswordData] = useState({current: '',new : '',confirm: ''})

    const specialities = ['Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 
      'Neurology', 'Obstetrics', 'Oncology', 'Ophthalmology',];
    const languageOptions = ['English','Swahili','Kikuyu','Frech','Arabic'];
    const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() =>{
        fetchProfileData();
    },[]);

    const fetchProfileData = async() =>{
        try{
            setLoading(true);
            const response = await doctorSevice.doctorView();
            const data = response.data;
            setProfile(data);
            setFormData({
                firstName: data.first_name || user?.first_name || '',
                lastName: data.last_name || user?.last_name || '',
                email: data.email || user?.email || '',
                phone: data.phone || '',
                age: data.age || null,
                gender: data.gender || '',
        
                specialization: data.specialization || '',
                licenseNumber: data.license_number || '',
                npi: data.npi || '',
                qualifications: data.qualifications || [],
                certifications: data.certifications || [],
                languages: data.languages || ['English'],
                yearsOfExperience: data.years_of_experience || 0,
                bio: data.bio || '',
        
               address: data.address || '',
               city: data.city || '',
               state: data.state || '',
               zipCode: data.zip_code || '',
               country: data.country || 'KENYA',
            });
            const statsResponse = await doctorSevice.statistics();
            setStats(statsResponse.data || {});
            setError('');
        }catch(err){
            console.error('Failed to fetch profile:',err);
            setError('Failed to load profile data.');
        }finally{setLoading(false);}
    };

    const handleSave = async() =>{
        setSaving(true);
        try{
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                age: formData.age,
                gender: formData.gender,
        
                specialization: formData.specialization,
                licenseNumber: formData.licenseNumber,
                npi: formData.npi,
                qualifications: formData.qualifications,
                certifications: formData.certifications,
                languages: formData.languages,
                yearsOfExperience: formData.yearsOfExperience,
                bio: formData.bio,
        
               address: formData.address,
               city: formData.city,
               state: formData.state,
               zipCode: formData.zipCode,
               country: formData.country,
            };
            toast.success('Profile updated successfully.');
            setEditMode(false);
            fetchProfileData();
        }catch(err){
            toast.error('Failed to update profile');
        }finally{setSaving(false);}
    };

    const handleChangePassword = async()=>{
        if(passwordData.new !== passwordData.confirm){
            toast.error('New passwords are not matching.');
            return;
        }
        try{
            await authService.resetPassword();
            toast.success('Password changed successfully');
            setPasswordDialog(false);
            setPasswordData({current: '',new: '',confirm: ''});
        }catch(err){
          toast.error('Failed to reset password.Try again!');
        }
    };

    const handlePhotoUpload = (event)=>{
      const file = event.target.files[0];
      if(file){
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () =>{
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSavePhoto = async()=>{
      if(!selectedFile)return;
      try{
        formData.appointmentReminders('photo',selectedFile);
        await doctorSevice.uploadPhoto();
        toast.success('Profile update successfully');
        setPhototDialog(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      }catch(err){
        toast.error('Failed to upload photo. Try again!');
      }
    };

    const handleAddQualififcation = () =>{
      if(newQualification.trim()){
        setFormData({...formData,qualifications: [...formData.qualifications,newQualification.trim()]});
        setNewQualification('');
        setQualificationDialog(false);
      }
    };

    const handleAddLanguage = () =>{
      if(newLanguage.trim()){
        setFormData({...formData,languages: [...formData.languages,newLanguage.trim()]});
        setNewLanguage('');
        setLanguageDialog(false);
      }
    };

    const handleRemoveQualififcation = (index) =>{
        setFormData({...formData,qualifications: [...formData.qualifications.filter((_,i)=> i !== index)]});
    };

    const handleRemoveLanguage = (index) =>{
        setFormData({...formData,languages: [...formData.languages.filter((_,i)=> i !== index)]});
    };

    if(loading){
      return(
        <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><CircularProgress/></Box>
      );
    }

    return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Profile
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {!editMode ? (
            <>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                startIcon={<SecurityIcon />}
                onClick={() => setPasswordDialog(true)}
              >
                Change Password
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setEditMode(false);
                  fetchProfileData();
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Tooltip title="Change Photo">
                  <IconButton 
                    onClick={() => setPhototDialog(true)}
                    sx={{ 
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <PhotoCameraIcon sx={{ color: 'white', fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              }
            >
              <ProfileAvatar src={previewUrl || profile?.photo_url}>
                {getInitials(formData.firstName, formData.lastName)}
              </ProfileAvatar>
            </Badge>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Typography variant="h4" gutterBottom>
              Dr. {formData.firstName} {formData.lastName}
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {formData.specialization || 'Physician'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Chip icon={<SchoolIcon />} label={`License: ${formData.licenseNumber || 'N/A'}`} variant="outlined" />
              <Chip icon={<IdIcon />} label={`NPI: ${formData.npi || 'N/A'}`} variant="outlined" />
              <Chip icon={<WorkIcon />} label={`${formData.yearsOfExperience} years experience`} variant="outlined" />
            </Box>
            <Rating value={stats.averageRating} precision={0.1} readOnly />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <StatCard color="#4caf50">
                  <Typography variant="body2" color="textSecondary">
                    Patients
                  </Typography>
                  <Typography variant="h5" color="#4caf50">
                    {stats.totalPatients}
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6}>
                <StatCard color="#2196f3">
                  <Typography variant="body2" color="textSecondary">
                    Appointments
                  </Typography>
                  <Typography variant="h5" color="#2196f3">
                    {stats.totalAppointments}
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6}>
                <StatCard color="#ff9800">
                  <Typography variant="body2" color="textSecondary">
                    Completed
                  </Typography>
                  <Typography variant="h5" color="#ff9800">
                    {stats.completedAppointments}
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6}>
                <StatCard color="#9c27b0">
                  <Typography variant="body2" color="textSecondary">
                    Pending Labs
                  </Typography>
                  <Typography variant="h5" color="#9c27b0">
                    {stats.pendingLabRequests}
                  </Typography>
                </StatCard>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <StyledTab label="Personal Info" icon={<PersonIcon />} iconPosition="start" />
          <StyledTab label="Professional" icon={<SchoolIcon />} iconPosition="start" />
          <StyledTab label="Schedule" icon={<ScheduleIcon />} iconPosition="start" />
          <StyledTab label="Preferences" icon={<Settings />} iconPosition="start" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <PersonIcon color="primary" /> Basic Information
                </SectionTitle>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date of Birth"
                        value={formData.dateOfBirth}
                        onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
                        disabled={!editMode}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        disabled={!editMode}
                        label="Gender"
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <PhoneIcon color="primary" /> Contact Information
                </SectionTitle>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Personal Phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Office Phone"
                      value={formData.officePhone}
                      onChange={(e) => setFormData({ ...formData, officePhone: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <LocationIcon color="primary" /> Address
                </SectionTitle>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </InfoCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <SchoolIcon color="primary" /> Professional Details
                </SectionTitle>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Specialization</InputLabel>
                      <Select
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        disabled={!editMode}
                        label="Specialization"
                      >
                        {specialities.map(spec => (
                          <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="License Number"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="NPI Number"
                      value={formData.npi}
                      onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
                      disabled={!editMode}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Years of Experience"
                      value={formData.yearsOfExperience}
                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                      disabled={!editMode}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Consultation Fee ($)"
                      type="number"
                      value={formData.consultationFee}
                      onChange={(e) => setFormData({ ...formData, consultationFee: parseFloat(e.target.value) || 0 })}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Professional Bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!editMode}
                      multiline
                      rows={4}
                      placeholder="Tell patients about your experience and approach..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <SchoolIcon color="primary" /> Qualifications
                  {editMode && (
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setQualificationDialog(true)}
                    >
                      Add
                    </Button>
                  )}
                </SectionTitle>
                
                <List>
                  {formData.qualifications.map((qual, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        editMode && (
                          <IconButton edge="end" onClick={() => handleRemoveQualififcation(index)}>
                            <Delete />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={qual} />
                    </ListItem>
                  ))}
                  {formData.qualifications.length === 0 && (
                    <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      No qualifications added
                    </Typography>
                  )}
                </List>
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <LanguageIcon color="primary" /> Languages
                  {editMode && (
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => setLanguageDialog(true)}
                    >
                      Add
                    </Button>
                  )}
                </SectionTitle>
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {formData.languages.map((lang) => (
                    <Chip
                      key={lang}
                      label={lang}
                      onDelete={editMode ? () => handleRemoveLanguage(lang) : undefined}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <MedicalIcon color="primary" /> Insurance & Payment
                </SectionTitle>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.acceptsInsurance}
                      onChange={(e) => setFormData({ ...formData, acceptsInsurance: e.target.checked })}
                      disabled={!editMode}
                    />
                  }
                  label="Accept Insurance"
                />
                
                {formData.acceptsInsurance && (
                  <Box sx={{ mt: 2 }}>
                    <Autocomplete
                      multiple
                      options={['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealthcare', 'Medicare', 'Medicaid']}
                      value={formData.insuranceProviders}
                      onChange={(e, newValue) => setFormData({ ...formData, insuranceProviders: newValue })}
                      disabled={!editMode}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Insurance Providers"
                          placeholder="Select providers"
                          size="small"
                        />
                      )}
                    />
                  </Box>
                )}
              </CardContent>
            </InfoCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <InfoCard>
          <CardContent>
            <SectionTitle>
              <ScheduleIcon color="primary" /> Available Days & Hours
            </SectionTitle>
            
            <Grid container spacing={3}>
              {dayOptions.map((day) => (
                <Grid item xs={12} md={6} key={day}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      {day}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.availableDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  availableDays: [...formData.availableDays, day]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  availableDays: formData.availableDays.filter(d => d !== day)
                                });
                              }
                            }}
                            disabled={!editMode}
                          />
                        }
                        label="Available"
                      />
                      
                      {formData.availableDays.includes(day) && (
                        <>
                          <TextField
                            type="time"
                            size="small"
                            label="Start"
                            value={formData.availableHours[day.toLowerCase()]?.start || '09:00'}
                            onChange={(e) => setFormData({
                              ...formData,
                              availableHours: {
                                ...formData.availableHours,
                                [day.toLowerCase()]: {
                                  ...formData.availableHours[day.toLowerCase()],
                                  start: e.target.value
                                }
                              }
                            })}
                            disabled={!editMode}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            type="time"
                            size="small"
                            label="End"
                            value={formData.availableHours[day.toLowerCase()]?.end || '17:00'}
                            onChange={(e) => setFormData({
                              ...formData,
                              availableHours: {
                                ...formData.availableHours,
                                [day.toLowerCase()]: {
                                  ...formData.availableHours[day.toLowerCase()],
                                  end: e.target.value
                                }
                              }
                            })}
                            disabled={!editMode}
                            InputLabelProps={{ shrink: true }}
                          />
                        </>
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </InfoCard>
      )}

      {tabValue === 3 && (
        <InfoCard>
          <CardContent>
            <SectionTitle>
              <NotificationsIcon color="primary" /> Notification Preferences
            </SectionTitle>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.emailNotifications}
                      onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                      disabled={!editMode}
                    />
                  }
                  label="Email Notifications"
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Receive updates via email
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.smsNotifications}
                      onChange={(e) => setFormData({ ...formData, smsNotifications: e.target.checked })}
                      disabled={!editMode}
                    />
                  }
                  label="SMS Notifications"
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Receive text messages
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.appointmentReminders}
                      onChange={(e) => setFormData({ ...formData, appointmentReminders: e.target.checked })}
                      disabled={!editMode}
                    />
                  }
                  label="Appointment Reminders"
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Get reminded about upcoming appointments
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.labResultAlerts}
                      onChange={(e) => setFormData({ ...formData, labResultAlerts: e.target.checked })}
                      disabled={!editMode}
                    />
                  }
                  label="Lab Result Alerts"
                />
                <Typography variant="caption" color="textSecondary" display="block">
              Get notified when lab results are ready
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <SectionTitle>
              <SecurityIcon color="primary" /> Account Security
            </SectionTitle>
            
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setPasswordDialog(true)}
            >
              Change Password
            </Button>
          </CardContent>
        </InfoCard>
      )}

      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordData.current}
            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordData.new}
            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordData.confirm}
            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
            margin="normal"
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={photoDialog} onClose={() => setPhototDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar
              src={previewUrl}
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            >
              {getInitials(formData.firstName, formData.lastName)}
            </Avatar>
            
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCameraIcon />}
            >
              Choose Photo
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhototDialog(false)}>Cancel</Button>
          <Button onClick={handleSavePhoto} variant="contained" disabled={!selectedFile}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={qualifications} onClose={() => setQualificationDialog(false)}>
        <DialogTitle>Add Qualification</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Qualification"
            fullWidth
            value={newQualification}
            onChange={(e) => setNewQualification(e.target.value)}
            placeholder="e.g., MD, PhD, Board Certified in Cardiology"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQualificationDialog(false)}>Cancel</Button>
          <Button onClick={handleAddQualififcation} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={languageDialog} onClose={() => setLanguageDialog(false)}>
        <DialogTitle>Add Language</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              label="Language"
            >
              {languageOptions.map(lang => (
                <MenuItem key={lang} value={lang}>{lang}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLanguageDialog(false)}>Cancel</Button>
          <Button onClick={handleAddLanguage} variant="contained" disabled={!newLanguage}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};