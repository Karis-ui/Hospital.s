import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { labServices } from '../../../services/users/labtech';

const LabStaffDirectory = () => {
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await labServices.getStaffDirectory();
      const staffList = response.data?.data;
      if (!Array.isArray(staffList)) {
        throw new Error('The lab staff response did not contain a staff list.');
      }
      setStaff(staffList);
      setError('');
    } catch (err) {
      console.error('Failed to load laboratory staff:', err);
      setError(err.response?.data?.message || 'Unable to load the laboratory staff directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return staff;
    return staff.filter((member) =>
      [member.name, member.department, member.shift_time]
        .some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [search, staff]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>Lab Staff</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Read-only directory of active laboratory technicians.
      </Typography>

      <TextField
        fullWidth
        label="Search staff"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 3, maxWidth: 480 }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredStaff.length === 0 ? (
        <Alert severity="info">
          {staff.length ? 'No staff match your search.' : 'No active laboratory technicians are available.'}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredStaff.map((member) => (
            <Grid item xs={12} sm={6} lg={4} key={member.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>{member.name}</Typography>
                    <Chip
                      size="small"
                      color={member.available ? 'success' : 'default'}
                      label={member.available ? 'Available' : 'Unavailable'}
                    />
                  </Box>
                  <Typography color="text.secondary">
                    {member.department || 'Department not specified'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Shift: {member.shift_time || 'Not specified'}
                  </Typography>
                  <Typography variant="body2">
                    Experience: {member.experience_years} years
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default LabStaffDirectory;
