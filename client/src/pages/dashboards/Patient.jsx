import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Container,
  TextField,
  InputAdornment,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  Description as MedicalIcon,
  Medication as PrescriptionIcon,
  Science as LabIcon,
  Receipt as BillIcon,
  Person as DoctorIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as TimeIcon,
  FileDownload as DownloadIcon,
  Payment as PaymentIcon,
  Message as MessageIcon,
  CreditCard as CreditCardIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext';
import { PatientService } from '../../services/users/patient';
import { coreService } from '../../services/users/core';
import { formatDate } from '../../formatters';

export const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await PatientService.getDashboard();
      setDashboardData(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await coreService.notifications();
      setNotifications(response.data);
    } catch (err) {
      console.log('Using fallback notifications');
      setNotifications([
        { id: 1, message: 'Appointment reminder for tomorrow', read: false },
        { id: 2, message: 'Lab results are ready', read: false },
        { id: 3, message: 'New message from Dr. Johnson', read: false },
      ]);
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
  };

  const handleNotificationClick = () => {
    const unreadCount = notifications.filter(n => !n.read).length;

    if (unreadCount === 0) {
      toast.info('No new notifications');
      return;
    }
    navigate('/patient/notification');
  };

  const handleActionCardClick = (action, patientId) => {
    switch (action) {
      case 'book':
        navigate(`/book/appointment/`);
        break;
      case 'prescription':
        navigate(`/patient/prescriptions`);
        break;
      case 'download':
        navigate(`/download/report/${patientId}`);
        break;
      case 'pay':
        navigate(`/view/bill/${patientId}`);
        break;
      default:
        toast.info(`Opening ${action} module`);
    }
  };

  const handleViewAppointment = (appointmentId) => {
    navigate(`/edit/appointment/${appointmentId}`);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        setCancellingId(appointmentId);
        await PatientService.cancelAppointment(appointmentId);

        toast.success('Appointment cancelled successfully');
        await fetchDashboardData();
        await fetchNotifications();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel appointment');
      } finally {
        setCancellingId(null);
      }
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      setConfirmingId(appointmentId);
      await PatientService.confirmAppointment(appointmentId);

      toast.success('Appointment confirmed successfully');
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm appointment');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      try {
        setLoading(true);
        const results = await PatientService.searchAll(searchTerm);
        navigate('/patient/search/suggestion', {
          state: {
            query: searchTerm, results: results.data
          }
        });
        setSearchTerm('');
      } catch (err) {
        toast.error('Search failed. Try again');
      } finally {
        setLoading(false);
      }
    }
  };

  const SearchResults = () => {
    const loaction = useLocation();
    const { query, results } = loaction.state || {};

    return (
      <Box sx={{ px: 3 }}>
        <Typography variant='h4'>Search Results for "{query}"</Typography>
      </Box>
    );
  }
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success';
      case 'pending':
      case 'requested':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <CheckIcon fontSize="small" />;
      case 'pending':
      case 'requested':
        return <TimeIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const patient = dashboardData?.patient || {};
  const stats = dashboardData?.statistics || {
    total_appointments: 0,
    upcoming_appointments_count: 0,
    active_prescriptions: 0,
    total_reports: 0
  };

  const upcomingAppointments = dashboardData?.appointments?.upcoming || [];
  const recentBills = dashboardData?.billing?.recent || [];
  const reminders = dashboardData?.reminders || [];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f7fb', minHeight: '100vh' }}>
      <Box
        component="nav"
        sx={{
          width: 250,
          flexShrink: 0,
          bgcolor: 'primary.main',
          color: 'white',
          height: '100vh',
          position: 'fixed',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            <Box component="span" sx={{ mr: 1 }}>🏥</Box>
            SmartCare Hospital
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Patient Portal
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: 'secondary.main',
              fontSize: '1.8rem',
              fontWeight: 600,
              border: '3px solid rgba(255,255,255,0.3)',
              mr: 2
            }}
          >
            {getInitials(patient.first_name, patient.last_name) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {patient.first_name} {patient.last_name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Patient ID: {patient.id ? `PT-${patient.id.toString().padStart(7, '0')}` : 'Loading...'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ py: 2 }}>
          {[
            { icon: <HomeIcon />, label: 'Dashboard', active: true, path: '/patient/dashboard' },
            { icon: <CalendarIcon />, label: 'Appointments', path: '/patient/appointments' },
            { icon: <PrescriptionIcon />, label: 'Prescriptions', path: '/patient/prescriptions' },
            { icon: <LabIcon />, label: 'Lab Reports', path: '/patient/lab-reports' },
            { icon: <BillIcon />, label: 'Billing & Payments', path: '/patient/bills' },
            { icon: <DoctorIcon />, label: 'Doctors', path: '/patient/doctors' },
            { icon: <SettingsIcon />, label: 'Settings', path: '/patient/settings' },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                mb: 0.5,
                '& a': {
                  display: 'flex',
                  alignItems: 'center',
                  px: 3,
                  py: 1.5,
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  borderLeft: '4px solid transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    borderLeftColor: 'white',
                  },
                  ...(item.active && {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    borderLeftColor: 'white',
                  }),
                },
              }}
            >
              <a href={item.path} onClick={(e) => { e.preventDefault(); navigate(item.path); }}>
                <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>{item.icon}</Box>
                <Typography variant="body2">{item.label}</Typography>
              </a>
            </Box>
          ))}

          <Box sx={{ mt: 4, px: 3 }}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.main',
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: '250px',
          p: 3,
          transition: 'all 0.3s ease',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <TextField
            placeholder="Search appointments, records, etc..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearch}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Typography variant="body2" color="textSecondary">
              <CalendarMonthIcon sx={{ mr: 1, fontSize: 16 }} />
              {formatDate(new Date(), 'full')}
            </Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, #1a73e8, #6a11cb)',
            color: 'white',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
            }
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Welcome back, {patient.first_name || 'User'}!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
            You have {stats.upcoming_appointments_count || 0} upcoming appointments and {stats.active_prescriptions || 0} active prescriptions.
            Check your dashboard for the latest updates on your health journey.
          </Typography>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderTop: '5px solid #1a73e8' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Total Appointments
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.total_appointments || 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                  <ArrowUpIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {stats.appointment_increase || 0}% increase
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderTop: '5px solid #34a853' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Upcoming Appointments
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.upcoming_appointments_count || 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                  <TimeIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    Next: {upcomingAppointments[0]?.appointment_date ?
                      formatDate(upcomingAppointments[0].appointment_date, 'short') : 'None'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderTop: '5px solid #fbbc05' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Active Prescriptions
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.active_prescriptions || 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', color: stats.prescriptions_expiring > 0 ? 'error.main' : 'success.main' }}>
                  {stats.prescriptions_expiring > 0 ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />}
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {stats.prescriptions_expiring || 0} need renewal
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderTop: '5px solid #ea4335' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Lab Reports
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {stats.total_reports || 0}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', color: stats.new_reports > 0 ? 'warning.main' : 'success.main' }}>
                  <CheckIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {stats.new_reports || 0} new reports
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Upcoming Appointments
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleActionCardClick('book')}
            >
              Book New Appointment
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Doctor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((apt) => (
                    <TableRow key={apt.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {apt.appointment_date ? formatDate(apt.appointment_date, 'short') : 'TBD'}, {apt.time || '--:--'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Dr. {apt.doctor_name || 'Not Assigned'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {apt.doctor_specialization || ''}
                        </Typography>
                      </TableCell>
                      <TableCell>{apt.department || 'General'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={apt.status || 'Scheduled'}
                          color={getStatusColor(apt.status)}
                          icon={getStatusIcon(apt.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewAppointment(apt.id)}
                            sx={{ mr: 1 }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {apt.status?.toLowerCase() !== 'cancelled' && apt.status?.toLowerCase() !== 'completed' && (
                          <Tooltip title="Cancel">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancelAppointment(apt.id)}
                              disabled={cancellingId === apt.id}
                            >
                              {cancellingId === apt.id ? <CircularProgress size={18} /> : <CancelIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary" gutterBottom>
                        No upcoming appointments
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleActionCardClick('book')}
                        sx={{ mt: 2 }}
                      >
                        Book Appointment
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            <Box component="span" sx={{ mr: 1 }}>⚡</Box>
            Quick Actions
          </Typography>

          <Grid container spacing={2}>
            {[
              { icon: <CalendarMonthIcon />, title: 'Book Appointment', desc: 'Schedule a new appointment', action: 'book' },
              { icon: <MedicalIcon />, title: 'View Records', desc: 'Access your medical history', action: 'records' },
              { icon: <PrescriptionIcon />, title: 'Request Prescription', desc: 'Request refill for medications', action: 'prescription' },
              { icon: <DownloadIcon />, title: 'Download Reports', desc: 'Download lab test results', action: 'download' },
              { icon: <MessageIcon />, title: 'Message Doctor', desc: 'Send a secure message', action: 'message' },
              { icon: <CreditCardIcon />, title: 'Pay Bill', desc: 'View and pay medical bills', action: 'pay' },
            ].map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => handleActionCardClick(action.action)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: 'primary.main', fontSize: '2.5rem', mb: 1 }}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {action.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {reminders.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Reminders
            </Typography>
            <Grid container spacing={2}>
              {reminders.map((reminder, index) => (
                <Grid item xs={12} key={index}>
                  <Alert
                    severity={reminder.priority === 'high' ? 'error' : 'warning'}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="body2">{reminder.message}</Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Box
          component="footer"
          sx={{
            textAlign: 'center',
            py: 3,
            color: 'text.secondary',
            borderTop: '1px solid',
            borderColor: 'divider',
            mt: 4,
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} SmartCare Hospital. All rights reserved. | Patient Portal v2.1
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PatientDashboard;