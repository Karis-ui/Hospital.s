import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Tooltip,
  Zoom,
  Badge,
  Avatar,
  Rating,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
} from '@mui/material';
import { styled, alpha, StyledEngineProvider } from '@mui/material/styles';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  VideoCall as VideoCallIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Medication as MedicationIcon,
  Science as LabIcon,
  Description as DescriptionIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, subDays, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';
import { doctorSevice } from '../../../services/users/doctor';
import { formatDate, getInitials } from '../../../formatters';

const AppointmentCard = styled(Card)(({ theme, status }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateX(5px)',
    boxShadow: theme.shadows[5],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor:
      status === 'confirmed' ? theme.palette.success.main :
        status === 'pending' ? theme.palette.warning.main :
          status === 'in-progress' ? theme.palette.info.main :
            status === 'completed' ? theme.palette.primary.main :
              status === 'cancelled' ? theme.palette.error.main :
                theme.palette.grey[400],
  },
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  '&.confirmed': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
  },
  '&.pending': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
  },
  '&.in-progress': {
    backgroundColor: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main,
  },
  '&.completed': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  },
  '&.cancelled': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
  },
}));

const SummaryCard = styled(Card)(({ theme, color }) => ({
  padding: theme.spacing(2),
  height: '100%',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
  borderLeft: `5px solid ${color}`,
}));

export const DoctorAppointmentList = () => {
  const id = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0, today: 0, pending: 0, completed: 0, cancelled: 0, inProgress: 0,
  });
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('list');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),
    end: addDays(new Date(), 30)
  });
  const [sortBy, setSortBy] = useState('time_asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [rescheduleData, setRescheduleData] = useState({ new_date: null, new_time: '', reason: '', });
  const [anchorE1, setAnchorE1] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionDialog, setActionDialog] = useState(false);
  const [actionreason, setActionReason] = useState('');
  const [startNotes, setStartNotes] = useState('');
  const [paginatedAppointments, setPaginatedAppointments] = useState(1);

  useEffect(() => {
    fetchAppointments();
  }, []);
  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [appointments, tabValue, searchTerm, statusFilter, dateRange, sortBy]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await doctorSevice.getAllAppointments();
      setAppointments(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch appointments.');
      setError('Failed to load Appointments');
    } finally {
      setLoading(false);
    }
  };

  const startAppointment = async () => {
    try {
      await doctorSevice.updateAppointment(selectedAppointment.id, {
        notes: startNotes,
        started_at: new Date().toISOString(),
        status: 'in-progress'
      });
      toast.success("Appointment started.");
      setActionType('Set off');
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to start the same.');
    }
  };

  const handleReschedule = async () => {
    setActionType("Reschedule");
    try {
      await doctorSevice.rescheduleAppointments(selectedAppointment.id, {
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

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await doctorSevice.updateAppointment(appointmentId, {
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        });
        toast.success('Appointment cancelled');
        fetchAppointments();
      } catch (error) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];
    if (tabValue === 0) { }
    else if (tabValue === 1) {
      filtered = filtered.filter(apt => isToday(new Date(apt.date)));
    }
    else if (tabValue === 2) {
      filtered = filtered.filter(apt => new Date() && ['Completed', 'Cancelled'].includes(apt.status));
    }
    else if (tabValue === 4) {
      filtered = filtered.filter(apt => apt.status === 'In-Progress');
    }

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter
      );
    }
    filtered = filtered.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= dateRange.start && aptDate <= dateRange.end;
    });
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);

      switch (sortBy) {
        case 'time_asc':
          return dateA - dateB;
        case 'time_desc':
          return dateB - dateA;
        case 'patient_asc':
          return (a.patientName || '').localCompare(b.patientName || '');
        case 'patient_desc':
          return (b.patientName || '').localCompare(a.patientName || '');
        default:
          return dateA - dateB;
      }
    });
    setFilteredAppointments(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1);
  };

  const calculateStats = () => {
    const today = filteredAppointments.filter(apt => isToday(new Date(apt.date))).length;
    const pending = filteredAppointments.filter(apt => apt.status === 'pending').length;
    const completed = filteredAppointments.filter(apt => apt.status === 'completed').length;
    const cancelled = filteredAppointments.filter(apt => apt.status === 'cancelled').length;
    const inProgress = filteredAppointments.filter(apt => apt.status === 'in-progress').length;

    setStats({
      total: filteredAppointments.length, today, pending, completed, cancelled, inProgress,
    });
  };

  const handleViewDetails = async (appointmentId) => {
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

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await doctorSevice.updateAppointment(appointmentId, {
        status: newStatus, reason: actionreason,
      });
      toast.success(`Appointment updated to ${newStatus}`);
      setActionDialog(false);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update appointment.Try again!');
    }
  };

  const handleComplete = async (appointment) => {
    setSelectedAppointment(appointment);
    setActionType('complete');
    setActionDialog(true);
  };

  const getTimeStatus = (date, time) => {
    const appointmentTime = new Date(`${date}T${time || '00:00'}`);
    const now = new Date();
    const diffMinutes = (appointmentTime - now) / (1000 * 60);

    if (diffMinutes < 0) return 'past';
    if (diffMinutes < 15) return 'urgent';
    if (diffMinutes < 60) return 'soon';
    return 'Normal';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Appointments
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and track all your patient appointments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchAppointments}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard color="#2196f3">
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Total
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                {stats.total}
              </Typography>
            </CardContent>
          </SummaryCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard color="#4caf50">
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Today
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {stats.today}
              </Typography>
            </CardContent>
          </SummaryCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard color="#ff9800">
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Pending
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </SummaryCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard color="#2196f3">
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                In Progress
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                {stats.inProgress}
              </Typography>
            </CardContent>
          </SummaryCard>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard color="#4caf50">
            <CardContent>
              <Typography variant="body2" color="textSecondary">
                Completed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {stats.completed}
              </Typography>
            </CardContent>
          </SummaryCard>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <StyledEngineProvider label="All" />
          <StyledEngineProvider label="Today" />
          <StyledEngineProvider label="Upcoming" />
          <StyledEngineProvider label="Past" />
          <StyledEngineProvider label="In Progress" />
        </Tabs>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by patient name, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From Date"
                value={dateRange.start}
                onChange={(date) => setDateRange({ ...dateRange, start: date })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="To Date"
                value={dateRange.end}
                onChange={(date) => setDateRange({ ...dateRange, end: date })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="time_asc">Time (Earliest First)</MenuItem>
              <MenuItem value="time_desc">Time (Latest First)</MenuItem>
              <MenuItem value="patient_asc">Patient (A-Z)</MenuItem>
              <MenuItem value="patient_desc">Patient (Z-A)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {filteredAppointments.length > 0 ? (
        <Box>
          {paginatedAppointments.map((apt) => {
            const timeStatus = getTimeStatus(apt.date, apt.time);
            return (
              <AppointmentCard
                key={apt.id}
                status={apt.status}
                onClick={() => handleViewDetails(apt.id)}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={1}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {apt.time}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {apt.duration} min
                        </Typography>
                        {timeStatus === 'urgent' && (
                          <Chip
                            label="Now"
                            size="small"
                            color="error"
                            sx={{ mt: 1 }}
                          />
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 50,
                            height: 50,
                            bgcolor:
                              apt.status === 'in-progress' ? 'info.main' :
                                apt.status === 'confirmed' ? 'success.main' :
                                  'primary.main',
                          }}
                        >
                          {getInitials(apt.patientName)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {apt.patientName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {apt.age} yrs • {apt.gender} • ID: {apt.patientId}
                          </Typography>
                          {apt.previousAppointments > 0 && (
                            <Typography variant="caption" color="primary">
                              Returning patient ({apt.previousAppointments} visits)
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {apt.reason}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Type: {apt.type}
                        </Typography>
                        {apt.notes && (
                          <Typography variant="caption" color="textSecondary">
                            Note: {apt.notes}
                          </Typography>
                        )}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <StatusBadge
                        label={apt.status}
                        className={apt.status}
                        size="small"
                      />
                      {apt.status === 'confirmed' && isToday(new Date(apt.date)) && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<StartIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            startAppointment(apt);
                          }}
                          sx={{ mt: 1 }}
                        >
                          Start
                        </Button>
                      )}
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(apt.id);
                            }}
                          >
                            <AssignmentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {apt.status === 'confirmed' && (
                          <>
                            <Tooltip title="Start Appointment">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startAppointment(apt);
                                }}
                              >
                                <StartIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reschedule">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReschedule(apt.id);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancel">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancel(apt);
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {apt.status === 'in-progress' && (
                          <Tooltip title="Complete">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComplete(apt);
                              }}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnchorE1(e.currentTarget);
                            setSelectedAppointment(apt);
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </AppointmentCard>
            );
          })}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CalendarIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Appointments Found
          </Typography>
          <Typography color="textSecondary">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'You have no appointments scheduled'}
          </Typography>
        </Paper>
      )}

      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'cancel' ? 'Cancel Appointment' : 'Complete Appointment'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            {actionType === 'cancel'
              ? `Are you sure you want to cancel the appointment with ${selectedAppointment?.patientName}?`
              : `Mark appointment with ${selectedAppointment?.patientName} as completed?`}
          </Typography>
          <TextField
            fullWidth
            label="Reason / Notes"
            multiline
            rows={3}
            value={actionreason}
            onChange={(e) => setActionReason(e.target.value)}
            placeholder="Add any notes or reason..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Close</Button>
          <Button
            variant="contained"
            color={actionType === 'cancel' ? 'error' : 'success'}
            onClick={() => handleUpdateStatus(
              selectedAppointment?.id,
              actionType === 'cancel' ? 'cancelled' : 'completed'
            )}
          >
            {actionType === 'cancel' ? 'Cancel Appointment' : 'Complete Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorE1}
        open={Boolean(anchorE1)}
        onClose={() => setAnchorE1(null)}
      >
        <MenuItem onClick={() => {
          handleViewDetails(selectedAppointment?.id);
          setAnchorE1(null);
        }}>
          <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {selectedAppointment?.status === 'confirmed' && (
          <>
            <MenuItem onClick={() => {
              startAppointment(selectedAppointment);
              setAnchorE1(null);
            }}>
              <ListItemIcon><StartIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Start Appointment</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              handleReschedule(selectedAppointment?.id);
              setAnchorE1(null);
            }}>
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Reschedule</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              handleCancel(selectedAppointment);
              setAnchorE1(null);
            }}>
              <ListItemIcon><CancelIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Cancel</ListItemText>
            </MenuItem>
          </>
        )}

        {selectedAppointment?.status === 'in-progress' && (
          <MenuItem onClick={() => {
            handleComplete(selectedAppointment);
            setAnchorE1(null);
          }}>
            <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Complete</ListItemText>
          </MenuItem>
        )}

        <Divider />
        <MenuItem onClick={() => {
          toast.info('Contacting patient...');
          setAnchorE1(null);
        }}>
          <ListItemIcon><PhoneIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Contact Patient</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};