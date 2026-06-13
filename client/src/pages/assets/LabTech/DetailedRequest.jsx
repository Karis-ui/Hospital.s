import React, { useState, useEffect } from 'react';
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
  Breadcrumbs,
  Link,
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  Timeline,
  TimelineDot
} from "@mui/lab";
import {
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Science as LabIcon,
  MedicalServices as DoctorIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  TimelineOutlined,
  Timelapse,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import {labServices} from '../../../services/users/labtech';

const PageHeader = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.info.main} 100%)`,
  color: 'white',
  padding: theme.spacing(3),
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
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatusBadge = styled(Chip)(({ theme, status }) => {
  const colors = {
    requested: { bg: '#fff3e0', color: '#ed6c02', icon: <PendingIcon /> },
    sample_taken: { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckIcon /> },
    processing: { bg: '#e3f2fd', color: '#0288d1', icon: <TimeIcon /> },
    ready: { bg: '#c8e6c9', color: '#1b5e20', icon: <CheckIcon /> },
    approved: { bg: '#c8e6c9', color: '#1b5e20', icon: <CheckIcon /> },
    cancelled: { bg: '#ffebee', color: '#c62828', icon: <CancelIcon /> },
  };
  const config = colors[status] || colors.requested;
  return {
    backgroundColor: config.bg,
    color: config.color,
    fontWeight: 600,
    padding: theme.spacing(1, 2),
    '& .MuiChip-icon': {
      color: config.color,
    },
  };
});

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

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

export const DetailedRequest = ()=>{
    const {id} = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [request,setRequest] = useState(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState('');
    const [openStatusDialog,setOpenStatusDialog] = useState(false);
    const [newStatus,setNewStatus] = useState('requested','sample_taken','ready','cancelled');
    const [snackbar,setSnackbar] = useState({open: false,message: '',severity: 'success'});

    useEffect(()=>{
        fetchDetailRequest();
    },[id]);

    const fetchDetailRequest = async()=>{
        try{
            setLoading(true);
            const response = await labServices.getDetailRequestView(id);

            if(response.data.status === 'success'){
              setRequest(response.data);
            }else{
              throw new Error('Failed to load request details.');
            }
        }catch(err){
            toast.error('Failed to fetch lab requesy! Try again please.');
            setError(err?.response?.data?.message || 'Failed to load request data');
        }finally{
            setLoading(false);
        }
    };

    const handleProcessTest = ()=>{
      navigate(`lab/process/${id}`);
    };

    const handleUploadResults = ()=>{
      navigate(`/labTechnician/report/${id}/upload`);
    };

    const getTimelineSteps = ()=>{
      const steps = [
        {
          label: 'Request created',
          status: request?.requested_date? 'completed' : 'pending',
          date: request?.requested_date,
          icon: <AssignmentIcon sx={{fontSize:16}}/>
        },
        {
          label: 'Sample Collection',
          status: request?.status === 'sample_taken' || request?.status === 'ready' || request?.status === 'cancelled' ? 'completed' : 'pending',
          date: request?.started_at,
          icon: <LabIcon sx={{fontSize:16}}/>
        },
        {
          label: 'Results ready',
          status: request?.status === 'ready'? 'completed' : 'pending',
          date: request?.results_ready_at,
          icon: <DescriptionIcon sx={{fontSize:16}}/>
        },
        {
          label: 'Request cancelled',
          status: request?.status === 'cancelled'? 'completed' : 'pending',
          date: request?.cancelled_at,
          icon: <CancelIcon sx={{fontSize:16}}/>
        },
        {
          label: 'Approved',
          status: request?.status === 'approved'? 'completed' : 'pending',
          date: request?.approved_at,
          icon: <CheckIcon sx={{fontSize:16}}/>
        },
      ];
      return steps;
    };

    const getStatusLabel = (status)=>{
      const labels = {
        requested: 'Requested',
        sample_taken: 'Sample Taken',
        ready: 'Ready',
        approved: 'Approved',
        cancelled: 'Cancelled',
      };
      return labels[status] || status;
    };

    const getStatusIcon = (status)=>{
      switch(status){
        case 'requested': return <PendingIcon/>;
        case 'sample_taken': return <TimeIcon/>;
        case 'ready': return <CheckIcon/>;
        case 'approved': return <CheckIcon/>;
        case 'cancelled': return <CancelIcon/>;
        default: return <PendingIcon/>
      }
    };

    if(loading){
      return(
        <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:400}}><CircularProgress/></Box>
      );
    }

    if(!request){
      return(
        <Box sx={{p:3}}>
          <Alert severity='error' sx={{borderRadius:2}}>
            Request not found.
          </Alert>
          <Button sx={{mt:2}} onClick={()=> navigate(`/lab/request-list`)}>
            Back to requests.
          </Button>
        </Box>
      );
    }

    return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/lab/request-list')}
        sx={{ mb: 2, borderRadius: 2 }}
      >
        Back to Requests
      </Button>

      <PageHeader>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Test Request Details
            </Typography>
            <Breadcrumbs sx={{ color: alpha('#fff', 0.8) }}>
              <Link color="inherit" onClick={() => navigate('/lab/dashboard')} sx={{ cursor: 'pointer', color: 'inherit' }}>
                Lab Dashboard
              </Link>
              <Link color="inherit" onClick={() => navigate('/lab/requests')} sx={{ cursor: 'pointer', color: 'inherit' }}>
                Test Requests
              </Link>
              <Typography color="inherit">Request #{request.id}</Typography>
            </Breadcrumbs>
          </Grid>
          <Grid item>
            <StatusBadge
              icon={getStatusIcon(request.status)}
              label={getStatusLabel(request.status)}
              status={request.status}
            />
          </Grid>
        </Grid>
      </PageHeader>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <AssignmentIcon /> Request Information
              </SectionTitle>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">
                    Test Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                    {request.test_name}
                  </Typography>
                  
                  <Typography variant="caption" color="textSecondary">
                    Test Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                    {request.test_type || 'Laboratory Test'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="textSecondary">
                    Requested Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                    {format(new Date(request.requested_date), 'MMMM dd, yyyy')}
                    <Typography variant="caption" color="textSecondary" component="span" sx={{ ml: 1 }}>
                      ({formatDistanceToNow(new Date(request.requested_date), { addSuffix: true })})
                    </Typography>
                  </Typography>
                  
                  <Typography variant="caption" color="textSecondary">
                    Priority
                  </Typography>
                  <Chip
                    label={request.priority?.toUpperCase() || 'NORMAL'}
                    size="small"
                    sx={{
                      bgcolor: request.priority === 'urgent' ? '#ffebee' : '#e8f5e9',
                      color: request.priority === 'urgent' ? '#c62828' : '#2e7d32',
                      fontWeight: 500,
                    }}
                  />
                </Grid>
              </Grid>
              
              {request.notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="textSecondary">
                    Clinical Notes
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 1 }}>
                    {request.notes}
                  </Typography>
                </>
              )}
            </CardContent>
          </InfoCard>

          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <PersonIcon /> Patient Information
              </SectionTitle>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main }}>
                      <PersonIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {request.patient?.first_name} {request.patient?.last_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Patient ID: {request.patient?.id}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{request.patient?.phone || 'N/A'}</Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{request.patient?.email || 'N/A'}</Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2">{request.patient?.address || 'N/A'}</Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2">Age: {request.patient?.age || 'N/A'} yrs</Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">Gender: {request.patient?.gender || 'N/A'}</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </InfoCard>

          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <DoctorIcon /> Referring Doctor
              </SectionTitle>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  <DoctorIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    Dr. {request.doctor?.user?.full_name || request.doctor?.full_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {request.doctor?.speciality || 'General Practitioner'}
                  </Typography>
                </Box>
              </Box>
              
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{request.doctor?.phone_number || 'N/A'}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2">{request.doctor?.user?.email || request.doctor?.email || 'N/A'}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </InfoCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <HistoryIcon /> Status Timeline
              </SectionTitle>
              
              <Timeline position="right">
                {getTimelineSteps().map((step, index) => (
                  <TimelineItem key={index}>
                    <TimelineOppositeContent sx={{ flex: 0.3 }}>
                      {step.date && (
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(step.date), 'MMM dd, HH:mm')}
                        </Typography>
                      )}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={step.status === 'completed' ? 'success' : 'grey'}>
                        {step.icon}
                      </TimelineDot>
                      {index < getTimelineSteps().length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {step.label}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </CardContent>
          </InfoCard>

          {/* Actions */}
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle variant="h6">
                <ScheduleIcon /> Actions
              </SectionTitle>
              
              <Stack spacing={2}>
                {request.status === 'requested' && (
                  <ActionButton
                    variant="contained"
                    fullWidth
                    startIcon={<LabIcon />}
                    onClick={handleProcessTest}
                  >
                    Process Test
                  </ActionButton>
                )}
                
                {(request.status === 'sample_taken' || request.status === 'processing') && (
                  <ActionButton
                    variant="contained"
                    fullWidth
                    startIcon={<UploadIcon />}
                    onClick={handleUploadResults}
                    color="primary"
                  >
                    Upload Results
                  </ActionButton>
                )}
                
                {request.status === 'ready' && (
                  <ActionButton
                    variant="outlined"
                    fullWidth
                    startIcon={<DescriptionIcon />}
                    onClick={() => navigate(`/labTechnician/detail_view/${id}/report`)}
                  >
                    View Results
                  </ActionButton>
                )}
                
                <ActionButton
                  variant="outlined"
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => setOpenStatusDialog(true)}
                >
                  Update Status
                </ActionButton>
              </Stack>
            </CardContent>
          </InfoCard>

          {(request.sample_type || request.fasting_required) && (
            <InfoCard>
              <CardContent sx={{ p: 3 }}>
                <SectionTitle variant="h6">
                  <LabIcon /> Test Specifications
                </SectionTitle>
                
                <Stack spacing={2}>
                  {request.sample_type && (
                    <DetailRow>
                      <Typography variant="body2" color="textSecondary">Sample Type:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{request.sample_type}</Typography>
                    </DetailRow>
                  )}
                  {request.fasting_required !== undefined && (
                    <DetailRow>
                      <Typography variant="body2" color="textSecondary">Fasting Required:</Typography>
                      <Chip
                        label={request.fasting_required ? 'Yes' : 'No'}
                        size="small"
                        sx={{
                          bgcolor: request.fasting_required ? '#fff3e0' : '#e8f5e9',
                          color: request.fasting_required ? '#ed6c02' : '#2e7d32',
                        }}
                      />
                    </DetailRow>
                  )}
                  {request.turnaround_time && (
                    <DetailRow>
                      <Typography variant="body2" color="textSecondary">Turnaround Time:</Typography>
                      <Typography variant="body2">{request.turnaround_time} hours</Typography>
                    </DetailRow>
                  )}
                </Stack>
              </CardContent>
            </InfoCard>
          )}
        </Grid>
      </Grid>

      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Update Request Status</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Current Status: <strong>{getStatusLabel(request.status)}</strong>
            </Alert>
            <Typography variant="body2" color="textSecondary">
              Status changes will be logged and notify relevant parties.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenStatusDialog(false);
              toast.info('Status update feature coming soon');
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};