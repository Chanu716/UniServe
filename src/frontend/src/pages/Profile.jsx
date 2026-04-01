import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  Fade,
  Grow,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const profileValidationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone: Yup.string(),
  department: Yup.string(),
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

function Profile() {
  const { user, updateUser } = useAuthStore();
  const { mode } = useThemeStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      department: user?.department || '',
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        const response = await authAPI.updateProfile(values);
        updateUser(response.data.user);
        toast.success('Profile updated successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await authAPI.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success('Password changed successfully');
        resetForm();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to change password');
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
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            My Profile 👤
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>
      </Fade>

      {/* Profile Header Card */}
      <Fade in timeout={800}>
        <Card sx={{ ...glassStyle, p: 4, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {user?.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<EmailIcon />}
                  label={user?.email}
                  sx={{
                    background: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<BadgeIcon />}
                  label={user?.role?.toUpperCase()}
                  sx={{
                    background: mode === 'dark' ? 'rgba(67, 233, 123, 0.1)' : 'rgba(67, 233, 123, 0.1)',
                    color: '#43e97b',
                    fontWeight: 600,
                  }}
                />
                {user?.department && (
                  <Chip
                    icon={<BusinessIcon />}
                    label={user.department}
                    sx={{
                      background: mode === 'dark' ? 'rgba(79, 172, 254, 0.1)' : 'rgba(79, 172, 254, 0.1)',
                      color: '#4facfe',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1000}>
            <Card sx={{ ...glassStyle, p: 4, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  Personal Information
                </Typography>
              </Box>
              <Box component="form" onSubmit={profileFormik.handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  value={user?.email}
                  disabled
                  helperText="Email cannot be changed"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                      borderRadius: '12px',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Role"
                  value={user?.role?.toUpperCase()}
                  disabled
                  helperText="Role cannot be changed"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
                      borderRadius: '12px',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  name="name"
                  label="Name"
                  value={profileFormik.values.name}
                  onChange={profileFormik.handleChange}
                  error={profileFormik.touched.name && Boolean(profileFormik.errors.name)}
                  helperText={profileFormik.touched.name && profileFormik.errors.name}
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
                <TextField
                  fullWidth
                  margin="normal"
                  name="department"
                  label="Department"
                  value={profileFormik.values.department}
                  onChange={profileFormik.handleChange}
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
                <TextField
                  fullWidth
                  margin="normal"
                  name="phone"
                  label="Phone"
                  value={profileFormik.values.phone}
                  onChange={profileFormik.handleChange}
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
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={profileFormik.isSubmitting}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                      boxShadow: '0 6px 20px 0 rgba(102, 126, 234, 0.6)',
                    },
                  }}
                >
                  Update Profile
                </Button>
              </Box>
            </Card>
          </Grow>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Grow in timeout={1200}>
            <Card sx={{ ...glassStyle, p: 4, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight="bold">
                  Change Password
                </Typography>
              </Box>
              <Box component="form" onSubmit={passwordFormik.handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  label="Current Password"
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                  helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
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
                <TextField
                  fullWidth
                  margin="normal"
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  label="New Password"
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
                <TextField
                  fullWidth
                  margin="normal"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  label="Confirm New Password"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                  startIcon={<SaveIcon />}
                  disabled={passwordFormik.isSubmitting}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: '0 4px 15px 0 rgba(245, 87, 108, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                      boxShadow: '0 6px 20px 0 rgba(245, 87, 108, 0.6)',
                    },
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Profile;
