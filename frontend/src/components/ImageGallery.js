import React from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';

const ImageGallery = ({ images, jobId }) => {
  if (!images || images.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No images to display
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {images.map((image, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:8000/api/image/${encodeURIComponent(jobId)}/${encodeURIComponent(image.filename)}`}
                  alt={image.description || `Image ${index + 1}`}
                  sx={{
                    objectFit: 'cover',
                    backgroundColor: 'grey.100',
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', image.filename);
                    e.target.src = `data:image/svg+xml,<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="%23f5f5f5"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle" dy=".3em">Image ${index + 1}</text></svg>`;
                  }}
                />
                
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Typography variant="caption" color="white" fontWeight={500}>
                    #{index + 1}
                  </Typography>
                </Box>
              </Box>
              
              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '2.5em',
                    mb: 1,
                  }}
                >
                  {image.description || `Untitled Image ${index + 1}`}
                </Typography>
                
                <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                  <Box display="flex" alignItems="center" gap={0.5} flex={1} minWidth={0}>
                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {image.author || 'Unknown'}
                    </Typography>
                  </Box>
                  
                  <Chip
                    label={image.source || 'Unknown'}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

export default ImageGallery;
