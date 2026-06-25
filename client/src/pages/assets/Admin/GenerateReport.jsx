import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Avatar,
  Paper,
  RadioGroup,
  Radio,
  FormControlLabel,
  alpha,
  Snackbar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Description as ReportIcon,
  People as UsersIcon,
  MedicalServices as DoctorIcon,
  Science as LabIcon,
  Assignment as AppointmentIcon,
  AttachMoney as BillingIcon,
  History as AuditIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/users/admin';
import {
  platinumTheme,
  PremiumHeader,
  PremiumCard,
  GlassCard,
  PlatinumButton,
  SectionTitle,
} from '../../../theme/GenLayout';

const reportTypes = [
  { value: 'users', label: 'User Report', icon: <UsersIcon />, description: 'Complete list of all system users with roles' },
  { value: 'doctors', label: 'Doctor Report', icon: <DoctorIcon />, description: 'All doctors with specialities and contact details' },
  { value: 'patients', label: 'Patient Report', icon: <UsersIcon />, description: 'Patient demographic summary' },
  { value: 'staff', label: 'Staff Report', icon: <UsersIcon />, description: 'All staff members with contact details' },
  { value: 'audits', label: 'Audit Report', icon: <AuditIcon />, description: 'System activity and User action logs.' },
];

const formatOptions = [
  { value: 'pdf', label: 'PDF Document', icon: '📄', description: 'Ideal for printing and sharing.' },
  { value: 'csv', label: 'CSV File', icon: '📋', description: 'Best for database import.' },
];

export const GenerateReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reportType, setReportType] = useState('users');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [generatedFile, setGeneratedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const selectedReport = reportTypes.find(r => r.value === reportType);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = {
        report_type: reportType,
        format: reportFormat,
        date_range_start: dateRange.start?.toISOString(),
        date_range_end: dateRange.end?.toISOString(),
      };
      const response = await adminService.generateReport(data);

      if (response.data.status === 'success') {
        setGeneratedFile({
          name: response.data.data?.name || `${selectedReport?.label || 'Report'}.${reportFormat}`,
          url: response.data.data?.file_url,
          id: response.data.data?.id,
        });
        toast.success('Report generated successfully.');
        setSnackbar({ open: true, message: 'Report generated successfully', severity: 'success' });
      }
    } catch (err) {
      console.error('Generate report error:', err);
      toast.error(err?.response?.data?.message || 'Failed to generate report');
      setSnackbar({ open: true, message: 'Report generation failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedFile) {
      toast.warning('No report to download. Generate one first.');
      return;
    }
    setDownloading(true);
    try {
      if (generatedFile.url) {
        window.open(generatedFile.url, '_blank');
        toast.success('Download started');
      } else {
        const response = await adminService.downloadReport(generatedFile.id);
        if (response.data.status === 'success') {
          toast.success('Report downloaded successfully.');
        }
      }
      setSnackbar({ open: true, message: 'Report Download Started', severity: 'success' });
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download report');
      setSnackbar({ open: true, message: 'Report download failed', severity: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!generatedFile) {
      toast.warning('No report to delete');
      return;
    }
    try {
      await adminService.deleteReport(generatedFile.id);
      toast.success('Report deleted successfully');
      setDeleteDialogOpen(false);
      setGeneratedFile(null);
      setSnackbar({ open: true, message: 'Report deleted successfully', severity: 'success' });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete report');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
        <Button 
          startIcon={<BackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mb: 3, textTransform: 'none' }}
        >
          Back
        </Button>

        <PremiumHeader>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>📄 Generate Report</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Create custom reports with filters and export options</Typography>
          </motion.div>
        </PremiumHeader>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <PremiumCard>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle variant="h6">Report Configuration</SectionTitle>

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Select Report Type</Typography>
                    <Grid container spacing={2}>
                      {reportTypes.map((type) => (
                        <Grid item xs={12} sm={6} key={type.value}>
                          <Paper
                            onClick={() => setReportType(type.value)}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: reportType === type.value 
                                ? `2px solid ${platinumTheme.secondary.main}` 
                                : `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
                              bgcolor: reportType === type.value 
                                ? alpha(platinumTheme.secondary.main, 0.05) 
                                : 'transparent',
                              '&:hover': {
                                borderColor: platinumTheme.secondary.main,
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: alpha(platinumTheme.secondary.main, 0.1), color: platinumTheme.secondary.main }}>
                                {type.icon}
                              </Avatar>
                              <Box flex={1}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{type.label}</Typography>
                                <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>
                                  {type.description}
                                </Typography>
                              </Box>
                              {reportType === type.value && <CheckIcon sx={{ color: platinumTheme.secondary.main }} />}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Export Format</Typography>
                    <Stack direction="row" spacing={2}>
                      {formatOptions.map((fmt) => (
                        <Paper
                          key={fmt.value}
                          onClick={() => setReportFormat(fmt.value)}
                          sx={{
                            flex: 1,
                            p: 2,
                            cursor: 'pointer',
                            textAlign: 'center',
                            border: reportFormat === fmt.value 
                              ? `2px solid ${platinumTheme.secondary.main}` 
                              : `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
                            bgcolor: reportFormat === fmt.value 
                              ? alpha(platinumTheme.secondary.main, 0.05) 
                              : 'transparent',
                            '&:hover': { borderColor: platinumTheme.secondary.main },
                          }}
                        >
                          <Typography variant="h3" sx={{ fontSize: 32, mb: 1 }}>{fmt.icon}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt.label}</Typography>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>
                            {fmt.description}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Date Range (Optional)</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <DatePicker
                          label="Start Date"
                          value={dateRange.start}
                          onChange={(newVal) => setDateRange({ ...dateRange, start: newVal })}
                          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <DatePicker
                          label="End Date"
                          value={dateRange.end}
                          onChange={(newVal) => setDateRange({ ...dateRange, end: newVal })}
                          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Stack>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <PlatinumButton
                    startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
                    onClick={handleGenerate}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </PlatinumButton>
                </Box>
              </CardContent>
            </PremiumCard>
          </Grid>

          <Grid item xs={12} md={5}>
            <GlassCard>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle variant="h6">Report Preview</SectionTitle>

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    width: 80, height: 80, mx: 'auto', mb: 2,
                    bgcolor: alpha(platinumTheme.secondary.main, 0.1), 
                    color: platinumTheme.secondary.main 
                  }}>
                    {selectedReport?.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedReport?.label}</Typography>
                  <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>
                    {selectedReport?.description}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>Format:</Typography>
                    <Chip 
                      label={reportFormat.toUpperCase()} 
                      size="small" 
                      sx={{ bgcolor: alpha(platinumTheme.accent.blue, 0.1), color: platinumTheme.accent.blue }} 
                    />
                  </Box>
                  {dateRange.start && dateRange.end && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>Date Range:</Typography>
                      <Typography variant="body2">
                        {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {generatedFile && (
                  <Box sx={{ mt: 3 }}>
                    <Alert
                      severity="success"
                      sx={{ mb: 2, borderRadius: 2 }}
                      action={
                        <Button 
                          color="inherit" 
                          size="small" 
                          onClick={handleDownload} 
                          startIcon={downloading ? <CircularProgress size={16} /> : <DownloadIcon />}
                          disabled={downloading}
                        >
                          {downloading ? 'Downloading...' : 'Download'}
                        </Button>
                      }
                    >
                      Report ready: {generatedFile.name}
                    </Alert>
                  </Box>
                )}

                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography variant="caption">Reports are generated and available for immediate download.</Typography>
                </Alert>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: alpha(platinumTheme.accent.red, 0.05) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeleteIcon sx={{ color: platinumTheme.accent.red }} />
              <Typography variant="h6">Delete Report</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              This action cannot be undone.
            </Alert>
            <Typography>Are you sure you want to delete <strong>{generatedFile?.name}</strong>?</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDelete} startIcon={<DeleteIcon />}>
              Delete Report
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }} onClose={handleCloseSnackbar}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default GenerateReport;