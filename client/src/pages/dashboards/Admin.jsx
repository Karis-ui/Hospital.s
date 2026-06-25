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
  LinearProgress,
  Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as DoctorIcon,
  PersonOutline as StaffIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
  Medication as PharmacyIcon,
  Science as LabIcon,
  Emergency as EmergencyIcon,
  Receipt as BillingIcon,
  CheckCircle as ApproveIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Storage as BackupIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  NetworkCheck as NetworkIcon,
  Storage as StorageIcon,
  People as UsersIcon,
  Timer as TimerIcon,
  CloudDone as BackupSuccessIcon,
  CloudOff as BackupFailIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Diamond as DiamondIcon,
  WorkspacePremium as PremiumIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext';
import { adminService } from '../../services/users/admin';
import { useConfirm } from '../../theme/useConfirm';
import { coreService } from '../../services/users/core';
import { formatDate, formatCurrency, formatNumber } from '../../formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  Filler
);
const platinumTheme = {
  primary: { main: '#1a2639', light: '#2c3e50', dark: '#0f1a2f', contrast: '#ffffff' },
  secondary: { main: '#c9b037', light: '#e4d96f', dark: '#aa8c2f', contrast: '#1a2639' },
  accent: { blue: '#3498db', green: '#27ae60', orange: '#f39c12', red: '#e74c3c', purple: '#9b59b6', teal: '#00b894' },
  background: { default: '#f0f2f5', paper: '#ffffff', elevated: '#f8fafc', dark: '#1e293b' },
  text: { primary: '#1e293b', secondary: '#64748b', disabled: '#94a3b8', light: '#ffffff' },
  status: { success: '#27ae60', warning: '#f39c12', error: '#e74c3c', info: '#3498db', online: '#27ae60', offline: '#94a3b8', critical: '#e74c3c' },
};

const Sidebar = styled(Box)(({ theme }) => ({
  width: 280,
  background: `linear-gradient(180deg, ${platinumTheme.primary.main} 0%, ${platinumTheme.primary.dark} 100%)`,
  color: platinumTheme.text.light,
  position: 'fixed',
  height: '100vh',
  overflowY: 'auto',
  boxShadow: `5px 0 25px ${alpha(platinumTheme.primary.main, 0.3)}`,
  zIndex: 1200,
  transition: 'all 0.3s ease',
  '&::-webkit-scrollbar': { width: '8px' },
  '&::-webkit-scrollbar-track': { background: alpha(platinumTheme.text.light, 0.1) },
  '&::-webkit-scrollbar-thumb': { background: platinumTheme.secondary.main, borderRadius: '4px' },
}));

const AdminAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: '0 auto 15px',
  background: `linear-gradient(135deg, ${platinumTheme.secondary.main}, ${platinumTheme.accent.blue})`,
  border: `4px solid ${alpha(platinumTheme.text.light, 0.3)}`,
  boxShadow: `0 10px 25px ${alpha(platinumTheme.secondary.main, 0.3)}`,
  fontSize: '2rem',
  fontWeight: 700,
  color: platinumTheme.primary.main,
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'scale(1.05)', boxShadow: `0 15px 35px ${alpha(platinumTheme.secondary.main, 0.4)}` },
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  background: platinumTheme.background.paper,
  borderRadius: 16,
  border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
  borderLeft: `5px solid ${color || platinumTheme.accent.blue}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 20px 40px ${alpha(platinumTheme.primary.main, 0.15)}` },
}));

const PlatinumButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${platinumTheme.primary.main}, ${platinumTheme.primary.light})`,
  color: platinumTheme.text.light,
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: 50,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: `0 5px 15px ${alpha(platinumTheme.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 25px ${alpha(platinumTheme.primary.main, 0.4)}`, background: `linear-gradient(45deg, ${platinumTheme.primary.light}, ${platinumTheme.primary.main})` },
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(platinumTheme.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
  boxShadow: `0 10px 30px ${alpha(platinumTheme.primary.main, 0.1)}`,
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    online: { bg: alpha(platinumTheme.status.online, 0.1), color: platinumTheme.status.online },
    warning: { bg: alpha(platinumTheme.status.warning, 0.1), color: platinumTheme.status.warning },
    critical: { bg: alpha(platinumTheme.status.critical, 0.1), color: platinumTheme.status.critical },
    success: { bg: alpha(platinumTheme.status.success, 0.1), color: platinumTheme.status.success },
    info: { bg: alpha(platinumTheme.status.info, 0.1), color: platinumTheme.status.info },
  };
  const color = colors[status] || colors.info;
  return {
    background: color.bg,
    color: color.color,
    border: `1px solid ${color.color}`,
    fontWeight: 600,
    '& .MuiChip-icon': { color: color.color },
  };
});

const ActivityIcon = styled(Box)(({ theme, type }) => {
  const colors = {
    patient: { bg: alpha(platinumTheme.accent.green, 0.1), color: platinumTheme.accent.green },
    doctor: { bg: alpha(platinumTheme.accent.teal, 0.1), color: platinumTheme.accent.teal },
    appointment: { bg: alpha(platinumTheme.accent.orange, 0.1), color: platinumTheme.accent.orange },
    system: { bg: alpha(platinumTheme.accent.blue, 0.1), color: platinumTheme.accent.blue },
  };
  const color = colors[type] || colors.system;
  return {
    width: 45,
    height: 45,
    borderRadius: 10,
    background: color.bg,
    color: color.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
  };
});

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [schedules, setSchedules] = useState(null);
  const [systemStatus, setSystemStatus] = useState([]);

  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [messageAnchor, setMessageAnchor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const [serverTime, setServerTime] = useState(new Date());
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAllData();

    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const liveInterval = setInterval(() => {
      fetchLiveData();
    }, 30000);

    return () => clearInterval(liveInterval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchAnnouncements(),
        fetchPendingApprovals(),
        fetchDoctors(),
        fetchPatients(),
        fetchStaff(),
        fetchLiveData(),
        fetchChartData(),
        fetchHeatmapData(),
        fetchSchedules(),
      ]);
      setError('');
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await adminService.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await adminService.announcements();
      setAnnouncements(response.data);
    } catch (err) {
      setAnnouncements([
        { id: 1, message: 'System maintenance scheduled for tonight', time: '1 hour ago', type: 'info' },
        { id: 2, message: '3 new staff applications pending', time: '2 hours ago', type: 'warning' },
        { id: 3, message: 'Database backup completed', time: '3 hours ago', type: 'success' },
        { id: 4, message: '2 patient feedback received', time: '4 hours ago', type: 'info' },
        { id: 5, message: 'Appointment cancellation rate increased', time: '5 hours ago', type: 'error' },
      ]);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await adminService.getAllDoctors();
      const pending = response.data.filter(d => !d.is_approved).map(d => ({
        id: d.id,
        initials: `DR`,
        name: `Dr. ${d.first_name} ${d.last_name}`,
        role: d.specialization || 'Doctor',
        time: `Applied ${new Date(d.created_at).toLocaleDateString()}`,
        type: 'doctor'
      }));
      setPendingApprovals(pending.slice(0, 4));
    } catch (err) {
      setPendingApprovals([
        { id: 1, initials: 'DR', name: 'Dr. Robert Chen', role: 'Cardiology Specialist', time: 'Applied 2 days ago', type: 'doctor' },
        { id: 2, initials: 'NS', name: 'Nurse Sarah Wilson', role: 'Emergency Department', time: 'Applied 1 day ago', type: 'nurse' },
        { id: 3, initials: 'OP', name: 'Michael Brown', role: 'System Operator', time: 'Applied 3 days ago', type: 'operator' },
        { id: 4, initials: 'DR', name: 'Dr. Lisa Parker', role: 'Pediatrician', time: 'Applied 5 hours ago', type: 'doctor' },
      ]);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await adminService.getAllDoctors();
      setDoctors(response.data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await adminService.getAllPatients();
      setPatients(response.data);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await adminService.getAllBillStaff();
      setStaff(response.data);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    }
  };

  const fetchLiveData = async () => {
    try {
      const response = await adminService.liveData();
      setLiveData(response.data);
    } catch (err) {
      console.error('Failed to fetch live data:', err);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await adminService.chartData();
      setChartData(response.data);
    } catch (err) {
      console.error('Failed to fetch chart data:', err);
    }
  };

  const fetchHeatmapData = async () => {
    try {
      const response = await adminService.heatmap();
      setHeatmapData(response.data);
    } catch (err) {
      console.error('Failed to fetch heatmap data:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await adminService.schedules();
      setSchedules(response.data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    }
  };

  const handleApprove = async (userId, userName) => {
    const confirmed = await confirm({
      title: `Approve user ${userName} of user ID ${userId}`,
      message: 'Are you sure you want to approve the user.',
      type: 'success',
      confirmText: 'Approve',
    });
    if (confirmed) {
      try {
        setProcessingId(userId);
        await adminService.setApproval(userId);
        toast.success(`${userName} has been approved.`);
        fetchPendingApprovals();
        fetchDoctors();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to approve user');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleReject = async (userId, userName) => {
    const confirmed = await confirm({
      title: `Reject user ${userName} of user ID ${userId}`,
      message: 'Are you sure you want to reject the user.',
      type: 'reject',
      confirmText: 'Reject',
    });
    if (confirmed) {
      try {
        setProcessingId(userId);
        await adminService.deactivateUser(userId);
        toast.success(`${userName} has been rejected.`);
        fetchPendingApprovals();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to reject user');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleDeactivate = async (userId, userName) => {
    const confirmed = await confirm({
      title: `Deactivate user ${userName} of user ID ${userId}`,
      message: 'Are you sure you want to deactivate the user.',
      type: 'deactivate',
      confirmText: 'Deactivate',
    });
    if (confirmed) {
      try {
        setProcessingId(userId);
        await adminService.deactivateUser(userId);
        toast.success(`${userName} has been deactivated.`);
        fetchDoctors();
        fetchPatients();
        fetchStaff();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to deactivate user');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleDelete = async (userId, userName) => {
    const confirmed = await confirm({
      title: `Delete user ${userName} of user ID ${userId}`,
      message: 'Are you sure you want to delete the user.This action cannot be undone!!',
      type: 'delete',
      confirmText: 'Delete',
    });
    if (confirmed) {
      try {
        setProcessingId(userId);
        await adminService.deleteUser(userId);
        toast.success(`${userName} has been deleted.`);
        fetchPatients();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMessageClick = (event) => {
    setMessageAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setNotificationAnchor(null);
    setMessageAnchor(null);
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      try {
        const patientResults = patients.filter(p =>
          p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id?.toString().includes(searchTerm)
        );

        const doctorResults = doctors.filter(d =>
          d.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const staffResults = staff.filter(s =>
          s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.department?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const results = {
          patients: patientResults,
          doctors: doctorResults,
          staff: staffResults,
          total: patientResults.length + doctorResults.length + staffResults.length
        };

        if (results.total > 0) {
          toast.success(`Found ${results.total} results`);
          navigate('/admin/search', { state: { query: searchTerm, results } });
        } else {
          toast.info('No results found');
        }
      } catch (err) {
        toast.error('Search failed');
      } finally {
        setSearchTerm('');
      }
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'users':
        navigate('/admin/users');
        break;
      case 'approvals':
        navigate('/admin/approvals');
        break;
      case 'search':
        navigate('/admin/search');
        break;
      case 'report':
        navigate('/admin/reports/generate');
        break;
      default:
        toast.info(`Creating new: ${action}`);
    }
  };

  const handleChartPeriodChange = (period) => {
    setChartPeriod(period);
    toast.info(`Loading ${period} data...`);
  };

  const getStatusIcon = (icon) => {
    switch (icon) {
      case 'server': return <StorageIcon />;
      case 'network': return <NetworkIcon />;
      case 'storage': return <StorageIcon />;
      case 'security': return <SecurityIcon />;
      case 'users': return <UsersIcon />;
      case 'backup': return <BackupSuccessIcon />;
      default: return <InfoIcon />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'patient': return <PeopleIcon />;
      case 'doctor': return <DoctorIcon />;
      case 'appointment': return <CalendarIcon />;
      case 'system': return <SettingsIcon />;
      default: return <InfoIcon />;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleIcon sx={{ color: platinumTheme.status.success }} />;
      case 'warning': return <WarningIcon sx={{ color: platinumTheme.status.warning }} />;
      case 'error': return <ErrorIcon sx={{ color: platinumTheme.status.error }} />;
      default: return <InfoIcon sx={{ color: platinumTheme.status.info }} />;
    }
  };

  const chartDataConfig = {
    labels: chartData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: chartData?.datasets || [
      {
        label: 'Patients',
        data: [120, 135, 145, 125, 140, 110, 95],
        borderColor: platinumTheme.accent.green,
        backgroundColor: alpha(platinumTheme.accent.green, 0.1),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Appointments',
        data: [85, 90, 95, 105, 100, 80, 70],
        borderColor: platinumTheme.accent.orange,
        backgroundColor: alpha(platinumTheme.accent.orange, 0.1),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Revenue (in $1000)',
        data: [45, 50, 55, 60, 58, 52, 48],
        borderColor: platinumTheme.accent.purple,
        backgroundColor: alpha(platinumTheme.accent.purple, 0.1),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const departmentDataConfig = {
    labels: heatmapData?.departmentLabels || ['Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Dermatology', 'Emergency'],
    datasets: [
      {
        data: heatmapData?.departmentData || [25, 18, 15, 12, 10, 20],
        backgroundColor: [
          platinumTheme.accent.blue,
          platinumTheme.accent.green,
          platinumTheme.accent.orange,
          platinumTheme.accent.purple,
          platinumTheme.accent.teal,
          platinumTheme.accent.red,
        ],
        borderWidth: 2,
        borderColor: platinumTheme.background.paper,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: platinumTheme.text.primary, font: { family: 'Poppins', size: 12 } } },
      tooltip: { mode: 'index', intersect: false, backgroundColor: platinumTheme.background.paper, titleColor: platinumTheme.text.primary, bodyColor: platinumTheme.text.secondary, borderColor: platinumTheme.secondary.main, borderWidth: 1 },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: alpha(platinumTheme.text.secondary, 0.1) }, ticks: { color: platinumTheme.text.secondary, font: { family: 'Roboto' } } },
      x: { grid: { display: false }, ticks: { color: platinumTheme.text.secondary, font: { family: 'Roboto' } } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'right', labels: { color: platinumTheme.text.primary, font: { family: 'Roboto', size: 12 }, padding: 20 } },
    },
  };

  const stats = {
    totalPatients: patients?.length || 1245,
    patientIncrease: liveData?.patientIncrease || 12,
    activeDoctors: doctors?.filter(d => d.is_active).length || 86,
    doctorIncrease: liveData?.doctorIncrease || 3,
    todayAppointments: liveData?.todayAppointments || 156,
    appointmentChange: liveData?.appointmentChange || -8,
    monthlyRevenue: liveData?.monthlyRevenue || 284560,
    revenueIncrease: liveData?.revenueIncrease || 18,
  };

  const recentActivity = dashboardData?.recentActivity || [
    { type: 'patient', icon: 'user-plus', title: 'New Patient Registered', description: 'John Smith registered as a new patient', time: '10 minutes ago' },
    { type: 'doctor', icon: 'stethoscope', title: 'Doctor Appointment Completed', description: 'Dr. Sarah Johnson completed appointment #A-2345', time: '25 minutes ago' },
    { type: 'appointment', icon: 'calendar-plus', title: 'New Appointment Scheduled', description: 'Emergency appointment scheduled in Cardiology', time: '1 hour ago' },
    { type: 'system', icon: 'database', title: 'System Backup Completed', description: 'Daily system backup completed successfully', time: '2 hours ago' },
    { type: 'patient', icon: 'file-medical', title: 'Lab Report Generated', description: 'Blood test report generated for Patient #P-4567', time: '3 hours ago' },
  ];

  const systemStatusData = liveData?.systemStatus || [
    { icon: 'server', name: 'Database Server', status: 'online', details: 'Online' },
    { icon: 'network', name: 'Network Connectivity', status: 'online', details: 'Stable' },
    { icon: 'storage', name: 'Storage Space', status: 'warning', details: '78% Used' },
    { icon: 'security', name: 'Security Status', status: 'online', details: 'Protected' },
    { icon: 'users', name: 'Active Users', status: 'online', details: `${liveData?.activeUsers || 42} users online` },
    { icon: 'backup', name: 'Backup Status', status: liveData?.backupStatus || 'online', details: liveData?.backupDetails || 'Up to date' },
  ];

  if (loading) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh',
        background: `linear-gradient(135deg, ${platinumTheme.primary.main}, ${platinumTheme.primary.dark})`
      }}>
        <CircularProgress sx={{ color: platinumTheme.secondary.main }} size={60} thickness={4} />
        <Typography sx={{ mt: 2, color: platinumTheme.text.light }}>Loading Admin Dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchAllData}>Retry</Button>
        }>{error}</Alert>
      </Box>
    );
  }

  const unreadCount = announcements?.filter(a => !a.read)?.length || 0;
  const messageCount = 3;

  return (
    <Box sx={{ display: 'flex', bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Fade in timeout={1000}>
          <Paper elevation={0} sx={{
            p: 3, mb: 4, display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', borderRadius: 3, border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`
          }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: platinumTheme.primary.main }}>
                Hospital Admin Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: platinumTheme.text.secondary, mt: 1 }}>
                Welcome back, {user?.first_name}! Here's what's happening with your hospital today.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField placeholder="Search patients, doctors, records..." variant="outlined" size="small"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleSearch}
                sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: 50, bgcolor: platinumTheme.background.elevated } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: platinumTheme.text.secondary }} /></InputAdornment> }}
              />

              <Tooltip title="Notifications" TransitionComponent={Zoom}>
                <IconButton onClick={handleNotificationClick} sx={{
                  bgcolor: alpha(platinumTheme.accent.blue, 0.1),
                  '&:hover': { bgcolor: alpha(platinumTheme.accent.blue, 0.2) }
                }}>
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon sx={{ color: platinumTheme.accent.blue }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Messages" TransitionComponent={Zoom}>
                <IconButton onClick={handleMessageClick} sx={{
                  bgcolor: alpha(platinumTheme.accent.green, 0.1),
                  '&:hover': { bgcolor: alpha(platinumTheme.accent.green, 0.2) }
                }}>
                  <Badge badgeContent={messageCount} color="warning">
                    <EmailIcon sx={{ color: platinumTheme.accent.green }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <PlatinumButton startIcon={<AddIcon />} onClick={() => handleQuickAction('patient')}>
                Add New
              </PlatinumButton>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon sx={{ color: platinumTheme.text.secondary, fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: platinumTheme.text.primary, fontWeight: 500 }}>
                  {formatDate(serverTime, 'full')} | {serverTime.toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={1000}>
              <div>
                <StatCard color={platinumTheme.accent.green}>
                  <CardContent>
                    <Typography variant="body2" color="textSecondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Total Patients
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: platinumTheme.primary.main, mb: 1 }}>
                      {formatNumber(stats.totalPatients)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ color: platinumTheme.accent.green, fontSize: 20, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: platinumTheme.accent.green, fontWeight: 600 }}>
                        {stats.patientIncrease}% increase
                      </Typography>
                    </Box>
                    <HospitalIcon sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, color: alpha(platinumTheme.primary.main, 0.1) }} />
                  </CardContent>
                </StatCard>
              </div>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={1200}>
              <div>
                <StatCard color={platinumTheme.accent.teal}>
                  <CardContent>
                    <Typography variant="body2" color="textSecondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Active Doctors
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: platinumTheme.primary.main, mb: 1 }}>
                      {formatNumber(stats.activeDoctors)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ color: platinumTheme.accent.teal, fontSize: 20, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: platinumTheme.accent.teal, fontWeight: 600 }}>
                        {stats.doctorIncrease} new this month
                      </Typography>
                    </Box>
                    <DoctorIcon sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, color: alpha(platinumTheme.primary.main, 0.1) }} />
                  </CardContent>
                </StatCard>
              </div>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={1400}>
              <div>
                <StatCard color={platinumTheme.accent.orange}>
                  <CardContent>
                    <Typography variant="body2" color="textSecondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Today's Appointments
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: platinumTheme.primary.main, mb: 1 }}>
                      {formatNumber(stats.todayAppointments)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingDownIcon sx={{ color: platinumTheme.accent.red, fontSize: 20, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: platinumTheme.accent.red, fontWeight: 600 }}>
                        {Math.abs(stats.appointmentChange)}% decrease
                      </Typography>
                    </Box>
                    <CalendarIcon sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, color: alpha(platinumTheme.primary.main, 0.1) }} />
                  </CardContent>
                </StatCard>
              </div>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Grow in timeout={1600}>
              <div>
                <StatCard color={platinumTheme.accent.purple}>
                  <CardContent>
                    <Typography variant="body2" color="textSecondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Monthly Revenue
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: platinumTheme.primary.main, mb: 1 }}>
                      {formatCurrency(stats.monthlyRevenue)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon sx={{ color: platinumTheme.accent.purple, fontSize: 20, mr: 0.5 }} />
                      <Typography variant="body2" sx={{ color: platinumTheme.accent.purple, fontWeight: 600 }}>
                        {stats.revenueIncrease}% increase
                      </Typography>
                    </Box>
                    <BillingIcon sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, color: alpha(platinumTheme.primary.main, 0.1) }} />
                  </CardContent>
                </StatCard>
              </div>
            </Grow>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Slide direction="right" in timeout={1000}>
              <div>
                <GlassCard sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: platinumTheme.primary.main }}>
                      Hospital Statistics Overview
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {['weekly', 'monthly', 'yearly'].map((period) => (
                        <Button key={period} size="small" variant={chartPeriod === period ? 'contained' : 'outlined'}
                          onClick={() => handleChartPeriodChange(period)}
                          sx={{
                            borderRadius: 50, textTransform: 'capitalize',
                            ...(chartPeriod === period && {
                              bgcolor: platinumTheme.secondary.main, color: platinumTheme.primary.main,
                              '&:hover': { bgcolor: platinumTheme.secondary.dark }
                            })
                          }}>
                          {period}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ height: 300 }}>
                    <Line data={chartDataConfig} options={chartOptions} />
                  </Box>
                </GlassCard>
              </div>
            </Slide>
          </Grid>

          <Grid item xs={12} md={4}>
            <Slide direction="left" in timeout={1000}>
              <div>
                <GlassCard sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: platinumTheme.primary.main, mb: 3 }}>
                    Department Distribution
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Doughnut data={departmentDataConfig} options={doughnutOptions} />
                  </Box>
                </GlassCard>
              </div>
            </Slide>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Slide direction="right" in timeout={1200}>
              <div>
                <GlassCard sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: platinumTheme.primary.main }}>
                      Recent Activity
                    </Typography>
                    <Button endIcon={<FilterIcon />} size="small" sx={{ color: platinumTheme.accent.blue }}>
                      View All
                    </Button>
                  </Box>

                  <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                    {recentActivity.map((activity, index) => (
                      <Box key={index} sx={{
                        display: 'flex', alignItems: 'center', p: 2, mb: 1, borderRadius: 2,
                        bgcolor: alpha(platinumTheme.background.elevated, 0.5), transition: 'all 0.3s ease',
                        '&:hover': { bgcolor: alpha(platinumTheme.accent.blue, 0.05), transform: 'translateX(5px)' }
                      }}>
                        <ActivityIcon type={activity.type}>{getActivityIcon(activity.type)}</ActivityIcon>
                        <Box sx={{ ml: 2, flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{activity.title}</Typography>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary, display: 'block' }}>
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha(platinumTheme.text.secondary, 0.7) }}>
                            {activity.time}
                          </Typography>
                        </Box>
                        <IconButton size="small"><MoreVertIcon fontSize="small" sx={{ color: platinumTheme.text.secondary }} /></IconButton>
                      </Box>
                    ))}
                  </Box>
                </GlassCard>
              </div>
            </Slide>
          </Grid>

          <Grid item xs={12} md={6}>
            <Slide direction="left" in timeout={1200}>
              <div>
                <GlassCard sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: platinumTheme.primary.main }}>
                      Pending Approvals
                    </Typography>
                    <Button endIcon={<FilterIcon />} size="small" sx={{ color: platinumTheme.accent.blue }}>
                      Manage All
                    </Button>
                  </Box>

                  <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                    {pendingApprovals.map((approval) => (
                      <Box key={approval.id} sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        p: 2, mb: 1, borderRadius: 2, bgcolor: alpha(platinumTheme.background.elevated, 0.5),
                        transition: 'all 0.3s ease', '&:hover': { bgcolor: alpha(platinumTheme.accent.blue, 0.05) }
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{
                            width: 45, height: 45, bgcolor: alpha(platinumTheme.accent.blue, 0.2),
                            color: platinumTheme.accent.blue, fontWeight: 600, mr: 2
                          }}>
                            {approval.initials}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{approval.name}</Typography>
                            <Typography variant="caption" sx={{ color: platinumTheme.text.secondary, display: 'block' }}>
                              {approval.role}
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha(platinumTheme.text.secondary, 0.7) }}>
                              {approval.time}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Approve" TransitionComponent={Zoom}>
                            <IconButton size="small" onClick={() => handleApprove(approval.id, approval.name)}
                              disabled={processingId === approval.id}
                              sx={{
                                bgcolor: alpha(platinumTheme.accent.green, 0.1), color: platinumTheme.accent.green,
                                '&:hover': { bgcolor: alpha(platinumTheme.accent.green, 0.2) }
                              }}>
                              {processingId === approval.id ? <CircularProgress size={20} /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject" TransitionComponent={Zoom}>
                            <IconButton size="small" onClick={() => handleReject(approval.id, approval.name)}
                              disabled={processingId === approval.id}
                              sx={{
                                bgcolor: alpha(platinumTheme.accent.red, 0.1), color: platinumTheme.accent.red,
                                '&:hover': { bgcolor: alpha(platinumTheme.accent.red, 0.2) }
                              }}>
                              {processingId === approval.id ? <CircularProgress size={20} /> : <ErrorIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </GlassCard>
              </div>
            </Slide>
          </Grid>
        </Grid>

        <Slide direction="up" in timeout={1400}>
          <div>
            <GlassCard sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: platinumTheme.primary.main }}>
                  System Status & Resources
                </Typography>
                <Button startIcon={<RefreshIcon />} size="small" onClick={fetchLiveData} sx={{ color: platinumTheme.accent.blue }}>
                  Refresh
                </Button>
              </Box>

              <Grid container spacing={2}>
                {systemStatusData.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', p: 2, borderRadius: 2,
                      bgcolor: alpha(platinumTheme.background.elevated, 0.5),
                      borderLeft: `4px solid ${item.status === 'online' ? platinumTheme.status.online :
                        item.status === 'warning' ? platinumTheme.status.warning :
                          item.status === 'critical' ? platinumTheme.status.critical :
                            platinumTheme.status.info
                        }`
                    }}>
                      <Box sx={{ color: platinumTheme.text.secondary, mr: 2 }}>{getStatusIcon(item.icon)}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 10, height: 10, borderRadius: '50%',
                            bgcolor: item.status === 'online' ? platinumTheme.status.online :
                              item.status === 'warning' ? platinumTheme.status.warning :
                                item.status === 'critical' ? platinumTheme.status.critical :
                                  platinumTheme.status.info
                          }} />
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>{item.details}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </GlassCard>
          </div>
        </Slide>

        <Fade in timeout={2000}>
          <Box component="footer" sx={{
            textAlign: 'center', py: 3, color: platinumTheme.text.secondary,
            borderTop: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`
          }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} SmartCare Hospital Management System. All rights reserved. | Admin Portal v3.2
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: platinumTheme.text.disabled }}>
                Last Login: Today, {new Date(user?.last_login).toLocaleTimeString()} | Server Time: {serverTime.toLocaleTimeString()} | Uptime: 99.8%
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Box>

      <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={handleClose} TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            mt: 2, bgcolor: platinumTheme.background.paper, border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
            borderRadius: 2, minWidth: 320, maxHeight: 400
          }
        }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
        </Box>
        {announcements.map((notif) => (
          <MenuItem key={notif.id} onClick={handleClose} sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              {getNotificationIcon(notif.type)}
              <Box>
                <Typography variant="body2">{notif.message}</Typography>
                <Typography variant="caption" sx={{ color: platinumTheme.text.disabled }}>{notif.time}</Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Menu anchorEl={messageAnchor} open={Boolean(messageAnchor)} onClose={handleClose} TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            mt: 2, bgcolor: platinumTheme.background.paper, border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
            borderRadius: 2, minWidth: 320
          }
        }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Messages</Typography>
        </Box>
        <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Dr. Johnson</Typography>
            <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>Need approval for new equipment</Typography>
            <Typography variant="caption" sx={{ color: platinumTheme.text.disabled }}>30 min ago</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Pharmacy</Typography>
            <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>Stock running low on Medication X</Typography>
            <Typography variant="caption" sx={{ color: platinumTheme.text.disabled }}>1 hour ago</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminDashboard;
