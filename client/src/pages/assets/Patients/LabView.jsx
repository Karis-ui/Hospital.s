import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import PatientService from '../../../services/users/patient';
import { formatDate } from '../../../formatters';

const getStatus = (report) => {
  if (report.is_approved) return 'Available';
  return report.status || 'Pending';
};

const getStatusColor = (report) => {
  if (report.is_approved) return 'success';
  if (report.status === 'rejected') return 'error';
  return 'warning';
};

export const Labview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLabResults = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (id) {
        const response = await PatientService.viewLab(id);
        setResult(response.data);
        setResults([]);
      } else {
        const response = await PatientService.getLabResults();
        const reports = response.data?.data;
        if (!Array.isArray(reports)) {
          throw new Error('The lab results response was not a list.');
        }
        setResults(reports);
        setResult(null);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Failed to load lab results.');
      setResults([]);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLabResults();
  }, [fetchLabResults]);

  const handleDownload = async (reportId) => {
    try {
      const response = await PatientService.downloadLabReport(reportId);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lab_report_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      toast.error(downloadError.response?.data?.error || 'Failed to download the lab report.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/patient/dashboard')} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Back to dashboard
        </Button>
      </Box>
    );
  }

  if (!id) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Lab Results
        </Typography>
        {results.length === 0 ? (
          <Alert severity="info">You do not have any lab reports yet.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>Lab report #{report.id}</TableCell>
                    <TableCell>{formatDate(report.uploaded_at) || 'Not recorded'}</TableCell>
                    <TableCell>
                      <Chip label={getStatus(report)} color={getStatusColor(report)} size="small" />
                    </TableCell>
                    <TableCell>{report.remarks || '—'}</TableCell>
                    <TableCell align="right">
                      <Button onClick={() => navigate(`/patient/lab-view/${report.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  }

  if (!result) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Alert severity="error">Lab report not found.</Alert>
        <Button onClick={() => navigate('/patient/lab-view')} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Back to lab results
        </Button>
      </Box>
    );
  }

  const structuredResults = result.structured_results;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/patient/lab-view')} aria-label="Back to lab results">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          Lab Report #{result.id}
        </Typography>
        {result.report_file && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownload(result.id)}
          >
            Download
          </Button>
        )}
      </Stack>

      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <ScienceIcon color="primary" />
            <Typography variant="h6">Report details</Typography>
            <Chip label={getStatus(result)} color={getStatusColor(result)} size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Uploaded: {formatDate(result.uploaded_at) || 'Not recorded'}
          </Typography>
          {result.remarks && (
            <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{result.remarks}</Typography>
          )}
          {structuredResults && (
            <Box
              component="pre"
              sx={{
                mt: 2,
                p: 2,
                overflowX: 'auto',
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(structuredResults, null, 2)}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
