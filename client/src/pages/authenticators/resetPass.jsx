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
  Fade,
  Zoom,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckIcon,
  Diamond as DiamondIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
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
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const resetPass = useAuth();
  const { uid, token } = useParams();

  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      await resetPass(
        uid,
        token,
        formData.new_password,
        formData.confirm_password
      );
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
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
      }}
    >
      <Zoom in timeout={1000}>
        <Box sx={{ maxWidth: 450, width: '100%', position: 'relative', zIndex: 1 }}>
          <GlassCard>
            <Button
              onClick={() => navigate('/login')}
              startIcon={<ArrowBackIcon />}
              sx={{
                position: 'absolute',
                top: 20,
                left: 20,
                color: goldTheme.primary,
                '&:hover': {
                  bgcolor: alpha(goldTheme.primary, 0.1),
                },
              }}
            >
              Back to Login
            </Button>

            <Box sx={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DiamondIcon sx={{ color: goldTheme.primary, fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: goldTheme.primary }}>PREMIUM</Typography>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 4, mt: 4 }}>
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
                <LockIcon sx={{ fontSize: 40, color: '#1A1A1A' }} />
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
                Reset Password
              </Typography>
              <Typography sx={{ color: goldTheme.textSecondary }}>
                Create a new strong password
              </Typography>
            </Box>

            {success && (
              <Fade in>
                <Alert
                  icon={<CheckIcon fontSize="inherit" />}
                  severity="success"
                  sx={{
                    mb: 3,
                    bgcolor: alpha('#4caf50', 0.1),
                    color: '#4caf50',
                    border: '1px solid #4caf50',
                  }}
                >
                  Password reset successful! Redirecting to login...
                </Alert>
              </Fade>
            )}

            {error && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 3, bgcolor: alpha('#f44336', 0.1), color: '#f44336' }}>
                  {error}
                </Alert>
              </Fade>
            )}

            {!success && (
              <form onSubmit={handleSubmit}>
                <GoldTextField
                  fullWidth
                  name="new_password"
                  label="New Password"
                  type={showPassword.new ? 'text' : 'password'}
                  value={formData.new_password}
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
                          onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                          edge="end"
                          sx={{ color: goldTheme.primary }}
                        >
                          {showPassword.new ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <GoldTextField
                  fullWidth
                  name="confirm_password"
                  label="Confirm Password"
                  type={showPassword.confirm ? 'text' : 'password'}
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                          edge="end"
                          sx={{ color: goldTheme.primary }}
                        >
                          {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <GoldButton
                  type="submit"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </GoldButton>
              </form>
            )}
          </GlassCard>
        </Box>
      </Zoom>
    </Box>
  );
};

export default ResetPassword;