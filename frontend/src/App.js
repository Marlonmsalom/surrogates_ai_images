import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#fafafa',
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis/:jobId" element={<Analysis />} />
          <Route path="/results/:jobId" element={<Results />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
