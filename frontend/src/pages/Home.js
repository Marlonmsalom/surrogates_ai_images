import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Alert,
  LinearProgress,
  Chip,
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ImageUpload from '../components/ImageUpload';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('unsplash');
  const [limit, setLimit] = useState(20);
  const [guidelineFile, setGuidelineFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    if (!guidelineFile) {
      setError('Please upload a brand guidelines PDF');
      return;
    }

    try {
      setError(null);
      setUploading(true);

      const uploadResponse = await api.uploadGuideline(guidelineFile.file);
      
      const downloadResponse = await api.downloadImages({
        query: query.trim(),
        provider,
        limit
      });

      navigate(`/analysis/${downloadResponse.job_id}?guideline=${uploadResponse.file_path}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const suggestedTags = [
    'minimalist design',
    'luxury brand',
    'modern architecture',
    'natural lighting',
    'product photography',
    'lifestyle imagery'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        sx={{
          maxWidth: 800,
          mx: 'auto',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h3" gutterBottom>
              Analyze Your Brand Images
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload your brand guidelines and search for images to find the perfect match
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {uploading && (
            <Box mb={3}>
              <LinearProgress sx={{ borderRadius: 2, height: 8 }} />
              <Typography variant="body2" textAlign="center" mt={1}>
                Processing your request...
              </Typography>
            </Box>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ImageUpload
                onFileSelect={setGuidelineFile}
                disabled={uploading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search Query"
                placeholder="e.g., coca cola, machu picchu, minimalist design..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={uploading}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
              />
              
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Suggested tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {suggestedTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onClick={() => setQuery(tag)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'white',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={uploading}>
                <InputLabel>Image Provider</InputLabel>
                <Select
                  value={provider}
                  label="Image Provider"
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <MenuItem value="unsplash">Unsplash</MenuItem>
                  <MenuItem value="pexels">Pexels</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography gutterBottom>
                Number of Images: {limit}
              </Typography>
              <Slider
                value={limit}
                onChange={(e, newValue) => setLimit(newValue)}
                min={5}
                max={50}
                step={5}
                marks
                disabled={uploading}
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={uploading || !query.trim() || !guidelineFile}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                  },
                }}
              >
                {uploading ? 'Processing...' : 'Start Analysis'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Home;
