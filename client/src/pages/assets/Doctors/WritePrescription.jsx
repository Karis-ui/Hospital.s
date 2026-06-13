import React, { useState, useEffect, use } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Zoom,
  InputAdornment,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormLabel,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Badge,
  LinearProgress,
  Fade,
  Grow,
  Slide,
  Zoom as ZoomTransition,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  Science as LabIcon,
  Biotech as BiotechIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  LocalHospital as HospitalIcon,
  Bloodtype as BloodIcon,
  WaterDrop as UrineIcon,
  Microbiology as MicrobeIcon,
  DNA as DNAIcon,
  XRay as XRayIcon,
  Favorite as HeartIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Note as NoteIcon,
  Speed as SpeedIcon,
  PriorityHigh as PriorityIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/authContext';
import { doctorSevice } from '../../../services/users/doctor';
import { formatDate, getInitials } from '../../../formatters';
import { el } from 'date-fns/locale';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  padding: theme.spacing(3),
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 15px 50px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const GradientHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2, 2, 0, 0),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    background: `radial-gradient(circle, ${alpha('#fff', 0.2)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    background: `radial-gradient(circle, ${alpha('#fff', 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const PatientCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[10],
    borderColor: theme.palette.primary.main,
  },
}));

const MedicationCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.info.main, 0.02),
    borderColor: alpha(theme.palette.info.main, 0.3),
  },
}));

const StepIcon = styled(Box)(({ theme, active, completed }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: completed 
    ? theme.palette.success.main 
    : active 
      ? theme.palette.primary.main 
      : alpha(theme.palette.grey[500], 0.1),
  color: completed || active ? 'white' : theme.palette.text.secondary,
  transition: 'all 0.3s ease',
  animation: active ? 'pulse 2s infinite' : 'none',
  '@keyframes pulse': {
    '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}` },
    '70%': { boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0)}` },
    '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}` },
  },
}));

const COMMON_MEDICATIONS = [ 'Amoxicillin', 'Amoxicillin/Clavulanate', 'Azithromycin', 'Ciprofloxacin',
  'Doxycycline', 'Insulin', 'Nitrofurantoin', 'Cephalexin',
  'Lisinopril', 'Calcium Carbonate', 'Metoprolol', 'Losartan', 'Vitamin D',];

const DOSAGE_SUGGESTIONS = {'Amoxicillin': ['250mg', '500mg', '875mg'],
  'Lisinopril': ['2.5mg', '5mg', '10mg', '20mg', '40mg'],
  'Metformin': ['500mg', '850mg', '1000mg'],
  'Atorvastatin': ['10mg', '20mg', '40mg', '80mg'],
  'Omeprazole': ['10mg', '20mg', '40mg'],};

const FREQUENCY_OPTIONS = ['Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'Every morning',
  'Every evening',
  'As needed',
  'Before meals',
  'After meals',
];

export const WritePrescription = () =>{
  const navigate = useNavigate();
  const location = useLocation();
  const {user} = useAuth();
  const [sending,setSending] = useState(false);
  const [patients,setPatients] = useState([]);
  const [selectedPatient,setSlectedPatient] = useState(null);
  const [searchLoading,setSearchLoading] = useState(false);
  const [prescriptionItems,setPrecriptionItems] = useState([]);
  const [currentMed,setCurrentMed] = useState({
    medication: '',dosage: '',frequency: '',duration: '',quantity: '',instructions: '',dispense_as_written: ''
  });
  const [prescriptionData,setPrescriptionData] = useState({
    diagnosis: '',clinicalNotes: '',startDate: new Date(),endDate: addDays(new Date,30),refills: 0,is_controlled: false,
  });
  const [activeStep,setActiveStep] = useState(0);
  const [pageLoaded,setPageLoaded] = useState(false);
  const steps = ['Select Patient',['Add Medications','Review & Send']];
  const [previewDialog,setPreviewDialog] = useState(false);
  const [previewHtml,setPreviewHtml] = useState('');
  const [sendMethod, setSendMethod] = useState('email');
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
  });

  useEffect(() =>{
    setPageLoaded(true);
    if(location.state?.patientId){
      loadPatient(location.state.patientId);
    }else{
      loadPatients();
    }
  },[location.state]);

  const loadPatients = async()=>{
    setSearchLoading(true);
    try{
      const response = await doctorSevice.myPatients();
      setPatients(response.data || []);
    }catch(err){
      console.error('Failed to load patients.');
      toast.error('Failed to load patients');
    }finally{
      setSearchLoading(false);
    }
  };

  const loadPatient =async(patientId) =>{
    setSearchLoading(true);
    try{
      const response = await doctorSevice.patientDetail(patientId);
      setSlectedPatient(response.data);
      setContactInfo({email: response.data.email || '',
                      phone: response.data.phone || '',
      });
      toast.success('Patient loaded');
    }catch(err){
      toast.error('Failed to load patient.');
    }finally{
      setSearchLoading(false);
    }
  };

  const handleAddMedication = () =>{
    if(!currentMed.medication){
      toast.error('Please enter medication name');
      return;
    }
    if(!currentMed.dosage){
      toast.error('Please specify dosage');
      return;
    }
    if(!currentMed.frequency){
      toast.error('Please specify frequency');
      return;
    }
    setPrecriptionItems([...prescriptionItems,{...currentMed,id:Date.now()}]);
    setCurrentMed({
      medication: '',dosage: '',frequency: '',duration: '',quantity: '',instructions: '',dispense_as_written: true,
    });
    toast.success('Medication added');
  };

  const handleRemoveMedication = (id) =>{
    setPrecriptionItems(prescriptionItems.filter(item => item.id !== id));
    toast.info('Medication removed');
  };

  const handleNext = () =>{
    if(activeStep === 0 && !selectedPatient){
      toast.error('Please select a patient');
      return;
    }
    if(activeStep === 1 && prescriptionItems.length === 0){
      toast.error('Please add at least one prescription');
      return;
    }
    setActiveStep(prev => prev+1);
  };
  
  const handleBack = () =>{
    setActiveStep(prev => prev - 1);
  };

  const generatePrescriptionHTML = () =>{
    const doctorName = `Dr. ${user?.full_name}`;
    const doctorLicense = user?.license_number || '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Prescription</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 40px;
            background: #f5f5f5;
          }
          .prescription-card {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #2c3e50, #1a2639);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .hospital-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .prescription-title {
            font-size: 18px;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .doctor-info, .patient-info {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: 600;
            color: #555;
          }
          .medication-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .medication-table th {
            background: #2c3e50;
            color: white;
            padding: 12px;
            text-align: left;
          }
          .medication-table td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
          }
          .diagnosis-box {
            background: #fff3e0;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ff9800;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
          }
          .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px dashed #ccc;
            text-align: right;
          }
          .controlled-badge {
            display: inline-block;
            background: #f44336;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-left: 10px;
          }
        </style>
      </head>
      <body>
        <div class="prescription-card">
          <div class="header">
            <div class="hospital-name">SmartCare Hospital</div>
            <div class="prescription-title">Medical Prescription</div>
          </div>
          <div class="content">
            <div class="doctor-info">
              <div class="info-row">
                <span class="info-label">Prescribing Doctor:</span>
                <span>${doctorName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">License Number:</span>
                <span>${doctorLicense}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span>${format(new Date(), 'MMMM d, yyyy')}</span>
              </div>
            </div>
            
            <div class="patient-info">
              <div class="info-row">
                <span class="info-label">Patient Name:</span>
                <span>${selectedPatient?.first_name} ${selectedPatient?.last_name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date of Birth:</span>
                <span>${formatDate(selectedPatient?.date_of_birth)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Patient ID:</span>
                <span>${selectedPatient?.id}</span>
              </div>
            </div>
            
            <div class="diagnosis-box">
              <strong>Diagnosis:</strong> ${prescriptionData.diagnosis}
              ${prescriptionData.is_controlled ? '<span class="controlled-badge">Controlled Substance</span>' : ''}
            </div>
            
            <table class="medication-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Dispense</th>
                </tr>
              </thead>
              <tbody>
                ${prescriptionItems.map(item => `
                  <tr>
                    <td><strong>${item.medication}</strong>${!item.dispense_as_written ? '<br><small>Generic substitution allowed</small>' : ''}</td>
                    <td>${item.dosage}</td>
                    <td>${item.frequency}</td>
                    <td>${item.duration || 'As directed'}</td>
                    <td>${item.quantity || 'As needed'}</td>
                  </tr>
                  ${item.instructions ? `
                  <tr>
                    <td colspan="5"><small><em>Instructions: ${item.instructions}</em></small></td>
                  </tr>
                  ` : ''}
                `).join('')}
              </tbody>
            </table>
            
            ${prescriptionData.clinicalNotes ? `
              <div style="margin: 20px 0; padding: 10px; background: #f0f0f0; border-radius: 5px;">
                <strong>Clinical Notes:</strong><br>
                ${prescriptionData.clinicalNotes}
              </div>
            ` : ''}
            
            <div class="signature">
              <div>_______________________________</div>
              <div>${doctorName}</div>
              <div>Digital Signature</div>
            </div>
          </div>
          <div class="footer">
            <p>This prescription is valid for 30 days from the date issued.<br>
            Patient may fill this prescription at any pharmacy of their choice.<br>
            Pharmacy will handle insurance, pricing, and generic substitution.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePreview = () =>{
    setPrecriptionItems(generatePrescriptionHTML());
    setPreviewDialog(true);
  };

  const handleSendPrescription = async()=>{
    if(!selectedPatient){
      toast.error('Select a patient please.');
      return;
    }
    if(prescriptionItems.length === 0){
      toast.error('Add at least one medication.');
      return;
    }
    setSending(true);
    try{
      const prescription = {
         doctor_id: user?.id,
        doctor_name: `Dr. ${user?.first_name} ${user?.last_name}`,
        doctor_license: user?.license_number,
        patient_id: selectedPatient.id,
        patient_name: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
        date: new Date().toISOString(),
        diagnosis: prescriptionData.diagnosis,
        clinical_notes: prescriptionData.clinicalNotes,
        start_date: prescriptionData.startDate,
        end_date: prescriptionData.endDate,
        refills: prescriptionData.refills,
        is_controlled: prescriptionData.is_controlled,
        medications: prescriptionItems.map(item => ({
          name: item.medication,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          quantity: item.quantity,
          instructions: item.instructions,
          dispense_as_written: item.dispense_as_written,
        })),
      };

      if (sendMethod === 'email'){
        await doctorSevice.sendToPatient(selectedPatient.id,{
          prescription,email: contactInfo.email
        });
        toast.success(`Prescription sent to ${contactInfo.email}`);
      }else if(sendMethod === 'sms'){
        await doctorSevice.sendToPatient(selectedPatient.id,{
          prescription_summary: `${prescriptionItems.length} medication(s) prescripted.`,phone: contactInfo.phone,
        });
        toast.success(`Prescription sent to ${contactInfo.phone}`);
      }
      setTimeout(()=>{navigate('/prescriptions');},2000);
    }catch(err){
      toast.error('Failed to send prescription.');
    }finally{
      setSending(false);
    }
  };

  const getStepIcon = (step)=>{
    const icons = [<PersonIcon/>,<MedicationIcon/>,<SendIcon/>];
    return icons[step];
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Select Patient
              </Typography>
              
              {!selectedPatient ? (
                <Grow in timeout={600}>
                  <Box>
                    <Autocomplete
                      options={patients}
                      loading={searchLoading}
                      getOptionLabel={(p) => `${p.first_name} ${p.last_name} (ID: ${p.id})`}
                      onChange={(e, newValue) => {
                        if (newValue) loadPatient(newValue.id);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search patient by name or ID"
                          fullWidth
                          size="medium"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon color="primary" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <>
                                {searchLoading && <CircularProgress color="primary" size={20} />}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              backgroundColor: alpha('#fff', 0.8),
                            },
                          }}
                        />
                      )}
                    />

                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
                      Recent Patients
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {patients.slice(0, 3).map((patient) => (
                        <Grid item xs={12} sm={4} key={patient.id}>
                          <Slide direction="up" in timeout={700 + patient.id * 100}>
                            <div>
                              <PatientCard onClick={() => loadPatient(patient.id)}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                  <Avatar
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      mx: 'auto',
                                      mb: 1,
                                      bgcolor: 'primary.main',
                                    }}
                                  >
                                    {getInitials(patient.first_name, patient.last_name)}
                                  </Avatar>
                                  <Typography variant="subtitle2" noWrap>
                                    {patient.first_name} {patient.last_name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    ID: {patient.id}
                                  </Typography>
                                </CardContent>
                              </PatientCard>
                            </div>
                          </Slide>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grow>
              ) : (
                <Grow in timeout={500}>
                  <PatientCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 70,
                            height: 70,
                            bgcolor: 'primary.main',
                            fontSize: '2rem',
                          }}
                        >
                          {getInitials(selectedPatient.first_name, selectedPatient.last_name)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {selectedPatient.first_name} {selectedPatient.last_name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                            <Chip
                              icon={<PersonIcon />}
                              label={`DOB: ${formatDate(selectedPatient.date_of_birth)}`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={<BadgeIcon />}
                              label={`ID: ${selectedPatient.id}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <Tooltip title="Change Patient" TransitionComponent={ZoomTransition}>
                          <IconButton 
                            onClick={() => setSelectedPatient(null)}
                            sx={{ 
                              bgcolor: alpha('#f44336', 0.1),
                              '&:hover': { bgcolor: alpha('#f44336', 0.2) },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </PatientCard>
                </Grow>
              )}
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                <MedicationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Add Medications
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      background: `linear-gradient(135deg, ${alpha('#fff', 0.9)} 0%, ${alpha('#f5f5f5', 0.9)} 100%)`,
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Add New Medication
                      </Typography>

                      <Autocomplete
                        freeSolo
                        options={COMMON_MEDICATIONS}
                        value={currentMed.medication}
                        onInputChange={(e, newValue) => {
                          setCurrentMed({ ...currentMed, medication: newValue, dosage: '' });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Medication Name"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                          />
                        )}
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Dosage</InputLabel>
                            <Select
                              value={currentMed.dosage}
                              onChange={(e) => setCurrentMed({ ...currentMed, dosage: e.target.value })}
                              label="Dosage"
                            >
                              {getDosageOptions(currentMed.medication).map(option => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Frequency</InputLabel>
                            <Select
                              value={currentMed.frequency}
                              onChange={(e) => setCurrentMed({ ...currentMed, frequency: e.target.value })}
                              label="Frequency"
                            >
                              {FREQUENCY_OPTIONS.map(option => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Duration"
                            value={currentMed.duration}
                            onChange={(e) => setCurrentMed({ ...currentMed, duration: e.target.value })}
                            placeholder="e.g., 7 days, 30 days"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Quantity"
                            value={currentMed.quantity}
                            onChange={(e) => setCurrentMed({ ...currentMed, quantity: e.target.value })}
                            placeholder="e.g., 30 tablets"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Instructions"
                            value={currentMed.instructions}
                            onChange={(e) => setCurrentMed({ ...currentMed, instructions: e.target.value })}
                            placeholder="e.g., Take with food, Avoid alcohol"
                            multiline
                            rows={2}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={currentMed.dispense_as_written}
                                onChange={(e) => setCurrentMed({ ...currentMed, dispense_as_written: e.target.checked })}
                              />
                            }
                            label="Dispense as written (no generic substitution)"
                          />
                        </Grid>
                      </Grid>

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={handleAddMedication}
                        disabled={!currentMed.medication || !currentMed.dosage || !currentMed.frequency}
                        sx={{
                          mt: 2,
                          borderRadius: 3,
                          py: 1.5,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[5],
                          },
                        }}
                      >
                        Add to Prescription
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Card sx={{ borderRadius: 3, height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Prescription Items
                        </Typography>
                        <Badge
                          badgeContent={prescriptionItems.length}
                          color="primary"
                          sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                        >
                          <MedicationIcon color="action" />
                        </Badge>
                      </Box>
                      
                      {prescriptionItems.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <MedicationIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                          <Typography color="textSecondary">
                            No medications added yet
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Use the panel on the left to add medications
                          </Typography>
                        </Box>
                      ) : (
                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                          {prescriptionItems.map((item) => (
                            <Slide direction="left" in timeout={300} key={item.id}>
                              <div>
                                <MedicationCard>
                                  <CardContent sx={{ py: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                      <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                                          <MedicationIcon />
                                        </Avatar>
                                      </ListItemAvatar>
                                      <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                          {item.medication} {item.dosage}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" display="block">
                                          {item.frequency}
                                        </Typography>
                                        {item.duration && (
                                          <Typography variant="caption" color="textSecondary" display="block">
                                            Duration: {item.duration}
                                          </Typography>
                                        )}
                                        {item.instructions && (
                                          <Typography variant="caption" color="textSecondary" display="block">
                                            <NoteIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                                            {item.instructions}
                                          </Typography>
                                        )}
                                        {!item.dispense_as_written && (
                                          <Chip
                                            label="Generic Substitution Allowed"
                                            size="small"
                                            variant="outlined"
                                            sx={{ mt: 0.5 }}
                                          />
                                        )}
                                      </Box>
                                      <Tooltip title="Remove" TransitionComponent={ZoomTransition}>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleRemoveMedication(item.id)}
                                          sx={{ color: theme.palette.error.main }}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </CardContent>
                                </MedicationCard>
                              </div>
                            </Slide>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <ZoomTransition in timeout={600}>
                <Card sx={{ mt: 3, borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Clinical Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Diagnosis / Indication"
                          value={prescriptionData.diagnosis}
                          onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                          required
                          placeholder="e.g., Hypertension, Type 2 Diabetes, Upper Respiratory Infection"
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Start Date"
                            value={prescriptionData.startDate}
                            onChange={(date) => setPrescriptionData({ ...prescriptionData, startDate: date })}
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="End Date"
                            value={prescriptionData.endDate}
                            onChange={(date) => setPrescriptionData({ ...prescriptionData, endDate: date })}
                            minDate={prescriptionData.startDate}
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Refills"
                          value={prescriptionData.refills}
                          onChange={(e) => setPrescriptionData({ ...prescriptionData, refills: parseInt(e.target.value) || 0 })}
                          InputProps={{ inputProps: { min: 0, max: 12 } }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={prescriptionData.isControlled}
                              onChange={(e) => setPrescriptionData({ ...prescriptionData, isControlled: e.target.checked })}
                            />
                          }
                          label="Controlled Substance"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Clinical Notes"
                          value={prescriptionData.clinicalNotes}
                          onChange={(e) => setPrescriptionData({ ...prescriptionData, clinicalNotes: e.target.value })}
                          multiline
                          rows={2}
                          placeholder="Any additional notes or instructions..."
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </ZoomTransition>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                <SendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Review & Send Prescription
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'primary.main',
                          }}
                        >
                          {getInitials(selectedPatient?.first_name, selectedPatient?.last_name)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {selectedPatient?.first_name} {selectedPatient?.last_name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            DOB: {formatDate(selectedPatient?.date_of_birth)} • ID: {selectedPatient?.id}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Prescribed Medications ({prescriptionItems.length})
                      </Typography>
                      
                      {prescriptionItems.map((item, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1.5,
                            mb: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                          }}
                        >
                          <MedicationIcon sx={{ color: theme.palette.info.main, mr: 2 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.medication} {item.dosage}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.frequency} • {item.duration || 'As directed'}
                            </Typography>
                            {item.instructions && (
                              <Typography variant="caption" color="textSecondary" display="block">
                                Note: {item.instructions}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>

                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Diagnosis
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {prescriptionData.diagnosis}
                      </Typography>
                      {prescriptionData.isControlled && (
                        <Chip
                          label="Controlled Substance"
                          size="small"
                          color="error"
                          icon={<WarningIcon />}
                        />
                      )}
                      {prescriptionData.clinicalNotes && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Clinical Notes
                          </Typography>
                          <Typography variant="body2">
                            {prescriptionData.clinicalNotes}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Card sx={{ mb: 3, borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Send Prescription
                      </Typography>

                      <RadioGroup
                        value={sendMethod}
                        onChange={(e) => setSendMethod(e.target.value)}
                        sx={{ mb: 2 }}
                      >
                        <FormControlLabel 
                          value="email" 
                          control={<Radio />} 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" />
                              <span>Email to Patient</span>
                            </Box>
                          } 
                        />
                        <FormControlLabel 
                          value="sms" 
                          control={<Radio />} 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" />
                              <span>SMS Notification</span>
                            </Box>
                          } 
                        />
                        <FormControlLabel 
                          value="print" 
                          control={<Radio />} 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PrintIcon fontSize="small" />
                              <span>Print / Download PDF</span>
                            </Box>
                          } 
                        />
                      </RadioGroup>

                      {sendMethod === 'email' && (
                        <TextField
                          fullWidth
                          size="small"
                          label="Patient Email"
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                          sx={{ mb: 2 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}

                      {sendMethod === 'sms' && (
                        <TextField
                          fullWidth
                          size="small"
                          label="Patient Phone"
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          sx={{ mb: 2 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon fontSize="small" color="primary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={handlePreview}
                        sx={{ mb: 2 }}
                      >
                        Preview Prescription
                      </Button>

                      <Alert 
                        severity="info" 
                        sx={{ 
                          mt: 1,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                        }}
                      >
                        <Typography variant="body2">
                          <strong>Important:</strong> The patient will receive this prescription and can fill it at any pharmacy.
                          The pharmacy will handle stock availability, insurance processing, and pricing.
                        </Typography>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Prescriber Information
                      </Typography>
                      <Typography variant="body2">
                        Dr. {user?.first_name} {user?.last_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        License: {user?.license_number || 'MD-12345'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" display="block">
                        NPI: {user?.npi || '1234567890'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );

      default:
        return null;
    }
  };

  const BadgeIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24">
      <path d="M20 12c0-2.54-1.19-4.81-3.04-6.27L16 0H8l-.95 5.73C5.19 7.19 4 9.45 4 12s1.19 4.81 3.05 6.27L8 24h8l.96-5.73C18.81 16.81 20 14.54 20 12zM6 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6z" />
    </svg>
  );

  const VisibilityIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );

  return (
    <PageContainer>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Slide direction="down" in={pageLoaded} timeout={500}>
          <GradientHeader sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <IconButton 
                onClick={() => navigate(-1)} 
                sx={{ 
                  color: 'white',
                  mr: 2,
                  bgcolor: alpha('#fff', 0.1),
                  '&:hover': { bgcolor: alpha('#fff', 0.2) },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Write Prescription
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Prescribe medications based on medical needs
                </Typography>
              </Box>
            </Box>
          </GradientHeader>
        </Slide>

        <GlassCard>
          <CardContent sx={{ p: 4 }}>
            <Stepper 
              activeStep={activeStep} 
              sx={{ mb: 4 }}
              alternativeLabel
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <StepIcon
                        active={activeStep === index}
                        completed={activeStep > index}
                      >
                        {getStepIcon(index)}
                      </StepIcon>
                    )}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0 || sending}
                sx={{ borderRadius: 3, px: 4 }}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  onClick={handleSendPrescription}
                  disabled={sending}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[5],
                    },
                  }}
                >
                  {sending ? 'Sending...' : 'Send Prescription'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[5],
                    },
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </CardContent>
        </GlassCard>
      </Box>

      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Prescription Preview
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setPreviewDialog(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <iframe
            srcDoc={previewHtml}
            title="Prescription Preview"
            style={{
              width: '100%',
              height: '500px',
              border: 'none',
              borderRadius: '8px',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<PrintReceiptIcon />}
            onClick={() => {
              const printWindow = window.open();
              printWindow.document.write(previewHtml);
              printWindow.document.close();
              printWindow.print();
            }}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};