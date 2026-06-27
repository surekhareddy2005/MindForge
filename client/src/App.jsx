import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import CourseStudents from './pages/CourseStudents';
import AllStudents from './pages/AllStudents';
import ModuleDetails from './pages/ModuleDetails';
import Session from './pages/Session';
import StudyGuide from './pages/StudyGuide';
import Guides from './pages/Guides';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import MentorFeedback from './pages/MentorFeedback';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageCourses from './pages/ManageCourses';
import ProtectedRoute from './components/ProtectedRoute';
import StudentProtectedRoute from './components/student/StudentProtectedRoute';
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentStudyMaterials from './pages/student/StudentStudyMaterials';
import StudentFeedback from './pages/student/StudentFeedback';
import StudentSettings from './pages/student/StudentSettings';
import StudentCourseDetails from './pages/student/StudentCourseDetails';
import StudentModuleDetails from './pages/student/StudentModuleDetails';
import StudentSession from './pages/student/StudentSession';
import { ThemeProvider } from './utils/ThemeContext';
import PageTransition from './components/PageTransition';
import TopLoadingBar from './components/TopLoadingBar';

function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <TopLoadingBar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          
          {/* Mentor Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/courses" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Courses />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course/:courseId" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <CourseDetails />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course/:courseId/students" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <CourseStudents />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/course/:courseId/module/:moduleId" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ModuleDetails />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/session/:sessionId" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Session />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study-guide/:sessionId/:uploadId" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <StudyGuide />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/guides" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Guides />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Settings />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Profile />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <MentorFeedback />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <AllStudents />
                </PageTransition>
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ManageUsers />
                </PageTransition>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/courses" 
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ManageCourses />
                </PageTransition>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/dashboard"
            element={
              <StudentProtectedRoute>
                <PageTransition>
                  <StudentDashboard />
                </PageTransition>
              </StudentProtectedRoute>
            }
          />
          <Route 
            path="/student/courses"
            element={
              <StudentProtectedRoute>
                <PageTransition>
                  <StudentCourses />
                </PageTransition>
              </StudentProtectedRoute>
            }
          />
          <Route 
            path="/student/course/:courseId"
            element={
              <StudentProtectedRoute>
                <PageTransition>
                  <StudentCourseDetails />
                </PageTransition>
              </StudentProtectedRoute>
            }
          />
          <Route 
            path="/student/course/:courseId/module/:moduleId"
            element={
              <StudentProtectedRoute>
                <PageTransition>
                  <StudentModuleDetails />
                </PageTransition>
              </StudentProtectedRoute>
            }
          />
          <Route 
            path="/student/session/:sessionId"
            element={
              <StudentProtectedRoute>
                <PageTransition>
                  <StudentSession />
                </PageTransition>
              </StudentProtectedRoute>
            }
          />
          <Route 
            path="/student/materials"
            element={
              <StudentProtectedRoute>
                <PageTransition>
                  <StudentStudyMaterials />
                </PageTransition>
              </StudentProtectedRoute>
            }
          />
          <Route 
            path="/student/feedback"
            element={
              <StudentProtectedRoute>
                <PageTransition>
                  <StudentFeedback />
                </PageTransition>
              </StudentProtectedRoute>
            }
          />
          <Route 
            path="/student/settings"
            element={
              <StudentProtectedRoute>
                <PageTransition>
                  <StudentSettings />
                </PageTransition>
              </StudentProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
