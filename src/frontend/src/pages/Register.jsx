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
  MenuItem,
  Fade,
  Avatar,
  InputAdornment,
  IconButton,
  Grid,
} from '@mui/material';
import {
  PersonAdd as RegisterIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
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
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: Yup.string().required('Role is required'),
  department: Yup.string(),
  phone: Yup.string(),
});

const roles = [
  { value: 'student', label: 'Student', icon: <PersonIcon /> },
  { value: 'faculty', label: 'Faculty', icon: <BadgeIcon /> },
  { value: 'coordinator', label: 'Coordinator', icon: <BadgeIcon /> },
];

function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { mode } = useThemeStore();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
      department: '',
      phone: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        const response = await authAPI.register(values);
        setAuth(response.data.user, response.data.token);
        toast.success('Registration successful!');
        navigate('/dashboard');
      } catch (err) {
        const message = err.response?.data?.message || 'Registration failed';
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
          : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)',
        p: 2,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Fade in timeout={800}>
          <Card sx={{ ...glassStyle, p: 5 }}>
            {/* Logo/Avatar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                }}
              >
                <RegisterIcon sx={{ fontSize: 40 }} />
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
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
              Create Your Account 🎓
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
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    autoFocus
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
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
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
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
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    select
                    id="role"
                    label="Role"
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    error={formik.touched.role && Boolean(formik.errors.role)}
                    helperText={formik.touched.role && formik.errors.role}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                      },
                    }}
                  >
                    {roles.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {option.icon}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="department"
                    label="Department"
                    name="department"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
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
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
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
                </Grid>
              </Grid>

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
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 4px 15px 0 rgba(79, 172, 254, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                    boxShadow: '0 6px 20px 0 rgba(79, 172, 254, 0.6)',
                  },
                }}
              >
                Sign Up
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  variant="body2"
                  sx={{
                    color: mode === 'dark' ? '#4facfe' : '#00f2fe',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Already have an account? Sign In
                </Link>
              </Box>
            </Box>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}

export default Register;
