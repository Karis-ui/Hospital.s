import React, { useState } from 'react';
import { Button, Paper, Typography, Box } from '@mui/material';
import api from '../services/api';

const TestAPI = () => {
  const [status, setStatus] = useState('Not tested');
  const [response, setResponse] = useState(null);

  const testConnection = async () => {
    try {
      setStatus('Testing...');
      console.log('🔍 Testing backend connection...');
      
      const res = await api.get('/home/');
      
      console.log('✅ Backend connected! Response:', res.data);
      setStatus('✅ Connected!');
      setResponse(res.data);
    } catch (error) {
      console.error('❌ Connection failed:', error);
      setStatus('❌ Failed to connect');
      setResponse(error.message);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6">Backend Connection Test</Typography>
      <Button variant="contained" onClick={testConnection} sx={{ mt: 2 }}>
        Test Connection
      </Button>
      <Typography sx={{ mt: 2 }}>
        Status: {status}
      </Typography>
      {response && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </Box>
      )}
    </Paper>
  );
};

export default TestAPI;