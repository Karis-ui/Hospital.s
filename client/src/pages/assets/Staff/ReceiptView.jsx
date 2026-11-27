import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Chip,
  Stack,
  Tooltip,
  styled
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  LocalHospital as HospitalIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as MpesaIcon,
  Business as InsuranceIcon,
  Description as DescriptionIcon,
  Verified as VerifiedIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { OperatorService } from '../../../services/users/operator';
import { formatCurrency, formatDate } from '../../../formatters';

const ReceiptContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 800,
  margin: '0 auto',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
  transition: 'all 0.3s ease',
  '@media print': {
    boxShadow: 'none',
    margin: 0,
    padding: 0,
  },
}));

const ReceiptHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: 'white',
  padding: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const ReceiptFooter = styled(Box)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.03),
  padding: theme.spacing(3),
  textAlign: 'center',
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
  '&:last-child': { borderBottom: 'none' },
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === 'Cleared' ? alpha(theme.palette.success.main, 0.1) :
      status === 'Pending' ? alpha(theme.palette.warning.main, 0.1) :
        alpha(theme.palette.error.main, 0.1),
  color:
    status === 'Cleared' ? theme.palette.success.main :
      status === 'Pending' ? theme.palette.warning.main :
        theme.palette.error.main,
  fontWeight: 600,
  borderRadius: 20,
}));

export const ReceiptView = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  const fetchReceipt = useCallback(async () => {
    if (!billId) return;
    setLoading(true);
    try {
      const response = await OperatorService.viewReceipt(billId);
      const receiptData = response.data?.data;
      if (!receiptData) {
        throw new Error('The receipt response did not contain receipt data.');
      }
      setReceipt(receiptData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load receipt');
      setReceipt(null);
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    if (!billId) {
      setError('Select a bill from Bills to view its receipt.');
      setLoading(false);
      return;
    }
    fetchReceipt();
  }, [billId, fetchReceipt]);

  const handlePrint = async () => {
    try {
      const response = await OperatorService.printReceipt(billId);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${billId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download receipt');
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Cash': return <MoneyIcon fontSize='small' />;
      case 'Credit Card': return <CardIcon fontSize='small' />;
      case 'Debit Card': return <MoneyIcon fontSize='small' />;
      case 'M-Pesa': return <MpesaIcon fontSize='small' />;
      case 'Cheque': return <BankIcon fontSize='small' />;
      case 'Insurance': return <InsuranceIcon fontSize='small' />;
      default: return <MoneyIcon fontSize='small' />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress size={60} thickness={4} /></Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
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

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: theme.palette.background.gradient, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, maxWidth: 800, mx: 'auto' }}>
        <IconButton onClick={() => navigate(`/operator/detail-view/${billId}`)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
          <ArrowBackIcon />
        </IconButton>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Print">
            <IconButton onClick={handlePrint} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ReceiptContainer id="receipt-content">
          <ReceiptHeader>
            <HospitalIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              SmartCare Hospital
            </Typography>
          </ReceiptHeader>

          <Box sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                PATIENT PAYMENT RECEIPT
              </Typography>
              <StatusBadge
                label={receipt?.status || 'Cleared'}
                status={receipt?.status}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Receipt Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{receipt?.receipt_number}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Bill Number</Typography>
                <Typography variant="body1">INV-{receipt?.bill_id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Receipt Date</Typography>
                <Typography variant="body1">{formatDate(receipt?.payment_date)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Generated By</Typography>
                <Typography variant="body1">{receipt?.processed_by}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" /> PATIENT INFORMATION
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">Patient Name</Typography>
                <Typography variant="body2">{receipt?.patient_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">Patient Email</Typography>
                <Typography variant="body2">{receipt?.patient_email || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">Phone</Typography>
                <Typography variant="body2">{receipt?.patient_phone || 'N/A'}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
              <InfoRow sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pt: 1 }}>
                <Typography variant="h6">TOTAL AMOUNT PAID</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {formatCurrency(receipt?.amount)}
                </Typography>
              </InfoRow>
            </Box>

            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon fontSize="small" /> PAYMENT DETAILS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Payment Method</Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getPaymentIcon(receipt?.payment_method)}
                    {receipt?.payment_method || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Balance Due</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatCurrency(0)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {receipt?.notes && (
              <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon fontSize="small" /> NOTES
                </Typography>
                <Typography variant="body2">{receipt?.notes}</Typography>
              </Box>
            )}

            {/* Footer */}
            <ReceiptFooter>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Thank you for choosing SmartCare Hospital
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                This is a computer-generated receipt and does not require a signature.
              </Typography>
              <Typography variant="caption" color="textSecondary" display="block">
                Bill number: INV-{receipt?.bill_id}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main">
                  Verified Payment
                </Typography>
              </Box>
            </ReceiptFooter>
          </Box>
        </ReceiptContainer>
      </motion.div>
    </Box>
  );
}