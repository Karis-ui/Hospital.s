import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography,
    LinearProgress,
    Box,
    alpha,
    useTheme,
    Avatar,
    Chip,
} from '@mui/material';
import {
    AccessTime as TimeIcon,
    AdminPanelSettings as AdminIcon,
    MedicalServices as DoctorIcon,
    Science as LabIcon,
    Person as PatientIcon,
    Receipt as OperatorIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/authContext';

export const SessionTimeoutDialog = ({ open, onExtend, onLogout, timeLeft }) => {
    const theme = useTheme();
    const { user } = useAuth();

    const getRoleInfo = () => {
        const role = user?.user_type || user?.role || 'patient';
        const roleConfig = {
            admin: {
                icon: <AdminIcon />,
                label: 'Admin',
                color: theme.palette.error.main,
                bgColor: alpha(theme.palette.error.main, 0.1),
            },
            doctor: {
                icon: <DoctorIcon />,
                label: 'Doctor',
                color: theme.palette.info.main,
                bgColor: alpha(theme.palette.info.main, 0.1),
            },
            lab_technician: {
                icon: <LabIcon />,
                label: 'Lab Technician',
                color: theme.palette.warning.main,
                bgColor: alpha(theme.palette.warning.main, 0.1),
            },
            patient: {
                icon: <PatientIcon />,
                label: 'Patient',
                color: theme.palette.success.main,
                bgColor: alpha(theme.palette.success.main, 0.1),
            },
            operator: {
                icon: <OperatorIcon />,
                label: 'Operator',
                color: theme.palette.secondary.main,
                bgColor: alpha(theme.palette.secondary.main, 0.1),
            },
        };
        return roleConfig[role] || roleConfig.patient;
    };

    const roleInfo = getRoleInfo();

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    const getUserIdentifier = () => {
        return user?.email || user?.username || user?.full_name || 'User';
    };

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.15)}`,
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Box
                    sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <TimeIcon sx={{ color: theme.palette.warning.main }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Session Expiring Soon
                    </Typography>
                    <Chip
                        icon={roleInfo.icon}
                        label={roleInfo.label}
                        size="small"
                        sx={{
                            mt: 0.5,
                            bgcolor: roleInfo.bgColor,
                            color: roleInfo.color,
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: roleInfo.color },
                        }}
                    />
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <DialogContentText sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                    Your {roleInfo.label.toLowerCase()} session will expire in{' '}
                    <Typography component="span" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                        {formatTime(timeLeft)}
                    </Typography>
                    . Please extend your session to continue working.
                </DialogContentText>

                <LinearProgress
                    variant="determinate"
                    value={(timeLeft / 120) * 100}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                            bgcolor: timeLeft < 30 ? theme.palette.error.main : theme.palette.warning.main,
                            borderRadius: 4,
                            transition: 'background-color 0.3s ease',
                        },
                    }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {formatTime(timeLeft)} remaining
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {getUserIdentifier()}
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    variant="outlined"
                    onClick={onLogout}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        color: theme.palette.error.main,
                        borderColor: alpha(theme.palette.error.main, 0.3),
                        '&:hover': {
                            borderColor: theme.palette.error.main,
                            bgcolor: alpha(theme.palette.error.main, 0.05),
                        },
                    }}
                >
                    Logout Now
                </Button>
                <Button
                    variant="contained"
                    onClick={onExtend}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4],
                        },
                    }}
                >
                    Extend Session
                </Button>
            </DialogActions>
        </Dialog>
    );
};