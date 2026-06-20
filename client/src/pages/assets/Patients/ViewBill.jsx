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
  InputAdornment,
  Grid,
  Divider,
  List,
  ListItem,
  DialogActions,
  FormControlLabel,
  ListItemText,
  LinearProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  RadioGroup,
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
  Money as InsuranceIcon,
  Warning as WarningIcon,
  Share,
  Check as CheckIcon,
  Schedule as ScheduleIcon,
  Info as InfoCard,
  ListAlt as ListItemIcon,
  Balance,
  Radio,
  Verified,
  MoneyOffRounded,
  CalendarViewDay,
  LocalHospital,
  Email,
  Person as PersonIcon,
  CreditCard as CreditCardIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';
import PatientService from '../../../services/users/patient';
import { formatDate, formatCurrency } from '../../../formatters';
import { tr } from 'date-fns/locale';
import OperatorService from '../../../services/users/operator';
import { alpha } from 'framer-motion';

export const PatientBillDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(true);
  const [error, setError] = useState('');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await PatientService.getBill();
      setBillingData(response.data);
      setError('');
    } catch (err) {
      toast.error('Failed to fetch billing data. Try again!: ', err);
      setError(err.response?.data?.message || 'Failed to fetch billing info...');
      setBillingData({
        summary: {
          total_outstanding: 3750,
          overdue_amount: 1250,
          last_paid: 1500,
          last_paid_date: '2024-03-15',
          total_billed_ytd: 12500,
          total_paid_ytd: 8750,
        },
        recent_bills: [
          {
            id: 'INV-2024-001',
            date: '2024-03-01',
            due_date: '2024-03-15',
            description: 'General Consultation - Dr. Smith',
            amount: 150,
            status: 'paid',
            paid_date: '2024-03-01',
          },
          {
            id: 'INV-2024-002',
            date: '2024-03-10',
            due_date: '2024-03-25',
            description: 'Blood Test & Lab Services',
            amount: 450,
            status: 'pending',
            paid_date: null,
          },
          {
            id: 'INV-2024-003',
            date: '2024-02-15',
            due_date: '2024-03-01',
            description: 'X-Ray Imaging',
            amount: 850,
            status: 'overdue',
            paid_date: null,
          },
        ],
        payment_history: [
          {
            id: 1,
            date: '2024-03-15',
            description: 'Payment for INV-2024-001',
            amount: 150,
            method: 'Credit Card',
          },
          {
            id: 2,
            date: '2024-03-10',
            description: 'Payment for INV-2024-002 (Partial)',
            amount: 200,
            method: 'Debit Card',
          },
        ],
        insurance_claims: [
          {
            id: 'CLM-001',
            date: '2024-03-01',
            amount: 450,
            status: 'approved',
            description: 'Lab Tests',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    setProcessingPayment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Payment completed successfully');
      setPaymentDialog(false);
      fetchBillingData();
    } catch (err) {
      toast.error('Payment failed. Try again please!');
    } finally {
      setProcessingPayment(false);
    }
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

  const handlePrint = () => {
    window.print();
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Bill ${bill?.billNumber}`,
        text: `Amount ${formatCurrency(bill?.amount)}`,
        url: window.location.href,
      });
    }
    else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>
    );
  }
  if (error || !bill) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>{error || 'Bill not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/operator/bills')}
          sx={{ mt: 2 }}
        >Back to bills.</Button>
      </Box>
    );
  }

  const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(`/operator/detail-view/${id}`)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Bill Details
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Download PDF">
            <IconButton onClick={handleDownloadInvoice} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton onClick={handlePrint} color="primary">
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton onClick={handleShare} color="primary">
              <Share />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor:
            bill.status === 'paid' ? alpha('#4caf50', 0.1) :
              bill.status === 'pending' ? alpha('#ff9800', 0.1) :
                alpha('#f44336', 0.1),
          borderLeft: 6,
          borderColor:
            bill.status === 'paid' ? 'success.main' :
              bill.status === 'pending' ? 'warning.main' :
                'error.main',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {bill.status === 'paid' ? <CheckIcon color="success" sx={{ fontSize: 40 }} /> :
                bill.status === 'pending' ? <ScheduleIcon color="warning" sx={{ fontSize: 40 }} /> :
                  <WarningIcon color="error" sx={{ fontSize: 40 }} />}
              <Box>
                <Typography variant="h5" gutterBottom>
                  {bill.status === 'paid' ? 'Payment Completed' :
                    bill.status === 'pending' ? 'Payment Pending' :
                      'Payment Overdue'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {bill.status === 'paid'
                    ? `Paid on ${formatDate(bill.payments[bill.payments.length - 1]?.date)}`
                    : bill.status === 'pending'
                      ? `Due in ${daysUntilDue} days (${formatDate(bill.dueDate)})`
                      : `Overdue by ${Math.abs(daysUntilDue)} days`}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {formatCurrency(bill.balance)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Bill: {formatCurrency(bill.amount)} | Paid: {formatCurrency(bill.amount - bill.balance)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <InfoCard sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bill Items
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bill.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>
                        Subtotal
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(bill.amount)}
                      </TableCell>
                    </TableRow>
                    {bill.insurance?.coveredAmount > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ color: 'info.main' }}>
                          Insurance Coverage
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'info.main' }}>
                          -{formatCurrency(bill.insurance.coveredAmount)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
                        Total Due
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.2rem', color: 'primary.main' }}>
                        {formatCurrency(bill.balance)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </InfoCard>

          {bill.insurance && (
            <InfoCard sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Insurance Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><InsuranceIcon color="primary" /></ListItemIcon>
                        <ListItemText
                          primary="Provider"
                          secondary={bill.insurance.provider}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Verified color="primary" /></ListItemIcon>
                        <ListItemText
                          primary="Policy Number"
                          secondary={bill.insurance.policyNumber}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><MoneyOffRounded color="primary" /></ListItemIcon>
                        <ListItemText
                          primary="Coverage"
                          secondary={bill.insurance.coverage}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
                        <ListItemText
                          primary="Covered Amount"
                          secondary={formatCurrency(bill.insurance.coveredAmount)}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>

                <LinearProgress
                  variant="determinate"
                  value={(bill.insurance.coveredAmount / bill.amount) * 100}
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Coverage: {((bill.insurance.coveredAmount / bill.amount) * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Pending: {formatCurrency(bill.insurance.pendingAmount)}
                  </Typography>
                </Box>
              </CardContent>
            </InfoCard>
          )}

          {bill.payments.length > 0 && (
            <InfoCard sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment History
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Reference</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bill.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.date)}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>{payment.reference}</TableCell>
                          <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>
                            <Chip
                              label={payment.status}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </InfoCard>
          )}

          {bill.timeline?.length > 0 && (
            <InfoCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Timeline
                </Typography>

                <List>
                  {bill.timeline.map((item, index) => (
                    <ListItem key={index} divider={index < bill.timeline.length - 1}>
                      <ListItemIcon>
                        <ScheduleIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.event}
                        secondary={
                          <Box>
                            <Typography variant="caption" component="span" color="textSecondary">
                              {formatDate(item.date)} • {item.description}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </InfoCard>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <InfoCard sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bill Summary
              </Typography>

              <List dense>
                <ListItem>
                  <ListItemIcon><ReceiptIcon /></ListItemIcon>
                  <ListItemText
                    primary="Bill Number"
                    secondary={bill.billNumber}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><CalendarViewDay /></ListItemIcon>
                  <ListItemText
                    primary="Bill Date"
                    secondary={formatDate(bill.date)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><AccessTimeIcon /></ListItemIcon>
                  <ListItemText
                    primary="Due Date"
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {formatDate(bill.dueDate)}
                        </Typography>
                        <Typography variant="caption" color={
                          daysUntilDue < 0 ? 'error' : daysUntilDue < 7 ? 'warning' : 'success'
                        }>
                          {daysUntilDue < 0
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : `${daysUntilDue} days remaining`}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText
                    primary="Patient"
                    secondary={bill.patient.name}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><LocalHospital /></ListItemIcon>
                  <ListItemText
                    primary="Department"
                    secondary={bill.department}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon><LocalHospital /></ListItemIcon>
                  <ListItemText
                    primary="Doctor"
                    secondary={bill.doctor?.name}
                  />
                </ListItem>
              </List>
            </CardContent>
          </InfoCard>

          <InfoCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>

              <Stack spacing={2}>
                {bill.status !== 'paid' && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<PaymentIcon />}
                    onClick={() => setPaymentDialog(true)}
                  >
                    Pay Now
                  </Button>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadInvoice}
                >
                  Download Invoice
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                >
                  Print
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={() => {
                    window.location.href = `mailto:?subject=Bill ${bill.billNumber}&body=View your bill at: ${window.location.href}`;
                  }}
                >
                  Email
                </Button>

                {bill.status === 'pending' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    startIcon={<ScheduleIcon />}
                    onClick={() => {
                      toast.info('Payment reminder set');
                    }}
                  >
                    Remind Me Later
                  </Button>
                )}

                {bill.insurance?.claimStatus === 'pending' && (
                  <Alert severity="info" icon={<InsuranceIcon />}>
                    <Typography variant="body2">
                      Insurance claim is being processed
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </InfoCard>
        </Grid>
      </Grid>

      <Dialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon />
            <Typography variant="h6">Pay Bill</Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Stepper activeStep={paymentStep} sx={{ mb: 3 }}>
            <Step><StepLabel>Select Method</StepLabel></Step>
            <Step><StepLabel>Confirm</StepLabel></Step>
            <Step><StepLabel>Complete</StepLabel></Step>
          </Stepper>

          {paymentStep === 0 && (
            <Box>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Amount Due: {formatCurrency(bill.balance)}
                </Typography>
              </Paper>

              <FormControl component="fieldset">
                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <Paper sx={{ p: 2, mb: 1, border: 1, borderColor: 'grey.200' }}>
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CreditCardIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2">Credit/Debit Card</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Pay instantly with your card
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </Paper>

                  <Paper sx={{ p: 2, mb: 1, border: 1, borderColor: 'grey.200' }}>
                    <FormControlLabel
                      value="bank"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Balance color="primary" />
                          <Box>
                            <Typography variant="subtitle2">Bank Transfer</Typography>
                            <Typography variant="caption" color="textSecondary">
                              Transfer from your bank account
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </Paper>
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {paymentStep === 1 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" gutterBottom>
                {formatCurrency(bill.balance)}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                via {paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                By confirming, you authorize SmartCare Hospital to charge your selected payment method.
              </Alert>
            </Box>
          )}

          {paymentStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              {processingPayment ? (
                <>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6">Processing Payment...</Typography>
                </>
              ) : (
                <>
                  <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Payment Successful!
                  </Typography>
                  <Typography color="textSecondary">
                    Your payment of {formatCurrency(bill.balance)} has been processed.
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {paymentStep < 2 && (
            <>
              <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
              {paymentStep === 0 ? (
                <Button variant="contained" onClick={() => setPaymentStep(1)}>
                  Continue
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? 'Processing...' : 'Confirm Payment'}
                </Button>
              )}
            </>
          )}
          {paymentStep === 2 && !processingPayment && (
            <Button
              variant="contained"
              onClick={() => {
                setPaymentDialog(false);
                fetchBillingData();
              }}
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientBillDetails;