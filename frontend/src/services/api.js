import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default {
  downloadImages: (data) => api.post('/download-images', data).then(res => res.data),
  analyzeImages: (data) => api.post('/analyze-images', data).then(res => res.data),
  getJobStatus: (jobId) => api.get(`/job-status/${jobId}`).then(res => res.data),
  uploadGuideline: (formData) => api.post('/upload-guideline', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data),
};
