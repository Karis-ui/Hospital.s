import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
  Videocam as VideoIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  PhoneInTalk as PhoneRingIcon,
  EmailOutlined as EmailOutlinedIcon,
  Room as RoomIcon,
  Schedule as ScheduleIcon,
  Verified as VerifiedIcon,
  Diamond as DiamondIcon,
  WorkspacePremium as PremiumIcon,
  EmojiEvents as TrophyIcon,
  LocalOffer as OfferIcon,
  FlightTakeoff as FlightIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3') center/cover`,
    opacity: 0.1,
    mixBlendMode: 'overlay',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.3)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

const FloatingCard = styled(Card)(({ theme }) => ({
  background: `rgba(255, 255, 255, 0.95)`,
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(3),
  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: `0 30px 50px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const StatCard = styled(motion.div)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  textAlign: 'center',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
}));

const ServiceCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: theme.shadows[10],
    '& .service-icon': {
      transform: 'scale(1.1)',
    },
  },
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[5],
  },
}));

const NavLink = styled(Button)(({ theme, active }) => ({
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  fontWeight: 500,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -5,
    left: '50%',
    transform: 'translateX(-50%)',
    width: active ? '30px' : '0',
    height: '2px',
    background: theme.palette.primary.main,
    transition: 'width 0.3s ease',
  },
  '&:hover::after': {
    width: '30px',
  },
}));

const ScrollToTop = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  zIndex: 1000,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.1)',
  },
}));

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const stats = [
    { value: '50,000+', label: 'Happy Patients', icon: <PeopleIcon />, color: '#27ae60' },
    { value: '150+', label: 'Expert Doctors', icon: <MedicalIcon />, color: '#3498db' },
    { value: '24/7', label: 'Emergency Care', icon: <HospitalIcon />, color: '#e74c3c' },
    { value: '98%', label: 'Satisfaction Rate', icon: <ThumbUpIcon />, color: '#f39c12' },
  ];

  const services = [
    { icon: <HeartIcon />, title: 'Cardiology', description: 'Expert heart care with advanced technology', color: '#e74c3c' },
    { icon: <MedicalIcon />, title: 'Neurology', description: 'Comprehensive brain and nervous system care', color: '#3498db' },
    { icon: <LabIcon />, title: 'Laboratory', description: 'State-of-the-art diagnostic services', color: '#9b59b6' },
    { icon: <HospitalIcon />, title: 'Emergency', description: '24/7 emergency response team', color: '#e67e22' },
    { icon: <MedicalIcon />, title: 'Pediatrics', description: 'Specialized care for children', color: '#1abc9c' },
    { icon: <HeartIcon />, title: 'Orthopedics', description: 'Bone and joint specialist care', color: '#2ecc71' },
  ];

  const testimonials = [
    {
      name: 'John Mwangi',
      role: 'Cardiac Patient',
      avatar: 'JD',
      rating: 5,
      text: 'The care I received at SmartCare was exceptional. The doctors were professional and caring. Highly recommended!',
    },
    {
      name: 'Sarah Wanjiru',
      role: 'Mother of Patient',
      avatar: 'SM',
      rating: 5,
      text: 'The pediatric department is amazing! My child received excellent care and the staff was so kind.',
    },
    {
      name: "Robert Kange'the",
      role: 'Surgery Patient',
      avatar: 'RC',
      rating: 4.5,
      text: 'Top-notch facility with cutting-edge technology. The recovery was smooth and well-managed.',
    },
  ];

  const departments = [
    { name: 'Cardiology', doctors: 12, icon: <HeartIcon /> },
    { name: 'Neurology', doctors: 8, icon: <MedicalIcon /> },
    { name: 'Pediatrics', doctors: 10, icon: <PeopleIcon /> },
    { name: 'Orthopedics', doctors: 9, icon: <MedicalIcon /> },
    { name: 'Emergency', doctors: 15, icon: <HospitalIcon /> },
    { name: 'Radiology', doctors: 6, icon: <LabIcon /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveNav(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: theme.palette.primary.main,
          transformOrigin: '0%',
          scaleX,
          zIndex: 1100,
        }}
      />

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HospitalIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                SmartCare
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Hospital
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              {['home', 'services', 'about', 'location', 'contact'].map((item) => (
                <NavLink
                  key={item}
                  active={activeNav === item}
                  onClick={() => scrollToSection(item)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </NavLink>
              ))}
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ borderRadius: 3 }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register/patient')}
                sx={{ borderRadius: 3 }}
              >
                Register
              </Button>
            </Box>

            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' } }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Toolbar>
        </Container>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: 'background.paper' }}>
                {['home', 'services', 'about', 'location', 'contact'].map((item) => (
                  <Button
                    key={item}
                    fullWidth
                    onClick={() => scrollToSection(item)}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Button>
                ))}
                <Divider />
                <Button fullWidth variant="outlined" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button fullWidth variant="contained" onClick={() => navigate('/register/patient')}>
                  Register
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </AppBar>

      <HeroSection id="home">
        <Container maxWidth="xl">
          <Grid container spacing={5} alignItems="center">
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Chip
                  icon={<VerifiedIcon />}
                  label="Trusted Healthcare Provider"
                  sx={{
                    mb: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    mb: 2,
                    color: 'white',
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  }}
                >
                  Your Health, Our Priority
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: alpha('#fff', 0.9),
                    mb: 4,
                    maxWidth: 600,
                  }}
                >
                  Experience world-class healthcare with cutting-edge technology and compassionate professionals.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/register/patient')}
                    sx={{
                      borderRadius: 5,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                    }}
                  >
                    Book Appointment
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayIcon />}
                    sx={{
                      borderRadius: 5,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      color: 'white',
                      borderColor: alpha('#fff', 0.5),
                      '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) },
                    }}
                  >
                    Watch Video
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={5}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <FloatingCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      Quick Contact
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <PhoneRingIcon sx={{ color: theme.palette.primary.main }} />
                        <Typography>Emergency: +(254) 727-537-684</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ScheduleIcon sx={{ color: theme.palette.primary.main }} />
                        <Typography>24/7 Emergency Services</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LocationIcon sx={{ color: theme.palette.primary.main }} />
                        <Typography>123 Moi Ave, Nairobi City</Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<ArrowForwardIcon />}
                        onClick={() => scrollToSection('contact')}
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

      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <StatCard>
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      margin: '0 auto 16px',
                      bgcolor: alpha(stat.color, 0.1),
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
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
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <Chip label="Our Services" sx={{ mb: 2 }} />
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
              Comprehensive Medical Care
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
              We offer a wide range of specialized medical services to meet all your healthcare needs.
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ServiceCard>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar
                        className="service-icon"
                        sx={{
                          width: 80,
                          height: 80,
                          margin: '0 auto 20px',
                          bgcolor: alpha(service.color, 0.1),
                          color: service.color,
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        {service.icon}
                      </Avatar>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {service.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {service.description}
                      </Typography>
                    </CardContent>
                  </ServiceCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Chip label="Why Choose Us" sx={{ mb: 2 }} />
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
                World-Class Healthcare Excellence
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                We combine cutting-edge technology with compassionate care to deliver the best possible outcomes.
              </Typography>
              <Stack spacing={2}>
                {[
                  { icon: <SecurityIcon />, title: 'Advanced Technology', desc: 'State-of-the-art medical equipment' },
                  { icon: <PeopleIcon />, title: 'Expert Doctors', desc: 'Highly qualified specialists' },
                  { icon: <TimeIcon />, title: '24/7 Emergency', desc: 'Round-the-clock emergency care' },
                  { icon: <TrendingUpIcon />, title: 'High Success Rate', desc: 'Proven track record of excellence' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                      {item.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                      <Typography variant="body2" color="textSecondary">{item.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3"
                alt="Hospital"
                sx={{
                  width: '100%',
                  borderRadius: 4,
                  boxShadow: theme.shadows[10],
                }}
              />
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
            <Chip label="Our Departments" sx={{ mb: 2 }} />
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
              Specialized Medical Departments
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
              Our hospital features multiple specialized departments staffed by expert medical professionals.
            </Typography>
          </motion.div>

          <Grid container spacing={2}>
            {departments.map((dept, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[5],
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        margin: '0 auto 12px',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {dept.icon}
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {dept.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {dept.doctors} Doctors
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 8 }} id="about">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <Chip label="Testimonials" sx={{ mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
            What Our Patients Say
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
            Real stories from patients who experienced our care.
          </Typography>
        </motion.div>

        <Grid container spacing={3}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TestimonialCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      i < Math.floor(testimonial.rating) ? (
                        <StarIcon key={i} sx={{ color: '#f39c12', fontSize: 18 }} />
                      ) : i === Math.floor(testimonial.rating) && testimonial.rating % 1 !== 0 ? (
                        <StarHalfIcon key={i} sx={{ color: '#f39c12', fontSize: 18 }} />
                      ) : (
                        <StarIcon key={i} sx={{ color: '#e0e0e0', fontSize: 18 }} />
                      )
                    ))}
                  </Box>
                  <Typography variant="body2" color="textSecondary">
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
          mt: 4,
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center' }}
          >
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 2 }}>
              Ready to Experience Quality Healthcare?
            </Typography>
            <Typography variant="h6" sx={{ color: alpha('#fff', 0.9), mb: 4 }}>
              Book an appointment with our expert doctors today.
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/register/patient')}
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                borderRadius: 5,
                px: 5,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.9),
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Book Appointment Now
            </Button>
          </motion.div>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#1a1a2e', color: 'white', py: 6 }} id="contact">
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <HospitalIcon sx={{ fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  SmartCare Hospital
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), mb: 2 }}>
                Providing compassionate, high-quality healthcare services with cutting-edge technology and expert professionals.
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton sx={{ color: 'white', bgcolor: alpha('#fff', 0.1), '&:hover': { bgcolor: alpha('#fff', 0.2) } }}>
                  <FacebookIcon />
                </IconButton>
                <IconButton sx={{ color: 'white', bgcolor: alpha('#fff', 0.1), '&:hover': { bgcolor: alpha('#fff', 0.2) } }}>
                  <TwitterIcon />
                </IconButton>
                <IconButton sx={{ color: 'white', bgcolor: alpha('#fff', 0.1), '&:hover': { bgcolor: alpha('#fff', 0.2) } }}>
                  <InstagramIcon />
                </IconButton>
                <IconButton sx={{ color: 'white', bgcolor: alpha('#fff', 0.1), '&:hover': { bgcolor: alpha('#fff', 0.2) } }}>
                  <LinkedInIcon />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                <Button
                  sx={{ color: alpha('#fff', 0.7), justifyContent: 'flex-start', p: 0, '&:hover': { color: 'white' } }}
                  onClick={() => scrollToSection('about')}
                >
                  About Us
                </Button>
                <Button
                  sx={{ color: alpha('#fff', 0.7), justifyContent: 'flex-start', p: 0, '&:hover': { color: 'white' } }}
                  onClick={() => scrollToSection('location')}
                >
                  Our Precise location
                </Button>
                <Button
                  sx={{ color: alpha('#fff', 0.7), justifyContent: 'flex-start', p: 0, '&:hover': { color: 'white' } }}
                  onClick={() => scrollToSection('services')}
                >
                  Services
                </Button>
                <Button
                  sx={{ color: alpha('#fff', 0.7), justifyContent: 'flex-start', p: 0, '&:hover': { color: 'white' } }}
                  onClick={() => scrollToSection('contact')}
                >
                  Contact
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Contact Info
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <PhoneIcon />
                  <Typography variant="body2">+254 727-537684</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <EmailIcon />
                  <Typography variant="body2">info@smartcare.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <LocationIcon />
                  <Typography variant="body2">123 Moi Ave, Nairobi City, MC 7326</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Opening Hours
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Monday - Friday</Typography>
                  <Typography variant="body2">8:00 AM - 8:00 PM</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Saturday</Typography>
                  <Typography variant="body2">9:00 AM - 5:00 PM</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Sunday</Typography>
                  <Typography variant="body2">Emergency Only</Typography>
                </Box>
                <Chip
                  label="24/7 Emergency Available"
                  size="small"
                  sx={{ mt: 1, bgcolor: alpha('#fff', 0.1), color: 'white' }}
                />
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, bgcolor: alpha('#fff', 0.1) }} />
          <Typography variant="body2" align="center" sx={{ color: alpha('#fff', 0.6) }}>
            © {new Date().getFullYear()} SmartCare Hospital. All rights reserved. | Generated with ❤️ for better healthcare
          </Typography>
        </Container>
      </Box>

      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <ScrollToTop onClick={scrollToTop}>
              <ArrowUpIcon />
            </ScrollToTop>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Home;