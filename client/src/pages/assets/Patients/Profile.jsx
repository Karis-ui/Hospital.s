import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Avatar,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Alert,
  CircularProgress,
  Divider,
  Rating,
  InputAdornment,
  Autocomplete,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  styled,
  Tab,Badge,Tooltip,LinearProgress,Tabs,
  DialogActions,DialogContent,Dialog,DialogTitle,Switch,
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  LocalHospital as LocalHospitalIcon,
  MedicalServices as ServiceIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  School as ExperienceIcon,
  Science as LabIcon,
  HeartBroken as HeartIcon,
  Psychiatry as BrainIcon,
  Tooth as DentalIcon,
  Visibility as EyeIcon,
  Ear as EarIcon,
  ChildCare as PediatricIcon,
  Emergency as EmergencyIcon,
  Edit as EditIcon,Security as SecurityIcon,Save as SaveIcon,Cancel as CancelIcon,Verified as VerifiedIcon,Email as EmailIcon,
  Phone as PhoneIcon,HealthAndSafety as HealthIcon,Payment as PaymentIcon,Settings as SettingsIcon,Lock as LockIcon,Fingerprint as FingerprintIcon,
  Warning as WarningIcon,Bloodtype as BloodIcon,Height as HeightIcon,LineWeight as WeightIcon,Medication as MedicationIcon,Info as InfoIcon,Dangerous as AllergyIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { PatientService } from '../../../services/users/patient';
import authService from '../../../services/authService';
import { formatDate } from '../../../formatters';
import { useAuth } from '../../../context/authContext';

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[5],
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
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

export const PatientProfile = () =>{
  const navigate = useNavigate();
  const { user,updateUser} = useAuth();
  
  const [loading ,setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [error, setError] = useState('');
  const [editMode,setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',lastName: '',age: '',gender: '',height: '',weight: '',height: '',bloodGroup: '',
    email: '',phone: '',address: '',city: '',state: '',country: 'Kenya',
    emergencyContactName: '',emergencyContactRelation: '',emergencyContactPhone: '',
    insuranceProvider: '',policyNumber: '',groupNumber: '',expiryDate: null,
    allergies: [],chronicConditions: [],medications: [],pastSurgeries: [],
    preferredLanguage: 'English',communicationPreference: 'email',smsNotifications: true,emailNotifications: true,appointmentReminders: true,
  });

  const [passwordData, setPasswordData] = useState({
    current: '',new: '',confirm: '',
  });

  useEffect(() =>{
    fetchProfile();
  },[]);

  const fetchProfile = async ()=>{
    try{
      setLoading(true);
      const response = await PatientService.getProfile();
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || user?.first_name || '',
        lastName: response.data.lastName || user?.last_name || '',
        age: response.data.age || null,
        gender: response.data.gender || '',
        bloodGroup: response.data.bloodGroup || '',
        height: response.data.height || '',
        weight: response.data.weight || '',
        email: response.data.email || user?.email || '',
        phone: response.data.phone || '',
        alternatePhone: response.data.alternatePhone || '',
        address: response.data.address || '',
        city: response.data.city || '',
        state: response.data.state || '',
        zipCode: response.data.zipCode || '',
        country: response.data.country || 'USA',
        emergencyContactName: response.data.emergencyContactName || '',
        emergencyContactRelation: response.data.emergencyContactRelation || '',
        emergencyContactPhone: response.data.emergencyContactPhone || '',
        insuranceProvider: response.data.insuranceProvider || '',
        policyNumber: response.data.policyNumber || '',
        groupNumber: response.data.groupNumber || '',
        expiryDate: response.data.expiryDate || null,
        allergies: response.data.allergies || [],
        chronicConditions: response.data.chronicConditions || [],
        medications: response.data.medications || [],
        pastSurgeries: response.data.pastSurgeries || [],
        preferredLanguage: response.data.preferredLanguage || 'English',
        communicationPreference: response.data.communicationPreference || 'email',
        smsNotifications: response.data.smsNotifications ?? true,
        emailNotifications: response.data.emailNotifications ?? true,
        appointmentReminders: response.data.appointmentReminders ?? true,
      });
      setError('');
    }catch(err){
      console.error('Failed to fetch profile.',err);
      setError('Failed to load profile.');
      toast.error('Failed to load profile.');
    }finally{
      setLoading(false);
    }
  };

  const handleSave = async() =>{
    setSaveLoading(true);
    try{
      await PatientService.updateProfile(formData);
      toast.success('Profile updated successfully.');
      setEditMode(false);
      fetchProfile();
    }catch(err){
      toast.error('Failed to update profile.');
    }finally{
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async()=>{
    if(passwordData.new !== passwordData.confirm){
      toast.error('Passwords do not match');
      return;
    }
    try{
      await authService.resetPassword();
      toast.success('Password changed successfully');
      setPasswordDialog(false);
      setPasswordData({current: '',new: '',confirm: ''});
    }catch(err){
      toast.error('Failed to change Password');
    }
  };

  const handleAddAllergy = (index) =>{
    setFormData({
      ...formData,allergies: formData.allergies.filter((_,i) => i !== index),
    });
  };

  const handleRemoveAllergy = (index)=>{
    setFormData({
      ...formData,allergies: formData.allergies.filter((_,i)=> i == index),
    });
  };

  const handleAddMedications = (med) =>{
    setFormData({
      ...formData,medications:[...formData.medications,med]
    });
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
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setEditMode(false);
                  fetchProfile();
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Card sx={{ mb: 3, p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Tooltip title="Verified Account">
                  <VerifiedIcon color="primary" sx={{ fontSize: 24 }} />
                </Tooltip>
              }
            >
              <ProfileAvatar>
                {formData.firstName?.[0]}{formData.lastName?.[0]}
              </ProfileAvatar>
            </Badge>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              {formData.firstName} {formData.lastName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip icon={<EmailIcon />} label={formData.email} variant="outlined" />
              <Chip icon={<PhoneIcon />} label={formData.phone} variant="outlined" />
              <Chip icon={<CalendarIcon />} label={`Member since ${formatDate(profile?.memberSince || new Date(), 'MMMM yyyy')}`} variant="outlined" />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary.main">
                  95%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Profile Completion
                </Typography>
              </Box>
              <Box sx={{ width: 100 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={95} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <StyledTab label="Personal Info" icon={<PersonIcon />} iconPosition="start" />
          <StyledTab label="Medical Info" icon={<HealthIcon />} iconPosition="start" />
          <StyledTab label="Insurance" icon={<PaymentIcon />} iconPosition="start" />
          <StyledTab label="Emergency" icon={<EmergencyIcon />} iconPosition="start" />
          <StyledTab label="Preferences" icon={<SettingsIcon />} iconPosition="start" />
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
                        <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
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
                  <LocationIcon color="primary" /> Contact Information
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
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Alternate Phone"
                      value={formData.alternatePhone}
                      onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                      disabled={!editMode}
                      size="small"
                    />
                  </Grid>
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

          <Grid item xs={12}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <SecurityIcon color="primary" /> Account Security
                </SectionTitle>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => setPasswordDialog(true)}
                    >
                      Change Password
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<FingerprintIcon />}
                      onClick={() => setVerificationDialog(true)}
                    >
                      Two-Factor Authentication
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<WarningIcon />}
                      onClick={() => setDeleteDialog(true)}
                    >
                      Delete Account
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </InfoCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <HeartIcon color="primary" /> Vital Stats
                </SectionTitle>
                <List>
                  <ListItem>
                    <ListItemIcon><BloodIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Blood Type"
                      secondary={
                        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                          <Select
                            value={formData.bloodGroup}
                            onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                            disabled={!editMode}
                            size="small"
                          >
                            <MenuItem value="A+">A+</MenuItem>
                            <MenuItem value="A-">A-</MenuItem>
                            <MenuItem value="B+">B+</MenuItem>
                            <MenuItem value="B-">B-</MenuItem>
                            <MenuItem value="O+">O+</MenuItem>
                            <MenuItem value="O-">O-</MenuItem>
                            <MenuItem value="AB+">AB+</MenuItem>
                            <MenuItem value="AB-">AB-</MenuItem>
                          </Select>
                        </FormControl>
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><HeightIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Height"
                      secondary={
                        <TextField
                          fullWidth
                          size="small"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          disabled={!editMode}
                          placeholder="cm"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                          }}
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><WeightIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Weight"
                      secondary={
                        <TextField
                          fullWidth
                          size="small"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          disabled={!editMode}
                          placeholder="kg"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                          }}
                        />
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <AllergyIcon color="primary" /> Allergies
                </SectionTitle>
                <Box sx={{ mb: 2 }}>
                  {formData.allergies.map((allergy, index) => (
                    <Chip
                      key={index}
                      label={allergy}
                      onDelete={editMode ? () => handleRemoveAllergy(index) : undefined}
                      sx={{ m: 0.5 }}
                      color="warning"
                      variant="outlined"
                    />
                  ))}
                </Box>
                {editMode && (
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add allergy"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        handleAddAllergy(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                )}
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <MedicationIcon color="primary" /> Current Medications
                </SectionTitle>
                <List dense>
                  {formData.medications.map((med, index) => (
                    <ListItem key={index}>
                      <ListItemIcon><MedicationIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary={med} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12}>
            <InfoCard>
              <CardContent>
                <SectionTitle>
                  <HealthIcon color="primary" /> Medical History
                </SectionTitle>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Chronic Conditions
                    </Typography>
                    <List>
                      {formData.chronicConditions.map((condition, index) => (
                        <ListItem key={index}>
                          <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary={condition} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Past Surgeries
                    </Typography>
                    <List>
                      {formData.pastSurgeries.map((surgery, index) => (
                        <ListItem key={index}>
                          <ListItemIcon><LocalHospitalIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary={surgery} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </InfoCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <InfoCard>
          <CardContent>
            <SectionTitle>
              <PaymentIcon color="primary" /> Insurance Information
            </SectionTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Insurance Provider"
                  value={formData.insuranceProvider}
                  onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                  disabled={!editMode}
                  margin="normal"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Policy Number"
                  value={formData.policyNumber}
                  onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                  disabled={!editMode}
                  margin="normal"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Group Number"
                  value={formData.groupNumber}
                  onChange={(e) => setFormData({ ...formData, groupNumber: e.target.value })}
                  disabled={!editMode}
                  margin="normal"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Policy Expiry"
                    value={formData.expiryDate}
                    onChange={(date) => setFormData({ ...formData, expiryDate: date })}
                    disabled={!editMode}
                    slotProps={{ textField: { size: 'small', fullWidth: true, margin: 'normal' } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </CardContent>
        </InfoCard>
      )}

      {tabValue === 3 && (
        <InfoCard>
          <CardContent>
            <SectionTitle>
              <EmergencyIcon color="primary" /> Emergency Contact
            </SectionTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  disabled={!editMode}
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </InfoCard>
      )}

      {tabValue === 4 && (
        <InfoCard>
          <CardContent>
            <SectionTitle>
              <SettingsIcon color="primary" /> Notification Preferences
            </SectionTitle>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Preferred Language</InputLabel>
                  <Select
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    disabled={!editMode}
                    label="Preferred Language"
                  >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Spanish">Spanish</MenuItem>
                    <MenuItem value="French">French</MenuItem>
                    <MenuItem value="Mandarin">Mandarin</MenuItem>
                  </Select>
                </FormControl>

                <FormControl component="fieldset">
                  <FormLabel component="legend">Communication Preference</FormLabel>
                  <RadioGroup
                    value={formData.communicationPreference}
                    onChange={(e) => setFormData({ ...formData, communicationPreference: e.target.value })}
                  >
                    <FormControlLabel value="email" control={<Radio />} label="Email" disabled={!editMode} />
                    <FormControlLabel value="sms" control={<Radio />} label="SMS" disabled={!editMode} />
                    <FormControlLabel value="both" control={<Radio />} label="Both" disabled={!editMode} />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Notifications
                </Typography>
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
              </Grid>
            </Grid>
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

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body2" paragraph>
            Are you sure you want to delete your account?
          </Typography>
          <TextField
            fullWidth
            label="Type 'DELETE' to confirm"
            onChange={(e) => {}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}