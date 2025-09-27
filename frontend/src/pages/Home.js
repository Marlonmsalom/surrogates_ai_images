import React, { useState, useRef, useEffect } from 'react';
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
  DialogTitle,
  DialogActions,
  Grid,
  CardMedia,
  Alert,
  InputAdornment,
  LinearProgress,
  Fade,
  Zoom,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from '../services/api';

// Paleta original restaurada - Degradado rojo hermoso
const colors = {
  primary: '#E91E63',         // Pink vibrante
  secondary: '#FF7043',       // Coral/naranja
  accent: '#F8BBD9',          // Rosa muy suave para botones
  tertiary: '#FFE0B2',        // Melocotón suave
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

const TopBar = styled(AppBar)({
  background: 'transparent',
  boxShadow: 'none',
  position: 'absolute',
  top: 0,
  zIndex: 1000,
});

const HeaderButton = styled(Button)({
  color: colors.text,
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '16px',
  padding: '8px 16px',
  borderRadius: '12px',
  marginLeft: '12px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const SignUpButton = styled(Button)({
  backgroundColor: colors.text,
  color: colors.primary,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '16px',
  padding: '10px 20px',
  borderRadius: '16px',
  marginLeft: '12px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transform: 'translateY(-1px)',
  },
});

const HeroSection = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  padding: '2rem',
  zIndex: 1,
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
  margin: '0 auto',
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
  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.tertiary} 100%)`,
  color: colors.textDark,
  fontFamily: '"Inter", "SF Pro Display", sans-serif',
  height: '56px',
  minWidth: '180px',
  border: 'none',
  boxShadow: '0 8px 25px rgba(248, 187, 217, 0.4)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.tertiary} 0%, ${colors.accent} 100%)`,
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 40px rgba(248, 187, 217, 0.5)',
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

const SettingsButton = styled(IconButton)({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: colors.text,
  width: '56px',
  height: '56px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-2px)',
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

const ResultsSection = styled(motion.div)({
  backgroundColor: colors.background,
  minHeight: '100vh',
  position: 'relative',
  zIndex: 2,
  borderTopLeftRadius: '40px',
  borderTopRightRadius: '40px',
  marginTop: '40px',
  boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
});

const ResultsHeader = styled(Box)({
  background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}15 100%)`,
  padding: '3rem 0 2rem',
  borderTopLeftRadius: '40px',
  borderTopRightRadius: '40px',
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
  cursor: 'pointer',
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

const FloatingActionButton = styled(IconButton)({
  position: 'fixed',
  bottom: '2rem',
  right: '2rem',
  backgroundColor: colors.primary,
  color: colors.text,
  width: '60px',
  height: '60px',
  boxShadow: '0 8px 25px rgba(233, 30, 99, 0.3)',
  zIndex: 1000,
  '&:hover': {
    backgroundColor: colors.secondary,
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 35px rgba(233, 30, 99, 0.4)',
  },
});

// Nuevos componentes para el modal mejorado
const ImageModalFrame = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  minHeight: '60vh',
  maxHeight: '80vh',
  backgroundColor: colors.surface,
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
});

const ImageSection = styled(Box)({
  flex: '1.2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8fafc',
  position: 'relative',
  minHeight: '400px',
});

const InfoSection = styled(Box)({
  flex: '0.8',
  padding: '2rem',
  backgroundColor: colors.surface,
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [guidelines, setGuidelines] = useState([]);
  const [currentStep, setCurrentStep] = useState('search');
  const [isProcessing, setIsProcessing] = useState(false);
  const [images, setImages] = useState([]);
  const [imageRatings, setImageRatings] = useState(new Map()); // Cambio: guardar ratings completos
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wsConnection, setWsConnection] = useState(null);
  
  const [settings, setSettings] = useState({
    provider: 'unsplash',
    imageCount: 20,
    defaultGuidelines: null,
    useDefaultGuidelines: false,
  });
  
  const heroRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem('surrogates-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      
      if (parsed.useDefaultGuidelines && parsed.defaultGuidelines) {
        setGuidelines([{
          id: 'default',
          name: parsed.defaultGuidelines.name,
          file: null,
          isDefault: true,
          path: parsed.defaultGuidelines.path
        }]);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  const saveSettings = () => {
    localStorage.setItem('surrogates-settings', JSON.stringify(settings));
    setSettingsOpen(false);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newGuidelines = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file: file,
      isDefault: false
    }));
    
    const defaultGuidelines = guidelines.filter(g => g.isDefault);
    setGuidelines([...defaultGuidelines, ...newGuidelines]);
    setError('');
  };

  const handleDefaultGuidelinesUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await api.uploadGuideline(formData);
      
      setSettings(prev => ({
        ...prev,
        defaultGuidelines: {
          name: file.name,
          path: uploadResponse.file_path
        },
        useDefaultGuidelines: true
      }));
    } catch (error) {
      console.error('Error uploading default guidelines:', error);
    }
  };

  const removeDefaultGuidelines = () => {
    setSettings(prev => ({
      ...prev,
      defaultGuidelines: null,
      useDefaultGuidelines: false
    }));
    
    setGuidelines(prev => prev.filter(g => !g.isDefault));
  };

  const handleNext = () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }
    setError('');
    setCurrentStep('guidelines');
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
    setImageRatings(new Map());
    setProgress(0);
    setProgressMessage('Preparing analysis...');
    
    try {
      let guidelinePath;
      
      const defaultGuideline = guidelines.find(g => g.isDefault);
      if (defaultGuideline) {
        guidelinePath = defaultGuideline.path;
        setProgress(20);
      } else {
        setProgressMessage('Uploading guidelines...');
        setProgress(10);
        const formData = new FormData();
        formData.append('file', guidelines[0].file);
        const uploadResponse = await api.uploadGuideline(formData);
        guidelinePath = uploadResponse.file_path;
        setProgress(20);
      }

      setProgressMessage('Starting image download...');
      
      const response = await api.downloadImages({
        query: searchQuery,
        provider: settings.provider,
        limit: settings.imageCount
      });

      setCurrentJobId(response.job_id);
      
      const ws = new WebSocket(`ws://localhost:8000/ws/${response.job_id}`);
      setWsConnection(ws);
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setProgressMessage('Connected! Downloading images...');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);
        
        if (data.status === 'downloading') {
          setProgress(20 + (data.progress * 0.5));
          setProgressMessage(`Downloading images... ${data.progress}%`);
        }
        else if (data.status === 'completed' && data.result && data.result.images) {
          if (data.result.images.length === 0) {
            setError('No images found. Try a different search term or check API keys.');
            setIsProcessing(false);
            return;
          }
          
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
          // Cambio: guardar ratings completos con explanation
          const ratingsMap = new Map();
          data.result.ratings.forEach(rating => {
            ratingsMap.set(rating.filename, rating);
          });
          setImageRatings(ratingsMap);
          
          setImages(prevImages => {
            const sortedImages = [...prevImages].sort((a, b) => {
              const aRating = ratingsMap.get(a.filename);
              const bRating = ratingsMap.get(b.filename);
              const aScore = aRating ? aRating.score : 0;
              const bScore = bRating ? bRating.score : 0;
              return bScore - aScore;
            });
            return sortedImages;
          });
          
          setProgress(100);
          setProgressMessage('Analysis complete!');
          setIsProcessing(false);
          setShowResults(true);
          
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }, 800);
          
          ws.close();
          setWsConnection(null);
        }
        else if (data.status === 'error') {
          setError(data.message || 'An error occurred during processing');
          setIsProcessing(false);
          ws.close();
          setWsConnection(null);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Please try again.');
        setIsProcessing(false);
      };
      
      ws.onclose = () => {
        console.log('WebSocket closed');
        setWsConnection(null);
      };

    } catch (error) {
      console.error('Error:', error);
      setError('Analysis failed. Please try again.');
      setIsProcessing(false);
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
      }
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
    
    const defaultGuidelines = guidelines.filter(g => g.isDefault);
    setGuidelines(defaultGuidelines);
    
    setImages([]);
    setImageRatings(new Map());
    setError('');
    setIsProcessing(false);
    setShowResults(false);
    
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
    }
    
    heroRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const scrollToTop = () => {
    heroRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const getTopImages = () => {
    return images.filter(image => {
      const rating = imageRatings.get(image.filename);
      return rating && rating.score >= 7;
    });
  };

  // Función para obtener el score para compatibilidad con componentes existentes
  const getScoreFromRating = (filename) => {
    const rating = imageRatings.get(filename);
    return rating ? rating.score : undefined;
  };

  return (
    <PageContainer>
      {/* Header */}
      <TopBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <LanguageIcon sx={{ color: colors.text, mr: 1 }} />
            <Typography sx={{ color: colors.text, fontWeight: 600 }}>EN</Typography>
          </Box>
          
          <Box>
            <HeaderButton>Log in</HeaderButton>
            <SignUpButton>Sign up</SignUpButton>
            <SettingsButton 
              onClick={() => setSettingsOpen(true)}
              sx={{ ml: 1 }}
            >
              <SettingsIcon />
            </SettingsButton>
          </Box>
        </Toolbar>
      </TopBar>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.5rem', 
          fontWeight: 700,
          color: colors.textDark,
          pb: 1
        }}>
          Settings
        </DialogTitle>
        
        <DialogContent sx={{ py: 2 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth>
              <InputLabel>Image Provider</InputLabel>
              <Select
                value={settings.provider}
                onChange={(e) => setSettings(prev => ({ ...prev, provider: e.target.value }))}
                label="Image Provider"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="unsplash">Unsplash (Recommended)</MenuItem>
                <MenuItem value="pexels">Pexels</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Number of images per search"
              type="number"
              value={settings.imageCount}
              onChange={(e) => setSettings(prev => ({ ...prev, imageCount: parseInt(e.target.value) }))}
              inputProps={{ min: 5, max: 50 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Default Guidelines
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.useDefaultGuidelines}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      useDefaultGuidelines: e.target.checked 
                    }))}
                    color="primary"
                  />
                }
                label="Use default guidelines for all searches"
                sx={{ mb: 2 }}
              />

              {settings.useDefaultGuidelines && (
                <Box>
                  {settings.defaultGuidelines ? (
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="space-between"
                      p={2}
                      sx={{
                        backgroundColor: 'rgba(233, 30, 99, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(233, 30, 99, 0.2)'
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <CheckCircleIcon sx={{ color: colors.primary }} />
                        <Typography sx={{ fontWeight: 600 }}>
                          {settings.defaultGuidelines.name}
                        </Typography>
                      </Box>
                      <IconButton 
                        onClick={removeDefaultGuidelines}
                        size="small"
                        sx={{ color: colors.error }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box>
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx"
                        onChange={handleDefaultGuidelinesUpload}
                        style={{ display: 'none' }}
                        id="default-guidelines-upload"
                      />
                      <label htmlFor="default-guidelines-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{
                            borderRadius: '12px',
                            borderColor: colors.primary,
                            color: colors.primary,
                            '&:hover': {
                              backgroundColor: colors.primary,
                              color: 'white'
                            }
                          }}
                        >
                          Upload Default Guidelines
                        </Button>
                      </label>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setSettingsOpen(false)}
            sx={{ borderRadius: '12px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={saveSettings}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: '12px',
              backgroundColor: colors.primary,
              '&:hover': {
                backgroundColor: colors.secondary
              }
            }}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hero Section */}
      <HeroSection ref={heroRef}>
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
                    
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
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
                      {guidelines.length > 0 ? 'Your Guidelines' : 'Upload Your Brand Guidelines'}
                    </Typography>

                    {guidelines.length > 0 && (
                      <Box mb={3}>
                        {guidelines.map((guideline) => (
                          <Box 
                            key={guideline.id}
                            display="flex" 
                            alignItems="center" 
                            justifyContent="space-between"
                            p={2}
                            mb={2}
                            sx={{
                              backgroundColor: guideline.isDefault 
                                ? 'rgba(76, 175, 80, 0.2)' 
                                : 'rgba(255, 255, 255, 0.2)',
                              borderRadius: '16px',
                              backdropFilter: 'blur(10px)',
                              border: guideline.isDefault 
                                ? '1px solid rgba(76, 175, 80, 0.3)' 
                                : '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <CheckCircleIcon 
                                sx={{ color: guideline.isDefault ? colors.success : colors.text }} 
                              />
                              <Box>
                                <Typography sx={{ color: colors.text, fontWeight: 600 }}>
                                  {guideline.name}
                                </Typography>
                                {guideline.isDefault && (
                                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                    Default Guidelines
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            {!guideline.isDefault && (
                              <IconButton 
                                onClick={() => removeGuideline(guideline.id)}
                                sx={{ color: colors.textSecondary }}
                              >
                                <CloseIcon />
                              </IconButton>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}

                    {(!guidelines.some(g => g.isDefault) && guidelines.length === 0) && (
                      <>
                        <input
                          type="file"
                          accept=".pdf,.ppt,.pptx"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                          id="guidelines-upload"
                        />
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
                      </>
                    )}

                    {guidelines.length > 0 && (
                      <>
                        <input
                          type="file"
                          accept=".pdf,.ppt,.pptx"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                          id="additional-guidelines-upload"
                        />
                        <label htmlFor="additional-guidelines-upload">
                          <Button
                            component="span"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            sx={{
                              borderRadius: '16px',
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                              color: colors.text,
                              mb: 3,
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.8)'
                              }
                            }}
                          >
                            Add Additional Guidelines
                          </Button>
                        </label>
                      </>
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

      {/* Results Section */}
      <AnimatePresence>
        {showResults && (
          <ResultsSection
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.4, 0, 0.2, 1]
            }}
            ref={resultsRef}
          >
            <ResultsHeader>
              <Container maxWidth="xl">
                <Box display="flex" justifyContent="space-between" alignItems="center">
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
                    startIcon={<RefreshIcon />}
                    sx={{ 
                      color: colors.primary, 
                      borderColor: colors.primary,
                      borderRadius: '12px',
                      '&:hover': { backgroundColor: colors.primary, color: 'white' }
                    }}
                  >
                    New Analysis
                  </Button>
                </Box>

                {getTopImages().length > 0 && (
                  <Box mt={4}>
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
                    <Typography variant="body1" sx={{ color: 'rgba(26, 26, 26, 0.7)' }}>
                      {getTopImages().length} images perfectly match your brand guidelines
                    </Typography>
                  </Box>
                )}
              </Container>
            </ResultsHeader>

            <Container maxWidth="xl" sx={{ py: 4 }}>
              <Grid container spacing={3}>
                {images.map((image, index) => {
                  const score = getScoreFromRating(image.filename);
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
          </ResultsSection>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {showResults && (
        <FloatingActionButton onClick={scrollToTop}>
          <KeyboardArrowUpIcon />
        </FloatingActionButton>
      )}

      {/* Nuevo Modal Mejorado con Marco */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden',
            maxHeight: '90vh',
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
              zIndex: 10,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' }
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {selectedImage && (
            <ImageModalFrame>
              {/* Sección de la imagen */}
              <ImageSection>
                <img
                  src={`http://localhost:8000/api/image/${encodeURIComponent(currentJobId)}/${encodeURIComponent(selectedImage.filename)}`}
                  alt={selectedImage.description}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '12px'
                  }}
                />
              </ImageSection>
              
              {/* Sección de información */}
              <InfoSection>
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700, 
                      color: colors.textDark,
                      mb: 1,
                      fontFamily: '"Inter", "SF Pro Display", sans-serif'
                    }}
                  >
                    Image Details
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(26, 26, 26, 0.7)',
                      mb: 2,
                      lineHeight: 1.5
                    }}
                  >
                    {selectedImage.description || selectedImage.filename}
                  </Typography>
                </Box>

                {imageRatings.get(selectedImage.filename) && (
                  <>
                    <Divider />
                    
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700, 
                          color: colors.textDark,
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        AI Analysis Score
                        <Chip 
                          label={`${imageRatings.get(selectedImage.filename).score}/10`}
                          color={
                            imageRatings.get(selectedImage.filename).score >= 7 ? 'success' : 
                            imageRatings.get(selectedImage.filename).score >= 5 ? 'warning' : 'error'
                          }
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: colors.textDark,
                          lineHeight: 1.6,
                          backgroundColor: '#f8fafc',
                          padding: '1rem',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontStyle: 'italic'
                        }}
                      >
                        "{imageRatings.get(selectedImage.filename).explanation || 'No explanation provided'}"
                      </Typography>
                    </Box>

                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(26, 26, 26, 0.6)',
                          textAlign: 'center',
                          fontStyle: 'italic'
                        }}
                      >
                        This analysis is based on your uploaded brand guidelines
                      </Typography>
                    </Box>
                  </>
                )}
              </InfoSection>
            </ImageModalFrame>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Home;
