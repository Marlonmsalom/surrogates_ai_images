import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import HomeIcon from '@mui/icons-material/Home';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../services/api';
import RankingResults from '../components/RankingResults';

const Results = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, [jobId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = await api.getJobStatus(jobId);
      
      if (response.status === 'completed' && response.result) {
        setResults(response.result);
      } else if (response.status === 'error') {
        setError(response.error);
      } else {
        setError('Analysis not completed yet');
      }
    } catch (err) {
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    if (score >= 4) return 'info';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', textAlign: 'center', p: 4 }}>
        <Typography>Loading results...</Typography>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Card>
    );
  }

  if (!results || !results.ratings) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
        <Alert severity="warning">
          No results found
        </Alert>
      </Card>
    );
  }

  const topImages = results.ratings.filter(r => r.score >= 7);
  const avgScore = results.ratings.reduce((sum, r) => sum + r.score, 0) / results.ratings.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box display="flex" alignItems="center" gap={2}>
              <TrophyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" gutterBottom>
                  Analysis Results
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Brand guidelines compliance analysis
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              New Analysis
            </Button>
          </Box>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <StarIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" color="primary.main" gutterBottom>
                  {avgScore.toFixed(1)}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Average Score
                </Typography>
                <Chip
                  label={getScoreLabel(avgScore)}
                  color={getScoreColor(avgScore)}
                  size="small"
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <TrophyIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h3" color="success.main" gutterBottom>
                  {topImages.length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Top Performers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score 7+ (Excellent)
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <DownloadIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h3" color="info.main" gutterBottom>
                  {results.ratings.length}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Total Images
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analyzed
                </Typography>
              </Card>
            </Grid>
          </Grid>

          <RankingResults ratings={results.ratings} />

          {results.usage && (
            <Box mt={4} p={2} bgcolor="background.default" borderRadius={2}>
              <Typography variant="body2" color="text.secondary">
                API Usage: {results.usage.total_tokens || 0} tokens
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Results;
