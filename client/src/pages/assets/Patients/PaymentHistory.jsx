import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
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
  InputAdornment, styled, Select, MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Pagination,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as MoneyIcon,
  LocalHospital as InsuranceIcon,
  AccountBalance as BankIcon,
  Warning as WarningIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';
import PatientService from '../../../services/users/patient';
import { formatDate, formatCurrency } from '../../../formatters';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subMonths } from 'date-fns';

const StatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  borderRadius: theme.spacing(2),
}));

export const PaymentHistory = () => {
  const id = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    averagePayment: 0,
    mostUsedMethod: '',
    paymentByMethod: {},
    monthlyTotal: 0,
  });
  const [searchTerm, setSearchTrem] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: subMonths(new Date(), 6),
    end: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [paginatedPayments, setPaginatedPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [payments, searchTerm, methodFilter, dateRange, statusFilter, sortBy]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await PatientService.paymentHistory();
      setPayments(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch payments: ', err);
      setError('Failed to fetch payment history.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.amount?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      switch (sortBy) {
        case 'date_desc':
          return dateB - dateA;
        case 'date_asc':
          return dateA - dateB;
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        default:
          return dateB - dateB;
      }
    });

    setFilteredPayments(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setPage(1);
  };

  const calculateStats = () => {
    const total = filteredPayments.length;
    const amount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const byMethod = {};
    filteredPayments.forEach(p => {
      byMethod[p.method] = (byMethod[p.method] || 0) + p.amount;
    });

    let mostUsed = '';
    let maxCount = 0;
    const methodCount = {};
    filteredPayments.forEach(p => {
      methodCount[p.method] = (methodCount[p.method] || 0) + 1;
      if (methodCount[p.method] > maxCount) {
        maxCount = methodCount[p.method];
        mostUsed = p.method;
      }
    });

    const monthly = filteredPayments.filter(p => {
      const paymentDate = new Date(p.date);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + p.amount, 0);

    setStats({
      totalPayments: total,
      totalAmount: amount,
      averagePayment: total > 0 ? amount / total : 0,
      mostUsedMethod: mostUsed,
      paymentByMethod: byMethod,
      monthlyTotal: monthly,
    });
  };

  const handleViewBil = () => {
    navigate('/patient/bills');
  };
  const handleDownloadInvoice = async () => {
    try {
      const response = await PatientService.downloadInvoice();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill_${id}.pdf`);
      document.baseURI.appendChild(link);
      toast.success('Bill downloaded successfully');
    } catch (err) {
      toast.error('Failed to downlaod invoice.Try again!');
    }
  };

  const PaginatedPayments = filteredPayments.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  if (loading) {
    return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Payment History
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track all your payments and transactions
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchPayments}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Payments
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.totalPayments}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Lifetime transactions
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {formatCurrency(stats.totalAmount)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sum of all payments
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Payment
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency(stats.averagePayment)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Per transaction
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                This Month
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {formatCurrency(stats.monthlyTotal)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {new Date().toLocaleString('default', { month: 'long' })}
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by bill number, description..."
              value={searchTerm}
              onChange={(e) => setSearchTrem(e.target.value)}
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
              <InputLabel>Method</InputLabel>
              <Select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                label="Method"
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Debit Card">Debit Card</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Insurance">Insurance</MenuItem>
              </Select>
            </FormControl>
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
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From"
                value={dateRange.start}
                onChange={(date) => setDateRange({ ...dateRange, start: date })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="To"
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
              <MenuItem value="date_desc">Newest First</MenuItem>
              <MenuItem value="date_asc">Oldest First</MenuItem>
              <MenuItem value="amount_desc">Highest Amount</MenuItem>
              <MenuItem value="amount_asc">Lowest Amount</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <IconButton onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}>
              {viewMode === 'table' ? <PieChartIcon /> : <TimelineIcon />}
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {filteredPayments.length > 0 ? (
        <Box>
          {viewMode === 'table' ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Bill #</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPayments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {payment.billNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{payment.description}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {payment.method === 'Credit Card' && <CreditCardIcon fontSize="small" color="primary" />}
                          {payment.method === 'Bank Transfer' && <BankIcon fontSize="small" color="primary" />}
                          {payment.method === 'Insurance' && <InsuranceIcon fontSize="small" color="primary" />}
                          {payment.method === 'Cash' && <MoneyIcon fontSize="small" color="primary" />}
                          <Typography variant="body2">{payment.method}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          size="small"
                          color={payment.status === 'completed' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="textSecondary">
                          {payment.reference}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View Bill">
                            <IconButton
                              size="small"
                              onClick={() => handleViewBil(payment.billId)}
                            >
                              <ReceiptIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download Invoice">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadInvoice(payment.id)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Grid container spacing={2}>
              {PaginatedPayments.map((payment) => (
                <Grid item xs={12} md={6} key={payment.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {formatDate(payment.date)}
                        </Typography>
                        <Chip
                          label={payment.status}
                          size="small"
                          color={payment.status === 'completed' ? 'success' : 'warning'}
                        />
                      </Box>

                      <Typography variant="h6" gutterBottom>
                        {formatCurrency(payment.amount)}
                      </Typography>

                      <Typography variant="body2" gutterBottom>
                        {payment.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        {payment.method === 'Credit Card' && <CreditCardIcon fontSize="small" color="primary" />}
                        <Typography variant="caption" color="textSecondary">
                          {payment.method} • {payment.billNumber}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                          size="small"
                          startIcon={<ReceiptIcon />}
                          onClick={() => handleViewBil(payment.billId)}
                        >
                          View Bill
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownloadInvoice(payment.id)}
                        >
                          Invoice
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <HistoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Payment History
          </Typography>
          <Typography color="textSecondary">
            You haven't made any payments yet
          </Typography>
        </Paper>
      )}
    </Box>
  );
};