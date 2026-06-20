import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Tabs,
  Tab,
  Avatar,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Science as LabIcon,
  Description as ReportIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  Assignment as RequestIcon,
  CheckCircle as ApprovedIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  MedicalServices as MedicalIcon,
  CalendarToday as CalendarIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { labServices } from '../../../services/users/labtech';

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

const ResultCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  marginBottom: theme.spacing(2),
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: theme.shadows[4],
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    requested: { bg: '#fff3e0', color: '#ed6c02' },
    processing: { bg: '#e3f2fd', color: '#0288d1' },
    sample_taken: { bg: '#e8f5e9', color: '#2e7d32' },
    ready: { bg: '#c8e6c9', color: '#1b5e20' },
    approved: { bg: '#c8e6c9', color: '#1b5e20' },
    cancelled: { bg: '#ffebee', color: '#c62828' },
  };
  const config = colors[status] || colors.requested;
  return {
    backgroundColor: config.bg,
    color: config.color,
    fontWeight: 600,
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

export const Search = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ requests: [], reports: [] });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      searchQuery(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await labServices.searchItems(query);
      if (response.data.status === 'success') {
        setResults(response.data.results);
      } else {
        throw new Error('Search failed.Try again!');
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Search failed.Try again!');
      setResults({ requests: [], reports: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/lab/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults({ requests: [], reports: [] });
    navigate('/lab/search');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'requested': return <RequestIcon sx={{ fontSize: 16 }} />;
      case 'cancelled': return <CancelIcon sx={{ fontSize: 16 }} />;
      case 'ready': return <ApprovedIcon sx={{ fontSize: 16 }} />;
    }
  };

  const totalResults = (results.requests?.length || 0) + (results.reports?.length || 0);

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          Search Lab Records
        </Typography>

        <GlassSearchBar>
          <SearchIcon sx={{ color: 'text.secondary', mx: 1.5 }} />
          <TextField
            fullWidth
            placeholder="Search by patient name, test name, request ID, report ID, doctor name..."
            variant="standard"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{ disableUnderline: true }}
          />
          {searchQuery && (
            <IconButton onClick={handleClearSearch} size="small">
              <ClearIcon />
            </IconButton>
          )}
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ borderRadius: 6, mx: 1 }}
            disabled={!searchQuery.trim()}
          >
            Search
          </Button>
        </GlassSearchBar>

        {totalResults > 0 && (
          <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
            Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{searchQuery}"
          </Typography>
        )}
      </PageHeader>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && searchQuery && totalResults === 0 && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No results found for "{searchQuery}". Try different keywords or check spelling.
        </Alert>
      )}

      {!loading && totalResults > 0 && (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{ px: 2, pt: 1, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              label={`Test Requests (${results.requests?.length || 0})`}
              icon={<RequestIcon />}
              iconPosition="start"
            />
            <Tab
              label={`Lab Reports (${results.reports?.length || 0})`}
              icon={<ReportIcon />}
              iconPosition="start"
            />
          </Tabs>

          {tabValue === 0 && (
            <Box sx={{ p: 2 }}>
              {results.requests?.map((request) => (
                <ResultCard
                  key={request.id}
                  onClick={() => navigate(`/lab/requests/${request.id}`)}
                >
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <RequestIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              Request #{request.id}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {request.test_name}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">
                            {request.patient?.first_name} {request.patient?.last_name}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MedicalIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="textSecondary">
                            Dr. {request.doctor?.user?.full_name?.split(' ')[0]}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(request.requested_date), 'MMM dd, yyyy')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <StatusChip
                          icon={getStatusIcon(request.status)}
                          label={request.status?.replace('_', ' ').toUpperCase()}
                          status={request.status}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button
                          size="small"
                          endIcon={<ViewIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/lab/requests/${request.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </ResultCard>
              ))}
              {(!results.requests || results.requests.length === 0) && (
                <Typography sx={{ textAlign: 'center', py: 4 }} color="textSecondary">
                  No test requests found
                </Typography>
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 2 }}>
              {results.reports?.map((report) => (
                <ResultCard
                  key={report.id}
                  onClick={() => navigate(`/lab/results/${report.id}`)}
                >
                  <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                            <ReportIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              Report #{report.id}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {report.lab_request?.test_name}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">
                            {report.lab_request?.patient?.first_name} {report.lab_request?.patient?.last_name}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography variant="caption" color="textSecondary">
                          Uploaded: {format(new Date(report.uploaded_at), 'MMM dd, yyyy')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Chip
                          icon={report.is_approved ? <ApprovedIcon /> : <PendingIcon />}
                          label={report.is_approved ? 'Approved' : 'Pending'}
                          size="small"
                          sx={{
                            bgcolor: report.is_approved ? '#e8f5e9' : '#fff3e0',
                            color: report.is_approved ? '#2e7d32' : '#ed6c02',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Report">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/lab/results/${report.id}`);
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {report.report_file && (
                            <Tooltip title="Download PDF">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(report.report_file, '_blank');
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </ResultCard>
              ))}
              {(!results.reports || results.reports.length === 0) && (
                <Typography sx={{ textAlign: 'center', py: 4 }} color="textSecondary">
                  No lab reports found
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      )}

      {!searchQuery && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="textSecondary">
            Enter a search term to find lab records
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Search by patient name, test name, request ID, or report ID
          </Typography>
        </Paper>
      )}
    </Box>
  );
};