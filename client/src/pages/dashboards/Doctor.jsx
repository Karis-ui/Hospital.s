import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Badge,
  IconButton,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tooltip,
  Zoom,
  Fade,
  Slide,
  Grow,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Medication as PrescriptionIcon,
  Description as MedicalIcon,
  Assessment as ReportsIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Visibility as ViewIcon,
  FilePresent as RecordsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
  Favorite as HeartIcon,
  Biotech as LabIcon,
  Print as PrintIcon,
  EventNote as FollowUpIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Diamond as DiamondIcon,
  WorkspacePremium as PremiumIcon,
  Search as SearchIcon,
  RocketSharp as TrophyIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext';
import doctorService from '../../services/users/doctor'
import { coreService } from '../../services/users/core';
import { formatDate, getInitials } from '../../formatters';

const goldTheme = {
  primary: { main: '#D4AF37', light: '#F1E5C9', dark: '#AA8C2F', contrast: '#FFFFFF' },
  secondary: { main: '#C0C0C0', light: '#E8E8E8', dark: '#8C8C8C' },
  background: { default: '#1A1A1A', paper: '#2A2A2A', elevated: '#333333' },
  text: { primary: '#FFFFFF', secondary: '#C0C0C0', gold: '#D4AF37' },
  status: { waiting: '#FFA500', inProgress: '#D4AF37', completed: '#4CAF50', scheduled: '#2196F3', emergency: '#F44336' },
};

const Sidebar = styled(Box)(({ theme }) => ({
  width: 280,
  background: 'linear-gradient(180deg, #1A1A1A 0%, #2A2A2A 100%)',
  color: goldTheme.text.primary,
  position: 'fixed',
  height: '100vh',
  overflowY: 'auto',
  borderRight: `2px solid ${goldTheme.primary.main}`,
  boxShadow: `5px 0 25px rgba(212, 175, 55, 0.15)`,
  zIndex: 1200,
  transition: 'all 0.3s ease',
  '&::-webkit-scrollbar': { width: '8px' },
  '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.05)' },
  '&::-webkit-scrollbar-thumb': { background: goldTheme.primary.main, borderRadius: '4px' },
}));

const DoctorAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '0 auto 20px',
  background: `linear-gradient(135deg, ${goldTheme.primary.main}, ${goldTheme.primary.dark})`,
  border: `4px solid ${goldTheme.primary.main}`,
  boxShadow: `0 10px 25px rgba(212, 175, 55, 0.3)`,
  fontSize: '3rem',
  fontWeight: 700,
  color: '#1A1A1A',
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'scale(1.05)', boxShadow: `0 15px 35px rgba(212, 175, 55, 0.4)` },
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2A2A2A 0%, #333333 100%)',
  borderRadius: 16,
  border: `1px solid ${alpha(goldTheme.primary.main, 0.2)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${goldTheme.primary.main}, ${goldTheme.primary.light})`,
  },
  '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 20px 40px ${alpha(goldTheme.primary.main, 0.15)}`, borderColor: goldTheme.primary.main },
}));

const GoldButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${goldTheme.primary.main}, ${goldTheme.primary.light})`,
  color: '#1A1A1A',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: 50,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: `0 5px 15px ${alpha(goldTheme.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 25px ${alpha(goldTheme.primary.main, 0.4)}`, background: `linear-gradient(45deg, ${goldTheme.primary.light}, ${goldTheme.primary.main})` },
  '&:active': { transform: 'translateY(0)' },
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(42, 42, 42, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(goldTheme.primary.main, 0.2)}`,
  boxShadow: `0 10px 30px ${alpha('#000', 0.3)}`,
}));

const PatientAvatar = styled(Avatar)(({ theme }) => ({
  width: 45,
  height: 45,
  background: `linear-gradient(135deg, ${goldTheme.primary.main}, ${goldTheme.secondary.main})`,
  color: '#1A1A1A',
  fontWeight: 600,
  border: `2px solid ${goldTheme.primary.main}`,
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    waiting: { bg: alpha('#FFA500', 0.1), color: '#FFA500', border: '#FFA500' },
    inProgress: { bg: alpha(goldTheme.primary.main, 0.1), color: goldTheme.primary.main, border: goldTheme.primary.main },
    completed: { bg: alpha('#4CAF50', 0.1), color: '#4CAF50', border: '#4CAF50' },
    scheduled: { bg: alpha('#2196F3', 0.1), color: '#2196F3', border: '#2196F3' },
    emergency: { bg: alpha('#F44336', 0.1), color: '#F44336', border: '#F44336' },
  };
  const color = colors[status] || colors.scheduled;
  return {
    background: color.bg,
    color: color.color,
    border: `1px solid ${color.border}`,
    fontWeight: 600,
    borderRadius: 8,
    '& .MuiChip-icon': { color: color.color },
  };
});

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': { background: goldTheme.primary.main, color: '#1A1A1A', fontWeight: 700, border: `2px solid ${goldTheme.primary.dark}` },
}));

export const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getDashboard();
      setDashboardData(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await coreService.getNotifications();
      setNotifications(response.data);
    } catch (err) {
      setNotifications([
        { id: 1, type: 'lab', message: 'Lab results for Patient #456 are ready', time: '10 min ago', read: false },
        { id: 2, type: 'appointment', message: 'New appointment scheduled for tomorrow', time: '1 hour ago', read: false },
        { id: 3, type: 'warning', message: 'Patient #789 missed follow-up', time: '2 hours ago', read: false },
        { id: 4, type: 'message', message: 'New message from admin', time: '3 hours ago', read: false },
      ]);
    }
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      try {
        setSearchLoading(true);
        const results = await doctorService.searchItems(searchTerm);
        navigate('/doctor/search', {
          state: { query: searchTerm, results: results.data }
        });
        setSearchTerm('');
        toast.success(`Found ${results.data.length} results`);
      } catch (err) {
        toast.error('Search failed');
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const handleAppointments = async (appointmentId) => {
    try {
      setProcessingId(appointmentId);
      await doctorService.updateAppointment(appointmentId);
      toast.success('Appointment completed');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewAppointment = async (appointmentId) => {
    try {
      setProcessingId(appointmentId);
      await doctorService.appointmentView(appointmentId);
      toast.success('Appointment fetched successfully');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewPatient = async (patientId) => {
    await doctorService.patientDetail(patientId);
  };

  const handleQuickAction = (id,action) => {
    switch (action) {
      case 'prescriptions':
        navigate('/doctor/prescriptions');
        break;
      case 'record':
        navigate(`/doctor/patients/${id}/Medical-records`);
        break;
      case 'lab':
        navigate('/doctor/lab/new');
        break;
      case 'profile':
        navigate('/doctor/profile');
        break;
      default:
        toast.info(`Opening ${action} module`);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'lab': return <LabIcon sx={{ color: goldTheme.primary.main }} />;
      case 'appointment': return <CalendarIcon sx={{ color: goldTheme.primary.main }} />;
      case 'warning': return <WarningIcon sx={{ color: goldTheme.status.emergency }} />;
      case 'message': return <MessageIcon sx={{ color: goldTheme.secondary.main }} />;
      default: return <NotificationsIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)' }}>
        <CircularProgress sx={{ color: goldTheme.primary.main }} size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: '#1A1A1A', minHeight: '100vh' }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  const doctor = dashboardData?.doctor || user || {};
  const stats = dashboardData?.statistics || {
    today_appointments: 0,
    completed_today: 0,
    waiting: 0,
    total_patients: 0
  };

  const todayAppointments = dashboardData?.appointments?.today || [];
  const recentPatients = dashboardData?.patients?.recent || [];
  const upcomingAppointments = dashboardData?.appointments?.upcoming || [];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex', bgcolor: '#1A1A1A', minHeight: '100vh', color: goldTheme.text.primary }}>
      <Sidebar>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <DoctorAvatar>
            {getInitials(doctor.first_name, doctor.last_name)}
          </DoctorAvatar>

          <Typography variant="h5" sx={{ fontWeight: 700, color: goldTheme.primary.main, mb: 0.5 }}>
            Dr. {doctor.first_name} {doctor.last_name}
          </Typography>

          <Chip
            icon={<PremiumIcon />}
            label={doctor.specialization || 'Physician'}
            sx={{ background: alpha(goldTheme.primary.main, 0.1), color: goldTheme.primary.main, border: `1px solid ${goldTheme.primary.main}`, fontWeight: 600, mb: 2 }}
          />

          <Typography variant="body2" sx={{ color: goldTheme.text.secondary, mb: 2 }}>
            <HospitalIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
            ID: DR-{doctor.id?.toString().padStart(4, '0') || '0000'}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: alpha(goldTheme.primary.main, 0.2) }} />

        <List sx={{ px: 2, py: 2 }}>
          {[
            { icon: <DashboardIcon />, text: 'Dashboard', active: true, path: '/doctor/dashboard' },
            { icon: <CalendarIcon />, text: 'Appointments', badge: todayAppointments.length, path: '/doctor/appointments' },
            { icon: <PeopleIcon />, text: 'My Patients', path: '/doctor/patients' },
            { icon: <PrescriptionIcon />, text: 'Prescriptions', path: '/doctor/prescriptions' },
            { icon: <MedicalIcon />, text: 'Medical Records', path: '/doctor/records' },
            { icon: <ReportsIcon />, text: 'Reports', path: '/doctor/reports' },
            { icon: <MessageIcon />, text: 'Messages', badge: 3, path: '/doctor/messages' },
            { icon: <SettingsIcon />, text: 'Settings', path: '/doctor/settings' },
          ].map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  color: item.active ? goldTheme.primary.main : goldTheme.text.secondary,
                  bgcolor: item.active ? alpha(goldTheme.primary.main, 0.1) : 'transparent',
                  '&:hover': { bgcolor: alpha(goldTheme.primary.main, 0.15), color: goldTheme.primary.main },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: item.active ? 600 : 400 }} />
                {item.badge ? (
                  <Chip label={item.badge} size="small" sx={{ bgcolor: goldTheme.primary.main, color: '#1A1A1A', fontWeight: 700, fontSize: '0.75rem', height: 20 }} />
                ) : item.badge === 0 ? null : null}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, px: 3 }}>
          <GoldButton fullWidth startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ mb: 2 }}>
            Logout
          </GoldButton>
        </Box>
      </Sidebar>

      <Box sx={{ flexGrow: 1, ml: '280px', p: 4 }}>
        <Fade in timeout={1000}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: goldTheme.primary.main, textShadow: `0 0 20px ${alpha(goldTheme.primary.main, 0.3)}` }}>
                Welcome Back, Dr. {doctor.first_name}!
              </Typography>
              <Typography variant="h6" sx={{ color: goldTheme.text.secondary, mt: 1 }}>
                <DiamondIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle', color: goldTheme.primary.main }} />
                {formatDate(new Date(), 'full')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search patients..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearch}
                sx={{
                  width: 250,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: alpha(goldTheme.primary.main, 0.3) },
                    '&:hover fieldset': { borderColor: goldTheme.primary.main },
                    '&.Mui-focused fieldset': { borderColor: goldTheme.primary.main },
                  },
                  '& .MuiInputBase-input::placeholder': { color: alpha('#FFFFFF', 0.5), opacity: 1 },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {searchLoading ? <CircularProgress size={20} sx={{ color: goldTheme.primary.main }} /> : <SearchIcon sx={{ color: goldTheme.primary.main }} />}
                    </InputAdornment>
                  ),
                }}
              />

              <Tooltip title="Notifications" TransitionComponent={Zoom}>
                <IconButton onClick={handleNotificationClick} sx={{ bgcolor: alpha(goldTheme.primary.main, 0.1), '&:hover': { bgcolor: alpha(goldTheme.primary.main, 0.2) } }}>
                  <NotificationBadge badgeContent={unreadCount}>
                    <NotificationsIcon sx={{ color: goldTheme.primary.main }} />
                  </NotificationBadge>
                </IconButton>
              </Tooltip>

              <GoldButton startIcon={<AddIcon />} onClick={() => navigate('/doctor/appointments/new')}>
                New Appointment
              </GoldButton>
            </Box>
          </Box>
        </Fade>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { icon: <CalendarIcon />, value: stats.today_appointments, label: "Today's Appointments", color: goldTheme.primary.main },
            { icon: <CheckIcon />, value: stats.completed_today, label: 'Completed Today', color: goldTheme.secondary.main },
            { icon: <TimeIcon />, value: stats.waiting, label: 'Waiting', color: goldTheme.status.waiting },
            { icon: <PeopleIcon />, value: stats.total_patients, label: 'Total Patients', color: goldTheme.status.inProgress },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in timeout={1000 + index * 200}>
                <div>
                  <StatCard>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ color: stat.color, fontSize: '3rem', mb: 2 }}>{stat.icon}</Box>
                      <Typography variant="h2" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>{stat.value}</Typography>
                      <Typography variant="body1" sx={{ color: goldTheme.text.secondary }}>{stat.label}</Typography>
                    </CardContent>
                  </StatCard>
                </div>
              </Grow>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Slide direction="right" in timeout={1000}>
              <div>
                <GlassCard sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: goldTheme.primary.main, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon /> Today's Schedule
                  </Typography>

                  <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
                    {todayAppointments.length > 0 ? todayAppointments.map((apt, index) => (
                      <Box
                        key={apt.id}
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          bgcolor: alpha(apt.color || goldTheme.primary.main, 0.1),
                          border: `1px solid ${alpha(apt.color || goldTheme.primary.main, 0.3)}`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': { transform: 'translateX(5px)', boxShadow: `0 5px 15px ${alpha(apt.color || goldTheme.primary.main, 0.3)}` },
                        }}
                        onClick={handleViewAppointment}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 4, height: 40, bgcolor: apt.color || goldTheme.primary.main, borderRadius: 2 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {apt.patient_name} - {apt.reason || 'Consultation'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: goldTheme.text.secondary }}>
                              {apt.time} • Dr. {apt.doctor_name}
                            </Typography>
                          </Box>
                          <Chip label="View" size="small" sx={{ bgcolor: alpha(apt.color || goldTheme.primary.main, 0.2), color: apt.color || goldTheme.primary.main, border: `1px solid ${apt.color || goldTheme.primary.main}` }} />
                        </Box>
                      </Box>
                    )) : (
                      <Typography sx={{ textAlign: 'center', py: 4, color: goldTheme.text.secondary }}>
                        No appointments scheduled for today
                      </Typography>
                    )}
                  </Box>
                </GlassCard>
              </div>
            </Slide>

            <Slide direction="right" in timeout={1200}>
              <div>
                <GlassCard sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: goldTheme.primary.main, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrophyIcon /> Recent Patients
                  </Typography>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: goldTheme.text.secondary, fontWeight: 600 }}>Patient</TableCell>
                          <TableCell sx={{ color: goldTheme.text.secondary, fontWeight: 600 }}>Time</TableCell>
                          <TableCell sx={{ color: goldTheme.text.secondary, fontWeight: 600 }}>Type</TableCell>
                          <TableCell sx={{ color: goldTheme.text.secondary, fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ color: goldTheme.text.secondary, fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentPatients.length > 0 ? recentPatients.map((patient) => (
                          <TableRow key={patient.id} sx={{ '&:hover': { bgcolor: alpha(goldTheme.primary.main, 0.05) } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <PatientAvatar>{getInitials(patient.first_name, patient.last_name)}</PatientAvatar>
                                <Box>
                                  <Typography sx={{ fontWeight: 600 }}>{patient.first_name} {patient.last_name}</Typography>
                                  <Typography variant="caption" sx={{ color: goldTheme.text.secondary }}>
                                    {patient.reason || patient.complaint || 'Check-up'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{patient.time || '--:--'}</TableCell>
                            <TableCell>
                              <Chip
                                label={patient.type || 'Consultation'}
                                size="small"
                                sx={{ bgcolor: alpha(patient.type === 'Emergency' ? '#F44336' : goldTheme.primary.main, 0.1), color: patient.type === 'Emergency' ? '#F44336' : goldTheme.primary.main }}
                              />
                            </TableCell>
                            <TableCell>
                              <StatusChip
                                label={patient.status}
                                status={patient.status?.toLowerCase()}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {patient.status?.toLowerCase() === 'waiting' && (
                                <Button
                                  size="small"
                                  startIcon={<StartIcon />}
                                  onClick={() => handleAppointments(patient.appointment_id)}
                                  disabled={processingId === patient.appointment_id}
                                  sx={{ color: goldTheme.primary.main, borderColor: goldTheme.primary.main, '&:hover': { bgcolor: alpha(goldTheme.primary.main, 0.1) } }}
                                >
                                  {processingId === patient.appointment_id ? 'Starting...' : 'Start'}
                                </Button>
                              )}
                              {patient.status?.toLowerCase() === 'in-progress' && (
                                <Button
                                  size="small"
                                  startIcon={<CheckIcon />}
                                  onClick={() => handleAppointments(patient.appointment_id)}
                                  disabled={processingId === patient.appointment_id}
                                  sx={{ color: goldTheme.status.completed }}
                                >
                                  Complete
                                </Button>
                              )}
                              <Button
                                size="small"
                                startIcon={<ViewIcon />}
                                onClick={() => handleViewPatient(patient.id)}
                                sx={{ color: goldTheme.primary.main, ml: 1 }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3, color: goldTheme.text.secondary }}>
                              No recent patients
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </GlassCard>
              </div>
            </Slide>
          </Grid>
          <Grid item xs={12} md={4}>
            <Slide direction="left" in timeout={1000}>
              <div>
                <GlassCard sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: goldTheme.primary.main, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PremiumIcon /> Quick Actions
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { icon: <PrescriptionIcon />, text: 'Write Prescription', action: 'prescription', color: goldTheme.primary.main },
                      { icon: <MedicalIcon />, text: 'Add Medical Record', action: 'record', color: goldTheme.secondary.main },
                      { icon: <LabIcon />, text: 'Order Lab Test', action: 'lab', color: goldTheme.status.inProgress },
                      { icon: <FollowUpIcon />, text: 'Schedule Follow-up', action: 'followup', color: goldTheme.status.waiting },
                    ].map((action, index) => (
                      <GoldButton
                        key={index}
                        fullWidth
                        startIcon={action.icon}
                        onClick={() => handleQuickAction(action.action)}
                        sx={{ justifyContent: 'flex-start', px: 3, background: alpha(action.color, 0.1), color: action.color, border: `1px solid ${alpha(action.color, 0.3)}`, '&:hover': { background: alpha(action.color, 0.2) } }}
                      >
                        {action.text}
                      </GoldButton>
                    ))}
                  </Box>
                </GlassCard>
              </div>
            </Slide>

            <Slide direction="left" in timeout={1200}>
              <div>
                <GlassCard sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: goldTheme.primary.main, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon /> Upcoming Appointments
                  </Typography>

                  {upcomingAppointments.length > 0 ? upcomingAppointments.slice(0, 4).map((apt) => (
                    <Box
                      key={apt.id}
                      sx={{ p: 2, mb: 1, borderRadius: 2, bgcolor: alpha(goldTheme.primary.main, 0.05), border: `1px solid ${alpha(goldTheme.primary.main, 0.1)}`, transition: 'all 0.3s ease', '&:hover': { bgcolor: alpha(goldTheme.primary.main, 0.1), transform: 'translateX(5px)' } }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>{apt.patient_name}</Typography>
                          <Typography variant="caption" sx={{ color: goldTheme.text.secondary }}>
                            {formatDate(apt.date)} • {apt.time}
                          </Typography>
                        </Box>
                        <Chip
                          label={apt.type || 'Scheduled'}
                          size="small"
                          sx={{ bgcolor: alpha(goldTheme.primary.main, 0.1), color: goldTheme.primary.main }}
                        />
                      </Box>
                    </Box>
                  )) : (
                    <Typography sx={{ textAlign: 'center', py: 2, color: goldTheme.text.secondary }}>
                      No upcoming appointments
                    </Typography>
                  )}

                  <Button
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    onClick={(navigate('/doctor/appointments'))}
                    sx={{ mt: 2, color: goldTheme.primary.main, '&:hover': { bgcolor: alpha(goldTheme.primary.main, 0.1) } }}
                  >
                    View All Appointments
                  </Button>
                </GlassCard>
              </div>
            </Slide>
            <Slide direction="left" in timeout={1400}>
              <div>
                <GlassCard sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: goldTheme.primary.main, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsIcon /> Notifications
                  </Typography>

                  {notifications.map((notif) => (
                    <Box
                      key={notif.id}
                      sx={{ p: 2, mb: 1, borderRadius: 2, bgcolor: alpha(goldTheme.primary.main, 0.02), border: `1px solid ${alpha(goldTheme.primary.main, 0.05)}`, cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { bgcolor: alpha(goldTheme.primary.main, 0.05) } }}
                    >
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ color: goldTheme.primary.main }}>
                          {getNotificationIcon(notif.type)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">{notif.message}</Typography>
                          <Typography variant="caption" sx={{ color: goldTheme.text.secondary }}>
                            {notif.time}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </GlassCard>
              </div>
            </Slide>
          </Grid>
        </Grid>
      </Box>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        TransitionComponent={Zoom}
        PaperProps={{ sx: { mt: 2, bgcolor: '#2A2A2A', border: `1px solid ${goldTheme.primary.main}`, borderRadius: 2, minWidth: 300 } }}
      >
        {notifications.slice(0, 5).map((notif) => (
          <MenuItem key={notif.id} onClick={handleNotificationClose} sx={{ color: goldTheme.text.primary }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {getNotificationIcon(notif.type)}
              <Box>
                <Typography variant="body2">{notif.message}</Typography>
                <Typography variant="caption" sx={{ color: goldTheme.text.secondary }}>{notif.time}</Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default DoctorDashboard;