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
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  LinearProgress,
  Avatar,
  Fade,
  Slide,
  Grow,
  Zoom,
  alpha,
  useTheme,
  Stack,
  Divider,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  MedicalServices as MedicalIcon,
  Medication as MedicationIcon,
  Science as LabIcon,
  Warning as AllergyIcon,
  Healing as DiagnosisIcon,
  Favorite as VitalsIcon,
  Note as NoteIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/authContext';
import PatientService from '../../../services/users/patient';
import { formatDate, getInitials } from '../../../formatters';
import RecordCard from '../../../components/medical/RecordCard';
import VitalChart from '../../../components/medical/VitalCard';

const HeroSection = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
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
    background: `radial-gradient(circle, ${alpha('#fff', 0.2)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    background: `radial-gradient(circle, ${alpha('#fff', 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: color,
  },
}));

const SearchBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.spacing(5),
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

export const MedicalRecords = () => {
  const navigate = useNavigate();
  const user = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [recordType, setRecordType] = useState('diagnosis');
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, tabValue]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await PatientService.getMedicalRecords();
      setRecords(response.data.records);
      setVitals(response.data.vitals || []);
      setError('');
    } catch (err) {
      setError('Failed to load medical records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    if (!records) return;
    let filtered = [];
    const typeMap = ['diagnoses', 'medications', 'allergies', 'lab_results', 'procedures', 'immunizations', 'notes'];
    const currentType = typeMap[tabValue];

    if (currentType && records[currentType]) {
      filtered = [...records[currentType]];
    } else if (tabValue === 0) {
      filtered = [
        ...(records.diagnoses || []),
        ...(records.medications || []),
        ...(records.alergies || []),
        ...(records.lab_results || []),
        ...(records.precedures || []),
        ...(records.immunizations || []),
        ...(records.notes || []),
      ];
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredRecords(filtered);
  };

  const handleAddRecord = async () => {
    setSubmitting(true)
    try {
      const payload = {
        recordType: recordType, title: formData.title, description: formData.description, severity: formData.severity, status: 'active', data: {},
      };
      if (recordType === 'medication') {
        payload.data = {
          dosage: formData.dosage, instructions: formData.instructions,
        };
      } else if (recordType === 'allergy') {
        payload.data = { reaction: formData.reaction };
      } else if (recordType === 'lab') {
        payload.data = {
          result: formData.result, refrence_range: formData.refrence_range,
        };
      }

      await PatientService.addMedicalrecords(payload);
      setAddDialog(false);
      fetchMedicalRecords();
      setFormData({});
    } catch (err) {
      setSubmitting(false);
    }
  };

  const handleExportAll = () => {
    if (filteredRecords.length === 0) {
      alert('No records present.');
      return;
    }
    const dataStr = JSON.stringify(filteredRecords, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `records-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewRecord = async () => {
    navigate(`/patient/records`);
  };

  const handleDownload = (record) => {
    if (!record) return;
    const dataStr = JSON.stringify(record, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${record.name || record.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const action = [
    { icon: <DiagnosisIcon />, name: 'Add Diagnosis', action: () => { setRecordType('diagnosis'); setAddDialog(true); } },
    { icon: <MedicalIcon />, name: 'Add Medication', action: () => { setRecordType('medication'); setAddDialog(true); } },
    { icon: <AllergyIcon />, name: 'Add Allergy', action: () => { setRecordType('allergy'); setAddDialog(true); } },
    { icon: <LabIcon />, name: 'Add Lab Result', action: () => { setRecordType('lab'); setAddDialog(true); } },
    { icon: <NoteIcon />, name: 'Add Note', action: () => { setRecordType('notes'); setAddDialog(true); } },
  ];

  const tabs = [
    { label: 'All', icon: <DashboardIcon />, count: filterRecords.length },
    { label: 'Diagnoses', icon: <DiagnosisIcon />, count: records?.diagnoses?.length || 0 },
    { label: 'Medications', icon: <MedicalIcon />, count: records?.medications?.length || 0 },
    { label: 'Allergy', icon: <AllergyIcon />, count: records?.allrgies?.length || 0 },
    { label: 'Lab Results', icon: <LabIcon />, count: records?.lab_results?.length || 0 },
    { label: 'Notes', icon: <NoteIcon />, count: records?.notes?.length || 0 },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      <Slide direction="down" in={true} timeout={500}>
        <HeroSection>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MedicalIcon sx={{ fontSize: 40 }} />
                My Medical Records
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                View and manage your complete medical history, diagnoses, medications, and lab results all in one place.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportAll}
                sx={{
                  bgcolor: alpha('#fff', 0.2),
                  '&:hover': { bgcolor: alpha('#fff', 0.3) },
                  borderRadius: 3,
                  px: 3,
                }}
              >
                Export All Records
              </Button>
            </Grid>
          </Grid>
        </HeroSection>
      </Slide>

      <Fade in timeout={800}>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Grow in timeout={900}>
              <StatCard color={theme.palette.primary.main} onClick={() => setTabValue(1)}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <DiagnosisIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {records?.diagnoses?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Active Diagnoses</Typography>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Grow in timeout={1000}>
              <StatCard color={theme.palette.success.main} onClick={() => setTabValue(2)}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MedicationIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {records?.medications?.filter(m => m.status === 'active').length || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Active Medications</Typography>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Grow in timeout={1100}>
              <StatCard color={theme.palette.warning.main} onClick={() => setTabValue(3)}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AllergyIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {records?.allergies?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Allergies</Typography>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Grow in timeout={1200}>
              <StatCard color={theme.palette.info.main} onClick={() => setTabValue(4)}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LabIcon sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {records?.lab_results?.length || 0}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">Lab Results</Typography>
                </CardContent>
              </StatCard>
            </Grow>
          </Grid>
        </Grid>
      </Fade>

      {vitals.length > 0 && (
        <Zoom in timeout={1300}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <VitalsIcon color="error" />
              Vital Signs Trends
            </Typography>
            <VitalChart data={vitals} />
          </Paper>
        </Zoom>
      )}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[3] }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.8) }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Tabs
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ px: 2 }}
              >
                {tabs.map((tab, idx) => (
                  <Tab
                    key={idx}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {tab.icon}
                        <span>{tab.label}</span>
                        <Badge
                          badgeContent={tab.count}
                          color="primary"
                          sx={{ ml: 1, '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                        />
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Grid>
            <Grid item sx={{ px: 2, py: 1 }}>
              <SearchBar elevation={0}>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <TextField
                  placeholder="Search records..."
                  variant="standard"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ disableUnderline: true }}
                  sx={{ minWidth: 200 }}
                />
                {searchTerm && (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </SearchBar>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ p: 3, maxHeight: 600, overflow: 'auto', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
          {filteredRecords.length > 0 ? (
            <Fade in timeout={500}>
              <Box>
                {filteredRecords.map((record, idx) => (
                  <Grow in timeout={500 + idx * 50} key={record.id}>
                    <div>
                      <RecordCard
                        record={record}
                        onClick={handleViewRecord}
                        onDownload={handleDownload}
                      />
                    </div>
                  </Grow>
                ))}
              </Box>
            </Fade>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <MedicalIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {searchTerm ? 'No matching records found' : 'Your medical records will appear here'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {searchTerm ? 'Try adjusting your search term' : 'Add your first medical record to get started'}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddDialog(true)}
                >
                  Add Your First Record
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      <SpeedDial
        ariaLabel="Add Medical Record"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
            tooltipOpen
          />
        ))}
      </SpeedDial>

      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="sm" fullWidth TransitionComponent={Zoom}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Add {recordType === 'diagnosis' ? 'Diagnosis' :
                recordType === 'medication' ? 'Medication' :
                  recordType === 'allergy' ? 'Allergy' :
                    recordType === 'lab' ? 'Lab Result' : 'Note'}
            </Typography>
            <IconButton onClick={() => setAddDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
            autoFocus
          />

          {recordType === 'diagnosis' && (
            <>
              <TextField
                fullWidth
                label="ICD-10 Code"
                value={formData.icd10_code || ''}
                onChange={(e) => setFormData({ ...formData, icd10_code: e.target.value })}
                margin="normal"
                helperText="Optional"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity || 'moderate'}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  label="Severity"
                >
                  <MenuItem value="mild">Mild</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="severe">Severe</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {recordType === 'medication' && (
            <>
              <TextField
                fullWidth
                label="Dosage"
                value={formData.dosage || ''}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                margin="normal"
                placeholder="e.g., 500mg"
                required
              />
              <TextField
                fullWidth
                label="Frequency"
                value={formData.frequency || ''}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                margin="normal"
                placeholder="e.g., Twice daily"
                required
              />
              <TextField
                fullWidth
                label="Instructions"
                value={formData.instructions || ''}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                margin="normal"
                multiline
                rows={2}
                placeholder="e.g., Take with food"
              />
            </>
          )}

          {recordType === 'allergy' && (
            <>
              <TextField
                fullWidth
                label="Reaction"
                value={formData.reaction || ''}
                onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity || 'moderate'}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  label="Severity"
                >
                  <MenuItem value="mild">Mild</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="severe">Severe</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          {recordType === 'lab' && (
            <>
              <TextField
                fullWidth
                label="Result"
                value={formData.result || ''}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Reference Range"
                value={formData.reference_range || ''}
                onChange={(e) => setFormData({ ...formData, reference_range: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.abnormal ? 'abnormal' : 'normal'}
                  onChange={(e) => setFormData({ ...formData, abnormal: e.target.value === 'abnormal' })}
                  label="Status"
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="abnormal">Abnormal</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          <TextField
            fullWidth
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
            placeholder="Additional details..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddRecord}
            variant="contained"
            disabled={submitting || !formData.title}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Add Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
