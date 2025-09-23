import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

const RankingResults = ({ ratings }) => {
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
    if (index === 0) return <TrophyIcon sx={{ color: 'gold', fontSize: 20 }} />;
    if (index === 1) return <TrophyIcon sx={{ color: 'silver', fontSize: 18 }} />;
    if (index === 2) return <TrophyIcon sx={{ color: '#cd7f32', fontSize: 16 }} />;
    return <StarIcon sx={{ color: 'primary.main', fontSize: 16 }} />;
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
                    image={`/api/image/${rating.filename}`}
                    alt={rating.filename}
                    sx={{
                      objectFit: 'cover',
                      backgroundColor: 'grey.100',
                    }}
                    onError={(e) => {
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
                    <Typography variant="h6" fontWeight={700}>
                      {rating.score}/10
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <Tooltip title="View Full Size">
                      <IconButton
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <CardContent sx={{ pb: 2 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="h6" component="div" fontWeight={600}>
                      {rating.score}/10
                    </Typography>
                    <Chip
                      label={rating.status || 'Analyzed'}
                      size="small"
                      color={getScoreColor(rating.score)}
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <LinearProgress
                      variant="determinate"
                      value={rating.score * 10}
                      color={getScoreColor(rating.score)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                      }}
                    />
                  </Box>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '3.6em',
                    }}
                  >
                    {rating.explanation || 'Analysis complete'}
                  </Typography>
                  
                  <Box mt={2}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {rating.filename}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {displayRatings.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No images in this category
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try selecting a different filter
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RankingResults;
