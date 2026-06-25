import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  Grow,
  Zoom,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowForward as ArrowForwardIcon,
  LocalHospital as HospitalIcon,
  Diamond as DiamondIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

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
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${goldTheme.primary}, ${goldTheme.primaryLight}, ${goldTheme.primary})`,
  },
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
    background: `linear-gradient(45deg, ${goldTheme.primaryLight}, ${goldTheme.primary})`,
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);

      const userType = response.data.user.user_type;
      if (userType === 'patient') {
        navigate('/patient/dashboard');
      } else if (userType === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (userType === 'operator') {
        navigate('/operator/dashboard');
      } else if (userType === 'lab_technician') {
        navigate('/lab/dashboard');
      }
    } catch (err) {
      setError(`Login failed:${err}`);
      setFormData((prev) => ({
        ...prev, password: ''
      }));
      document.getElementById('password')?.focus();
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
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '80%',
          height: '80%',
          background: `radial-gradient(circle, ${alpha(goldTheme.primary, 0.1)} 0%, transparent 70%)`,
          borderRadius: '50%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-50%',
          left: '-20%',
          width: '80%',
          height: '80%',
          background: `radial-gradient(circle, ${alpha(goldTheme.primary, 0.1)} 0%, transparent 70%)`,
          borderRadius: '50%',
        },
      }}
    >
      <Zoom in timeout={1000}>
        <Box sx={{ maxWidth: 450, width: '100%', position: 'relative', zIndex: 1 }}>
          <GlassCard>
            <Fade in timeout={1500}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${goldTheme.primary}, ${goldTheme.primaryDark})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: `0 10px 30px ${alpha(goldTheme.primary, 0.3)}`,
                  }}
                >
                  <HospitalIcon sx={{ fontSize: 40, color: '#1A1A1A' }} />
                </Box>
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
                  SmartCare
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: goldTheme.textSecondary,
                    fontWeight: 400,
                  }}
                >
                  Welcome Back to Excellence
                </Typography>
              </Box>
            </Fade>

            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    bgcolor: alpha('#f44336', 0.1),
                    color: '#f44336',
                    border: '1px solid #f44336',
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <form onSubmit={handleSubmit}>
              <Grow in timeout={2000}>
                <Box>
                  <GoldTextField
                    fullWidth
                    name="email"
                    label="Email Address"
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
                </Box>
              </Grow>

              <Grow in timeout={2200}>
                <Box>
                  <GoldTextField
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
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
                </Box>
              </Grow>

              <Box sx={{ textAlign: 'right', mt: 1 }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  sx={{
                    color: goldTheme.primary,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <GoldButton
                type="submit"
                fullWidth
                disabled={loading}
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 3 }}
              >
                {loading ? 'Accessing Vault...' : 'Login to Dashboard'}
              </GoldButton>
            </form>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: goldTheme.textSecondary, mb: 2 }}>
                New to SmartCare?
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/register/patient"
                  variant="outlined"
                  sx={{
                    borderColor: alpha(goldTheme.primary, 0.3),
                    color: goldTheme.primary,
                    '&:hover': {
                      borderColor: goldTheme.primary,
                      bgcolor: alpha(goldTheme.primary, 0.1),
                    },
                  }}
                >
                  Create new Account as Patient
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <DiamondIcon sx={{ color: goldTheme.primary, fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: goldTheme.primary }}>
                PREMIUM
              </Typography>
            </Box>
          </GlassCard>
        </Box>
      </Zoom>
    </Box>
  );
};

export default Login;