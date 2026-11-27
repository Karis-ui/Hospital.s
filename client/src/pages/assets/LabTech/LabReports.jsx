import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { labServices } from '../../../services/users/labtech';

const LabReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await labServices.stats();
      const data = response.data?.data;
      if (!data) {
        throw new Error('The lab statistics response was empty.');
      }
      setReportData(data);
      setError('');
    } catch (err) {
      console.error('Failed to load laboratory analytics:', err);
      setError(err.response?.data?.message || 'Unable to load laboratory analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const metrics = [
    { label: 'Total Tests', value: reportData?.totalTests ?? 0 },
    { label: 'Completed Tests', value: reportData?.completedTests ?? 0 },
    { label: 'Pending Tests', value: reportData?.pendingTests ?? 0 },
    { label: 'Approval Rate', value: `${reportData?.approvalRate ?? 0}%` },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Reports &amp; Analytics</Typography>
          <Typography color="text.secondary">Laboratory activity from recorded requests and reports.</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={loadReports} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={loadReports}>Retry</Button>
        }>
          {error}
        </Alert>
      )}

      {loading && !reportData ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {metrics.map((metric) => (
              <Grid item xs={12} sm={6} md={3} key={metric.label}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">{metric.label}</Typography>
                    <Typography variant="h4" fontWeight={700}>{metric.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Tests by Type</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Test Type</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">Completed</TableCell>
                        <TableCell align="right">Pending</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(reportData?.test_type_stats || []).map((item) => (
                        <TableRow key={item.test_type}>
                          <TableCell>{item.test_type}</TableCell>
                          <TableCell align="right">{item.total}</TableCell>
                          <TableCell align="right">{item.completed}</TableCell>
                          <TableCell align="right">{item.pending}</TableCell>
                        </TableRow>
                      ))}
                      {!reportData?.test_type_stats?.length && (
                        <TableRow><TableCell colSpan={4} align="center">No test data available.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Monthly Activity</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Requests</TableCell>
                        <TableCell align="right">Completed</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(reportData?.monthly_trends || []).map((item) => (
                        <TableRow key={item.month}>
                          <TableCell>{item.month}</TableCell>
                          <TableCell align="right">{item.requests}</TableCell>
                          <TableCell align="right">{item.completed}</TableCell>
                        </TableRow>
                      ))}
                      {!reportData?.monthly_trends?.length && (
                        <TableRow><TableCell colSpan={3} align="center">No monthly activity available.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default LabReports;
