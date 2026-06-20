import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Avatar,
  Fade,
  Grow,
  Zoom,
  alpha,
  useTheme,
  Divider,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Collapse,
  Menu,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Search as SearchIcon,
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
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  FileDownload as FileDownloadIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  LocalHospital as HospitalIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/authContext';
import { doctorSevice } from '../../../services/users/doctor';
import { formatDate, getInitials, formatPhone } from '../../../formatters';
import VitalChart from '../../../components/medical/VitalCard';
import RecordCard from '../../../components/medical/RecordCard';


const HeroSection = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
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

const PatientCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  marginBottom: theme.spacing(3),
  overflow: 'visible',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
}));

const PatientAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[5],
  position: 'absolute',
  top: -50,
  left: 20,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
}));

const InfoChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: 'inherit',
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

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const QuickActionCard = styled(Card)(({ theme, color }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha(color, 0.02)} 100%)`,
  border: `1px solid ${alpha(color, 0.2)}`,
  '&:hover': {
    transform: 'translateY(-5px)',
    background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
    borderColor: color,
    boxShadow: `0 8px 20px ${alpha(color, 0.2)}`,
  },
}));

export const PatientMedicalRecords = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const Refgrid = React.useRef();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
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
  const [anchorE1, setAnchorE1] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchPatientRecords();
  }, [patientId]);
  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, tabValue]);

  const fetchPatientRecords = async () => {
    try {
      setLoading(true);
      const response = await doctorSevice.getPatientMedicalRecords(patientId);
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

      await doctorSevice.addPatientMedicalrecords(patientId, payload);
      setAddDialog(false);
      fetchPatientRecords();
      setFormData({});
    } catch (err) {
      console.error('Failed to add record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordCunt = (type) => {
    if (type === 'all') return records.length;
    return records.filter(r => r.record_type === type.length);
  };

  const handleContactPatient = () => {
    if (patient?.phone) {
      window.location.href = `tel:${patient.phone}`;
    }
  };

  const handleEmailPatient = () => {
    if (patient?.email) {
      window.location.href = `mailto:${patient.email}`;
    }
  };

  const handleExport = () => {
    const csvExport = {
      delimiter: '', utfWithBom: true
    };
    Refgrid.current.exportDataAsCsv(csvExport);
  };

  const handleViewRecord = (record) => {
    navigate(`/doctor/patients/${record.id}/Medical-records`)
  }

  const quickActions = [
    { icon: <DiagnosisIcon />, name: 'Add Diagnosis', color: theme.palette.primary.main, action: () => { setRecordType('diagnosis'); setAddDialog(true); } },
    { icon: <MedicalIcon />, name: 'Add Medication', color: theme.palette.success.main, action: () => { setRecordType('medication'); setAddDialog(true); } },
    { icon: <AllergyIcon />, name: 'Add Allergy', color: theme.palette.warning.main, action: () => { setRecordType('allergy'); setAddDialog(true); } },
    { icon: <LabIcon />, name: 'Add Lab Result', color: theme.palette.info.main, action: () => { setRecordType('lab'); setAddDialog(true); } },
    { icon: <NoteIcon />, name: 'Add Note', color: theme.palette.secondary.main, action: () => { setRecordType('notes'); setAddDialog(true); } },
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress size={60} thickness={4} /></Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={handleViewRecord}
          sx={{
            mr: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Patient Medical Records
        </Typography>
      </Box>

      <HeroSection>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ ml: { xs: 0, md: 12 } }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {patient?.first_name} {patient?.last_name}
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                <Chip
                  icon={<CalendarIcon />}
                  label={`DOB: ${formatDate(patient?.date_of_birth)}`}
                  sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}
                />
                <Chip
                  icon={<PersonIcon />}
                  label={`Gender: ${patient?.gender || 'Not specified'}`}
                  sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}
                />
                <Chip
                  icon={<MedicalIcon />}
                  label={`Blood: ${patient?.blood_type || 'Unknown'}`}
                  sx={{ bgcolor: alpha('#fff', 0.2), color: 'white' }}
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<PhoneIcon />}
                  onClick={handleContactPatient}
                  sx={{ bgcolor: alpha('#fff', 0.2), '&:hover': { bgcolor: alpha('#fff', 0.3) } }}
                >
                  Contact Patient
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EmailIcon />}
                  onClick={handleEmailPatient}
                  sx={{ bgcolor: alpha('#fff', 0.2), '&:hover': { bgcolor: alpha('#fff', 0.3) } }}
                >
                  Email
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExport}
                  sx={{ bgcolor: alpha('#fff', 0.2), '&:hover': { bgcolor: alpha('#fff', 0.3) } }}
                >
                  Export as CSV
                </Button>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                margin: '0 auto',
                bgcolor: alpha('#fff', 0.2),
                fontSize: '3rem',
                fontWeight: 700,
                border: `4px solid ${alpha('#fff', 0.5)}`,
              }}
            >
              {getInitials(patient?.first_name, patient?.last_name)}
            </Avatar>
          </Grid>
        </Grid>
      </HeroSection>

      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action, idx) => (
              <Grid item xs={6} sm={4} md={2.4} key={idx}>
                <Grow in timeout={900 + idx * 100}>
                  <QuickActionCard color={action.color} onClick={action.action}>
                    <Box sx={{ color: action.color, fontSize: 40, mb: 1 }}>
                      {action.icon}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {action.label}
                    </Typography>
                  </QuickActionCard>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>

      {vitals.length > 0 && (
        <Zoom in timeout={1000}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <VitalsIcon color="error" />
              Vital Signs History
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
                {searchTerm ? 'No matching records found' : 'No medical records for this patient'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {searchTerm ? 'Try adjusting your search term' : 'Add a record using the quick actions above'}
              </Typography>
              {!searchTerm && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => { setRecordType('diagnosis'); setAddDialog(true); }}
                >
                  Add First Record
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
        {quickActions.map((action) => (
          <SpeedDialAction
            key={action.label}
            icon={action.icon}
            tooltipTitle={action.label}
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
                    recordType === 'lab' ? 'Lab Order' : 'Note'} for {patient?.first_name}
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
                label="Test Name"
                value={formData.test_name || ''}
                onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority || 'routine'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="routine">Routine</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                  <MenuItem value="stat">STAT</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Instructions"
                value={formData.instructions || ''}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                margin="normal"
                multiline
                rows={2}
                placeholder="Special instructions for lab..."
              />
            </>
          )}

          <TextField
            fullWidth
            label="Description / Notes"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
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