import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Grid, Avatar, Stepper, Step, StepLabel,
  Alert, CircularProgress, InputAdornment, IconButton, Divider, Chip, alpha, MenuItem
} from '@mui/material';
import {
  Science as LabIcon, Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon,
  Badge as BadgeIcon, Lock as LockIcon, Visibility, VisibilityOff,
  CheckCircle as CheckIcon, ArrowForward as ArrowForwardIcon,
  CloudUpload as CloudUploadIcon, // Added for file upload
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext';
import { platinumTheme } from '../../theme/GenLayout';

const steps = ['Personal Information', 'Professional Details', 'Account Setup'];

export const LabTechRegister = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    email: '',
    qualifications: '',
    license_number: 'KMLTTB-',
    shift_time: '',
    username: '',
    password: '',
    confirm_password: '',
    resume: null,
  });
  const [errors, setErrors] = useState({});
  const { register } = useAuth();

  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      if (!formData.full_name) newErrors.full_name = 'Full name required';
      if (!formData.email) newErrors.email = 'Email required';
      if (!formData.phone_number) newErrors.phone_number = 'Phone number required';
      if (!formData.gender) newErrors.gender = 'Gender required';
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email required';
    }

    if (activeStep === 1) {
      if (!formData.resume) newErrors.resume = 'CV/Resume required';
      if (!formData.license_number || formData.license_number === 'KMLTTB-') {
        newErrors.license_number = 'License number required';
      }
    }

    if (activeStep === 2) {
      if (!formData.username) newErrors.username = 'Username required';
      if (!formData.password) newErrors.password = 'Password required';
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const response = await register(formData, 'lab_technician');
      if (response.status === 'success') {
        toast.success('Registration successful! Awaiting admin approval.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      setFormData((prev) => ({
        ...prev, password: '', confirm_password: ''
      }));
      document.getElementById('password')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const handleLicenseChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!val.startsWith('KMLTTB-')) {
      val = 'KMLTTB-' + val.replace('KMLTTB-', '');
    }
    handleChange('license_number', val);
  };

  const handleFileChange = (e) => {
    handleChange('resume', e.target.files[0]);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: platinumTheme.background.default, py: 4 }}>
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={12} md={8} lg={6}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: platinumTheme.primary.main, color: 'white' }}>
                <LabIcon sx={{ fontSize: 50, mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Lab Technician Registration</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>Join our laboratory team</Typography>
              </Box>

              <Box sx={{ px: 4, pt: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                  ))}
                </Stepper>
              </Box>

              <Box sx={{ p: 4 }}>
                {activeStep === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Personal Information
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Full Name" value={formData.full_name} onChange={(e) => handleChange('full_name', e.target.value)} error={!!errors.full_name} helperText={errors.full_name} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth type="date" label="Date of Birth" value={formData.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth select label="Gender" value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)} error={!!errors.gender} helperText={errors.gender}>
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} error={!!errors.email} helperText={errors.email} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Phone Number" value={formData.phone_number} onChange={(e) => handleChange('phone_number', e.target.value)} error={!!errors.phone_number} helperText={errors.phone_number} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }} />
                      </Grid>
                    </Grid>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          <LabIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Professional Details
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                          Upload CV / Resume (PDF, DOCX) *
                        </Typography>
                        <Paper variant="outlined" sx={{
                          p: 3, textAlign: 'center', borderStyle: 'dashed', borderWidth: 2,
                          borderColor: formData.resume ? 'success.main' : platinumTheme.primary.light,
                          bgcolor: formData.resume ? '#f0fdf4' : 'transparent',
                          cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: platinumTheme.primary.main }
                        }} component="label">
                          <input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                          <CloudUploadIcon sx={{ fontSize: 40, color: formData.resume ? 'success.main' : platinumTheme.primary.main, mb: 1 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: formData.resume ? 'success.main' : 'text.primary' }}>
                            {formData.resume ? formData.resume.name : 'Click to upload your CV'}
                          </Typography>
                        </Paper>
                        {errors.resume && <Typography color="error" variant="caption">{errors.resume}</Typography>}
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="License Number" value={formData.license_number} onChange={handleLicenseChange} error={!!errors.license_number} helperText={errors.license_number || "Official KMLTTB number"} InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment> }} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Department" value={formData.department} onChange={(e) => handleChange('department', e.target.value)} helperText="e.g., Hematology, Microbiology, Clinical Chemistry" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth select label="Shift Preference" value={formData.shift_time} onChange={(e) => handleChange('shift_time', e.target.value)}>
                          <MenuItem value="Morning">Morning (7:00 AM - 3:00 PM)</MenuItem>
                          <MenuItem value="Evening">Evening (3:00 PM - 11:00 PM)</MenuItem>
                          <MenuItem value="Night">Night (11:00 PM - 7:00 AM)</MenuItem>
                          <MenuItem value="Rotating">Rotating</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth type="number" label="Years of Experience" value={formData.experience_years} onChange={(e) => handleChange('experience_years', e.target.value)} />
                      </Grid>
                    </Grid>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Account Setup
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Username" value={formData.username} onChange={(e) => handleChange('username', e.target.value)} error={!!errors.username} helperText={errors.username} InputProps={{ startAdornment: <InputAdornment position="start">@</InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth type={showPassword ? 'text' : 'password'} label="Password" id="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} error={!!errors.password} helperText={errors.password || 'Minimum 8 characters'} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField fullWidth type={showConfirmPassword ? 'text' : 'password'} label="Confirm Password" value={formData.confirm_password} onChange={(e) => handleChange('confirm_password', e.target.value)} error={!!errors.confirm_password} helperText={errors.confirm_password} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                      </Grid>
                    </Grid>
                  </motion.div>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0}>Back</Button>
                  {activeStep === steps.length - 1 ? (
                    <Button variant="contained" onClick={handleSubmit} disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}>
                      {loading ? 'Registering...' : 'Submit Registration'}
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={handleNext} endIcon={<ArrowForwardIcon />}>Next</Button>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />
                <Typography variant="body2" align="center" sx={{ color: platinumTheme.text.secondary }}>
                  Already have an account? <Link to="/login" style={{ color: platinumTheme.secondary.main, textDecoration: 'none' }}>Sign in</Link>
                </Typography>
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  <Typography variant="caption">After registration, your account will be reviewed by an administrator. You will receive an email once approved.</Typography>
                </Alert>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LabTechRegister;