import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Divider,
  Avatar,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  IconButton,
  Tooltip,
  Zoom,
  Badge,
  LinearProgress,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  ListItemAvatar,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Backdrop,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Skeleton,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Medication as MedicationIcon,
  Science as LabIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  Note as NoteIcon,
  VideoCall as VideoCallIcon,
  Message as MessageIcon,
  LocalHospital as HospitalIcon,
  Bloodtype as BloodIcon,
  Height as HeightIcon,
  MonitorWeight as WeightIcon,
  Favorite as HeartIcon,
  Biotech as BiotechIcon,
  Timeline as TimelineIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Vaccines as VaccinesIcon,
  Emergency as EmergencyIcon,
  FamilyRestroom as FamilyIcon,
  HealthAndSafety as HealthIcon,
} from '@mui/icons-material';
import { format, formatDistance, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';
import { doctorSevice } from '../../../services/users/doctor';
import { PatientService } from '../../../services/users/patient';
import { labServices } from '../../../services/users/labtech';
import { formatDate, formatTime, getInitials } from '../../../formatters';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    minHeight: 48,
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

const VitalCard = styled(Card)(({ theme, color }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
  borderLeft: `5px solid ${color}`,
}));

const RiskBadge = styled(Chip)(({ theme, level }) => ({
  backgroundColor:
    level === 'high' ? alpha(theme.palette.error.main, 0.1) :
      level === 'moderate' ? alpha(theme.palette.warning.main, 0.1) :
        alpha(theme.palette.success.main, 0.1),
  color:
    level === 'high' ? theme.palette.error.main :
      level === 'moderate' ? theme.palette.warning.main :
        theme.palette.success.main,
  fontWeight: 600,
}));

const calculateAge = (dob) => {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
};

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: alpha(
    status === 'completed' || status === 'paid' ? theme.palette.success.main :
      status === 'pending' || status === 'scheduled' ? theme.palette.warning.main :
        theme.palette.error.main, 0.1
  ),
  color:
    status === 'completed' || status === 'paid' ? theme.palette.success.main :
      status === 'pending' || status === 'scheduled' ? theme.palette.warning.main :
        theme.palette.error.main,
  fontWeight: 600,
}));

export const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [sendDialog, setSendDialog] = useState(false);
  const [anchorE1, setAnchorE1] = useState('');
  const [messageText, setMessageText] = useState('');
  const [appointmentData, setAppointmentData] = useState({
    date: null,
    time: '',
    reason: '',
  });

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const patientResponse = await doctorSevice.patientDetail(id);
      setPatient(patientResponse.data);

      const appointmentResponse = await doctorSevice.getAllAppointments();
      const patientAppointments = appointmentResponse.data.filter(apt => apt.patient_id === parseInt(id));
      setAppointments(patientAppointments);

      const labResponse = await doctorSevice.getlabResult(id);
      setLabResults(labResponse.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch patient: ', err);
      setError(err?.response?.data?.message || 'Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToPatient = async () => {
    try {
      await doctorSevice.sendToPatient(id, { message: messageText });
      toast.success('Message sent to patient successfully');
      setSendDialog(false);
      setMessageText('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await doctorSevice.patientPdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `patient_${id}_summary.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handleViewAppointment = async (appointmentId) => {
    try {
      setProcessingId(appointmentId);
      await doctorSevice.appointmentView(appointmentId);
      toast.success('Appointment fetched successfully');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateLabRequest = () => {
    navigate('/doctor/lab/new', { state: { patientId: id } });
  };

  const handleRescheduleAppointment = async (appointment_id) => {
    setActionType("Reschedule");
    try {
      await doctorSevice.rescheduleAppointments(appointment_id, {
        new_date: rescheduleData.new_date,
        new_time: rescheduleData.new_time,
        reason: rescheduleData.reason,
        status: 'rescheduled',
      });
      toast.success('Appointment rescheduled successfully.');
      setRescheduleData({ new_date: null, new_time: '', reason: '' });
      fetchAppointments();
    } catch (err) {
      toast.error("Failed to complete action.Try again!");
    }
  };

  const handleMessagePatient = () => {
    setSendDialog(true);
  };

  const getAllPatients = async () => {
    setLoading(true);
    if (patients.length !== 0) {
      try {
        const res = doctorSevice.myPatients();
        setPatients(res.data());
        toast.success('All Patients fetched successfully');
      } catch (err) {
        toast.error('An error occurred...', err);
      }
      finally { setLoading(false); }
    } else {
      toast.info('No patients yet...');
    }
  };

  const handleContactPatient = () => {
    if (patient?.phone) {
      window.location.href = `Tel: ${patient.phone}`;
    }
  };

  const handleEmailPatient = () => {
    if (patient?.email) {
      window.location.href = `Mail: ${patient.email}`;
    }
  };

  const getInitialsFromPatient = () => {
    if (!patient) return 'P';
    return getInitials(patient.first_name, patient.last_name);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Skeleton variant='circular' width={40} height={40} sx={{ mr: 2 }} />
          <Skeleton variant='text' width={300} height={40} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant='rectangular' height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }
  if (error || !patient) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error' action={<Button color='inherit' size='small' onClick={getAllPatients}>Back to Patients.</Button>}>{error || 'Patient not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/doctor/patients-details')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Patient Profile
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Download PDF">
            <IconButton onClick={handleDownloadPDF}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Message Patient">
            <IconButton onClick={handleMessagePatient} color="primary">
              <MessageIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More Options">
            <IconButton onClick={(e) => setAnchorE1(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                }}
              >
                {getInitialsFromPatient()}
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {patient.first_name} {patient.last_name}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    icon={<CalendarIcon />}
                    label={`${patient.age} years`}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<PersonIcon />}
                    label={patient.gender || 'Not specified'}
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<BloodIcon />}
                    label={`ID: ${patient.id}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<PhoneIcon />}
                    onClick={handleContactPatient}
                    variant="outlined"
                  >
                    Call
                  </Button>
                  <Button
                    size="small"
                    startIcon={<MessageIcon />}
                    onClick={handleMessagePatient}
                    variant="outlined"
                  >
                    Message
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EmailIcon />}
                    onClick={handleEmailPatient}
                    variant="outlined"
                  >
                    Email
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <StyledTabs
        value={tabValue}
        onChange={(e, v) => setTabValue(v)}
        sx={{ mb: 3 }}
      >
        <Tab label="Personal Info" icon={<PersonIcon />} iconPosition="start" />
        <Tab label="Appointments" icon={<CalendarIcon />} iconPosition="start" />
        <Tab label="Lab Requests" icon={<LabIcon />} iconPosition="start" />
      </StyledTabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoCard>
              <CardContent>
                <SectionHeader>
                  <Typography variant="h6">Personal Information</Typography>
                </SectionHeader>

                <List dense>
                  <ListItem>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText
                      primary="Date of Birth"
                      secondary={`${formatDate(patient.date_of_birth)} (${calculateAge(patient.date_of_birth)} years)`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><PhoneIcon /></ListItemIcon>
                    <ListItemText primary="Phone" secondary={patient.phone || 'Not provided'} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><EmailIcon /></ListItemIcon>
                    <ListItemText primary="Email" secondary={patient.email || 'Not provided'} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><LocationIcon /></ListItemIcon>
                    <ListItemText primary="Address" secondary={patient.address || 'Not provided'} />
                  </ListItem>
                </List>
              </CardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Medical Information
                </Typography>

                <List dense>
                  <ListItem>
                    <ListItemIcon><HospitalIcon /></ListItemIcon>
                    <ListItemText
                      primary="Blood Type"
                      secondary={patient.blood_type || 'Unknown'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><WarningIcon /></ListItemIcon>
                    <ListItemText
                      primary="Allergies"
                      secondary={patient.allergies?.join(', ') || 'None known'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><DescriptionIcon /></ListItemIcon>
                    <ListItemText
                      primary="Medical Conditions"
                      secondary={patient.conditions?.join(', ') || 'None recorded'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </InfoCard>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <InfoCard>
          <CardContent>
            <SectionHeader>
              <Typography variant="h6">Appointment History</Typography>
            </SectionHeader>

            {appointments.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id} hover>
                        <TableCell>{formatDate(apt.date)}</TableCell>
                        <TableCell>{apt.time}</TableCell>
                        <TableCell>{apt.reason || 'Consultation'}</TableCell>
                        <TableCell>
                          <StatusChip label={apt.status} status={apt.status} size="small" />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleViewAppointment(apt.id)}
                          >
                            View
                          </Button>
                          {apt.status === 'scheduled' && (
                            <Button
                              size="small"
                              color="warning"
                              onClick={() => handleRescheduleAppointment(apt.id)}
                              sx={{ ml: 1 }}
                            >
                              Reschedule
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="textSecondary">No appointments found</Typography>
              </Box>
            )}
          </CardContent>
        </InfoCard>
      )}

      {tabValue === 2 && (
        <InfoCard>
          <CardContent>
            <SectionHeader>
              <Typography variant="h6">Lab Requests</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleCreateLabRequest}
              >
                New Lab Request
              </Button>
            </SectionHeader>

            {labResults.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Test Name</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {labResults.map((lab) => (
                      <TableRow key={lab.id} hover>
                        <TableCell>{lab.test_name}</TableCell>
                        <TableCell>{formatDate(lab.created_at)}</TableCell>
                        <TableCell>
                          <StatusChip label={lab.status} status={lab.status} size="small" />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => navigate('/doctor/patients-details')}
                            disabled={lab.status !== 'completed'}
                          >
                            {lab.status === 'completed' ? 'View' : 'Pending'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <LabIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography color="textSecondary" gutterBottom>
                  No lab requests found
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleCreateLabRequest}
                  sx={{ mt: 2 }}
                >
                  Create First Lab Request
                </Button>
              </Box>
            )}
          </CardContent>
        </InfoCard>
      )}

      <Dialog open={sendDialog} onClose={() => setSendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Send Message to Patient
            <IconButton onClick={() => setSendDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialog(false)}>Cancel</Button>
          <Button onClick={handleSendToPatient} variant="contained" disabled={!messageText.trim()}>
            Send
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorE1}
        open={Boolean(anchorE1)}
        onClose={() => setAnchorE1(null)}
      >
        <MenuItem onClick={handleDownloadPDF}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Download Patient PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => window.print()}>
          <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Print Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMessagePatient}>
          <ListItemIcon><MessageIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Send Message</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard');
          setAnchorE1(null);
        }}>
          <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PatientDetails;