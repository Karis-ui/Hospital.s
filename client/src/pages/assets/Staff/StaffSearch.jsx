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
  Stack,
  Tooltip,
  TextField,
  InputAdornment,
  Pagination,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Payment as PaymentIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { OperatorService } from '../../../services/users/operator';
import { formatCurrency, formatDate, getInitials } from '../../../formatters';
import { toast } from 'react-toastify';

const StaffSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [results, setResults] = useState({ patients: [], bills: [] });
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    if (searchTerm) {
      performSearch();
    }
  }, [searchTerm]);

  const performSearch = async (query) => {
    if (!query) {
      setResults({ patients: [], bills: [] });
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await OperatorService.searchStaff(query);
      setResults({
        patients: response.data.results?.patients || [],
        bills: response.data.results?.bills || [],
      });
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchTerm.trim()){
      performSearch(searchTerm);
    }
  };

  const handleViewBill = (billId) => {
    navigate(`/operator/detail-view/${billId}`);
  };

  const handleProcessPayment = (billId) => {
    navigate(`/operator/process-payment/${billId}`);
  };

  const handleCreateBill = (patientId) => {
    navigate(`/operator/create?patient=${patientId}`);
  };

  const handleViewPatientBills = (patientId) => {
    navigate(`/operator/history/billing/${patientId}`);
  };

  const paginatedPatients = results.patients.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const paginatedBills = results.bills.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPatients = results.patients.length;
  const totalBills = results.bills.length;
  const totalResults = totalPatients + totalBills;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh' }}>
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
          {searchTerm ? `Search Results for "${searchTerm}"` : 'Search Patients & Bills'}
        </Typography>
        {searchTerm && (
          <Chip
            label={`${totalResults} result${totalResults !== 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!searchTerm ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <SearchIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Search for Patients or Bills</Typography>
          <Typography color="textSecondary">Enter a name, ID, phone number, or bill number</Typography>
        </Paper>
      ) : totalResults === 0 ? (
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
                            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                              {getInitials(patient.first_name, patient.last_name)}
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {patient.first_name} {patient.last_name}
                              </Typography>
                              <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
                                <Typography variant="caption" color="textSecondary">
                                  <PhoneIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                  {patient.phone || 'N/A'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  <EmailIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                  {patient.email || 'N/A'}
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
                          <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                            <Button
                              variant="contained"
                              startIcon={<ReceiptIcon />}
                              onClick={() => handleViewPatientBills(patient.id)}
                              size="small"
                            >
                              View Bills
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<MoneyIcon />}
                              onClick={() => handleCreateBill(patient.id)}
                              size="small"
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
                              {bill.billNumber || `INV-${bill.id}`}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Patient: {bill.patientName || 'N/A'}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }} flexWrap="wrap">
                              <Typography variant="caption" color="textSecondary">
                                Date: {formatDate(bill.created_at)}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Due: {formatDate(bill.due_date)}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {formatCurrency(bill.amount || 0)}
                              </Typography>
                            </Stack>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                            <Tooltip title="View Bill">
                              <IconButton onClick={() => handleViewBill(bill.id)}>
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

export default StaffSearch;