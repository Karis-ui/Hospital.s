import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  FormGroup,
  FormLabel,
  Stack,
  Tooltip,
  Snackbar,
  alpha,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TableHead,
} from '@mui/material';
import {
  Science as LabIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Warning as WarningIcon,
  Upload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, renderMatches } from 'react-router-dom';
import { formatTestParameter, validateResultsFormatter } from '../../../formatters';
import { labServices } from '../../../services/users/labtech';
import { renderHTML } from 'framer-motion';

const steps = ['Sample Collection', 'Perform Analysis', 'Enter Results', 'Quality Check', 'Finalize Report'];

export const ProcessTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [testRequest, setTestRequest] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    sample_collected: false,
    sample_collected_by: '',
    sample_collected_date: '',
    results: [],
    equipment_used: '',
    performed_by: '',
    performed_date: '',
    quality_checked: true,
    quality_checked_notes: '',
    finalized: false,
    notes: '',
  });
  const [newParameter, setNewParameter] = useState({ name: '', value: '', unit: '', refernce_range: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTestDetails();
  }, [id]);

  const fetchTestDetails = async () => {
    setLoading(true);
    try {
      const response = await labServices.getDetailRequestView(id);
      if (response.data.status === 'success') {
        setTestRequest(response.data.data);
        const defaultParams = formatTestParameter(response.data.data.test_name);
        if (defaultParams.length > 0) {
          setFormData(prev => ({
            ...prev, results: defaultParams.map(p => ({ ...p, value: '', status: 'pending', })),
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching test details:', err);
      setError('Failed to load test details. Please try again.');
      setSnackbar({ open: true, message: 'Failed to load test details. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleFinalize();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFinalize = async () => {
    setSaving(true);
    try {
      const reportData = new FormData();
      const resultsData = {
        parameters: formData.results,
        equipment_used: formData.equipment_used,
        performed_by: formData.performed_by,
        performed_date: formData.performed_date,
        quaility_control: {
          passed: formData.quality_checked,
          notes: formData.quality_checked_notes,
        },
        notes: formData.notes,
      };

      reportData.append('results', JSON.stringify(resultsData));
      reportData.append('remarks', formData.notes);
      reportData.append('equipment_used', formData.equipment_used);
      reportData.append('quality_checked', formData.quality_checked);

      const reportBlob = new Blob([JSON.stringify(resultsData, null, 2)], { type: 'application/json' });
      reportData.append('report_file', reportBlob, `lab_report_${id}.json`);
      await labServices.uploadLabReport(id, reportData);
      setSnackbar({ open: true, message: 'Lab report finalized and uploaded successfully!', severity: 'success' });
      setTimeout(() => { navigate(`/lab/requests/${id}`) }, 2000);
    } catch (err) {
      console.error('Error finalizing report:', err);
      setSnackbar({ open: true, message: 'Failed to finalize report. Please try again.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResultChange = (index, value) => {
    const updateResults = [...formData.results];
    updateResults[index].value = value;
    const validation = validateResultsFormatter(value, updateResults[index]);
    updateResults[index].status = validation.status;
    updateResults[index].validationMessage = validation.message;

    setFormData(prev => ({ ...prev, results: updateResults }));
  };

  const addCustomParameter = () => {
    if (newParameter.name) {
      setFormData(prev => ({
        ...prev, results: [...prev.results, { ...newParameter, status: 'pending' }],
      }));
      setNewParameter({ name: '', value: '', unit: '', refernce_range: '' });
    }
  };

  const removeParameter = (index) => {
    const updateResults = formData.results.filter((_, i) => i !== index);

    setFormData(prev => ({ ...prev, results: updateResults }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return theme.palette.success.main;
      case 'high': return theme.palette.error.main;
      case 'low': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 0:
        return (
          <Box>
            <Alert security='info' sx={{ mb: 3 }}>Confirm sample collection details before proceeding.</Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel control={<Switch checked={formData.sample_collected} onChange={(e) => setFormData(prev => ({ ...prev, sample_collected: e.target.checked }))} />} label="Sample Collected" color='primary' />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Collected By" fullWidth multiline value={formData.sample_collected_by} onChange={(e) => setFormData(prev => ({ ...prev, sample_collected_by: e.target.value }))} disabled={!formData.sample_collected} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Collection Notes" fullWidth multiline value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} disabled={!formData.sample_collected} placeholder='Any special notes about sample collection...' />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Record equipment and reagents used for this test.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Equipment Used"
                  value={formData.equipment_used}
                  onChange={(e) => setFormData({ ...formData, equipment_used: e.target.value })}
                  placeholder="e.g., Sysmex XN-9000, Roche Cobas 6000"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Performed By (Technician Name)"
                  value={formData.performed_by}
                  onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reagents Used"
                  value={formData.reagents_used.join(', ')}
                  onChange={(e) => setFormData({ ...formData, reagents_used: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="Enter reagents separated by commas"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Enter Test Results
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell>Parameter</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Reference Range</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.test_results.map((param, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {param.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={param.value}
                          onChange={(e) => handleResultChange(index, e.target.value)}
                          placeholder="Enter value"
                          sx={{ width: 120 }}
                          InputProps={{
                            endAdornment: param.unit && (
                              <Typography variant="caption" color="textSecondary">
                                {param.unit}
                              </Typography>
                            ),
                          }}
                        />
                      </TableCell>
                      <TableCell>{param.unit || '-'}</TableCell>
                      <TableCell>{param.reference_range || '-'}</TableCell>
                      <TableCell>
                        {param.status && param.status !== 'pending' && (
                          <Chip
                            icon={getStatusIcon(param.status)}
                            label={param.status.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: alpha(getStatusColor(param.status), 0.1),
                              color: getStatusColor(param.status),
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => removeParameter(index)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddIcon fontSize="small" />
                  Add Custom Parameter
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Parameter Name"
                      value={newParameter.name}
                      onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Unit"
                      value={newParameter.unit}
                      onChange={(e) => setNewParameter({ ...newParameter, unit: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Reference Range"
                      value={newParameter.refernce_range}
                      onChange={(e) => setNewParameter({ ...newParameter, refernce_range: e.target.value })}
                      placeholder="e.g., 70-100 or <200"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addCustomParameter}
                      fullWidth
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Please verify all results and perform quality control checks.
            </Alert>

            <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Quality Control Verification
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.quality_checked}
                    onChange={(e) => setFormData({ ...formData, quality_checked: e.target.checked })}
                    color="success"
                  />
                }
                label="Quality Control Passed"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Quality Control Notes"
                value={formData.quality_checked_notes}
                onChange={(e) => setFormData({ ...formData, quality_checked_notes: e.target.value })}
                placeholder="Enter quality control verification details..."
                sx={{ mt: 2 }}
              />
            </Paper>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Review all information before finalizing.
            </Alert>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Test Name:</Typography>
                    <Typography variant="body2">{testRequest?.test_name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Patient:</Typography>
                    <Typography variant="body2">{testRequest?.patient?.first_name} {testRequest?.patient?.last_name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Equipment Used:</Typography>
                    <Typography variant="body2">{formData.equipment_used || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Performed By:</Typography>
                    <Typography variant="body2">{formData.performed_by || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="textSecondary">Performed At:</Typography>
                    <Typography variant="body2">{formData.performed_date || 'Not specified'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Parameters Tested:</Typography>
                    <Typography variant="body2">{formData.results.length} parameters</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">Quality Control:</Typography>
                    <Chip
                      label={formData.quality_checked ? 'Passed' : 'Failed'}
                      size="small"
                      sx={{
                        ml: 1,
                        bgcolor: formData.quality_checked ? '#e8f5e9' : '#ffebee',
                        color: formData.quality_checked ? '#2e7d32' : '#c62828',
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading test details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Cancel
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Process Test
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {testRequest?.test_name} - {testRequest?.patient?.first_name} {testRequest?.patient?.last_name}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        {renderHTML(activeStep)}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0 || saving}
          startIcon={<PrevIcon />}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={saving}
          endIcon={activeStep === steps.length - 1 ? <SaveIcon /> : <NextIcon />}
        >
          {activeStep === steps.length - 1 ? (saving ? 'Saving...' : 'Finalize') : 'Next'}
        </Button>
      </Box>

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