import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Tooltip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  alpha,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  PersonAdd as AddIcon,
  FilterList as FilterIcon,
  AdminPanelSettings as AdminIcon,
  MedicalServices as DoctorIcon,
  Science as LabIcon,
  Person as PatientIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  VisibilitySharp as VisbilityIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
  platinumTheme, PremiumHeader, StatCard, PremiumCard, PremiumTableContainer,
  StatusChip, RoleBadge, GlassSearchBar, SectionTitle, PageTitle, ActionIconButton, PlatinumButton
} from '../../../theme/GenLayout';
import { useConfirm } from '../../../theme/useConfirm';
import { adminService } from '../../../services/users/admin';
import { AnimatePresence } from 'framer-motion';

export const UserList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [filterUsers, setFilterUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0, admin: 0, doctor: 0, lab_technician: 0, staff: 0, patient: 0, active: 0, inactive: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUser();
  }, [users, searchTerm, roleFilter, statusFilter, tabValue]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getallUsers();
      if (response.data.status === 'success') {
        setUsers(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersList) => {
    const total = usersList.length;
    const admin = usersList.filter(u => u.role === 'admin').length;
    const doctor = usersList.filter(u => u.role === 'doctor').length;
    const lab_technician = usersList.filter(u => u.role === 'lab_technician').length;
    const patient = usersList.filter(u => u.role === 'patient').length;
    const staff = usersList.filter(u => u.role === 'staff').length;
    const active = usersList.filter(u => u.is_active).length;
    const inactive = usersList.filter(u => !u.is_active).length;
    setStats({ total, admin, doctor, lab_technician, staff, patient, active, inactive })
  };

  const filterUser = () => {
    let filtered = [...users];
    if (tabValue === 1) filtered = filtered.filter(u => u.role === 'admin');
    if (tabValue === 2) filtered = filtered.filter(u => u.role === 'doctor');
    if (tabValue === 3) filtered = filtered.filter(u => u.role === 'lab_technician');
    if (tabValue === 4) filtered = filtered.filter(u => u.role === 'patient');
    if (tabValue === 5) filtered = filtered.filter(u => u.role === 'staff');

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => statusFilter === 'active' ? u.is_active : !u.is_active);
    }
    setFilterUsers(filtered);
  };
  const handleDeleteUser = async () => {
    const confirmed = await confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete user ${selectedUser.full_name}? This action cannot be undone.`,
      type: 'warning',
      confirmText: 'Delete',
      confirmColor: 'error',
    });
    if (!confirmed) return;
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser.id);
      toast.success('User deleted sucessfully.');
      setOpenDeleteDialog(false);
      fetchUsers();
    } catch (err) {
      toast.error('An error occurred!');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminService.deactivateUser(user.id)
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to updated status.Try again');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon fontSize='small' />;
      case 'doctor': return <DoctorIcon fontSize='small' />;
      case 'lab_technician': return <LabIcon fontSize='small' />;
      default: return <PatientIcon fontSize='small' />;
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
      <PremiumHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            👥 User Management
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Manage system users, roles, and permissions with ease
          </Typography>
        </motion.div>
      </PremiumHeader>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Users', value: stats.total, color: platinumTheme.primary.main, icon: '👥', delay: 0 },
          { label: 'Admins', value: stats.admin, color: platinumTheme.accent.purple, icon: '👑', delay: 0.1 },
          { label: 'Doctors', value: stats.doctor, color: platinumTheme.accent.green, icon: '👨‍⚕️', delay: 0.2 },
          { label: 'Lab Techs', value: stats.lab_technician, color: platinumTheme.accent.orange, icon: '🔬', delay: 0.3 },
          { label: 'Patients', value: stats.patient, color: platinumTheme.accent.blue, icon: '👤', delay: 0.4 },
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={2.4} key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay, duration: 0.5 }}
            >
              <StatCard color={stat.color}>
                <Box sx={{ p: 2.5, textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ fontSize: 36, mb: 1 }}>{stat.icon}</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
                  <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>{stat.label}</Typography>
                </Box>
              </StatCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <PremiumCard sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ px: 2, pt: 1 }}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ sx: { backgroundColor: platinumTheme.secondary.main } }}
        >
          <Tab label={<Badge badgeContent={stats.total} sx={{ '& .MuiBadge-badge': { bgcolor: platinumTheme.primary.main } }}>All Users</Badge>} />
          <Tab label={<Badge badgeContent={stats.admin} sx={{ '& .MuiBadge-badge': { bgcolor: platinumTheme.accent.purple } }}>Admins</Badge>} />
          <Tab label={<Badge badgeContent={stats.doctor} sx={{ '& .MuiBadge-badge': { bgcolor: platinumTheme.accent.green } }}>Doctors</Badge>} />
          <Tab label={<Badge badgeContent={stats.lab_technician} sx={{ '& .MuiBadge-badge': { bgcolor: platinumTheme.accent.orange } }}>Lab Techs</Badge>} />
          <Tab label={<Badge badgeContent={stats.patient} sx={{ '& .MuiBadge-badge': { bgcolor: platinumTheme.accent.blue } }}>Patients</Badge>} />
        </Tabs>
      </PremiumCard>

      <GlassSearchBar sx={{ mb: 3 }}>
        <SearchIcon sx={{ color: platinumTheme.text.secondary, mr: 1.5 }} />
        <TextField
          placeholder="Search by name, email, or username..."
          variant="standard"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ disableUnderline: true }}
        />
        <IconButton onClick={fetchUsers} sx={{ ml: 1 }}>
          <RefreshIcon />
        </IconButton>
      </GlassSearchBar>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ color: platinumTheme.text.secondary }}>Role</InputLabel>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} label="Role">
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="lab_technician">Lab Technician</MenuItem>
              <MenuItem value="patient">Patient</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <PlatinumButton startIcon={<AddIcon />} onClick={() => navigate('/admin/approvals')}>
              Set Approval For New User
            </PlatinumButton>
          </Stack>
        </Grid>
      </Grid>

      <PremiumTableContainer>
        {loading && <LinearProgress sx={{ '& .MuiLinearProgress-bar': { bgcolor: platinumTheme.secondary.main } }} />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(platinumTheme.primary.main, 0.04) }}>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Contact</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Last Login</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {filterUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${platinumTheme.primary.main}, ${platinumTheme.secondary.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="body1">{user.full_name?.charAt(0)}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: platinumTheme.text.primary }}>{user.full_name}</Typography>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>@{user.username}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><RoleBadge role={user.role} label={user.role?.replace('_', ' ')} size="small" /></TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14, color: platinumTheme.text.secondary }} />
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>{user.email}</Typography>
                        </Box>
                        {user.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: platinumTheme.text.secondary }} />
                            <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>{user.phone}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell><StatusChip status={user.is_active ? 'active' : 'inactive'} label={user.is_active ? 'Active' : 'Inactive'} size="small" /></TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="View Details">
                          <ActionIconButton action="view" size="small" onClick={() => navigate(`/admin/users/${user.id}`)}>
                            <VisbilityIcon fontSize="small" />
                          </ActionIconButton>
                        </Tooltip>
                        <Tooltip title="Update/edit User">
                          <ActionIconButton action="edit" size="small" onClick={() => navigate(`/admin/users/${user.id}`)}>
                            <EditIcon fontSize="small" />
                          </ActionIconButton>
                        </Tooltip>
                        <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
                          <ActionIconButton size="small" onClick={() => handleToggleStatus(user)}>
                            {user.is_active ? <BlockIcon fontSize="small" sx={{ color: platinumTheme.accent.orange }} /> : <ActiveIcon fontSize="small" sx={{ color: platinumTheme.accent.green }} />}
                          </ActionIconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <ActionIconButton action="delete" size="small" onClick={() => { setSelectedUser(user); setOpenDeleteDialog(true); }}>
                            <DeleteIcon fontSize="small" sx={{ color: platinumTheme.accent.red }} />
                          </ActionIconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filterUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{ borderTop: `1px solid ${alpha(platinumTheme.primary.main, 0.08)}` }}
        />
      </PremiumTableContainer>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: alpha(platinumTheme.accent.red, 0.05), borderBottom: `1px solid ${alpha(platinumTheme.accent.red, 0.1)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon sx={{ color: platinumTheme.accent.red }} />
            <Typography variant="h6" sx={{ color: platinumTheme.text.primary }}>Confirm Delete</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>⚠️ This action cannot be undone.</Alert>
          <Typography sx={{ color: platinumTheme.text.primary }}>Are you sure you want to delete user <strong>{selectedUser?.full_name}</strong>?</Typography>
          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>This will permanently remove all associated data from the system.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(platinumTheme.primary.main, 0.08)}` }}>
          <Button onClick={() => setOpenDeleteDialog(false)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error" startIcon={<DeleteIcon />} sx={{ borderRadius: 2 }}>Delete User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};