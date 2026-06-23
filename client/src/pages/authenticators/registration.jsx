import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  MenuItem,
  Fade,
  Grow,
  Zoom,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
  Diamond as DiamondIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import authService from '../../services/authService';

const goldTheme = {
  primary: '#D4AF37',
  primaryDark: '#AA8C2F',
  primaryLight: '#F1E5C9',
  background: '#1A1A1A',
  surface: '#2A2A2A',
  textPrimary: '#FFFFFF',
  textSecondary: '#C0C0C0',
};

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(42, 42, 42, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: 24,
  border: `2px solid ${alpha(goldTheme.primary, 0.3)}`,
  boxShadow: `0 20px 60px ${alpha(goldTheme.primary, 0.2)}`,
  padding: '40px',
  position: 'relative',
  overflow: 'hidden',
}));

const GoldTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    color: goldTheme.textPrimary,
    '& fieldset': {
      borderColor: alpha(goldTheme.primary, 0.3),
    },
    '&:hover fieldset': {
      borderColor: goldTheme.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: goldTheme.primary,
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    color: goldTheme.textSecondary,
    '&.Mui-focused': {
      color: goldTheme.primary,
    },
  },
  '& .MuiInputAdornment-root': {
    color: goldTheme.primary,
  },
});

const GoldButton = styled(Button)({
  background: `linear-gradient(45deg, ${goldTheme.primary}, ${goldTheme.primaryLight})`,
  color: '#1A1A1A',
  fontWeight: 700,
  padding: '12px 24px',
  borderRadius: 50,
  textTransform: 'none',
  fontSize: '1.1rem',
  boxShadow: `0 5px 20px ${alpha(goldTheme.primary, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 30px ${alpha(goldTheme.primary, 0.4)}`,
  },
  '&:disabled': {
    background: alpha(goldTheme.primary, 0.3),
    color: alpha('#1A1A1A', 0.5),
  },
});

const steps = [
  {
    label: 'Account Details',
    description: 'Create your login credentials',
    icon: <LockIcon />,
  },
  {
    label: 'Personal Information',
    description: 'Tell us about yourself',
    icon: <PersonIcon />,
  },
  {
    label: 'Contact Details',
    description: 'How to reach you',
    icon: <PhoneIcon />,
  },
];

const PatientRegister = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone: '',
    age: '',
    gender: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep = () => {
    setError('');

    if (activeStep === 0) {
      if (!formData.email || !formData.password || !formData.confirm_password) {
        setError('All fields are required');
        return false;
      }
      if (formData.password !== formData.confirm_password) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }

    if (activeStep === 1) {
      if (!formData.first_name || !formData.last_name || !formData.age || !formData.gender) {
        setError('All fields are required');
        return false;
      }
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
        setError('Please enter a valid age');
        return false;
      }
    }

    if (activeStep === 2) {
      if (!formData.phone || !formData.address) {
        setError('All fields are required');
        return false;
      }
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setError('Please enter a valid phone number......must be exaclty 10 digits');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');
    const submitData = {
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirm_password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone.replace(/\D/g, ''),
      age: parseInt(formData.age),
      gender: formData.gender === 'M' ? 'Male' : formData.gender === 'F' ? 'Female' : 'Other',
      address: formData.address,
    };
    try {
      await authService.registerPatient(submitData, 'patient');
      setSuccess('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 2000);
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'auto',
      }}
    >
      <Zoom in timeout={1000}>
        <Box sx={{ maxWidth: 600, width: '100%', position: 'relative', zIndex: 1, py: 4 }}>
          <GlassCard>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${goldTheme.primary}, ${goldTheme.primaryLight})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Patient Registration
              </Typography>
              <Typography sx={{ color: goldTheme.textSecondary }}>
                Join SmartCare Hospital Today
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: activeStep >= index ? goldTheme.primary : alpha(goldTheme.primary, 0.2),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: activeStep >= index ? '#1A1A1A' : goldTheme.textSecondary,
                        }}
                      >
                        {activeStep > index ? <CheckIcon fontSize="small" /> : step.icon}
                      </Box>
                    )}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: goldTheme.textPrimary }}>
                        {step.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: goldTheme.textSecondary }}>
                        {step.description}
                      </Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 3, bgcolor: alpha('#f44336', 0.1), color: '#f44336' }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {success && (
              <Fade in>
                <Alert severity="success" sx={{ mb: 3, bgcolor: alpha('#4caf50', 0.1), color: '#4caf50' }}>
                  {success}
                </Alert>
              </Fade>
            )}

            <Box sx={{ mt: 2 }}>
              {activeStep === 0 && (
                <Grow in timeout={500}>
                  <Box>
                    <GoldTextField
                      fullWidth
                      name="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      margin="normal"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <GoldTextField
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      margin="normal"
                      required
                      helperText="Minimum 8 characters"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: goldTheme.primary }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <GoldTextField
                      fullWidth
                      name="confirm_password"
                      label="Confirm Password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      margin="normal"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Grow>
              )}

              {activeStep === 1 && (
                <Grow in timeout={500}>
                  <Box>
                    <GoldTextField
                      fullWidth
                      name="first_name"
                      label="First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                      margin="normal"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <GoldTextField
                      fullWidth
                      name="last_name"
                      label="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                      margin="normal"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <GoldTextField
                      fullWidth
                      name="phone"
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      margin="normal"
                      required
                      helperText="Include country code (e.g., +1234567890)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <GoldTextField
                      fullWidth
                      name="age"
                      label="Age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      margin="normal"
                      required
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CakeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Grow>
              )}

              {activeStep === 2 && (
                <Grow in timeout={500}>
                  <Box>
                    <GoldTextField
                      fullWidth
                      name="gender"
                      label="Gender"
                      select
                      value={formData.gender}
                      onChange={handleChange}
                      margin="normal"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <GenderIcon />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">Select Gender</MenuItem>
                      <MenuItem value="M">Male</MenuItem>
                      <MenuItem value="F">Female</MenuItem>
                      <MenuItem value="O">Other</MenuItem>
                    </GoldTextField>

                    <GoldTextField
                      fullWidth
                      name="address"
                      label="Address"
                      multiline
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      margin="normal"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </Grow>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || loading}
                startIcon={<ArrowBackIcon />}
                sx={{
                  color: goldTheme.primary,
                  '&:hover': {
                    bgcolor: alpha(goldTheme.primary, 0.1),
                  },
                }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <GoldButton
                  onClick={handleSubmit}
                  disabled={loading}
                  endIcon={<CheckIcon />}
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </GoldButton>
              ) : (
                <GoldButton
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                >
                  Next Step
                </GoldButton>
              )}
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: goldTheme.textSecondary }}>
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: goldTheme.primary,
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Login Here
                </Link>
              </Typography>
            </Box>

            <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DiamondIcon sx={{ color: goldTheme.primary, fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: goldTheme.primary }}>PREMIUM</Typography>
            </Box>
          </GlassCard>
        </Box>
      </Zoom>
    </Box>
  );
};

export default PatientRegister;