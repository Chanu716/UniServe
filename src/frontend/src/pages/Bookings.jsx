import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fade,
  Grow,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Cancel as CancelIcon,
  QrCode as QrCodeIcon,
  CheckCircle as CheckCircleIcon,
  EventAvailable as EventIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { bookingAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  cancelled: 'default',
  completed: 'info',
  checked_in: 'success',
};

function Bookings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { mode } = useThemeStore();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', bookingId: null });
  const [actionInput, setActionInput] = useState('');
  const [qrDialog, setQrDialog] = useState({ open: false, qrCode: null, booking: null });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll({ limit: 100 });
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    }
  };

  const handleOpenActionDialog = (type, bookingId) => {
    setActionDialog({ open: true, type, bookingId });
    setActionInput('');
  };

  const handleCloseActionDialog = () => {
    setActionDialog({ open: false, type: '', bookingId: null });
    setActionInput('');
  };

  const handleAction = async () => {
    try {
      const { type, bookingId } = actionDialog;

      if (type === 'approve') {
        await bookingAPI.approve(bookingId, actionInput);
        toast.success('Booking approved successfully');
      } else if (type === 'reject') {
        if (!actionInput.trim()) {
          toast.error('Rejection reason is required');
          return;
        }
        await bookingAPI.reject(bookingId, actionInput);
        toast.success('Booking rejected');
      } else if (type === 'cancel') {
        await bookingAPI.cancel(bookingId);
        toast.success('Booking cancelled');
      }

      handleCloseActionDialog();
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleShowQR = (booking) => {
    if (booking.qr_code) {
      setQrDialog({ open: true, qrCode: booking.qr_code, booking });
    } else {
      toast.info('QR code not available for this booking');
    }
  };

  const handleCloseQR = () => {
    setQrDialog({ open: false, qrCode: null, booking: null });
  };

  const canApproveReject = ['coordinator', 'admin'].includes(user?.role);
  const canCancel = (booking) => booking.user_id === user?.id || user?.role === 'admin';

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

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return { bg: 'rgba(67, 233, 123, 0.1)', color: '#43e97b' };
      case 'pending': return { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' };
      case 'rejected': return { bg: 'rgba(245, 87, 108, 0.1)', color: '#f5576c' };
      case 'cancelled': return { bg: 'rgba(158, 158, 158, 0.1)', color: '#9e9e9e' };
      case 'completed': return { bg: 'rgba(79, 172, 254, 0.1)', color: '#4facfe' };
      default: return { bg: 'rgba(158, 158, 158, 0.1)', color: '#9e9e9e' };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              📅 My Bookings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage your resource bookings
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/bookings/new')}
            sx={{ 
              py: 1.5,
              px: 3,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.6)',
              },
            }}
          >
            New Booking
          </Button>
        </Box>
      </Fade>

      {/* Bookings Grid */}
      <Grid container spacing={3}>
        {bookings.length === 0 ? (
          <Grid item xs={12}>
            <Fade in timeout={800}>
              <Card sx={{ ...glassStyle, p: 6, textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary">
                  No bookings found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Create your first booking to get started
                </Typography>
              </Card>
            </Fade>
          </Grid>
        ) : (
          bookings.map((booking, index) => (
            <Grid item xs={12} md={6} lg={4} key={booking.id}>
              <Grow in timeout={600 + (index % 9) * 100}>
                <Card
                  sx={{
                    ...glassStyle,
                    height: '100%',
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
                  {/* Gradient overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '150px',
                      height: '150px',
                      background: getStatusColor(booking.status).bg,
                      opacity: 0.3,
                      borderRadius: '0 0 0 100%',
                    }}
                  />
                  
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    {/* Header with Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {booking.resource?.name}
                        </Typography>
                        <Chip
                          label={booking.resource?.type?.replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{
                            background: mode === 'dark' ? 'rgba(79, 172, 254, 0.1)' : 'rgba(79, 172, 254, 0.1)',
                            color: '#4facfe',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                      <Box>
                        <Chip
                          label={booking.status.toUpperCase()}
                          size="small"
                          sx={{
                            background: getStatusColor(booking.status).bg,
                            color: getStatusColor(booking.status).color,
                            fontWeight: 'bold',
                          }}
                        />
                        {booking.check_in_time && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Checked In"
                            size="small"
                            sx={{
                              mt: 0.5,
                              background: 'rgba(67, 233, 123, 0.1)',
                              color: '#43e97b',
                              fontWeight: 'bold',
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Booking Details */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ScheduleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(booking.start_time), 'MMM dd, yyyy HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                        <DescriptionIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                        <Typography variant="body2" color="text.secondary">
                          {booking.purpose}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 2, borderTop: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                      {booking.status === 'approved' && booking.qr_code && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<QrCodeIcon />}
                          onClick={() => handleShowQR(booking)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            borderColor: mode === 'dark' ? 'rgba(102, 126, 234, 0.5)' : '#667eea',
                            color: '#667eea',
                            '&:hover': {
                              borderColor: '#667eea',
                              background: 'rgba(102, 126, 234, 0.1)',
                            },
                          }}
                        >
                          QR Code
                        </Button>
                      )}
                      {canApproveReject && booking.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CheckIcon />}
                            onClick={() => handleOpenActionDialog('approve', booking.id)}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              borderColor: mode === 'dark' ? 'rgba(67, 233, 123, 0.5)' : '#43e97b',
                              color: '#43e97b',
                              '&:hover': {
                                borderColor: '#43e97b',
                                background: 'rgba(67, 233, 123, 0.1)',
                              },
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            onClick={() => handleOpenActionDialog('reject', booking.id)}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              borderColor: mode === 'dark' ? 'rgba(245, 87, 108, 0.5)' : '#f5576c',
                              color: '#f5576c',
                              '&:hover': {
                                borderColor: '#f5576c',
                                background: 'rgba(245, 87, 108, 0.1)',
                              },
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {canCancel(booking) && ['pending', 'approved'].includes(booking.status) && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => handleOpenActionDialog('cancel', booking.id)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            borderColor: mode === 'dark' ? 'rgba(251, 191, 36, 0.5)' : '#fbbf24',
                            color: '#fbbf24',
                            '&:hover': {
                              borderColor: '#fbbf24',
                              background: 'rgba(251, 191, 36, 0.1)',
                            },
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))
        )}
      </Grid>

      <Card component="div" sx={{ display: 'none' }}>
      </Card>

      {/* Action Dialog */}
      <Dialog 
        open={actionDialog.open} 
        onClose={handleCloseActionDialog}
        PaperProps={{
          sx: {
            ...glassStyle,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {actionDialog.type === 'approve' && 'Approve Booking'}
          {actionDialog.type === 'reject' && 'Reject Booking'}
          {actionDialog.type === 'cancel' && 'Cancel Booking'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.type === 'approve' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Approval Notes (Optional)"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                },
              }}
            />
          )}
          {actionDialog.type === 'reject' && (
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              label="Rejection Reason"
              value={actionInput}
              onChange={(e) => setActionInput(e.target.value)}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                },
              }}
            />
          )}
          {actionDialog.type === 'cancel' && (
            <Typography sx={{ mt: 2 }}>
              Are you sure you want to cancel this booking?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseActionDialog} sx={{ borderRadius: '8px', textTransform: 'none' }}>Cancel</Button>
          <Button 
            onClick={handleAction} 
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog 
        open={qrDialog.open} 
        onClose={handleCloseQR} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: glassStyle,
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <QrCodeIcon sx={{ color: '#667eea' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Booking QR Code
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseQR}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {qrDialog.booking && (
            <Box textAlign="center">
              <Box sx={{ 
                p: 3, 
                mb: 2, 
                borderRadius: '16px',
                background: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              }}>
                <img
                  src={qrDialog.qrCode}
                  alt="Booking QR Code"
                  style={{ width: '100%', maxWidth: 300, height: 'auto', borderRadius: '12px' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Resource:</strong> {qrDialog.booking.resource?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Date:</strong> {format(new Date(qrDialog.booking.start_time), 'MMM dd, yyyy HH:mm')}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 2, fontStyle: 'italic' }}>
                Show this QR code at the resource location to check in
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseQR}
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Bookings;
