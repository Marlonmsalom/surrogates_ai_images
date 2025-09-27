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
  Dialog,
  DialogContent,
  Grid,
  CardMedia,
  Alert,
  InputAdornment,
  LinearProgress,
  Fade,
  Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../services/api';

// Paleta moderna inspirada en Jeton
const colors = {
  primary: '#E91E63',         // Pink vibrante
  secondary: '#FF7043',       // Coral/naranja
  accent: '#F06292',          // Rosa más suave
  background: '#FFFFFF',      // Blanco puro
  surface: '#FFFFFF',         // Blanco
  text: '#FFFFFF',            // Blanco para texto sobre gradiente
  textDark: '#1A1A1A',        // Negro para texto sobre blanco
  textSecondary: 'rgba(255,255,255,0.8)', // Blanco semi-transparente
  success: '#4CAF50',         // Verde éxito
  warning: '#FF9800',         // Naranja warning
  error: '#F44336',           // Rojo error
};

const PageContainer = styled('div')({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  position: 'relative',
  overflow: 'hidden',
});

const HeroSection = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  padding: '2rem',
});

const GlassCard = styled(Box)({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  borderRadius: '32px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '3rem',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '700px',
});

const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    fontSize: '18px',
    fontFamily: '"Inter", "SF Pro Display", sans-serif',
    fontWeight: 500,
    height: '64px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '& fieldset': {
      border: 'none',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
    },
  },
});

const ModernButton = styled(Button)({
  borderRadius: '20px',
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '16px',
  padding: '16px 32px',
  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
  color: colors.text,
  fontFamily: '"Inter", "SF Pro Display", sans-serif',
  height: '56px',
  minWidth: '180px',
  border: 'none',
  boxShadow: '0 8px 25px rgba(233, 30, 99, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 40px rgba(233, 30, 99, 0.4)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.3)',
    color: 'rgba(255, 255, 255, 0.6)',
    transform: 'none',
    boxShadow: 'none',
  },
});

const SecondaryButton = styled(Button)({
  borderRadius: '20px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '16px',
  padding: '16px 32px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: colors.text,
  fontFamily: '"Inter", "SF Pro Display", sans-serif',
  height: '56px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 30px rgba(255, 255, 255, 0.2)',
  },
});

const UploadZone = styled(Box)({
  border: '2px dashed rgba(255, 255, 255, 0.4)',
  borderRadius: '20px',
  padding: '3rem',
  textAlign: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '2px dashed rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-5px)',
  },
});

const StyledLinearProgress = styled(LinearProgress)({
  height: '8px',
  borderRadius: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  '& .MuiLinearProgress-bar': {
    borderRadius: '4px',
    background: `linear-gradient(90deg, ${colors.text} 0%, rgba(255,255,255,0.8) 100%)`,
  },
});

const ResultsSection = styled(Box)({
  backgroundColor: colors.background,
  minHeight: '100vh',
  paddingTop: '2rem',
  paddingBottom: '4rem',
});

const ImageCard = styled(Card)(({ score, isAnalyzed }) => ({
  borderRadius: '20px',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: isAnalyzed && score >= 7 
    ? `3px solid ${colors.success}` 
    : 'none',
  boxShadow: isAnalyzed && score >= 7
    ? `0 10px 40px rgba(76, 175, 80, 0.3)`
    : '0 8px 25px rgba(0, 0, 0, 0.1)',
  backgroundColor: colors.surface,
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-10px) scale(1.02)',
    boxShadow: isAnalyzed && score >= 7
      ? `0 20px 60px rgba(76, 175, 80, 0.4)`
      : '0 15px 50px rgba(0, 0, 0, 0.15)',
  },
}));

const ScoreBadge = styled(Box)(({ score }) => ({
  position: 'absolute',
  top: '16px',
  right: '16px',
  backgroundColor: score >= 7 ? colors.success : score >= 5 ? colors.warning : colors.error,
  color: colors.text,
  borderRadius: '20px',
  padding: '8px 16px',
  fontWeight: 700,
  fontSize: '16px',
  fontFamily: '"Inter", "SF Pro Display", sans-serif',
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  zIndex: 2,
  backdropFilter: 'blur(10px)',
}));

const WinnerBadge = styled(Box)({
  position: 'absolute',
  top: '16px',
  left: '16px',
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
  color: '#1a1a1a',
  borderRadius: '25px',
  padding: '10px 16px',
  fontWeight: 700,
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  boxShadow: '0 6px 20px rgba(255, 215, 0, 0.4)',
  zIndex: 2,
});

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [guidelines, setGuidelines] = useState([]);
  const [currentStep, setCurrentStep] = useState('search'); // 'search', 'guidelines', 'analysis', 'results'
  const [isProcessing, setIsProcessing] = useState(false);
  const [images, setImages] = useState([]);
  const [analyzedImages, setAnalyzedImages] = useState(new Map());
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const handleNext = () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }
    setError('');
    setCurrentStep('guidelines');
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newGuidelines = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file: file,
    }));
    setGuidelines(newGuidelines);
    setError('');
  };

  const removeGuideline = (id) => {
    setGuidelines(prev => prev.filter(g => g.id !== id));
  };

  const startAnalysis = async () => {
    if (guidelines.length === 0) {
      setError('Please upload brand guidelines');
      return;
    }

    setError('');
    setIsProcessing(true);
    setCurrentStep('analysis');
    setImages([]);
    setAnalyzedImages(new Map());
    setProgress(0);
    setProgressMessage('Starting analysis...');
    
    try {
      // Upload guidelines
      setProgressMessage('Uploading guidelines...');
      setProgress(10);
      const formData = new FormData();
      formData.append('file', guidelines[0].file);
      const uploadResponse = await api.uploadGuideline(formData);
      const guidelinePath = uploadResponse.file_path;

      // Download images
      setProgressMessage('Downloading images...');
      setProgress(20);
      const response = await api.downloadImages({
        query: searchQuery,
        provider: 'unsplash',
        limit: 20
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
          setProgressMessage('Images downloaded! Starting AI analysis...');
          
          setTimeout(() => {
            startImageAnalysis(response.job_id, guidelinePath);
          }, 1000);
        } 
        else if (data.status === 'analyzing') {
          setProgress(70 + (data.progress * 0.3));
          setProgressMessage(`Analyzing with AI... ${data.progress}%`);
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
          setCurrentStep('results');
          setIsProcessing(false);
        }
      };

    } catch (error) {
      console.error('Error:', error);
      setError('Analysis failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const startImageAnalysis = async (jobId, guidelinePath) => {
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

  const resetFlow = () => {
    setCurrentStep('search');
    setSearchQuery('');
    setGuidelines([]);
    setImages([]);
    setAnalyzedImages(new Map());
    setError('');
    setIsProcessing(false);
  };

  const getTopImages = () => {
    return images.filter(image => {
      const score = analyzedImages.get(image.filename);
      return score && score >= 7;
    });
  };

  if (currentStep === 'results') {
    return (
      <ResultsSection>
        <Container maxWidth="xl" sx={{ pt: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography 
              variant="h3" 
              sx={{ 
                color: colors.textDark, 
                fontWeight: 800,
                fontFamily: '"Inter", "SF Pro Display", sans-serif',
              }}
            >
              Analysis Results
            </Typography>
            <Button 
              variant="outlined" 
              onClick={resetFlow}
              sx={{ 
                color: colors.primary, 
                borderColor: colors.primary,
                '&:hover': { backgroundColor: colors.primary, color: 'white' }
              }}
            >
              New Analysis
            </Button>
          </Box>

          {getTopImages().length > 0 && (
            <Box mb={6}>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: colors.textDark, 
                  fontWeight: 700, 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: '2rem' }} />
                Top Performers (Score 7+)
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(26, 26, 26, 0.7)', mb: 4 }}>
                {getTopImages().length} images perfectly match your brand guidelines
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            {images.map((image, index) => {
              const score = analyzedImages.get(image.filename);
              const isAnalyzed = score !== undefined;
              const isWinner = index === 0 && isAnalyzed && score >= 7;
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={image.filename}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      duration: 0.5,
                      type: "spring",
                      stiffness: 80,
                      damping: 15,
                      delay: index * 0.1
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
                        height="260"
                        image={`http://localhost:8000/api/image/${encodeURIComponent(currentJobId)}/${encodeURIComponent(image.filename)}`}
                        alt={image.description}
                      />
                      
                      {isWinner && (
                        <WinnerBadge>
                          <EmojiEventsIcon sx={{ fontSize: '16px' }} />
                          Winner
                        </WinnerBadge>
                      )}
                      
                      {isAnalyzed && (
                        <ScoreBadge score={score}>
                          {score >= 7 && <StarIcon sx={{ fontSize: '18px' }} />}
                          {score}/10
                        </ScoreBadge>
                      )}
                    </ImageCard>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </Container>

        <Dialog
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '24px',
              overflow: 'hidden',
            }
          }}
        >
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <IconButton
              onClick={() => setSelectedImage(null)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                zIndex: 1,
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
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
      </ResultsSection>
    );
  }

  return (
    <PageContainer>
      <HeroSection>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box textAlign="center" mb={6}>
              <Typography 
                variant="h1" 
                sx={{
                  fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
                  fontWeight: 800,
                  color: colors.text,
                  fontFamily: '"Inter", "SF Pro Display", sans-serif',
                  mb: 2,
                  lineHeight: 1.1,
                }}
              >
                Surrogates AI Images
              </Typography>
              <Typography 
                variant="h4" 
                sx={{
                  color: colors.textSecondary,
                  fontFamily: '"Inter", "SF Pro Display", sans-serif',
                  fontWeight: 400,
                  fontSize: { xs: '1.2rem', md: '1.8rem' },
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                Find perfect images that match your brand guidelines using AI
              </Typography>
            </Box>

            <GlassCard>
              <AnimatePresence mode="wait">
                {currentStep === 'search' && (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: colors.text, 
                        fontWeight: 700, 
                        mb: 3,
                        textAlign: 'center'
                      }}
                    >
                      What images are you looking for?
                    </Typography>
                    
                    <Box display="flex" gap={2} mb={3}>
                      <SearchField
                        fullWidth
                        placeholder="e.g., modern office, happy people, nature..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: colors.primary, fontSize: '24px' }} />
                            </InputAdornment>
                          ),
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                      />
                    </Box>

                    {error && (
                      <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>
                        {error}
                      </Alert>
                    )}

                    <ModernButton
                      fullWidth
                      onClick={handleNext}
                      disabled={!searchQuery.trim()}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Next Step
                    </ModernButton>
                  </motion.div>
                )}

                {currentStep === 'guidelines' && (
                  <motion.div
                    key="guidelines"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: colors.text, 
                        fontWeight: 700, 
                        mb: 3,
                        textAlign: 'center'
                      }}
                    >
                      Upload Your Brand Guidelines
                    </Typography>

                    {guidelines.length === 0 ? (
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        id="guidelines-upload"
                      />
                    ) : null}

                    {guidelines.length === 0 ? (
                      <label htmlFor="guidelines-upload">
                        <UploadZone>
                          <CloudUploadIcon sx={{ fontSize: '4rem', color: colors.textSecondary, mb: 2 }} />
                          <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 1 }}>
                            Drop your PDF here or click to browse
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            Supports PDF, PPT, PPTX files
                          </Typography>
                        </UploadZone>
                      </label>
                    ) : (
                      <Box>
                        {guidelines.map((guideline) => (
                          <Box 
                            key={guideline.id}
                            display="flex" 
                            alignItems="center" 
                            justifyContent="space-between"
                            p={2}
                            mb={2}
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              borderRadius: '16px',
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <CheckCircleIcon sx={{ color: colors.success }} />
                              <Typography sx={{ color: colors.text, fontWeight: 600 }}>
                                {guideline.name}
                              </Typography>
                            </Box>
                            <IconButton 
                              onClick={() => removeGuideline(guideline.id)}
                              sx={{ color: colors.textSecondary }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {error && (
                      <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>
                        {error}
                      </Alert>
                    )}

                    <Box display="flex" gap={2} mt={3}>
                      <SecondaryButton
                        onClick={() => setCurrentStep('search')}
                        sx={{ flex: 1 }}
                      >
                        Back
                      </SecondaryButton>
                      <ModernButton
                        onClick={startAnalysis}
                        disabled={guidelines.length === 0}
                        sx={{ flex: 2 }}
                      >
                        Start Analysis
                      </ModernButton>
                    </Box>
                  </motion.div>
                )}

                {currentStep === 'analysis' && (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: colors.text, 
                        fontWeight: 700, 
                        mb: 3,
                        textAlign: 'center'
                      }}
                    >
                      AI is analyzing your images...
                    </Typography>

                    <Box mb={4}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: colors.textSecondary,
                          fontFamily: '"Inter", "SF Pro Display", sans-serif',
                          fontWeight: 600,
                          mb: 2,
                          textAlign: 'center'
                        }}
                      >
                        {progressMessage}
                      </Typography>
                      <StyledLinearProgress 
                        variant="determinate" 
                        value={progress}
                        sx={{ height: '8px', borderRadius: '4px' }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: colors.textSecondary,
                          textAlign: 'center',
                          mt: 1
                        }}
                      >
                        {Math.round(progress)}% Complete
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        </Container>
      </HeroSection>
    </PageContainer>
  );
};

export default Home;
