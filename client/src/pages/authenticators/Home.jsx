import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  IconButton,
  useTheme,
  alpha,
  Stack,
  Divider,
  Chip,
  Paper,
  Fade,
  Slide,
  Zoom,
  Grow,
  LinearProgress,
  Tooltip,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  useScrollTrigger,
  Badge,
  Skeleton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckIcon,
  Favorite as HeartIcon,
  MedicalServices as MedicalIcon,
  Science as LabIcon,
  LocalHospital as HospitalIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Star as StarIcon,
  StarHalf as StarHalfIcon,
  PlayCircleFilled as PlayIcon,
  Security as SecurityIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  ThumbUp as ThumbUpIcon,
  ArrowUpward as ArrowUpIcon,
  ChevronRight as ChevronRightIcon,
  PhoneInTalk as PhoneRingIcon,
  Room as RoomIcon,
  Schedule as ScheduleIcon,
  Verified as VerifiedIcon,
  Speed as SpeedIcon,
  AutoAwesome as AutoAwesomeIcon,
  Sensors as SensorsIcon,
  HealthAndSafety as HealthIcon,
  Psychology as PsychologyIcon,
  Bloodtype as BloodIcon,
  MonitorHeart as MonitorIcon,
  Vaccines as VaccineIcon,
  Elderly as ElderlyIcon,
  ChildCare as ChildCareIcon,
  Emergency as EmergencyIcon,
  FitnessCenter as FitnessIcon,
  SelfImprovement as WellnessIcon,
  SmartToy as AIcon,
  QrCodeScanner as ScanIcon,
  CloudUpload as CloudIcon,
  DataUsage as DataIcon,
} from '@mui/icons-material';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/authContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.92),
  backdropFilter: 'blur(20px)',
  boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  transition: 'all 0.3s ease',
  '&.scrolled': {
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 40%, ${theme.palette.secondary.main} 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80') center/cover`,
    opacity: 0.08,
    mixBlendMode: 'overlay',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -200,
    right: -200,
    width: 500,
    height: 500,
    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const FloatingCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(3),
  boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.15)}`,
  border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 32px 64px ${alpha(theme.palette.common.black, 0.2)}`,
  },
}));

const StatCard = styled(motion.div)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.92),
  backdropFilter: 'blur(12px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3.5, 2),
  textAlign: 'center',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.2),
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const ServiceCard = styled(motion.div)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(2.5),
  padding: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.08)}`,
    '&::before': { opacity: 1 },
  },
}));

const TestimonialCard = styled(motion.div)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(2.5),
  padding: theme.spacing(3.5),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.06)}`,
  },
}));

const SectionBadge = styled(Chip)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  fontWeight: 600,
  letterSpacing: '0.02em',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(3),
  fontSize: '0.75rem',
  textTransform: 'uppercase',
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: active ? 600 : 500,
  fontSize: '0.875rem',
  textTransform: 'none',
  padding: theme.spacing(0.5, 1.5),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 2,
    left: '50%',
    transform: 'translateX(-50%)',
    width: active ? 20 : 0,
    height: 2,
    background: theme.palette.primary.main,
    borderRadius: 1,
    transition: 'width 0.3s ease',
  },
  '&:hover': {
    color: theme.palette.primary.main,
    background: 'transparent',
    '&::after': { width: 20 },
  },
}));

const ScrollTopButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 1000,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.45)}`,
  },
}));

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const stats = [
    { value: '50K+', label: 'Patients Treated', icon: <PeopleIcon />, color: '#27ae60', growth: 12 },
    { value: '200+', label: 'Expert Physicians', icon: <MedicalIcon />, color: '#3498db', growth: 8 },
    { value: '24/7', label: 'Emergency Care', icon: <EmergencyIcon />, color: '#e74c3c', growth: 0 },
    { value: '98.5%', label: 'Patient Satisfaction', icon: <ThumbUpIcon />, color: '#f39c12', growth: 5 },
  ];

  const services = [
    { icon: <HeartIcon />, title: 'Cardiology', description: 'Advanced cardiac care with state-of-the-art diagnostic and treatment options.', color: '#e74c3c', gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)' },
    { icon: <PsychologyIcon />, title: 'Neurology', description: 'Comprehensive neurological services for brain, spine, and nervous system disorders.', color: '#3498db', gradient: 'linear-gradient(135deg, #3498db, #2980b9)' },
    { icon: <VaccineIcon />, title: 'Immunology', description: 'Specialized care for immune system disorders and advanced vaccination programs.', color: '#9b59b6', gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)' },
    { icon: <MonitorIcon />, title: 'Critical Care', description: 'Advanced intensive care with 24/7 monitoring and emergency response teams.', color: '#e67e22', gradient: 'linear-gradient(135deg, #e67e22, #d35400)' },
    { icon: <ChildCareIcon />, title: 'Pediatrics', description: 'Expert pediatric care for children of all ages in a child-friendly environment.', color: '#1abc9c', gradient: 'linear-gradient(135deg, #1abc9c, #16a085)' },
    { icon: <FitnessIcon />, title: 'Orthopedics', description: 'Comprehensive orthopedic services including joint replacement and sports medicine.', color: '#2ecc71', gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)' },
    { icon: <BloodIcon />, title: 'Hematology', description: 'Advanced blood disorder diagnosis and treatment with specialized care.', color: '#e74c3c', gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)' },
    { icon: <ElderlyIcon />, title: 'Geriatrics', description: 'Specialized healthcare for elderly patients with comprehensive geriatric assessment.', color: '#2c3e50', gradient: 'linear-gradient(135deg, #2c3e50, #1a252f)' },
  ];

  const testimonials = [
    {
      name: 'Dr. James Mwangi',
      role: 'Cardiac Patient',
      avatar: 'JM',
      rating: 5,
      text: 'The cardiology team at SmartCare saved my life. Their expertise and compassionate care made all the difference. I am forever grateful.',
    },
    {
      name: 'Sarah Wanjiru',
      role: 'Mother of Patient',
      avatar: 'SW',
      rating: 5,
      text: 'My daughter received exceptional care in the pediatric ward. The doctors and nurses treated her with such kindness and professionalism.',
    },
    {
      name: 'Robert Kiprono',
      role: 'Surgery Patient',
      avatar: 'RK',
      rating: 4.5,
      text: 'From diagnosis to recovery, the orthopedic team was outstanding. The facility is world-class and the staff truly cares about patient outcomes.',
    },
    {
      name: 'Grace Ochieng',
      role: 'Maternity Patient',
      avatar: 'GO',
      rating: 5,
      text: 'I had my baby at SmartCare and the experience was incredible. The maternity ward is comfortable and the midwives are angels.',
    },
  ];

  const achievements = [
    { icon: <VerifiedIcon />, label: 'ISO Certified', description: 'International quality standards' },
    { icon: <AutoAwesomeIcon />, label: 'AI-Powered Diagnostics', description: 'Cutting-edge technology' },
    { icon: <SensorsIcon />, label: 'IoT Monitoring', description: 'Real-time patient tracking' },
    { icon: <SecurityIcon />, label: 'Data Security', description: 'HIPAA compliant systems' },
  ];

  const departments = [
    { name: 'Cardiology', doctors: 18, icon: <HeartIcon /> },
    { name: 'Neurology', doctors: 12, icon: <PsychologyIcon /> },
    { name: 'Pediatrics', doctors: 15, icon: <ChildCareIcon /> },
    { name: 'Orthopedics', doctors: 14, icon: <FitnessIcon /> },
    { name: 'Emergency', doctors: 22, icon: <EmergencyIcon /> },
    { name: 'Radiology', doctors: 10, icon: <ScanIcon /> },
    { name: 'Oncology', doctors: 8, icon: <HealthIcon /> },
    { name: 'Psychiatry', doctors: 9, icon: <PsychologyIcon /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveSection(sectionId);
    setMobileOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    if (user) {
      const role = user.user_type || user.role || 'patient';
      const rolePaths = {
        admin: '/admin/dashboard',
        doctor: '/doctor/dashboard',
        lab_technician: '/lab/dashboard',
        patient: '/patient/dashboard',
        operator: '/operator/dashboard',
      };
      navigate(rolePaths[role] || '/patient/dashboard');
    } else {
      navigate('/register/patient');
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          transformOrigin: '0%',
          scaleX,
          zIndex: 9999,
        }}
      />

      <StyledAppBar className={isScrolled ? 'scrolled' : ''}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
              onClick={() => scrollToSection('home')}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <HospitalIcon sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: theme.palette.primary.main }}>
                  SmartCare
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Hospital Management
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              {navItems.map((item) => (
                <NavButton
                  key={item.id}
                  active={activeSection === item.id}
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </NavButton>
              ))}
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
              {user ? (
                <Button
                  variant="contained"
                  onClick={handleGetStarted}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    px: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    sx={{ borderRadius: 3, textTransform: 'none', color: theme.palette.text.secondary }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/register/patient')}
                    sx={{
                      borderRadius: 3,
                      textTransform: 'none',
                      px: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </Box>

            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' } }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Toolbar>
        </Container>
      </StyledAppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            pt: 3,
            px: 2,
            background: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <HospitalIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>SmartCare</Typography>
        </Box>
        <List sx={{ flex: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton onClick={() => scrollToSection(item.id)} selected={activeSection === item.id}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        {user ? (
          <Button
            fullWidth
            variant="contained"
            onClick={handleGetStarted}
            sx={{ borderRadius: 3, textTransform: 'none' }}
          >
            Dashboard
          </Button>
        ) : (
          <Stack spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{ borderRadius: 3, textTransform: 'none' }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/register/patient')}
              sx={{ borderRadius: 3, textTransform: 'none' }}
            >
              Get Started
            </Button>
          </Stack>
        )}
      </Drawer>

      <HeroSection id="home" ref={heroRef}>
        <Container maxWidth="xl">
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} lg={7}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionBadge
                  icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                  label="Trusted Healthcare Provider"
                  sx={{ mb: 3 }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.25rem' },
                    lineHeight: 1.1,
                    color: 'white',
                    textShadow: `0 2px 20px ${alpha(theme.palette.common.black, 0.15)}`,
                    mb: 2,
                  }}
                >
                  Your Health,{' '}
                  <Box component="span" sx={{ color: theme.palette.secondary.main }}>
                    Our Priority
                  </Box>
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: alpha(theme.palette.common.white, 0.85),
                    maxWidth: 560,
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Experience world-class healthcare with cutting-edge technology, 
                  expert physicians, and compassionate care tailored to you.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleGetStarted}
                    sx={{
                      borderRadius: 4,
                      px: 4,
                      py: 1.75,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.35)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.45)}`,
                      },
                    }}
                  >
                    {user ? 'Go to Dashboard' : 'Book Appointment'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayIcon />}
                    sx={{
                      borderRadius: 4,
                      px: 4,
                      py: 1.75,
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: 'white',
                      borderColor: alpha(theme.palette.common.white, 0.4),
                      '&:hover': {
                        borderColor: theme.palette.common.white,
                        background: alpha(theme.palette.common.white, 0.08),
                      },
                    }}
                  >
                    Watch Tour
                  </Button>
                </Stack>

                <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
                  {achievements.slice(0, 3).map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: alpha(theme.palette.common.white, 0.5) }}>{item.icon}</Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, display: 'block' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.5), fontSize: '0.65rem' }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={5}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <FloatingCard>
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AutoAwesomeIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
                      Quick Access
                    </Typography>
                    <Stack spacing={2.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <PhoneRingIcon sx={{ color: theme.palette.primary.main }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>Emergency</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>+(254) 727-537-684</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <ScheduleIcon sx={{ color: theme.palette.primary.main }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>Available</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>24/7 Emergency Services</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <RoomIcon sx={{ color: theme.palette.primary.main }} />
                        <Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>Location</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>123 Moi Ave, Nairobi</Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => scrollToSection('contact')}
                        sx={{ borderRadius: 2, textTransform: 'none', mt: 1 }}
                      >
                        Contact Us
                      </Button>
                    </Stack>
                  </CardContent>
                </FloatingCard>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </HeroSection>

      <Container maxWidth="xl" sx={{ py: 6, mt: -4, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <StatCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: alpha(stat.color, 0.12),
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
                    {stat.label}
                  </Typography>
                  {stat.growth > 0 && (
                    <Chip
                      label={`+${stat.growth}%`}
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: alpha(stat.color, 0.1),
                        color: stat.color,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </StatCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), py: 8 }} id="services">
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <SectionBadge label="Our Services" sx={{ mb: 2 }} />
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
                Comprehensive Medical Care
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary, maxWidth: 680, mx: 'auto', fontWeight: 400 }}>
                We offer a wide range of specialized medical services to meet all your healthcare needs with excellence and compassion.
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <ServiceCard>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mb: 2,
                        background: service.gradient,
                        color: 'white',
                        boxShadow: `0 8px 24px ${alpha(service.color, 0.25)}`,
                      }}
                    >
                      {service.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                      {service.description}
                    </Typography>
                  </ServiceCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 8 }} id="about">
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionBadge label="Why Choose Us" sx={{ mb: 2 }} />
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
                World-Class Healthcare Excellence
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3, lineHeight: 1.8 }}>
                We combine cutting-edge technology with compassionate care to deliver the best possible outcomes for every patient.
              </Typography>
              <Stack spacing={2}>
                {[
                  { icon: <SecurityIcon />, title: 'Advanced Technology', desc: 'State-of-the-art medical equipment and AI-powered diagnostics' },
                  { icon: <PeopleIcon />, title: 'Expert Physicians', desc: 'Highly qualified specialists with international experience' },
                  { icon: <TimeIcon />, title: '24/7 Emergency Care', desc: 'Round-the-clock emergency services with rapid response' },
                  { icon: <TrendingUpIcon />, title: 'Proven Outcomes', desc: 'Industry-leading success rates and patient satisfaction' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2.5, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                        width: 44,
                        height: 44,
                      }}
                    >
                      {item.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{item.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="SmartCare Hospital"
                  sx={{
                    width: '100%',
                    borderRadius: 4,
                    boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.12)}`,
                  }}
                />
                <Chip
                  icon={<VerifiedIcon />}
                  label="Accredited Facility"
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
                    fontWeight: 600,
                  }}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02), py: 8 }}>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <SectionBadge label="Our Departments" sx={{ mb: 2 }} />
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
              Specialized Medical Departments
            </Typography>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary, maxWidth: 680, mx: 'auto', fontWeight: 400 }}>
              Our hospital features multiple specialized departments staffed by expert medical professionals.
            </Typography>
          </motion.div>

          <Grid container spacing={2}>
            {departments.map((dept, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    sx={{
                      p: 2.5,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        margin: '0 auto 10px',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {dept.icon}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {dept.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {dept.doctors} Specialists
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <Container maxWidth="xl" sx={{ py: 8 }} id="testimonials">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <SectionBadge label="Testimonials" sx={{ mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
            What Our Patients Say
          </Typography>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary, maxWidth: 680, mx: 'auto', fontWeight: 400 }}>
            Real stories from patients who experienced our exceptional care.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <TestimonialCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 44, height: 44 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                    {[...Array(5)].map((_, i) => (
                      i < Math.floor(testimonial.rating) ? (
                        <StarIcon key={i} sx={{ color: '#f39c12', fontSize: 16 }} />
                      ) : i === Math.floor(testimonial.rating) && testimonial.rating % 1 !== 0 ? (
                        <StarHalfIcon key={i} sx={{ color: '#f39c12', fontSize: 16 }} />
                      ) : (
                        <StarIcon key={i} sx={{ color: '#e0e0e0', fontSize: 16 }} />
                      )
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
                    "{testimonial.text}"
                  </Typography>
                </TestimonialCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          py: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.06)} 0%, transparent 70%)`,
            borderRadius: '50%',
          },
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
          >
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>
              Ready to Experience Quality Healthcare?
            </Typography>
            <Typography variant="h6" sx={{ color: alpha(theme.palette.common.white, 0.85), mb: 4, fontWeight: 400 }}>
              Book an appointment with our expert doctors today and start your journey to better health.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleGetStarted}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  borderRadius: 4,
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.9),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {user ? 'Go to Dashboard' : 'Book Appointment'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => scrollToSection('services')}
                sx={{
                  borderColor: alpha(theme.palette.common.white, 0.4),
                  color: 'white',
                  borderRadius: 4,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: theme.palette.common.white,
                    bgcolor: alpha(theme.palette.common.white, 0.06),
                  },
                }}
              >
                Explore Services
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#0f1923', color: 'white', py: 6 }} id="contact">
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HospitalIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  SmartCare
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.6), mb: 2, lineHeight: 1.8 }}>
                Providing compassionate, high-quality healthcare services with cutting-edge technology and expert professionals.
              </Typography>
              <Stack direction="row" spacing={1}>
                {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedInIcon].map((Icon, idx) => (
                  <IconButton
                    key={idx}
                    sx={{
                      color: alpha(theme.palette.common.white, 0.6),
                      bgcolor: alpha(theme.palette.common.white, 0.04),
                      '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1), color: 'white' },
                    }}
                  >
                    <Icon sx={{ fontSize: 18 }} />
                  </IconButton>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    sx={{
                      color: alpha(theme.palette.common.white, 0.6),
                      justifyContent: 'flex-start',
                      p: 0,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} md={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
                Contact Info
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <PhoneIcon sx={{ color: alpha(theme.palette.common.white, 0.5), fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    +254 727-537-684
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <EmailIcon sx={{ color: alpha(theme.palette.common.white, 0.5), fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    info@smartcare.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <RoomIcon sx={{ color: alpha(theme.palette.common.white, 0.5), fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                    123 Moi Ave, Nairobi
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
                Opening Hours
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.6) }}>Mon - Fri</Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.8) }}>8:00 AM - 8:00 PM</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.6) }}>Saturday</Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.8) }}>9:00 AM - 5:00 PM</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.6) }}>Sunday</Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.8) }}>Emergency Only</Typography>
                </Box>
                <Chip
                  label="24/7 Emergency Available"
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: alpha(theme.palette.secondary.main, 0.15),
                    color: theme.palette.secondary.main,
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, bgcolor: alpha(theme.palette.common.white, 0.06) }} />
          <Typography variant="body2" align="center" sx={{ color: alpha(theme.palette.common.white, 0.4), fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} SmartCare Hospital. All rights reserved. | Made with ❤️ for better healthcare
          </Typography>
        </Container>
      </Box>

      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ScrollTopButton onClick={scrollToTop}>
              <ArrowUpIcon />
            </ScrollTopButton>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Home;