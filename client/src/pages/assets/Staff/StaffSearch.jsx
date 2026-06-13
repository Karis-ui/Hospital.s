import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { OperatorService } from '../../../services/users/operator';
import { formatCurrency, formatDate, getInitials } from '../../../formatters';
import {toast as useToast} from 'react-toastify';

const StafffSearch = ()=>{
    const [bill,setBill] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const {showToast} = useToast();
    const [loading,setLoading] = useState(true);
    const query = new URLSearchParams(location.search).get('q') || '';
    const [tabValue,setTabValue] = useState(0);
    const [results,setResults] = useState({patients: [],bills: []});
    const [searchTerm,setSearchTerm] = useState(query);
    const [error,setError] = useState('');
    const [page,setPage] = useState(1);
    const rowsPerPage = 5;

    useEffect(()=>{
        if(searchTerm){
            performSearch();
        }
    },[searchTerm]);

    const performSearch = async()=>{
        setLoading(true);
        try{
            const response = await OperatorService.searchStaff(searchTerm);
            setResults({
                patients: response.data.results?.patients || [],
                bills: response.data.results?.bills || [],
            });
            setError('');
        }catch(err){
            console.error('Search failed:',err);
            setError('Search failed.Try again.');
        }finally{
            setLoading(false);
        }
    };

    const handleSearch = (patientId)=>{
        navigate(`/operator/${patientId}/bills`);
    };

    const handleviewBill = (billId)=>{
        navigate(`/bill/detailView/${billId}`);
    };

    const handleProcessPayment = (billId)=>{
        navigate(`/process/payment/${billId}`);
    };

    const handleCreateBill = (patientId)=>{
        navigate(`/create/bills/create?patient=${patientId}`);
    };

    const paginatedPatients = results.patients.slice((page-1) * rowsPerPage,page*rowsPerPage);
    const paginatedBills = results.bills.slice((page-1) * rowsPerPage,page * rowsPerPage);
    const totalPatients = results.patients.length;
    const totalBills = results.bills.length;
    const totalResults = totalPatients + totalBills;

    if(loading){
        return(
            <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><CircularProgress size={60} thickness={4}/></Box>
        );
    }

    return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: theme.palette.background.gradient, minHeight: '100vh' }}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <form onSubmit={handleSearch}>
          <TextField
            fullWidth
            placeholder="Search by patient name, ID, phone, bill number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="large"
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              endAdornment: searchTerm && (
                <IconButton onClick={() => setSearchTerm('')}>
                  <CloseIcon />
                </IconButton>
              ),
            }}
          />
        </form>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Search Results for "{searchTerm}"
        </Typography>
        <Chip 
          label={`${totalResults} result${totalResults !== 1 ? 's' : ''}`} 
          color="primary" 
          variant="outlined"
        />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {totalResults === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <SearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>No results found</Typography>
          <Typography color="textSecondary">Try different keywords or check your spelling</Typography>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}
          >
            <Tab label={`Patients (${totalPatients})`} />
            <Tab label={`Bills (${totalBills})`} />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
              {paginatedPatients.map((patient, idx) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card sx={{ mb: 2, borderRadius: 2, '&:hover': { boxShadow: 6 } }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={7}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main }}>
                              {getInitials(patient.first_name, patient.last_name)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {patient.first_name} {patient.last_name}
                              </Typography>
                              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                                <Typography variant="caption" color="textSecondary">
                                  <PhoneIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                  {patient.phone}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  <EmailIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                  {patient.email}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  <CalendarIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                  ID: {patient.id}
                                </Typography>
                              </Stack>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={5} sx={{ textAlign: 'right' }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              variant="contained"
                              startIcon={<ReceiptIcon />}
                              onClick={() => handleviewBill(bill.id)}
                            >
                              View Bills
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<MoneyIcon />}
                              onClick={() => handleCreateBill(patient.id)}
                            >
                              Create Bill
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {totalPatients > rowsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={Math.ceil(totalPatients / rowsPerPage)}
                    page={page}
                    onChange={(e, val) => setPage(val)}
                    color="primary"
                  />
                </Box>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              {paginatedBills.map((bill, idx) => (
                <motion.div
                  key={bill.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card sx={{ mb: 2, borderRadius: 2, '&:hover': { boxShadow: 6 } }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {bill.billNumber}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Patient: {bill.patientName}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="textSecondary">
                                Date: {formatDate(bill.date)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Due: {formatDate(bill.dueDate)}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {formatCurrency(bill.amount)}
                              </Typography>
                            </Stack>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="View Bill">
                              <IconButton onClick={() => handleviewBill(bill.id)}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            {bill.payment_status !== 'Cleared' && (
                              <Tooltip title="Process Payment">
                                <IconButton onClick={() => handleProcessPayment(bill.id)} color="success">
                                  <PaymentIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Chip
                              label={bill.payment_status || 'Pending'}
                              size="small"
                              color={
                                bill.payment_status === 'Cleared' ? 'success' :
                                bill.payment_status === 'Pending' ? 'warning' : 'error'
                              }
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {totalBills > rowsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={Math.ceil(totalBills / rowsPerPage)}
                    page={page}
                    onChange={(e, val) => setPage(val)}
                    color="primary"
                  />
                </Box>
              )}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default StafffSearch;