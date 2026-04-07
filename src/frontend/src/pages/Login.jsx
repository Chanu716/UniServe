import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Fade,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { mode } = useThemeStore();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        const response = await authAPI.login(values);
        setAuth(response.data.user, response.data.token);
        toast.success('Login successful!');
        navigate('/dashboard');
      } catch (err) {
        const message = err.response?.data?.message || 'Login failed';
        setError(message);
        toast.error(message);
      }
    },
  });

  const glassStyle = {
    background: 'linear-gradient(160deg, rgba(7, 12, 20, 0.82) 0%, rgba(12, 20, 32, 0.68) 55%, rgba(8, 14, 24, 0.76) 100%)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(130, 181, 255, 0.12)',
    borderRadius: '28px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.48)',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        p: 2,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Fade in timeout={800}>
          <Card sx={{ ...glassStyle, p: 5 }}>
            {/* Logo/Avatar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #7ec8ff 0%, #57f0d1 100%)',
                  boxShadow: '0 10px 30px rgba(87, 240, 209, 0.18)',
                }}
              >
                <LoginIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>

            {/* Title */}
            <Typography 
              component="h1" 
              variant="h4" 
              align="center" 
              fontWeight="bold"
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #7ec8ff 0%, #57f0d1 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              UniServe
            </Typography>
            <Typography 
              component="h2" 
              variant="body1" 
              align="center" 
              color="text.secondary" 
              gutterBottom
              sx={{ mb: 4, maxWidth: 320, mx: 'auto' }}
            >
              Sign in to manage bookings, resources, and campus operations.
            </Typography>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2, 
                  mb: 2,
                  background: mode === 'dark' ? 'rgba(245, 87, 108, 0.1)' : 'rgba(245, 87, 108, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '14px',
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '14px',
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={formik.isSubmitting}
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #7ec8ff 0%, #57f0d1 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  color: '#05131f',
                  boxShadow: '0 10px 28px rgba(87, 240, 209, 0.24)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #57f0d1 0%, #7ec8ff 100%)',
                    boxShadow: '0 12px 32px rgba(87, 240, 209, 0.3)',
                  },
                }}
              >
                Sign In
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link 
                  component={RouterLink} 
                  to="/register" 
                  variant="body2"
                  sx={{
                    color: '#7ec8ff',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Don't have an account? Sign Up
                </Link>
              </Box>
            </Box>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}

export default Login;
