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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Tooltip,
  Zoom,
  Badge,
  Collapse,
  Slider,
  Rating,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Search as SearchIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Science as LabIcon,
  Receipt as ReceiptIcon,
  Medication as MedicationIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { PatientService } from '../../../services/users/patient';
import { formatDate, formatCurrency } from '../../../formatters';

const ResultCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateX(5px)',
    boxShadow: theme.shadows[5],
  },
}));

const CategoryIcon = styled(Avatar)(({ theme, category }) => ({
  backgroundColor: 
    category === 'appointment' ? alpha(theme.palette.primary.main, 0.1) :
    category === 'doctor' ? alpha(theme.palette.success.main, 0.1) :
    category === 'lab' ? alpha(theme.palette.info.main, 0.1) :
    category === 'bill' ? alpha(theme.palette.warning.main, 0.1) :
    category === 'prescription' ? alpha(theme.palette.secondary.main, 0.1) :
    alpha(theme.palette.grey[500], 0.1),
  color: 
    category === 'appointment' ? theme.palette.primary.main :
    category === 'doctor' ? theme.palette.success.main :
    category === 'lab' ? theme.palette.info.main :
    category === 'bill' ? theme.palette.warning.main :
    category === 'prescription' ? theme.palette.secondary.main :
    theme.palette.grey[500],
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minHeight: 48,
}));

export const SearchResults = () =>{
    const navigate = useNavigate();
    const location = useLocation();
    const [loading,setLoading] = useState(false);
    const [results,setResults] = useState(null);
    const [searchTerm,setSearchTerm] = useState('');
    const [filteredResults,setFilteredResults] = useState(null);
    const [recentSearches, setRecentSearches] = useState([]);
    const [suggestions,setSuggestions] = useState([]);
    const [showFilters,setShowFilters] = useState(false);
    const [selectedCategory,setSelectedCategory] = useState('all');
    const [dateRange,setDateRange] = useState({start: null,end: null});
    const [sortBy,setSortBy] = useState('relevance');
    const [savedResults,setSavedResults] = useState([]);
    const [page,setPage] = useState(1);
    const [totalPages,setTotalPages] = useState(1);
    const itemsPerPage = 20;

    useEffect(() =>{
        if(location.state?.query){
            setSearchTerm(location.state.query);
            performSearch(location.state.query);
        }

        const saved = localStorage.getItem('recentSearches');
        if(saved){
            setRecentSearches(JSON.parse(saved));
        }
    },[location.state]);

    useEffect(() =>{
        if(results){
            applyFilters();
        }
    },[results,selectedCategory,dateRange,sortBy]);

    const performSearch = async(query) =>{
        setLoading(true);
        try{
            const response = await PatientService.searchAll(query);
            setResults(response.data);
            const updated = [query,...recentSearches.filter(s=>s !== query)].slice(0,5);
            setPage(updated);
            localStorage.setItem('recentSearches',JSON.stringify(updated));
            const suggestionsResponse = await PatientService.getSearchSuggestions(query);
            setSuggestions(suggestionsResponse.data);
        }catch(err){
            console.error('Search failed.Try again!');
            toast.error('Search failed.');
        }finally{
            setLoading(false);
        }
    };

    const applyFilters = () =>{
        if(!results) return;
        let filtered = {...results};
        if(selectedCategory !== 'all'){
            filtered = {
                [selectedCategory]: results[selectedCategory] || [],total: results[selectedCategory]?.length || 0,
            };
        }
        if(dateRange.start || dateRange.end){

        }
        setFilteredResults(filtered);
        setTotalPages(Math.ceil((filtered.total || 0) / itemsPerPage));
        setPage(1);
    };

    const handleSearch = (e) =>{
        e.preventDefault();
        if(searchTerm.trim()){
            performSearch(searchTerm);
        }
    };

    const handleClearSearch = () =>{
        searchTerm('');
        setResults(null);
        setFilteredResults(null);
    };

    const handleSaveResult = (result) =>{
        const isSaved = savedResults.some(r => r.id === result.id);
        if(isSaved){
            setSavedResults(savedResults.filter(r => r.id !== result.id));
            toast.info('Removed from saved results');
        }else{
            setSavedResults([...savedResults,result]);
            toast.success('Saved for later.');
        }
    };

    const handleResultClick = (result) =>{
        navigate(result.path);
    };

    const getCategoryCount = (category) =>{
        return results?.[category]?.length || 0;
    };

    const currentResults = filteredResults || results;
    return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSearch}>
          <TextField
            fullWidth
            placeholder="Search appointments, doctors, lab results, bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="large"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </form>

        {recentSearches.length > 0 && !results && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="textSecondary">
              Recent searches:
            </Typography>
            {recentSearches.map((search, index) => (
              <Chip
                key={index}
                label={search}
                onClick={() => {
                  setSearchTerm(search);
                  performSearch(search);
                }}
                onDelete={() => {
                  const updated = recentSearches.filter((_, i) => i !== index);
                  setRecentSearches(updated);
                  localStorage.setItem('recentSearches', JSON.stringify(updated));
                }}
                icon={<HistoryIcon />}
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        )}
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : results ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Filter Results
              </Typography>
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">
                    All Categories ({results.total})
                  </MenuItem>
                  <MenuItem value="appointments">
                    Appointments ({getCategoryCount('appointments')})
                  </MenuItem>
                  <MenuItem value="doctors">
                    Doctors ({getCategoryCount('doctors')})
                  </MenuItem>
                  <MenuItem value="labs">
                    Lab Results ({getCategoryCount('labs')})
                  </MenuItem>
                  <MenuItem value="bills">
                    Bills ({getCategoryCount('bills')})
                  </MenuItem>
                  <MenuItem value="prescriptions">
                    Prescriptions ({getCategoryCount('prescriptions')})
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="date_desc">Newest First</MenuItem>
                  <MenuItem value="date_asc">Oldest First</MenuItem>
                  <MenuItem value="name_asc">Name A-Z</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSelectedCategory('all');
                  setDateRange({ start: null, end: null });
                  setSortBy('relevance');
                }}
              >
                Clear Filters
              </Button>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Search Tips
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Use specific keywords" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Search by doctor name" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Include dates (e.g., 'March 2024')" />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Found {currentResults?.total || 0} results for "{searchTerm}"
                </Typography>
                <Chip
                  icon={<FilterIcon />}
                  label={showFilters ? 'Hide Filters' : 'Show Filters'}
                  onClick={() => setShowFilters(!showFilters)}
                  clickable
                />
              </Box>

              <Tabs
                value={selectedCategory}
                onChange={(e, v) => setSelectedCategory(v)}
                sx={{ mt: 2 }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <StyledTab label={`All (${results.total})`} value="all" />
                <StyledTab label={`Appointments (${getCategoryCount('appointments')})`} value="appointments" />
                <StyledTab label={`Doctors (${getCategoryCount('doctors')})`} value="doctors" />
                <StyledTab label={`Lab Results (${getCategoryCount('labs')})`} value="labs" />
                <StyledTab label={`Bills (${getCategoryCount('bills')})`} value="bills" />
                <StyledTab label={`Prescriptions (${getCategoryCount('prescriptions')})`} value="prescriptions" />
              </Tabs>
            </Paper>

            {currentResults && (
              <>
                {(!selectedCategory || selectedCategory === 'all' || selectedCategory === 'appointments') &&
                 currentResults.appointments?.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    {selectedCategory === 'all' && (
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Appointments
                      </Typography>
                    )}
                    {currentResults.appointments.map((result) => (
                      <ResultCard key={result.id} onClick={() => handleResultClick(result)}>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <CategoryIcon category="appointment">
                              <CalendarIcon />
                            </CategoryIcon>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="h6">{result.title}</Typography>
                                <Chip
                                  label={result.status}
                                  size="small"
                                  color={result.status === 'confirmed' ? 'success' : 'warning'}
                                />
                              </Box>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                {result.subtitle}
                              </Typography>
                              <Typography variant="body2">
                                {result.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                  {formatDate(result.date)}
                                </Typography>
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveResult(result);
                                    }}
                                  >
                                    {savedResults.some(r => r.id === result.id) ? (
                                      <BookmarkIcon color="primary" />
                                    ) : (
                                      <BookmarkBorderIcon />
                                    )}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(result.path);
                                    }}
                                  >
                                    <ArrowForwardIcon />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </ResultCard>
                    ))}
                  </Box>
                )}

                {(!selectedCategory || selectedCategory === 'all' || selectedCategory === 'doctors') &&
                 currentResults.doctors?.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    {selectedCategory === 'all' && (
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Doctors
                      </Typography>
                    )}
                    {currentResults.doctors.map((result) => (
                      <ResultCard key={result.id} onClick={() => handleResultClick(result)}>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <CategoryIcon category="doctor">
                              <PersonIcon />
                            </CategoryIcon>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6">{result.title}</Typography>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                {result.subtitle}
                              </Typography>
                              <Typography variant="body2">
                                {result.description}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Rating value={result.rating} precision={0.1} readOnly size="small" />
                                <Typography variant="caption" color="textSecondary">
                                  {result.rating} / 5
                                </Typography>
                                <Box sx={{ flex: 1 }} />
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveResult(result);
                                  }}
                                >
                                  {savedResults.some(r => r.id === result.id) ? (
                                    <BookmarkIcon color="primary" />
                                  ) : (
                                    <BookmarkBorderIcon />
                                  )}
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(result.path);
                                  }}
                                >
                                  <ArrowForwardIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </ResultCard>
                    ))}
                  </Box>
                )}

                {(!selectedCategory || selectedCategory === 'all' || selectedCategory === 'labs') &&
                 currentResults.labs?.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    {selectedCategory === 'all' && (
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Lab Results
                      </Typography>
                    )}
                    {currentResults.labs.map((result) => (
                      <ResultCard key={result.id} onClick={() => handleResultClick(result)}>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <CategoryIcon category="lab">
                              <LabIcon />
                            </CategoryIcon>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6">{result.title}</Typography>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                {result.subtitle}
                              </Typography>
                              <Typography variant="body2">
                                {result.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Chip
                                  label={result.status}
                                  size="small"
                                  color={result.status === 'completed' ? 'success' : 'warning'}
                                />
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveResult(result);
                                    }}
                                  >
                                    {savedResults.some(r => r.id === result.id) ? (
                                      <BookmarkIcon color="primary" />
                                    ) : (
                                      <BookmarkBorderIcon />
                                    )}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(result.path);
                                    }}
                                  >
                                    <ArrowForwardIcon />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </ResultCard>
                    ))}
                  </Box>
                )}

                {(!selectedCategory || selectedCategory === 'all' || selectedCategory === 'bills') &&
                 currentResults.bills?.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    {selectedCategory === 'all' && (
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Bills
                      </Typography>
                    )}
                    {currentResults.bills.map((result) => (
                      <ResultCard key={result.id} onClick={() => handleResultClick(result)}>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <CategoryIcon category="bill">
                              <ReceiptIcon />
                            </CategoryIcon>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6">{result.title}</Typography>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                {result.subtitle}
                              </Typography>
                              <Typography variant="body2">
                                {result.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(result.amount)}
                                </Typography>
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveResult(result);
                                    }}
                                  >
                                    {savedResults.some(r => r.id === result.id) ? (
                                      <BookmarkIcon color="primary" />
                                    ) : (
                                      <BookmarkBorderIcon />
                                    )}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(result.path);
                                    }}
                                  >
                                    <ArrowForwardIcon />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </ResultCard>
                    ))}
                  </Box>
                )}

                {(!selectedCategory || selectedCategory === 'all' || selectedCategory === 'prescriptions') &&
                 currentResults.prescriptions?.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    {selectedCategory === 'all' && (
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Prescriptions
                      </Typography>
                    )}
                    {currentResults.prescriptions.map((result) => (
                      <ResultCard key={result.id} onClick={() => handleResultClick(result)}>
                        <CardContent>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <CategoryIcon category="prescription">
                              <MedicationIcon />
                            </CategoryIcon>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6">{result.title}</Typography>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                {result.subtitle}
                              </Typography>
                              <Typography variant="body2">
                                {result.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                <Chip
                                  label={result.status}
                                  size="small"
                                  color={result.status === 'active' ? 'success' : 'default'}
                                />
                                <Box>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveResult(result);
                                    }}
                                  >
                                    {savedResults.some(r => r.id === result.id) ? (
                                      <BookmarkIcon color="primary" />
                                    ) : (
                                      <BookmarkBorderIcon />
                                    )}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(result.path);
                                    }}
                                  >
                                    <ArrowForwardIcon />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </ResultCard>
                    ))}
                  </Box>
                )}

                {currentResults.total === 0 && (
                  <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      No Results Found
                    </Typography>
                    <Typography color="textSecondary" sx={{ mb: 3 }}>
                      Try different keywords or check your spelling
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setSearchTerm('');
                        setResults(null);
                      }}
                    >
                      Clear Search
                    </Button>
                  </Paper>
                )}

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Search for anything
          </Typography>
          <Typography color="textSecondary">
            Find appointments, doctors, lab results, bills, and more
          </Typography>
        </Paper>
      )}
    </Box>
  );
}