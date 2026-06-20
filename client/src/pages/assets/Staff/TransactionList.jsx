import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Collapse,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Zoom,
  Fade,
  Slide,
  Grow,
  useTheme,
  alpha,
  Divider,
  Stack,
  Avatar,
  Menu,
  MenuItem as DropdownItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as MpesaIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  CreditCardSharp as CreditCardIcon,
  Clear as ClearIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion, AnimatePresence } from 'framer-motion';
import { OperatorService } from '../../../services/users/operator';
import { useAuth } from '../../../context/authContext';
import { formatCurrency, formatDate, formatTime } from '../../../formatters';
import { toast as useToast } from 'react-toastify';

const HeroSection = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.info.main} 100%)`,
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${alpha('#fff', 0.2)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    background: `radial-gradient(circle, ${alpha('#fff', 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const GlassSearchBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5),
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.spacing(6),
  background: `rgba(255, 255, 255, 0.9)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:focus-within': {
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
    borderColor: theme.palette.primary.main,
  },
}));

const StatsCard = styled(motion.div)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(color, 0.05)} 100%)`,
  borderRadius: theme.spacing(3),
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${alpha(color, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 20px 35px -12px ${alpha(color, 0.3)}`,
    borderColor: color,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.5)})`,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  borderRadius: 12,
  padding: '4px 8px',
  background:
    status === 'Cleared' ? alpha(theme.palette.success.main, 0.12) :
      status === 'Pending' ? alpha(theme.palette.warning.main, 0.12) :
        alpha(theme.palette.error.main, 0.12),
  color:
    status === 'Cleared' ? theme.palette.success.main :
      status === 'Pending' ? theme.palette.warning.main :
        theme.palette.error.main,
  border: `1px solid ${status === 'Cleared' ? alpha(theme.palette.success.main, 0.3) :
    status === 'Pending' ? alpha(theme.palette.warning.main, 0.3) :
      alpha(theme.palette.error.main, 0.3)
    }`,
}));

const TransactionRow = styled(motion.tr)(({ theme }) => ({
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
}));

const FilterChip = styled(Chip)(({ theme, active }) => ({
  borderRadius: 20,
  fontWeight: 500,
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  color: active ? 'white' : theme.palette.text.primary,
  border: active ? 'none' : `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.05),
  },
}));

export const TransactionList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [detailsLog, setDetailsLog] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, pageSize: 20, totalRecords: 0, has_next: false, has_previous: false });
  const [summary, setSummary] = useState({ totalAmount: 0, totalTransactions: 0, cleared_amount: 0, pending_amount: 0, overdue_amount: 0, cleared_count: 0, pending_count: 0, overdue_count: 0 });
  const [filters, setFilters] = useState({ page: 1, page_size: 20, search: '', status: '', from_date: null, to_date: null, payment_method: '', min_amount: '', max_amount: '' });

  useEffect(() => {
    fetchTransaction();
  }, [filters]);

  const fetchTransaction = async () => {
    setLoading(true);
    try {
      const response = await OperatorService.getTransactions(user?.token, filters);
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
      setSummary(response.data.summary);
    } catch (error) {
      setError(error);
      showToast('Error fetching transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, page_size: 20, search: '', status: '', from_date: null, to_date: null, payment_method: '', min_amount: '', max_amount: '' });
    setShowFilter(false);
  };

  const handleExport = async (format) => {
    try {
      const blob = await OperatorService.exportTransactions({
        token: user?.token,
        format,
        date_from: filters.date_from,
        date_to: filters.date_to,
        status: filters.status,
        payment_method: filters.payment_method,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions.${new Date().toISOString().slice(0, 15)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      showToast('Error exporting transactions', 'error');
    }
  };

  const handleViewDetails = (transaction) => {
    setTransactions(transaction);
    setDetailsLog(true);
  };

  const handleViewBill = (billId) => {
    navigate(`/operator/detail-view/${billId}`);
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Cash': return <MoneyIcon fontSize='small' />;
      case 'Credit Card': return <CreditCardIcon fontSize='small' />;
      case 'Debit Card': return <CreditCardIcon fontSize='small' />;
      case 'M-Pesa': return <MoneyIcon fontSize='small' />;
      case 'Cheque': return <BankIcon fontSize='small' />;
      case 'Insurance': return <BankIcon fontSize='small' />;
      default: return <MoneyIcon fontSize='small' />;
    }
  };

  const getPaymentColor = (method) => {
    switch (method) {
      case 'Cash': return theme.palette.success.main;
      case 'Credit Card': return theme.palette.info.main;
      case 'Debit Card': return theme.palette.info.main;
      case 'M-Pesa': return theme.palette.warning.main;
      case 'Cheque': return theme.palette.secondary.main;
      case 'Insurance': return theme.palette.primary.main;
      default: return theme.palette.grey[500];
    }
  };

  const filteredTransactions = transactions;
  const paginatedTransactions = filteredTransactions;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress size={50} thickness={4} /></Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Alert severity='error'>Error loading transactions. Please try again later.</Alert></Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: theme.palette.background.gradient, minHeight: '100vh' }}>
      <Slide direction="down" in={true} timeout={600}>
        <HeroSection>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                  Transaction History
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
                  Track and manage all financial transactions across the hospital
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<FileDownloadIcon />}
                  onClick={(e) => setExportAnchor(e.currentTarget)}
                  sx={{
                    bgcolor: alpha('#fff', 0.2),
                    '&:hover': { bgcolor: alpha('#fff', 0.3) },
                    borderRadius: 3,
                    px: 3,
                  }}
                >
                  Export Data
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </HeroSection>
      </Slide>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Revenue', value: summary.total_amount, color: theme.palette.primary.main, icon: <MoneyIcon />, trend: '+12%', count: summary.total_bills },
          { label: 'Cleared', value: summary.cleared_amount, color: theme.palette.success.main, icon: <CheckIcon />, trend: '+8%', count: summary.cleared_count },
          { label: 'Pending', value: summary.pending_amount, color: theme.palette.warning.main, icon: <ScheduleIcon />, trend: '-3%', count: summary.pending_count },
          { label: 'Overdue', value: summary.overdue_amount, color: theme.palette.error.main, icon: <WarningIcon />, trend: '+5%', count: summary.overdue_count },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <StatsCard
              color={stat.color}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: stat.color, fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {formatCurrency(stat.value)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stat.count} transactions
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color, width: 48, height: 48 }}>
                  {stat.icon}
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                {stat.trend.startsWith('+') ? (
                  <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 14, color: 'error.main' }} />
                )}
                <Typography variant="caption" color="textSecondary">
                  {stat.trend} from last month
                </Typography>
              </Box>
            </StatsCard>
          </Grid>
        ))}
      </Grid>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <GlassSearchBar elevation={0} sx={{ mb: 3 }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
          <TextField
            placeholder="Search by bill number, patient name, or amount..."
            variant="standard"
            fullWidth
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ fontSize: '1rem' }}
          />
          {filters.search && (
            <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <Divider orientation="vertical" flexItem sx={{ mx: 1.5, height: 30 }} />
          <IconButton onClick={() => setShowFilter(!showFilter)}>
            <FilterIcon />
          </IconButton>
          <IconButton onClick={fetchTransaction}>
            <RefreshIcon />
          </IconButton>
        </GlassSearchBar>

        <Collapse in={showFilter} timeout="auto" unmountOnExit>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Cleared">Cleared</MenuItem>
                    <MenuItem value="Overdue">Overdue</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={filters.payment_method}
                    onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                    label="Payment Method"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Debit Card">Debit Card</MenuItem>
                    <MenuItem value="M-Pesa">M-Pesa</MenuItem>
                    <MenuItem value="Cheque">Cheque</MenuItem>
                    <MenuItem value="Insurance">Insurance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="From Date"
                    value={filters.date_from}
                    onChange={(date) => handleFilterChange('date_from', date)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="To Date"
                    value={filters.date_to}
                    onChange={(date) => handleFilterChange('date_to', date)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Min Amount"
                  type="number"
                  value={filters.min_amount}
                  onChange={(e) => handleFilterChange('min_amount', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Max Amount"
                  type="number"
                  value={filters.max_amount}
                  onChange={(e) => handleFilterChange('max_amount', e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />}>
                  Clear All
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </motion.div>

      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="All Transactions" />
        <Tab label="Cleared" />
        <Tab label="Pending" />
        <Tab label="Overdue" />
      </Tabs>

      <AnimatePresence mode="wait">
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[3] }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <TableCell sx={{ fontWeight: 700 }}>Bill No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((tx, idx) => (
                    <TransactionRow
                      key={tx.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => handleViewDetails(tx)}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {tx.billNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1), fontSize: '0.875rem' }}>
                            {tx.patientName?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">{tx.patientName}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(tx.created_at)}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatTime(tx.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(tx.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getPaymentIcon(tx.payment_method)}
                          label={tx.payment_method || '—'}
                          size="small"
                          sx={{
                            bgcolor: alpha(getPaymentColor(tx.payment_method), 0.1),
                            color: getPaymentColor(tx.payment_method),
                            '& .MuiChip-icon': { color: 'inherit' },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={tx.payment_status}
                          status={tx.payment_status}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View Bill" TransitionComponent={Zoom}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewBill(tx.id);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print Receipt" TransitionComponent={Zoom}>
                            <IconButton
                              size="small"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TransactionRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <MoneyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="textSecondary">No transactions found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handleFilterChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Paper>
      </AnimatePresence>

      <Menu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={() => setExportAnchor(null)}
        PaperProps={{ sx: { minWidth: 180, borderRadius: 2 } }}
      >
        <DropdownItem onClick={() => handleExport('csv')}>
          <ListItemIcon><ExcelIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Export as CSV" />
        </DropdownItem>
      </Menu>

      <Dialog
        open={detailsLog}
        onClose={() => setDetailsLog(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
      >
        {selectedTransaction && (
          <>
            <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Transaction Details</Typography>
                <IconButton onClick={() => setDetailsLog(false)} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">Bill Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{setTransactions.billNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">Patient Name</Typography>
                  <Typography variant="body1">{setTransactions.patientName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">Date & Time</Typography>
                  <Typography variant="body1">
                    {formatDate(setTransactions.created_at)} at {formatTime(setTransactions.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">Amount</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatCurrency(setTransactions.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">Payment Method</Typography>
                  <Chip
                    icon={getPaymentIcon(setTransactions.payment_method)}
                    label={setTransactions.payment_method || 'Not specified'}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">Status</Typography>
                  <StatusChip
                    label={setTransactions.payment_status}
                    status={setTransactions.payment_status}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                {setTransactions.clearance_date && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Cleared Date</Typography>
                    <Typography variant="body2">
                      {formatDate(setTransactions.clearance_date)} at {formatTime(setTransactions.clearance_date)}
                    </Typography>
                  </Grid>
                )}
                {setTransactions.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Notes</Typography>
                    <Typography variant="body2" sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), p: 1, borderRadius: 1 }}>
                      {setTransactions.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsLog(false)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  setDetailsLog(false);
                  handleViewBill(selectedTransaction.id);
                }}
              >
                View Full Bill
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};