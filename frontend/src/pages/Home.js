import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Chip,
  Card,
  IconButton,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  Grid,
  CardMedia,
  Alert,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import api from '../services/api';

const PageContainer = styled('div')({
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  position: 'relative',
  zIndex: 1,
});

const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #dadce0',
    fontSize: '16px',
    fontFamily: 'system-ui, sans-serif',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: '#fff',
      boxShadow: '0 1px 6px rgba(32,33,36,.28)',
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      boxShadow: '0 1px 6px rgba(32,33,36,.28)',
    },
  },
});

const SearchButton = styled(Button)({
  borderRadius: '24px',
  textTransform: 'none',
  fontWeight: 500,
  padding: '10px 24px',
  backgroundColor: '#202124',
  color: 'white',
  fontSize: '14px',
  fontFamily: 'system-ui, sans-serif',
  '&:hover': {
    backgroundColor: '#333333',
  },
  '&:disabled': {
    backgroundColor: '#f8f9fa',
    color: '#9aa0a6',
  },
});

const OptionsButton = styled(IconButton)({
  backgroundColor: '#f8f9fa',
  border: '1px solid #dadce0',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  '&:hover': {
    backgroundColor: '#e8eaed',
  },
});

const StyledLinearProgress = styled(LinearProgress)({
  height: '8px',
  borderRadius: '4px',
  backgroundColor: '#e8eaed',
  '& .MuiLinearProgress-bar': {
    borderRadius: '4px',
    backgroundColor: '#202124',
  },
});

const ImageCard = styled(Card)(({ score, isAnalyzed }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  backgroundColor: isAnalyzed 
    ? score >= 7 ? '#f0f8f0' 
    : score >= 5 ? '#fef8f0' 
    : '#fef0f0'
    : '#ffffff',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
  },
}));

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [guidelines, setGuidelines] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imageCount, setImageCount] = useState('20');
  const [provider, setProvider] = useState('unsplash');
  const [isSearching, setIsSearching] = useState(false);
  const [images, setImages] = useState([]);
  const [analyzedImages, setAnalyzedImages] = useState(new Map());
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newGuidelines = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file: file,
    }));
    setGuidelines(prev => [...prev, ...newGuidelines]);
    setError('');
  };

  const removeGuideline = (id) => {
    setGuidelines(prev => prev.filter(g => g.id !== id));
  };

  const startProcess = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    if (guidelines.length === 0) {
      setError('Please upload brand guidelines before starting');
      return;
    }

    setError('');
    setIsSearching(true);
    setImages([]);
    setAnalyzedImages(new Map());
    setProgress(0);
    setProgressMessage('Starting...');
    
    try {
      setProgressMessage('Uploading guidelines...');
      setProgress(10);
      const formData = new FormData();
      formData.append('file', guidelines[0].file);
      const uploadResponse = await api.uploadGuideline(formData);
      const guidelinePath = uploadResponse.file_path;

      setProgressMessage('Starting image download...');
      setProgress(20);
      const response = await api.downloadImages({
        query: searchQuery,
        provider: provider,
        limit: parseInt(imageCount)
      });

      setCurrentJobId(response.job_id);

      const ws = new WebSocket(`ws://localhost:8000/ws/${response.job_id}`);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.status === 'downloading') {
          setProgress(20 + (data.progress * 0.5));
          setProgressMessage(`Downloading images... ${data.progress}%`);
        }
        else if (data.status === 'completed' && data.result && data.result.images) {
          setImages(data.result.images);
          setProgress(70);
          setProgressMessage('Images downloaded! Starting analysis...');
          
          setTimeout(() => {
            startAnalysis(response.job_id, guidelinePath);
          }, 1000);
        } 
        else if (data.status === 'analyzing') {
          setProgress(70 + (data.progress * 0.3));
          setProgressMessage(`Analyzing images... ${data.progress}%`);
        }
        else if (data.status === 'completed' && data.result && data.result.ratings) {
          const scoreMap = new Map();
          data.result.ratings.forEach(rating => {
            scoreMap.set(rating.filename, rating.score);
          });
          setAnalyzedImages(scoreMap);
          
          setImages(prevImages => {
            const sortedImages = [...prevImages].sort((a, b) => {
              const aScore = scoreMap.get(a.filename) || 0;
              const bScore = scoreMap.get(b.filename) || 0;
              return bScore - aScore;
            });
            return sortedImages;
          });
          
          setProgress(100);
          setProgressMessage('Analysis complete!');
        }
      };

    } catch (error) {
      console.error('Error starting process:', error);
      setError('Failed to start process. Please try again.');
      setIsSearching(false);
    }
  };

  const startAnalysis = async (jobId, guidelinePath) => {
    try {
      await api.analyzeImages({
        job_id: jobId,
        guideline_path: guidelinePath
      });
    } catch (error) {
      console.error('Error starting analysis:', error);
      setError('Analysis failed. Please try again.');
    }
  };

  return (
    <PageContainer>
      {!isSearching && (
        <Box textAlign="center" pt={8} pb={6}>
          <Typography 
            variant="h1" 
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 400,
              color: '#202124',
              fontFamily: 'system-ui, sans-serif',
              mb: 2,
            }}
          >
            Surrogates AI Images
          </Typography>
          <Typography 
            variant="h5" 
            sx={{
              color: '#5f6368',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 400,
            }}
          >
            Brand Guidelines Image Analyzer
          </Typography>
        </Box>
      )}

      <Container maxWidth="lg">
        <Box
          sx={{
            position: isSearching ? 'fixed' : 'relative',
            top: isSearching ? '24px' : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '600px',
            zIndex: 1000,
            transition: 'all 0.3s ease',
          }}
        >
          <Box 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: '24px',
              p: 3,
              boxShadow: isSearching ? '0 2px 5px 1px rgba(64,60,67,.16)' : 'none',
              border: isSearching ? 'none' : '1px solid #dadce0'
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <SearchField
                fullWidth
                placeholder="Search for images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#9aa0a6' }} />
                    </InputAdornment>
                  ),
                }}
              />
              
              <input
                type="file"
                multiple
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <OptionsButton component="span">
                  <UploadFileIcon sx={{ fontSize: '20px', color: '#5f6368' }} />
                </OptionsButton>
              </label>
              
              <OptionsButton onClick={() => setShowAdvanced(!showAdvanced)}>
                <SettingsIcon sx={{ fontSize: '20px', color: '#5f6368' }} />
              </OptionsButton>
            </Box>

            {guidelines.length > 0 && (
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                {guidelines.map((guideline) => (
                  <Chip
                    key={guideline.id}
                    label={`Guidelines: ${guideline.name}`}
                    onDelete={() => removeGuideline(guideline.id)}
                    sx={{
                      backgroundColor: '#f0f0f0',
                      color: '#202124',
                      fontFamily: 'system-ui, sans-serif',
                      '& .MuiChip-deleteIcon': { color: '#202124' }
                    }}
                  />
                ))}
              </Box>
            )}

            <Collapse in={showAdvanced}>
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  size="small"
                  label="Number of images"
                  value={imageCount}
                  onChange={(e) => setImageCount(e.target.value)}
                  sx={{ minWidth: 140 }}
                />
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Provider</InputLabel>
                  <Select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    label="Provider"
                  >
                    <MenuItem value="unsplash">Unsplash</MenuItem>
                    <MenuItem value="pexels">Pexels</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Collapse>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {isSearching && (
              <Box mb={2}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#5f6368',
                    fontFamily: 'system-ui, sans-serif',
                    mb: 1
                  }}
                >
                  {progressMessage}
                </Typography>
                <StyledLinearProgress 
                  variant="determinate" 
                  value={progress}
                />
              </Box>
            )}

            <SearchButton
              fullWidth
              onClick={startProcess}
              disabled={isSearching}
              startIcon={<PlayArrowIcon />}
            >
              {isSearching ? 'Processing...' : 'Start Process'}
            </SearchButton>
          </Box>
        </Box>

        <Box mt={isSearching ? 20 : 8}>
          <Grid container spacing={2}>
            {images.map((image, index) => {
              const score = analyzedImages.get(image.filename);
              const isAnalyzed = score !== undefined;
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.filename}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                  >
                    <ImageCard 
                      score={score}
                      isAnalyzed={isAnalyzed}
                      onClick={() => setSelectedImage(image)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={`http://localhost:8000/api/image/${encodeURIComponent(currentJobId)}/${encodeURIComponent(image.filename)}`}
                        alt={image.description}
                      />
                      
                      {isAnalyzed && (
                        <Box
                          position="absolute"
                          top={12}
                          right={12}
                          sx={{
                            backgroundColor: '#202124',
                            color: 'white',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontWeight: 700,
                            fontSize: '18px',
                            fontFamily: 'system-ui, sans-serif',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            minWidth: '45px',
                            textAlign: 'center',
                          }}
                        >
                          {score}
                        </Box>
                      )}
                    </ImageCard>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Container>

      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 1,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {selectedImage && (
            <img
              src={`http://localhost:8000/api/image/${encodeURIComponent(currentJobId)}/${encodeURIComponent(selectedImage.filename)}`}
              alt={selectedImage.description}
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Home;
