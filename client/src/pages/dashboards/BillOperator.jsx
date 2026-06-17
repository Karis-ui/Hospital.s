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
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Zoom,
  Fade,
  Slide,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {DataGrid} from '@mui/x-data-grid';
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  ReceiptLong as GenerateBillIcon,
  PendingActions as PendingIcon,
  CheckCircle as PaidIcon,
  Warning as OverdueIcon,
  People as PeopleIcon,
  Assessment as ReportsIcon,
  Send as SendIcon,
  Calculate as InsuranceIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  Check as MarkPaidIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as TimeIcon,
  AccountBalance as CashIcon,
  CreditCard as CardIcon,
  Business as InsuranceCardIcon,
  AccountBalanceWallet as WalletIcon,
  Close as CloseIcon,
  AddCircle as AddCircleIcon,
  RemoveCircle as RemoveCircleIcon,
  Save as SaveIcon,
  Info as InfoIcon,
  Assessment as AnalyticsIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext';
import { OperatorService } from '../../services/users/operator';
import {coreService} from '../../services/users/core';
import { formatDate, formatCurrency } from '../../formatters';
import {useConfirm} from '../../theme/useConfirm';

const emeraldTheme = {
  primary: { main: '#27ae60', light: '#6fcf97', dark: '#219653', contrast: '#ffffff' },
  secondary: { main: '#3498db', light: '#5dade2', dark: '#2980b9', contrast: '#ffffff' },
  accent: { green: '#27ae60', blue: '#3498db', orange: '#f39c12', red: '#e74c3c', purple: '#9b59b6', teal: '#00b894', yellow: '#f1c40f' },
  status: {
    paid: { bg: '#d4edda', color: '#155724', border: '#27ae60' },
    pending: { bg: '#fff3cd', color: '#856404', border: '#f39c12' },
    overdue: { bg: '#f8d7da', color: '#721c24', border: '#e74c3c' },
  },
  background: { default: '#f5f7fb', paper: '#ffffff', elevated: '#f8fafc', dark: '#1e293b' },
  text: { primary: '#2c3e50', secondary: '#7f8c8d', disabled: '#bdc3c7', light: '#ffffff' },
};

const Sidebar = styled(Box)(({ theme }) => ({
  width: 280,
  background: `linear-gradient(180deg, ${emeraldTheme.primary.dark} 0%, #1a252f 100%)`,
  color: emeraldTheme.text.light,
  position: 'fixed',
  height: '100vh',
  overflowY: 'auto',
  boxShadow: `5px 0 25px ${alpha(emeraldTheme.primary.dark, 0.3)}`,
  zIndex: 1200,
  '&::-webkit-scrollbar': { width: '8px' },
  '&::-webkit-scrollbar-track': { background: alpha(emeraldTheme.text.light, 0.1) },
  '&::-webkit-scrollbar-thumb': { background: emeraldTheme.primary.main, borderRadius: '4px' },
}));

const OperatorAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  margin: '0 auto 15px',
  background: `linear-gradient(135deg, ${emeraldTheme.primary.main}, ${emeraldTheme.primary.dark})`,
  border: `4px solid ${alpha(emeraldTheme.text.light, 0.3)}`,
  boxShadow: `0 10px 25px ${alpha(emeraldTheme.primary.main, 0.3)}`,
  fontSize: '2.5rem',
  fontWeight: 700,
  color: emeraldTheme.text.light,
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'scale(1.05)', boxShadow: `0 15px 35px ${alpha(emeraldTheme.primary.main, 0.4)}` },
}));

const StatCard = styled(Card)(({ theme, status }) => ({
  background: emeraldTheme.background.paper,
  borderRadius: 16,
  border: `1px solid ${alpha(emeraldTheme.primary.main, 0.1)}`,
  borderLeft: `5px solid ${
    status === 'primary' ? emeraldTheme.primary.main :
    status === 'success' ? emeraldTheme.status.paid.color :
    status === 'warning' ? emeraldTheme.status.pending.color :
    status === 'danger' ? emeraldTheme.status.overdue.color :
    emeraldTheme.primary.main
  }`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 20px 40px ${alpha(emeraldTheme.primary.main, 0.15)}` },
}));

const EmeraldButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${emeraldTheme.primary.main}, ${emeraldTheme.primary.light})`,
  color: emeraldTheme.text.light,
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: 50,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: `0 5px 15px ${alpha(emeraldTheme.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 25px ${alpha(emeraldTheme.primary.main, 0.4)}`, background: `linear-gradient(45deg, ${emeraldTheme.primary.light}, ${emeraldTheme.primary.main})` },
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(emeraldTheme.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(emeraldTheme.primary.main, 0.1)}`,
  boxShadow: `0 10px 30px ${alpha(emeraldTheme.primary.main, 0.1)}`,
}));

const StatusBadge = styled(Chip)(({ theme, status }) => {
  const colors = {
    paid: emeraldTheme.status.paid,
    pending: emeraldTheme.status.pending,
    overdue: emeraldTheme.status.overdue,
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

const TransactionItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: `1px solid ${alpha(emeraldTheme.text.secondary, 0.1)}`,
  '&:last-child': { borderBottom: 'none' },
  '&:hover': { background: alpha(emeraldTheme.primary.main, 0.02) },
}));

export const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {confirm,ConfirmDialogComponent} = useConfirm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [bills, setBills] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [billFilter, setBillFilter] = useState('all');
  
  const [newBillModal, setNewBillModal] = useState(false);
  const [billItems, setBillItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [quickBillData, setQuickBillData] = useState({
    patientId: '',
    patientName: '',
    amount: '',
    notes: '',
    paymentMethod: '',
    paymentStatus: '',
  });
  const [selectedRows, setSelectedRows] = useState([]);
  
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchBills();
    fetchAnalytics();
    fetchNotifications();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [billItems]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await OperatorService.getDashboard();
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

  const fetchBills = async () => {
    try {
      const response = await OperatorService.getBills();
      setBills(response.data);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
      toast.error('Failed to load bills');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await OperatorService.billAnalysis();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await coreService.getNotifications();
      setNotifications(response.data);
    } catch (err) {
      setNotifications([
        { id: 1, message: 'New billing request from ICU', time: '5 min ago', type: 'info', read: false },
        { id: 2, message: 'Insurance claim approved for Patient #1245', time: '30 min ago', type: 'success', read: false },
      ]);
    }
  };

  const calculateTotal = () => {
    const total = billItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    setTotalAmount(total);
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setNotificationAnchor(null);
  };

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      try {
        setSearchLoading(true);
        const response = await OperatorService.searchStaff();
        const filtered = response.data.filter(item => 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id?.toString().includes(searchTerm) ||
          item.billNo?.includes(searchTerm)
        );
        setSearchResults(filtered);
        
        if (filtered.length > 0) {
          toast.success(`Found ${filtered.length} results`);
        } else {
          toast.info('No results found');
        }
      } catch (err) {
        toast.error('Search failed');
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const handleNewBill = () => {
    setNewBillModal(true);
  };

  const handleCloseModal = () => {
    setNewBillModal(false);
    setBillItems([]);
    setQuickBillData({
      patientId: '',
      patientName: '',
      amount: '',
      notes: '',
      paymentMethod: '',
      paymentStatus: '',
    });
  };

  const handleQuickBillChange = (e) => {
    setQuickBillData({
      ...quickBillData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddBillItem = (e) => {
    e.preventDefault();
    
    const { amount, notes,description } = quickBillData;
    
    if (!amount || !description) {
      toast.error('Please fill all item fields');
      return;
    }
    
    const newItem = {
      id: Date.now(),
      notes,
      amount: parseFloat(amount),
      quantity: 1,
    };
    
    setBillItems([...billItems, newItem]);
    
    setQuickBillData({
      ...quickBillData,
      serviceType: '',
      amount: '',
      description: '',
    });
    
    toast.success('Item added to bill');
  };

  const handleRemoveItem = (id) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const handleGenerateBill = async () => {
    if (billItems.length === 0) {
      toast.error('Please add items to the bill first');
      return;
    }
    
    if (!quickBillData.patientId || !quickBillData.patientName) {
      toast.error('Please enter Patient ID and Name');
      return;
    }
    
    try {
      setProcessingId('generate');
      
      const billData = {
        patient_id: quickBillData.patientId,
        patient_name: quickBillData.patientName,
        items: billItems,
        total_amount: totalAmount,
        payment_method: quickBillData.paymentMethod,
        status: 'pending',
      };
      
      const response = await OperatorService.createBill(billData);
      
      toast.success(`Bill generated successfully`);
      handleCloseModal();
      fetchBills(); 
      fetchAnalytics(); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAsPaid = async (billId) => {
    const confirmed = await confirm({
      title:'Mark Bill as Paid',
      message:'Are you sure you want to mark the same.',
      type:'success',
      confirmText:'Approve',
    });
    if (confirmed) {
      try {
        setProcessingId(billId);
        await OperatorService.processpayment(billId);
        toast.success(`Bill marked as paid`);
        fetchBills();
        fetchAnalytics();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to mark as paid');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleRecordPayment = async (billId) => {
    try {
      setProcessingId(billId);
      await OperatorService.recordPayment(billId);
      toast.success('Payment method recorded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendReminder = async (billId) => {
    const confirmed = await confirm({
      title:'Send Reminder',
      message:'Are you sure you want to send the same.',
      type:'success',
      confirmText:'Send',
    });
    if (confirmed) {
      try {
        setProcessingId(billId);
        await OperatorService.sendReminder(billId);
        toast.success(`Reminder sent to patient`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to send reminder');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleViewBill = (billId) => {
    navigate(`/operator/bills/${billId}`);
  };

  const handlePrintBill = async (billId) => {
    try {
      const response = await OperatorService.printReceipt(billId);
      window.open(`/receipt/print/${billId}/`, '_blank');
    } catch (err) {
      toast.error('Failed to print bill');
    }
  };

  const handleViewReceipt = (billId) => {
    navigate(`/view/receipt/${billId}/`);
  };

  const handleGenerateInvoice = async (billId) => {
    try {
      const response = await OperatorService.generateInvoice(billId);
      toast.success('Invoice generated');
    } catch (err) {
      toast.error('Failed to generate invoice');
    }
  };

  const handleExportBills = async () => {
    try {
      const response = await OperatorService.reportBill();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bills_report.csv');
      document.body.appendChild(link);
      link.click();
      toast.success('Bills exported successfully');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleFilterChange = (filter) => {
    setBillFilter(filter);
  };

  const getFilteredBills = () => {
    if (!bills || bills.length === 0) return [];
    
    switch(billFilter) {
      case 'pending':
        return bills.filter(b => b.status === 'pending' || b.status === 'Pending');
      case 'paid':
        return bills.filter(b => b.status === 'paid' || b.status === 'Paid' || b.status === 'Cleared');
      case 'overdue':
        return bills.filter(b => b.status === 'overdue' || b.status === 'Overdue');
      default:
        return bills;
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = String(status).toLowerCase();
    switch(statusLower) {
      case 'paid':
      case 'cleared':
        return <PaidIcon fontSize="small" />;
      case 'pending':
        return <PendingIcon fontSize="small" />;
      case 'overdue':
        return <OverdueIcon fontSize="small" />;
      default:
        return <ReceiptIcon fontSize="small" />;
    }
  };

  const getStatusFromAPI = (status) => {
    const statusLower = String(status).toLowerCase();
    if (statusLower === 'paid' || statusLower === 'cleared') return 'paid';
    if (statusLower === 'pending') return 'pending';
    if (statusLower === 'overdue') return 'overdue';
    return 'pending';
  };

  const getPaymentMethodIcon = (method) => {
    const methodLower = String(method).toLowerCase();
    if (methodLower.includes('cash')) return <CashIcon fontSize="small" sx={{ color: emeraldTheme.accent.green }} />;
    if (methodLower.includes('card') || methodLower.includes('credit')) return <CardIcon fontSize="small" sx={{ color: emeraldTheme.accent.blue }} />;
    if (methodLower.includes('insurance')) return <InsuranceCardIcon fontSize="small" sx={{ color: emeraldTheme.accent.orange }} />;
    if (methodLower.includes('transfer') || methodLower.includes('online')) return <WalletIcon fontSize="small" sx={{ color: emeraldTheme.accent.purple }} />;
    return <MoneyIcon fontSize="small" />;
  };

  const columns = [
    { field: 'id', headerName: 'Bill No', width: 100,
      renderCell: (params) => <strong>#{params.value}</strong>
    },
    { field: 'patientName', headerName: 'Patient', width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value || params.row.patient}</Typography>
          <Typography variant="caption" sx={{ color: emeraldTheme.text.secondary }}>{params.row.room || 'OPD'}</Typography>
        </Box>
      )
    },
    { field: 'date', headerName: 'Date', width: 100,
      valueFormatter: (params) => params.value ? formatDate(params.value, 'short') : '-'
    },
    { field: 'amount', headerName: 'Amount', width: 100,
      valueFormatter: (params) => formatCurrency(params.value || 0),
      renderCell: (params) => <Typography sx={{ fontWeight: 600 }}>{formatCurrency(params.value || 0)}</Typography>
    },
    { field: 'status', headerName: 'Status', width: 100,
      renderCell: (params) => {
        const status = getStatusFromAPI(params.value);
        return (
          <StatusBadge
            label={String(params.value).toUpperCase()}
            status={status}
            size="small"
            icon={getStatusIcon(params.value)}
          />
        );
      }
    },
    { field: 'dueDate', headerName: 'Due Date', width: 100,
      valueFormatter: (params) => params.value ? formatDate(params.value, 'short') : '-'
    },
    { field: 'actions', headerName: 'Actions', width: 280,
      renderCell: (params) => {
        const status = getStatusFromAPI(params.row.status);
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {status === 'pending' && (
              <>
                <Tooltip title="Mark as Paid" TransitionComponent={Zoom}>
                  <IconButton size="small" onClick={() => handleMarkAsPaid(params.row.id)}
                    disabled={processingId === params.row.id} sx={{ color: emeraldTheme.accent.green }}>
                    {processingId === params.row.id ? <CircularProgress size={20} /> : <MarkPaidIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Record Payment" TransitionComponent={Zoom}>
                  <IconButton size="small" onClick={() => handleRecordPayment(params.row.id)}
                    sx={{ color: emeraldTheme.accent.blue }}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {status === 'overdue' && (
              <Tooltip title="Send Reminder" TransitionComponent={Zoom}>
                <IconButton size="small" onClick={() => handleSendReminder(params.row.id)}
                  disabled={processingId === params.row.id} sx={{ color: emeraldTheme.accent.orange }}>
                  {processingId === params.row.id ? <CircularProgress size={20} /> : <EmailIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="View Details" TransitionComponent={Zoom}>
              <IconButton size="small" onClick={() => handleViewBill(params.row.id)} sx={{ color: emeraldTheme.accent.blue }}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Receipt" TransitionComponent={Zoom}>
              <IconButton size="small" onClick={() => handleViewReceipt(params.row.id)} sx={{ color: emeraldTheme.accent.purple }}>
                <ReceiptIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print" TransitionComponent={Zoom}>
              <IconButton size="small" onClick={() => handlePrintBill(params.row.id)} sx={{ color: emeraldTheme.text.secondary }}>
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Generate Invoice" TransitionComponent={Zoom}>
              <IconButton size="small" onClick={() => handleGenerateInvoice(params.row.id)} sx={{ color: emeraldTheme.accent.green }}>
                <GenerateBillIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh',
        background: `linear-gradient(135deg, ${emeraldTheme.primary.dark}, ${emeraldTheme.primary.main})` }}>
        <CircularProgress sx={{ color: emeraldTheme.text.light }} size={60} thickness={4} />
        <Typography sx={{ mt: 2, color: emeraldTheme.text.light }}>Loading Billing Dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: emeraldTheme.background.default, minHeight: '100vh' }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>Retry</Button>
        }>{error}</Alert>
      </Box>
    );
  }

  const operator = dashboardData?.operator || user || { first_name: '', last_name: '', full_name: '' };
  operator.full_name = operator.full_name || `${operator.first_name || ''} ${operator.last_name || ''}`.trim() || 'Operator';
  
  const stats = dashboardData?.statistics || analytics?.statistics || {
    todayCollection: 0,
    billsPaidToday: 0,
    pendingBills: bills?.filter(b => getStatusFromAPI(b.status) === 'pending').length || 0,
    overdueBills: bills?.filter(b => getStatusFromAPI(b.status) === 'overdue').length || 0,
  };
  
  const recentTransactions = dashboardData?.recent_transactions || analytics?.recent_transactions || [];
  const summary = dashboardData?.summary || analytics?.summary || {
    totalBills: bills?.length || 0,
    totalCollection: bills?.filter(b => getStatusFromAPI(b.status) === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
    cashPayments: 0,
    cardPayments: 0,
    insuranceClaims: 0,
    outstandingBalance: bills?.filter(b => getStatusFromAPI(b.status) !== 'paid').reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ display: 'flex', bgcolor: emeraldTheme.background.default, minHeight: '100vh' }}>
      <Sidebar>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <OperatorAvatar>
            {operator.full_name.split(' ').map(n => n[0]).join('').toUpperCase() || 'OP'}
          </OperatorAvatar>
          
          <Typography variant="h5" sx={{ fontWeight: 700, color: emeraldTheme.text.light, mb: 0.5 }}>
            {operator.full_name}
          </Typography>
          
          <Chip icon={<MoneyIcon />} label="Billing Department"
            sx={{ background: alpha(emeraldTheme.primary.main, 0.2), color: emeraldTheme.primary.light,
              border: `1px solid ${emeraldTheme.primary.light}`, fontWeight: 600, mb: 2 }}
          />
          
          <Typography variant="caption" sx={{ color: alpha(emeraldTheme.text.light, 0.7), display: 'block' }}>
            ID: OP-{operator.id?.toString().padStart(5, '0') || '00001'}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: alpha(emeraldTheme.text.light, 0.1) }} />

        <List sx={{ px: 2, py: 2 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton selected sx={{ borderRadius: 2, color: emeraldTheme.text.light,
              bgcolor: alpha(emeraldTheme.primary.main, 0.2), '&:hover': { bgcolor: alpha(emeraldTheme.primary.main, 0.3) } }}>
              <ListItemIcon sx={{ color: emeraldTheme.primary.light, minWidth: 40 }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>

          {[
            { icon: <GenerateBillIcon />, text: 'Generate Bill', path: '/operator/bills/new' },
            { icon: <PendingIcon />, text: 'Pending Bills', badge: stats.pendingBills, path: '/operator/bills/pending' },
            { icon: <PaidIcon />, text: 'Paid Bills', path: '/operator/bills/paid' },
            { icon: <PeopleIcon />, text: 'Patients', path: '/operator/patients' },
            { icon: <ReportsIcon />, text: 'Reports', path: '/operator/reports' },
            { icon: <AnalyticsIcon />, text: 'Analytics', path: '/operator/analytics' },
            { icon: <SettingsIcon />, text: 'Settings', path: '/operator/settings' },
          ].map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton onClick={() => navigate(item.path)} sx={{ borderRadius: 2, color: alpha(emeraldTheme.text.light, 0.85),
                '&:hover': { bgcolor: alpha(emeraldTheme.text.light, 0.1), color: emeraldTheme.text.light } }}>
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.badge ? (
                  <Chip label={item.badge} size="small" sx={{ bgcolor: emeraldTheme.accent.red, color: emeraldTheme.text.light,
                    fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
                ) : null}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, px: 3 }}>
          <Button fullWidth variant="contained" startIcon={<LogoutIcon />} onClick={handleLogout}
            sx={{ bgcolor: alpha(emeraldTheme.text.light, 0.1), color: emeraldTheme.text.light,
              '&:hover': { bgcolor: emeraldTheme.accent.red } }}>
            Logout
          </Button>
        </Box>
      </Sidebar>

      <Box sx={{ flexGrow: 1, ml: '280px', p: 4 }}>
        <Fade in timeout={1000}>
          <Paper elevation={0} sx={{ p: 3, mb: 4, display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', borderRadius: 3, border: `1px solid ${alpha(emeraldTheme.primary.main, 0.1)}` }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: emeraldTheme.primary.dark }}>
                Billing Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: emeraldTheme.text.secondary, mt: 1 }}>
                Welcome, {operator.full_name} | Today is {formatDate(new Date(), 'full')}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField placeholder="Search bills, patients..." variant="outlined" size="small"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleSearch}
                sx={{ width: 250, '& .MuiOutlinedInput-root': { borderRadius: 50, bgcolor: emeraldTheme.background.elevated } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">
                    {searchLoading ? <CircularProgress size={20} /> : <SearchIcon sx={{ color: emeraldTheme.text.secondary }} />}
                  </InputAdornment>,
                }}
              />

              <Tooltip title="Notifications" TransitionComponent={Zoom}>
                <IconButton onClick={handleNotificationClick} sx={{ bgcolor: alpha(emeraldTheme.accent.blue, 0.1),
                  '&:hover': { bgcolor: alpha(emeraldTheme.accent.blue, 0.2) } }}>
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon sx={{ color: emeraldTheme.accent.blue }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <EmeraldButton startIcon={<AddIcon />} onClick={handleNewBill}>
                Create New Bill
              </EmeraldButton>
            </Box>
          </Paper>
        </Fade>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { status: 'primary', label: "Today's Collection", value: stats.todayCollection, icon: <MoneyIcon />, trend: '+12%' },
            { status: 'success', label: 'Bills Paid Today', value: stats.billsPaidToday, icon: <PaidIcon />, suffix: 'transactions' },
            { status: 'warning', label: 'Pending Bills', value: stats.pendingBills, icon: <PendingIcon />, suffix: 'to process' },
            { status: 'danger', label: 'Overdue Bills', value: stats.overdueBills, icon: <OverdueIcon />, suffix: 'attention needed' },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in timeout={1000 + index * 200}>
                <div>
                  <StatCard status={stat.status}>
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" gutterBottom>{stat.label}</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 
                        stat.status === 'primary' ? emeraldTheme.primary.main :
                        stat.status === 'success' ? emeraldTheme.status.paid.color :
                        stat.status === 'warning' ? emeraldTheme.status.pending.color :
                        emeraldTheme.status.overdue.color, mb: 1 }}>
                        {stat.status === 'primary' ? formatCurrency(stat.value) : stat.value}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ color: emeraldTheme.accent.green, fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption" sx={{ color: emeraldTheme.accent.green }}>
                          {stat.trend || `${stat.value} ${stat.suffix || ''}`}
                        </Typography>
                      </Box>
                      <Box sx={{ position: 'absolute', right: 20, bottom: 20, fontSize: 50, color: alpha(emeraldTheme.primary.main, 0.1) }}>
                        {stat.icon}
                      </Box>
                    </CardContent>
                  </StatCard>
                </div>
              </Grow>
            </Grid>
          ))}
        </Grid>
        {selectedRows.length > 0 && (
          <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">{selectedRows.length} bills selected</Typography>
            <Button size="small" startIcon={<MarkPaidIcon />} onClick={() => {
              selectedRows.forEach(id => handleMarkAsPaid(id));
              setSelectedRows([]);
            }}>
              Mark Paid
            </Button>
            <Button size="small" startIcon={<PrintIcon />} onClick={handleExportBills}>
              Export
            </Button>
            <Button size="small" startIcon={<DownloadIcon />} onClick={handleExportBills}>
              Download
            </Button>
            <IconButton size="small" onClick={() => setSelectedRows([])}><CloseIcon fontSize="small" /></IconButton>
          </Paper>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Slide direction="right" in timeout={1000}>
              <div>
                <GlassCard sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: emeraldTheme.primary.dark }}>
                      Recent Bills
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {['all', 'pending', 'paid'].map((filter) => (
                        <Button key={filter} size="small" variant={billFilter === filter ? 'contained' : 'outlined'}
                          onClick={() => handleFilterChange(filter)}
                          sx={{ borderRadius: 50, textTransform: 'capitalize',
                            ...(billFilter === filter && { bgcolor: filter === 'paid' ? emeraldTheme.status.paid.color :
                              filter === 'pending' ? emeraldTheme.status.pending.color : emeraldTheme.primary.main,
                              color: 'white' }) }}>
                          {filter}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                      rows={getFilteredBills().map((bill, index) => ({ ...bill, id: bill.id || index + 1 }))}
                      columns={columns}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                      checkboxSelection
                      disableSelectionOnClick
                      onSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
                      selectionModel={selectedRows}
                      loading={loading}
                      sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': { borderBottom: `1px solid ${alpha(emeraldTheme.text.secondary, 0.1)}` },
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: alpha(emeraldTheme.primary.main, 0.05),
                          color: emeraldTheme.primary.dark, fontWeight: 600 }
                      }}
                    />
                  </Box>
                </GlassCard>
              </div>
            </Slide>

            <Slide direction="right" in timeout={1200}>
              <div>
                <GlassCard sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: emeraldTheme.primary.dark, mb: 3 }}>
                    Quick Bill Generator
                  </Typography>

                  <form onSubmit={handleAddBillItem}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth name="patientId" label="Patient ID" value={quickBillData.patientId}
                          onChange={handleQuickBillChange} placeholder="PT-00123" size="small" required />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField fullWidth name="patientName" label="Patient Name" value={quickBillData.patientName}
                          onChange={handleQuickBillChange} placeholder="John Doe" size="small" required />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>Service</InputLabel>
                          <Select name="serviceType" value={quickBillData.serviceType} onChange={handleQuickBillChange} label="Service">
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value="consultation">Consultation</MenuItem>
                            <MenuItem value="lab_test">Lab Test</MenuItem>
                            <MenuItem value="medication">Medication</MenuItem>
                            <MenuItem value="room_charge">Room Charge</MenuItem>
                            <MenuItem value="surgery">Surgery</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField fullWidth name="amount" label="Amount ($)" type="number" value={quickBillData.amount}
                          onChange={handleQuickBillChange} placeholder="0.00" size="small" required
                          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button type="submit" variant="contained" startIcon={<AddCircleIcon />} fullWidth sx={{ height: '100%' }}>
                          Add
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth name="description" label="Description" multiline rows={2}
                          value={quickBillData.description} onChange={handleQuickBillChange}
                          placeholder="Service description..." size="small" required />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Payment Method</InputLabel>
                          <Select name="paymentMethod" value={quickBillData.paymentMethod} onChange={handleQuickBillChange} label="Payment Method">
                            <MenuItem value="">Select</MenuItem>
                            <MenuItem value="Cash">Cash</MenuItem>
                            <MenuItem value="Credit Card">Credit Card</MenuItem>
                            <MenuItem value="Insurance">Insurance</MenuItem>
                            <MenuItem value="Online Transfer">Online Transfer</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Button variant="contained" color="success" startIcon={<SaveIcon />}
                          onClick={handleGenerateBill} disabled={processingId === 'generate'} fullWidth sx={{ height: '100%' }}>
                          {processingId === 'generate' ? 'Generating...' : 'Generate Final Bill'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: emeraldTheme.primary.dark, mb: 2 }}>
                      Bill Items Preview
                    </Typography>
                    
                    <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="center"></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {billItems.map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell>{item.description}</TableCell>
                              <TableCell align="right">{item.quantity}</TableCell>
                              <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                              <TableCell align="right">{formatCurrency(item.amount * item.quantity)}</TableCell>
                              <TableCell align="center">
                                <IconButton size="small" onClick={() => handleRemoveItem(item.id)} sx={{ color: emeraldTheme.accent.red }}>
                                  <RemoveCircleIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                          {billItems.length === 0 && (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: emeraldTheme.text.secondary }}>
                              No items added yet
                            </TableCell></TableRow>
                          )}
                        </TableBody>
                        <TableHead>
                          <TableRow>
                            <TableCell colSpan={3} align="right"><strong>Total:</strong></TableCell>
                            <TableCell align="right"><strong>{formatCurrency(totalAmount)}</strong></TableCell>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                      </Table>
                    </TableContainer>
                  </Box>
                </GlassCard>
              </div>
            </Slide>
          </Grid>

          <Grid item xs={12} md={4}>
            <Slide direction="left" in timeout={1000}>
              <div>
                <GlassCard sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: emeraldTheme.primary.dark, mb: 3 }}>
                    Financial Summary
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="textSecondary">Total Bills</Typography>
                      <Chip label={summary.totalBills} size="small"
                        sx={{ bgcolor: alpha(emeraldTheme.accent.blue, 0.1), color: emeraldTheme.accent.blue, fontWeight: 600 }} />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="textSecondary">Total Collection</Typography>
                      <Chip label={formatCurrency(summary.totalCollection)} size="small"
                        sx={{ bgcolor: alpha(emeraldTheme.accent.green, 0.1), color: emeraldTheme.accent.green, fontWeight: 600 }} />
                    </Box>

                    <Divider />

                    {[
                      { icon: <CashIcon />, label: 'Cash Payments', amount: summary.cashPayments, color: emeraldTheme.accent.green },
                      { icon: <CardIcon />, label: 'Card Payments', amount: summary.cardPayments, color: emeraldTheme.accent.blue },
                      { icon: <InsuranceCardIcon />, label: 'Insurance Claims', amount: summary.insuranceClaims, color: emeraldTheme.accent.orange },
                    ].map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: item.color }}>{item.icon}</Box>
                          <Typography variant="body2">{item.label}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</Typography>
                      </Box>
                    ))}

                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="textSecondary">Outstanding Balance</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: emeraldTheme.accent.red }}>
                        {formatCurrency(summary.outstandingBalance)}
                      </Typography>
                    </Box>
                  </Stack>
                </GlassCard>
              </div>
            </Slide>

            <Slide direction="left" in timeout={1200}>
              <div>
                <GlassCard sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: emeraldTheme.primary.dark, mb: 3 }}>
                    Recent Transactions
                  </Typography>

                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
                      <TransactionItem key={transaction.id}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{transaction.patient}</Typography>
                            <Typography variant="caption" color="textSecondary">{transaction.time || 'Just now'}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            {getPaymentMethodIcon(transaction.method)}
                            <Typography variant="caption" color="textSecondary">{transaction.method || 'Cash'}</Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ ml: 'auto' }}>{transaction.billNo}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <StatusBadge
                              label={String(transaction.status || 'paid').toUpperCase()}
                              status={getStatusFromAPI(transaction.status)}
                              size="small"
                              icon={getStatusIcon(transaction.status)}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: emeraldTheme.primary.dark }}>
                              {formatCurrency(transaction.amount || 0)}
                            </Typography>
                          </Box>
                        </Box>
                      </TransactionItem>
                    )) : (
                      <Typography sx={{ textAlign: 'center', py: 2, color: emeraldTheme.text.secondary }}>
                        No recent transactions
                      </Typography>
                    )}
                  </Box>
                </GlassCard>
              </div>
            </Slide>

            <Slide direction="left" in timeout={1400}>
              <div>
                <GlassCard sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: emeraldTheme.primary.dark, mb: 3 }}>
                    Quick Actions
                  </Typography>

                  <Stack spacing={2}>
                    <Button fullWidth variant="outlined" startIcon={<SearchIcon />}
                      onClick={() => navigate('/operator/search')}
                      sx={{ justifyContent: 'flex-start', borderColor: alpha(emeraldTheme.primary.main, 0.3),
                        color: emeraldTheme.primary.dark, '&:hover': { borderColor: emeraldTheme.primary.main } }}>
                      Search Patient Bill
                    </Button>

                    <Button fullWidth variant="outlined" startIcon={<DownloadIcon />}
                      onClick={handleExportBills}
                      sx={{ justifyContent: 'flex-start', borderColor: alpha(emeraldTheme.accent.green, 0.3),
                        color: emeraldTheme.accent.green, '&:hover': { borderColor: emeraldTheme.accent.green } }}>
                      Export Bills Report
                    </Button>

                    <Button fullWidth variant="outlined" startIcon={<SendIcon />}
                      onClick={() => {
                        const overdueBills = bills.filter(b => getStatusFromAPI(b.status) === 'overdue');
                        overdueBills.forEach(bill => handleSendReminder(bill.id));
                      }}
                      sx={{ justifyContent: 'flex-start', borderColor: alpha(emeraldTheme.accent.orange, 0.3),
                        color: emeraldTheme.accent.orange, '&:hover': { borderColor: emeraldTheme.accent.orange } }}>
                      Send Payment Reminders
                    </Button>

                    <Button fullWidth variant="outlined" startIcon={<AnalyticsIcon />}
                      onClick={() => navigate('/operator/analytics')}
                      sx={{ justifyContent: 'flex-start', borderColor: alpha(emeraldTheme.accent.blue, 0.3),
                        color: emeraldTheme.accent.blue, '&:hover': { borderColor: emeraldTheme.accent.blue } }}>
                      View Analytics
                    </Button>

                    <Button fullWidth variant="outlined" startIcon={<PrintIcon />}
                      onClick={() => window.print()}
                      sx={{ justifyContent: 'flex-start', borderColor: alpha(emeraldTheme.accent.purple, 0.3),
                        color: emeraldTheme.accent.purple, '&:hover': { borderColor: emeraldTheme.accent.purple } }}>
                      Print Receipts
                    </Button>
                  </Stack>
                </GlassCard>
              </div>
            </Slide>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={newBillModal} onClose={handleCloseModal} maxWidth="md" fullWidth TransitionComponent={Zoom}>
        <DialogTitle sx={{ bgcolor: emeraldTheme.primary.main, color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Create New Bill</Typography>
            <IconButton onClick={handleCloseModal} sx={{ color: 'white' }}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" align="center" sx={{ py: 4, color: emeraldTheme.text.secondary }}>
            Full bill creation form would appear here
          </Typography>
        </DialogContent>
      </Dialog>

      <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={handleClose} TransitionComponent={Zoom}
        PaperProps={{ sx: { mt: 2, bgcolor: emeraldTheme.background.paper, border: `1px solid ${alpha(emeraldTheme.primary.main, 0.1)}`,
          borderRadius: 2, minWidth: 320 } }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(emeraldTheme.primary.main, 0.1)}` }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
        </Box>
        {notifications.map((notif) => (
          <MenuItem key={notif.id} onClick={handleClose} sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <InfoIcon fontSize="small" sx={{ color: emeraldTheme.accent.blue }} />
              <Box>
                <Typography variant="body2">{notif.message}</Typography>
                <Typography variant="caption" sx={{ color: emeraldTheme.text.disabled }}>{notif.time}</Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default OperatorDashboard;