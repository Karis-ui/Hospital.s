import React, { useState, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Button,
  Avatar,
  Stack,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  alpha,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  IconButton,
  LinearProgress,
  TableHead
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Science as LabIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Pending as PendingIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Assessment as AssessmentIcon,
  MedicalServices as MedicalIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { labServices } from '../../../services/users/labtech';
import { el } from 'date-fns/locale';
import { useConfirm } from '../../../theme/useConfirm';

const HeroSection = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.info.main} 100%)`,
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 300,
    height: 300,
    background: `radial-gradient(circle, ${alpha('#fff', 0.2)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${alpha('#fff', 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatusBadge = styled(Chip)(({ theme, status }) => {
  const colors = {
    approved: { bg: '#e8f5e9', color: '#2e7d32', icon: <ApprovedIcon /> },
    pending: { bg: '#fff3e0', color: '#ed6c02', icon: <PendingIcon /> },
    rejected: { bg: '#ffebee', color: '#c62828', icon: <RejectedIcon /> },
  };
  const config = colors[status] || colors.pending;
  return {
    backgroundColor: config.bg,
    color: config.color,
    fontWeight: 700,
    fontSize: '0.9rem',
    padding: theme.spacing(1.5, 2),
    '& .MuiChip-icon': {
      color: config.color,
    },
  };
});

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '&::before': {
    content: '""',
    width: 4,
    height: 24,
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
    borderRadius: 4,
  },
}));

const ParameterTable = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const AbnormalCell = styled(TableCell)(({ theme, abnormal }) => ({
  backgroundColor: abnormal ? alpha('#c62828', 0.05) : 'transparent',
  color: abnormal ? '#c62828' : 'inherit',
  fontWeight: abnormal ? 600 : 400,
}));

const ActionButton = styled(Button)(({ theme, variant, color }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

export const ResultDetails = () => {
  const { id } = useParams();
  const theme = useTheme();
  const confirm = useConfirm();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setresults] = useState([]);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    setLoading(true);
    try {
      const res = await labServices.getDetailReportView(id);
      if (res.data.status === 'success') {
        setReport(res.data.data);
      } else {
        throw new Error('Failed to load report details.');
      }
    } catch (err) {
      console.error('Error fetching report details:', err);
      toast.error('Failed to load report details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const confirmed = await confirm({
      title: 'Approve Report',
      content: 'Are you sure you want to approve this report?',
      type: 'success',
      confirmText: 'Approve',
      confirmColor: 'success',
    });
    if (!confirmed) return;
    try {
      const response = await labServices.approveResult(id);
      if (response.data.status === 'success') {
        toast.success('Report approved successfully');
        fetchReportDetails();
        setOpenApproveDialog(false);
      } else {
        throw new Error('Failed to approve report.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve result.');
    }
  };

  const handleReject = async () => {
    const confirmed = await confirm({
      title: 'Reject Report',
      content: 'Are you sure you want to reject this report? Please provide a reason for rejection.',
      type: 'warning',
      confirmText: 'Reject',
      confirmColor: 'error',
    });
    if (!confirmed) return;
    if (!rejectReason.trim()) {
      toast.warning('Please provide enough reason for rejection.');
      return;
    }
    try {
      const response = await labServices.rejectResult(id, { reason: rejectReason });
      if (response.data.status === 'success') {
        toast.success('Report rejected successfully.');
        fetchReportDetails();
        setOpenRejectDialog(false);
        setRejectReason('');
      } else {
        throw new Error('Failed to uphold rejection!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject report.');
    }
  };

  const handleSendToDoctor = async () => {
    setSending(true);
    try {
      const response = await labServices.sendToDoctor(id);
      if (response.data.status === 'success') {
        toast.success('Report sent to doctor successfully.');
        fetchReportDetails();
      } else {
        throw new Error('Failed to send report.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send report!');
    } finally {
      setSending(false);
    }
  };

  const handleDownload = () => {
    if (report?.report_file) {
      const link = document.createElement('a');
      link.href = report.report_file;
      link.download = `report_${report.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast.info('No report file available.');
    }
  };

  const handleResults = async () => {
    setLoading(true);
    try {
      const res = await labServices.getLabRequestList();
      setresults(res.data);
      toast.success('Results fetched successfully');
    }
    catch (err) {
      toast.error('An error occurred', err);
    }
    finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (report?.report_file) {
      window.open(report.report_file, '_blank');
    } else {
      toast.info('No report file available.');
    }
    window.print();
  };

  const getStatusConfig = () => {
    if (report?.is_approved) return { label: 'Approved', status: 'approved', icon: <ApprovedIcon />, color: '#2e7d32' };
    if (report?.reject_reason) return { label: 'Rejected', status: 'rejected', icon: <RejectedIcon />, color: '#c62828' };
    return { label: 'Pending Approval', status: 'pending', icon: <PendingIcon />, color: '#ed6c02' };
  };

  const isAbnormal = (value, referenceRange) => {
    if (!value || !referenceRange) return false;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;

    if (referenceRange.includes('-')) {
      const [min, max] = referenceRange.split('-').map(Number);
      return numValue < min || numValue > max;
    }
    if (referenceRange.startsWith('<')) {
      const max = parseFloat(referenceRange.subString(1));
      return numValue >= max;
    }
    if (referenceRange.startsWith('>')) {
      const min = parseFloat(referenceRange.subString(1));
      return numValue <= min;
    }
    return false;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}><CircularProgress /></Box>
    );
  }
  if (!report) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error' sx={{ borderRadius: 3 }}>Report not found</Alert>
        <Button sx={{ mt: 2 }} onClick={handleResults}>Back to Results.</Button>
      </Box>
    );
  }

  const statusConfig = getStatusConfig();
  const patient = report.lab_request?.patient;
  const doctor = report.lab_request?.doctor;
  const testRequest = report.lab_request;

  return (
    <Box sx={{ p: 3 }}>
      <HeroSection>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button
              variant="contained"
              startIcon={<BackIcon />}
              onClick={handleResults}
              sx={{
                bgcolor: alpha('#fff', 0.2),
                color: 'white',
                mb: 2,
                '&:hover': { bgcolor: alpha('#fff', 0.3) },
              }}
            >
              Back to Results
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Lab Report Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Report #{report.id} • Generated on {format(new Date(report.uploaded_at), 'MMMM dd, yyyy')}
            </Typography>
          </Box>
          <StatusBadge
            icon={statusConfig.icon}
            label={statusConfig.label}
            status={statusConfig.status}
          />
        </Box>
      </HeroSection>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <LabIcon /> Test Results
              </SectionTitle>

              {report.results_data?.parameters && report.results_data.parameters.length > 0 ? (
                <ParameterTable>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell><strong>Parameter</strong></TableCell>
                        <TableCell align="right"><strong>Value</strong></TableCell>
                        <TableCell><strong>Unit</strong></TableCell>
                        <TableCell><strong>Reference Range</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.results_data.parameters.map((param, index) => {
                        const abnormal = isAbnormal(param.value, param.reference_range);
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {param.name}
                              </Typography>
                            </TableCell>
                            <AbnormalCell align="right" abnormal={abnormal}>
                              {param.value || '-'}
                            </AbnormalCell>
                            <TableCell>{param.unit || '-'}</TableCell>
                            <TableCell>{param.reference_range || '-'}</TableCell>
                            <TableCell>
                              {param.status && param.status !== 'pending' && (
                                <Chip
                                  label={param.status.toUpperCase()}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(
                                      param.status === 'normal' ? '#2e7d32' :
                                        param.status === 'high' ? '#c62828' : '#ed6c02',
                                      0.1
                                    ),
                                    color: param.status === 'normal' ? '#2e7d32' :
                                      param.status === 'high' ? '#c62828' : '#ed6c02',
                                  }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ParameterTable>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  No detailed test results available
                </Alert>
              )}
            </CardContent>
          </InfoCard>

          {(report.remarks || report.results_data?.notes) && (
            <InfoCard sx={{ mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle variant="h6">
                  <DescriptionIcon /> Additional Information
                </SectionTitle>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                  {report.remarks || report.results_data?.notes}
                </Typography>
              </CardContent>
            </InfoCard>
          )}

          {report.results_data?.quality_control && (
            <InfoCard sx={{ mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle variant="h6">
                  <VerifiedIcon /> Quality Control
                </SectionTitle>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <DetailRow>
                      <Typography variant="body2" color="textSecondary">Status:</Typography>
                      <Chip
                        icon={report.results_data.quality_control.passed ? <VerifiedIcon /> : <WarningIcon />}
                        label={report.results_data.quality_control.passed ? 'Passed' : 'Failed'}
                        size="small"
                        sx={{
                          bgcolor: report.results_data.quality_control.passed ? '#e8f5e9' : '#ffebee',
                          color: report.results_data.quality_control.passed ? '#2e7d32' : '#c62828',
                        }}
                      />
                    </DetailRow>
                  </Grid>
                  <Grid item xs={12}>
                    <DetailRow>
                      <Typography variant="body2" color="textSecondary">Notes:</Typography>
                      <Typography variant="body2">
                        {report.results_data.quality_control.notes || 'No quality control notes'}
                      </Typography>
                    </DetailRow>
                  </Grid>
                </Grid>
              </CardContent>
            </InfoCard>
          )}
        </Grid>

        <Grid item xs={12} lg={4}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <AssessmentIcon /> Report Information
              </SectionTitle>

              <Stack spacing={2}>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Report ID:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>#{report.id}</Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Uploaded By:</Typography>
                  <Typography variant="body2">{report.uploaded_by?.username || 'Unknown'}</Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Uploaded At:</Typography>
                  <Typography variant="body2">
                    {format(new Date(report.uploaded_at), 'MMM dd, yyyy hh:mm a')}
                    <Typography variant="caption" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                      ({formatDistanceToNow(new Date(report.uploaded_at), { addSuffix: true })})
                    </Typography>
                  </Typography>
                </DetailRow>
                {report.equipment_used && (
                  <DetailRow>
                    <Typography variant="body2" color="textSecondary">Equipment Used:</Typography>
                    <Typography variant="body2">{report.equipment_used}</Typography>
                  </DetailRow>
                )}
                {report.performed_by && (
                  <DetailRow>
                    <Typography variant="body2" color="textSecondary">Performed By:</Typography>
                    <Typography variant="body2">{report.performed_by}</Typography>
                  </DetailRow>
                )}
              </Stack>
            </CardContent>
          </InfoCard>

          <InfoCard sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <PersonIcon /> Patient Information
              </SectionTitle>

              <Stack spacing={2}>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Name:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {patient?.first_name} {patient?.last_name}
                  </Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Patient ID:</Typography>
                  <Typography variant="body2">#{patient?.id}</Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Age/Gender:</Typography>
                  <Typography variant="body2">{patient?.age || 'N/A'} yrs / {patient?.gender || 'N/A'}</Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Contact:</Typography>
                  <Typography variant="body2">{patient?.phone || 'N/A'}</Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Test Requested:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{testRequest?.test_name}</Typography>
                </DetailRow>
              </Stack>
            </CardContent>
          </InfoCard>

          <InfoCard sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <MedicalIcon /> Referring Doctor
              </SectionTitle>

              <Stack spacing={2}>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Name:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Dr. {doctor?.user?.full_name || 'N/A'}
                  </Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Speciality:</Typography>
                  <Typography variant="body2">{doctor?.speciality || 'General'}</Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Email:</Typography>
                  <Typography variant="body2">{doctor?.user?.email || 'N/A'}</Typography>
                </DetailRow>
                <DetailRow>
                  <Typography variant="body2" color="textSecondary">Phone:</Typography>
                  <Typography variant="body2">{doctor?.phone_number || 'N/A'}</Typography>
                </DetailRow>
              </Stack>
            </CardContent>
          </InfoCard>

          {report.is_approved && (
            <InfoCard sx={{ mt: 3, borderColor: alpha('#2e7d32', 0.3) }}>
              <CardContent sx={{ p: 3, bgcolor: alpha('#2e7d32', 0.02) }}>
                <SectionTitle variant="h6" sx={{ color: '#2e7d32' }}>
                  <ApprovedIcon /> Approval Information
                </SectionTitle>
                <Stack spacing={2}>
                  <DetailRow>
                    <Typography variant="body2" color="textSecondary">Approved By:</Typography>
                    <Typography variant="body2">{report.approved_by?.username || 'Unknown'}</Typography>
                  </DetailRow>
                  <DetailRow>
                    <Typography variant="body2" color="textSecondary">Approved At:</Typography>
                    <Typography variant="body2">
                      {format(new Date(report.reviewed_at), 'MMM dd, yyyy hh:mm a')}
                    </Typography>
                  </DetailRow>
                </Stack>
              </CardContent>
            </InfoCard>
          )}

          {report.rejected_reason && (
            <InfoCard sx={{ mt: 3, borderColor: alpha('#c62828', 0.3) }}>
              <CardContent sx={{ p: 3, bgcolor: alpha('#c62828', 0.02) }}>
                <SectionTitle variant="h6" sx={{ color: '#c62828' }}>
                  <RejectedIcon /> Rejection Information
                </SectionTitle>
                <Stack spacing={2}>
                  <DetailRow>
                    <Typography variant="body2" color="textSecondary">Reason:</Typography>
                    <Typography variant="body2" sx={{ color: '#c62828' }}>{report.rejected_reason}</Typography>
                  </DetailRow>
                  <DetailRow>
                    <Typography variant="body2" color="textSecondary">Reviewed By:</Typography>
                    <Typography variant="body2">{report.approved_by?.username || 'Unknown'}</Typography>
                  </DetailRow>
                  <DetailRow>
                    <Typography variant="body2" color="textSecondary">Reviewed At:</Typography>
                    <Typography variant="body2">
                      {format(new Date(report.reviewed_at), 'MMM dd, yyyy hh:mm a')}
                    </Typography>
                  </DetailRow>
                </Stack>
              </CardContent>
            </InfoCard>
          )}

          <InfoCard sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <ScheduleIcon /> Actions
              </SectionTitle>

              <Stack spacing={2}>
                {!report.is_approved && !report.rejected_reason && (
                  <>
                    <ActionButton
                      fullWidth
                      variant="contained"
                      startIcon={<ThumbUpIcon />}
                      onClick={() => setOpenApproveDialog(true)}
                      sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                    >
                      Approve Report
                    </ActionButton>
                    <ActionButton
                      fullWidth
                      variant="outlined"
                      startIcon={<ThumbDownIcon />}
                      onClick={() => setOpenRejectDialog(true)}
                      sx={{ borderColor: '#c62828', color: '#c62828', '&:hover': { borderColor: '#c62828', bgcolor: alpha('#c62828', 0.05) } }}
                    >
                      Reject Report
                    </ActionButton>
                  </>
                )}

                {report.is_approved && !report.is_sent_to_doctor && (
                  <ActionButton
                    fullWidth
                    variant="contained"
                    startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                    onClick={handleSendToDoctor}
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : 'Send to Doctor'}
                  </ActionButton>
                )}

                <ActionButton
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download Report
                </ActionButton>

                <ActionButton
                  fullWidth
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                >
                  Print Report
                </ActionButton>
              </Stack>
            </CardContent>
          </InfoCard>
        </Grid>
      </Grid>

      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ApprovedIcon sx={{ color: '#2e7d32' }} />
          Approve Lab Report
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            Are you sure you want to approve this lab report?
          </Alert>
          <Typography variant="body2" color="textSecondary">
            Once approved, the report will be marked as verified and can be sent to the referring doctor.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Approve Report
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RejectedIcon sx={{ color: '#c62828' }} />
          Reject Lab Report
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            Please provide a reason for rejecting this report.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this report is being rejected..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Reject Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}