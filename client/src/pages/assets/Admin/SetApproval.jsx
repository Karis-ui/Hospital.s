import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, TextField, InputAdornment, Avatar, Stack, Tooltip,
  Alert, CircularProgress, Grid, Card, CardContent, Typography,LinearProgress,
  styled,Dialog,Paper,Button,Badge,
  DialogTitle,
  DialogContent,
  Fade,
  RadioGroup
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Celebration as CelebrationIcon,
  Warning as WarningIcon,
  Radio,
} from '@mui/icons-material';
import { alpha, animate, AnimatePresence, color, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/users/admin';
import {
  platinumTheme, PremiumHeader, PremiumCard, PremiumTableContainer,
  StatusChip, GlassSearchBar, SectionTitle, StatCard,GlassCard,RoleBadge,
  PlatinumButton
} from '../../../theme/adminComponents';
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
  padding: theme.spacing(2.5),
  borderRadius: 20,
  cursor: 'pointer',
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
  textAlign: 'center',
  padding: theme.spacing(8),
  background: `linear-gradient(135deg, ${alpha(platinumTheme.primary.main, 0.02)}, ${alpha(platinumTheme.secondary.main, 0.02)})`,
  borderRadius: 32,
}));

export const SetApproval = ()=>{
    const navigate = useNavigate();
    const [approvals,setApprovals] = useState([]);
    const [selectedApproval,setSelectedApproval] = useState(null);
    const [filteredApprovals,setFilteredApprovals] = useState([]);
    const [loading,setLoading] = useState(true);
    const [searchTerm,setSearchTerm] = useState('');
    const [stats,setStats] = useState({total:0,pending:0,approved:0,rejected:0});
    const [action,setAction] = useState('approve');
    const [rejectReason,setRejectReason] = useState('');
    const [openReviewDialog,setOpenreviewDialog] = useState(false);
    const [submitting,setSubmittiing] = useState(true);

    useEffect(()=>{
        fetchApprovals();
    },[]);

    const fetchApprovals = async()=>{
        setLoading(true);
        try{
            const response = await adminService.pendingApprovals();
            if(response.data.status === 'success'){
                setApprovals(response.data.data);
                filteredApprovals(response.data.data,searchTerm);
                calculateStats(response.data.data);
            }
        }catch(err){
            toast.error('Failed to load approvals');
        }finally{
            setLoading(false);
        }
    };

    const calculateStats = (list) =>{
        setStats({
            total: list.length,
            pending: list.filter(a => a.status === 'pending').length,
            approved: list.filter(a => a.status === 'approved').length,
            rejected: list.filter(a => a.status === 'rejected').length
        });
    };

    const filterApprovals = (list,term)=>{
        if(!term) setFilteredApprovals(list);
        else setFilteredApprovals(list.filter(a => 
            a.full_name?.toLowerCase().includes(term.toLowerCase()) ||
            a.email?.toLowerCase().includes(term.toLowerCase()) ||
            a.role?.toLowerCase().includes(term.toLowerCase())
        ));
    };

    const handleSearch = (e)=>{
        setSearchTerm(e.target.value);
        filterApprovals(approvals,e.target.value);
    };

    const handleOpenReview = (approval)=>{
        setSelectedApproval(approval);
        setRejectReason('');
        setAction('approve');
        setOpenreviewDialog(true);
    };

    const handleSubmitDecision = async()=>{
      if(action == 'reject' && !rejectReason){
        toast.warning('Please provide a valid reason');
        return;
      }
      setSubmittiing(true);
      try{
        const data = action == 'approve'?{staus: 'approve'}:{status:'rejected',reject_reason:rejectReason};
        await adminService.setApproval(selectedApproval.id,data);
        toast.success(`User ${action}d successfully`);
        setOpenreviewDialog(false);
        fetchApprovals();
      }catch(err){
        toast.error('Failed to process approval');
      }finally{
        setLoading(false);
      }
    };

    const statsCard = [
      {label: 'Total Requests',value: stats.total,icon: <PersonAddIcon/>,color: platinumTheme.primary.main,gradient: 'linear-gradient(135deg,#1a2639,#2c3e50)'},
      {label: 'Pending Review',value: stats.pending,icon: <ScheduleIcon/>,color: platinumTheme.accent.orange,gradient: 'linear-gradient(135deg,#f39c12,#e67e22)'},
      {label: 'Approved',value: stats.approved,icon: <VerifiedIcon/>,color: platinumTheme.accent.green,gradient: 'linear-gradient(135deg,#27ae60,#2ecc71)'},
      {label: 'Rejected',value: stats.rejected,icon: <RejectIcon/>,color: platinumTheme.accent.red,gradient: 'linear-gradient(135deg,#e74c3c,#c0392b)'},
    ];

    return (
    <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
      <PremiumHeader>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <PersonAddIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Pending Approvals
            </Typography>
            <Chip
              label={`${stats.pending} pending`}
              sx={{ bgcolor: alpha(platinumTheme.accent.orange, 0.2), color: platinumTheme.accent.orange, fontWeight: 600 }}
            />
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Review and manage new user registration requests
          </Typography>
        </motion.div>
      </PremiumHeader>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCard.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <AnimatedStatCard
              color={stat.color}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: platinumTheme.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={animate && idx === 0 ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '2.5rem', color: stat.color }}>
                        {stat.value}
                      </Typography>
                    </motion.div>
                  </Box>
                  <Avatar sx={{ bgcolor: alpha(stat.color, 0.15), width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
                {stat.label === 'Pending Review' && stat.value > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={(stat.value / stats.total) * 100}
                    sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: alpha(stat.color, 0.2), '& .MuiLinearProgress-bar': { bgcolor: stat.color, borderRadius: 3 } }}
                  />
                )}
              </CardContent>
            </AnimatedStatCard>
          </Grid>
        ))}
      </Grid>

      <GlassSearchBar sx={{ mb: 3 }}>
        <SearchIcon sx={{ color: platinumTheme.text.secondary, mr: 1.5 }} />
        <TextField
          placeholder="Search by name, email, or role..."
          variant="standard"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ disableUnderline: true }}
        />
        {searchTerm && (
          <IconButton size="small" onClick={() => setSearchTerm('')} sx={{ mr: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        <Tooltip title="Refresh">
          <IconButton onClick={fetchApprovals}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </GlassSearchBar>

      <PremiumTableContainer>
        {loading && <LinearProgress sx={{ '& .MuiLinearProgress-bar': { bgcolor: platinumTheme.secondary.main } }} />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(platinumTheme.primary.main, 0.04) }}>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
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
                      key={approval.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      hover
                      sx={{ '&:hover': { bgcolor: alpha(platinumTheme.primary.main, 0.02) } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              <Box sx={{ width: 12, height: 12, bgcolor: platinumTheme.accent.orange, borderRadius: '50%', border: `2px solid white` }} />
                            }
                          >
                            <Avatar sx={{ bgcolor: alpha(platinumTheme.primary.main, 0.1), width: 48, height: 48 }}>
                              <Typography variant="h6">{approval.full_name?.charAt(0)}</Typography>
                            </Avatar>
                          </Badge>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 700 }}>
                              {approval.full_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>
                              @{approval.username}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={approval.role} label={approval.role?.replace('_', ' ')} size="small" />
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
                        <Typography variant="body2">{format(new Date(approval.requested_at), 'MMM dd, yyyy')}</Typography>
                        <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>
                          {formatDistanceToNow(new Date(approval.requested_at), { addSuffix: true })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Review Application">
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<ApproveIcon />}
                              onClick={() => handleOpenReview(approval)}
                              sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${platinumTheme.primary.main}, ${platinumTheme.secondary.main})`,
                                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 20px ${alpha(platinumTheme.primary.main, 0.4)}` },
                              }}
                            >
                              Review Now
                            </Button>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </AnimatedTableFlow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <EmptyState>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                          <CelebrationIcon sx={{ fontSize: 64, color: platinumTheme.accent.green, mb: 2, opacity: 0.7 }} />
                          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>All Caught Up! 🎉</Typography>
                          <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>
                            No pending approvals at the moment. New registrations will appear here.
                          </Typography>
                        </motion.div>
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
              <IconButton onClick={() => setOpenreviewDialog(false)} sx={{ '&:hover': { bgcolor: alpha(platinumTheme.accent.red, 0.1) } }}>
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
                  <PremiumCard sx={{ overflow: 'visible' }}>
                    <CardContent sx={{ p: 3 }}>
                      <SectionTitle variant="h6">Applicant Information</SectionTitle>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                        <motion.div whileHover={{ scale: 1.05 }}>
                          <Avatar
                            sx={{
                              width: 80,
                              height: 80,
                              background: `linear-gradient(135deg, ${platinumTheme.primary.main}, ${platinumTheme.secondary.main})`,
                              boxShadow: `0 10px 25px ${alpha(platinumTheme.primary.main, 0.3)}`,
                            }}
                          >
                            <Typography variant="h3">{selectedApproval.full_name?.charAt(0)}</Typography>
                          </Avatar>
                        </motion.div>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>{selectedApproval.full_name}</Typography>
                          <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>@{selectedApproval.username}</Typography>
                          <Chip
                            label={`Registered ${formatDistanceToNow(new Date(selectedApproval.requested_at), { addSuffix: true })}`}
                            size="small"
                            sx={{ mt: 1, bgcolor: alpha(platinumTheme.accent.orange, 0.1), color: platinumTheme.accent.orange }}
                          />
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Email Address</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApproval.email}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Phone Number</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedApproval.phone || 'Not provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Requested Role</Typography>
                          <RoleBadge role={selectedApproval.role} label={selectedApproval.role?.replace('_', ' ')} sx={{ mt: 0.5 }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Registration Date</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {format(new Date(selectedApproval.requested_at), 'MMMM dd, yyyy hh:mm a')}
                          </Typography>
                        </Grid>
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
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Approve Registration</Typography>
                              <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>User will be notified and can log in</Typography>
                            </Box>
                            <Radio checked={action === 'approve'} value="approve" sx={{ ml: 'auto' }} />
                          </Box>
                        </DecisionCard>

                        <DecisionCard isSelected={action === 'reject'} onClick={() => setAction('reject')}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <RejectIcon sx={{ color: platinumTheme.accent.red, fontSize: 32 }} />
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Reject Registration</Typography>
                              <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Provide a reason for rejection</Typography>
                            </Box>
                            <Radio checked={action === 'reject'} value="reject" sx={{ ml: 'auto' }} />
                          </Box>
                        </DecisionCard>
                      </RadioGroup>

                      {action === 'reject' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Rejection Reason"
                            placeholder="Please explain why this registration is being rejected..."
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
                          mt: 3,
                          py: 1.5,
                          background: action === 'approve'
                            ? `linear-gradient(135deg, ${platinumTheme.accent.green}, ${platinumTheme.accent.green}cc)`
                            : `linear-gradient(135deg, ${platinumTheme.accent.red}, ${platinumTheme.accent.red}cc)`,
                        }}
                      >
                        {submitting ? 'Processing...' : action === 'approve' ? 'Approve User' : 'Reject User'}
                      </PlatinumButton>

                      <Alert
                        severity="info"
                        icon={<VerifiedIcon />}
                        sx={{ mt: 3, borderRadius: 2, bgcolor: alpha(platinumTheme.accent.blue, 0.05) }}
                      >
                        <Typography variant="caption">
                          <strong>Note:</strong> User will receive an email notification. Password is managed by the user via "Forgot Password" for security.
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