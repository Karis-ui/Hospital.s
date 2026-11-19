import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, TextField, Avatar, Stack, Tooltip,
  Alert, CircularProgress, Grid, CardContent, Typography, LinearProgress,
  styled, Dialog, Paper, Button, Badge,
  DialogTitle, DialogContent, Fade, RadioGroup, Tab, Tabs,
} from '@mui/material';
import {
  Search as SearchIcon, Refresh as RefreshIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon,
  Email as EmailIcon, Phone as PhoneIcon, Close as CloseIcon,
  PersonAdd as PersonAddIcon, Verified as VerifiedIcon,
  Schedule as ScheduleIcon, Celebration as CelebrationIcon,
  Radio, Description as ResumeIcon,
} from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/users/admin';
import {
  platinumTheme, PremiumHeader, PremiumCard, PremiumTableContainer,
  GlassSearchBar, SectionTitle, StatCard, GlassCard, RoleBadge,
  PlatinumButton,
} from '../../../theme/GenLayout';
import { format, formatDistanceToNow } from 'date-fns';

const AnimatedStatCard = motion(StatCard);
const AnimatedTableFlow = motion.tr;

const ReviewDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    background: `linear-gradient(135deg, ${platinumTheme.background.paper}, ${alpha(platinumTheme.primary.main, 0.02)})`,
    backdropFilter: 'blur(10px)',
    boxShadow: `0 25px 50px -12px ${alpha(platinumTheme.primary.main, 0.4)}`,
  },
}));

const DecisionCard = styled(Paper)(({ theme, isSelected }) => ({
  padding: theme.spacing(2.5), borderRadius: 20, cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `2px solid ${isSelected ? platinumTheme.accent.green : alpha(platinumTheme.primary.main, 0.1)}`,
  background: isSelected ? alpha(platinumTheme.accent.green, 0.05) : 'transparent',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 35px -12px ${alpha(platinumTheme.primary.main, 0.2)}`,
    borderColor: platinumTheme.accent.green,
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center', padding: theme.spacing(8),
  background: `linear-gradient(135deg, ${alpha(platinumTheme.primary.main, 0.02)}, ${alpha(platinumTheme.secondary.main, 0.02)})`,
  borderRadius: 32,
}));

const flattenApprovals = (data) => {
  if (!data) return [];
  const flat = [
    ...(data.doctors || []),
    ...(data.lab_technicians || []),
    ...(data.operators || []),
    ...(data.admins || []),
  ];
  return flat;
};

export const SetApproval = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, doctors: 0, labs: 0, operators: 0, admins: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [action, setAction] = useState('approve');
  const [rejectReason, setRejectReason] = useState('');
  const [openReviewDialog, setOpenreviewDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchApprovals(); }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await adminService.pendingApprovals();
      if (response.data.status === 'success') {
        const raw = response.data.data;
        const flat = flattenApprovals(raw);
        setApprovals(flat);
        filterApprovals(flat, searchTerm, activeTab);
        setStats({
          total: flat.length,
          doctors: raw.doctors?.length || 0,
          labs: raw.lab_technicians?.length || 0,
          operators: raw.operators?.length || 0,
          admins: raw.admins?.length || 0,
        });
      }
    } catch (err) {
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const filterApprovals = (list, term, tab) => {
    let filtered = list;
    if (tab !== 'all') {
      filtered = filtered.filter(a => a.type === tab);
    }
    if (term) {
      filtered = filtered.filter(a =>
        a.full_name?.toLowerCase().includes(term.toLowerCase()) ||
        a.email?.toLowerCase().includes(term.toLowerCase()) ||
        a.type?.toLowerCase().includes(term.toLowerCase())
      );
    }
    setFilteredApprovals(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterApprovals(approvals, e.target.value, activeTab);
  };

  const handleTabChange = (e, value) => {
    setActiveTab(value);
    filterApprovals(approvals, searchTerm, value);
  };

  const handleOpenReview = (approval) => {
    setSelectedApproval(approval);
    setRejectReason('');
    setAction('approve');
    setOpenreviewDialog(true);
  };

  const handleSubmitDecision = async () => {
    if (action === 'reject' && !rejectReason.trim()) {
      toast.warning('Please provide a valid reason for rejection');
      return;
    }

    setSubmitting(true);
    try {
      // Uses user_id, not the profile record's id
      await adminService.setApproval(selectedApproval.user_id, action, rejectReason);
      toast.success(`User ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setOpenreviewDialog(false);
      fetchApprovals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process approval');
    } finally {
      setSubmitting(false);
    }
  };

  const statsCard = [
    { label: 'Total Pending', value: stats.total, icon: <PersonAddIcon />, color: platinumTheme.primary.main },
    { label: 'Doctors', value: stats.doctors, icon: <PersonAddIcon />, color: '#3498db' },
    { label: 'Lab Technicians', value: stats.labs, icon: <PersonAddIcon />, color: '#9b59b6' },
    { label: 'Operators', value: stats.operators, icon: <PersonAddIcon />, color: '#e67e22' },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
      <PremiumHeader>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <PersonAddIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Pending Approvals</Typography>
            <Chip
              label={`${stats.total} pending`}
              sx={{ bgcolor: alpha(platinumTheme.accent.orange, 0.2), color: platinumTheme.accent.orange, fontWeight: 600 }}
            />
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Review and approve new staff registrations before they can log in.
          </Typography>
        </motion.div>
      </PremiumHeader>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCard.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <AnimatedStatCard
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: platinumTheme.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '2.5rem', color: stat.color }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(stat.color, 0.15), width: 56, height: 56, color: stat.color }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </AnimatedStatCard>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': { bgcolor: platinumTheme.secondary.main, height: 3 },
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, py: 2 },
          }}
        >
          <Tab label={`All (${stats.total})`} value="all" />
          <Tab label={`Doctors (${stats.doctors})`} value="doctor" />
          <Tab label={`Lab Techs (${stats.labs})`} value="lab_technician" />
          <Tab label={`Operators (${stats.operators})`} value="operator" />
          <Tab label={`Admins (${stats.admins})`} value="admin" />
        </Tabs>
      </Paper>

      <GlassSearchBar sx={{ mb: 3 }}>
        <SearchIcon sx={{ color: platinumTheme.text.secondary, mr: 1.5 }} />
        <TextField
          placeholder="Search by name, email, or role..."
          variant="standard"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{ disableUnderline: true }}
        />
        {searchTerm && (
          <IconButton size="small" onClick={() => { setSearchTerm(''); filterApprovals(approvals, '', activeTab); }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        <Tooltip title="Refresh">
          <IconButton onClick={fetchApprovals}><RefreshIcon /></IconButton>
        </Tooltip>
      </GlassSearchBar>

      <PremiumTableContainer>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(platinumTheme.primary.main, 0.04) }}>
                <TableCell><strong>Applicant</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>License #</strong></TableCell>
                <TableCell><strong>Contact</strong></TableCell>
                <TableCell><strong>Registered</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {filteredApprovals.length > 0 ? (
                  filteredApprovals.map((approval, idx) => (
                    <AnimatedTableFlow
                      key={`${approval.type}-${approval.id}`}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      hover
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: alpha(platinumTheme.primary.main, 0.1), width: 48, height: 48 }}>
                            <Typography variant="h6">{approval.full_name?.charAt(0)}</Typography>
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              {approval.full_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>
                              {approval.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={approval.type} label={approval.type?.replace('_', ' ')} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {approval.license_number || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, color: platinumTheme.text.secondary }} />
                            <Typography variant="caption">{approval.email}</Typography>
                          </Box>
                          {approval.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 14, color: platinumTheme.text.secondary }} />
                              <Typography variant="caption">{approval.phone}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(approval.registered_at), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>
                          {formatDistanceToNow(new Date(approval.registered_at), { addSuffix: true })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleOpenReview(approval)}
                          sx={{
                            borderRadius: 3, textTransform: 'none', fontWeight: 600,
                            background: `linear-gradient(135deg, ${platinumTheme.primary.main}, ${platinumTheme.secondary.main})`,
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 20px ${alpha(platinumTheme.primary.main, 0.4)}` },
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </AnimatedTableFlow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <EmptyState>
                        <CelebrationIcon sx={{ fontSize: 64, color: platinumTheme.accent.green, mb: 2, opacity: 0.7 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>All Caught Up! 🎉</Typography>
                        <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>
                          No pending approvals in this category.
                        </Typography>
                      </EmptyState>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
      </PremiumTableContainer>

      <ReviewDialog open={openReviewDialog} onClose={() => setOpenreviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonAddIcon sx={{ color: platinumTheme.secondary.main }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Review Registration</Typography>
              </Box>
              <IconButton onClick={() => setOpenreviewDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedApproval && (
            <Fade in timeout={300}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <PremiumCard>
                    <CardContent sx={{ p: 3 }}>
                      <SectionTitle variant="h6">Applicant Information</SectionTitle>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                        <Avatar sx={{ width: 80, height: 80, background: `linear-gradient(135deg, ${platinumTheme.primary.main}, ${platinumTheme.secondary.main})` }}>
                          <Typography variant="h3">{selectedApproval.full_name?.charAt(0)}</Typography>
                        </Avatar>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>{selectedApproval.full_name}</Typography>
                          <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>{selectedApproval.email}</Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Role</Typography>
                          <RoleBadge role={selectedApproval.type} label={selectedApproval.type?.replace('_', ' ')} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>License Number</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                            {selectedApproval.license_number || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Phone</Typography>
                          <Typography variant="body1">{selectedApproval.phone || 'Not provided'}</Typography>
                        </Grid>
                        {selectedApproval.specialization && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Specialization</Typography>
                            <Typography variant="body1">{selectedApproval.specialization}</Typography>
                          </Grid>
                        )}
                        {selectedApproval.department && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Department</Typography>
                            <Typography variant="body1">{selectedApproval.department}</Typography>
                          </Grid>
                        )}
                        <Grid item xs={12}>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Registered</Typography>
                          <Typography variant="body1">
                            {format(new Date(selectedApproval.registered_at), 'MMMM dd, yyyy hh:mm a')}
                          </Typography>
                        </Grid>
                        {selectedApproval.resume_url && (
                          <Grid item xs={12}>
                            <Button
                              startIcon={<ResumeIcon />}
                              href={selectedApproval.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              variant="outlined"
                              sx={{ textTransform: 'none', borderRadius: 2 }}
                            >
                              View CV / Resume
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </PremiumCard>
                </Grid>

                <Grid item xs={12} md={5}>
                  <GlassCard>
                    <CardContent sx={{ p: 3 }}>
                      <SectionTitle variant="h6">Make Decision</SectionTitle>

                      <RadioGroup value={action} onChange={(e) => setAction(e.target.value)} sx={{ mb: 3 }}>
                        <DecisionCard isSelected={action === 'approve'} onClick={() => setAction('approve')} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ApproveIcon sx={{ color: platinumTheme.accent.green, fontSize: 32 }} />
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Approve</Typography>
                              <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>User can log in immediately</Typography>
                            </Box>
                            <Radio checked={action === 'approve'} value="approve" sx={{ ml: 'auto' }} />
                          </Box>
                        </DecisionCard>

                        <DecisionCard isSelected={action === 'reject'} onClick={() => setAction('reject')}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <RejectIcon sx={{ color: platinumTheme.accent.red, fontSize: 32 }} />
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Reject</Typography>
                              <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Provide a reason</Typography>
                            </Box>
                            <Radio checked={action === 'reject'} value="reject" sx={{ ml: 'auto' }} />
                          </Box>
                        </DecisionCard>
                      </RadioGroup>

                      {action === 'reject' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <TextField
                            fullWidth multiline rows={3}
                            label="Rejection Reason"
                            placeholder="Explain why this registration is being rejected..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            required
                            sx={{ mt: 1 }}
                          />
                        </motion.div>
                      )}

                      <PlatinumButton
                        fullWidth
                        startIcon={submitting ? <CircularProgress size={20} /> : (action === 'approve' ? <ApproveIcon /> : <RejectIcon />)}
                        onClick={handleSubmitDecision}
                        disabled={submitting}
                        sx={{
                          mt: 3, py: 1.5,
                          background: action === 'approve'
                            ? `linear-gradient(135deg, ${platinumTheme.accent.green}, ${platinumTheme.accent.green}cc)`
                            : `linear-gradient(135deg, ${platinumTheme.accent.red}, ${platinumTheme.accent.red}cc)`,
                        }}
                      >
                        {submitting ? 'Processing...' : action === 'approve' ? 'Approve User' : 'Reject User'}
                      </PlatinumButton>

                      <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                        <Typography variant="caption">
                          The user will be notified by email. They can log in once approved.
                        </Typography>
                      </Alert>
                    </CardContent>
                  </GlassCard>
                </Grid>
              </Grid>
            </Fade>
          )}
        </DialogContent>
      </ReviewDialog>
    </Box>
  );
};

export default SetApproval;