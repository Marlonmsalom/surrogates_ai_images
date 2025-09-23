import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ImageUpload = ({ onFileSelect, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const handleFileInput = (e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size must be less than 100MB');
      return;
    }

    const fileData = {
      file: file,
      name: file.name,
      size: file.size,
      lastModified: file.lastModified
    };

    setUploadedFile(fileData);
    onFileSelect(fileData);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
        Upload Brand Guidelines
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Upload a PDF containing your brand guidelines for analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!uploadedFile ? (
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.01 }}
          whileTap={{ scale: disabled ? 1 : 0.99 }}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'grey.300',
              backgroundColor: dragActive ? 'rgba(103, 126, 234, 0.05)' : 'background.paper',
              transition: 'all 0.3s ease',
              opacity: disabled ? 0.6 : 1,
              cursor: 'pointer',
              borderRadius: 3,
              '&:hover': {
                borderColor: disabled ? 'grey.300' : 'primary.main',
                backgroundColor: disabled ? 'background.paper' : 'rgba(103, 126, 234, 0.05)',
              },
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="pdf-upload-input"
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              disabled={disabled}
              style={{ display: 'none' }}
            />
            
            <CloudUploadIcon
              sx={{
                fontSize: 48,
                color: dragActive ? 'primary.main' : 'text.secondary',
                mb: 2,
              }}
            />
            
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {dragActive ? 'Drop your PDF here' : 'Upload Brand Guidelines'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" mb={3}>
              Drag and drop your PDF file here, or click to browse
            </Typography>
            
            <Button
              component="label"
              htmlFor="pdf-upload-input"
              variant="outlined"
              disabled={disabled}
              startIcon={<CloudUploadIcon />}
              sx={{ 
                mt: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                py: 1,
              }}
            >
              Choose File
            </Button>
            
            <Typography variant="caption" display="block" mt={3} color="text.secondary">
              Supported: PDF files up to 100MB
            </Typography>
          </Paper>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Paper
            sx={{
              p: 3,
              backgroundColor: 'rgba(46, 125, 50, 0.08)',
              border: '1px solid',
              borderColor: 'success.main',
              borderRadius: 3,
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
              <Box flex={1}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <DescriptionIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary' }}>
                    {uploadedFile.name}
                  </Typography>
                  <Chip label="PDF" size="small" color="primary" />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(uploadedFile.size)} • Ready for analysis
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => {
                  setUploadedFile(null);
                  onFileSelect(null);
                }}
                disabled={disabled}
                sx={{ borderRadius: 2 }}
              >
                Remove
              </Button>
            </Box>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
};

export default ImageUpload;
