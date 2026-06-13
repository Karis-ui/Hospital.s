import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Switch,
  FormControlLabel,
  Stack,
  Tooltip,
  Snackbar,
  alpha,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack as BackIcon,
  Science as LabIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Upload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  FileUpload as FileUploadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Schedule as ScheduleIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {toast} from 'react-toastify';
import { labServices } from '../../../services/users/labtech';
import { bg } from 'date-fns/locale';
import {formatTestParameter,validateResultsFormatter} from '../../../formatters';

const PageHeader = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.info.main} 100%)`,
  color: 'white',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
}));

const InfoCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const ResultTable = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  marginBottom: theme.spacing(3),
}));

const StatusChip = styled(Chip)(({ theme ,status}) => {
  const colors = {
    normal: {bg: '#e8f5e9',color: '#2e7d32'},
    high: {bg: '#ffebee',color: '#c62828'},
    low: {bg: '#fff3e0',color: '#ed6c02'},
    critical: {bg: '#ffebee',color: '#d32f2f2f'},
  };
  const config = colors[status] || colors.normal;
  return{backgroundColor: config.bg, color: config.color,fontWeight: 600,};
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

export const UploadResult = ()=>{
    const {id} = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [saving, setSaving] = useState(false);
    const [loading,setLoading] = useState(false);
    const [request, setRequest] = useState(null);
    const [parameters, setParameters] = useState([]);
    const [results, setResults] = useState({});
    const [uploadedFile, setUploadedFile] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [equipmentUsed, setEquipmentUsed] = useState('');
    const [performedBy, setPerformedBy] = useState('');
    const [qualityControlPassed, setQualityControlPassed] = useState(true);
    const [qualityControlNotes, setQualityControlNotes] = useState('');
    const [criticalAlerts, setCriticalAlerts] = useState([]);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(()=>{
      fetchRequestAndTemplate();
    },[id]);

    const fetchRequestAndTemplate = async()=>{
      try{
        const response = await labServices.getDetailRequestView(id);
        if(response.data.status === 'success'){
          const data = response.data.data;
          setRequest(data);

          const testName = data.test_name;
          let template = null;
          for (const [key,value] of Object.entries(TEST_TEMPLATES)){
            if(testName?.includes(key)){
              template = value;
              break;
            }
          }
          if (template){
            setParameters(template.parameters);
            const initialResults = {};
            template.parameters.forEach(param =>{
              initialResults[param.id] = {value:'',status:'pending'};
            });
            setResults(initialResults);
          }
        }
      }
      catch(err){
        toast.error('Failed to load test details.');
      }finally{
        setLoading(false);
      }
    };

    const handleValueChange = (paramId,value,param)=>{
      const numValue = parseFloat(value);
      let status = 'pending';

      if(!isNaN(numValue)){
        const range = param.reference_range;
        if(range.includes('-')){
          const [min,max] = range.split('-').map(Number);
          if(numValue < min) status = 'low';
          else if(numValue > max) status = 'high';
          else status = 'normal';
        }
        else if(range.startsWith('<')){
          const max = parseFloat(range.subString(1));
          status = numValue < max ? 'normal':'high';
        }else if(range.startsWith('>')){
          const min = parseFloat(range.subString(1));
          status = numValue > min? 'normal':'low';
        }

        if(param.is_critical && status !== 'normal'){
          if(!criticalAlerts.includes(param.name)){
            setCriticalAlerts(prev => [...prev,param.name]);
            toast.warning(`Critical: ${param.name} = ${value} ${param.unit}`);
          }
        }
      }

      setResults(prev =>({
        ...prev,[paramId]: {value,status}
      }));
    };

    const handleFileUpload = (event)=>{
      const file = event.target.files[0];
      if(file && file.type === 'application/pdf'){
        setUploadedFile(file);
      }else{
        toast.error('Please upload a pdf file.');
      }
    };

    const handleSubmit = async()=>{
      setSaving(true);
      try{
        const formData = new FormData();
        if(uploadedFile){
          formData.append('report_file',uploadedFile);
        }

        formData.append('results_data',JSON.stringify(results));
        formData.append('remarks',remarks);
        formData.append('performed_by',performedBy);
        formData.append('quality_control_passed',qualityControlPassed);
        formData.append('quality_control_notes',qualityControlNotes);

        const response = await labServices.saveResultEntry(id,formData);
        if(response.data.status === 'success'){
          toast.success(`Results saved ${criticalAlerts.length > 0? 'Critical alerts sent.': ''}`);
          navigate(`/labTechnician/detail_view/${id}/request`);
        }
      }catch(err){
        toast.error('Failed to save Results');
      }finally{
        setSaving(true);
      }
    };

    const getStatusColor = (status)=>{
      switch(status){
        case 'normal': return '#2e7d32';
        case 'high': return '#c62828';
        case 'low': return '#ed6c02';
        case 'critical': return '#d32f2f';
        default :return '#757575';
      }
    };

    if(loading){
      return(
        <Box sx={{p:3}}>
          <LinearProgress/>
          <Typography sx={{mt:2,textAlign:'center'}}>Loading...</Typography>
        </Box>
      );
    }

    return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, borderRadius: 2 }}
      >
        Back
      </Button>

      <PageHeader>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Upload Test Results
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {request?.patient?.first_name} {request?.patient?.last_name} - {request?.test_name}
        </Typography>
      </PageHeader>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<TrendingUpIcon />} label="Manual Entry (For Trends)" />
        <Tab icon={<PdfIcon />} label="Upload PDF Report" />
      </Tabs>
      {activeTab === 0 && (
        <InfoCard>
          <CardContent sx={{ p: 3 }}>
            <SectionTitle variant="h6">
              <LabIcon /> Test Results Entry
              {criticalAlerts.length > 0 && (
                <Chip
                  icon={<WarningIcon />}
                  label={`${criticalAlerts.length} Critical Alert${criticalAlerts.length > 1 ? 's' : ''}`}
                  color="error"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </SectionTitle>

            <ResultTable component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell><strong>Parameter</strong></TableCell>
                    <TableCell><strong>Value</strong></TableCell>
                    <TableCell><strong>Unit</strong></TableCell>
                    <TableCell><strong>Reference Range</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parameters.map((param) => (
                    <TableRow key={param.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {param.name}
                          {param.is_critical && (
                            <Chip label="Critical" size="small" color="error" sx={{ ml: 1, height: 20 }} />
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={results[param.id]?.value || ''}
                          onChange={(e) => handleValueChange(param.id, e.target.value, param)}
                          sx={{ width: 130 }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography variant="caption" color="textSecondary">
                                  {param.unit}
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </TableCell>
                      <TableCell>{param.unit}</TableCell>
                      <TableCell>{param.reference_range}</TableCell>
                      <TableCell>
                        {results[param.id]?.status !== 'pending' && (
                          <StatusChip
                            label={results[param.id]?.status.toUpperCase()}
                            status={results[param.id]?.status}
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResultTable>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
              Additional Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Performed By (Technician)"
                  value={performedBy}
                  onChange={(e) => setPerformedBy(e.target.value)}
                  placeholder="Technician name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Remarks / Notes"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any additional notes about these results..."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Quality Control
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={qualityControlPassed}
                    onChange={(e) => setQualityControlPassed(e.target.checked)}
                    color="success"
                  />
                }
                label="Quality Control Passed"
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="QC Notes"
                value={qualityControlNotes}
                onChange={(e) => setQualityControlNotes(e.target.value)}
                placeholder="Quality control verification notes..."
                sx={{ mt: 2 }}
              />
            </Box>

            {criticalAlerts.length > 0 && (
              <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Critical Values Detected
                </Typography>
                <Typography variant="body2">
                  The following parameters are outside critical thresholds and will trigger immediate alerts:
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {criticalAlerts.map(alert => (
                    <Chip key={alert} label={alert} color="error" size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              </Alert>
            )}
          </CardContent>
        </InfoCard>
      )}

      {activeTab === 1 && (
        <InfoCard>
          <CardContent sx={{ p: 3 }}>
            <SectionTitle variant="h6">
              <UploadIcon /> Upload PDF Report
            </SectionTitle>

            <UploadArea onClick={() => document.getElementById('pdf-input').click()}>
              <input id="pdf-input" type="file" accept=".pdf" hidden onChange={handleFileUpload} />
              <UploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {uploadedFile ? uploadedFile.name : 'Click or drag to upload report file'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Supports PDF files only (Max 10MB) - Original document from lab machine
              </Typography>
            </UploadArea>

            {uploadedFile && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PdfIcon sx={{ color: '#c62828' }} />
                  <Typography variant="body2">{uploadedFile.name}</Typography>
                </Box>
                <IconButton size="small" onClick={() => setUploadedFile(null)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> The original PDF will be stored for legal compliance.
                For data trends and analytics, please also enter key parameters in the "Manual Entry" tab.
              </Typography>
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </InfoCard>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{ borderRadius: 2, px: 4 }}
        >
          {saving ? 'Saving...' : 'Save Results'}
        </Button>
      </Box>
    </Box>
  );
}