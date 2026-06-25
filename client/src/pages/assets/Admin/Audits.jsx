import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, TextField, InputAdornment, Avatar, Stack, Tooltip,
  Alert, CircularProgress, Grid, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, Button, LinearProgress, Pagination,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { alpha } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Verified as VerifiedIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Celebration as CelebrationIcon,
  Warning as WarningIcon, FilterList as FilterIcon,
  Create as CreateIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, Login as LoginIcon, Logout as LogoutIcon,
  Cancel as RejectIcon, Person as PersonIcon,
  Computer as ComputerIcon, DateRange as DateRangeIcon,
  Download as DownloadIcon, Clear as ClearIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { color, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/users/admin';
import { formatDistanceToNow, format } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  platinumTheme, PremiumHeader, PremiumCard, PremiumTableContainer,
  StatusChip, GlassSearchBar, SectionTitle, StatCard, GlassCard, RoleBadge
} from '../../../theme/GenLayout';
import { act } from "react";

const ActionChip = ({ action }) => {
  const config = {
    CREATE: { bg: alpha(platinumTheme.accent.green, 0.1), color: platinumTheme.accent.green, icon: <CreateIcon />, label: 'CREATE' },
    UPDATE: { bg: alpha(platinumTheme.accent.blue, 0.1), color: platinumTheme.accent.blue, icon: <EditIcon />, label: 'UPDATE' },
    DELETE: { bg: alpha(platinumTheme.accent.red, 0.1), color: platinumTheme.accent.red, icon: <DeleteIcon />, label: 'DELETE' },
    VIEW: { bg: alpha(platinumTheme.accent.purple, 0.1), color: platinumTheme.accent.purple, icon: <ViewIcon />, label: 'VIEW' },
    LOGIN: { bg: alpha(platinumTheme.accent.green, 0.1), color: platinumTheme.accent.green, icon: <LoginIcon />, label: 'LOGIN' },
    LOGOUT: { bg: alpha(platinumTheme.accent.orange, 0.1), color: platinumTheme.accent.orange, icon: <LogoutIcon />, label: 'LOGOUT' },
    APPROVE: { bg: alpha(platinumTheme.accent.green, 0.1), color: platinumTheme.accent.green, icon: <ApproveIcon />, label: 'APPROVE' },
    REJECT: { bg: alpha(platinumTheme.accent.red, 0.1), color: platinumTheme.accent.red, icon: <RejectIcon />, label: 'REJECT' },
  };
  const c = config[action] || config.VIEW;
  return <Chip icon={c.icon} label={c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600 }} />;
};

export const Audits = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    this_week: 0,
    this_month: 0,
  });
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, dateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        action: actionFilter,
        start_date: dateRange.start ? dateRange.start.toISOString().split('T')[0] : null,
        end_date: dateRange.end ? dateRange.end.toISOString().split('T')[0] : null,
        search: searchTerm
      };
      const response = await adminService.auditView(params);
      if (response.data.status === "success") {
        setLogs(response.data.data.logs);
        setTotalPages(response.data.pagination.total_pages);
        setTotalCount(response.data.pagination.total_count);
        setStats(response.data.stats);
      }
    } catch (err) {
      setError("Failed to fetch audit logs.");
      toast.error("Failed to fetch audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { label: "Total Audits", value: stats.total, icon: <TrendingUpIcon />, color: platinumTheme.primary.main },
    { label: "Today's Audits", value: stats.today, icon: <ScheduleIcon />, color: platinumTheme.accent.blue },
    { label: "This Week's Audits", value: stats.this_week, icon: <VerifiedIcon />, color: platinumTheme.accent.green },
    { label: "This Month's Audits", value: stats.this_month, icon: <CelebrationIcon />, color: platinumTheme.accent.orange },
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(log =>
        log.user?.toLowerCase().includes(value.toLowerCase()) ||
        log.action?.toLowerCase().includes(value.toLowerCase()) ||
        log.module?.toLowerCase().includes(value.toLowerCase()) ||
        log.description?.toLowerCase().includes(value.toLowerCase()) ||
        log.ip_address?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLogs(filtered);
    }
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setDateRange({ start: null, end: null });
    setPage(0);
    fetchLogs();
  };

  const handleDateRange = (dates) => {
    setDateRange(dates);
    setPage(0);
    fetchLogs();
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setActionFilter('');
    setDateRange({ start: null, end: null });
    setPage(0);
    fetchLogs();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
        <PremiumHeader>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>📜 Audit Logs</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Track system activity and user actions</Typography>
          </motion.div>
        </PremiumHeader>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <StatCard color={stat.color}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>{stat.label}</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), width: 48, height: 48 }}>{stat.icon}</Avatar>
                    </Box>
                  </CardContent>
                </StatCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Action Type</InputLabel>
              <Select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} label="Action Type">
                <MenuItem value="all">All Actions</MenuItem>
                <MenuItem value="CREATE">Create</MenuItem>
                <MenuItem value="UPDATE">Update</MenuItem>
                <MenuItem value="DELETE">Delete</MenuItem>
                <MenuItem value="LOGIN">Login</MenuItem>
                <MenuItem value="LOGOUT">Logout</MenuItem>
                <MenuItem value="APPROVE">Approve</MenuItem>
                <MenuItem value="REJECT">Reject</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Start Date"
              value={dateRange.start}
              onChange={(newVal) => setDateRange({ ...dateRange, start: newVal })}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="End Date"
              value={dateRange.end}
              onChange={(newVal) => setDateRange({ ...dateRange, end: newVal })}
              slotProps={{ textField: { fullWidth: true, size: 'small' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<FilterIcon />} onClick={handleSearch} fullWidth>Apply</Button>
              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters} fullWidth>Clear</Button>
            </Stack>
          </Grid>
        </Grid>

        <PremiumTableContainer>
          {loading && <LinearProgress sx={{ '& .MuiLinearProgress-bar': { bgcolor: platinumTheme.secondary.main } }} />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(platinumTheme.primary.main, 0.04) }}>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                  <TableCell><strong>Module</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>IP Address</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log, idx) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                  >
                    <TableCell>
                      <Tooltip title={format(new Date(log.timestamp), 'MMMM dd, yyyy HH:mm:ss')}>
                        <Typography variant="caption">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: alpha(platinumTheme.primary.main, 0.1), fontSize: '0.7rem' }}>
                          {log.user?.charAt(0) || 'S'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{log.user || 'System'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><ActionChip action={log.action} /></TableCell>
                    <TableCell>
                      <Chip label={log.module} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>{log.ip_address || 'N/A'}</Typography>
                    </TableCell>
                  </motion.tr>
                ))}
                {logs.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <ComputerIcon sx={{ fontSize: 48, color: platinumTheme.text.secondary, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" sx={{ color: platinumTheme.text.secondary }}>No audit logs found</Typography>
                      <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>Try adjusting your filters</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
              <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>
                Showing {logs.length} of {totalCount} entries
              </Typography>
              <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
            </Box>
          )}
        </PremiumTableContainer>
      </Box>
    </LocalizationProvider>
  );
};