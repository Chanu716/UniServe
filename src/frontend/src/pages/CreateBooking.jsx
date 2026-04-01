import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
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
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { bookingAPI, resourceAPI } from '../services/api';
import { useThemeStore } from '../store/themeStore';

const steps = ['Search Resources', 'Select Resource', 'Booking Details'];

const validationSchema = Yup.object({
  start_time: Yup.date().required('Start time is required').min(new Date(), 'Start time must be in the future'),
  end_time: Yup.date().required('End time is required').min(Yup.ref('start_time'), 'End time must be after start time'),
  purpose: Yup.string().required('Purpose is required'),
  attendees_count: Yup.number().nullable().transform((value) => (Number.isNaN(value) ? null : value)).min(1, 'Must be at least 1'),
});

function CreateBooking() {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const [activeStep, setActiveStep] = useState(0);
  const [availableResources, setAvailableResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [conflictAlternatives, setConflictAlternatives] = useState([]);
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
        await bookingAPI.create({
          resource_id: selectedResource._id,
          ...values,
        });
        toast.success('Booking request submitted successfully');
        navigate('/bookings');
      } catch (error) {
        if (error.response?.status === 409) {
          setConflictAlternatives(error.response?.data?.data?.alternatives || []);
          toast.warning('Booking conflict detected. Pick an alternative below.');
          return;
        }

        toast.error(error.response?.data?.message || 'Failed to create booking');
      }
    },
  });

  const handleSearchResources = async () => {
    try {
      if (!searchParams.start_time || !searchParams.end_time) {
        toast.error('Please select start and end time');
        return;
      }

      const response = await bookingAPI.searchAvailable(searchParams);
      const resources = response.data.available_resources || [];
      setAvailableResources(resources);

      formik.setFieldValue('start_time', searchParams.start_time);
      formik.setFieldValue('end_time', searchParams.end_time);

      setActiveStep(1);

      if (!resources.length) {
        toast.info('No resources available for selected slot');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to search available resources');
    }
  };

  const handleSelectAlternative = async (alternative) => {
    try {
      if (alternative.type === 'alternative_resource' && alternative.resource_id) {
        const response = await resourceAPI.getById(alternative.resource_id);
        setSelectedResource(response.data.resource);
        setActiveStep(2);
      }

      if (alternative.type === 'alternative_time') {
        formik.setFieldValue('start_time', alternative.start_time);
        formik.setFieldValue('end_time', alternative.end_time);
        setSearchParams((prev) => ({
          ...prev,
          start_time: alternative.start_time,
          end_time: alternative.end_time,
        }));
      }

      setConflictAlternatives([]);
      toast.info('Alternative applied');
    } catch {
      toast.error('Failed to apply alternative');
    }
  };

  const glassStyle = {
    background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Create New Booking
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Search availability, pick a resource, and submit booking details.
      </Typography>

      <Card sx={{ ...glassStyle, p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {!!conflictAlternatives.length && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Conflict found. Select one of these alternatives:
            </Typography>
            <Grid container spacing={1}>
              {conflictAlternatives.map((alternative, index) => (
                <Grid item xs={12} md={6} key={`${alternative.type}-${index}`}>
                  <Card
                    sx={{ p: 1.5, cursor: 'pointer' }}
                    onClick={() => handleSelectAlternative(alternative)}
                  >
                    {alternative.type === 'alternative_resource' && (
                      <>
                        <Typography variant="body2" fontWeight="bold">{alternative.resource_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {alternative.location} | Capacity {alternative.capacity}
                        </Typography>
                      </>
                    )}
                    {alternative.type === 'alternative_time' && (
                      <>
                        <Typography variant="body2" fontWeight="bold">Same resource, different time</Typography>
                        <Chip
                          size="small"
                          label={`${format(new Date(alternative.start_time), 'MMM dd HH:mm')} - ${format(new Date(alternative.end_time), 'HH:mm')}`}
                        />
                      </>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Alert>
        )}

        {activeStep === 0 && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Start Time"
                  InputLabelProps={{ shrink: true }}
                  value={searchParams.start_time}
                  onChange={(e) => setSearchParams({ ...searchParams, start_time: e.target.value })}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Type"
                  value={searchParams.type}
                  onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="classroom">Classroom</MenuItem>
                  <MenuItem value="laboratory">Laboratory</MenuItem>
                  <MenuItem value="seminar_hall">Seminar Hall</MenuItem>
                  <MenuItem value="auditorium">Auditorium</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Capacity"
                  value={searchParams.capacity_min}
                  onChange={(e) => setSearchParams({ ...searchParams, capacity_min: e.target.value })}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="contained" onClick={handleSearchResources}>
                Search Resources
              </Button>
            </Box>
          </>
        )}

        {activeStep === 1 && (
          <>
            <Grid container spacing={2}>
              {availableResources.map((resource) => (
                <Grid item xs={12} md={4} key={resource._id}>
                  <Card
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedResource?._id === resource._id ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.12)',
                    }}
                    onClick={() => {
                      setSelectedResource(resource);
                      setActiveStep(2);
                    }}
                  >
                    <Typography fontWeight="bold">{resource.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {resource.type} | {resource.location || 'N/A'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip size="small" label={`Capacity: ${resource.capacity || 'N/A'}`} />
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Button onClick={() => setActiveStep(0)}>Back</Button>
            </Box>
          </>
        )}

        {activeStep === 2 && (
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Selected Resource: {selectedResource?.name}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
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
                  label="Attendees Count"
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
                  label="Special Requirements"
                  value={formik.values.special_requirements}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setActiveStep(1)}>Back</Button>
              <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                Submit Booking
              </Button>
            </Box>
          </Box>
        )}

        {activeStep > 0 && activeStep < 2 && <Divider sx={{ mt: 2 }} />}
      </Card>
    </Box>
  );
}

export default CreateBooking;
