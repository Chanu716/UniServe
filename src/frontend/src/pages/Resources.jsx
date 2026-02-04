import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Fade,
  Grow,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MeetingRoom as RoomIcon,
  Science as LabIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Build as EquipmentIcon,
  CheckCircle as AvailableIcon,
  Cancel as UnavailableIcon,
} from '@mui/icons-material';
import { resourceAPI } from '../services/api';
import { useThemeStore } from '../store/themeStore';

const resourceTypes = [
  { value: '', label: 'All Types' },
  { value: 'classroom', label: 'Classroom', icon: <RoomIcon /> },
  { value: 'laboratory', label: 'Laboratory', icon: <LabIcon /> },
  { value: 'seminar_hall', label: 'Seminar Hall', icon: <SchoolIcon /> },
  { value: 'auditorium', label: 'Auditorium', icon: <EventIcon /> },
  { value: 'equipment', label: 'Equipment', icon: <EquipmentIcon /> },
];

const getResourceIcon = (type) => {
  const resourceType = resourceTypes.find(r => r.value === type);
  return resourceType?.icon || <RoomIcon />;
};

function Resources() {
  const { mode } = useThemeStore();
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    search: '',
  });

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      
      const response = await resourceAPI.getAll({ ...params, limit: 100 });
      let filteredResources = response.data.resources;
      
      if (filters.search) {
        filteredResources = filteredResources.filter(r =>
          r.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.location?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setResources(filteredResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
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
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Available Resources 🏢
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and filter all available campus resources
          </Typography>
        </Box>
      </Fade>

      {/* Filters */}
      <Fade in timeout={800}>
        <Card sx={{ ...glassStyle, p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Filters
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name or location"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
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
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Type"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                  },
                }}
              >
                {resourceTypes.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Card>
      </Fade>

      {/* Resources Grid */}
      <Grid container spacing={3}>
        {resources.length === 0 ? (
          <Grid item xs={12}>
            <Fade in timeout={1000}>
              <Card sx={{ ...glassStyle, p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No resources found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your filters
                </Typography>
              </Card>
            </Fade>
          </Grid>
        ) : (
          resources.map((resource, index) => (
            <Grid item xs={12} sm={6} lg={4} key={resource.id}>
              <Grow in timeout={600 + (index % 9) * 100}>
                <Card
                  sx={{
                    ...glassStyle,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
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
                      background: resource.is_available
                        ? 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 87, 108, 0.1) 0%, rgba(240, 147, 251, 0.1) 100%)',
                      borderRadius: '0 0 0 100%',
                    }}
                  />
                  
                  <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                    {/* Icon and Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '15px',
                          background: mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                        }}
                      >
                        {getResourceIcon(resource.type)}
                      </Box>
                      <Chip
                        icon={resource.is_available ? <AvailableIcon /> : <UnavailableIcon />}
                        label={resource.is_available ? 'Available' : 'Unavailable'}
                        size="small"
                        sx={{
                          background: resource.is_available
                            ? 'rgba(67, 233, 123, 0.1)'
                            : 'rgba(245, 87, 108, 0.1)',
                          color: resource.is_available ? '#43e97b' : '#f5576c',
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>

                    {/* Resource Name */}
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {resource.name}
                    </Typography>

                    {/* Type Chip */}
                    <Chip
                      label={resource.type.replace('_', ' ').toUpperCase()}
                      size="small"
                      sx={{
                        mb: 2,
                        background: mode === 'dark' ? 'rgba(79, 172, 254, 0.1)' : 'rgba(79, 172, 254, 0.1)',
                        color: '#4facfe',
                        fontWeight: 'bold',
                      }}
                    />

                    {/* Details */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Capacity
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {resource.capacity || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Building
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {resource.building || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary">
                            Location
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {resource.location || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

export default Resources;
