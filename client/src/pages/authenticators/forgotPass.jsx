import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  Alert,
  InputAdornment,
  Fade,
  Zoom,
  Link,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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
                <EmailIcon sx={{ fontSize: 40, color: '#1A1A1A' }} />
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
                Forgot Password?
              </Typography>
              <Typography sx={{ color: goldTheme.textSecondary }}>
                Enter your email to receive reset instructions
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
                  Reset instructions have been sent to your email
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
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  placeholder="Enter your registered email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <GoldButton
                  type="submit"
                  fullWidth
                  disabled={loading}
                  endIcon={<SendIcon />}
                  sx={{ mt: 3 }}
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </GoldButton>
              </form>
            )}

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: goldTheme.textSecondary }}>
                Remember your password?{' '}
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
                  Login here
                </Link>
              </Typography>
            </Box>
          </GlassCard>
        </Box>
      </Zoom>
    </Box>
  );
};

export default ForgotPassword;