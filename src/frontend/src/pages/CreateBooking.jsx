import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Chip,
  Divider,
  Fade,
  Grow,
  InputAdornment,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';
import { useThemeStore } from '../store/themeStore';

const steps = ['Search Resources', 'Select Resource', 'Booking Details'];

const validationSchema = Yup.object({
  start_time: Yup.date().required('Start time is required').min(new Date(), 'Start time must be in the future'),
  end_time: Yup.date().required('End time is required').min(Yup.ref('start_time'), 'End time must be after start time'),
  purpose: Yup.string().required('Purpose is required'),
  attendees_count: Yup.number().min(1, 'Must be at least 1'),
});

function CreateBooking() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const [activeStep, setActiveStep] = useState(0);
  const [availableResources, setAvailableResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [conflictAlternatives, setConflictAlternatives] = useState(null);
  const [searchParams, setSearchParams] = useState({
    start_time: '',
    end_time: '',
    type: '',
    capacity_min: '',
  });

  const formik = useFormik({
    initialValues: {
      start_time: '',
      end_time: '',
      purpose: '',
      attendees_count: '',
      special_requirements: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await bookingAPI.create({
          resource_id: selectedResource.id,
          ...values,
        });
        
        // Check if there's a conflict with suggested alternatives
        if (response.data.conflict && response.data.suggested_alternatives) {
          setConflictAlternatives(response.data.suggested_alternatives);
          toast.warning('Resource is not available. See suggested alternatives below.');
        } else {
          toast.success('Booking request submitted successfully!');
          navigate('/bookings');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to create booking');
      }
    },
  });

  const handleSelectAlternative = (alternative) => {
    if (alternative.alternative_resource) {
      setSelectedResource(alternative.alternative_resource);
      toast.info(`Switched to ${alternative.alternative_resource.name}`);
    } else if (alternative.alternative_time_slots && alternative.alternative_time_slots.length > 0) {
      const slot = alternative.alternative_time_slots[0];
      formik.setFieldValue('start_time', slot.start_time);
      formik.setFieldValue('end_time', slot.end_time);
      toast.info('Time slot updated');
    }
    setConflictAlternatives(null);
  };

  const handleSearchResources = async () => {
    try {
      if (!searchParams.start_time || !searchParams.end_time) {
        toast.error('Please select start and end time');
        return;
      }

      const response = await bookingAPI.searchAvailable(searchParams);
      setAvailableResources(response.data.available_resources);
      
      // Populate form with search times
      formik.setFieldValue('start_time', searchParams.start_time);
      formik.setFieldValue('end_time', searchParams.end_time);
      
      setActiveStep(1);
      
      if (response.data.available_resources.length === 0) {
        toast.info('No resources available for the selected time');
      }
    } catch (error) {
      toast.error('Failed to search resources');
    }
  };

  const handleSelectResource = (resource) => {
    setSelectedResource(resource);
    setActiveStep(2);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

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
            ➕ Create New Booking
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search for available resources and create a booking request
          </Typography>
        </Box>
      </Fade>

      <Fade in timeout={800}>
        <Card sx={{ ...glassStyle, p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Conflict Alternatives Alert */}
        {conflictAlternatives && (
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Resource Not Available
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              The selected resource is already booked for this time. Here are some alternatives:
            </Typography>
            
            <Grid container spacing={2}>
              {conflictAlternatives.map((alternative, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: `2px solid ${theme.palette.warning.main}`,
                      '&:hover': {
                        boxShadow: 4,
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                    onClick={() => handleSelectAlternative(alternative)}
                  >
                    <CardContent>
                      {alternative.alternative_resource && (
                        <>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            {alternative.alternative_resource.name}
                          </Typography>
                          <Chip 
                            label={alternative.alternative_resource.type} 
                            size="small" 
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Capacity: {alternative.alternative_resource.capacity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Location: {alternative.alternative_resource.location}
                          </Typography>
                        </>
                      )}
                      
                      {alternative.alternative_time_slots && alternative.alternative_time_slots.length > 0 && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            Alternative Time Slots:
                          </Typography>
                          {alternative.alternative_time_slots.slice(0, 2).map((slot, idx) => (
                            <Chip
                              key={idx}
                              label={`${format(new Date(slot.start_time), 'HH:mm')} - ${format(new Date(slot.end_time), 'HH:mm')}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </>
                      )}
                      
                      <Typography 
                        variant="caption" 
                        display="block" 
                        sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}
                      >
                        Click to use this alternative
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Alert>
        )}

        {/* Step 0: Search Resources */}
        {activeStep === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Start Time"
                  InputLabelProps={{ shrink: true }}
                  value={searchParams.start_time}
                  onChange={(e) => setSearchParams({ ...searchParams, start_time: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ScheduleIcon />
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
                  fullWidth
                  type="datetime-local"
                  label="End Time"
                  InputLabelProps={{ shrink: true }}
                  value={searchParams.end_time}
                  onChange={(e) => setSearchParams({ ...searchParams, end_time: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ScheduleIcon />
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
                  fullWidth
                  select
                  label="Resource Type (Optional)"
                  value={searchParams.type}
                  onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                    },
                  }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="classroom">Classroom</MenuItem>
                  <MenuItem value="laboratory">Laboratory</MenuItem>
                  <MenuItem value="seminar_hall">Seminar Hall</MenuItem>
                  <MenuItem value="auditorium">Auditorium</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Capacity (Optional)"
                  value={searchParams.capacity_min}
                  onChange={(e) => setSearchParams({ ...searchParams, capacity_min: e.target.value })}
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
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={handleSearchResources}
                startIcon={<SearchIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                }}
              >
                Search Resources
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 1: Select Resource */}
        {activeStep === 1 && (
          <Box>
            {availableResources.length === 0 ? (
              <Typography textAlign="center" py={4} color="text.secondary">
                No resources available
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {availableResources.map((resource, index) => (
                  <Grid item xs={12} sm={6} md={4} key={resource.id}>
                    <Grow in timeout={600 + index * 100}>
                      <Card
                        sx={{
                          ...glassStyle,
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: selectedResource?.id === resource.id ? '2px solid #667eea' : glassStyle.border,
                          '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: mode === 'dark'
                              ? '0 12px 40px 0 rgba(0, 0, 0, 0.5)'
                              : '0 12px 40px 0 rgba(31, 38, 135, 0.25)',
                          },
                        }}
                        onClick={() => handleSelectResource(resource)}
                      >
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {resource.name}
                        </Typography>
                        <Chip 
                          label={resource.type.replace('_', ' ').toUpperCase()} 
                          size="small"
                          sx={{ mb: 1, background: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Capacity: {resource.capacity || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Location: {resource.location || 'N/A'}
                        </Typography>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            )}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                onClick={handleBack}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                Back
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Booking Details */}
        {activeStep === 2 && (
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Booking Details
            </Typography>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Selected Resource: {selectedResource?.name}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={3}
                  name="purpose"
                  label="Purpose"
                  value={formik.values.purpose}
                  onChange={formik.handleChange}
                  error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                  helperText={formik.touched.purpose && formik.errors.purpose}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="attendees_count"
                  label="Number of Attendees"
                  value={formik.values.attendees_count}
                  onChange={formik.handleChange}
                  error={formik.touched.attendees_count && Boolean(formik.errors.attendees_count)}
                  helperText={formik.touched.attendees_count && formik.errors.attendees_count}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  name="special_requirements"
                  label="Special Requirements (Optional)"
                  value={formik.values.special_requirements}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button type="submit" variant="contained">
                Submit Booking
              </Button>
            </Box>
          </Box>
        )}
        </Card>
      </Fade>
    </Box>
  );
}

export default CreateBooking;
