import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
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
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  LinearProgress,
  Tooltip,
  Zoom,
  Fade,
  Slide,
  Grow,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Medication as PrescriptionIcon,
  Description as MedicalIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
  Biotech as LabIcon,
  EventNote as FollowUpIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Diamond as DiamondIcon,
  WorkspacePremium as PremiumIcon,
  Search as SearchIcon,
  RocketSharp as TrophyIcon,
  BarChart as BarChartIcon,
  FilterList as FilterIcon,
  LocalPharmacy as PharmacyIcon,
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
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fallbackNotice, setFallbackNotice] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('week');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [clinicalWorklistError, setClinicalWorklistError] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('All');
  const [patientSearch, setPatientSearch] = useState('');
  const [clinicalWorklist, setClinicalWorklist] = useState({ prescriptions: [], labRequests: [] });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorService.getDashboard();
      setDashboardData(response.data?.data || response.data);
      setError('');
      setFallbackNotice('');
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      if ([401, 403].includes(err.response?.status)) {
        setError(err.response?.data?.message || 'You are not authorized to view this dashboard.');
        return;
      }
      setDashboardData({
        doctor: user || {},
        statistics: {
          today_appointments: 0,
          completed_today: 0,
          waiting: 0,
          total_patients: 0,
          total_appointments: 0,
          pending_prescriptions: 0,
        },
        appointments: { today: [], upcoming: [] },
        patients: { recent: [] },
        chart_data: { labels: [], values: [] },
      });
      setFallbackNotice('Live dashboard data is unavailable. Showing an empty placeholder until the server responds.');
      setError('');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await coreService.getNotifications();
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to load doctor notifications:', err);
      setNotifications([]);
    }
  }, []);

  const fetchAnalytics = useCallback(async (period) => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const response = await doctorService.statistics(period);
      setAnalyticsData(response.data?.data || response.data);
    } catch (err) {
      console.error('Failed to load dashboard analytics:', err);
      setAnalyticsError('Analytics are temporarily unavailable.');
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const fetchClinicalWorklist = useCallback(async () => {
    setClinicalWorklistError('');
    try {
      const [prescriptionsResponse, labsResponse] = await Promise.all([
        doctorService.prescriptions(),
        doctorService.getlabResult(),
      ]);
      const prescriptions = prescriptionsResponse.data?.data
        || prescriptionsResponse.data
        || [];
      setClinicalWorklist({
        prescriptions: Array.isArray(prescriptions) ? prescriptions : [],
        labRequests: Array.isArray(labsResponse.data) ? labsResponse.data : [],
      });
    } catch (err) {
      console.error('Failed to load clinical worklist:', err);
      setClinicalWorklistError('Clinical activity could not be refreshed.');
      setClinicalWorklist({ prescriptions: [], labRequests: [] });
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    fetchAnalytics('week');
    fetchClinicalWorklist();
  }, [fetchDashboardData, fetchNotifications, fetchAnalytics, fetchClinicalWorklist]);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      try {
        setSearchLoading(true);
        const results = await doctorService.searchItems(searchTerm);
        const searchResults = results.data?.data || {};
        const resultCount = Object.values(searchResults).reduce(
          (total, items) => total + (Array.isArray(items) ? items.length : 0),
          0
        );
        navigate('/doctor/search', {
          state: { query: searchTerm, results: searchResults }
        });
        setSearchTerm('');
        toast.success(`Found ${resultCount} results`);
      } catch (err) {
        toast.error('Search failed');
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const handleViewAppointment = async (appointmentId) => {
    try {
      await doctorService.appointmentView(appointmentId);
      toast.success('Appointment fetched successfully');
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch appointment');
    }
  };

  const handleQuickAction = (id,action) => {
    switch (action) {
      case 'prescription':
      case 'prescriptions':
        navigate('/doctor/prescriptions');
        break;
      case 'record':
        navigate(id
          ? `/doctor/patients/${id}/Medical-records`
          : '/doctor/patients-details');
        break;
      case 'lab':
        navigate('/doctor/lab/new');
        break;
      case 'followup':
        navigate('/doctor/appointments');
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
  const analyticsSummary = analyticsData?.summary || {};
  const statusBreakdown = analyticsData?.status_breakdown || [];
  const filteredTodayAppointments = todayAppointments.filter((appointment) => (
    scheduleFilter === 'All'
    || appointment.status?.toLowerCase() === scheduleFilter.toLowerCase()
  ));
  const filteredPatients = recentPatients.filter((appointment) => {
    const patientName = appointment.patient_name || '';
    const query = patientSearch.trim().toLowerCase();
    return !query
      || patientName.toLowerCase().includes(query)
      || String(appointment.patient_id || '').includes(query);
  });
  const nextAppointments = [...upcomingAppointments]
    .sort((first, second) => (
      `${first.appointment_date} ${first.appointment_time}`.localeCompare(
        `${second.appointment_date} ${second.appointment_time}`
      )
    ))
    .slice(0, 5);
  const trendPoints = analyticsData?.trends || [];
  const trendBuckets = analyticsPeriod === 'week'
    ? trendPoints.map((point) => ({
      label: new Date(`${point.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }),
      count: point.count,
    }))
    : trendPoints.reduce((buckets, point) => {
      const date = new Date(`${point.date}T00:00:00`);
      const key = analyticsPeriod === 'month'
        ? `Week ${Math.ceil(date.getDate() / 5)}`
        : date.toLocaleDateString(undefined, { month: 'short' });
      const current = buckets.find((bucket) => bucket.label === key);
      if (current) current.count += point.count;
      else buckets.push({ label: key, count: point.count });
      return buckets;
    }, []);
  const maxTrendCount = Math.max(1, ...trendBuckets.map((point) => point.count));

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ bgcolor: '#1A1A1A', minHeight: '100vh', color: goldTheme.text.primary, p: { xs: 2, md: 4 } }}>
        {fallbackNotice && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {fallbackNotice}
          </Alert>
        )}
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

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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

              <GoldButton startIcon={<AddIcon />} onClick={() => navigate('/doctor/appointments')}>
                Manage Appointments
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
                <GlassCard id="today-schedule" sx={{ p: 3, mb: 3, scrollMarginTop: 24 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: goldTheme.primary.main, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon /> Today's Schedule
                  </Typography>

                  <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
                    {filteredTodayAppointments.length > 0 ? filteredTodayAppointments.map((apt, index) => (
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
                        onClick={() => handleViewAppointment(apt.id)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 4, height: 40, bgcolor: apt.color || goldTheme.primary.main, borderRadius: 2 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {apt.patient_name} - {apt.reason || 'Consultation'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: goldTheme.text.secondary }}>
                              {apt.time || apt.appointment_time} • Dr. {apt.doctor_name}
                            </Typography>
                          </Box>
                          <Chip label="View" size="small" sx={{ bgcolor: alpha(apt.color || goldTheme.primary.main, 0.2), color: apt.color || goldTheme.primary.main, border: `1px solid ${apt.color || goldTheme.primary.main}` }} />
                        </Box>
                      </Box>
                    )) : (
                      <Typography sx={{ textAlign: 'center', py: 4, color: goldTheme.text.secondary }}>
                        {todayAppointments.length
                          ? `No ${scheduleFilter.toLowerCase()} appointments today`
                          : 'No appointments scheduled for today'}
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
                                <PatientAvatar>
                                  {getInitials(
                                    patient.first_name || patient.patient_name?.split(' ')[0],
                                    patient.last_name || patient.patient_name?.split(' ').slice(1).join(' ')
                                  )}
                                </PatientAvatar>
                                <Box>
                                  <Typography sx={{ fontWeight: 600 }}>
                                    {patient.patient_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim()}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: goldTheme.text.secondary }}>
                                    {patient.purpose || patient.reason || patient.complaint || 'Consultation'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{patient.time || patient.appointment_time || '--:--'}</TableCell>
                            <TableCell>
                              <Chip
                                label={patient.type || patient.purpose || 'Consultation'}
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
                              <Button
                                size="small"
                                startIcon={<ViewIcon />}
                                onClick={() => navigate(`/doctor/patients-details/${patient.patient_id}`)}
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

                  {upcomingAppointments.length > 0 ? nextAppointments.slice(0, 4).map((apt) => (
                    <Box
                      key={apt.id}
                      sx={{ p: 2, mb: 1, borderRadius: 2, bgcolor: alpha(goldTheme.primary.main, 0.05), border: `1px solid ${alpha(goldTheme.primary.main, 0.1)}`, transition: 'all 0.3s ease', '&:hover': { bgcolor: alpha(goldTheme.primary.main, 0.1), transform: 'translateX(5px)' } }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>{apt.patient_name}</Typography>
                          <Typography variant="caption" sx={{ color: goldTheme.text.secondary }}>
                            {formatDate(apt.appointment_date)} • {apt.appointment_time}
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
                    onClick={() => navigate('/doctor/appointments')}
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
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} lg={7}>
            <GlassCard sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ color: goldTheme.primary.main, fontWeight: 700 }}>
                    <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Practice activity
                  </Typography>
                  <Typography variant="body2" sx={{ color: goldTheme.text.secondary, mt: 0.5 }}>
                    Appointment volume over the selected period
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={analyticsPeriod}
                  onChange={(event, period) => {
                    if (period) {
                      setAnalyticsPeriod(period);
                      fetchAnalytics(period);
                    }
                  }}
                  aria-label="Analytics period"
                  sx={{
                    '& .MuiToggleButton-root': {
                      color: goldTheme.text.secondary,
                      borderColor: alpha(goldTheme.primary.main, 0.3),
                    },
                    '& .Mui-selected': {
                      color: `${goldTheme.primary.main} !important`,
                      bgcolor: `${alpha(goldTheme.primary.main, 0.12)} !important`,
                    },
                  }}
                >
                  <ToggleButton value="week">Week</ToggleButton>
                  <ToggleButton value="month">Month</ToggleButton>
                  <ToggleButton value="year">Year</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {analyticsError && <Alert severity="warning" sx={{ mb: 2 }}>{analyticsError}</Alert>}
              {analyticsLoading ? (
                <CircularProgress size={24} sx={{ color: goldTheme.primary.main, my: 4 }} />
              ) : trendBuckets.length ? (
                <Box
                  role="img"
                  aria-label={`Appointment activity for the selected ${analyticsPeriod}`}
                  sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.5, sm: 1 }, height: 190, pt: 2 }}
                >
                  {trendBuckets.map((point) => (
                    <Tooltip key={point.label} title={`${point.label}: ${point.count} appointments`}>
                      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <Typography variant="caption" sx={{ color: goldTheme.text.secondary, mb: 0.5 }}>
                          {point.count}
                        </Typography>
                        <Box
                          sx={{
                            width: '100%',
                            minHeight: point.count ? 8 : 3,
                            height: `${Math.max(3, (point.count / maxTrendCount) * 70)}%`,
                            borderRadius: '6px 6px 2px 2px',
                            background: `linear-gradient(180deg, ${goldTheme.primary.light}, ${goldTheme.primary.dark})`,
                            transition: 'height 300ms ease',
                          }}
                        />
                        <Typography variant="caption" sx={{ color: goldTheme.text.secondary, mt: 0.75, whiteSpace: 'nowrap' }}>
                          {point.label}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>No appointment activity recorded in this period.</Alert>
              )}
              <Divider sx={{ my: 2, borderColor: alpha(goldTheme.primary.main, 0.15) }} />
              <Typography variant="body2" sx={{ color: goldTheme.text.secondary }}>
                {analyticsSummary.total_appointments || 0} appointments · {analyticsSummary.patients || 0} patients · {analyticsSummary.completion_rate || 0}% completed
              </Typography>
            </GlassCard>
          </Grid>

          <Grid item xs={12} lg={5}>
            <GlassCard sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" sx={{ color: goldTheme.primary.main, fontWeight: 700, mb: 0.5 }}>
                <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Appointment status
              </Typography>
              <Typography variant="body2" sx={{ color: goldTheme.text.secondary, mb: 2 }}>
                Counts use the selected period; choose a status to filter today&apos;s schedule
              </Typography>
              <Button
                fullWidth
                variant={scheduleFilter === 'All' ? 'contained' : 'outlined'}
                onClick={() => setScheduleFilter('All')}
                sx={{ mb: 1, justifyContent: 'space-between', textTransform: 'none' }}
              >
                All statuses <Chip size="small" label={todayAppointments.length} />
              </Button>
              {statusBreakdown.length ? statusBreakdown.map((item) => (
                <Button
                  key={item.status}
                  fullWidth
                  variant={scheduleFilter.toLowerCase() === item.status.toLowerCase() ? 'contained' : 'outlined'}
                  onClick={() => {
                    setScheduleFilter(item.status);
                    document.getElementById('today-schedule')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  sx={{ mb: 1, justifyContent: 'space-between', textTransform: 'capitalize' }}
                >
                  {item.status} <Chip size="small" label={item.count} />
                </Button>
              )) : (
                <Alert severity="info">No appointment statuses to summarize yet.</Alert>
              )}
            </GlassCard>
          </Grid>

          <Grid item xs={12} lg={6}>
            <GlassCard sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ color: goldTheme.primary.main, fontWeight: 700 }}>
                    <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Patient launchpad
                  </Typography>
                  <Typography variant="body2" sx={{ color: goldTheme.text.secondary }}>
                    Find and open a patient from your recent appointments
                  </Typography>
                </Box>
                <Button onClick={() => navigate('/doctor/patients-details')} endIcon={<ArrowForwardIcon />}>
                  All patients
                </Button>
              </Box>
              <TextField
                fullWidth
                size="small"
                value={patientSearch}
                onChange={(event) => setPatientSearch(event.target.value)}
                placeholder="Search recent patients by name or ID"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'grid', gap: 1 }}>
                {filteredPatients.length ? filteredPatients.slice(0, 5).map((appointment) => (
                  <Button
                    key={appointment.id}
                    onClick={() => navigate(`/doctor/patients-details/${appointment.patient_id}`)}
                    sx={{
                      justifyContent: 'space-between',
                      color: goldTheme.text.primary,
                      bgcolor: alpha(goldTheme.primary.main, 0.06),
                      textTransform: 'none',
                      '&:hover': { bgcolor: alpha(goldTheme.primary.main, 0.13) },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PatientAvatar sx={{ width: 36, height: 36 }}>
                        {getInitials(appointment.patient_name?.split(' ')[0], appointment.patient_name?.split(' ').slice(1).join(' '))}
                      </PatientAvatar>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography>{appointment.patient_name || `Patient #${appointment.patient_id}`}</Typography>
                        <Typography variant="caption" sx={{ color: goldTheme.text.secondary }}>
                          {appointment.purpose || 'Appointment'}
                        </Typography>
                      </Box>
                    </Box>
                    <ArrowForwardIcon fontSize="small" />
                  </Button>
                )) : (
                  <Alert severity="info">
                    {patientSearch ? 'No recent patient matches that search.' : 'Recent patient activity will appear here.'}
                  </Alert>
                )}
              </Box>
            </GlassCard>
          </Grid>

          <Grid item xs={12} lg={6}>
            <GlassCard sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" sx={{ color: goldTheme.primary.main, fontWeight: 700, mb: 0.5 }}>
                <HospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Clinical activity
              </Typography>
              <Typography variant="body2" sx={{ color: goldTheme.text.secondary, mb: 2 }}>
                Open your prescription and laboratory workflows
              </Typography>
              {clinicalWorklistError && (
                <Alert severity="warning" sx={{ mb: 2 }}>{clinicalWorklistError}</Alert>
              )}
              <Grid container spacing={2}>
                {[
                  {
                    label: 'Prescriptions',
                    value: clinicalWorklist.prescriptions.length,
                    icon: <PharmacyIcon />,
                    path: '/doctor/prescriptions',
                  },
                  {
                    label: 'Lab requests',
                    value: clinicalWorklist.labRequests.length,
                    icon: <LabIcon />,
                    path: '/doctor/lab/new',
                  },
                ].map((item) => (
                  <Grid item xs={12} sm={6} key={item.label}>
                    <Button
                      fullWidth
                      onClick={() => navigate(item.path)}
                      sx={{
                        minHeight: 132,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        color: goldTheme.text.primary,
                        bgcolor: alpha(goldTheme.primary.main, 0.07),
                        border: `1px solid ${alpha(goldTheme.primary.main, 0.18)}`,
                        '&:hover': { bgcolor: alpha(goldTheme.primary.main, 0.14) },
                      }}
                    >
                      {item.icon}
                      <Typography variant="h4" fontWeight={700}>{item.value}</Typography>
                      <Typography>{item.label}</Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: goldTheme.text.secondary, mb: 1 }}>
                  Appointment completion
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, analyticsSummary.completion_rate || 0))}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha('#fff', 0.1),
                    '& .MuiLinearProgress-bar': { bgcolor: goldTheme.primary.main },
                  }}
                />
              </Box>
            </GlassCard>
          </Grid>

          <Grid item xs={12}>
            <GlassCard sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ color: goldTheme.primary.main, fontWeight: 700 }}>
                    <FollowUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Follow-up planner
                  </Typography>
                  <Typography variant="body2" sx={{ color: goldTheme.text.secondary }}>
                    Upcoming scheduled visits, ordered by date and time
                  </Typography>
                </Box>
                <Button onClick={() => navigate('/doctor/appointments')} endIcon={<ArrowForwardIcon />}>
                  Open appointment list
                </Button>
              </Box>
              {nextAppointments.length ? (
                <Grid container spacing={2}>
                  {nextAppointments.map((appointment) => (
                    <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          bgcolor: alpha(goldTheme.primary.main, 0.04),
                          color: goldTheme.text.primary,
                          borderColor: alpha(goldTheme.primary.main, 0.2),
                        }}
                      >
                        <CardContent>
                          <Typography fontWeight={700}>
                            {appointment.patient_name || `Patient #${appointment.patient_id}`}
                          </Typography>
                          <Typography variant="body2" sx={{ color: goldTheme.text.secondary, my: 1 }}>
                            {formatDate(appointment.appointment_date)} · {appointment.appointment_time}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <StatusChip
                              label={appointment.status}
                              status={appointment.status?.toLowerCase()}
                              size="small"
                            />
                            <Button
                              size="small"
                              onClick={() => navigate(`/doctor/patients-details/${appointment.patient_id}`)}
                            >
                              Patient details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">There are no upcoming visits to plan for.</Alert>
              )}
            </GlassCard>
          </Grid>
        </Grid>

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