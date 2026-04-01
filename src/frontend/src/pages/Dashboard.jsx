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
      icon: <BookOnlineIcon sx={{ fontSize: 32 }} />,
      accent: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      change: '+12%',
    },
    {
      title: 'Pending Approval',
      value: stats.pendingBookings,
      icon: <PendingActionsIcon sx={{ fontSize: 32 }} />,
      accent: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bgColor: mode === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
      change: '+5%',
    },
    {
      title: 'Approved',
      value: stats.approvedBookings,
      icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
      accent: '#34d399',
      gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      bgColor: mode === 'dark' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(52, 211, 153, 0.08)',
      change: '+8%',
    },
    {
      title: 'Resources',
      value: stats.totalResources,
      icon: <MeetingRoomIcon sx={{ fontSize: 32 }} />,
      accent: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      bgColor: mode === 'dark' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
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
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 5, 5, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderTop: `4px solid ${stat.accent}`,
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: mode === 'dark'
                      ? `0 20px 40px -12px ${stat.accent}33`
                      : `0 20px 40px -12px ${stat.accent}22`,
                    '& .stat-icon-box': {
                      transform: 'scale(1.1) rotate(5deg)',
                    }
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: '120px',
                    height: '120px',
                    background: `radial-gradient(circle, ${stat.accent}15 0%, transparent 70%)`,
                    borderRadius: '50%',
                  }}
                />
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box
                      className="stat-icon-box"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: stat.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.accent,
                        transition: 'transform 0.3s ease',
                        boxShadow: `0 8px 16px -4px ${stat.accent}33`,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={stat.change}
                        size="small"
                        sx={{
                          background: `${stat.accent}15`,
                          color: stat.accent,
                          fontWeight: 'bold',
                          borderRadius: '8px',
                          border: `1px solid ${stat.accent}33`,
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="h3" fontWeight="800" sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>
                    {loading ? '...' : stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, letterSpacing: '0.01em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
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
                              background: booking.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' :
                                         booking.status === 'pending' || booking.status === 'pending_faculty' || booking.status === 'pending_coordinator' ? 'rgba(245, 158, 11, 0.15)' :
                                         'rgba(148, 163, 184, 0.15)',
                              color: booking.status === 'approved' ? '#10b981' :
                                     booking.status === 'pending' || booking.status === 'pending_faculty' || booking.status === 'pending_coordinator' ? '#f59e0b' :
                                     '#94a3b8',
                              fontWeight: '600',
                              fontSize: '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderRadius: '6px',
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
                        background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
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
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
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
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
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
