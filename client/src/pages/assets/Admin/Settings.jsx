import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  Switch, FormControlLabel, Divider, Stack, Alert, CircularProgress,
  Tab, Tabs, Paper, Snackbar, alpha,Avatar,Select,MenuItem,Slider,
} from '@mui/material';
import {
  Save as SaveIcon, Security as SecurityIcon, Notifications as NotificationsIcon,
  Email as EmailIcon, Language as LanguageIcon, Payment as PaymentIcon,
  IntegrationInstructions as IntegrationsIcon, Palette as AppearanceIcon,
  Storage as DataIcon, ChevronRight as ChevronRightIcon, Edit as EditIcon,
  CheckCircle as CheckIcon, Warning as WarningIcon, Refresh as RefreshIcon,
  Backup as BackupIcon, Send as SendIcon, Schedule as ScheduleIcon,
  AccessTime as TimeIcon, Lock as LockIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  platinumTheme, PremiumHeader, PremiumCard, PlatinumButton,
  SectionTitle, GlassCard,
} from '../../../theme/adminComponents';
import { adminService } from '../../../services/users/admin';

const TabPanel = ({children,value,index}) =>{
    <div hidden={value !== index} style={{width:'100%'}}>
        {value === index && <Box sx={{pt:3}}>{children}</Box>}
    </div>
};

const SettingRow = ({ label, description, children, danger }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      py: 2.5,
      borderBottom: `1px solid ${alpha(platinumTheme.primary.main, 0.06)}`,
      '&:last-child': { borderBottom: 'none' },
      ...(danger && { bgcolor: alpha(platinumTheme.accent.red, 0.02), mx: -3, px: 3, borderRadius: 2 }),
    }}
  >
    <Box sx={{ flex: 1, pr: 3 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: danger ? platinumTheme.accent.red : 'inherit' }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: platinumTheme.text.secondary }}>{description}</Typography>
    </Box>
    <Box sx={{ minWidth: 260 }}>{children}</Box>
  </Box>
);

const SettingsSection = ({ icon, title, description, children, isLast }) => (
  <Paper
    elevation={0}
    sx={{
      mb: isLast ? 0 : 3,
      borderRadius: 3,
      border: `1px solid ${alpha(platinumTheme.primary.main, 0.1)}`,
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: alpha(platinumTheme.primary.main, 0.2) },
    }}
  >
    <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(platinumTheme.primary.main, 0.08)}`, bgcolor: alpha(platinumTheme.primary.main, 0.02) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: alpha(platinumTheme.secondary.main, 0.1), color: platinumTheme.secondary.main }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{title}</Typography>
          <Typography variant="body2" sx={{ color: platinumTheme.text.secondary }}>{description}</Typography>
        </Box>
      </Box>
    </Box>
    <Box sx={{ p: 3 }}>
      {children}
    </Box>
  </Paper>
);

export const SystemSettings = ()=>{
    const [tabValue,setTabValue] = useState(0);
    const [loading,setLoading] = useState(false);
    const [saving,setSaving] = useState(false);
    const [activeTab,setActiveTab] = useState(null);
    const [testEmail,setTestEmail] = useState('');
    const [savingCategory,setSavingCategory] = useState(null);
    const [settings,setSettings] = useState({});
    const [snackbar,setSnackbar] = useState({open:false,message:'',severity:'success'});
    
    useEffect(()=>{
      fetchSettings();
    },[]);

    const fetchSettings = async()=>{
      setLoading(true);
      try{
        const res = await adminService.getSettings();
        if(res.data.status === 'suucess'){
          setSettings(res.data.data);
        }
      }catch(err){
        console.error('Error fetching settings.Try again!');
        toast.error('Error fetching settings.Try again!');
      }finally{setLoading(false);}
    };

    const handleSettingChange = (field,value)=>{
      setSettings(prev => ({...prev,[field]: value}));
    };

    const handleSaveSettings = async(category)=>{
      try{
        setSavingCategory(category);
        setSaving(true);
        await adminService.updatetSettings(settings);
        toast.success(`Settings saved successfully.`);
        setSaving(false);
        setSnackbar({open:true,message:`${category} settings saved`,severity:'success'});
      }catch(err){
        toast.error('Failed to save settings.Try again!');
      }finally{
        setSaving(false);
        setSavingCategory(null);
      }
    };
    const handleTestEmail = async()=>{
      try{
        await adminService.testEmail({test_email:testEmail});
        toast.success(`Test email sent to ${testEmail}`);
      }catch(err){
        toast.error('Failed to send test email');
      }
    };

    const tabs = [
        {label:'General',icon:<LanguageIcon/>},
        {label:'Security',icon:<SecurityIcon/>},
        {label:'Notifications',icon:<NotificationsIcon/>},
        {label:'Appointments',icon:<ScheduleIcon/>},
        {label: 'Appearance',icon: <AppearanceIcon/>},
        {label: 'Billing',icon: <PaymentIcon/>},
        {label:'Email',icon:<EmailIcon/>},
        {label: 'Data',icon:<DataIcon/>},
    ];

    if(loading){
      return(
        <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'60vh'}}><CircularProgress sx={{color:platinumTheme.secondary.main}}/></Box>
      );
    }
    
    return (
    <Box sx={{ p: 3, bgcolor: platinumTheme.background.default, minHeight: '100vh' }}>
      <PremiumHeader>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>⚙️ Settings</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>Configure your hospital management system</Typography>
        </motion.div>
      </PremiumHeader>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <GlassCard sx={{ position: 'sticky', top: 24, overflow: 'hidden', p: 1 }}>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              sx={{
                '& .MuiTab-root': {
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 1.5,
                  px: 2,
                  minHeight: 'auto',
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: alpha(platinumTheme.secondary.main, 0.1),
                    color: platinumTheme.secondary.main,
                    fontWeight: 600,
                  },
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              {tabs.map((tab, idx) => (
                <Tab
                  key={idx}
                  icon={tab.icon}
                  label={tab.label}
                  iconPosition="start"
                  sx={{ justifyContent: 'flex-start' }}
                />
              ))}
            </Tabs>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={9}>
          <TabPanel value={activeTab} index={0}>
            <SettingsSection
              icon={<LanguageIcon />}
              title="General Settings"
              description="Basic hospital information and system preferences"
            >
              <SettingRow label="Site Name" description="Hospital name displayed throughout the system">
                <TextField
                  fullWidth
                  size="small"
                  value={settings.site_name || 'SmartCare Hospital'}
                  onChange={(e) => handleSettingChange('site_name', e.target.value)}
                />
              </SettingRow>
              <SettingRow label="Timezone" description="Default timezone for all dates and times">
                <Select
                  fullWidth
                  size="small"
                  value={settings.timezone || 'UTC'}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                >
                  <MenuItem value="Africa/Nairobi">Africa/Nairobi (EAT)</MenuItem>
                  <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                  <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                  <MenuItem value="Asia/Dubai">Asia/Dubai (GST)</MenuItem>
                  <MenuItem value="UTC">UTC</MenuItem>
                </Select>
              </SettingRow>
              <SettingRow label="Theme" description="Default color scheme for the system">
                <Select
                  fullWidth
                  size="small"
                  value={settings.theme || 'hospital'}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="hospital">Hospital Blue</MenuItem>
                </Select>
              </SettingRow>
              <SettingRow label="Primary Color" description="Brand color for the system">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: settings.primary_color || '#0d6efd',
                      border: `1px solid ${alpha(platinumTheme.primary.main, 0.2)}`,
                      cursor: 'pointer',
                    }}
                  />
                  <TextField
                    size="small"
                    value={settings.primary_color || '#0d6efd'}
                    onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </SettingRow>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <PlatinumButton
                  startIcon={savingCategory === 'general' && saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={() => handleSaveSettings('general')}
                  disabled={saving}
                >
                  Save Changes
                </PlatinumButton>
              </Box>
            </SettingsSection>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <SettingsSection
              icon={<SecurityIcon />}
              title="Security & Authentication"
              description="Control how users access the system"
            >
              <SettingRow label="Login Identifier" description="What users use to log in">
                <Select
                  fullWidth
                  size="small"
                  value={settings.login_identifier || 'email'}
                  onChange={(e) => handleSettingChange('login_identifier', e.target.value)}
                >
                  <MenuItem value="email">Email Address</MenuItem>
                  <MenuItem value="phone">Phone Number</MenuItem>
                </Select>
              </SettingRow>
              <SettingRow label="Session Timeout" description="Auto-logout after inactivity (minutes)">
                <Slider
                  value={settings.session_timer || 30}
                  onChange={(e, val) => handleSettingChange('session_timer', val)}
                  min={5}
                  max={120}
                  step={5}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 5, label: '5m' },
                    { value: 30, label: '30m' },
                    { value: 60, label: '1h' },
                    { value: 120, label: '2h' },
                  ]}
                  sx={{ width: '100%' }}
                />
              </SettingRow>
              <SettingRow label="Two-Factor Authentication" description="Require 2FA for admin accounts">
                <Switch
                  checked={settings.factor_auth || false}
                  onChange={(e) => handleSettingChange('factor_auth', e.target.checked)}
                />
              </SettingRow>
              <SettingRow label="Password Expiry" description="Days until password must be changed">
                <Slider
                  value={settings.password_expiry || 120}
                  onChange={(e, val) => handleSettingChange('password_expiry', val)}
                  min={30}
                  max={365}
                  step={30}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 30, label: '30d' },
                    { value: 90, label: '90d' },
                    { value: 180, label: '180d' },
                    { value: 365, label: '365d' },
                  ]}
                />
              </SettingRow>
              <SettingRow label="Max Failed Logins" description="Account lockout after failed attempts">
                <Slider
                  value={settings.max_failed_logins || 3}
                  onChange={(e, val) => handleSettingChange('max_failed_logins', val)}
                  min={3}
                  max={10}
                  step={1}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 3, label: '3' },
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                  ]}
                />
              </SettingRow>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <PlatinumButton
                  startIcon={savingCategory === 'security' && saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={() => handleSaveSettings('security')}
                  disabled={saving}
                >
                  Save Changes
                </PlatinumButton>
              </Box>
            </SettingsSection>

            <SettingsSection
              icon={<LockIcon />}
              title="User Approvals"
              description="Control who needs approval to access the system"
            >
              <SettingRow label="Doctor Registration" description="Require admin approval for new doctors">
                <Switch
                  checked={settings.doctor_requires_approval !== false}
                  onChange={(e) => handleSettingChange('doctor_requires_approval', e.target.checked)}
                />
              </SettingRow>
              <SettingRow label="Operator Registration" description="Require admin approval for new operators">
                <Switch
                  checked={settings.operator_requires_approval !== false}
                  onChange={(e) => handleSettingChange('operator_requires_approval', e.target.checked)}
                />
              </SettingRow>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <PlatinumButton
                  startIcon={savingCategory === 'approvals' && saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={() => handleSaveSettings('approvals')}
                  disabled={saving}
                >
                  Save Changes
                </PlatinumButton>
              </Box>
            </SettingsSection>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <SettingsSection
              icon={<ScheduleIcon />}
              title="Appointment Settings"
              description="Configure appointment scheduling preferences"
            >
              <SettingRow label="Working Hours Start" description="When the hospital opens">
                <TextField
                  type="time"
                  size="small"
                  value={settings.working_hours_start || '08:00:00'}
                  onChange={(e) => handleSettingChange('working_hours_start', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </SettingRow>
              <SettingRow label="Working Hours End" description="When the hospital closes">
                <TextField
                  type="time"
                  size="small"
                  value={settings.working_hours_end || '18:00:00'}
                  onChange={(e) => handleSettingChange('working_hours_end', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </SettingRow>
              <SettingRow label="Default Appointment Duration" description="Minutes per appointment slot">
                <Select
                  size="small"
                  value={settings.appointment_duration || 60}
                  onChange={(e) => handleSettingChange('appointment_duration', e.target.value)}
                  sx={{ width: 150 }}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={90}>1.5 hours</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </SettingRow>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <PlatinumButton
                  startIcon={savingCategory === 'appointments' && saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={() => handleSaveSettings('appointments')}
                  disabled={saving}
                >
                  Save Changes
                </PlatinumButton>
              </Box>
            </SettingsSection>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <SettingsSection
              icon={<NotificationsIcon />}
              title="Notification Preferences"
              description="Control what notifications are sent"
            >
              <SettingRow label="Email Notifications" description="Enable email notifications">
                <Switch
                  checked={settings.email_enabled !== false}
                  onChange={(e) => handleSettingChange('email_enabled', e.target.checked)}
                />
              </SettingRow>
              <SettingRow label="Appointment Reminders" description="Send reminders for upcoming appointments">
                <Switch
                  checked={settings.notify_on_appointment !== false}
                  onChange={(e) => handleSettingChange('notify_on_appointment', e.target.checked)}
                />
              </SettingRow>
              <SettingRow label="Billing Alerts" description="Send notifications for bill generation and payments">
                <Switch
                  checked={settings.notify_on_bill !== false}
                  onChange={(e) => handleSettingChange('notify_on_bill', e.target.checked)}
                />
              </SettingRow>
              <SettingRow label="Lab Report Ready" description="Notify when lab results are available">
                <Switch
                  checked={settings.notify_on_report !== false}
                  onChange={(e) => handleSettingChange('notify_on_report', e.target.checked)}
                />
              </SettingRow>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <PlatinumButton
                  startIcon={savingCategory === 'notifications' && saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={() => handleSaveSettings('notifications')}
                  disabled={saving}
                >
                  Save Changes
                </PlatinumButton>
              </Box>
            </SettingsSection>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <SettingsSection
              icon={<EmailIcon />}
              title="Email Configuration"
              description="SMTP settings for system emails"
            >
              <SettingRow label="SMTP Server" description="Email server address">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="smtp.gmail.com"
                  value={settings.email_host || ''}
                  onChange={(e) => handleSettingChange('email_host', e.target.value)}
                />
              </SettingRow>
              <SettingRow label="SMTP Port" description="Server port">
                <TextField
                  size="small"
                  type="number"
                  placeholder="587"
                  value={settings.email_port || 587}
                  onChange={(e) => handleSettingChange('email_port', parseInt(e.target.value))}
                  sx={{ width: 150 }}
                />
              </SettingRow>
              <SettingRow label="Username" description="SMTP authentication username">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="noreply@hospital.com"
                  value={settings.email_username || ''}
                  onChange={(e) => handleSettingChange('email_username', e.target.value)}
                />
              </SettingRow>
              <SettingRow label="Password" description="SMTP authentication password">
                <TextField
                  fullWidth
                  size="small"
                  type="password"
                  placeholder="••••••••"
                  value={settings.email_password || ''}
                  onChange={(e) => handleSettingChange('email_password', e.target.value)}
                />
              </SettingRow>
              <SettingRow label="Use TLS" description="Enable TLS encryption">
                <Switch
                  checked={settings.email_use_tls !== false}
                  onChange={(e) => handleSettingChange('email_use_tls', e.target.checked)}
                />
              </SettingRow>
              <SettingRow label="Test Email" description="Send a test email to verify configuration">
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <Button variant="outlined" startIcon={<SendIcon />} onClick={handleTestEmail} size="small">
                    Send Test
                  </Button>
                </Box>
              </SettingRow>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <PlatinumButton
                  startIcon={savingCategory === 'email' && saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={() => handleSaveSettings('email')}
                  disabled={saving}
                >
                  Save Changes
                </PlatinumButton>
              </Box>
            </SettingsSection>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <SettingsSection
              icon={<PaymentIcon />}
              title="Billing Settings"
              description="Configure billing and payment preferences"
            >
              <SettingRow label="Default Currency" description="Currency for all transactions">
                <Select
                  size="small"
                  value={settings.currency || 'USD'}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  sx={{ width: 150 }}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="KES">KES (KSh)</MenuItem>
                </Select>
              </SettingRow>
              <SettingRow label="Default Tax Rate" description="Tax rate applied to bills (%)">
                <TextField
                  size="small"
                  type="number"
                  value={settings.tax_rate || 0}
                  onChange={(e) => handleSettingChange('tax_rate', parseFloat(e.target.value))}
                  sx={{ width: 150 }}
                  InputProps={{ endAdornment: '%' }}
                />
              </SettingRow>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <PlatinumButton
                  startIcon={savingCategory === 'billing' && saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={() => handleSaveSettings('billing')}
                  disabled={saving}
                >
                  Save Changes
                </PlatinumButton>
              </Box>
            </SettingsSection>
          </TabPanel>

          <TabPanel value={activeTab} index={6}>
            <SettingsSection
              icon={<AppearanceIcon />}
              title="Appearance"
              description="Customize the look and feel"
            >
              <SettingRow label="Sidebar Collapsible" description="Allow sidebar to be collapsed">
                <Switch
                  checked={settings.sidebar_collapsible !== false}
                  onChange={(e) => handleSettingChange('sidebar_collapsible', e.target.checked)}
                />
              </SettingRow>
              <SettingRow label="Report Confidentiality" description="Add confidentiality notices to reports">
                <Switch
                  checked={settings.report_confidentiality || false}
                  onChange={(e) => handleSettingChange('report_confidentiality', e.target.checked)}
                />
              </SettingRow>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <PlatinumButton
                  startIcon={savingCategory === 'appearance' && saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={() => handleSaveSettings('appearance')}
                  disabled={saving}
                >
                  Save Changes
                </PlatinumButton>
              </Box>
            </SettingsSection>
          </TabPanel>

          <TabPanel value={activeTab} index={7}>
            <SettingsSection
              icon={<DataIcon />}
              title="Data Management"
              description="Configure data retention and privacy"
            >
              <SettingRow label="Activity Logging" description="Track user activities in audit logs">
                <Switch
                  checked={settings.activity_logging || false}
                  onChange={(e) => handleSettingChange('activity_logging', e.target.checked)}
                />
              </SettingRow>
              <SettingRow label="Data Retention Period" description="How long to keep patient records (days)">
                <Slider
                  value={settings.data_retention_days || 365}
                  onChange={(e, val) => handleSettingChange('data_retention_days', val)}
                  min={30}
                  max={730}
                  step={30}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 30, label: '30d' },
                    { value: 365, label: '1y' },
                    { value: 730, label: '2y' },
                  ]}
                />
              </SettingRow>
              <SettingRow label="Create Backup" description="Manually create a system backup">
                <Button variant="outlined" startIcon={<BackupIcon />} onClick={async () => {
                  try {
                    await adminService.backupSettings();
                    toast.success('Backup created successfully');
                  } catch (error) {
                    toast.error('Backup failed');
                  }
                }}>
                  Create Backup Now
                </Button>
              </SettingRow>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <PlatinumButton
                  startIcon={savingCategory === 'data' && saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={() => handleSaveSettings('data')}
                  disabled={saving}
                >
                  Save Changes
                </PlatinumButton>
              </Box>
            </SettingsSection>
          </TabPanel>
        </Grid>
      </Grid>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettings;