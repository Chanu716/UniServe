import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Fade,
  Grow,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  MeetingRoom as MeetingRoomIcon,
  BookOnline as BookOnlineIcon,
  PendingActions as PendingActionsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { bookingAPI, resourceAPI } from '../services/api';
import { useThemeStore } from '../store/themeStore';

function Dashboard() {
  const { user } = useAuthStore();
  const { mode } = useThemeStore();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalResources: 0,
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [bookingsResponse, resourcesResponse] = await Promise.all([
          bookingAPI.getAll({ limit: 1000 }),
          resourceAPI.getAll({ limit: 1000 }),
        ]);

        const bookings = bookingsResponse.data.bookings;
        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.status === 'pending').length,
          approvedBookings: bookings.filter(b => b.status === 'approved').length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
          cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
          totalResources: resourcesResponse.data.resources.length,
          recentBookings: bookings.slice(0, 5),
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: <BookOnlineIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bgColor: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
      change: '+12%',
    },
    {
      title: 'Pending Approval',
      value: stats.pendingBookings,
      icon: <PendingActionsIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      bgColor: mode === 'dark' ? 'rgba(245, 87, 108, 0.1)' : 'rgba(245, 87, 108, 0.05)',
      change: '+5%',
    },
    {
      title: 'Approved',
      value: stats.approvedBookings,
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      bgColor: mode === 'dark' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(0, 242, 254, 0.05)',
      change: '+8%',
    },
    {
      title: 'Available Resources',
      value: stats.totalResources,
      icon: <MeetingRoomIcon sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      bgColor: mode === 'dark' ? 'rgba(67, 233, 123, 0.1)' : 'rgba(67, 233, 123, 0.05)',
      change: '+3%',
    },
  ];

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
      {/* Welcome Section */}
      <Fade in timeout={600}>
        <Box
          sx={{
            ...glassStyle,
            p: 4,
            mb: 4,
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Welcome back, {user?.name}! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {user?.role === 'admin' ? 'Administrator' : 
                 user?.role === 'coordinator' ? 'Coordinator' : 'Student'} • {user?.department}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Grow in timeout={600 + (index * 100)}>
              <Card
                sx={{
                  ...glassStyle,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: mode === 'dark'
                      ? '0 12px 40px 0 rgba(0, 0, 0, 0.5)'
                      : '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: stat.gradient,
                    opacity: 0.1,
                    borderRadius: '0 0 0 100%',
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '15px',
                        background: stat.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Chip
                      label={stat.change}
                      size="small"
                      icon={<TrendingUpIcon />}
                      sx={{
                        background: 'rgba(67, 233, 123, 0.1)',
                        color: '#43e97b',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                  <Typography variant="h3" fontWeight="bold" gutterBottom>
                    {loading ? '...' : stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions & Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Bookings */}
        <Grid item xs={12} lg={8}>
          <Fade in timeout={1000}>
            <Card sx={{ ...glassStyle, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  Recent Activity
                </Typography>
              </Box>
              {loading ? (
                <LinearProgress />
              ) : stats.recentBookings.length > 0 ? (
                <Box>
                  {stats.recentBookings.map((booking, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: '12px',
                        background: mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'rgba(0, 0, 0, 0.02)',
                        border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs>
                          <Typography variant="subtitle1" fontWeight="600">
                            {booking.resource_id?.name || 'Resource'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(booking.start_time).toLocaleDateString()} • {booking.purpose}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Chip
                            label={booking.status}
                            size="small"
                            sx={{
                              background: booking.status === 'approved' ? 'rgba(67, 233, 123, 0.1)' :
                                         booking.status === 'pending' ? 'rgba(245, 87, 108, 0.1)' :
                                         'rgba(158, 158, 158, 0.1)',
                              color: booking.status === 'approved' ? '#43e97b' :
                                     booking.status === 'pending' ? '#f5576c' :
                                     '#9e9e9e',
                              fontWeight: 'bold',
                              textTransform: 'capitalize',
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No recent bookings
                </Typography>
              )}
            </Card>
          </Fade>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} lg={4}>
          <Fade in timeout={1200}>
            <Card sx={{ ...glassStyle, p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DashboardIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  Quick Stats
                </Typography>
              </Box>
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.totalBookings > 0
                        ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                        : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                      },
                    }}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Approval Rate</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {stats.totalBookings > 0
                        ? Math.round((stats.approvedBookings / stats.totalBookings) * 100)
                        : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.totalBookings > 0 ? (stats.approvedBookings / stats.totalBookings) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Resource Utilization</Typography>
                    <Typography variant="body2" fontWeight="bold">78%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={78}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
