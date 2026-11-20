import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';
import PatientService from '../../../services/users/patient';
import OperatorService from '../../../services/users/operator';
import { formatCurrency, formatDate } from '../../../formatters';

const getStatusColor = (status) => {
  switch (status) {
    case 'Cleared':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Overdue':
      return 'error';
    default:
      return 'default';
  }
};

const amountValue = (amount) => Number(amount) || 0;

export const PatientBillDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isOperator = (user?.user_type || user?.role) === 'operator';
  const [bill, setBill] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBillData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (id) {
        const response = isOperator
          ? await OperatorService.getBillDetail(id)
          : await PatientService.getBill(id);
        const data = isOperator ? response.data?.data?.bill : response.data;
        if (!data || Array.isArray(data)) {
          throw new Error('The bill response did not contain a bill.');
        }
        setBill(data);
        setBills([]);
      } else if (!isOperator) {
        const response = await PatientService.getBills();
        if (!Array.isArray(response.data)) {
          throw new Error('The bills response was not a list.');
        }
        setBills(response.data);
        setBill(null);
      } else {
        setBills([]);
        setBill(null);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Failed to load bill information.');
      setBill(null);
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [id, isOperator]);

  useEffect(() => {
    fetchBillData();
  }, [fetchBillData]);

  const handleDownload = async (billId) => {
    try {
      const response = isOperator
        ? await OperatorService.downloadInvoicePdf(billId)
        : await PatientService.downloadInvoice(billId);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${billId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      toast.error(downloadError.response?.data?.message || 'Failed to download the invoice.');
    }
  };

  const handleBack = () => {
    if (isOperator) {
      navigate('/operator/bills');
    } else {
      navigate(id ? '/patient/bills' : '/patient/dashboard');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Bill ${bill.id}`,
          text: `Amount: ${formatCurrency(bill.amount)}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard.');
      }
    } catch (shareError) {
      if (shareError.name !== 'AbortError') {
        toast.error('Unable to share this bill.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  if (!id) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          My Bills
        </Typography>
        {bills.length === 0 ? (
          <Alert severity="info">You do not have any bills yet.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bills.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>Bill #{item.id}</TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                    <TableCell align="right">{formatCurrency(amountValue(item.amount))}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.payment_status || 'Unknown'}
                        color={getStatusColor(item.payment_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button onClick={() => navigate(`/patient/bills/${item.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  }

  if (!bill) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Bill not found.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  const total = amountValue(bill.amount);
  const received = amountValue(bill.amount_received);
  const balance = Math.max(total - received, 0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={handleBack} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          Bill #{bill.id}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Download invoice">
            <IconButton onClick={() => handleDownload(bill.id)} aria-label="Download invoice">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton onClick={() => window.print()} aria-label="Print bill">
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton onClick={handleShare} aria-label="Share bill">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="overline" color="text.secondary">Payment status</Typography>
              <Box>
                <Chip
                  label={bill.payment_status || 'Unknown'}
                  color={getStatusColor(bill.payment_status)}
                />
              </Box>
            </Box>
            <Box sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="overline" color="text.secondary">Total amount</Typography>
              <Typography variant="h4" fontWeight={700}>{formatCurrency(total)}</Typography>
            </Box>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">Amount received</Typography>
              <Typography fontWeight={600}>{formatCurrency(received)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Balance</Typography>
              <Typography fontWeight={600}>{formatCurrency(balance)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Payment method</Typography>
              <Typography fontWeight={600}>{bill.payment_method || 'Not recorded'}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <ReceiptIcon color="primary" />
            <Typography variant="h6">Bill information</Typography>
          </Stack>
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">Created</Typography>
              <Typography>{formatDate(bill.created_at) || 'Not recorded'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Cleared</Typography>
              <Typography>{formatDate(bill.clearance_date) || 'Not cleared'}</Typography>
            </Box>
            {isOperator && (
              <Box>
                <Typography variant="body2" color="text.secondary">Patient ID</Typography>
                <Typography>{bill.patient ?? 'Not available'}</Typography>
              </Box>
            )}
            {bill.notes && (
              <Box>
                <Typography variant="body2" color="text.secondary">Notes</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>{bill.notes}</Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" color="text.secondary">Receipt</Typography>
              <Typography>{bill.is_receipt_available ? 'Available' : 'Not available'}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientBillDetails;
