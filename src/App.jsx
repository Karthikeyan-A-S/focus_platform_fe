import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './api';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import CoursePlayer from './components/student/CoursePlayer';

function App() {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [currentView, setCurrentView] = useState('LOGIN');
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Global Axios Interceptor for 401/403
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleLoginSuccess = (token, role, name) => {
    setUserToken(token);
    setUserRole(role);
    setUserName(name);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setUserToken(null);
    setUserRole(null);
    setUserName(null);
    setSelectedCourseId(null);
    setCurrentView('LOGIN');
  };

  const startCourse = (courseId) => {
    setSelectedCourseId(courseId);
    setCurrentView('COURSE_PLAYER');
  };

  const exitCourse = () => {
    setSelectedCourseId(null);
    setCurrentView('DASHBOARD');
  };

  // Render Navigation Bar for logged in users
  const renderNavBar = () => {
    if (!userToken) return null;
    
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('DASHBOARD')}>
                <div className="w-8 h-8 bg-indigo-600 text-white flex items-center justify-center rounded-lg font-bold text-xl">F</div>
                <span className="font-bold text-xl text-indigo-900 tracking-tight hidden sm:block">Focus Platform</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-900">{userName}</span>
                <span className="text-xs text-indigo-600 font-medium">[{userRole}]</span>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-4 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-3 py-1.5 rounded-md text-sm font-medium border border-gray-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {renderNavBar()}
      
      <main className="flex-1 flex flex-col">
        {currentView === 'LOGIN' && (
          <Login onSuccess={handleLoginSuccess} goToRegister={() => setCurrentView('REGISTER')} />
        )}
        
        {currentView === 'REGISTER' && (
          <Register onSuccess={() => setCurrentView('LOGIN')} goToLogin={() => setCurrentView('LOGIN')} />
        )}

        {currentView === 'DASHBOARD' && userToken && userRole === 'TEACHER' && (
          <TeacherDashboard token={userToken} />
        )}

        {currentView === 'DASHBOARD' && userToken && userRole === 'STUDENT' && (
          <StudentDashboard token={userToken} onStartCourse={startCourse} />
        )}

        {currentView === 'COURSE_PLAYER' && userToken && userRole === 'STUDENT' && selectedCourseId && (
          <CoursePlayer token={userToken} courseId={selectedCourseId} onExit={exitCourse} />
        )}
      </main>
    </div>
  );
}

export default App;