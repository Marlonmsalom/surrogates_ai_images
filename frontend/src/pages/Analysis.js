import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ImageIcon from '@mui/icons-material/Image';
import api from '../services/api';
import ImageGallery from '../components/ImageGallery';

const Analysis = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const guidelinePath = searchParams.get('guideline');

  const [downloadStatus, setDownloadStatus] = useState('loading');
  const [analysisStatus, setAnalysisStatus] = useState('waiting');
  const [downloadData, setDownloadData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${jobId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.status === 'downloading') {
        setDownloadStatus('downloading');
        setProgress(data.progress || 0);
      } else if (data.status === 'completed' && data.result && data.result.images) {
        setDownloadStatus('completed');
        setDownloadData(data.result);
        setProgress(100);
        
        setTimeout(() => {
          startAnalysis();
        }, 1000);
      } else if (data.status === 'analyzing') {
        setAnalysisStatus('analyzing');
        setProgress(data.progress || 0);
      } else if (data.status === 'completed' && data.result && data.result.ratings) {
        setAnalysisStatus('completed');
        setProgress(100);
        setTimeout(() => {
          navigate(`/results/${jobId}`);
        }, 1500);
      } else if (data.status === 'error') {
        setError(data.error);
        setDownloadStatus('error');
        setAnalysisStatus('error');
      }
    };

    return () => ws.close();
  }, [jobId, navigate]);

  const startAnalysis = async () => {
    if (!guidelinePath) {
      setError('Guideline path not found');
      return;
    }

    try {
      setAnalysisStatus('starting');
      
      const response = await api.analyzeImages({
        job_id: jobId,  // USAR EL MISMO JOB_ID
        guideline_path: guidelinePath
      });

      console.log('Analysis started for job:', response.job_id);

    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed');
      setAnalysisStatus('error');
    }
  };

  const getStatusMessage = () => {
    if (downloadStatus === 'downloading') {
      return `Downloading images... (${progress}%)`;
    } else if (downloadStatus === 'completed' && analysisStatus === 'waiting') {
      return 'Images downloaded successfully!';
    } else if (analysisStatus === 'starting') {
      return 'Starting AI analysis...';
    } else if (analysisStatus === 'analyzing') {
      return `Analyzing with AI... (${progress}%)`;
    } else if (analysisStatus === 'completed') {
      return 'Analysis completed! Redirecting to results...';
    }
    return 'Initializing...';
  };

  const getStatusColor = () => {
    if (downloadStatus === 'completed' && analysisStatus === 'waiting') return 'success';
    if (analysisStatus === 'completed') return 'success';
    return 'primary';
  };

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          sx={{
            maxWidth: 1000,
            mx: 'auto',
            mb: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={4}>
              <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Processing Your Images
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {getStatusMessage()}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box mb={4}>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={getStatusColor()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                }}
              />
              <Typography variant="body2" textAlign="center" mt={1}>
                {progress}% Complete
              </Typography>
            </Box>

            <Grid container spacing={3} textAlign="center">
              <Grid item xs={12} md={6}>
                <motion.div
                  animate={{
                    scale: downloadStatus === 'downloading' ? [1, 1.05, 1] : 1,
                  }}
                  transition={{ repeat: downloadStatus === 'downloading' ? Infinity : 0, duration: 1 }}
                >
                  <Card sx={{ p: 3, height: '100%' }}>
                    <ImageIcon sx={{ fontSize: 40, mb: 2, color: downloadStatus === 'completed' ? 'success.main' : 'primary.main' }} />
                    <Typography variant="h6" gutterBottom>
                      Download Images
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {downloadStatus === 'downloading' && <CircularProgress size={20} />}
                      {downloadStatus === 'completed' && <CheckCircleIcon color="success" />}
                      <Chip
                        label={downloadStatus === 'completed' ? 'Completed' : 'In Progress'}
                        color={downloadStatus === 'completed' ? 'success' : 'primary'}
                        size="small"
                      />
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <motion.div
                  animate={{
                    scale: analysisStatus === 'analyzing' ? [1, 1.05, 1] : 1,
                  }}
                  transition={{ repeat: analysisStatus === 'analyzing' ? Infinity : 0, duration: 1 }}
                >
                  <Card sx={{ p: 3, height: '100%' }}>
                    <AutoAwesomeIcon sx={{ fontSize: 40, mb: 2, color: analysisStatus === 'completed' ? 'success.main' : 'primary.main' }} />
                    <Typography variant="h6" gutterBottom>
                      AI Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {analysisStatus === 'analyzing' && <CircularProgress size={20} />}
                      {analysisStatus === 'completed' && <CheckCircleIcon color="success" />}
                      <Chip
                        label={
                          analysisStatus === 'completed' ? 'Completed' :
                          analysisStatus === 'analyzing' ? 'Analyzing' :
                          analysisStatus === 'starting' ? 'Starting' : 'Waiting'
                        }
                        color={analysisStatus === 'completed' ? 'success' : analysisStatus === 'analyzing' ? 'primary' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            {downloadData && downloadStatus === 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Box mt={4}>
                  <Typography variant="h5" gutterBottom textAlign="center">
                    Downloaded Images Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                    {downloadData.images?.length || 0} images ready for analysis
                  </Typography>
                  <ImageGallery images={downloadData.images || []} jobId={jobId} />
                </Box>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Analysis;
