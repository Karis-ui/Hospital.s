import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Alert,
  CircularProgress,
  Fade,
  Grow,
  Zoom,
  alpha,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Skeleton,
  Slide,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Money as MoneyIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ReceiptLong as ReceiptLongIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/authContext';
import { OperatorService } from '../../../services/users/operator';
import { formatCurrency, formatDate } from '../../../formatters';
import { toast } from 'react-toastify';

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
    width: 300,
    height: 300,
    background: `radial-gradient(circle, ${alpha('#fff', 0.2)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${alpha('#fff', 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
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
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 35px -12px ${alpha(color, 0.4)}`,
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

const BillCard = styled(motion.div)(({ theme, status }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderLeft: `6px solid ${
    status === 'paid' ? theme.palette.success.main :
    status === 'pending' ? theme.palette.warning.main :
    theme.palette.error.main
  }`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 700,
  borderRadius: 12,
  padding: '4px 8px',
  background: status === 'paid' ? alpha(theme.palette.success.main, 0.12) :
    status === 'pending' ? alpha(theme.palette.warning.main, 0.12) :
      alpha(theme.palette.error.main, 0.12),
  color: status === 'paid' ? theme.palette.success.main :
    status === 'pending' ? theme.palette.warning.main :
      theme.palette.error.main,
  border: `1px solid ${status === 'paid' ? alpha(theme.palette.success.main, 0.3) :
    status === 'pending' ? alpha(theme.palette.warning.main, 0.3) :
      alpha(theme.palette.error.main, 0.3)}`,
  '& .MuiChip-icon': {
    color: 'inherit',
  },
}));

const PremiumButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  padding: '10px 28px',
  fontWeight: 700,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
  color: 'white',
  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ViewListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const BillList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [selectedBill, setSelectedBill] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    paid: 0,
    paidAmount: 0,
    pending: 0,
    pendingAmount: 0,
    overdue: 0,
    overdueAmount: 0,
  });

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    filterBills();
    calculateStats();
  }, [bills, searchTerm, statusFilter]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await OperatorService.getBills();
      setBills(response.data || []);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
      toast.error('Failed to load bills');
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    let filtered = [...bills];
    if (searchTerm) {
      filtered = filtered.filter(b =>
        (b.billNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.patientName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    setFilteredBills(filtered);
    setPage(1);
  };

  const calculateStats = () => {
    const total = filteredBills.length;
    const totalAmount = filteredBills.reduce((s, b) => s + (b.amount || 0), 0);
    const paid = filteredBills.filter(b => b.status === 'paid').length;
    const paidAmount = filteredBills.filter(b => b.status === 'paid').reduce((s, b) => s + (b.amount || 0), 0);
    const pending = filteredBills.filter(b => b.status === 'pending').length;
    const pendingAmount = filteredBills.filter(b => b.status === 'pending').reduce((s, b) => s + (b.amount || 0), 0);
    const overdue = filteredBills.filter(b => b.status === 'overdue').length;
    const overdueAmount = filteredBills.filter(b => b.status === 'overdue').reduce((s, b) => s + (b.amount || 0), 0);
    setStats({ total, totalAmount, paid, paidAmount, pending, pendingAmount, overdue, overdueAmount });
  };

  const handleViewBill = (billId) => {
    navigate(`/operator/detail-view/${billId}`);
  };

  const handleProcessPayment = (billId) => {
    navigate(`/operator/process-payment/${billId}`);
  };

  const handlePrintReceipt = async (bill) => {
    try {
      const response = await OperatorService.printReceipt(bill.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt_${bill.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded successfully');
    } catch (err) {
      console.error('Failed to print receipt:', err);
      toast.error('Failed to print receipt');
    }
  };

  const handleSendReminder = async (billId) => {
    try {
      await OperatorService.sendReminder(billId);
      toast.success('Reminder sent successfully');
    } catch (err) {
      console.error('Failed to send reminder:', err);
      toast.error('Failed to send reminder');
    }
  };

  const handleMenuOpen = (event, bill) => {
    setAnchorEl(event.currentTarget);
    setSelectedBill(bill);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBill(null);
  };

  const paginatedBills = filteredBills.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh' }}>
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
                  Billing Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
                  Manage invoices, track payments, and analyze revenue in one powerful dashboard.
                </Typography>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <PremiumButton
                  size="large"
                  startIcon={<ReceiptLongIcon />}
                  onClick={() => navigate('/operator/create')}
                >
                  Create New Bill
                </PremiumButton>
              </motion.div>
            </Grid>
          </Grid>
        </HeroSection>
      </Slide>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Bills', value: stats.total, amount: stats.totalAmount, icon: <ReceiptIcon />, color: theme.palette.info.main },
          { label: 'Paid', value: stats.paid, amount: stats.paidAmount, icon: <CheckIcon />, color: theme.palette.success.main },
          { label: 'Pending', value: stats.pending, amount: stats.pendingAmount, icon: <ScheduleIcon />, color: theme.palette.warning.main },
          { label: 'Overdue', value: stats.overdue, amount: stats.overdueAmount, icon: <WarningIcon />, color: theme.palette.error.main },
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
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {formatCurrency(stat.amount)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color, width: 48, height: 48 }}>
                  {stat.icon}
                </Avatar>
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
            placeholder="Search by bill number, patient name..."
            variant="standard"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ disableUnderline: true }}
          />
          {searchTerm && (
            <IconButton size="small" onClick={() => setSearchTerm('')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <Divider orientation="vertical" flexItem sx={{ mx: 1.5, height: 30 }} />
          <FormControl variant="standard" sx={{ minWidth: 140 }}>
            <InputLabel shrink>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              disableUnderline
            >
              <MenuItem value="all">All Bills</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchBills} sx={{ ml: 'auto' }}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}>
            {viewMode === 'table' ? <GridIcon /> : <ViewListIcon />}
          </IconButton>
        </GlassSearchBar>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}` }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>Bill No.</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedBills.map((bill, idx) => (
                      <motion.tr
                        key={bill.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{ transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = alpha(theme.palette.primary.main, 0.02)}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {bill.billNumber || `INV-${bill.id}`}
                          </Typography>
                        </TableCell>
                        <TableCell>{bill.patientName || 'N/A'}</TableCell>
                        <TableCell>{formatDate(bill.date)}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(bill.amount || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color={bill.status === 'overdue' ? 'error' : 'textSecondary'}>
                            {formatDate(bill.dueDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            label={bill.status ? bill.status.toUpperCase() : 'PENDING'}
                            status={bill.status || 'pending'}
                            size="small"
                            icon={bill.status === 'paid' ? <CheckIcon /> : bill.status === 'pending' ? <ScheduleIcon /> : <WarningIcon />}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="View Details" TransitionComponent={Zoom}>
                              <IconButton size="small" onClick={() => handleViewBill(bill.id)} sx={{ color: theme.palette.info.main }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {bill.status !== 'paid' && (
                              <Tooltip title="Process Payment" TransitionComponent={Zoom}>
                                <IconButton size="small" onClick={() => handleProcessPayment(bill.id)} sx={{ color: theme.palette.success.main }}>
                                  <MoneyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Print" TransitionComponent={Zoom}>
                              <IconButton size="small" onClick={() => handlePrintReceipt(bill)} sx={{ color: theme.palette.secondary.main }}>
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <IconButton size="small" onClick={(e) => handleMenuOpen(e, bill)}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Grid container spacing={2}>
              {paginatedBills.map((bill, idx) => (
                <Grid item xs={12} sm={6} md={4} key={bill.id}>
                  <BillCard
                    status={bill.status || 'pending'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {bill.billNumber || `INV-${bill.id}`}
                      </Typography>
                      <StatusBadge
                        label={bill.status ? bill.status.toUpperCase() : 'PENDING'}
                        status={bill.status || 'pending'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {bill.patientName || 'N/A'}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
                      {formatCurrency(bill.amount || 0)}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="textSecondary">Date:</Typography>
                      <Typography variant="caption">{formatDate(bill.date)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="caption" color="textSecondary">Due Date:</Typography>
                      <Typography variant="caption" color={bill.status === 'overdue' ? 'error' : 'inherit'}>
                        {formatDate(bill.dueDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewBill(bill.id)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {bill.status !== 'paid' && (
                        <Tooltip title="Process Payment">
                          <IconButton size="small" onClick={() => handleProcessPayment(bill.id)} color="success">
                            <MoneyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Print">
                        <IconButton size="small" onClick={() => handlePrintReceipt(bill)}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </BillCard>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredBills.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredBills.length / rowsPerPage)}
            page={page}
            onChange={(e, val) => setPage(val)}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 600,
              },
            }}
          />
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
      >
        <MenuItem onClick={() => { handleViewBill(selectedBill?.id); handleMenuClose(); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {selectedBill?.status !== 'paid' && (
          <MenuItem onClick={() => { handleProcessPayment(selectedBill?.id); handleMenuClose(); }}>
            <ListItemIcon><MoneyIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Process Payment</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { handlePrintReceipt(selectedBill); handleMenuClose(); }}>
          <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Print Bill</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleSendReminder(selectedBill?.id); handleMenuClose(); }}>
          <ListItemIcon><EmailIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Send Reminder</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BillList;