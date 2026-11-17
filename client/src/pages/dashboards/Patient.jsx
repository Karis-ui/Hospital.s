import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, Avatar, Card, CardContent, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, Alert, CircularProgress, Container,
  TextField, InputAdornment, Badge, Menu, MenuItem, Divider, Tabs, Tab,
  Skeleton, LinearProgress, useTheme, useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon, Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon, Description as MedicalIcon,
  Medication as PrescriptionIcon, Add as AddIcon,
  Visibility as ViewIcon, Cancel as CancelIcon,
  CheckCircle as CheckIcon, CalendarMonth as CalendarMonthIcon,
  AccessTime as TimeIcon, FileDownload as DownloadIcon,
  Message as MessageIcon, CreditCard as CreditCardIcon,
  ArrowUpward as ArrowUpIcon, ArrowForward as ArrowForwardIcon,
  LocalHospital as HospitalIcon, Videocam as VideoIcon,
  WaterDrop as WaterIcon, DirectionsWalk as WalkIcon, Bedtime as SleepIcon,
  ReceiptLong as ReceiptIcon, SpaceDashboard as DashboardIcon,
  Person as ProfileIcon, Settings as SettingsIcon, Logout as LogoutIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/authContext';
import { PatientService } from '../../services/users/patient';
import { coreService } from '../../services/users/core';
import { formatDate } from '../../formatters';

const C = {
  deep: '#0E3B3A', sea: '#1F6F6B', sage: '#9CC5B0', mist: '#EFF6F2',
  paper: '#FBFDFB', sun: '#F3B77F', ink: '#13292A', soft: '#5C7573', line: '#DCE9E3',
  primary: '#0ea5e9', dark: '#0f172a'
};
const serif = '"Fraunces", Georgia, serif';
const sans = '"Figtree", system-ui, sans-serif';

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap');
@keyframes drift{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-8px) scale(1.03)}}
@keyframes pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@media (prefers-reduced-motion: reduce){*{animation:none!important;transition-duration:.01ms!important}}
`;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const cardStyle = { bgcolor: C.paper, border: `1px solid ${C.line}`, borderRadius: '24px', p: { xs: 2.5, md: 3 } };
const focusRing = { '&:focus-visible': { outline: `3px solid ${C.sun}`, outlineOffset: 2 } };

const healthData = [
  { name: 'Mon', heartRate: 72, steps: 4000 },
  { name: 'Tue', heartRate: 75, steps: 5500 },
  { name: 'Wed', heartRate: 68, steps: 8000 },
  { name: 'Thu', heartRate: 70, steps: 6500 },
  { name: 'Fri', heartRate: 71, steps: 9000 },
  { name: 'Sat', heartRate: 74, steps: 3000 },
  { name: 'Sun', heartRate: 69, steps: 5000 },
];

const PHASES = [
  { label: 'Breathe in', s: 4, scale: 1.4 },
  { label: 'Hold', s: 4, scale: 1.4 },
  { label: 'Breathe out', s: 6, scale: 1 },
];

function BreathOrb() {
  const [on, setOn] = useState(false);
  const [i, setI] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!on) return undefined;
    const t = setTimeout(() => {
      const n = (i + 1) % PHASES.length;
      if (n === 0) setCycles((c) => c + 1);
      setI(n);
    }, PHASES[i].s * 1000);
    return () => clearTimeout(t);
  }, [on, i]);

  const toggle = () => {
    setOn((v) => !v); setI(0);
    if (on && cycles > 0) toast.success(`${cycles} calm breath${cycles > 1 ? 's' : ''}. Well done.`);
    if (on) setCycles(0);
  };

  const p = PHASES[i];

  return (
    <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box
        component="button" onClick={toggle} aria-pressed={on}
        aria-label={on ? 'Stop breathing exercise' : 'Start a one-minute breathing exercise'}
        sx={{
          width: 130, height: 130, borderRadius: '50%', border: 0, cursor: 'pointer', color: C.deep,
          fontFamily: sans, fontWeight: 700, fontSize: 16,
          background: `radial-gradient(circle at 35% 30%, #fff 0%, ${C.sage} 55%, ${C.sea} 100%)`,
          boxShadow: `0 0 0 ${on ? 18 : 10}px rgba(156,197,176,.28), 0 0 0 ${on ? 40 : 24}px rgba(156,197,176,.14)`,
          transform: on ? `scale(${p.scale})` : 'scale(1)',
          transition: on ? `transform ${p.s}s ease-in-out, box-shadow ${p.s}s ease-in-out` : 'all .6s ease',
          animation: on ? 'none' : 'drift 6s ease-in-out infinite', ...focusRing,
        }}
      >
        {on ? p.label : 'Breathe'}
      </Box>
      <Typography sx={{ mt: 4, color: 'rgba(255,255,255,.8)', fontSize: 13, fontFamily: sans, maxWidth: 180 }} aria-live="polite">
        {on ? `${cycles} full breath${cycles === 1 ? '' : 's'}. Tap to finish.` : 'One minute of slow breathing before your day.'}
      </Typography>
    </Box>
  );
}

const MOODS = [
  { k: 'great', e: '😊', t: 'Great', msg: 'Lovely. Keep doing whatever is working for you today.' },
  { k: 'ok', e: '🙂', t: 'Okay', msg: 'Steady is good. A glass of water and a short walk go a long way.' },
  { k: 'tired', e: '😴', t: 'Tired', msg: 'Be gentle with yourself. Try an early night and a lighter day.' },
  { k: 'anxious', e: '😟', t: 'Anxious', msg: 'You are not alone in this. Try the breathing orb above, one minute is enough.' },
  { k: 'pain', e: '🤕', t: 'In pain', msg: 'Thank you for telling us. Your care team can help, so message your doctor now.' },
];

function CheckIn({ onMessage }) {
  const [mood, setMood] = useState(null);
  const m = MOODS.find((x) => x.k === mood);

  return (
    <Box sx={cardStyle}>
      <Typography sx={{ fontFamily: serif, fontSize: 22, color: C.deep, mb: 2 }}>How are you feeling today?</Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} role="radiogroup" aria-label="Mood">
        {MOODS.map((x) => (
          <Box key={x.k} component="button" role="radio" aria-checked={mood === x.k} onClick={() => setMood(x.k)}
            sx={{
              px: 2, py: 1.2, borderRadius: '999px', fontFamily: sans, fontSize: 14, cursor: 'pointer',
              border: `1.5px solid ${mood === x.k ? C.sea : C.line}`, bgcolor: mood === x.k ? C.mist : '#fff',
              color: C.ink, transition: 'all .2s', ...focusRing,
            }}>
            <span aria-hidden>{x.e} </span>{x.t}
          </Box>
        ))}
      </Box>
      {m && (
        <Box sx={{ mt: 2.5, animation: 'pop .35s ease' }}>
          <Typography sx={{ color: C.soft, fontFamily: sans, lineHeight: 1.6, maxWidth: 480 }}>{m.msg}</Typography>
          {m.k === 'pain' && (
            <Button onClick={onMessage} sx={{ mt: 1.5, bgcolor: C.deep, color: '#fff', borderRadius: '12px', px: 2.5, textTransform: 'none', '&:hover': { bgcolor: C.sea } }}>
              Message my doctor
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

const STEPS = [
  { k: 'water', t: 'Drink 8 glasses of water', i: <WaterIcon fontSize="small" /> },
  { k: 'meds', t: 'Take medication on time', i: <PrescriptionIcon fontSize="small" /> },
  { k: 'walk', t: 'Walk for 20 minutes', i: <WalkIcon fontSize="small" /> },
  { k: 'sleep', t: 'In bed before 10:30 pm', i: <SleepIcon fontSize="small" /> },
];
const dayKey = () => `care-${new Date().toISOString().slice(0, 10)}`;

function CareSteps() {
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(dayKey()) || '[]'); } catch { return []; }
  });
  const toggle = (k) => {
    const next = done.includes(k) ? done.filter((x) => x !== k) : [...done, k];
    setDone(next);
    try { localStorage.setItem(dayKey(), JSON.stringify(next)); } catch { /* ignore */ }
    if (next.length === STEPS.length) toast.success('All four done today. Your body thanks you.');
  };
  const pct = done.length / STEPS.length;
  const R = 44, L = 2 * Math.PI * R;

  return (
    <Box sx={{ ...cardStyle, display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
      <Box sx={{ position: 'relative', width: 108, height: 108, flexShrink: 0 }}>
        <svg width="108" height="108" viewBox="0 0 108 108" role="img" aria-label={`${done.length} of ${STEPS.length} steps done`}>
          <circle cx="54" cy="54" r={R} fill="none" stroke={C.line} strokeWidth="9" />
          <circle cx="54" cy="54" r={R} fill="none" stroke={C.sea} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={L} strokeDashoffset={L * (1 - pct)} transform="rotate(-90 54 54)"
            style={{ transition: 'stroke-dashoffset .6s ease' }} />
        </svg>
        <Typography sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: serif, fontSize: 26, color: C.deep }}>
          {done.length}/{STEPS.length}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Typography sx={{ fontFamily: serif, fontSize: 22, color: C.deep, mb: 1 }}>Today’s care steps</Typography>
        {STEPS.map((s) => {
          const on = done.includes(s.k);
          return (
            <Box key={s.k} component="button" onClick={() => toggle(s.k)} aria-pressed={on}
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', textAlign: 'left', py: 0.9, border: 0, bgcolor: 'transparent', cursor: 'pointer', fontFamily: sans, fontSize: 15, color: on ? C.soft : C.ink, textDecoration: on ? 'line-through' : 'none', ...focusRing }}>
              <Box sx={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', border: `1.5px solid ${on ? C.sea : C.line}`, bgcolor: on ? C.sea : '#fff', color: '#fff', transition: 'all .25s' }}>
                {on ? <CheckIcon sx={{ fontSize: 16 }} /> : <Box sx={{ color: C.sage, display: 'flex' }}>{s.i}</Box>}
              </Box>
              {s.t}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: Appointments, 2: Billing
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await PatientService.getDashboard();
      setDashboardData(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.Message || 'We couldn’t load your dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await coreService.notifications();
      setNotifications(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      setNotifications([
        { id: 1, message: 'Lab results are ready for review', read: false },
        { id: 2, message: 'Your invoice is due soon', read: false },
        { id: 3, message: 'Appointment confirmed with Dr. Smith', read: true },
      ]);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      setCancellingId(id);
      await PatientService.cancelAppointment(id);
      toast.success('Appointment cancelled successfully');
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.Message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const patient = dashboardData?.patient || {};
  const upcomingAppointments = dashboardData?.upcoming_appointments || [];
  const completedAppointments = dashboardData?.completed_appointments || [];
  const recentBills = dashboardData?.bills || [];
  const labReports = dashboardData?.lab_reports || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const stats = {
    total_appointments: upcomingAppointments.length + completedAppointments.length,
    upcoming_appointments_count: upcomingAppointments.length,
    active_prescriptions: 2, // Placeholder
    total_reports: labReports.length,
  };

  const patientName = patient.first_name || user?.first_name || 'there';
  const nextAppointment = upcomingAppointments[0];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: C.mist }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: C.sea, mb: 2 }} />
          <Typography sx={{ fontFamily: serif, color: C.deep, fontSize: 20 }}>Gathering your care details…</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: C.mist, minHeight: '100vh', fontFamily: sans, pb: 8 }}>
      <style>{GLOBAL_CSS}</style>

      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        px: { xs: 2, md: 5 }, py: 2, bgcolor: 'rgba(251, 253, 251, 0.8)',
        backdropFilter: 'blur(10px)', borderBottom: `1px solid ${C.line}`,
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontFamily: serif, fontWeight: 700, color: C.deep, display: { xs: 'none', sm: 'block' } }}>
            SmartCare
          </Typography>
          <Chip label="Patient Portal" size="small" sx={{ bgcolor: C.sage, color: C.deep, fontWeight: 700, display: { xs: 'none', sm: 'flex' } }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search records..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              width: { xs: 150, sm: 250 },
              bgcolor: 'white',
              borderRadius: 3,
              '& fieldset': { borderColor: C.line },
              '&:hover fieldset': { borderColor: C.sage },
              '&.Mui-focused fieldset': { borderColor: C.sea },
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: C.soft, fontSize: 20 }} /></InputAdornment>,
            }}
          />
          <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ bgcolor: 'white', border: `1px solid ${C.line}` }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon sx={{ color: C.deep }} />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      <Box sx={{
        bgcolor: C.deep, color: '#fff', px: { xs: 3, md: 7 }, pt: 4, pb: { xs: 8, md: 10 },
        borderRadius: '0 0 48px 48px', position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, bgcolor: 'rgba(156,197,176,0.05)', borderRadius: '50%' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: '20%', width: 300, height: 300, bgcolor: 'rgba(31,111,107,0.2)', borderRadius: '50%' }} />

        <Grid container alignItems="center" spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
          <Grid item xs={12} md={8}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <Typography component="h1" sx={{ fontFamily: serif, fontSize: { xs: 38, md: 56 }, lineHeight: 1.1, fontWeight: 400 }}>
                {greeting()}, {patientName}.
              </Typography>
              <Typography sx={{ mt: 2, color: 'rgba(255,255,255,.78)', fontSize: 18, lineHeight: 1.6, maxWidth: 600 }}>
                {nextAppointment
                  ? `Your next visit is with Dr. ${nextAppointment.doctor_name || 'Assigned'} on ${formatDate(nextAppointment.appointment_date, 'short')} at ${nextAppointment.appointment_time}. Everything else is in order.`
                  : 'You have no visits planned. Rest well, and book one whenever you are ready.'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => navigate('/patient/book-appointment')} sx={{ bgcolor: 'white', color: C.deep, fontWeight: 700, borderRadius: 3, px: 4, '&:hover': { bgcolor: C.mist } }}>
                  Book a Visit
                </Button>
                <Button variant="outlined" size="large" onClick={() => setActiveTab(1)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 3, px: 4, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  View Schedule
                </Button>
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
              <BreathOrb />
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, mt: -4, position: 'relative', zIndex: 2 }}>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} action={<Button color="inherit" size="small" onClick={fetchDashboardData}>Try again</Button>}>{error}</Alert>}

        <Paper sx={{ mb: 4, borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              '& .MuiTabs-indicator': { bgcolor: C.sea, height: 3 },
              '& .MuiTab-root': { fontFamily: sans, fontWeight: 600, fontSize: 15, py: 2, color: C.soft },
              '& .Mui-selected': { color: `${C.deep} !important` }
            }}
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<CalendarIcon />} iconPosition="start" label="Appointments" />
            <Tab icon={<ReceiptIcon />} iconPosition="start" label="Billing" />
            <Tab icon={<MedicalIcon />} iconPosition="start" label="Records" />
          </Tabs>
        </Paper>

        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div key="tab0" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={staggerContainer}>

              <motion.div variants={fadeUp}>
                <Box sx={{ ...cardStyle, mb: 4, display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                  {nextAppointment ? (
                    <>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: C.sage, color: C.deep, width: 64, height: 64, fontFamily: serif, fontSize: 24 }}>
                          {(nextAppointment.doctor_name || 'D').charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontFamily: serif, fontSize: 24, color: C.deep }}>Dr. {nextAppointment.doctor_name || 'to be assigned'}</Typography>
                          <Typography sx={{ color: C.soft, fontSize: 15, mt: 0.5 }}>
                            {nextAppointment.doctor_specialization || nextAppointment.department || 'General'} · {formatDate(nextAppointment.appointment_date, 'short')} at {nextAppointment.appointment_time}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => setActiveTab(1)} sx={{ textTransform: 'none', color: C.deep, borderRadius: '12px', fontWeight: 600 }}>Details</Button>
                        <Button disabled={cancellingId === nextAppointment.id} onClick={() => handleCancelAppointment(nextAppointment.id)} sx={{ textTransform: 'none', color: '#9B3B2E', borderRadius: '12px', fontWeight: 600 }}>Cancel</Button>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ width: '100%', textAlign: 'center', py: 2 }}>
                      <Typography sx={{ fontFamily: serif, fontSize: 22, color: C.deep }}>Nothing booked yet</Typography>
                      <Typography sx={{ color: C.soft, fontSize: 15, mb: 2 }}>A check-up takes about two minutes to arrange.</Typography>
                      <Button onClick={() => navigate('/patient/book-appointment')} sx={{ bgcolor: C.deep, color: '#fff', px: 3, py: 1.2, borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: C.sea } }}>Book a visit</Button>
                    </Box>
                  )}
                </Box>
              </motion.div>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                  { title: 'Total Visits', value: stats.total_appointments, icon: <HospitalIcon />, color: '#0ea5e9', bg: '#e0f2fe' },
                  { title: 'Upcoming Visits', value: stats.upcoming_appointments_count, icon: <CalendarIcon />, color: '#8b5cf6', bg: '#ede9fe' },
                  { title: 'Prescriptions', value: stats.active_prescriptions, icon: <PrescriptionIcon />, color: '#10b981', bg: '#d1fae5' },
                  { title: 'Lab Reports', value: stats.total_reports, icon: <MedicalIcon />, color: '#f59e0b', bg: '#fef3c7' },
                ].map((stat, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <motion.div variants={fadeUp} whileHover={{ y: -5 }}>
                      <Card sx={{ borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: `1px solid ${C.line}`, transition: 'all 0.3s' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="body2" color="textSecondary" fontWeight={600} mb={1}>{stat.title}</Typography>
                              <Typography variant="h3" sx={{ fontFamily: serif, fontWeight: 700, color: C.deep }}>{stat.value}</Typography>
                            </Box>
                            <Box sx={{ p: 1.5, bgcolor: stat.bg, color: stat.color, borderRadius: 3 }}>
                              {stat.icon}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <motion.div variants={fadeUp}>
                    <CheckIn onMessage={() => toast.info('Messaging is coming soon')} />
                  </motion.div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <motion.div variants={fadeUp}>
                    <CareSteps />
                  </motion.div>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <motion.div variants={fadeUp}>
                    <Paper sx={{ p: 4, borderRadius: 4, border: `1px solid ${C.line}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                          <Typography sx={{ fontFamily: serif, fontSize: 22, color: C.deep }}>Health Vitals Trend</Typography>
                          <Typography variant="caption" color="textSecondary">Heart rate & Activity over the last 7 days</Typography>
                        </Box>
                        <Chip label="Live Data" color="success" size="small" sx={{ fontWeight: 700 }} />
                      </Box>
                      <Box sx={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={C.sea} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={C.sea} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: C.soft, fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: C.soft, fontSize: 12 }} />
                            <RechartsTooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="heartRate" stroke={C.sea} strokeWidth={3} fillOpacity={1} fill="url(#colorHeart)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>

                <Grid item xs={12} lg={4}>
                  <motion.div variants={fadeUp}>
                    <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${C.line}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', height: '100%' }}>
                      <Typography sx={{ fontFamily: serif, fontSize: 22, color: C.deep, mb: 3 }}>Quick Actions</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                          { icon: <CalendarMonthIcon />, title: 'Book Appointment', color: '#3b82f6', bg: '#eff6ff', action: 'book' },
                          { icon: <MedicalIcon />, title: 'View Records', color: '#10b981', bg: '#ecfdf5', action: 'records' },
                          { icon: <DownloadIcon />, title: 'Download Reports', color: '#f59e0b', bg: '#fffbeb', action: 'download' },
                          { icon: <CreditCardIcon />, title: 'Pay Bill', color: '#ef4444', bg: '#fef2f2', action: 'pay' },
                        ].map((action, index) => (
                          <Box
                            key={index}
                            onClick={() => action.action === 'book' ? navigate('/patient/book-appointment') : setActiveTab(2)}
                            sx={{
                              p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3, border: `1px solid ${C.line}`, cursor: 'pointer',
                              transition: 'all 0.2s', '&:hover': { bgcolor: action.bg, borderColor: action.color }
                            }}
                          >
                            <Box sx={{ p: 1, bgcolor: action.bg, color: action.color, borderRadius: 2 }}>{action.icon}</Box>
                            <Typography sx={{ fontWeight: 600, color: C.ink, fontSize: 15 }}>{action.title}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div key="tab1" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={staggerContainer}>
              <Paper sx={{ p: 4, borderRadius: 4, border: `1px solid ${C.line}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography sx={{ fontFamily: serif, fontSize: 28, color: C.deep }}>All Appointments</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/patient/book-appointment')} sx={{ bgcolor: C.deep, color: 'white', borderRadius: 3, textTransform: 'none', '&:hover': { bgcolor: C.sea } }}>New Appointment</Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: C.mist }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: C.deep }}>Date & Time</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: C.deep }}>Doctor</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: C.deep }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: C.deep }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: C.deep }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...upcomingAppointments, ...completedAppointments].length > 0 ? (
                        [...upcomingAppointments, ...completedAppointments].map((apt) => (
                          <TableRow key={apt.id} hover>
                            <TableCell>
                              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{apt.appointment_date ? formatDate(apt.appointment_date, 'short') : 'TBD'}</Typography>
                              <Typography sx={{ fontSize: 13, color: C.soft }}>{apt.appointment_time || '--:--'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Dr. {apt.doctor_name || 'Not Assigned'}</Typography>
                              <Typography sx={{ fontSize: 13, color: C.soft }}>{apt.doctor_specialization || ''}</Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: 14 }}>{apt.department || 'General'}</TableCell>
                            <TableCell>
                              <Chip size="small" label={apt.status || 'Scheduled'}
                                sx={{
                                  fontWeight: 600, borderRadius: 1.5,
                                  bgcolor: apt.status === 'Confirmed' ? '#dcfce7' : apt.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                                  color: apt.status === 'Confirmed' ? '#166534' : apt.status === 'Cancelled' ? '#991b1b' : '#92400e'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="View">
                                <IconButton size="small" onClick={() => navigate('/patient/appointments')} sx={{ color: C.sea }}><ViewIcon fontSize="small" /></IconButton>
                              </Tooltip>
                              {apt.status?.toLowerCase() !== 'cancelled' && apt.status?.toLowerCase() !== 'completed' && (
                                <Tooltip title="Cancel">
                                  <IconButton size="small" color="error" onClick={() => handleCancelAppointment(apt.id)} disabled={cancellingId === apt.id}>
                                    {cancellingId === apt.id ? <CircularProgress size={18} /> : <CancelIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                            <Typography color="textSecondary">No appointments found.</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div key="tab2" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={staggerContainer}>
              <Paper sx={{ p: 4, borderRadius: 4, border: `1px solid ${C.line}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography sx={{ fontFamily: serif, fontSize: 28, color: C.deep }}>Billing & Invoices</Typography>
                  <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ borderColor: C.sea, color: C.sea, borderRadius: 3, textTransform: 'none' }}>Export CSV</Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: C.mist }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, color: C.deep }}>Invoice ID</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: C.deep }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: C.deep }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: C.deep }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: C.deep }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentBills.length > 0 ? recentBills.map((bill) => (
                        <TableRow key={bill.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>INV-{bill.id?.toString().padStart(5, '0')}</TableCell>
                          <TableCell>{formatDate(bill.created_at, 'short')}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>${bill.amount}</TableCell>
                          <TableCell>
                            <Chip size="small" label={bill.payment_status} color={bill.payment_status === 'Cleared' ? 'success' : 'warning'} sx={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="contained" sx={{ bgcolor: C.deep, '&:hover': { bgcolor: C.sea }, borderRadius: 2 }}>Pay Now</Button>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                            <Typography color="textSecondary">No billing history found.</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </motion.div>
          )}

          {activeTab === 3 && (
            <motion.div key="tab3" initial="hidden" animate="visible" exit={{ opacity: 0, y: -20 }} variants={staggerContainer}>
              <Paper sx={{ p: 4, borderRadius: 4, border: `1px solid ${C.line}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <Typography sx={{ fontFamily: serif, fontSize: 28, color: C.deep, mb: 4 }}>Medical Records</Typography>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Medical records and lab results will be fully integrated here in the next update. You can view your current lab reports in the sidebar.
                </Alert>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        <Box sx={{ textAlign: 'center', py: 4, mt: 4, borderTop: `1px solid ${C.line}` }}>
          <Typography sx={{ color: C.soft, fontSize: 14 }}>
            © {new Date().getFullYear()} SmartCare Hospital. All rights reserved. | Patient Portal v3.0
          </Typography>
        </Box>
      </Box>

      {/* NOTIFICATIONS MENU */}
      <Menu
        anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)}
        PaperProps={{ sx: { width: 320, maxHeight: 400, borderRadius: 3, mt: 1.5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontFamily: serif }}>Notifications</Typography>
          <Chip label={`${unreadCount} New`} size="small" sx={{ bgcolor: C.mist, color: C.sea, fontWeight: 700 }} />
        </Box>
        <Divider />
        {notifications.length > 0 ? notifications.map((notif) => (
          <MenuItem key={notif.id} sx={{ py: 2, px: 2, bgcolor: notif.read ? 'transparent' : '#f0fdf4' }}>
            <Box>
              <Typography sx={{ fontWeight: notif.read ? 400 : 600, fontSize: 14 }}>{notif.message}</Typography>
              <Typography sx={{ fontSize: 12, color: C.soft, mt: 0.5 }}>Just now</Typography>
            </Box>
          </MenuItem>
        )) : (
          <MenuItem disabled><Typography sx={{ fontSize: 14 }}>No new notifications</Typography></MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default PatientDashboard;