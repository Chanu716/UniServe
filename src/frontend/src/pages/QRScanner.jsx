import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fade,
  Grow,
} from '@mui/material';
import {
  QrCodeScanner as QrCodeScannerIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  CameraAlt as CameraAltIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useThemeStore } from '../store/themeStore';

function QRScanner() {
  const { mode } = useThemeStore();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const html5QrCodeRef = useRef(null);

  const startScanner = async () => {
    try {
      setError('');
      setResult(null);
      setScanning(true);

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      );
    } catch (err) {
      setError('Failed to start camera. Please ensure camera permissions are granted.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    setResult(decodedText);
    await stopScanner();
    await handleCheckIn(decodedText);
  };

  const onScanFailure = (error) => {
    // Ignore scan failures (they happen constantly while scanning)
  };

  const handleCheckIn = async (qrCode) => {
    try {
      setLoading(true);
      setError('');

      // QR code format: booking_<bookingId> or resource_<resourceId>
      const parts = qrCode.split('_');
      
      if (parts[0] !== 'booking') {
        throw new Error('Invalid QR code. This appears to be a resource QR code, not a booking.');
      }

      const bookingId = parts[1];
      const response = await api.post(`/bookings/${bookingId}/checkin`, { qr_code: qrCode });
      
      setBookingDetails(response.data.data);
      setCheckInSuccess(true);
      toast.success('Check-in successful!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to check in';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setCheckInSuccess(false);
    setBookingDetails(null);
    setResult(null);
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setCheckInSuccess(false);
    setBookingDetails(null);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

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
            📱 QR Code Check-In
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Scan booking QR codes to check in for your reservations
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={800}>
        <Card sx={{ ...glassStyle, maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {!scanning && !result && (
            <Box textAlign="center" py={4}>
              <QrCodeScannerIcon sx={{ fontSize: 120, color: '#667eea', mb: 3 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Ready to Scan
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Click the button below to activate your camera and scan a booking QR code
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<CameraAltIcon />}
                onClick={startScanner}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                }}
              >
                Start Scanner
              </Button>
            </Box>
          )}

          {scanning && (
            <Box>
              <Box
                id="qr-reader"
                sx={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  mb: 3,
                }}
              />
              <Box display="flex" justifyContent="center" gap={2}>
                <Button
                  variant="outlined"
                  onClick={stopScanner}
                  startIcon={<CloseIcon />}
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
                  Stop Scanner
                </Button>
              </Box>
            </Box>
          )}

          {loading && (
            <Box textAlign="center" py={4}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Checking in...
              </Typography>
            </Box>
          )}

          {error && result && (
            <Box textAlign="center" py={4}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  background: mode === 'dark' ? 'rgba(245, 87, 108, 0.1)' : 'rgba(245, 87, 108, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                }}
              >
                {error}
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Scanned: {result}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                Scan Again
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      </Fade>

      {/* Success Dialog */}
      <Dialog 
        open={checkInSuccess} 
        onClose={handleCloseSuccess}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: glassStyle,
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <CheckCircleIcon sx={{ fontSize: 40, color: '#43e97b' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Check-In Successful!
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseSuccess}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {bookingDetails && (
            <Box sx={{ 
              p: 3, 
              borderRadius: '16px',
              background: mode === 'dark' ? 'rgba(67, 233, 123, 0.1)' : 'rgba(67, 233, 123, 0.1)',
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {bookingDetails.resource?.name}
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" gap={1}>
                  <Chip 
                    label={bookingDetails.resource?.type} 
                    size="small"
                    sx={{ background: 'rgba(102, 126, 234, 0.2)', color: '#667eea', fontWeight: 600 }}
                  />
                  <Chip 
                    label={bookingDetails.status} 
                    size="small" 
                    sx={{ background: 'rgba(67, 233, 123, 0.2)', color: '#43e97b', fontWeight: 600 }}
                  />
                </Box>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date(bookingDetails.start_time).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {new Date(bookingDetails.start_time).toLocaleTimeString()} - {new Date(bookingDetails.end_time).toLocaleTimeString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Purpose:</strong> {bookingDetails.purpose}
                </Typography>
                <Typography variant="body2">
                  <strong>Checked in at:</strong> {new Date(bookingDetails.check_in_time).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseSuccess} 
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Instructions Card */}
      <Grow in timeout={1000}>
        <Card sx={{ ...glassStyle, maxWidth: 600, mx: 'auto', mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 0 }}>
                📋 How to Use
              </Typography>
            </Box>
            <Box component="ul" sx={{ pl: 2, '& li': { mb: 1 } }}>
              <li>
                <Typography variant="body2">
                  Click "Start Scanner" to activate your device camera
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Point the camera at your booking QR code
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  The system will automatically scan and check you in
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  You can check in up to 15 minutes before your booking start time
                </Typography>
              </li>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
}

export default QRScanner;
