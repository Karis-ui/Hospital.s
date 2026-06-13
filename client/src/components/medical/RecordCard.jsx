import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
  Paper,
  Avatar,
  alpha,
  useTheme,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  MedicalServices as MedicalIcon,
  Medication as MedicationIcon,
  Science as LabIcon,
  Healing as DiagnosisIcon,
  Note as NoteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { formatDate } from '../../formatters';

const StyledCard = styled(Card)(({ theme, isCritical }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'visible',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
  '&::before': isCritical ? {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background: `linear-gradient(180deg, ${theme.palette.error.main}, ${theme.palette.error.light})`,
    borderRadius: '4px 0 0 4px',
  } : {},
}));

const TypeBadge = styled(Box)(({ theme, type }) => ({
  position: 'absolute',
  top: -12,
  left: 20,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: theme.shadows[2],
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  zIndex: 1,
}));

const SeverityChip = styled(Chip)(({ theme, severity }) => ({
  fontWeight: 600,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(0, 0.5),
  ...(severity === 'critical' && {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)' },
      '70%': { boxShadow: '0 0 0 6px rgba(244, 67, 54, 0)' },
      '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' },
    },
  }),
  ...(severity === 'severe' && {
    backgroundColor: alpha(theme.palette.error.main, 0.05),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
  }),
  ...(severity === 'moderate' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.dark,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
  ...(severity === 'mild' && {
    backgroundColor: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main,
    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
  }),
}));

const RecordCard = ({ record, onClick, onDownload }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getTypeConfig = () => {
    const configs = {
      diagnosis: { icon: <DiagnosisIcon />, color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.1), label: 'Diagnosis' },
      medication: { icon: <MedicationIcon />, color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.1), label: 'Medication' },
      allergy: { icon: <WarningIcon />, color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.1), label: 'Allergy' },
      lab: { icon: <LabIcon />, color: theme.palette.info.main, bg: alpha(theme.palette.info.main, 0.1), label: 'Lab Result' },
      procedure: { icon: <MedicalIcon />, color: theme.palette.secondary.main, bg: alpha(theme.palette.secondary.main, 0.1), label: 'Procedure' },
      clinical_note: { icon: <NoteIcon />, color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.1), label: 'Note' },
    };
    return configs[record.record_type] || configs.diagnosis;
  };

  const typeConfig = getTypeConfig();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, icon: <PendingIcon /> };
      case 'resolved': return { bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, icon: <CheckIcon /> };
      case 'chronic': return { bg: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, icon: <MedicalIcon /> };
      default: return { bg: alpha(theme.palette.grey[500], 0.1), color: theme.palette.grey[500], icon: <MedicalIcon /> };
    }
  };

  const statusConfig = getStatusColor(record.status);

  return (
    <StyledCard isCritical={record.is_critical}>
      <TypeBadge>
        {typeConfig.icon}
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {typeConfig.label}
        </Typography>
      </TypeBadge>

      <CardContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: typeConfig.bg,
                color: typeConfig.color,
                boxShadow: `0 4px 12px ${alpha(typeConfig.color, 0.2)}`,
              }}
            >
              {typeConfig.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {record.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(record.recorded_date)}
                  </Typography>
                </Box>
                {record.doctor_name && (
                  <>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="textSecondary">
                        Dr. {record.doctor_name}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {record.severity && (
              <SeverityChip
                label={record.severity.toUpperCase()}
                severity={record.severity}
                size="small"
              />
            )}
            <Chip
              label={record.status.toUpperCase()}
              size="small"
              sx={{
                bgcolor: statusConfig.bg,
                color: statusConfig.color,
                fontWeight: 600,
                '& .MuiChip-icon': { color: statusConfig.color },
              }}
              icon={statusConfig.icon}
            />
          </Box>
        </Box>

        {record.description && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              mb: 2,
              pl: 7,
              lineHeight: 1.6,
              borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              paddingLeft: 2,
            }}
          >
            {record.description}
          </Typography>
        )}

        {record.record_type === 'medication' && record.data && (
          <Box sx={{ pl: 7, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Paper
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                  💊 {record.data.dosage || 'N/A'}
                </Typography>
              </Paper>
              <Paper
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'info.main' }}>
                  🕒 {record.data.frequency || 'N/A'}
                </Typography>
              </Paper>
              {record.data.instructions && (
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    📋 {record.data.instructions}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        )}

        {record.record_type === 'allergy' && record.data && (
          <Box sx={{ pl: 7, mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              }}
            >
              <Typography variant="caption" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ fontSize: 14 }} />
                Reaction: {record.data.reaction || 'Unknown'}
              </Typography>
            </Paper>
          </Box>
        )}

        {record.record_type === 'lab' && record.data && (
          <Box sx={{ pl: 7, mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Result: {record.data.result || 'Pending'}
                </Typography>
                {record.data.reference_range && (
                  <Typography variant="caption" color="textSecondary">
                    Reference: {record.data.reference_range}
                  </Typography>
                )}
                {record.data.abnormal && (
                  <Chip label="Abnormal" size="small" color="error" sx={{ fontWeight: 600 }} />
                )}
              </Box>
            </Paper>
          </Box>
        )}

        {record.data && Object.keys(record.data).length > 3 && (
          <Box sx={{ pl: 7, mt: 1 }}>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ color: 'text.secondary' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {expanded ? 'Show less' : 'Show more'}
              </Typography>
            </IconButton>
            <Collapse in={expanded}>
              <Paper
                elevation={0}
                sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                  Additional Details
                </Typography>
                {Object.entries(record.data).map(([key, value]) => (
                  key !== 'dosage' && key !== 'frequency' && key !== 'instructions' && key !== 'reaction' && key !== 'result' && (
                    <Box key={key} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 100 }}>
                        {key.replace(/_/g, ' ')}:
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </Typography>
                    </Box>
                  )
                ))}
              </Paper>
            </Collapse>
          </Box>
        )}

        <Divider sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.5) }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="View Details" TransitionComponent={Zoom}>
            <IconButton
              onClick={() => onClick && onClick(record)}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15), transform: 'scale(1.05)' },
                transition: 'all 0.2s ease',
              }}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          {record.attachments?.length > 0 && (
            <Tooltip title="Download" TransitionComponent={Zoom}>
              <IconButton
                onClick={() => onDownload && onDownload(record)}
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.05),
                  '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15), transform: 'scale(1.05)' },
                  transition: 'all 0.2s ease',
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default RecordCard;