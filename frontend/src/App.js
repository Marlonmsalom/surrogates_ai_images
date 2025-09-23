import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Box, Typography } from '@mui/material';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={6}>
            <Typography 
              variant="h1" 
              sx={{ 
                color: 'white', 
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontWeight: 800
              }}
            >
              Surrogates AI Images
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontWeight: 300,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              Brand Guidelines Image Analyzer
            </Typography>
          </Box>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analysis/:jobId" element={<Analysis />} />
            <Route path="/results/:jobId" element={<Results />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
