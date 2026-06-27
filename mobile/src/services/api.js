import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Host local Wi-Fi IP address (192.168.55.104) enables both emulators and physical devices on the same network to connect.
const getBaseURL = () => {
  return 'http://192.168.55.104:5000/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Authentication
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/user/profile');
export const updateProfile = (data) => API.put('/user/profile', data);
export const updatePassword = (data) => API.put('/user/password', data);

// Courses
export const getMyCourses = () => API.get('/courses/my');
export const getCourseDetails = (id) => API.get(`/courses/${id}`);

// Modules
export const getModules = (courseId) => API.get(`/modules/${courseId}`);

// Sessions
export const getSessions = (courseId) => API.get(`/sessions/${courseId}`);

// Uploads & AI Materials
export const getAllUploads = () => API.get('/uploads/all');
export const getUploads = (sessionId) => API.get(`/uploads/${sessionId}`);
export const getUploadStatus = (uploadId) => API.get(`/uploads/status/${uploadId}`);
export const getFlashcards = (sessionId) => API.get(`/uploads/flashcards/${sessionId}`);
export const getInterviewQuestions = (sessionId) => API.get(`/uploads/interview/${sessionId}`);
export const getQuiz = (sessionId) => API.get(`/uploads/quiz/${sessionId}`);

// Ratings & Feedback
export const submitFeedback = (data) => API.post('/feedback', data);
export const getStudentFeedbacks = () => API.get('/feedback/student');

export default API;
