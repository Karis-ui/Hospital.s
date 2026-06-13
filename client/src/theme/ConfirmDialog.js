import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  alpha,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { platinumTheme } from '../theme/adminComponents';

export const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', 
  confirmColor = 'primary',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <ErrorIcon sx={{ fontSize: 48, color: platinumTheme.accent.red }} />;
      case 'success':
        return <SuccessIcon sx={{ fontSize: 48, color: platinumTheme.accent.green }} />;
      case 'info':
        return <InfoIcon sx={{ fontSize: 48, color: platinumTheme.accent.blue }} />;
      default:
        return <WarningIcon sx={{ fontSize: 48, color: platinumTheme.accent.orange }} />;
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'error': return platinumTheme.accent.red;
      case 'success': return platinumTheme.accent.green;
      case 'info': return platinumTheme.accent.blue;
      default: return platinumTheme.accent.orange;
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ mb: 1 }}>{getIcon()}</Box>
        <Typography variant="h6" sx={{ color: getTitleColor(), fontWeight: 600 }}>
          {title || 'Confirm Action'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ textAlign: 'center', color: platinumTheme.text.secondary }}>
          {message || 'Are you sure you want to proceed?'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
        <Button variant="outlined" onClick={onCancel} size="medium">
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          color={confirmColor}
          size="medium"
          sx={{
            bgcolor: type === 'error' ? platinumTheme.accent.red : 
                     type === 'success' ? platinumTheme.accent.green :
                     type === 'info' ? platinumTheme.accent.blue :
                     platinumTheme.secondary.main,
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;