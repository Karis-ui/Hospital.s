import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Tooltip,
  Zoom,
  Badge,
  Avatar,
  Rating,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Person as PersonIcon,
  Science as LabIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Send as SendIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { labServices } from '../../../services/users/labtech';

const StatsCard = styled(Card)(({ theme, color }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(color, 0.05)} 100%)`,
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${alpha(color, 0.2)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 35px -12px ${alpha(color, 0.3)}`,
    borderColor: color,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.5)})`,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    approved: { bg: '#e8f5e9', color: '#2e7d32', icon: <ApprovedIcon /> },
    pending: { bg: '#fff3e0', color: '#ed6c02', icon: <PendingIcon /> },
    rejected: { bg: '#ffebee', color: '#c62828', icon: <CancelIcon /> },
  };
  const config = colors[status] || colors.pending;
  return {
    backgroundColor: config.bg,
    color: config.color,
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: config.color,
    },
  };
});

const GlassSearchBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.spacing(6),
  background: `rgba(255, 255, 255, 0.9)`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:focus-within': {
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
    borderColor: theme.palette.primary.main,
  },
}));

export const RequestList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const {theme} = useTheme();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [anchorE1, setAnchorE1] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [stats,setStats] = useState({
        total: 0,
        requested: 0,
        sample_taken: 0,
        ready: 0,
        cancelled: 0,
    });
    const [opensendingDialog, setOpenSendingDialog] = useState(false);

    useEffect(()=>{
        fetchRequests();
    },[]);

    useEffect(()=>{
        filteredRequests = requests.filter(req=>{
            const matchesSearch = req.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || req.test_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
            const matchesTab = tabValue === 0 || (tabValue === 1 && req.status === 'requested') || (tabValue === 2 && req.status === 'sample_taken') || (tabValue === 3 && req.status === 'ready') || (tabValue === 4 && req.status === 'cancelled');
            return matchesSearch && matchesStatus && matchesTab;
        });
        setFilteredRequests(filteredRequests);
        setPage(1);
        calculateStats();
    },[requests,searchTerm,statusFilter]);

    const fetchRequests = async ()=>{
        try{
            const response = await labServices.getLabRequestList({ordering: '-created_at'});
            if(response.data.status !== 'success') throw new Error('Failed to fetch requests');
            setRequests(response.data.requests);
            setStats(response.data.stats);
            setLoading(true);
        }catch(err){
          setSnackbar({ open: true, message: 'Failed to load requests. Please try again later.', severity: 'error' });
          setRequests([]);
          setError('Failed to load requests. Please try again later.');
        }finally{
            setLoading(false);
        }
    };

    const getTabCount = (type)=>{
      if(type === 'all') return stats.total;
      if(type === 'requested') return stats.requested;
      if(type === 'sample_taken') return stats.sample_taken;
      if(type === 'ready') return stats.ready;
      if(type === 'cancelled') return stats.cancelled;
      return 0;
    };

    const paginatedRequests = filteredRequests.slice(
      (page - 1) * rowsPerPage,
      page * rowsPerPage
    );

    const calculateStats = ()=>{
        const total = filteredRequests.length;
        const requested = filteredRequests.reduce((count,req)=> count + (req.status === 'requested'? 1: 0),0);
        const sample_taken = filteredRequests.reduce((count,req)=> count + (req.status === 'sample_taken'? 1: 0),0);
        const ready = filteredRequests.reduce((count,req)=> count + (req.status === 'ready'? 1: 0),0);
        const cancelled = filteredRequests.reduce((count,req)=> count + (req.status === 'cancelled'? 1: 0),0);
        setStats({ total, requested, sample_taken, ready, cancelled });
    };

    const handleViewRequest = (requestId)=> navigate(`/labTechnician/detail_view/${requestId}/request`);
    const handleStatusChange = async (requestId, newStatus)=>{
        try{
          const res = await labServices.updateRequestStatus(requestId,newStatus);
          toast.success(`Request ${requestId} status changed to ${newStatus}`);
          fetchRequests();
          setLoading(true);
        }catch(err){
            toast.error('Failed to update request status. Please try again.');
        }finally{
            setLoading(false);
        }
    };

    if(loading && requests.length === 0){
      return(
        <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'400px'}}><CircularProgress/></Box>
      );
    }

     return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Lab Test Requests
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage and process laboratory test requests from doctors
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color={theme.palette.primary.main} onClick={() => setTabValue(0)}>
            <CardContent>
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Total
                  </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                {stats.total}
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="#ed6c02" onClick={() => setTabValue(1)}>
            <CardContent>
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Requested
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#ed6c02' }}>
                {stats.requested}
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="#0288d1" onClick={() => setTabValue(2)}>
            <CardContent>
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Processing
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#0288d1' }}>
                {stats.processing}
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="#2e7d32" onClick={() => setTabValue(3)}>
            <CardContent>
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Sample Taken
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#2e7d32' }}>
                {stats.sample_taken}
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="#1b5e20" onClick={() => setTabValue(4)}>
            <CardContent>
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Ready
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#1b5e20' }}>
                {stats.ready}
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid item xs={6} sm={4} md={2}>
          <StatsCard color="#c62828" onClick={() => setTabValue(5)}>
            <CardContent>
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Cancelled
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#c62828' }}>
                {stats.cancelled}
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2, mb: 3, overflow: 'auto' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ px: 2, pt: 1 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Requested (${stats.requested})`} />
          <Tab label={`Processing (${stats.processing})`} />
          <Tab label={`Sample Taken (${stats.sample_taken})`} />
          <Tab label={`Ready (${stats.ready})`} />
          <Tab label={`Cancelled (${stats.cancelled})`} />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by patient name, test name, or request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="requested">Requested</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="sample_taken">Sample Taken</MenuItem>
                <MenuItem value="ready">Ready</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchRequests}
              fullWidth
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <LinearProgress />
      ) : filteredRequests.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="textSecondary">
            No test requests found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginatedRequests.map((request, index) => (
              <Grid item xs={12} key={request.id}>
                <Zoom in style={{ transitionDelay: `${index * 50}ms` }}>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateX(8px)',
                        boxShadow: theme.shadows[4],
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                      },
                    }}
                    onClick={() => handleViewRequest(request.id)}
                  >
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <LabIcon sx={{ color: theme.palette.primary.main }} />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              #{request.id}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {format(new Date(request.requested_date), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                            <PersonIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {request.patient?.first_name} {request.patient?.last_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {request.test_name}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={2}>
                        <Typography variant="body2" color="textSecondary">
                          Doctor:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Dr. {request.doctor?.user?.full_name || 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={2}>
                        <StatusChip
                          icon={request.status === 'requested' ? <PendingIcon /> : 
                                request.status === 'processing' ? <BiotechIcon /> :
                                request.status === 'sample_taken' ? <CheckIcon /> :
                                <ReadyIcon />}
                          label={request.status}
                          status={request.status}
                          size="small"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={2}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {request.status === 'requested' && (
                            <Tooltip title="Process Test">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProcessTest(request.id);
                                }}
                              >
                                <BiotechIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRequest(request.id);
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Paper>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {filteredRequests.length > rowsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(filteredRequests.length / rowsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};