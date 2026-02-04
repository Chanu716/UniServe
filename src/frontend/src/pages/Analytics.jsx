import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Fade,
  Grow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Button } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Group as GroupIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import api from '../utils/api';
import { useThemeStore } from '../store/themeStore';

const COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#fb923c'];

function Analytics() {
  const { mode } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (filters = {}) => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const response = await api.get(`/bookings/analytics/utilization?${params}`);
      setAnalyticsData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value };
    setDateRange(newRange);
    if (newRange.start && newRange.end) {
      fetchAnalytics({ start_date: newRange.start, end_date: newRange.end });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  // Transform data for charts
  const utilizationChartData = analyticsData?.utilization_by_type?.map(item => ({
    type: item._id || 'Unknown',
    bookings: item.total_bookings,
    hours: Math.round(item.total_hours),
    checkedIn: item.checked_in_count,
  })) || [];

  const departmentData = analyticsData?.department_usage?.map(item => ({
    name: item._id || 'Unknown',
    value: item.total_bookings,
  })) || [];

  const peakHoursData = analyticsData?.peak_hours?.map(item => ({
    hour: `${item._id.hour}:00`,
    bookings: item.count,
    day: getDayName(item._id.day),
  })) || [];

  const topResourcesData = analyticsData?.top_resources?.map(item => ({
    name: item.resource_name,
    bookings: item.booking_count,
    hours: Math.round(item.total_hours),
    type: item.resource_type,
  })) || [];

  function getDayName(day) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day - 1] || 'Unknown';
  }

  const totalBookings = utilizationChartData.reduce((sum, item) => sum + item.bookings, 0);
  const totalHours = utilizationChartData.reduce((sum, item) => sum + item.hours, 0);
  const totalCheckedIn = utilizationChartData.reduce((sum, item) => sum + item.checkedIn, 0);

  const glassStyle = {
    background: mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: mode === 'dark'
      ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      : '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            📊 Resource Utilization Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track usage patterns, peak hours, and department-wise resource utilization
          </Typography>
        </Box>
      </Fade>

      {/* Date Range Filter */}
      <Fade in timeout={800}>
        <Card sx={{ ...glassStyle, p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BarChartIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Date Range Filter
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => fetchAnalytics({ start_date: dateRange.start, end_date: dateRange.end })}
                sx={{
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                }}
              >
                Filter
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1000}>
            <Card sx={{ 
              ...glassStyle,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(102, 126, 234, 0.05) 100%)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#667eea' }}>
                      {totalBookings}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
                  </Box>
                  <EventIcon sx={{ fontSize: 48, color: '#667eea', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1100}>
            <Card sx={{ 
              ...glassStyle,
              background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.2) 0%, rgba(245, 87, 108, 0.05) 100%)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#f5576c' }}>
                      {totalHours}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Hours</Typography>
                  </Box>
                  <AccessTimeIcon sx={{ fontSize: 48, color: '#f5576c', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1200}>
            <Card sx={{ 
              ...glassStyle,
              background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.2) 0%, rgba(67, 233, 123, 0.05) 100%)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#43e97b' }}>
                      {totalCheckedIn}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Checked In</Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, color: '#43e97b', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1300}>
            <Card sx={{ 
              ...glassStyle,
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.05) 100%)',
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#fbbf24' }}>
                      {departmentData.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Departments</Typography>
                  </Box>
                  <GroupIcon sx={{ fontSize: 48, color: '#fbbf24', opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Utilization Chart */}
        <Grid item xs={12} lg={6}>
          <Grow in timeout={1400}>
            <Card sx={glassStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Utilization by Resource Type
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilizationChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                    <XAxis dataKey="type" stroke={mode === 'dark' ? '#fff' : '#000'} />
                    <YAxis stroke={mode === 'dark' ? '#fff' : '#000'} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        background: mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: 'none',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="bookings" fill={COLORS[0]} name="Total Bookings" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="hours" fill={COLORS[1]} name="Total Hours" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Department Usage */}
        <Grid item xs={12} lg={6}>
          <Grow in timeout={1500}>
            <Card sx={glassStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Usage by Department
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        background: mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Peak Hours */}
        <Grid item xs={12}>
          <Grow in timeout={1600}>
            <Card sx={glassStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Peak Booking Hours
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={peakHoursData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                    <XAxis dataKey="hour" stroke={mode === 'dark' ? '#fff' : '#000'} />
                    <YAxis stroke={mode === 'dark' ? '#fff' : '#000'} />
                    <RechartsTooltip 
                      contentStyle={{ 
                        background: mode === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: 'none',
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke={COLORS[2]} 
                      strokeWidth={3}
                      name="Bookings"
                      dot={{ fill: COLORS[2], r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        {/* Top Resources */}
        <Grid item xs={12}>
          <Grow in timeout={1700}>
            <Card sx={glassStyle}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Top 10 Most Booked Resources
                </Typography>
                <Grid container spacing={2}>
                  {topResourcesData.slice(0, 10).map((resource, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box 
                        sx={{ 
                          p: 3,
                          borderRadius: '16px',
                          background: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                          border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                          {resource.name}
                        </Typography>
                        <Chip 
                          label={resource.type} 
                          size="small"
                          sx={{ mb: 1, background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {resource.bookings} bookings • {resource.hours} hours
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;
