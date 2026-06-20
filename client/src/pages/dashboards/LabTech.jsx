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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  Science as LabIcon,
  Timeline as PendingIcon,
  CheckCircle as CompletedIcon,
  Warning as CriticalIcon,
  Scanner as RadiologyIcon,
  TextSnippet as PathologyIcon,
  Bloodtype as HematologyIcon,
  WaterDrop as BiochemistryIcon,
  BiotechSharp as MicrobiologyIcon,
  BloodtypeTwoTone as DNAIcon,
  RadioOutlined as XRayIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Assessment as ReportsIcon,
  Inventory as InventoryIcon,
  People as StaffIcon,
  Build as EquipmentIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  PlayArrow as ProcessIcon,
  Flag as FlagIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  ScienceOutlined as OtherIcon,
  WarningAmber as AlertIcon,
  CheckCircleOutline as CheckIcon,
  RemoveCircleOutline as RemoveIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  FileDownload as DownloadIcon,
  NotificationsActive as NotifyIcon,
  Diamond as DiamondIcon,
  Science as FlaskIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Check as ApproveIcon,
  Cancel as RejectIcon,
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
import { useConfirm } from '../../theme/useConfirm';
import { Line, Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext';
import { labServices } from '../../services/users/labtech';
import { coreService } from '../../services/users/core';
import { formatDate, formatTime } from '../../formatters';

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

const labTheme = {
  primary: { main: '#1a237e', light: '#534bae', dark: '#000051', contrast: '#ffffff' },
  secondary: { main: '#00b0ff', light: '#69e2ff', dark: '#0081cb', contrast: '#ffffff' },
  accent: {
    success: '#00c853', warning: '#ff9100', danger: '#ff1744', info: '#00b8d4',
    hematology: '#ff1744', biochemistry: '#00b0ff', microbiology: '#ff9100',
    pathology: '#00c853', radiology: '#9c27b0',
  },
  status: {
    completed: { bg: 'rgba(0, 200, 83, 0.1)', color: '#00c853', border: '#00c853' },
    pending: { bg: 'rgba(255, 145, 0, 0.1)', color: '#ff9100', border: '#ff9100' },
    critical: { bg: 'rgba(255, 23, 68, 0.1)', color: '#ff1744', border: '#ff1744' },
    processing: { bg: 'rgba(0, 176, 255, 0.1)', color: '#00b0ff', border: '#00b0ff' },
  },
  background: { default: '#f8f9ff', paper: '#ffffff', elevated: '#f0f2f9', dark: '#0d1b36' },
  text: { primary: '#1a237e', secondary: '#5c6bc0', disabled: '#9fa8da', light: '#ffffff' },
};

const LabSidebar = styled(Box)(({ theme }) => ({
  width: 280,
  background: `linear-gradient(180deg, ${labTheme.primary.main} 0%, ${labTheme.primary.dark} 100%)`,
  color: labTheme.text.light,
  position: 'fixed',
  height: '100vh',
  overflowY: 'auto',
  boxShadow: `5px 0 25px ${alpha(labTheme.primary.main, 0.3)}`,
  zIndex: 1200,
  '&::-webkit-scrollbar': { width: '8px' },
  '&::-webkit-scrollbar-track': { background: alpha(labTheme.text.light, 0.1) },
  '&::-webkit-scrollbar-thumb': { background: labTheme.secondary.main, borderRadius: '4px' },
}));

const LabAvatar = styled(Avatar)(({ theme }) => ({
  width: 70,
  height: 70,
  margin: '0 auto 15px',
  background: `linear-gradient(135deg, ${labTheme.secondary.main} 0%, ${labTheme.primary.main} 100%)`,
  border: `4px solid ${alpha(labTheme.text.light, 0.3)}`,
  boxShadow: `0 10px 25px ${alpha(labTheme.secondary.main, 0.3)}`,
  fontSize: '2rem',
  fontWeight: 700,
  color: labTheme.text.light,
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'scale(1.05)', boxShadow: `0 15px 35px ${alpha(labTheme.secondary.main, 0.4)}` },
}));

const LabStatCard = styled(Card)(({ theme, status }) => ({
  background: labTheme.background.paper,
  borderRadius: 12,
  borderLeft: `5px solid ${status === 'primary' ? labTheme.primary.main :
    status === 'success' ? labTheme.accent.success :
      status === 'warning' ? labTheme.accent.warning :
        status === 'danger' ? labTheme.accent.danger :
          status === 'info' ? labTheme.accent.info :
            labTheme.secondary.main
    }`,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 10px 25px ${alpha(labTheme.primary.main, 0.15)}` },
}));

const LabStatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    completed: labTheme.status.completed,
    pending: labTheme.status.pending,
    critical: labTheme.status.critical,
    processing: labTheme.status.processing,
  };
  const color = colors[status] || colors.pending;
  return {
    background: color.bg,
    color: color.color,
    border: `1px solid ${color.border}`,
    fontWeight: 600,
    borderRadius: 20,
    '& .MuiChip-icon': { color: color.color },
  };
});

const TestIcon = styled(Box)(({ theme, type }) => {
  const colors = {
    blood: { bg: alpha(labTheme.accent.hematology, 0.1), color: labTheme.accent.hematology },
    urine: { bg: alpha(labTheme.accent.biochemistry, 0.1), color: labTheme.accent.biochemistry },
    microbiology: { bg: alpha(labTheme.accent.microbiology, 0.1), color: labTheme.accent.microbiology },
    radiology: { bg: alpha(labTheme.accent.radiology, 0.1), color: labTheme.accent.radiology },
    pathology: { bg: alpha(labTheme.accent.pathology, 0.1), color: labTheme.accent.pathology },
  };
  const color = colors[type] || colors.blood;
  return {
    width: 50,
    height: 50,
    borderRadius: 10,
    background: color.bg,
    color: color.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    flexShrink: 0,
    marginRight: 15,
  };
});

const LabNavbar = styled(Paper)(({ theme }) => ({
  background: labTheme.background.paper,
  borderRadius: 12,
  padding: '20px 30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
  boxShadow: `0 4px 12px ${alpha(labTheme.primary.main, 0.08)}`,
  borderLeft: `5px solid ${labTheme.secondary.main}`,
}));

const LabSectionCard = styled(Paper)(({ theme }) => ({
  background: labTheme.background.paper,
  borderRadius: 12,
  padding: 25,
  boxShadow: `0 4px 12px ${alpha(labTheme.primary.main, 0.08)}`,
}));

const EquipmentItem = styled(Box)(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: 15,
  background: labTheme.background.elevated,
  borderRadius: 8,
  borderLeft: `4px solid ${status === 'success' ? labTheme.accent.success :
    status === 'warning' ? labTheme.accent.warning :
      status === 'danger' ? labTheme.accent.danger :
        labTheme.accent.success
    }`,
  transition: 'transform 0.3s ease',
  '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 5px 15px ${alpha(labTheme.primary.main, 0.1)}` },
}));

export const LabDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { confirm, ConfrimDialogComponent } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [testQueue, setTestQueue] = useState([]);
  const [criticalResults, setCriticalResults] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [messageAnchor, setMessageAnchor] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('daily');
  const [processingId, setProcessingId] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    fetchAllData();

    const interval = setInterval(fetchLiveUpdates, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await labServices.getDashboard();
      setDashboardData(response.data);

      setTestQueue(response.data.testQueue || []);
      setCriticalResults(response.data.criticalResults || []);
      setRecentResults(response.data.recentResults || []);
      setEquipment(response.data.equipment || []);

      setError('');
    } catch (err) {
      console.error('Failed to fetch lab data:', err);
      setError(err.response?.data?.message || 'Failed to load laboratory data');
      toast.error('Failed to load laboratory data');

      setTestQueue([
        { id: 1, type: 'blood', patient: 'John Smith', patientId: 'P-1234', test: 'CBC Test', doctor: 'Dr. Sarah Johnson', department: 'Hematology', waitTime: '45 minutes' },
        { id: 2, type: 'urine', patient: 'Maria Garcia', patientId: 'P-5678', test: 'Urine Analysis', doctor: 'Dr. Michael Chen', department: 'Biochemistry', waitTime: '30 minutes' },
      ]);
      setCriticalResults([
        { id: 1, type: 'blood', patient: 'John Smith', age: 58, test: 'High Troponin', severity: 'critical', time: '15 minutes ago' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveUpdates = async () => {
    try {
      const response = await labServices.getDashboard();
      setDashboardData(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      console.log('Live update failed');
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await coreService.getNotifications();
      setNotifications(response.data);
    } catch (err) {
      setNotifications([
        { id: 1, message: '2 critical results need attention', time: '5 min ago', read: false },
        { id: 2, message: 'Equipment maintenance due', time: '15 min ago', read: false },
      ]);
    }
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      try {
        setSearchLoading(true);
        const response = await labServices.searchItems();
        const filtered = response.data.filter(item =>
          item.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.test?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id?.toString().includes(searchTerm)
        );
        setSearchResults(filtered);

        if (filtered.length > 0) {
          toast.success(`Found ${filtered.length} results`);
          navigate('/lab/search', { state: { query: searchTerm, results: filtered } });
        } else {
          toast.info('No results found');
        }
      } catch (err) {
        toast.error('Search failed');
      } finally {
        setSearchLoading(false);
        setSearchTerm('');
      }
    }
  };

  const handleUploadResult = (testId) => {
    setSelectedTest(testId);
    setUploadModalOpen(true);
  };

  const confirmUpload = async () => {
    try {
      setProcessingId(selectedTest);
      await labServices.uploadReport(selectedTest);
      toast.success('Report uploaded successfully');
      setUploadModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveResult = async (resultId) => {
    const confirmed = await confirm({
      title: 'Approve result',
      message: 'Are you sure you want to approve the result.',
      type: 'success',
      confirmText: 'Approve',
    });
    if (confirmed) {
      try {
        setProcessingId(resultId);
        await labServices.approveResult(resultId);
        toast.success('Result approved');
        fetchAllData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Approval failed');
      } finally {
        setProcessingId(null);
      }
    }
  };
  const handleRejectResult = async (resultId) => {
    const confirmed = await confirm({
      title: 'Reject result',
      message: 'Are you sure you want to reject the result.',
      type: 'warning',
      confirmText: 'Reject',
    });
    if (confirmed) {
      try {
        setProcessingId(resultId);
        await labServices.rejectResult(resultId);
        toast.success('Result rejected');
        fetchAllData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Rejection failed');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleSendToDoctor = async (resultId) => {
    try {
      setProcessingId(resultId);
      await labServices.sendToDoctor(resultId);
      toast.success('Result sent to doctor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/lab/results/${id}`);
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

  const handleNewTest = (id) => {
    navigate(`/lab/requests/${id}`);
  };

  const handleProcessTest = (testId) => {
    navigate(`/lab/process/${testId}`);
  };

  const handleNotifyCritical = (resultId) => {
    handleSendToDoctor(resultId);
  };

  const handleChartPeriodChange = (period) => {
    setChartPeriod(period);
    toast.info(`Loading ${period} statistics...`);
  };

  const getTestIcon = (type) => {
    switch (type) {
      case 'blood': return <HematologyIcon />;
      case 'urine': return <BiochemistryIcon />;
      case 'microbiology': return <MicrobiologyIcon />;
      case 'radiology': return <RadiologyIcon />;
      case 'pathology': return <PathologyIcon />;
      default: return <TestIcon />;
    }
  };

  const getEquipmentIcon = (icon) => {
    switch (icon) {
      case 'microscope': return <MicrobiologyIcon />;
      case 'vial': return <BiochemistryIcon />;
      case 'tint': return <HematologyIcon />;
      case 'temperature': return <ThermostatIcon />;
      case 'sync': return <RefreshIcon />;
      case 'xray': return <RadiologyIcon />;
      default: return <LabIcon />;
    }
  };

  const stats = dashboardData?.statistics || {
    totalTests: testQueue.length + recentResults.length || 156,
    pendingTests: testQueue.length || 23,
    completedTests: recentResults.filter(r => r.status === 'completed').length || 128,
    criticalResults: criticalResults.length || 5,
    avgProcessingTime: '2.5 hours',
    completionRate: 82,
  };

  const volumeChartData = {
    labels: dashboardData?.chartLabels || ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM'],
    datasets: dashboardData?.volumeData || [
      {
        label: 'Tests Processed',
        data: [12, 25, 38, 45, 32, 28, 15],
        borderColor: labTheme.secondary.main,
        backgroundColor: alpha(labTheme.secondary.main, 0.1),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Tests Received',
        data: [15, 30, 42, 50, 38, 25, 18],
        borderColor: labTheme.accent.success,
        backgroundColor: alpha(labTheme.accent.success, 0.1),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const categoryChartData = {
    labels: dashboardData?.categoryLabels || ['Hematology', 'Biochemistry', 'Microbiology', 'Pathology', 'Radiology', 'Other'],
    datasets: [
      {
        data: dashboardData?.categoryData || [35, 25, 15, 10, 10, 5],
        backgroundColor: [
          labTheme.accent.hematology,
          labTheme.accent.biochemistry,
          labTheme.accent.microbiology,
          labTheme.accent.pathology,
          labTheme.accent.radiology,
          '#795548',
        ],
        borderWidth: 2,
        borderColor: labTheme.background.paper,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: labTheme.text.primary, font: { family: 'Poppins', size: 12 } } },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: alpha(labTheme.primary.main, 0.05) }, ticks: { font: { family: 'Roboto' } } },
      x: { grid: { color: alpha(labTheme.primary.main, 0.05) }, ticks: { font: { family: 'Roboto' } } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'right', labels: { color: labTheme.text.primary, font: { family: 'Roboto', size: 11 }, padding: 15 } },
    },
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh',
        background: `linear-gradient(135deg, ${labTheme.primary.main}, ${labTheme.primary.dark})`
      }}>
        <CircularProgress sx={{ color: labTheme.secondary.main }} size={60} thickness={4} />
        <Typography sx={{ mt: 2, color: labTheme.text.light }}>Loading Laboratory Dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: labTheme.background.default, minHeight: '100vh' }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchAllData}>Retry</Button>
        }>{error}</Alert>
      </Box>
    );
  }

  const labTech = dashboardData?.technician || user || {
    name: user?.first_name + ' ' + user?.last_name || 'Lab Technician',
    role: 'Lab Technician',
    isSupervisor: user?.is_supervisor || false,
    id: user?.id || 'LT-7890',
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: labTheme.background.default, minHeight: '100vh' }}>
      <LabSidebar>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <LabAvatar>
            {labTech.name?.split(' ').map(n => n[0]).join('') || 'LT'}
          </LabAvatar>

          <Typography variant="h5" sx={{ fontWeight: 700, color: labTheme.text.light, mb: 0.5 }}>
            {labTech.name}
          </Typography>

          <Chip icon={<FlaskIcon />} label={labTech.role}
            sx={{
              background: alpha(labTheme.secondary.main, 0.2), color: labTheme.secondary.main,
              border: `1px solid ${labTheme.secondary.main}`, fontWeight: 600, mb: 2
            }}
          />

          {labTech.isSupervisor && (
            <Chip icon={<DiamondIcon />} label="Lab Supervisor" size="small"
              sx={{
                background: alpha(labTheme.accent.success, 0.2), color: labTheme.accent.success,
                border: `1px solid ${labTheme.accent.success}`
              }}
            />
          )}
        </Box>

        <Divider sx={{ borderColor: alpha(labTheme.text.light, 0.1) }} />

        <List sx={{ px: 2, py: 2 }}>
          <Typography variant="caption" sx={{ px: 2, color: alpha(labTheme.text.light, 0.5), fontWeight: 600 }}>
            DASHBOARD
          </Typography>

          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton selected sx={{
              borderRadius: 2, color: labTheme.text.light,
              bgcolor: alpha(labTheme.secondary.main, 0.15), '&:hover': { bgcolor: alpha(labTheme.secondary.main, 0.25) }
            }}>
              <ListItemIcon sx={{ color: labTheme.secondary.main, minWidth: 40 }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard Overview" />
            </ListItemButton>
          </ListItem>

          <Typography variant="caption" sx={{ px: 2, mt: 2, color: alpha(labTheme.text.light, 0.5), fontWeight: 600 }}>
            TEST MANAGEMENT
          </Typography>

          {[
            { icon: <TestIcon />, text: 'All Tests', badge: stats.totalTests },
            { icon: <PendingIcon />, text: 'Pending Tests', badge: stats.pendingTests },
            { icon: <CompletedIcon />, text: 'Completed Tests', badge: stats.completedTests },
            { icon: <CriticalIcon />, text: 'Critical Results', badge: stats.criticalResults },
          ].map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton sx={{
                borderRadius: 2, color: alpha(labTheme.text.light, 0.85),
                '&:hover': { bgcolor: alpha(labTheme.text.light, 0.1) }
              }}>
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.badge && (
                  <Chip label={item.badge} size="small"
                    sx={{
                      bgcolor: item.text === 'Critical Results' ? labTheme.accent.danger : labTheme.secondary.main,
                      color: labTheme.text.light, fontWeight: 600, fontSize: '0.7rem', height: 20
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}

          <Typography variant="caption" sx={{ px: 2, mt: 2, color: alpha(labTheme.text.light, 0.5), fontWeight: 600 }}>
            LABORATORY SECTIONS
          </Typography>

          {[
            { icon: <HematologyIcon />, text: 'Hematology' },
            { icon: <BiochemistryIcon />, text: 'Biochemistry' },
            { icon: <MicrobiologyIcon />, text: 'Microbiology' },
            { icon: <PathologyIcon />, text: 'Pathology' },
            { icon: <RadiologyIcon />, text: 'Radiology' },
          ].map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton sx={{
                borderRadius: 2, color: alpha(labTheme.text.light, 0.85),
                '&:hover': { bgcolor: alpha(labTheme.text.light, 0.1) }
              }}>
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          <Typography variant="caption" sx={{ px: 2, mt: 2, color: alpha(labTheme.text.light, 0.5), fontWeight: 600 }}>
            MANAGEMENT
          </Typography>

          {[
            { icon: <ReportsIcon />, text: 'Reports & Analytics' },
            { icon: <EquipmentIcon />, text: 'Equipment Management' },
            { icon: <InventoryIcon />, text: 'Inventory & Supplies' },
            { icon: <StaffIcon />, text: 'Lab Staff' },
            { icon: <SettingsIcon />, text: 'Settings' },
          ].map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton sx={{
                borderRadius: 2, color: alpha(labTheme.text.light, 0.85),
                '&:hover': { bgcolor: alpha(labTheme.text.light, 0.1) }
              }}>
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, px: 3 }}>
          <Button fullWidth variant="contained" startIcon={<LogoutIcon />} onClick={handleLogout}
            sx={{
              bgcolor: alpha(labTheme.text.light, 0.1), color: labTheme.text.light,
              '&:hover': { bgcolor: labTheme.accent.danger }
            }}>
            Logout
          </Button>
        </Box>
      </LabSidebar>

      <Box sx={{ flexGrow: 1, ml: '280px', p: 4 }}>
        <LabNavbar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: labTheme.primary.main }}>
              Laboratory Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: labTheme.text.secondary, mt: 1 }}>
              Welcome to the SmartCare Hospital Laboratory Management System
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField placeholder="Search tests, patients, reports..." size="small"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleSearch}
              sx={{ width: 300, '& .MuiOutlinedInput-root': { borderRadius: 8, bgcolor: labTheme.background.elevated } }}
              InputProps={{
                startAdornment: <InputAdornment position="start">
                  {searchLoading ? <CircularProgress size={20} /> : <SearchIcon sx={{ color: labTheme.text.secondary }} />}
                </InputAdornment>,
              }}
            />

            <Tooltip title="Notifications" TransitionComponent={Zoom}>
              <IconButton onClick={handleNotificationClick} sx={{
                bgcolor: alpha(labTheme.secondary.main, 0.1),
                '&:hover': { bgcolor: alpha(labTheme.secondary.main, 0.2) }
              }}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon sx={{ color: labTheme.secondary.main }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Messages" TransitionComponent={Zoom}>
              <IconButton onClick={handleMessageClick} sx={{
                bgcolor: alpha(labTheme.accent.success, 0.1),
                '&:hover': { bgcolor: alpha(labTheme.accent.success, 0.2) }
              }}>
                <Badge badgeContent={messages.length} color="warning">
                  <EmailIcon sx={{ color: labTheme.accent.success }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewTest}
              sx={{ bgcolor: labTheme.secondary.main, '&:hover': { bgcolor: labTheme.secondary.dark } }}>
              New Test
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ color: labTheme.text.secondary, fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: labTheme.text.primary, fontWeight: 500 }}>
                {formatDate(new Date(), 'full')}
              </Typography>
            </Box>
          </Box>
        </LabNavbar>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { status: 'primary', label: 'Total Tests Today', value: stats.totalTests, icon: <FlaskIcon />, trend: '+12%' },
            { status: 'warning', label: 'Pending Tests', value: stats.pendingTests, icon: <PendingIcon />, suffix: `Avg: ${stats.avgProcessingTime}` },
            { status: 'success', label: 'Completed Today', value: stats.completedTests, icon: <CompletedIcon />, suffix: `${stats.completionRate}% rate` },
            { status: 'danger', label: 'Critical Results', value: stats.criticalResults, icon: <CriticalIcon />, suffix: 'Needs attention' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in timeout={1000 + index * 200}>
                <div>
                  <LabStatCard status={stat.status}>
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" gutterBottom>{stat.label}</Typography>
                      <Typography variant="h4" sx={{
                        fontWeight: 700, color:
                          stat.status === 'primary' ? labTheme.primary.main :
                            stat.status === 'success' ? labTheme.accent.success :
                              stat.status === 'warning' ? labTheme.accent.warning :
                                labTheme.accent.danger, mb: 1
                      }}>
                        {stat.value}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ color: labTheme.accent.success, fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption" sx={{ color: labTheme.accent.success }}>
                          {stat.trend || stat.suffix}
                        </Typography>
                      </Box>
                      <Box sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, color: alpha(labTheme.primary.main, 0.1) }}>
                        {stat.icon}
                      </Box>
                    </CardContent>
                  </LabStatCard>
                </div>
              </Grow>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { icon: <HematologyIcon />, title: 'Blood Test', desc: 'CBC, Hemoglobin, Glucose', color: labTheme.accent.hematology },
            { icon: <BiochemistryIcon />, title: 'Urine Analysis', desc: 'Routine, Microscopic', color: labTheme.accent.biochemistry },
            { icon: <MicrobiologyIcon />, title: 'Microbiology', desc: 'Culture, Sensitivity', color: labTheme.accent.microbiology },
            { icon: <PathologyIcon />, title: 'Pathology', desc: 'Biopsy, Histology', color: labTheme.accent.pathology },
            { icon: <RadiologyIcon />, title: 'Radiology', desc: 'X-Ray, CT Scan, MRI', color: labTheme.accent.radiology },
          ].map((test, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
              <Grow in timeout={1800 + index * 100}>
                <div>
                  <Card sx={{
                    textAlign: 'center', p: 2, cursor: 'pointer', transition: 'all 0.3s ease',
                    border: `2px solid transparent`, '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: test.color, boxShadow: `0 10px 20px ${alpha(test.color, 0.2)}`
                    }
                  }}
                    onClick={() => navigate(`/lab/requests/${user.id}`)}>
                    <Box sx={{ color: test.color, fontSize: '2.5rem', mb: 1 }}>{test.icon}</Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{test.title}</Typography>
                    <Typography variant="caption" color="textSecondary">{test.desc}</Typography>
                  </Card>
                </div>
              </Grow>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Slide direction="right" in timeout={1000}>
              <div>
                <LabSectionCard>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: labTheme.primary.main }}>
                      Test Volume Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {['daily', 'weekly', 'monthly'].map((period) => (
                        <Button key={period} size="small" variant={chartPeriod === period ? 'contained' : 'outlined'}
                          onClick={() => handleChartPeriodChange(period)}
                          sx={{
                            borderRadius: 6, textTransform: 'capitalize',
                            ...(chartPeriod === period && {
                              bgcolor: labTheme.secondary.main, color: 'white',
                              '&:hover': { bgcolor: labTheme.secondary.dark }
                            })
                          }}>
                          {period}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ height: 300 }}><Line data={volumeChartData} options={chartOptions} /></Box>
                </LabSectionCard>
              </div>
            </Slide>
          </Grid>

          <Grid item xs={12} md={4}>
            <Slide direction="left" in timeout={1000}>
              <div>
                <LabSectionCard sx={{ height: '100%' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: labTheme.primary.main, mb: 3 }}>
                    Test Categories
                  </Typography>
                  <Box sx={{ height: 300 }}><Doughnut data={categoryChartData} options={doughnutOptions} /></Box>
                </LabSectionCard>
              </div>
            </Slide>
          </Grid>
        </Grid>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Slide direction="right" in timeout={1200}>
              <div>
                <LabSectionCard>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: labTheme.primary.main }}>
                      Test Queue
                    </Typography>
                    <Button size="small" endIcon={<FilterIcon />} sx={{ color: labTheme.secondary.main }}>
                      View All
                    </Button>
                  </Box>

                  <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                    {testQueue.map((item) => (
                      <Box key={item.id} sx={{
                        display: 'flex', alignItems: 'center', p: 2, mb: 1, borderRadius: 2,
                        bgcolor: labTheme.background.elevated, transition: 'all 0.3s ease',
                        '&:hover': { bgcolor: alpha(labTheme.secondary.main, 0.05), transform: 'translateX(5px)' }
                      }}>
                        <TestIcon type={item.type}>{getTestIcon(item.type)}</TestIcon>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {item.test} - Patient {item.patientId}
                          </Typography>
                          <Typography variant="caption" sx={{ color: labTheme.text.secondary, display: 'block' }}>
                            {item.doctor} • {item.department}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha(labTheme.text.secondary, 0.7) }}>
                            <TimeIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                            Waiting: {item.waitTime}
                          </Typography>
                        </Box>
                        <Button size="small" variant="contained" startIcon={<ProcessIcon />}
                          onClick={() => handleProcessTest(item.id)}
                          sx={{ bgcolor: labTheme.secondary.main, '&:hover': { bgcolor: labTheme.secondary.dark } }}>
                          Process
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </LabSectionCard>
              </div>
            </Slide>
          </Grid>

          <Grid item xs={12} md={6}>
            <Slide direction="left" in timeout={1200}>
              <div>
                <LabSectionCard>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: labTheme.primary.main }}>
                      Critical Results
                    </Typography>
                    <Button size="small" endIcon={<FilterIcon />} sx={{ color: labTheme.secondary.main }}>
                      View All
                    </Button>
                  </Box>

                  <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                    {criticalResults.map((item) => (
                      <Box key={item.id} sx={{
                        display: 'flex', alignItems: 'center', p: 2, mb: 1, borderRadius: 2,
                        bgcolor: alpha(labTheme.accent.danger, 0.05), border: `1px solid ${alpha(labTheme.accent.danger, 0.2)}`,
                        animation: item.severity === 'critical' ? 'pulse 2s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { boxShadow: `0 0 0 0 ${alpha(labTheme.accent.danger, 0.4)}` },
                          '70%': { boxShadow: `0 0 0 10px ${alpha(labTheme.accent.danger, 0)}` },
                          '100%': { boxShadow: `0 0 0 0 ${alpha(labTheme.accent.danger, 0)}` },
                        }
                      }}>
                        <TestIcon type={item.type}>{getTestIcon(item.type)}</TestIcon>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: labTheme.accent.danger }}>
                            {item.test}
                          </Typography>
                          <Typography variant="caption" sx={{ color: labTheme.text.secondary, display: 'block' }}>
                            Patient: {item.patient} • Age: {item.age}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha(labTheme.text.secondary, 0.7) }}>
                            <TimeIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                            Tested: {item.time}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Approve" TransitionComponent={Zoom}>
                            <IconButton size="small" onClick={() => handleApproveResult(item.id)}
                              disabled={processingId === item.id}
                              sx={{ color: labTheme.accent.success }}>
                              {processingId === item.id ? <CircularProgress size={20} /> : <ApproveIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject" TransitionComponent={Zoom}>
                            <IconButton size="small" onClick={() => handleRejectResult(item.id)}
                              disabled={processingId === item.id}
                              sx={{ color: labTheme.accent.danger }}>
                              {processingId === item.id ? <CircularProgress size={20} /> : <RejectIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send to Doctor" TransitionComponent={Zoom}>
                            <IconButton size="small" onClick={() => handleSendToDoctor(item.id)}
                              disabled={processingId === item.id}
                              sx={{ color: labTheme.secondary.main }}>
                              {processingId === item.id ? <CircularProgress size={20} /> : <SendIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </LabSectionCard>
              </div>
            </Slide>
          </Grid>
        </Grid>

        <Slide direction="up" in timeout={1400}>
          <div>
            <LabSectionCard sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: labTheme.primary.main, mb: 3 }}>
                Equipment Status
              </Typography>

              <Grid container spacing={2}>
                {equipment.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <EquipmentItem status={item.status === 'operational' ? 'success' : item.status === 'warning' ? 'warning' : 'danger'}>
                      <Box sx={{ color: labTheme.primary.main, fontSize: '1.5rem', mr: 2 }}>
                        {getEquipmentIcon(item.icon)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 10, height: 10, borderRadius: '50%',
                            bgcolor: item.status === 'operational' ? labTheme.accent.success :
                              item.status === 'warning' ? labTheme.accent.warning : labTheme.accent.danger
                          }} />
                          <Typography variant="caption" sx={{ color: labTheme.text.secondary }}>{item.details}</Typography>
                        </Box>
                      </Box>
                    </EquipmentItem>
                  </Grid>
                ))}
              </Grid>
            </LabSectionCard>
          </div>
        </Slide>

        <Slide direction="up" in timeout={1600}>
          <div>
            <LabSectionCard sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: labTheme.primary.main }}>
                  Recent Test Results
                </Typography>
                <Button size="small" startIcon={<DownloadIcon />} sx={{ color: labTheme.secondary.main }}>
                  Export Report
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Test ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Test Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Requested By</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Result Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentResults.map((result) => (
                      <TableRow key={result.id} hover>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 600, color: labTheme.primary.main }}>{result.id}</Typography></TableCell>
                        <TableCell>{result.patient}</TableCell>
                        <TableCell>{result.test}</TableCell>
                        <TableCell>{result.doctor}</TableCell>
                        <TableCell><LabStatusChip label={result.status} status={result.status} size="small" /></TableCell>
                        <TableCell>{result.time}</TableCell>
                        <TableCell>
                          <Tooltip title="View" TransitionComponent={Zoom}>
                            <IconButton size="small" onClick={() => handleViewDetails(result.id)} sx={{ color: labTheme.secondary.main }}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {result.status === 'completed' && (
                            <Tooltip title="Print" TransitionComponent={Zoom}>
                              <IconButton size="small" onClick={() => toast.info(`Printing ${result.id}`)} sx={{ color: labTheme.accent.success }}>
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {result.status === 'critical' && (
                            <Tooltip title="Flag" TransitionComponent={Zoom}>
                              <IconButton size="small" onClick={() => handleNotifyCritical(result.id)} sx={{ color: labTheme.accent.danger }}>
                                <FlagIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {result.status === 'pending' && (
                            <Tooltip title="Upload" TransitionComponent={Zoom}>
                              <IconButton size="small" onClick={() => handleUploadResult(result.id)} sx={{ color: labTheme.accent.warning }}>
                                <UploadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </LabSectionCard>
          </div>
        </Slide>

        <Fade in timeout={2000}>
          <Box component="footer" sx={{
            textAlign: 'center', py: 3, color: labTheme.text.secondary,
            borderTop: `1px solid ${alpha(labTheme.primary.main, 0.1)}`
          }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} SmartCare Hospital Laboratory Management System. All rights reserved. | Lab Portal v2.5
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: labTheme.text.disabled }}>
                Lab Director: {labTech.name} | Accreditation: CAP, CLIA | Emergency Contact: Ext. 5555
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Box>

      <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: labTheme.primary.main, color: 'white' }}>
          Upload Test Result
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>Upload result for test #{selectedTest}</Typography>
          <Button variant="contained" component="label" fullWidth sx={{ py: 2 }}>
            Choose File
            <input type="file" hidden accept=".pdf,.jpg,.png" />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadModalOpen(false)}>Cancel</Button>
          <Button onClick={confirmUpload} variant="contained" color="primary">Upload</Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={handleClose} TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            mt: 2, bgcolor: labTheme.background.paper, border: `1px solid ${alpha(labTheme.primary.main, 0.1)}`,
            borderRadius: 2, minWidth: 320, maxHeight: 400
          }
        }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(labTheme.primary.main, 0.1)}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
        </Box>
        {notifications.map((notif) => (
          <MenuItem key={notif.id} onClick={handleClose} sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <AlertIcon fontSize="small" sx={{ color: labTheme.secondary.main }} />
              <Box>
                <Typography variant="body2">{notif.message}</Typography>
                <Typography variant="caption" sx={{ color: labTheme.text.disabled }}>{notif.time}</Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Menu anchorEl={messageAnchor} open={Boolean(messageAnchor)} onClose={handleClose} TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            mt: 2, bgcolor: labTheme.background.paper, border: `1px solid ${alpha(labTheme.primary.main, 0.1)}`,
            borderRadius: 2, minWidth: 320
          }
        }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(labTheme.primary.main, 0.1)}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Messages</Typography>
        </Box>
        {messages.map((msg) => (
          <MenuItem key={msg.id} onClick={handleClose} sx={{ py: 1.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{msg.sender}</Typography>
              <Typography variant="body2" sx={{ color: labTheme.text.secondary }}>{msg.message}</Typography>
              <Typography variant="caption" sx={{ color: labTheme.text.disabled }}>{msg.time}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const ThermostatIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24">
    <path d="M15 13V5c0-1.66-1.34-3-3-3S9 3.34 9 5v8c-1.21.91-2 2.37-2 4 0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.63-.79-3.09-2-4zm-4-8c0-.55.45-1 1-1s1 .45 1 1h-1v1h1v2h-1v1h1v2h-2V5z" />
  </svg>
);
export default LabDashboard;