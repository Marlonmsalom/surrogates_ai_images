import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const RankingResults = ({ ratings, jobId }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  if (!ratings || ratings.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No ratings to display
        </Typography>
      </Box>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    if (score >= 4) return 'info';
    return 'error';
  };

  const getScoreIcon = (score, index) => {
    if (index < 3) {
      const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
      return <EmojiEventsIcon sx={{ color: colors[index], fontSize: 16 }} />;
    }
    if (score >= 8) return <StarIcon sx={{ color: 'success.main', fontSize: 16 }} />;
    if (score >= 6) return <TrendingUpIcon sx={{ color: 'warning.main', fontSize: 16 }} />;
    return null;
  };

  const filterRatings = (filter) => {
    switch (filter) {
      case 'excellent':
        return ratings.filter(r => r.score >= 8);
      case 'good':
        return ratings.filter(r => r.score >= 6 && r.score < 8);
      case 'poor':
        return ratings.filter(r => r.score < 6);
      default:
        return ratings;
    }
  };

  const tabFilters = [
    { label: `All (${ratings.length})`, value: 'all' },
    { label: `Excellent (${ratings.filter(r => r.score >= 8).length})`, value: 'excellent' },
    { label: `Good (${ratings.filter(r => r.score >= 6 && r.score < 8).length})`, value: 'good' },
    { label: `Needs Work (${ratings.filter(r => r.score < 6).length})`, value: 'poor' },
  ];

  const displayRatings = filterRatings(tabFilters[selectedTab].value);

  return (
    <Box>
      <Typography variant="h5" gutterBottom textAlign="center">
        Image Rankings
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          centered
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabFilters.map((filter, index) => (
            <Tab
              key={filter.value}
              label={filter.label}
              sx={{ textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {displayRatings.map((rating, index) => (
          <Grid item xs={12} sm={6} md={4} key={rating.filename}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={`http://localhost:8000/api/image/${encodeURIComponent(jobId)}/${encodeURIComponent(rating.filename)}`}
                    alt={rating.filename}
                    sx={{
                      objectFit: 'cover',
                      backgroundColor: 'grey.100',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', rating.filename, 'jobId:', jobId);
                      e.target.src = `data:image/svg+xml,<svg width="300" height="240" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="%23f5f5f5"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle" dy=".3em">${rating.filename}</text></svg>`;
                    }}
                  />
                  
                  {/* Ranking Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      borderRadius: 2,
                      px: 1,
                      py: 0.5,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {getScoreIcon(rating.score, ratings.findIndex(r => r.filename === rating.filename))}
                    <Typography variant="body2" fontWeight={600}>
                      #{ratings.findIndex(r => r.filename === rating.filename) + 1}
                    </Typography>
                  </Box>

                  {/* Score Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: `${getScoreColor(rating.score)}.main`,
                      color: 'white',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {rating.score}/10
                    </Typography>
                  </Box>

                  {/* Status Chip */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                    }}
                  >
                    <Chip
                      label={rating.status || 'unknown'}
                      size="small"
                      color={getScoreColor(rating.score)}
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        color: `${getScoreColor(rating.score)}.main`,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                  </Box>
                </Box>

                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 1,
                      fontWeight: 600,
                    }}
                  >
                    {rating.filename}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {rating.explanation || 'No explanation provided'}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RankingResults;
