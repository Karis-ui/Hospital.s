import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  alpha,
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, subDays } from 'date-fns';
import {
  Favorite as HeartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const VitalChart = ({ data, height = 350 }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState('line');
  const [selectedMetric, setSelectedMetric] = useState('bp');
  const [timeRange, setTimeRange] = useState('week');

  const metrics = [
    { id: 'bp', label: 'Blood Pressure', icon: <HeartIcon />, color: theme.palette.error.main, yAxis: 'left' },
    { id: 'heartRate', label: 'Heart Rate', icon: <HeartIcon />, color: theme.palette.success.main, yAxis: 'right', unit: 'bpm' },
    { id: 'temperature', label: 'Temperature', icon: <TrendingUpIcon />, color: theme.palette.warning.main, yAxis: 'right', unit: '°F' },
    { id: 'weight', label: 'Weight', icon: <TrendingDownIcon />, color: theme.palette.info.main, yAxis: 'left', unit: 'kg' },
  ];

  const filterDataByRange = () => {
    const now = new Date();
    let days = 7;
    if (timeRange === 'month') days = 30;
    if (timeRange === 'quarter') days = 90;
    const startDate = subDays(now, days);
    return data.filter(v => new Date(v.recorded_at) >= startDate);
  };

  const filteredData = filterDataByRange();

  const chartData = filteredData.map(v => ({
    date: format(new Date(v.recorded_at), 'MM/dd'),
    fullDate: format(new Date(v.recorded_at), 'MMM dd, yyyy'),
    systolic: v.bp_systolic,
    diastolic: v.bp_diastolic,
    heartRate: v.heart_rate,
    temperature: v.temperature,
    weight: v.weight,
    oxygenSat: v.oxygen_saturation,
  }));

  const lastReading = filteredData[filteredData.length - 1];
  const previousReading = filteredData[filteredData.length - 2];

  const getTrend = (current, previous) => {
    if (!previous) return 'stable';
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />;
    if (trend === 'down') return <TrendingDownIcon sx={{ fontSize: 14, color: 'error.main' }} />;
    return null;
  };

  const renderChart = () => {
    if (selectedMetric === 'bp') {
      return (
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
          <XAxis
            dataKey="date"
            tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
            axisLine={{ stroke: alpha(theme.palette.text.secondary, 0.2) }}
          />
          <YAxis
            yAxisId="left"
            domain={[80, 160]}
            tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
            label={{ value: 'mmHg', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }}
          />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 8,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: theme.shadows[3],
            }}
            labelStyle={{ color: theme.palette.text.primary, fontWeight: 600 }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="systolic"
            name="Systolic"
            stroke={theme.palette.error.main}
            strokeWidth={3}
            dot={{ r: 4, fill: theme.palette.error.main, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="diastolic"
            name="Diastolic"
            stroke={theme.palette.warning.main}
            strokeWidth={3}
            dot={{ r: 4, fill: theme.palette.warning.main, strokeWidth: 2 }}
          />
          <ReferenceLine yAxisId="left" y={120} label="High" stroke={alpha(theme.palette.error.main, 0.5)} strokeDasharray="3 3" />
          <ReferenceLine yAxisId="left" y={80} label="Normal" stroke={alpha(theme.palette.success.main, 0.5)} strokeDasharray="3 3" />
        </LineChart>
      );
    }

    if (selectedMetric === 'heartRate') {
      return (
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
          <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} />
          <YAxis domain={[40, 120]} tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 8,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="heartRate"
            name="Heart Rate"
            stroke={theme.palette.success.main}
            strokeWidth={3}
            dot={{ r: 4, fill: theme.palette.success.main }}
            fill="url(#colorGradient)"
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
              <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0} />
            </linearGradient>
          </defs>
          <ReferenceLine y={100} label="High" stroke={alpha(theme.palette.error.main, 0.5)} strokeDasharray="3 3" />
          <ReferenceLine y={60} label="Low" stroke={alpha(theme.palette.warning.main, 0.5)} strokeDasharray="3 3" />
        </LineChart>
      );
    }

    return (
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.secondary, 0.1)} />
        <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} />
        <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 8,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey={selectedMetric}
          name={metrics.find(m => m.id === selectedMetric)?.label}
          stroke={metrics.find(m => m.id === selectedMetric)?.color}
          strokeWidth={2}
          fill={metrics.find(m => m.id === selectedMetric)?.color}
          fillOpacity={0.2}
        />
      </AreaChart>
    );
  };

  return (
    <Box>
      {/* Chart Controls */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {metrics.map((metric) => (
            <Chip
              key={metric.id}
              icon={metric.icon}
              label={metric.label}
              onClick={() => setSelectedMetric(metric.id)}
              color={selectedMetric === metric.id ? 'primary' : 'default'}
              sx={{
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)' },
                ...(selectedMetric === metric.id && {
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  color: 'white',
                }),
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(e, val) => val && setTimeRange(val)}
            size="small"
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="quarter">3 Months</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(e, val) => val && setChartType(val)}
            size="small"
          >
            <ToggleButton value="line">
              <ChartIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="area">
              <BarChartIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Refresh Data">
            <IconButton size="small" onClick={() => { }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ height, width: '100%', position: 'relative' }}>
        <ResponsiveContainer>
          {chartType === 'line' ? renderChart() : renderChart()}
        </ResponsiveContainer>
      </Box>

      {/* Current Readings Summary */}
      {lastReading && (
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HeartIcon sx={{ fontSize: 18, color: 'error.main' }} />
                Latest Readings ({format(new Date(lastReading.recorded_at), 'MMM dd, yyyy HH:mm')})
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        Blood Pressure
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                        {lastReading.bp_systolic}/{lastReading.bp_diastolic}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        {getTrendIcon(getTrend(lastReading.bp_systolic, previousReading?.bp_systolic))}
                        <Typography variant="caption" color="textSecondary">
                          {getTrend(lastReading.bp_systolic, previousReading?.bp_systolic) === 'up' ? 'Higher' :
                            getTrend(lastReading.bp_systolic, previousReading?.bp_systolic) === 'down' ? 'Lower' : 'Stable'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        Heart Rate
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {lastReading.heart_rate} bpm
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        Temperature
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        {lastReading.temperature}°F
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        Weight
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                        {lastReading.weight} kg
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        BMI: {lastReading.bmi || '—'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default VitalChart;