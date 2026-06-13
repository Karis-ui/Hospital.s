import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Avatar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
  Collapse,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Money as MoneyIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  QrCode as QrCodeIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Verified as VerifiedIcon,
  Fingerprint as FingerprintIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { OperatorService } from '../../../services/users/operator';
import { formatCurrency, formatDate } from '../../../formatters'; 
import { billingTheme } from '../../../theme/billingTheme';

const PaymentCard = styled(Card)(({ theme, selected }) => ({
  cursor: 'pointer',
  borderRadius: theme.spacing(2),
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const SuccessAnimation = styled(motion.div)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
});

export const ProcessPayment = ()=>{
  const {billId} = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [processing,setProcessing] = useState(true);
  const [loading,setLoading] = useState(true);
  const [bill,setBill] = useState(null);
  const [paymentMethod,setPaymentMethod] = useState('card');
  const [amountReceived,setAmountReceived] = useState('');
  const [change,setChange] = useState(0);
  const [activeStep,setActiveStep] = useState(0);
  const [error,setError] = useState('');
  const [success,setSuccess] = useState(false);
  const [receiptData,setReceiptData] = useState('');
  const [cardDetails,setCardDetails] = useState({number: '',expiry: '',cvv: ''});
  const [bankDetails,setBankDetails] = useState({account: '',bank: '',reference: ''});

  useEffect(()=>{
    fetchBillDetails();
  },[billId]);

  useEffect(()=>{
    if(amountReceived && bill){
      const received = parseFloat(amountReceived);
      const due = bill.balance || bill.amount;
      setChange(received > due ? received - due : 0);
    }
  },[amountReceived,bill]);

  const fetchBillDetails = async()=>{
    setLoading(true);
    try{
      const response = await OperatorService.getbillDetail(billId);
      setBill(response.data);
      setAmountReceived(response.data.balance?.toString() || response.data.amount.toString());
    }catch(err){
      console.error('Failed to fetch bill:',err);
      setError(err.response?.data?.message || 'Failed to load bill details');
    }finally{
      setLoading(false);
    }
  };

  const handleProcessPayment = async()=>{
    const due = bill?.balance || bill?.amount;
    const received = parseFloat(amountReceived);
    if(received < due){
      setError(`Amount received (${formatCurrency(received)}) is less than amount due (${formatCurrency(due)})`);
      console.error('Error','Insufficient amount received');
      return;
    }
    setProcessing(true);
    setError('');
    try{
      const paymentData = {
        amount_received: received,payment_method: paymentMethod,change: change,notes: `Payment processed via ${paymentMethod.toUpperCase()}`,
      };

      if (paymentMethod === 'card'){
        paymentData.card_details = {
          last_four: cardDetails.number.slice(-4),expiry: cardDetails.expiry
        };
      }else if(paymentMethod === 'bank'){
        paymentData.bank_details = {
          acccoun_last_four: bankDetails.account.slice(-4),
          bank_name: bankDetails.bank,
          reference: bankDetails.reference,
        };
      }
      const response = await OperatorService.processpayment(billId,paymentData);
      setReceiptData(response.data.receipt);
      setActiveStep(2);
      setSuccess(true);
      console.log('Success','Payment processed successfully');
    }
    catch(err){
      console.error('Payment processing failed:',err);
      setError(err.response?.data?.message || 'Payment processing failed.');
    }
    finally{
      setProcessing(false);
    }
  };

  const handlePrintReceipt = async()=>{
    try{
       const response = await OperatorService.printReceipt(billId);
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download',`receipt_${billId}.pdf`);
       document.body.appendChild(link);
       link.click();
       window.URL.revokeObjectURL(url);
       console.log('Receipt ready for printing');
    }catch(err){
      console.error('Failed to print receipt');
    }
  };

  const handleGenerateInvoice = async()=>{
    try{
       const response = await OperatorService.generateInvoice(billId);
       const url = window.URL.createObjectURL(new Blob([response.data]));
       const link = document.createElement('a');
       link.href = url;
       link.setAttribute('download',`Invoice_${billId}.pdf`);
       document.body.appendChild(link);
       link.click();
       window.URL.revokeObjectURL(url);
       console.log('Invoice ready');
    }catch(err){
      console.error('Failed to generate invoice');
    }
  };

  const steps = ['Review bill','Process Payment','Complete'];
  if(loading){
    return(
      <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}>
        <CircularProgress size={60} thickness={4}/>
      </Box>
    );
  }

  if (error && !bill) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchBillDetails}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/operator/bills')}
          sx={{ mt: 2 }}
        >
          Back to Bills
        </Button>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 8 }}>
        <SuccessAnimation
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          <Avatar sx={{ width: 100, height: 100, bgcolor: alpha(theme.palette.success.main, 0.1), mb: 3 }}>
            <CheckIcon sx={{ fontSize: 60, color: theme.palette.success.main }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, textAlign: 'center' }}>
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4, textAlign: 'center' }}>
            Payment of {formatCurrency(parseFloat(amountReceived))} has been processed successfully.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintReceipt}
              sx={{ borderRadius: 2 }}
            >
              Print Receipt
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleGenerateInvoice}
              sx={{ borderRadius: 2 }}
            >
              Generate Invoice
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/operator/dashboard')}
              sx={{ borderRadius: 2 }}
            >
              Dashboard
            </Button>
          </Box>
        </SuccessAnimation>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: theme.palette.background.gradient, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => navigate(`/operator/bills/${billId}`)} sx={{ mr: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Process Payment
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Grid item xs={12} md={5}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: theme.palette.primary.main, color: 'white', p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Bill Summary
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Bill Number</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{bill?.billNumber}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Patient</Typography>
                  <Typography variant="body1">{bill?.patientName}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Due Date</Typography>
                  <Typography variant="body1" color={bill?.status === 'overdue' ? 'error' : 'inherit'}>
                    {formatDate(bill?.dueDate)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Total Amount</Typography>
                  <Typography variant="body2">{formatCurrency(bill?.total)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Paid Amount</Typography>
                  <Typography variant="body2" color="success.main">{formatCurrency(bill?.paidAmount)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Balance Due</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.warning.main }}>
                    {formatCurrency(bill?.balance)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(bill?.paidAmount / bill?.total) * 100}
                  sx={{ mt: 2, height: 6, borderRadius: 3 }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={7}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Payment Details
              </Typography>

              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel component="legend">Select Payment Method</FormLabel>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {[
                    { value: 'card', label: 'Credit/Debit Card', icon: <CardIcon />, color: theme.palette.info.main },
                    { value: 'cash', label: 'Cash', icon: <MoneyIcon />, color: theme.palette.success.main },
                    { value: 'bank', label: 'Bank Transfer', icon: <BankIcon />, color: theme.palette.warning.main },
                  ].map((method) => (
                    <Grid item xs={12} sm={4} key={method.value}>
                      <PaymentCard
                        selected={paymentMethod === method.value}
                        onClick={() => setPaymentMethod(method.value)}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: alpha(method.color, 0.1), color: method.color }}>
                            {method.icon}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{method.label}</Typography>
                        </CardContent>
                      </PaymentCard>
                    </Grid>
                  ))}
                </Grid>
              </FormControl>

              <TextField
                fullWidth
                label="Amount Received"
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ mb: 2 }}
                helperText={`Amount due: ${formatCurrency(bill?.balance)}`}
              />

              {change > 0 && (
                <Fade in={change > 0}>
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    Change to return: <strong>{formatCurrency(change)}</strong>
                  </Alert>
                </Fade>
              )}

              <Collapse in={paymentMethod === 'card'}>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    placeholder="**** **** **** ****"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Expiry Date"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="CVV"
                        placeholder="***"
                        type="password"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <SecurityIcon sx={{ fontSize: 14, color: 'success.main' }} />
                    <Typography variant="caption" color="textSecondary">
                      Your payment is secure and encrypted
                    </Typography>
                  </Box>
                </Box>
              </Collapse>

              {/* Bank Details */}
              <Collapse in={paymentMethod === 'bank'}>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    value={bankDetails.account}
                    onChange={(e) => setBankDetails({ ...bankDetails, account: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Bank Name"
                    value={bankDetails.bank}
                    onChange={(e) => setBankDetails({ ...bankDetails, bank: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Reference Number"
                    placeholder="Optional"
                    value={bankDetails.reference}
                    onChange={(e) => setBankDetails({ ...bankDetails, reference: e.target.value })}
                  />
                </Box>
              </Collapse>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={processing ? <CircularProgress size={24} /> : <PaymentIcon />}
                onClick={handleProcessPayment}
                disabled={processing || !amountReceived}
                sx={{
                  mt: 3,
                  py: 1.5,
                  background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                  borderRadius: 2,
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                {processing ? 'Processing...' : 'Process Payment'}
              </Button>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};