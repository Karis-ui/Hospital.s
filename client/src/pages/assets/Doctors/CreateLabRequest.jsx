import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Step, Stepper, StepLabel,
  Paper,
  Typography,
  Grid,
  Card,
  Fade,
  CardContent,
  TextField,
  Button,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slide,
  Grow,
  Divider,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Zoom,
  InputAdornment,
  Switch,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Badge,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Science as LabIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  LocalHospital as HospitalIcon,
  Biotech as BiotechIcon,
  Bloodtype as BloodIcon,
  BloodtypeSharp as MicrobeIcon,
  Badge as BadgeIcon,
  Note as NoteIcon,
  BloodtypeTwoTone as DNAIcon,
  AccessTime as AccessTimeIcon,
  WaterDrop as UrineIcon,
  LensBlur as MicroscopeIcon,
  Radar as XRayIcon,
  Send as SendIcon,
  Favorite as HeartIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  ZoomOut
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';
import { doctorSevice } from '../../../services/users/doctor';
import { formatDate, formatTime, getInitials } from '../../../formatters';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  padding: theme.spacing(3),
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 15px 50px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const GradientHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2, 2, 0, 0),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    background: `radial-gradient(circle, ${alpha('#fff', 0.2)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    background: `radial-gradient(circle, ${alpha('#fff', 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const PatientCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[10],
    borderColor: theme.palette.primary.main,
  },
}));

const TestCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.info.main, 0.02),
    borderColor: alpha(theme.palette.info.main, 0.3),
  },
}));

const CategoryBadge = styled(Chip)(({ theme, category }) => {
  const colors = {
    'Hematology': { bg: alpha('#ef5350', 0.1), color: '#ef5350' },
    'Chemistry': { bg: alpha('#42a5f5', 0.1), color: '#42a5f5' },
    'Microbiology': { bg: alpha('#66bb6a', 0.1), color: '#66bb6a' },
    'Immunology': { bg: alpha('#ffa726', 0.1), color: '#ffa726' },
    'Cardiology': { bg: alpha('#ab47bc', 0.1), color: '#ab47bc' },
    'Radiology': { bg: alpha('#7e57c2', 0.1), color: '#7e57c2' },
    'Ultrasound': { bg: alpha('#26c6da', 0.1), color: '#26c6da' },
    'CT Scan': { bg: alpha('#ec407a', 0.1), color: '#ec407a' },
    'MRI': { bg: alpha('#5c6bc0', 0.1), color: '#5c6bc0' },
  };
  const color = colors[category] || { bg: alpha('#9e9e9e', 0.1), color: '#9e9e9e' };

  return {
    backgroundColor: color.bg,
    color: color.color,
    borderColor: alpha(color.color, 0.3),
    fontWeight: 600,
    fontSize: '0.75rem',
    '& .MuiChip-icon': {
      color: color.color,
    },
  };
});

const PriorityIndicator = styled(Box)(({ theme, priority }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(3),
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor:
    priority === 'urgent' ? alpha(theme.palette.error.main, 0.1) :
      priority === 'high' ? alpha(theme.palette.warning.main, 0.1) :
        alpha(theme.palette.success.main, 0.1),
  color:
    priority === 'urgent' ? theme.palette.error.main :
      priority === 'high' ? theme.palette.warning.main :
        theme.palette.success.main,
  border: `1px solid ${priority === 'urgent' ? alpha(theme.palette.error.main, 0.3) :
    priority === 'high' ? alpha(theme.palette.warning.main, 0.3) :
      alpha(theme.palette.success.main, 0.3)
    }`,
}));

const StepIcon = styled(Box)(({ theme, active, completed }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: completed
    ? theme.palette.success.main
    : active
      ? theme.palette.primary.main
      : alpha(theme.palette.grey[500], 0.1),
  color: completed || active ? 'white' : theme.palette.text.secondary,
  transition: 'all 0.3s ease',
  animation: active ? 'pulse 2s infinite' : 'none',
  '@keyframes pulse': {
    '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}` },
    '70%': { boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0)}` },
    '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}` },
  },
}));

const FloatingSendButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(3),
  boxShadow: theme.shadows[10],
  zIndex: 1000,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[15],
  },
}));

const LAB_TESTS_BY_CATEGORY = {
  Biochemistry: [
    'Liver Function Test (LFT)',
    'Renal Function Test (RFT)',
    'Blood Glucose',
    'Lipid Profile',
    'Electrolytes',
  ],
  Microbiology: [
    'Blood Culture',
    'Urine Culture',
    'Stool Culture',
    'Wound Swab',
  ],
  Immunology: [
    'HIV Test',
    'Hepatitis B Surface Antigen',
    'Hepatitis C Antibody',
    'COVID-19 PCR',
    'Dengue Serology',
  ],
  Urinalysis: [
    'Urinalysis (UA)',
    'Urine Microscopy',
    'Urine Protein/Creatinine Ratio',
  ],
};

const ALL_COMMON_TESTS = [
  'Complete Blood Count (CBC)',
  'Liver Function Test (LFT)',
  'Renal Function Test (RFT)',
  'Blood Glucose',
  'Lipid Profile',
  'Urinalysis (UA)',
  'Blood Culture',
  'HIV Test',
  'Vitamin D',
  'Vitamin B12',
];

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal', color: '#2e7d32' },
  { value: 'urgent', label: 'Urgent', color: '#ed6c02' },
  { value: 'stat', label: 'STAT (Immediate)', color: '#c62828' },
];

export const CreateLabRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [patient, setPatient] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);
  const [currentTest, setCurrentTest] = useState({ name: '', category: '', instructions: '' });
  const [requestData, setRequestData] = useState({
    diagnosis: '',
    clinicalNotes: '',
    priority: 'routine',
    isUrgent: false,
    fasting: false,
    collectionDate: new Date(),
    collectionTime: '08:00',
    sendToPatient: true,
    instructions: '',
    is_active: true,
  });
  const [contactInfo, setConatctInfo] = useState({ email: '', phone: '' });
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select Patient', 'Choose Tests', 'Review & Send'];
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    setPageLoaded(true);
    if (location.state?.patientId) {
      loadPatient(location.state.patientId);
    } else {
      loadPatients();
    }
  }, [location.state]);

  const loadPatients = async () => {
    setSearchLoading(true);
    try {
      const response = await doctorSevice.myPatients();
      setPatient(response.data || []);
    } catch (err) {
      console.error('Failed to load patients.Try again!');
    } finally {
      setSearchLoading(false);
    }
  };

  const loadPatient = async (patientId) => {
    setSearchLoading(true);
    try {
      const response = await doctorSevice.patientDetail(patientId);
      setSelectedPatient(response.data);
      setConatctInfo({ email: response.data.email || '', phone: response.data.phone || '' });
      toast.success('Patient loaded successfully');
    } catch (err) {
      toast.error('Failed to load patient.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddTest = () => {
    if (!currentTest.name) {
      toast.error('Please select a test.');
      return;
    }
    setSelectedTests([...selectedTests, currentTest]);
    setCurrentTest({ name: '', category: '', instructions: '', });
    toast.success('Test added to request.');
  };

  const handleRemoveTest = (index) => {
    setSelectedTests(selectedTests.filter((_, i) => i !== index));
    toast.info('Test removed.');
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedPatient) {
      toast.error('Please select a patient.');
      return;
    }
    if (activeStep === 1 && !selectedTests.length === 0) {
      toast.error('Please select at least one test.');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      return;
    }
    else {
      setActiveStep((prev) => prev - 1);
    }
  }
  const handleSendRequest = async () => {
    setSending(true);
    try {
      const labRequest = {
        doctor_id: user?.id,
        doctor_name: `Dr. ${user?.full_name}`,
        patient_id: selectedPatient.id,
        patient_name: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
        date: new Date().toISOString(),
        diagnosis: requestData.diagnosis,
        instructions: requestData.instructions,
        is_urgent: requestData.priority === 'urgent' || requestData.priority === 'stat',
        is_active: requestData.is_active
      };
      await doctorSevice.createLabRequest(labRequest);
      toast.success('Lab request sent sucessfully.');
      setTimeout(() => navigate('/doctor/lab/new'), 2000);
    } catch (err) {
      toast.error('Failed to send request.Try again!');
      console.error(err);
    } finally { setSending(false); }
  };
  const getStepIcon = (step) => {
    const icons = [<PersonIcon />, <BiotechIcon />, <SendIcon />];
    return icons[step];
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Select Patient
              </Typography>

              {!selectedPatient ? (
                <Grow in timeout={600}>
                  <Box>
                    <Autocomplete
                      options={patient}
                      loading={searchLoading}
                      getOptionLabel={(p) => `${p.first_name} ${p.last_name} (ID: ${p.id})`}
                      onChange={(e, newValue) => {
                        if (newValue) loadPatient(newValue.id);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search patient by name or ID"
                          fullWidth
                          size="medium"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon color="primary" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <>
                                {searchLoading && <CircularProgress color="primary" size={20} />}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              backgroundColor: alpha('#fff', 0.8),
                            },
                          }}
                        />
                      )}
                    />

                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                      Or select from recent patients below
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {patient.slice(0, 3).map((patient) => (
                        <Grid item xs={12} sm={4} key={patient.id}>
                          <Slide direction="up" in timeout={700 + patient.id * 100}>
                            <div>
                              <PatientCard onClick={() => loadPatient(patient.id)}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                  <Avatar
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      mx: 'auto',
                                      mb: 1,
                                      bgcolor: 'primary.main',
                                    }}
                                  >
                                    {getInitials(patient.first_name, patient.last_name)}
                                  </Avatar>
                                  <Typography variant="subtitle2" noWrap>
                                    {patient.first_name} {patient.last_name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    ID: {patient.id}
                                  </Typography>
                                </CardContent>
                              </PatientCard>
                            </div>
                          </Slide>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grow>
              ) : (
                <Grow in timeout={500}>
                  <PatientCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 70,
                            height: 70,
                            bgcolor: 'primary.main',
                            fontSize: '2rem',
                          }}
                        >
                          {getInitials(selectedPatient.first_name, selectedPatient.last_name)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {selectedPatient.first_name} {selectedPatient.last_name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                            <Chip
                              icon={<PersonIcon />}
                              label={`DOB: ${formatDate(selectedPatient.date_of_birth)}`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={<BadgeIcon />}
                              label={`ID: ${selectedPatient.id}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <Tooltip title="Change Patient" TransitionComponent={ZoomOut}>
                          <IconButton
                            onClick={() => setSelectedPatient(null)}
                            sx={{
                              bgcolor: alpha('#f44336', 0.1),
                              '&:hover': { bgcolor: alpha('#f44336', 0.2) },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </PatientCard>
                </Grow>
              )}
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                <BiotechIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Choose Tests
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      background: `linear-gradient(135deg, ${alpha('#fff', 0.9)} 0%, ${alpha('#f5f5f5', 0.9)} 100%)`,
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Add New Test
                      </Typography>

                      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={currentTest.category}
                          onChange={(e) => {
                            setCurrentTest({
                              ...currentTest,
                              category: e.target.value,
                              name: '',
                            });
                          }}
                          label="Category"
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">
                            <em>All Categories</em>
                          </MenuItem>
                          {Object.keys(selectedTests).map(cat => (
                            <MenuItem key={cat} value={cat}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {cat === 'Hematology' && <BloodIcon fontSize="small" />}
                                {cat === 'Chemistry' && <BiotechIcon fontSize="small" />}
                                {cat === 'Microbiology' && <MicrobeIcon fontSize="small" />}
                                {cat === 'Immunology' && <DNAIcon fontSize="small" />}
                                {cat === 'Cardiology' && <HeartIcon fontSize="small" />}
                                {cat === 'Radiology' && <XRayIcon fontSize="small" />}
                                {cat}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Autocomplete
                        key={currentTest.category}
                        options={
                          currentTest.category
                            ? LAB_TESTS_BY_CATEGORY[currentTest.category] || []
                            : ALL_COMMON_TESTS
                        }
                        value={currentTest.name}
                        onChange={(e, newValue) => setCurrentTest({ ...currentTest, name: newValue || '' })}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Test name"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                          />
                        )}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        label="Special Instructions"
                        value={currentTest.instructions}
                        onChange={(e) => setCurrentTest({ ...currentTest, instructions: e.target.value })}
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                        placeholder="Any specific requirements..."
                      />

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={handleAddTest}
                        disabled={!currentTest.name}
                        sx={{
                          borderRadius: 3,
                          py: 1.5,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[5],
                          },
                        }}
                      >
                        Add to Request
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Selected Tests
                        </Typography>
                        <Badge
                          badgeContent={selectedTests.length}
                          color="primary"
                          sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                        >
                          <BiotechIcon color="action" />
                        </Badge>
                      </Box>

                      {selectedTests.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <LabIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                          <Typography color="textSecondary">
                            No tests selected yet
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Use the panel on the left to add tests
                          </Typography>
                        </Box>
                      ) : (
                        <List sx={{ maxHeight: 350, overflow: 'auto' }}>
                          {selectedTests.map((test, index) => (
                            <Slide direction="left" in timeout={300 + index * 50} key={index}>
                              <div>
                                <TestCard>
                                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                                          <BiotechIcon />
                                        </Avatar>
                                      </ListItemAvatar>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                          {test.name}
                                        </Typography>
                                        {test.category && (
                                          <CategoryBadge
                                            label={test.category}
                                            category={test.category}
                                            size="small"
                                            sx={{ mt: 0.5 }}
                                          />
                                        )}
                                        {test.instructions && (
                                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                                            <NoteIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                            {test.instructions}
                                          </Typography>
                                        )}
                                      </Box>
                                      <Tooltip title="Remove" TransitionComponent={Zoom}>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemoveTest(index)}
                                          sx={{ color: theme.palette.error.main }}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </CardContent>
                                </TestCard>
                              </div>
                            </Slide>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Zoom in timeout={600}>
                <Card sx={{ mt: 3, borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Clinical Information
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Diagnosis / Indication"
                          value={requestData.diagnosis}
                          onChange={(e) => setRequestData({ ...requestData, diagnosis: e.target.value })}
                          required
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Priority</InputLabel>
                          <Select
                            value={requestData.priority}
                            onChange={(e) => setRequestData({ ...requestData, priority: e.target.value })}
                            label="Priority"
                            sx={{ borderRadius: 2 }}
                          >
                            {PRIORITY_OPTIONS.map(opt => (
                              <MenuItem key={opt.value} value={opt.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ color: opt.color }}>{opt.icon}</Box>
                                  {opt.label}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={requestData.fasting}
                              onChange={(e) => setRequestData({ ...requestData, fasting: e.target.checked })}
                              color="primary"
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTimeIcon fontSize="small" />
                              <Typography>Fasting required</Typography>
                            </Box>
                          }
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Clinical Notes"
                          value={requestData.clinicalNotes}
                          onChange={(e) => setRequestData({ ...requestData, clinicalNotes: e.target.value })}
                          multiline
                          rows={2}
                          placeholder="Any specific clinical context..."
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Zoom>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                <SendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Review & Send
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'primary.main',
                          }}
                        >
                          {getInitials(selectedPatient?.first_name, selectedPatient?.last_name)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {selectedPatient?.first_name} {selectedPatient?.last_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            DOB: {formatDate(selectedPatient?.date_of_birth)} • ID: {selectedPatient?.id}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Tests Ordered ({selectedTests.length})
                      </Typography>

                      {selectedTests.map((test, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            mb: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                          }}
                        >
                          <BiotechIcon sx={{ color: theme.palette.info.main, mr: 2 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {test.name}
                            </Typography>
                            {test.instructions && (
                              <Typography variant="caption" color="textSecondary">
                                {test.instructions}
                              </Typography>
                            )}
                          </Box>
                          <CategoryBadge
                            label={test.category || 'General'}
                            category={test.category}
                            size="small"
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                  {/* Request Details */}
                  <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Request Details
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                          Diagnosis
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {requestData.diagnosis || 'Not specified'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Priority
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <PriorityIndicator priority={requestData.priority}>
                              {PRIORITY_OPTIONS.find(opt => opt.value === requestData.priority)?.icon}
                              <Box component="span" sx={{ ml: 0.5 }}>
                                {requestData.priority.toUpperCase()}
                              </Box>
                            </PriorityIndicator>
                          </Box>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Fasting
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {requestData.fasting ? 'Required' : 'Not required'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="textSecondary">
                          Collection Date/Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatDate(requestData.collectionDate)} at {requestData.collectionTime}
                        </Typography>
                      </Box>

                      {requestData.clinicalNotes && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="textSecondary">
                            Clinical Notes
                          </Typography>
                          <Typography variant="body2">
                            {requestData.clinicalNotes}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Patient Notification
                      </Typography>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={requestData.sendToPatient}
                            onChange={(e) => setRequestData({ ...requestData, sendToPatient: e.target.checked })}
                            color="primary"
                          />
                        }
                        label="Notify patient when tests are ordered"
                      />

                      {requestData.sendToPatient && (
                        <Zoom in timeout={300}>
                          <Box sx={{ mt: 2 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Email"
                              value={contactInfo.email}
                              onChange={(e) => setConatctInfo({ ...contactInfo, email: e.target.value })}
                              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailIcon fontSize="small" color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                            <TextField
                              fullWidth
                              size="small"
                              label="Phone"
                              value={contactInfo.phone}
                              onChange={(e) => setConatctInfo({ ...contactInfo, phone: e.target.value })}
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon fontSize="small" color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>
                        </Zoom>
                      )}

                      <Alert
                        severity="info"
                        sx={{
                          mt: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                        }}
                      >
                        <Typography variant="body2">
                          Lab department will handle scheduling and collection.
                          Results will be sent to you when ready.
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Slide direction="down" in={pageLoaded} timeout={500}>
          <GradientHeader sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  color: 'white',
                  mr: 2,
                  bgcolor: alpha('#fff', 0.1),
                  '&:hover': { bgcolor: alpha('#fff', 0.2) },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Order Lab Tests
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Select tests based on clinical requirements
                </Typography>
              </Box>
            </Box>
          </GradientHeader>
        </Slide>

        <GlassCard>
          <CardContent sx={{ p: 4 }}>
            <Stepper
              activeStep={activeStep}
              sx={{ mb: 4 }}
              alternativeLabel
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <StepIcon
                        active={activeStep === index}
                        completed={activeStep > index}
                      >
                        {getStepIcon(index)}
                      </StepIcon>
                    )}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0 || sending}
                sx={{ borderRadius: 3, px: 4 }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  onClick={handleSendRequest}
                  disabled={sending}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[5],
                    },
                  }}
                >
                  {sending ? 'Sending...' : 'Send Lab Request'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[5],
                    },
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </CardContent>
        </GlassCard>

        {activeStep === steps.length - 1 && selectedTests.length > 0 && !sending && (
          <Zoom in timeout={500}>
            <FloatingSendButton
              variant="contained"
              color="success"
              size="large"
              startIcon={<SendIcon />}
              onClick={handleSendRequest}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
              }}
            >
              Send Lab Request
            </FloatingSendButton>
          </Zoom>
        )}
      </Box>
    </PageContainer>
  );
};
