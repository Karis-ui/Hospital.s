import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Avatar,
  Chip,
  Fade,
  Slide,
  Zoom,
  Collapse,
  Stack,
  debounce,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Phone as PhoneIcon,
  Payment as PaymentIcon,
  Email as EmailIcon,
  ReceiptLong as ReceiptLongIcon,
  Calculate as CalculateIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Notes as NotesIcon,
  Payments as MpesaIcon,
  PaymentOutlined as CashIcon,
  PaymentSharp as CardIcon,
  PaymentRounded as BankIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { OperatorService } from '../../../services/users/operator';
import { formatCurrency } from '../../../formatters';
import { toast } from 'react-toastify';

// Styled Components
const GlassCard = styled(Paper)(({ theme }) => ({
  background: `rgba(255, 255, 255, 0.98)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
}));

const ItemCard = styled(motion.div)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[3],
  },
}));

const PaymentMethodCard = styled(Card)(({ theme, selected }) => ({
  cursor: 'pointer',
  borderRadius: theme.spacing(2),
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[5],
  },
}));

const paymentMethodIcons = {
  'Cash': <CashIcon />,
  'Credit Card': <CardIcon />,
  'Debit Card': <CardIcon />,
  'M-Pesa': <MpesaIcon />,
  'Cheque': <BankIcon />,
  'Insurance': <PaymentIcon />,
};

const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'M-Pesa', 'Cheque', 'Insurance'];

const steps = [
  { label: 'Select Patient', icon: <PersonIcon />, description: 'Search and select patient' },
  { label: 'Add Items', icon: <CartIcon />, description: 'Add services and charges' },
  { label: 'Payment & Review', icon: <PaymentIcon />, description: 'Review and create bill' },
];

export const CreateBill = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [items, setItems] = useState([
    { id: Date.now(), description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [billData, setBillData] = useState({ 
    amount: 0, 
    amount_received: 0, 
    payment_method: '', 
    notes: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const debounceSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const response = await OperatorService.searchPatients(query);
        setSearchResults(response.data.results || []);
      } catch (err) {
        console.error('Patient search failed:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debounceSearch(patientSearch);
    return () => debounceSearch.clear();
  }, [patientSearch, debounceSearch]);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
    setBillData(prev => ({ ...prev, amount: total }));
  }, [items]);

  const change = billData.amount_received - billData.amount;

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.total = (updatedItem.quantity || 0) * (updatedItem.unitPrice || 0);
        return updatedItem;
      }
      return item;
    });
    setItems(updated);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  };

  const validateForm = () => {
    if (!selectedPatient) {
      setError('Please select a patient');
      return false;
    }
    if (items.length === 0 || items.some(i => !i.description || (i.unitPrice || 0) <= 0)) {
      setError('Please add at least one valid item');
      return false;
    }
    if (calculateTotal() <= 0) {
      setError('Bill amount must be greater than 0');
      return false;
    }
    if (showPayment && !billData.payment_method) {
      setError('Please select a payment method');
      return false;
    }
    if (showPayment && billData.amount_received < billData.amount) {
      setError(`Amount received (${formatCurrency(billData.amount_received)}) is less than amount (${formatCurrency(billData.amount)})`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const payload = {
        patient_id: selectedPatient.id,
        amount: billData.amount,
        amount_received: showPayment ? billData.amount_received : billData.amount,
        payment_method: showPayment ? billData.payment_method : null,
        notes: billData.notes,
        payment_status: showPayment ? 'Cleared' : 'Pending',
        is_paid: showPayment,
        is_receipt_available: showPayment,
        clearance_date: showPayment ? new Date().toISOString() : null,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.total,
        })),
      };
      
      const response = await OperatorService.createBill(payload);
      setSuccess(true);
      toast.success(`Bill ${showPayment ? 'Created and paid' : 'Created'} successfully`);
      
      setTimeout(() => {
        navigate(`/operator/bills/${response.data.id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to create bill:', err);
      setError(err?.response?.data?.message || 'Failed to create bill');
      toast.error('Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedPatient) {
      setError('Please select a patient');
      return;
    }
    if (activeStep === 1 && items.some(i => !i.description || (i.unitPrice || 0) <= 0)) {
      setError('Please add valid items');
      return;
    }
    setActiveStep(prev => prev + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <TextField
              fullWidth
              placeholder="Search by patient name, phone, or email..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                endAdornment: searching && <CircularProgress size={20} />,
              }}
              sx={{ mb: 2 }}
            />

            {searchResults.length > 0 && !selectedPatient && (
              <Paper sx={{ maxHeight: 300, overflow: 'auto', borderRadius: 2 }}>
                {searchResults.map((patient) => (
                  <Box
                    key={patient.id}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                    }}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setPatientSearch('');
                      setSearchResults([]);
                    }}
                  >
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {patient.first_name} {patient.last_name}
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="caption" color="textSecondary">
                          <PhoneIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                          {patient.phone || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          <EmailIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                          {patient.email || 'N/A'}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Paper>
            )}

            {selectedPatient && (
              <Fade in={!!selectedPatient}>
                <Card sx={{ mt: 2, bgcolor: alpha(theme.palette.success.main, 0.05), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                        <CheckIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {selectedPatient.first_name} {selectedPatient.last_name}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption" color="textSecondary">
                            <PhoneIcon sx={{ fontSize: 12, mr: 0.5 }} />
                            {selectedPatient.phone || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            <EmailIcon sx={{ fontSize: 12, mr: 0.5 }} />
                            {selectedPatient.email || 'N/A'}
                          </Typography>
                        </Stack>
                      </Box>
                      <IconButton size="small" onClick={() => setSelectedPatient(null)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Bill Items
              </Typography>
              <AnimatePresence>
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={5}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          InputProps={{
                            startAdornment: <InputAdornment position="start"><ReceiptIcon fontSize="small" /></InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6} md={2}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                          inputProps={{ min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={6} md={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(item.total || 0)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length === 1}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </ItemCard>
                ))}
              </AnimatePresence>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Add Item
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Additional Information
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Notes"
              multiline
              rows={3}
              value={billData.notes}
              onChange={(e) => setBillData({ ...billData, notes: e.target.value })}
              placeholder="Additional notes or instructions..."
              InputProps={{
                startAdornment: <InputAdornment position="start"><NotesIcon fontSize="small" /></InputAdornment>,
              }}
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <GlassCard sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Bill Summary
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedPatient?.first_name} {selectedPatient?.last_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {selectedPatient?.phone || 'N/A'} • {selectedPatient?.email || 'N/A'}
                  </Typography>
                </Box>
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.description || '—'}</TableCell>
                        <TableCell align="center">{item.quantity || 0}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice || 0)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total || 0)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 800, fontSize: '1rem' }}>Total Amount</TableCell>
                      <TableCell align="right">
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {formatCurrency(billData.amount || 0)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Payment Information
                  </Typography>
                  <Button
                    size="small"
                    variant={showPayment ? 'contained' : 'outlined'}
                    onClick={() => setShowPayment(!showPayment)}
                  >
                    {showPayment ? 'Record Payment' : 'Mark as Paid Now'}
                  </Button>
                </Box>

                {showPayment ? (
                  <>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Payment Method
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {paymentMethods.map((method) => (
                        <Grid item xs={6} sm={4} md={3} key={method}>
                          <PaymentMethodCard
                            selected={billData.payment_method === method}
                            onClick={() => setBillData({ ...billData, payment_method: method })}
                          >
                            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                              <Avatar sx={{ mx: 'auto', mb: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 32, height: 32 }}>
                                {paymentMethodIcons[method]}
                              </Avatar>
                              <Typography variant="caption">{method}</Typography>
                            </CardContent>
                          </PaymentMethodCard>
                        </Grid>
                      ))}
                    </Grid>

                    <TextField
                      fullWidth
                      size="small"
                      label="Amount Received"
                      type="number"
                      value={billData.amount_received}
                      onChange={(e) => setBillData({ ...billData, amount_received: parseFloat(e.target.value) || 0 })}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      helperText={`Bill Amount: ${formatCurrency(billData.amount)}`}
                      sx={{ mb: 2 }}
                    />

                    {change > 0 && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Change to return: <strong>{formatCurrency(change)}</strong>
                      </Alert>
                    )}
                  </>
                ) : (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    This bill will be marked as <strong>Pending</strong>. Payment can be collected later.
                  </Alert>
                )}

                {billData.notes && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'info.main' }}>
                      Notes
                    </Typography>
                    <Typography variant="body2">{billData.notes}</Typography>
                  </Box>
                )}
              </Box>
            </GlassCard>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate('/operator/bills')} sx={{ mr: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Create New Bill
        </Typography>
      </Box>

      <Collapse in={success}>
        <Alert
          icon={<CheckIcon fontSize="inherit" />}
          severity="success"
          sx={{ mb: 3, borderRadius: 2 }}
        >
          Bill created successfully! Redirecting...
        </Alert>
      </Collapse>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              StepIconComponent={() => (
                <Avatar
                  sx={{
                    bgcolor: activeStep >= index ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.2),
                    color: activeStep >= index ? 'white' : theme.palette.text.secondary,
                    width: 32,
                    height: 32,
                  }}
                >
                  {activeStep > index ? <CheckIcon fontSize="small" /> : step.icon}
                </Avatar>
              )}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {step.label}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {step.description}
              </Typography>
            </StepLabel>
            <StepContent>
              <Box sx={{ ml: 2 }}>
                {getStepContent(index)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    sx={{ borderRadius: 2 }}
                  >
                    Back
                  </Button>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleSubmit}
                      disabled={loading}
                      sx={{
                        background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                        borderRadius: 2,
                        px: 4,
                      }}
                    >
                      {loading ? 'Creating...' : 'Create Bill'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ borderRadius: 2, px: 4 }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default CreateBill;