import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Stack,
  Divider,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  MedicalServices as DoctorIcon,
  Assignment as AppointmentIcon,
  Science as LabIcon,
  Description as ReportIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../../context/authContext';
import doctorSevice from '../../../services/users/doctor';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const GlassSearchBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5),
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
    transform: 'translateY(-2px)',
  },
}));

const ResultCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  '&:hover': {
    transform: 'translateX(8px)',
    boxShadow: theme.shadows[4],
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
}));

const SearchHeader = styled(Paper)(({ theme }) => ({
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
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${alpha('#fff', 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const TabLabel = ({ icon, label, count }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {icon}
    <span>{label}</span>
    {count !== undefined && (
      <Chip label={count} size="small" sx={{ ml: 0.5, height: 20, fontSize: '0.65rem' }} />
    )}
  </Box>
);

export const DoctorSearch = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    patients: [],
    appointments: [],
    lab_requests: [],
    reports: [],
  });
  const [tabValue, setTabValue] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const performSearch = async (query) => {
    if (!query.trim()) {
      setResults({ patients: [], appointments: [], lab_requests: [], reports: [] });
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      const response = await doctorSevice.searchItems(query);
      if (response.data.status === 'success') {
        setResults({
          patients: response.data.data.patients || [],
          appointments: response.data.data.appointments || [],
          lab_requests: response.data.data.lab_requests || [],
          reports: response.data.data.reports || [],
        });
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults({ patients: [], appointments: [], lab_requests: [], reports: [] });
    setHasSearched(false);
    setPage(1);
  };

  const handleViewPatient = async (patientId) => {
    await doctorSevice.patientDetail(patientId);
  };

  const handleViewAppointment = async (appointmentId) => {
    setLoading(true);
    try {
      await doctorSevice.appointmentView(appointmentId);
      toast.success('Appointment fetched successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch appointment');
    } finally {
      setLoading(false);
    }
  };

  const getTotalResults = () => {
    return Object.values(results).flat().length;
  };

  const getPaginatedResults = (items) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  };

  const categories = [
    { key: 'patients', label: 'Patients', icon: <PersonIcon />, count: results.patients.length },
    { key: 'appointments', label: 'Appointments', icon: <AppointmentIcon />, count: results.appointments.length },
    { key: 'lab_requests', label: 'Lab Requests', icon: <LabIcon />, count: results.lab_requests.length },
    { key: 'reports', label: 'Reports', icon: <ReportIcon />, count: results.reports.length },
  ];

  const activeCategories = categories.filter(c => c.count > 0);

  const totalPages = Math.max(
    Math.ceil(results.patients.length / itemsPerPage),
    Math.ceil(results.appointments.length / itemsPerPage),
    Math.ceil(results.lab_requests.length / itemsPerPage),
    Math.ceil(results.reports.length / itemsPerPage),
    1
  );

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <SearchHeader>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Search
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Search across patients, appointments, lab requests, and reports
          </Typography>
        </motion.div>
      </SearchHeader>

      <GlassSearchBar sx={{ mb: 3 }}>
        <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1.5 }} />
        <TextField
          placeholder="Search by patient name, appointment ID, test name, or report..."
          variant="standard"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{ disableUnderline: true }}
        />
        {searchQuery && (
          <IconButton onClick={handleClear} size="small">
            <ClearIcon />
          </IconButton>
        )}
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          sx={{ ml: 2, borderRadius: 6 }}
        >
          Search
        </Button>
      </GlassSearchBar>

      {hasSearched && !loading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            <strong>{getTotalResults()}</strong> result{getTotalResults() !== 1 ? 's' : ''} found for "
            <strong>{searchQuery}</strong>"
          </Typography>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && hasSearched && getTotalResults() === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <SearchIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            No results found
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            We couldn't find any matches for "<strong>{searchQuery}</strong>". Try different keywords or check spelling.
          </Typography>
        </Paper>
      )}

      {!loading && getTotalResults() > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              px: 2,
              pt: 1,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 48 },
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={
                <TabLabel
                  icon={<SearchIcon fontSize="small" />}
                  label="All Results"
                  count={getTotalResults()}
                />
              }
            />
            {categories.map((cat) => (
              cat.count > 0 && (
                <Tab
                  key={cat.key}
                  label={
                    <TabLabel
                      icon={cat.icon}
                      label={cat.label}
                      count={cat.count}
                    />
                  }
                />
              )
            ))}
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 2 }}>
              {activeCategories.map((category) => (
                <Box key={category.key} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    {category.icon}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {category.label}
                    </Typography>
                    <Chip label={category.count} size="small" variant="outlined" />
                  </Box>
                  {getPaginatedResults(results[category.key]).map((item, idx) => (
                    <ResultCard
                      key={idx}
                      onClick={() => {
                        if (category.key === 'patients') handleViewPatient(item.id);
                        else if (category.key === 'appointments') handleViewAppointment(item.id);
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            {category.icon}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {item.name || item.patient_name || item.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              {item.email || item.purpose || item.test_name || item.created_at}
                            </Typography>
                          </Box>
                          <Chip
                            label={category.label.slice(0, -1)}
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                          />
                          <ArrowForwardIcon sx={{ color: theme.palette.text.secondary, fontSize: 18 }} />
                        </Stack>
                      </CardContent>
                    </ResultCard>
                  ))}
                </Box>
              ))}
            </Box>
          </TabPanel>

          {categories.map((category, idx) => (
            <TabPanel key={category.key} value={tabValue} index={idx + 1}>
              <Box sx={{ p: 2 }}>
                {getPaginatedResults(results[category.key]).map((item, itemIdx) => (
                  <ResultCard
                    key={itemIdx}
                    onClick={() => {
                      if (category.key === 'patients') handleViewPatient(item.id);
                      else if (category.key === 'appointments') handleViewAppointment(item.id);
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          {category.icon}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {item.name || item.patient_name || item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {item.email || item.purpose || item.test_name || item.created_at}
                          </Typography>
                        </Box>
                        <ArrowForwardIcon sx={{ color: theme.palette.text.secondary, fontSize: 18 }} />
                      </Stack>
                    </CardContent>
                  </ResultCard>
                ))}
                {results[category.key].length === 0 && (
                  <Typography sx={{ textAlign: 'center', py: 4 }} color="textSecondary">
                    No {category.label.toLowerCase()} found
                  </Typography>
                )}
              </Box>
            </TabPanel>
          ))}
        </Paper>
      )}

      {!hasSearched && !loading && (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <SearchIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Search across your practice
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Enter a search term above to find patients, appointments, lab requests, or reports.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Chip label="Search by patient name" variant="outlined" />
            <Chip label="Search by appointment ID" variant="outlined" />
            <Chip label="Search by test name" variant="outlined" />
            <Chip label="Search by date" variant="outlined" />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default DoctorSearch;