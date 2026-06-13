import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Avatar,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Alert,
  CircularProgress,
  Divider,
  Rating,
  InputAdornment,
  Autocomplete,StepIcon as steps,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  styled,
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  LocalHospital as LocalHospital,
  MedicalServices as ServiceIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  School as ExperienceIcon,
  Science as LabIcon,
  HeartBroken as HeartIcon,
  PsychologyAlt as BrainIcon,
  Tooth as DentalIcon,
  Visibility as EyeIcon,
  Hearing as EarIcon,
  ChildCare as PediatricIcon,
  Emergency as EmergencyIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import PatientService from '../../../services/users/patient';
import { formatDate } from '../../../formatters';

const Privacy = styled(Paper)(({theme}) =>({
    background: '#e3f2fd',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(1),
    border: '1px solid #90caf9',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const ModeCard = styled(Card)(({ theme, selected }) => ({
  cursor: 'pointer',
  border: selected ? `3px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
  height: '100%',
}));

const symptomToSpecialization = {
  'chest pain': 'Cardiology',
  'heart palpitations': 'Cardiology',
  'shortness of breath': 'Cardiology',
  'high blood pressure': 'Cardiology',
  
  'headache': 'Neurology',
  'migraine': 'Neurology',
  'dizziness': 'Neurology',
  
  'pregnancy': 'Obstetrics',
  'menstrual issues': 'Gynecology',
  
  'accident': 'Emergency',
  'bleeding': 'Emergency',
};

const specializations = [
  { id: 'cardiology', name: 'Cardiology', icon: <HeartIcon />, description: 'Heart and blood vessels' },
  { id: 'orthopedics', name: 'Orthopedics', icon: <EmergencyIcon />, description: 'Bones and joints' },
  { id: 'dermatology', name: 'Dermatology', icon: <LocalHospital />, description: 'Skin conditions' },
  { id: 'ophthalmology', name: 'Ophthalmology', icon: <EyeIcon />, description: 'Eye care' },
  { id: 'ent', name: 'ENT', icon: <EarIcon />, description: 'Ear, Nose, Throat' },
  { id: 'pediatrics', name: 'Pediatrics', icon: <PediatricIcon />, description: 'Children\'s health' },
  { id: 'psychiatry', name: 'Psychiatry', icon: <BrainIcon />, description: 'Mental health' },
  { id: 'gynecology', name: 'Gynecology', icon: <LocalHospital />, description: 'Women\'s health' },
  { id: 'emergency', name: 'Emergency', icon: <EmergencyIcon />, description: 'Urgent care' },
];

const BOOKING_MODE_TYPES = {
  DETAILED: 'DETAILED',
  QUICK: 'QUICK',
};

const BOOKING_MODE = {
    [BOOKING_MODE_TYPES.DETAILED]: ['Describe Your Issue', 'Choose Specialization', 'Select Doctor', 'Pick Date & Time', 'Confirm'],
    [BOOKING_MODE_TYPES.QUICK]: ['Select Department','Select Doctor','Choose date & Time','Confirm']
};

const BookAppointment = () => {
  const navigate = useNavigate();

  const [bookingMode,setBookingMode] = useState(BOOKING_MODE_TYPES.QUICK)
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [suggestedSpecializations, setSuggestedSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (symptoms.length > 3) {
      analyzeSymptoms();
    } else {
      setSuggestedSpecializations([]);
    }
  }, [symptoms]);

  useEffect(() => {
    if (selectedSpecialization) {
      fetchDoctorsBySpecialization();
    }
  }, [selectedSpecialization]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const analyzeSymptoms = () => {
    const lowerSymptoms = symptoms.toLowerCase();
    const suggestions = [];
    
    for (const [symptom, spec] of Object.entries(symptomToSpecialization)) {
      if (lowerSymptoms.includes(symptom)) {
        if (!suggestions.includes(spec)) {
          suggestions.push(spec);
        }
      }
    }
    
    if (suggestions.length === 0) {
      suggestions.push('General Medicine');
    }
    
    setSuggestedSpecializations(suggestions);
  };

  const fetchDoctorsBySpecialization = async () => {
    try {
      setLoading(true);
      const response = await PatientService.getDoctors(selectedSpecialization);
      setDoctors(response.data);
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await PatientService.getAvailableSlots({
        doctorId: selectedDoctor.id,
        date: selectedDate.toISOString().split('T')[0],
      });
      setAvailableSlots(response.data);
    } catch (err) {
      toast.error('Failed to load available slots');
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && symptoms.length < 5) {
      toast.error('Please describe your symptoms');
      return;
    }
    if (activeStep === 1 && !selectedSpecialization) {
      toast.error('Please select a specialization');
      return;
    }
    if (activeStep === 2 && !selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }
    if (activeStep === 3 && (!selectedDate || !selectedTime)) {
      toast.error('Please select date and time');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () =>{
    setActiveStep((prev) => prev -1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await PatientService.bookAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime,
        purpose: reason || symptoms,
        specialization: selectedSpecialization,
      });
      toast.success('Appointment booked successfully');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Hello our valued patient, What brings you to the hospital today?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Kindly describe your symptoms or the reason for your visit. We'll match you with the right specialist.
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="e.g., I've been having chest pain for 2 days, or I need a regular checkup..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {suggestedSpecializations.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Based on your symptoms, we recommend:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {suggestedSpecializations.map((spec) => (
                    <Chip
                      key={spec}
                      label={spec}
                      color="primary"
                      variant="outlined"
                      onClick={() => {
                        setSelectedSpecialization(spec);
                        handleNext();
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose a Specialization
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Select the type of doctor you need to see.
            </Typography>

            <Grid container spacing={2}>
              {specializations.map((spec) => (
                <Grid item xs={12} sm={6} key={spec.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedSpecialization === spec.name ? 2 : 1,
                      borderColor: selectedSpecialization === spec.name ? 'primary.main' : 'grey.300',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => setSelectedSpecialization(spec.name)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                          {spec.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {spec.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {spec.description}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {suggestedSpecializations.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recommended for your symptoms:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {suggestedSpecializations.map((spec) => (
                    <Chip
                      key={spec}
                      label={spec}
                      color="secondary"
                      onClick={() => setSelectedSpecialization(spec)}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select a Doctor
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {selectedSpecialization} specialists available
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {doctors.map((doctor) => (
                  <ListItem
                    key={doctor.id}
                    disablePadding
                    sx={{ mb: 2 }}
                  >
                    <Card
                      sx={{
                        width: '100%',
                        cursor: 'pointer',
                        border: selectedDoctor?.id === doctor.id ? 2 : 1,
                        borderColor: selectedDoctor?.id === doctor.id ? 'primary.main' : 'grey.300',
                      }}
                    >
                      <CardContent>
                        <ListItemButton onClick={() => setSelectedDoctor(doctor)}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}>
                              {doctor.first_name?.[0]}{doctor.last_name?.[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6">
                                  Dr. {doctor.first_name} {doctor.last_name}
                                </Typography>
                                <Rating value={doctor.rating || 4.5} size="small" readOnly />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 1 }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <ServiceIcon fontSize="small" color="action" />
                                      <Typography variant="body2">
                                        {doctor.specialization} • {doctor.experience} years experience
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <LocationIcon fontSize="small" color="action" />
                                      <Typography variant="body2">
                                        {doctor.location || 'Main Hospital'} • Next available: {doctor.next_available || 'Today'}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Chip
                                        label={`$${doctor.fee || 100} consultation`}
                                        size="small"
                                        variant="outlined"
                                      />
                                      <Chip
                                        label={`${doctor.languages?.join(', ') || 'English'}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </CardContent>
                    </Card>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Date & Time
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name}'s available slots
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    minDate={new Date()}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Available Time Slots</FormLabel>
                  {availableSlots.length > 0 ? (
                    <RadioGroup
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    >
                      <Grid container spacing={1}>
                        {availableSlots.map((slot) => (
                          <Grid item xs={4} key={slot}>
                            <FormControlLabel
                              value={slot}
                              control={<Radio />}
                              label={slot}
                              sx={{
                                border: 1,
                                borderColor: 'grey.300',
                                borderRadius: 1,
                                m: 0,
                                width: '100%',
                                '& .MuiFormControlLabel-label': {
                                  width: '100%',
                                  textAlign: 'center',
                                  py: 1,
                                },
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                  ) : (
                    <Typography color="textSecondary">
                      {selectedDate ? 'No slots available for this date' : 'Select a date first or later'}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Visit (Optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Add any specific details about your symptoms..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Appointment Details
            </Typography>

            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ServiceIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Specialization
                      </Typography>
                      <Typography variant="body1">
                        {selectedSpecialization}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Doctor
                      </Typography>
                      <Typography variant="body1">
                        Dr. {selectedDoctor?.first_name} {selectedDoctor?.last_name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {selectedDoctor?.specialization}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Time
                      </Typography>
                      <Typography variant="body1">
                        {selectedTime}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Your Symptoms/Reason
                  </Typography>
                  <Typography variant="body1">
                    {reason || symptoms}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Book Appointment
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default BookAppointment;