import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  LinearProgress,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import BrushIcon from '@mui/icons-material/Brush';
import api from '../services/api';

const colors = {
  primary: '#E91E63',
  secondary: '#FF7043',
  accent: '#F8BBD9',
  tertiary: '#FFE0B2',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#FFFFFF',
  textDark: '#1A1A1A',
  textSecondary: 'rgba(255,255,255,0.8)',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
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

const NavButton = styled(Button)(({ active }) => ({
  color: colors.text,
  textTransform: 'none',
  fontWeight: active ? 700 : 500,
  fontSize: '16px',
  padding: '10px 20px',
  borderRadius: '16px',
  marginLeft: '12px',
  backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
}));

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
    '& fieldset': { border: 'none' },
  },
});

const ModernButton = styled(Button)({
  textTransform: 'none',
  padding: '16px 32px',
  fontSize: '18px',
  fontWeight: 600,
  borderRadius: '20px',
  background: `linear-gradient(135deg, ${colors.text} 0%, rgba(255,255,255,0.9) 100%)`,
  color: colors.primary,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    background: colors.text,
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.3)',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

const WebsiteCard = styled(Box)({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '24px',
  overflow: 'hidden',
  marginBottom: '2rem',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
});

const SettingsDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    padding: '1rem',
    minWidth: '400px',
  },
}));

function Guides() {
  const navigate = useNavigate();
  const [keywords, setKeywords] = useState('');
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [websiteCount, setWebsiteCount] = useState(10);

  const handleSearch = async () => {
    if (!keywords.trim()) {
      setError('Please enter some keywords');
      return;
    }

    setLoading(true);
    setError('');
    setWebsites([]);

    try {
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      const result = await api.getInspiration({
        keywords: keywordList,
        count: websiteCount
      });

      if (result.success && result.websites) {
        setWebsites(result.websites);
      } else {
        setError(result.message || 'No websites found');
      }
    } catch (err) {
      console.error('Full error:', err);
      console.error('Response:', err.response);
      console.error('Data:', err.response?.data);
      setError(err.response?.data?.detail || err.message || 'Error fetching inspiration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      {/* Navbar */}
      <TopBar position="static">
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 2 }}>
            <Box display="flex" alignItems="center">
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '24px',
                  color: colors.text,
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/')}
              >
                Surrogates AI
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <NavButton 
                startIcon={<ImageIcon />}
                onClick={() => navigate('/')}
              >
                Images
              </NavButton>
              <NavButton 
                active="true"
                startIcon={<BrushIcon />}
              >
                Guides
              </NavButton>
              <IconButton
                onClick={() => setSettingsOpen(true)}
                sx={{ 
                  ml: 2,
                  color: colors.text,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </TopBar>

      {/* Main Content */}
      <HeroSection>
        <Container maxWidth="lg">
          {websites.length === 0 && (
            <GlassCard>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    color: colors.text,
                    fontWeight: 800,
                    mb: 2,
                    textAlign: 'center',
                    textShadow: '0 2px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  Discover Design Inspiration
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    color: colors.textSecondary,
                    fontWeight: 400,
                    mb: 4,
                    textAlign: 'center',
                  }}
                >
                  Find world-class websites that match your aesthetic
                </Typography>

                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <SearchField
                    fullWidth
                    placeholder="e.g., minimalist, bold typography, dark mode..."
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: colors.primary, fontSize: '24px' }} />
                        </InputAdornment>
                      ),
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>
                    {error}
                  </Alert>
                )}

                <ModernButton
                  fullWidth
                  onClick={handleSearch}
                  disabled={!keywords.trim() || loading}
                >
                  {loading ? 'Searching...' : 'Find Inspiration'}
                </ModernButton>

                {loading && <LinearProgress sx={{ mt: 2, borderRadius: '8px' }} />}
              </motion.div>
            </GlassCard>
          )}

          {/* Results */}
          {websites.length > 0 && (
            <Box sx={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ color: colors.text, fontWeight: 700 }}>
                  {websites.length} Design References
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setWebsites([]);
                    setKeywords('');
                  }}
                  sx={{
                    borderRadius: '16px',
                    textTransform: 'none',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                  }}
                >
                  New Search
                </Button>
              </Box>

              <AnimatePresence>
                {websites.map((site, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <WebsiteCard>
                      <Box p={3}>
                        <Typography variant="h5" sx={{ color: colors.textDark, fontWeight: 700, mb: 1 }}>
                          {site.url.replace('https://', '').replace('http://', '').split('/')[0]}
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.textDark, mb: 2, opacity: 0.7 }}>
                          {site.description}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.primary, mb: 2 }}>
                          <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                            {site.url}
                          </a>
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          height: '600px',
                          backgroundColor: '#f5f5f5',
                          position: 'relative',
                        }}
                      >
                        <iframe
                          src={site.url}
                          title={site.url}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                          }}
                          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                      </Box>
                    </WebsiteCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Box>
          )}
        </Container>
      </HeroSection>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <Box p={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight={700}>Settings</Typography>
            <IconButton onClick={() => setSettingsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Number of Websites</InputLabel>
            <Select
              value={websiteCount}
              label="Number of Websites"
              onChange={(e) => setWebsiteCount(e.target.value)}
            >
              <MenuItem value={5}>5 websites</MenuItem>
              <MenuItem value={10}>10 websites</MenuItem>
              <MenuItem value={15}>15 websites</MenuItem>
              <MenuItem value={20}>20 websites</MenuItem>
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            onClick={() => setSettingsOpen(false)}
            sx={{
              borderRadius: '16px',
              textTransform: 'none',
              py: 1.5,
              backgroundColor: colors.primary,
            }}
          >
            Save Settings
          </Button>
        </Box>
      </SettingsDialog>
    </PageContainer>
  );
}

export default Guides;
