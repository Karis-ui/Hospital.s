import { Box, Avatar, Card, Button, Paper, Chip, Typography, TableRow, BottomNavigation as Navbar, Icon as IconButton } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

export const platinumTheme = {
  primary: { main: '#1a2639', light: '#2c3e50', dark: '#0f1a2f', contrast: '#ffffff' },
  secondary: { main: '#c9b037', light: '#e4d96f', dark: '#aa8c2f', contrast: '#1a2639' },
  accent: { blue: '#3498db', green: '#27ae60', orange: '#f39c12', red: '#e74c3c', purple: '#9b59b6', teal: '#00b894' },
  background: { default: '#f0f2f5', paper: '#ffffff', elevated: '#f8fafc', dark: '#1e293b' },
  text: { primary: '#1e293b', secondary: '#64748b', disabled: '#94a3b8', light: '#ffffff' },
  status: { success: '#27ae60', warning: '#f39c12', error: '#e74c3c', info: '#3498db', online: '#27ae60', offline: '#94a3b8', critical: '#e74c3c' },
};

export const Sidebar = styled(Box)(({ theme }) => ({
  width: 280,
  background: `linear-gradient(180deg, ${platinumTheme.primary.main} 0%, ${platinumTheme.primary.dark} 100%)`,
  color: platinumTheme.text.light,
  position: 'fixed',
  height: '100vh',
  overflowY: 'auto',
  boxShadow: `5px 0 25px ${alpha(platinumTheme.primary.main, 0.3)}`,
  zIndex: 1200,
  transition: 'all 0.3s ease',
  '&::-webkit-scrollbar': { width: '8px' },
  '&::-webkit-scrollbar-track': { background: alpha(platinumTheme.text.light, 0.1) },
  '&::-webkit-scrollbar-thumb': { background: platinumTheme.secondary.main, borderRadius: '4px' },
}));

export const AdminAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: '0 auto 15px',
  background: `linear-gradient(135deg, ${platinumTheme.secondary.main}, ${platinumTheme.accent.blue})`,
  border: `4px solid ${alpha(platinumTheme.text.light, 0.3)}`,
  boxShadow: `0 10px 25px ${alpha(platinumTheme.secondary.main, 0.3)}`,
  fontSize: '2rem',
  fontWeight: 700,
  color: platinumTheme.primary.main,
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'scale(1.05)', boxShadow: `0 15px 35px ${alpha(platinumTheme.secondary.main, 0.4)}` },
}));

export const PremiumHeader = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${platinumTheme.primary.main} 0%, ${platinumTheme.primary.light} 100%)`,
  color: platinumTheme.text.light,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: 24,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: `0 15px 35px ${alpha(platinumTheme.primary.main, 0.2)}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${alpha(platinumTheme.secondary.main, 0.15)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    background: `radial-gradient(circle, ${alpha(platinumTheme.secondary.light, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
  },
}));

export const StatCard = styled(Card)(({ theme, color }) => ({
  background: platinumTheme.background.paper,
  borderRadius: 16,
  border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
  borderLeft: `5px solid ${color || platinumTheme.accent.blue}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 20px 40px ${alpha(platinumTheme.primary.main, 0.15)}` },
}));

export const PremiumCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  transition: 'all 0.3 ease',
  border: `1px solid ${alpha(platinumTheme.primary.main, 0.08)}`,
  boxShadow: `0 4px 20 px ${alpha(platinumTheme.primary.main, 0.05)}`,
  overflow: 'hidden',
  '&:hover': {
    boxShadow: `0 8px 30px ${alpha(platinumTheme.primary.main, 0.12)}`,
    borderColor: alpha(platinumTheme.secondary.main, 0.3),
  }
}));

export const PlatinumButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${platinumTheme.primary.main}, ${platinumTheme.primary.light})`,
  color: platinumTheme.text.light,
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: 50,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: `0 5px 15px ${alpha(platinumTheme.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 25px ${alpha(platinumTheme.primary.main, 0.4)}`, background: `linear-gradient(45deg, ${platinumTheme.primary.light}, ${platinumTheme.primary.main})` },
}));

export const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(platinumTheme.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
  boxShadow: `0 10px 30px ${alpha(platinumTheme.primary.main, 0.1)}`,
}));

export const StatusChip = styled(Chip)(({ theme, status }) => {
  const colors = {
    online: { bg: alpha(platinumTheme.status.online, 0.1), color: platinumTheme.status.online },
    warning: { bg: alpha(platinumTheme.status.warning, 0.1), color: platinumTheme.status.warning },
    critical: { bg: alpha(platinumTheme.status.critical, 0.1), color: platinumTheme.status.critical },
    success: { bg: alpha(platinumTheme.status.success, 0.1), color: platinumTheme.status.success },
    info: { bg: alpha(platinumTheme.status.info, 0.1), color: platinumTheme.status.info },
  };
  const color = colors[status] || colors.info;
  return {
    background: color.bg,
    color: color.color,
    border: `1px solid ${color.color}`,
    fontWeight: 600,
    '& .MuiChip-icon': { color: color.color },
  };
});

export const ActivityIcon = styled(Box)(({ theme, type }) => {
  const colors = {
    patient: { bg: alpha(platinumTheme.accent.green, 0.1), color: platinumTheme.accent.green },
    doctor: { bg: alpha(platinumTheme.accent.teal, 0.1), color: platinumTheme.accent.teal },
    appointment: { bg: alpha(platinumTheme.accent.orange, 0.1), color: platinumTheme.accent.orange },
    system: { bg: alpha(platinumTheme.accent.blue, 0.1), color: platinumTheme.accent.blue },
  };
  const color = colors[type] || colors.system;
  return {
    width: 45,
    height: 45,
    borderRadius: 10,
    background: color.bg,
    color: color.color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
  };
});

export const GlassSearchBar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5),
  display: 'flex',
  alignItems: 'center',
  borderRadius: 60,
  background: alpha(platinumTheme.background.paper, 0.95),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
  boxShadow: `0 8px 32px ${alpha(platinumTheme.primary.main, 0.08)}`,
  transition: 'all 0.3s ease',
  '&:focus-within': {
    boxShadow: `0 12px 40px ${alpha(platinumTheme.primary.main, 0.15)}`,
    borderColor: platinumTheme.secondary.main,
    transform: 'translateY(-2px)',
  },
}));

export const PremiumTableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: `0 4px 20px ${alpha(platinumTheme.primary.main, 0.05)}`,
  border: `1px solid ${alpha(platinumTheme.primary.main, 0.08)}`,
}));

export const PremiumTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(platinumTheme.accent.blue, 0.04),
    transform: 'scale(1.01)',
  },
}));

export const ActionIconButton = styled(IconButton)(({ theme, action }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    ...(action === 'view' && { backgroundColor: alpha(platinumTheme.accent.blue, 0.1), color: platinumTheme.accent.blue }),
    ...(action === 'edit' && { backgroundColor: alpha(platinumTheme.accent.orange, 0.1), color: platinumTheme.accent.orange }),
    ...(action === 'delete' && { backgroundColor: alpha(platinumTheme.accent.red, 0.1), color: platinumTheme.accent.red }),
  },
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(3),
  position: 'relative',
  display: 'inline-block',
  color: platinumTheme.text.primary,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 50,
    height: 4,
    background: `linear-gradient(90deg, ${platinumTheme.secondary.main}, ${platinumTheme.accent.blue})`,
    borderRadius: 2,
  },
}));

export const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  marginBottom: theme.spacing(1),
  background: `linear-gradient(135deg, ${platinumTheme.primary.main}, ${platinumTheme.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

export const RoleBadge = styled(Chip)(({ theme, role }) => {
  const config = {
    admin: { bg: alpha(platinumTheme.accent.purple, 0.1), color: platinumTheme.accent.purple, icon: '👑' },
    doctor: { bg: alpha(platinumTheme.accent.green, 0.1), color: platinumTheme.accent.green, icon: '👨‍⚕️' },
    lab_technician: { bg: alpha(platinumTheme.accent.orange, 0.1), color: platinumTheme.accent.orange, icon: '🔬' },
    patient: { bg: alpha(platinumTheme.accent.blue, 0.1), color: platinumTheme.accent.blue, icon: '👤' },
  };
  const c = config[role] || config.patient;
  return {
    backgroundColor: c.bg,
    color: c.color,
    fontWeight: 600,
    borderRadius: 20,
    '& .MuiChip-label': { display: 'flex', alignItems: 'center', gap: 4 },
    '& .MuiChip-label::before': { content: `"${c.icon}"`, marginRight: 4 },
  };
});

export const AuthLayout = () => {
  return (
    <div className='auth-layout'>
      <div className='auth-content'>
        <Outlet />
      </div>
    </div>
  );
}

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getLinksForRole = (role) => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard' },
          { name: 'Users', path: '/admin/users' },
          { name: 'Approvals', path: '/admin/approvals' },
          { name: 'Reports', path: '/admin/reports/generate' },
          { name: 'Audit Logs', path: '/admin/audit-logs' },
          { name: 'Settings', path: '/admin/settings' },
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', path: '/doctor/dashboard' },
          { name: 'Appointments', path: '/doctor/appointments' },
          { name: 'Prescriptions', path: '/doctor/prescriptions' },
          { name: 'Profile', path: '/doctor/profile' },
        ];
      case 'lab_technician':
        return [
          { name: 'Dashboard', path: '/lab/dashboard' },
          { name: 'Requests', path: '/lab/requests' },
          { name: 'Profile', path: '/lab/profile' },
        ];
      case 'patient':
        return [
          { name: 'Dashboard', path: '/patient/dashboard' },
          { name: 'Appointments', path: '/patient/appointments' },
          { name: 'Records', path: '/patient/records' },
          { name: 'Bills', path: '/patient/bills' },
          { name: 'Profile', path: '/patient/profile' },
        ];
      case 'operator':
        return [
          { name: 'Dashboard', path: '/operator/dashboard' },
          { name: 'Bills', path: '/operator/bills' },
          { name: 'Transactions', path: '/operator/transactions' },
          { name: 'Patients', path: '/operator/patients' },
        ];
      default:
        return [{ name: 'Home', path: '/home' }];
    }
  };

  const links = getLinksForRole(user?.role);

  return (
    <div className="app-layout" style={{ display: 'flex' }}>
      <Sidebar>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <AdminAvatar>
            {user?.first_name?.[0] || 'U'}
          </AdminAvatar>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <RoleBadge role={user?.role} label={user?.role?.replace('_', ' ')} size="small" sx={{ mt: 1 }} />
        </Box>
        <Box sx={{ mt: 2 }}>
          {links.map((link) => (
            <Button
              key={link.name}
              fullWidth
              onClick={() => navigate(link.path)}
              sx={{
                color: '#fff',
                justifyContent: 'flex-start',
                px: 4,
                py: 1.5,
                textTransform: 'none',
                '&:hover': { background: 'rgba(255,255,255,0.1)' }
              }}
            >
              {link.name}
            </Button>
          ))}
          <Button
            fullWidth
            onClick={logout}
            sx={{
              color: '#e74c3c',
              justifyContent: 'flex-start',
              px: 4,
              py: 1.5,
              mt: 2,
              textTransform: 'none',
              '&:hover': { background: 'rgba(231,76,60,0.1)' }
            }}
          >
            Logout
          </Button>
        </Box>
      </Sidebar>

      <main className="content" style={{ flexGrow: 1, paddingLeft: 280 }}>
        <Outlet />
      </main>
    </div>
  );
};