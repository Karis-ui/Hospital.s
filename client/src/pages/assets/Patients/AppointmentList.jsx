import React, { useState, useEffect } from 'react';
import {useConfirm} from '../../../theme/useConfirm';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Pagination,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';
import PatientService from '../../../services/users/patient';
import { formatDate, formatTime } from '../../../formatters';
import { da } from 'date-fns/locale';

const AppointmentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppoiynmebt] = useState([]);
  const [error, setError] = useState('');
  const [searchTerms, setSerachTerm] = useState('');
  const [statusFilter, setstatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const itemPerPage = 10;
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [anchor, setAnchor] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [tabValue]);
  useEffect(() => {
    applyFilters();
  }, [appointments, searchTerms, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      let status = null;
      if (tabValue === 0) status = 'upcoming';
      else if (tabValue === 1) status = 'confirmed';
      else if (tabValue === 2) status = 'cancelled';
      else if (tabValue === 3) status = 'completed';

      const response = await PatientService.getAllAppointments({ status });
      setAppointments(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch appointments: ', err);
      setError('Failed to load appointments.');
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = [...appointments];
    if (searchTerms) {
      filtered = filtered.filter(apt =>
        apt.doctor_name?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        apt.doctor_speciality?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        apt.purpose?.toLowerCase().includes(searchTerms.toLowerCase())
      );
    }
    if (statusFilter != 'all') {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(apt =>
        new Date(apt.appointment_date).toDateString() === filterDate
      );
    }
    setFilteredAppoiynmebt(filtered);
    setTotalPage(Math.ceil(filtered.length / itemPerPage));
    setPage(1);
  };

  const handleCancelAppointment = async (appointmentId) => {
    const confirmed = confirm({
      title: 'Cancel Appointment',
      content: 'Are you sure you want to cancel this appointment?',
      type: 'error',
      confirmText: 'Cancel',
      confirmColor: 'error',
    });
    if (confirmed) {
      try {
        await PatientService.cancelAppointment(appointmentId);
        toast.success('Appointment cancelled successfully!');
        fetchAppointments();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel appointment. Try again.');
      }
    }
  };

  const MenuOpen = (event, appointments) => {
    setAnchor(event.currentTarget);
    setSelectedAppointment(appointments);
  };

  const MenuClose = () => {
    setAnchor(null);
    setSelectedAppointment(null);
  };

  const Reschedule = () => {
    if (selectedAppointment) {
      navigate(`/appointments/${selectedAppointment.id}/reschedule/`);
    }
    MenuClose();
  };

  const handleTabChange = () => {
    searchTerms('');
    setstatusFilter('all');
    setDateFilter(null);
  };

  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * itemPerPage, page * itemPerPage
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending':
      case 'requested': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          My Appointments
        </Typography>
        <Button
          variant="contained"
          startIcon={<CalendarIcon />}
          onClick={() => navigate('/patient/appointments/book')}
        >
          Book New Appointment
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Upcoming" />
        <Tab label="Completed" />
        <Tab label="Cancelled" />
        <Tab label="All" />
      </Tabs>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by doctor, specialization, reason..."
              value={searchTerms}
              onChange={(e) => setSerachTerm(e.target.value)}
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setstatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter by Date"
                value={dateFilter}
                onChange={setDateFilter}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCl}
              startIcon={<RefreshIcon />}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {filteredAppointments.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Speciality</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAppointments.map((apt) => (
                <TableRow key={apt.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatDate(apt.appointment_date)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {apt.time || '--:--'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Dr. {apt.doctor_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{apt.doctor_speciality || 'General'}</TableCell>
                  <TableCell>{apt.purpose || 'Consultation'}</TableCell>
                  <TableCell>
                    <Chip
                      label={apt.status}
                      size="small"
                      color={getStatusColor(apt.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/patient/appointments/${apt.id}`)}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    {apt.status?.toLowerCase() !== 'cancelled' &&
                      apt.status?.toLowerCase() !== 'completed' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}
                    <IconButton
                      size="small"
                      onClick={(e) => MenuOpen(e, apt)}
                    >
                      <FilterIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            No appointments found
          </Typography>
          <Button
            variant="contained"
            startIcon={<CalendarIcon />}
            onClick={() => navigate('/book/appointment/')}
            sx={{ mt: 2 }}
          >
            Book Your First Appointment
          </Button>
        </Paper>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPage}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
        {selectedAppointment?.status?.toLowerCase() !== 'cancelled' &&
          selectedAppointment?.status?.toLowerCase() !== 'completed' && (
            <MenuItem onClick={handleReschedule}>Reschedule</MenuItem>
          )}
      </Menu>
    </Box>
  );
};

export default AppointmentList;