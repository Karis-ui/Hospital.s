import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Avatar,
  Chip,
  Stack,
  Tooltip,
  Card,
  CardContent,
  styled
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Share as ShareIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckIcon,
  LocalHospital as HospitalIcon,
  QrCode as QrCodeIcon,
  MedicalServices as MedicalIcon,
  Science as LabIcon,
  Medication as MedicationIcon,
  LocalHospital as WardIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  PhoneAndroid as MpesaIcon,
  Business as InsuranceIcon,
  ReceiptLong as ReceiptLongIcon,
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

  useEffect(() => {
    fetchReceipt();
  }, [billId]);

  const fetchReceipt = async () => {
    setLoading(true);
    try {
      const response = await OperatorService.viewReceipt(billId);
      setReceipt(response.data);
    } catch (err) {
      setError('Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      const response = await OperatorService.printReceipt(billId);
      window.print();
    } catch (err) {
      alert('Failed to print receipt');
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

  const getServiceIcon = (category) => {
    switch (category) {
      case 'Consultation': return <MedicalIcon fontSize='small' />;
      case 'Lab': return <LabIcon fontSize='small' />;
      case 'Medication': return <MedicalIcon fontSize='small' />;
      case 'Ward': return <WardIcon fontSize='small' />;
      case 'Procedure': return <MedicalIcon fontSize='small' />;
      default: return <ReceiptIcon fontSize='small' />
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
        <Alert security='error'>{error}</Alert>
      </Box>
    );
  }

  const hasInsurance = receipt?.insurance && receipt.insurance.coveredAmount > 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: theme.palette.background.gradient, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, maxWidth: 800, mx: 'auto' }}>
        <IconButton onClick={() => navigate(`/bill/detailView/${billId}`)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
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
              {receipt?.hospitalInfo?.name || 'SmartCare Hospital'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {receipt?.hospitalInfo?.address}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
              Tel: {receipt?.hospitalInfo?.phone} | Email: {receipt?.hospitalInfo?.email}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Tax ID: {receipt?.hospitalInfo?.taxId} | License: {receipt?.hospitalInfo?.license}
            </Typography>
          </ReceiptHeader>

          <Box sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                PATIENT PAYMENT RECEIPT
              </Typography>
              <StatusBadge
                label={receipt?.status}
                status={receipt?.status}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Receipt Number</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{receipt?.receiptNumber}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Bill Number</Typography>
                <Typography variant="body1">{receipt?.billNumber}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Receipt Date</Typography>
                <Typography variant="body1">{formatDate(receipt?.billing?.paymentDate)} at {receipt?.billing?.paymentTime}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Generated By</Typography>
                <Typography variant="body1">{receipt?.generatedBy}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" /> PATIENT INFORMATION
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">Patient Name</Typography>
                <Typography variant="body2">{receipt?.patientName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">Patient ID</Typography>
                <Typography variant="body2">{receipt?.patientId}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">Phone</Typography>
                <Typography variant="body2">{receipt?.patientPhone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="textSecondary">Address</Typography>
                <Typography variant="body2">{receipt?.patientAddress}</Typography>
              </Grid>
            </Grid>

            {receipt?.admissionInfo && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HospitalIcon fontSize="small" /> ADMISSION INFORMATION
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Department</Typography>
                    <Typography variant="body2">{receipt?.admissionInfo?.department}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Ward/Bed</Typography>
                    <Typography variant="body2">{receipt?.admissionInfo?.ward}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Admission Date</Typography>
                    <Typography variant="body2">{formatDate(receipt?.admissionInfo?.admissionDate)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Discharge Date</Typography>
                    <Typography variant="body2">{formatDate(receipt?.admissionInfo?.dischargeDate) || 'Ongoing'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Attending Doctor</Typography>
                    <Typography variant="body2">{receipt?.admissionInfo?.attendingDoctor}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">Referring Doctor</Typography>
                    <Typography variant="body2">{receipt?.admissionInfo?.referringDoctor || 'N/A'}</Typography>
                  </Grid>
                </Grid>
              </>
            )}

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicalIcon fontSize="small" /> SERVICES & CHARGES
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                    <TableCell sx={{ fontWeight: 700 }}>Service/Item</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receipt?.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getServiceIcon(item.category)}
                          <Box>
                            <Typography variant="body2">{item.description}</Typography>
                            {item.doctor && (
                              <Typography variant="caption" color="textSecondary">
                                Dr. {item.doctor} • {formatDate(item.date)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2 }}>
              <InfoRow>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">{formatCurrency(receipt?.billing?.subtotal)}</Typography>
              </InfoRow>
              {receipt?.billing?.discount > 0 && (
                <InfoRow>
                  <Typography variant="body2">Discount</Typography>
                  <Typography variant="body2" color="success.main">-{formatCurrency(receipt?.billing?.discount)}</Typography>
                </InfoRow>
              )}
              <InfoRow>
                <Typography variant="body2">Tax (VAT)</Typography>
                <Typography variant="body2">{formatCurrency(receipt?.billing?.tax)}</Typography>
              </InfoRow>
              <InfoRow sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pt: 1 }}>
                <Typography variant="h6">TOTAL AMOUNT</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {formatCurrency(receipt?.billing?.total)}
                </Typography>
              </InfoRow>
            </Box>

            {hasInsurance && (
              <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InsuranceIcon fontSize="small" /> INSURANCE DETAILS
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Provider</Typography>
                    <Typography variant="body2">{receipt?.insurance?.provider}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Policy Number</Typography>
                    <Typography variant="body2">{receipt?.insurance?.policyNumber}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Coverage</Typography>
                    <Typography variant="body2">{receipt?.insurance?.coverage}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Covered Amount</Typography>
                    <Typography variant="body2" color="success.main">{formatCurrency(receipt?.insurance?.coveredAmount)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Patient Responsibility</Typography>
                    <Typography variant="body2" color="warning.main">{formatCurrency(receipt?.insurance?.patientResponsibility)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Claim Status</Typography>
                    <Chip label={receipt?.insurance?.claimStatus} size="small" color="info" />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon fontSize="small" /> PAYMENT DETAILS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Payment Method</Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getPaymentIcon(receipt?.billing?.paymentMethod)}
                    {receipt?.billing?.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Reference Number</Typography>
                  <Typography variant="body2">{receipt?.billing?.paymentReference}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Amount Paid</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatCurrency(receipt?.billing?.amountPaid)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Balance Due</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: receipt?.billing?.balance > 0 ? 'warning.main' : 'success.main' }}>
                    {formatCurrency(receipt?.billing?.balance || 0)}
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
                For inquiries regarding this bill, please contact Billing Department at {receipt?.hospitalInfo?.phone}
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