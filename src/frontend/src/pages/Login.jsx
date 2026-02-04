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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <LoginIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>

            {/* Title */}
            <Typography 
              component="h1" 
              variant="h3" 
              align="center" 
              fontWeight="bold"
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              UniServe
            </Typography>
            <Typography 
              component="h2" 
              variant="h6" 
              align="center" 
              color="text.secondary" 
              gutterBottom
              sx={{ mb: 4 }}
            >
              Welcome Back! 👋
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
                    background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
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
                    background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
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
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.6)',
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
                    color: mode === 'dark' ? '#667eea' : '#764ba2',
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
