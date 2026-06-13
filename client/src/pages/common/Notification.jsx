import React from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Box, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText,
  Avatar, IconButton, Tabs, Tab, Badge, Button, Stack, Chip,
  Divider, Alert, CircularProgress, alpha, Tooltip, Menu, MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  Settings as SettingsIcon,
  MedicalServices as MedicalIcon,
  Assignment as AppointmentIcon,
  Science as LabIcon,
  AttachMoney as BillingIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { coreServices } from '../../../services/users/core';
import { platinumTheme, PremiumHeader, PremiumCard } from '../../../theme/adminComponents';


const getNotificationIcon = (type) => {
    switch(type){
        case 'appointment':return platinumTheme.accent.blue;
        case 'lab':return platinumTheme.accent.orange;
        case 'billing':return platinumTheme.accent.purple;
        case 'medical':return platinumTheme.accent.green;
        default:return platinumTheme.primary.main;
    }
};

const NotificationItem = ({notification,onMarkread,onDelete}) => {
    const [anchorE1,setAnchorE1] = useState(null);
    const isUnRead = !notification.is_read;

    return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <ListItem
        sx={{
          py: 2,
          px: 2,
          bgcolor: isUnread ? alpha(platinumTheme.primary.main, 0.02) : 'transparent',
          borderLeft: isUnread ? `3px solid ${platinumTheme.secondary.main}` : 'none',
          '&:hover': { bgcolor: alpha(platinumTheme.primary.main, 0.04) },
          transition: 'all 0.2s',
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: alpha(getNotificationColor(notification.type), 0.1), color: getNotificationColor(notification.type) }}>
            {getNotificationIcon(notification.type)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: isUnread ? 700 : 500 }}>
                {notification.title}
              </Typography>
              {!isUnread && <Chip label="Read" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />}
              {notification.priority === 'high' && <Chip label="High Priority" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem' }} />}
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" sx={{ color: platinumTheme.text.secondary, mt: 0.5 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" sx={{ color: platinumTheme.text.disabled, display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TimeIcon sx={{ fontSize: 12 }} />
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </Typography>
            </Box>
          }
        />
        <Box>
          {isUnread && (
            <Tooltip title="Mark as read">
              <IconButton size="small" onClick={() => onMarkRead(notification.id)} sx={{ mr: 1 }}>
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </ListItem>
      <Divider />

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { onMarkRead(notification.id); setAnchorEl(null); }}>
          <ListItemIcon><CheckIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Mark as Read</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDelete(notification.id); setAnchorEl(null); }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText sx={{ color: '#c62828' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </motion.div>
  );
};

export const Notifications = () => {
    const navigate = useNavigate();
    const [notifications,setNotifications] = useState([]);
    const [loading,setLoading] = useState(true);
    const [tabValue,setTabValue] = useState(0);
    const [filteredNotifications,setFilteredNotifications] = useState([]);
    const [stats,setStats] = useState({
        total:0,
        unread:0,
        read:0,
    });

    useEffect(()=>{
        fetchNotifications();
    },[]);

    useEffect(()=>{
        filtereNotifications();
    },[notifications,tabValue]);

    const fetchNotifications = async()=>{
        setLoading(true);
        try{
            const response = await coreServices.notifications();
            if(response.status === 'success'){
                setNotifications(response.data.data);
                calculateStats(response.data.data);
            }
        }catch(err){
            setNotifications([]);
            calculateStats([]);
            toast.error('Failed to fetch notifications');
        }finally{
            setLoading(false);
        }
    };

    const calculateStats = (notifications)=>{
        setStats({
            total:notifications.length,
            unread:notifications.filter(n=>!n.is_read).length,
            read:notifications.filter(n=>n.is_read).length,
        });
    };

    const filterNotifications = ()=>{
        let filtered = [...notifications];
        if(tabValue === 1) filtered = filtered.filter(n=>!n.is_read);
        if(tabValue === 2) filtered = filtered.filter(n=>n.is_read);
        setFilteredNotifications(filtered);
    };

    const handleMarkRead = async(id)=>{
        try{
            await coreSservices.markNotification(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            toast.success('Notification marked as read');
        }catch(err){
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllRead = async()=>{
        try{
            await coreServices.markNotifications();
            setNotifications(prev => prev.map(n=>({...n,is_read:true})));
            toast.success('All notifications marked as read');
        }catch(err){
            toast.error('Failed to mark all notifications as read');
        }
    };

    const handleDelete = async(id)=>{
        try{
            await coreServices.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification deleted');
        }catch(err){
            toast.error('Failed to delete notification');
        }
    };

    const handleDeleteAll = async()=>{
        if(window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')){
            try{
                await coreServices.deleteNotifications();
                setNotifications([]);
                toast.success('All notifications deleted');
            }catch(err){
                toast.error('Failed to delete all notifications');
            }
        }
    };

    return (
    <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
      <PremiumHeader>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={stats.unread} color="error">
              <NotificationsIcon sx={{ fontSize: 40 }} />
            </Badge>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>Notifications</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Stay updated with your latest activities</Typography>
            </Box>
          </Box>
        </motion.div>
      </PremiumHeader>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatCard color={platinumTheme.primary.main}>
            <CardContent><Typography variant="caption">Total</Typography><Typography variant="h3">{stats.total}</Typography></CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard color={platinumTheme.accent.orange}>
            <CardContent><Typography variant="caption">Unread</Typography><Typography variant="h3" sx={{ color: platinumTheme.accent.orange }}>{stats.unread}</Typography></CardContent>
          </StatCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard color={platinumTheme.accent.green}>
            <CardContent><Typography variant="caption">Read</Typography><Typography variant="h3" sx={{ color: platinumTheme.accent.green }}>{stats.read}</Typography></CardContent>
          </StatCard>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderBottom: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}` }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label={`All (${stats.total})`} />
            <Tab label={`Unread (${stats.unread})`} />
            <Tab label={`Read (${stats.read})`} />
          </Tabs>
          <Stack direction="row" spacing={1} sx={{ p: 1 }}>
            <Tooltip title="Mark all as read">
              <IconButton onClick={handleMarkAllAsRead} disabled={stats.unread === 0}>
                <DoneAllIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete all">
              <IconButton onClick={handleDeleteAll} disabled={stats.total === 0} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notification Settings">
              <IconButton onClick={() => navigate('/settings')}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        ) : filteredNotifications.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 64, color: platinumTheme.text.disabled, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ color: platinumTheme.text.secondary }}>No notifications</Typography>
            <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>You're all caught up!</Typography>
          </Box>
        ) : (
          <List>
            <AnimatePresence>
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Notifications;