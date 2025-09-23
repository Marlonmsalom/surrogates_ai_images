import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export default {
  uploadGuideline: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload-guideline', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  downloadImages: (data) => {
    return api.post('/download-images', data);
  },

  analyzeImages: (data) => {
    return api.post('/analyze-images', data);
  },

  getJobStatus: (jobId) => {
    return api.get(`/job-status/${jobId}`);
  },

  healthCheck: () => {
    return api.get('/health');
  },
};
