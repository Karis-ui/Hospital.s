import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Grow,
  Slide,
  Zoom,
  Stack,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Close,
  MoveDown,
  Add,
  Download,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { OperatorService } from '../../../services/users/operator';
import { formatCurrency, formatDate, getInitials } from '../../../formatters';
import { GlassSearchBar, PremiumCard } from '../../../theme/GenLayout';
import PatientService from '../../../services/users/patient';

export const PatientList = () => {
  const theme = useTheme();
  const showToast = toast();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorE1, setANchorE1] = useState(null);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await OperatorService.searchStaff('');
      const patientData = response.data.results?.patients || [];
      const formattedPatients = patientData.map(patient => ({
        ...patient,
        totalBilled: patient.totalBilled || Math.floor(Math.random() * 5000),
        outstanding: patient.outstanding || Math.floor(Math.random() * 2000),
        lastBillDate: patient.lastBillDate || new Date(),
        billCount: patient.billCount || Math.floor(Math.random() * 10),
      }));
      setPatients(formattedPatients);
      setFilteredPatients(formattedPatients);
    } catch (err) {
      setError('Failed to fetch patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (searchTerm) {
      const filtered = patients.filter(p =>
        `${p.first_name || p.firstName} ${p.last_name || p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id?.toString().includes(searchTerm) ||
        p.phone?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
      setPage(1);
    } else {
      setFilteredPatients(patients);
    }
  };

  const handleCreateBill = (patient) => {
    showToast('info', `Sending statement to patient ${patient.firstName} ${patient.lastName}...`);
  };

  const handleViewHistory = async (patientId) => {
    await PatientService.paymentHistory(patientId);
  };

  const handleSendStatement = (patient) => {
    showToast('info', `Sending statement to patient ${patient.firstName} ${patient.lastName}...`);
  };

  const paginatedPatients = filteredPatients.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalOutstanding = patients.reduce((sum, p) => sum + (p.outstanding || 0), 0);
  const WithOutstanding = patients.filter(p => p.outstanding > 0).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, background: theme.palette.background.gradient, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Patient Billing Summary
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            View patients and their billing status
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchPatients} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.05), borderLeft: `4px solid ${theme.palette.warning.main}` }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Patients with Outstanding Balance</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.warning.main }}>
                {WithOutstanding}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total Outstanding: {formatCurrency(totalOutstanding)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderLeft: `4px solid ${theme.palette.primary.main}` }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Total Patients</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {patients.length}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Active billing profiles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <GlassSearchBar elevation={0} sx={{ mb: 3 }}>
        <SearchIcon sx={{ color: 'text.secondary', mr: 1.5 }} />
        <TextField
          placeholder="Search by name, ID, phone, or email..."
          variant="standard"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ disableUnderline: true }}
        />
        {searchTerm && (
          <IconButton size="small" onClick={() => setSearchTerm('')}>
            <Close fontSize="small" />
          </IconButton>
        )}
      </GlassSearchBar>

      <Grid container spacing={2}>
        {paginatedPatients.map((patient, idx) => (
          <Grid item xs={12} sm={6} md={4} key={patient.id}>
            <PremiumCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: theme.palette.primary.main }}>
                  {getInitials(patient.first_name, patient.last_name)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {patient.first_name} {patient.last_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    ID: {patient.id}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setANchorE1(e.currentTarget);
                    setSelectedPatient(patient);
                  }}
                >
                  <MoveDown />
                </IconButton>
              </Box>

              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2">{patient.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" noWrap>{patient.email}</Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Total Billed</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(patient.totalBilled)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Outstanding</Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: patient.outstanding > 0 ? theme.palette.warning.main : theme.palette.success.main
                    }}
                  >
                    {formatCurrency(patient.outstanding)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    {patient.billCount} bills • Last bill: {new Date(patient.lastBillDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<ReceiptIcon />}
                  onClick={() => handleViewHistory(patient.id)}
                >
                  History
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleCreateBill(patient)}
                >
                  New Bill
                </Button>
              </Box>
            </PremiumCard>
          </Grid>
        ))}
      </Grid>

      {filteredPatients.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredPatients.length / rowsPerPage)}
            page={page}
            onChange={(e, val) => setPage(val)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      <Menu
        anchorEl={anchorE1}
        open={Boolean(anchorE1)}
        onClose={() => setANchorE1(null)}
        PaperProps={{ sx: { minWidth: 180 } }}
      >
        <Menu onClick={() => { handleViewHistory(selectedPatient?.id); setANchorE1(null); }}>
          <ListItemIcon><ReceiptIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Billing History</ListItemText>
        </Menu>
        <MenuItem onClick={() => { handleCreateBill(selectedPatient); setANchorE1(null); }}>
          <ListItemIcon><Add fontSize="small" /></ListItemIcon>
          <ListItemText>Create New Bill</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleSendStatement(selectedPatient); setANchorE1(null); }}>
          <ListItemIcon><EmailIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Send Statement</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setANchorE1(null); }}>
          <ListItemIcon><Download fontSize="small" /></ListItemIcon>
          <ListItemText>Export Statement</ListItemText>
        </MenuItem>
      </Menu>

      {filteredPatients.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6">No patients found</Typography>
          <Typography color="textSecondary">Try adjusting your search</Typography>
        </Box>
      )}
    </Box>
  );
}