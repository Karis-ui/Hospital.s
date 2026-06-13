import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  alpha,
  Avatar,
  Divider,
  Stack,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
  Fade,
  Slide,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  ReceiptLong as ReceiptLongIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { OperatorService } from '../../../services/users/operator';
import { formatCurrency, formatDate } from '../../../formatters';
import {toast} from 'react-toastify';
import { tr } from 'date-fns/locale';

export const BillingHistory = ()=>{
    const {patientId} = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const {showToast} = toast();
    const [patient,setPatient] = useState(null);
    const [loading,setLoading] = useState(true);
    const [tabValue,setTabValue] = useState(0);
    const [bills,setBills] = useState([]);
    const [summary,setSummary] = useState({total: 0,paid: 0,pending: 0,overdue: 0});

    useEffect(()=>{
        fetchData();
    },[patientId]);

    const fetchData = async()=>{
        setLoading(true);
        try{
            const patientRes = await OperatorService.searchStaff(patientId);
            const patientData = patientRes.data.results?.patients?.find(p => p.id == patientId);
            setPatient(patientData);
            const billRes = await OperatorService.getbillDetail(patientId);
            setBills(billRes.data || []);

            const total = billRes.data.reduce((s,b) =>s + b.amount,0);
            const paid = billRes.data.filter(b => b.payment_status === 'Cleared').reduce((s,b)=> s+b.amount,0);
            const pending = billRes.data.filter(b => b.payment_status === 'Pending').reduce((s,b)=> s+b.amount,0);
            const overdue = billRes.data.filter(b => b.payment_status === 'Overdue').reduce((s,b)=> s+b.amount,0);
            setSummary({total,paid,pending,overdue});
        }catch(err){
            console.error('Failed to fetch data:',err);
            toast.error('Failed to load patient data.');
            setPatient(mockPatient);
            setBills(mockBills);
            setSummary({total: 3750,paid: 1250,pending: 1500,overdue: 1000});
        }finally{
            setLoading(true);
        }
    };
    
    const handleViewBill = (billId) =>{
        navigate(`/bill/detailView/${billId}`);
    };

    const handleProcessPayment = (billId)=>{
        navigate(`/process/payment/${billId}`);
    };

    const handleCreateBill = ()=>{
        navigate(`/create/bill/patient=${patientId}`);
    };

    const filteredBills = tabValue === 0 ? bills : bills.filter(b => {
        if(tabValue === 1) return b.payment_status === 'Pending';
        if(tabValue === 2) return b.payment_status === 'Cleared';
        if(tabValue === 3) return b.payment_status === 'Pending';
        return true;
    });

    const mockPatient = {
      id: 1377,
      first_name: 'John',
      last_name: 'Doe',
      phone: '+254-704261390',
      email: 'john.doe@email.com',
      address: '123 Main St, Nyayo State',
      memberSince: new Date(2023, 0, 15),
    };

    const mockBills = [
      { id: 1, billNumber: 'INV-2024-00124', date: new Date(), amount: 1250, payment_status: 'Pending', dueDate: new Date(Date.now() + 7 * 86400000) },
      { id: 2, billNumber: 'INV-2024-00123', date: new Date(Date.now() - 30 * 86400000), amount: 350, payment_status: 'Cleared', dueDate: new Date(Date.now() - 30 * 86400000) },
      { id: 3, billNumber: 'INV-2024-00122', date: new Date(Date.now() - 15 * 86400000), amount: 2150, payment_status: 'Overdue', dueDate: new Date(Date.now() - 15 * 86400000) },
      { id: 4, billNumber: 'INV-2024-00121', date: new Date(), amount: 3750, payment_status: 'Pending', dueDate: new Date(Date.now() + 14 * 86400000) },
    ];

    if(loading){
        return(
            <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><CircularProgress size={60} thickness={4}/></Box>
        );
    }
    
    return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: theme.palette.background.gradient, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/operator/patients')} sx={{ mr: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Billing History
        </Typography>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ borderRadius: 3, mb: 3, overflow: 'visible' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: theme.palette.primary.main, fontSize: '2rem' }}>
                    {patient?.first_name?.charAt(0)}{patient?.last_name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {patient?.first_name} {patient?.last_name}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
                      <Chip icon={<PhoneIcon />} label={patient?.phone} size="small" />
                      <Chip icon={<EmailIcon />} label={patient?.email} size="small" />
                      <Chip icon={<CalendarIcon />} label={`Patient since ${formatDate(patient?.memberSince)}`} size="small" />
                    </Stack>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  startIcon={<ReceiptIcon />}
                  onClick={handleCreateBill}
                  sx={{ borderRadius: 2 }}
                >
                  Create New Bill
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { label: 'Total Billed', value: summary.total, color: theme.palette.primary.main, icon: <MoneyIcon />, trend: '+12%' },
          { label: 'Paid', value: summary.paid, color: theme.palette.success.main, icon: <CheckIcon />, trend: '+8%' },
          { label: 'Pending', value: summary.pending, color: theme.palette.warning.main, icon: <ScheduleIcon />, trend: '-3%' },
          { label: 'Overdue', value: summary.overdue, color: theme.palette.error.main, icon: <WarningIcon />, trend: '+5%' },
        ].map((stat, idx) => (
          <Grid item xs={6} sm={3} key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card sx={{ borderRadius: 3, bgcolor: alpha(stat.color, 0.05), borderLeft: `4px solid ${stat.color}` }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">{stat.label}</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>
                        {formatCurrency(stat.value)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        {stat.trend.startsWith('+') ? (
                          <TrendingUpIcon sx={{ fontSize: 12, color: 'success.main' }} />
                        ) : (
                          <TrendingDownIcon sx={{ fontSize: 12, color: 'error.main' }} />
                        )}
                        <Typography variant="caption" color="textSecondary">{stat.trend}</Typography>
                      </Box>
                    </Box>
                    <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color }}>
                      {stat.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
        >
          <Tab label="All Bills" />
          <Tab label="Pending" />
          <Tab label="Paid" />
          <Tab label="Overdue" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <TableCell sx={{ fontWeight: 700 }}>Bill No.</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBills.map((bill, idx) => (
                <motion.tr
                  key={bill.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {bill.billNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(bill.date)}</TableCell>
                  <TableCell align="right">{formatCurrency(bill.amount)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color={bill.payment_status === 'Overdue' ? 'error' : 'textSecondary'}>
                      {formatDate(bill.dueDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bill.payment_status}
                      size="small"
                      color={
                        bill.payment_status === 'Cleared' ? 'success' :
                        bill.payment_status === 'Pending' ? 'warning' : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="View Bill">
                        <IconButton size="small" onClick={() => handleViewBill(bill.id)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {bill.payment_status !== 'Cleared' && (
                        <Tooltip title="Process Payment">
                          <IconButton size="small" onClick={() => handleProcessPayment(bill.id)} color="success">
                            <PaymentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Print">
                        <IconButton size="small">
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredBills.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <ReceiptIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="textSecondary">No bills found</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};