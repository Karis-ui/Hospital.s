import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, TextField, InputAdornment,
  IconButton, Button, Tabs, Tab, Avatar, Chip, Stack, Alert,
  CircularProgress, alpha, Paper, Divider, Skeleton, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  MedicalServices as DoctorIcon,
  Science as LabIcon,
  People as UsersIcon,
  Description as ReportIcon,
  Assignment as AppointmentIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  History as AuditIcon,
  KeyboardArrowRight as ArrowIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/users/admin';
import {
  platinumTheme, PremiumHeader, GlassSearchBar,
  SectionTitle,
} from '../../../theme/GenLayout';


const ResultItem = ({ result, type, onNaviage }) => {
  const getIcon = () => {
    switch (type) {
      case 'users': return <PersonIcon color='primary' />;
      case 'doctors': return <DoctorIcon color='primary' />;
      case 'labs': return <LabIcon color='primary' />;
      case 'patients': return <PersonIcon color='primary' />;
      case 'operators': return <UsersIcon color='primary' />;
      default: return <ReportIcon color='primary' />;
    }
  };

  const getTypeLabel = ({ }) => {
    const getIcon = () => {
      switch (type) {
        case 'users': return 'User';
        case 'doctors': return 'Doctor';
        case 'labs': return 'Lab';
        case 'patients': return 'Patient';
        case 'operators': return 'Operator';
        default: return 'Report';
      }
    };
  };

  const getSubtitle = () => {
    if (type === 'users') return result.email || result.username;
    if (type === 'doctors') return result.speciality || result.email;
    if (type === 'patients') return `${result.age} yrs ${result.gender || 'N/A'}`;
    if (type === 'staff') return result.department;
    if (type === 'appointments') return result.purpose;
    return '';
  };

  const getBadge = () => {
    if (type === 'users' && result.role) {
      return <Chip label={result.role} size='small' sx={{ height: 20, fontSize: '0.7rem' }} />;
    }
    if (type === 'doctprs' && result.is_available !== undefined) {
      return <Chip label={result.is_available ? 'Available' : 'Unavailable'} size='small' sx={{ height: 20, fontSize: '0.7rem' }} />;
    }
    if (type === 'staff' && result.department) {
      return <Chip label={result.department} size='small' sx={{ height: 20, fontSize: '0.7rem' }} />;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
    >
      <Card
        onClick={() => onNaviage(result, type)}
        sx={{
          mb: 1.5,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          borderRadius: 2,
          border: `1px solid ${alpha(platinumTheme.primary.main, 0.08)}`,
          '&:hover': {
            borderColor: platinumTheme.secondary.main,
            boxShadow: `0 4px 12px ${alpha(platinumTheme.primary.main, 0.1)}`,
          },
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(platinumTheme.primary.main, 0.08),
                color: platinumTheme.primary.main,
              }}
            >
              {getIcon()}
            </Avatar>
            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {result.name || result.full_name || result.patient_name || result.title}
                </Typography>
                {getBadge()}
                <Chip
                  label={getTypeLabel()}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: alpha(platinumTheme.accent.blue, 0.08),
                    color: platinumTheme.accent.blue,
                  }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: platinumTheme.text.secondary, display: 'block', mt: 0.5 }}>
                {getSubtitle()}
              </Typography>
            </Box>
            <ArrowIcon sx={{ color: platinumTheme.text.secondary, fontSize: 18 }} />
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ResultSkeleton = () => {
  <Card sx={{ mb: 1.5, borderRadius: 2 }}>
    <CardContent sx={{ p: 2 }}>
      <Stack direction='row' spacing={2} alignItems='center'>
        <Skeleton variant='circular' width={40} height={40} />
        <Box flex={1}>
          <Skeleton variant='text' width='60%' height={24} />
          <Skeleton variant='text' width='40%' height={16} sx={{ mt: 0.5 }} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
};

const TabPanel = ({ children, value, index }) => {
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
};

export const AdminSearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    users: [], doctors: [], patients: [], staff: [], appointments: []
  });
  const [tabValue, setTabValue] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      setHasSearched(false);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await adminService.searchItems(query);
      if (response.data.status === 'success') {
        setResults(response.data.data);
        const categories = ['users', 'doctors', 'patients', 'staff', 'appointments'];
        const firstNonEmptyIndex = categories.findIndex(cat => response.data.data[cat]?.length > 0);

        if (firstNonEmptyIndex !== -1) {
          setTabValue(firstNonEmptyIndex + 1)
        }
      }
    } catch (err) {
      toast.error('Search failed.Try again.');
      setResults({ users: [], doctors: [], patients: [], staff: [], appointments: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults({ users: [], doctors: [], patients: [], staff: [], appointments: [] });
    setHasSearched(false);
    navigate('/admin/search');
  };

  const handleNavigate = (result, type) => {
    switch (type) {
      case 'All users':
        navigate('/admin/users');
        break;
      case 'Audit logs':
        navigate('/admin/audit-logs');
        break;
      case 'Generate report':
        navigate('/admin/reports/generate');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const totalResults = Object.values(results).flat().length;
  const categories = [
    { key: 'users', label: 'Users', icon: <UsersIcon />, count: results.users?.length || 0 },
    { key: 'doctors', label: 'Doctors', icon: <DoctorIcon />, count: results.doctors?.length || 0 },
    { key: 'patients', label: 'Patients', icon: <PersonIcon />, count: results.users?.length || 0 },
    { key: 'staff', label: 'Staff', icon: <UsersIcon />, count: results.staff?.length || 0 },
    { key: 'appointments', label: 'Appointments', icon: <AppointmentIcon />, count: results.appointments?.length || 0 },
  ];

  const activeCategories = categories.filter(c => c.count > 0);
  return (
    <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
      <PremiumHeader>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>🔍 Search</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Search across users, doctors, patients, and more</Typography>
        </motion.div>
      </PremiumHeader>

      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${alpha(platinumTheme.primary.main, 0.2)}`,
          borderRadius: 3,
          mb: 4,
          transition: 'all 0.2s',
          '&:focus-within': {
            borderColor: platinumTheme.secondary.main,
            boxShadow: `0 0 0 3px ${alpha(platinumTheme.secondary.main, 0.2)}`,
          },
        }}
      >
        <SearchIcon sx={{ mx: 2, color: platinumTheme.text.secondary }} />
        <TextField
          fullWidth
          placeholder="Search by name, email, role, test name, or appointment..."
          variant="standard"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{ disableUnderline: true, sx: { py: 1.5 } }}
        />
        {searchQuery && (
          <IconButton onClick={handleClearSearch} size="small" sx={{ mr: 1 }}>
            <ClearIcon />
          </IconButton>
        )}
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          sx={{
            borderRadius: 2,
            mx: 1,
            bgcolor: platinumTheme.secondary.main,
            '&:hover': { bgcolor: platinumTheme.secondary.dark },
          }}
        >
          Search
        </Button>
      </Paper>

      {hasSearched && !loading && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>
            <strong>{totalResults}</strong> result{totalResults !== 1 ? 's' : ''} for "
            <strong>{searchQuery}</strong>"
          </Typography>
        </Box>
      )}

      {loading && (
        <Stack spacing={1}>
          <ResultSkeleton />
          <ResultSkeleton />
          <ResultSkeleton />
        </Stack>
      )}

      {!loading && hasSearched && totalResults === 0 && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
          }}
        >
          <SearchIcon sx={{ fontSize: 64, color: platinumTheme.text.secondary, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            No results found
          </Typography>
          <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>
            We couldn't find any matches for "{searchQuery}". Try different keywords or check spelling.
          </Typography>
        </Paper>
      )}

      {!loading && totalResults > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}` }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              px: 2,
              pt: 1,
              borderBottom: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 48,
              },
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SearchIcon fontSize="small" />
                  <span>All Results</span>
                  <Chip label={totalResults} size="small" sx={{ ml: 0.5, height: 20 }} />
                </Box>
              }
            />
            {categories.map((cat) => (
              cat.count > 0 && (
                <Tab
                  key={cat.key}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {cat.icon}
                      <span>{cat.label}</span>
                      <Chip label={cat.count} size="small" sx={{ ml: 0.5, height: 20 }} />
                    </Box>
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
                  {results[category.key]?.slice(0, 3).map((result, idx) => (
                    <ResultItem
                      key={idx}
                      result={result}
                      type={category.key}
                      onNavigate={handleNavigate}
                    />
                  ))}
                  {results[category.key]?.length > 3 && (
                    <Button
                      size="small"
                      onClick={() => {
                        const tabIndex = categories.findIndex(c => c.key === category.key);
                        setTabValue(tabIndex + 1);
                      }}
                      sx={{ mt: 0.5, textTransform: 'none' }}
                    >
                      Show all {category.count} results →
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          </TabPanel>
          {categories.map((category, idx) => (
            <TabPanel key={category.key} value={tabValue} index={idx + 1}>
              <Box sx={{ p: 2 }}>
                {results[category.key]?.map((result, ridx) => (
                  <ResultItem
                    key={ridx}
                    result={result}
                    type={category.key}
                    onNavigate={handleNavigate}
                  />
                ))}
              </Box>
            </TabPanel>
          ))}
        </Paper>
      )}

      {!hasSearched && !loading && (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
          }}
        >
          <SearchIcon sx={{ fontSize: 64, color: platinumTheme.text.secondary, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Search across the system
          </Typography>
          <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>
            Enter a search term above to find users, doctors, patients, lab requests, or appointments.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Chip label="Search by name" variant="outlined" />
            <Chip label="Search by email" variant="outlined" />
            <Chip label="Search by role" variant="outlined" />
            <Chip label="Search by test name" variant="outlined" />
          </Box>
        </Paper>
      )}
    </Box>
  );
};