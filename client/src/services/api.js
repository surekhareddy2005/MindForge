import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor for adding the token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getProfile = () => API.get('/user/profile');
export const updateProfile = (data) => API.put('/user/profile', data);
export const updatePassword = (data) => API.put('/user/password', data);

// Courses
export const getMyCourses = () => API.get('/courses/my');
export const getCourseDetails = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => API.post('/courses', data);

// Modules
export const getModules = (courseId) => API.get(`/modules/${courseId}`);
export const createModule = (data) => API.post('/modules', data);
export const deleteModule = (moduleId) => API.delete(`/modules/${moduleId}`);

// Sessions
export const getSessions = (courseId) => API.get(`/sessions/${courseId}`);
export const createSession = (data) => API.post('/sessions', data);

// Chat
export const getChats = (sessionId) => API.get(`/chat/${sessionId}`);
export const sendMessage = (data) => API.post('/chat', data);
export const clearChatHistory = (sessionId) => API.delete(`/chat/${sessionId}`);
export const deleteChatThread = (chatId) => API.delete(`/chat/thread/${chatId}`);
export const getCredits = () => API.get('/chat/user/credits');

// Ratings & Feedback
export const getAverageRating = (userId) => API.get(`/feedback/average/${userId}`);
export const submitRating = (courseId, rating) => API.post(`/courses/${courseId}/rating`, { rating });
export const submitFeedback = (data) => API.post('/feedback', data);
export const getMentorFeedback = () => API.get('/feedback/mentor');
export const getStudentFeedbacks = () => API.get('/feedback/student');

// Uploads & AI
export const uploadFiles = (formData) => API.post('/uploads', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getUploads = (sessionId) => API.get(`/uploads/${sessionId}`);
export const getAllUploads = () => API.get('/uploads/all');
export const generateStudyGuide = (uploadId) => API.post(`/uploads/${uploadId}/generate`);
export const generateFlashcards = (uploadId) => API.post(`/uploads/${uploadId}/flashcards`);
export const generateInterview = (uploadId) => API.post(`/uploads/${uploadId}/interview`);
export const generateQuiz = (uploadId) => API.post(`/uploads/${uploadId}/quiz`);
export const generatePdf = (uploadId) => API.post(`/uploads/${uploadId}/pdf`);

export const getUploadStatus = (uploadId) => API.get(`/uploads/status/${uploadId}`);
export const getUploadPdf = (uploadId) => API.get(`/uploads/pdf/${uploadId}`, { responseType: 'blob' });
export const getFlashcards = (sessionId) => API.get(`/uploads/flashcards/${sessionId}`);
export const getInterviewQuestions = (sessionId) => API.get(`/uploads/interview/${sessionId}`);
export const getQuiz = (sessionId) => API.get(`/uploads/quiz/${sessionId}`);
export const deleteUpload = (uploadId) => API.delete(`/uploads/${uploadId}`);
export const deleteSession = (sessionId) => API.delete(`/sessions/${sessionId}`);

export default API;
