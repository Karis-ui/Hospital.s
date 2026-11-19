import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
  CheckCircle as CheckIcon,
  CloudUpload as CloudUploadIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext';
import { platinumTheme } from '../../theme/GenLayout';

const steps = ['Personal Information', 'Work Details', 'Account Setup'];

const RegisterStaff = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    shift_time: '',
    license_number: 'KMLTTB-',
    resume: null,
    username: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});

  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.full_name.trim()) newErrors.full_name = 'Full name required';
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number required';
    }

    if (activeStep === 1) {
      if (!formData.shift_time) newErrors.shift_time = 'Shift preference required';
      if (!formData.license_number.trim()) newErrors.license_number = 'License number required';
      if (!formData.resume) newErrors.resume = 'Resume required';
    }

    if (activeStep === 2) {
      if (!formData.username.trim()) newErrors.username = 'Username required';
      if (formData.username.length > 30) newErrors.username = 'Username must be 30 characters or fewer';
      if (!formData.password) newErrors.password = 'Password required';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: '' }));
  };

  const handleFileChange = (event) => {
    const resume = event.target.files?.[0] || null;
    setFormData((previous) => ({ ...previous, resume }));
    setErrors((previous) => ({ ...previous, resume: '' }));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const response = await register(formData, 'operator');
      if (response.status !== 'success') {
        throw new Error(response.message || 'Registration failed');
      }

      toast.success('Registration successful! Awaiting admin approval.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed');
      setFormData((previous) => ({
        ...previous,
        password: '',
        confirm_password: '',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: platinumTheme.background.default, py: 4 }}>
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={12} md={8} lg={6}>
          <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: platinumTheme.primary.main, color: 'white' }}>
              <BusinessIcon sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Billing Operator Registration
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                Join our billing operations team
              </Typography>
            </Box>

            <Box sx={{ px: 4, pt: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Box sx={{ p: 4 }}>
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Personal Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.full_name}
                      onChange={handleChange('full_name')}
                      error={!!errors.full_name}
                      helperText={errors.full_name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange('email')}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                      InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1 }} /> }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      required
                      InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1 }} /> }}
                    />
                  </Grid>
                </Grid>
              )}

              {activeStep === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Work Details
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Shift Preference"
                      value={formData.shift_time}
                      onChange={handleChange('shift_time')}
                      error={!!errors.shift_time}
                      helperText={errors.shift_time}
                      required
                    >
                      <MenuItem value="Morning">Morning</MenuItem>
                      <MenuItem value="Evening">Evening</MenuItem>
                      <MenuItem value="Night">Night</MenuItem>
                      <MenuItem value="Rotating">Rotating</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="License Number"
                      value={formData.license_number}
                      onChange={handleChange('license_number')}
                      error={!!errors.license_number}
                      helperText={errors.license_number}
                      InputProps={{ startAdornment: <BadgeIcon sx={{ mr: 1 }} /> }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                      Upload Resume
                      <input
                        hidden
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </Button>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {formData.resume ? formData.resume.name : 'No resume selected'}
                    </Typography>
                    {errors.resume && (
                      <Typography variant="caption" color="error">
                        {errors.resume}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              )}

              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Account Setup
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={formData.username}
                      onChange={handleChange('username')}
                      error={!!errors.username}
                      helperText={errors.username}
                      inputProps={{ maxLength: 30 }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange('password')}
                      error={!!errors.password}
                      helperText={errors.password || 'Minimum 8 characters'}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={handleChange('confirm_password')}
                      error={!!errors.confirm_password}
                      helperText={errors.confirm_password}
                      required
                    />
                  </Grid>
                </Grid>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep((step) => step - 1)}
                  disabled={activeStep === 0 || loading}
                >
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                  >
                    {loading ? 'Registering...' : 'Submit Registration'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (validateStep()) setActiveStep((step) => step + 1);
                    }}
                    endIcon={<ArrowForwardIcon />}
                  >
                    Next
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />
              <Typography variant="body2" align="center" sx={{ color: platinumTheme.text.secondary }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: platinumTheme.secondary.main, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </Typography>
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="caption">
                  Your registration will be reviewed by an administrator before approval.
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterStaff;
