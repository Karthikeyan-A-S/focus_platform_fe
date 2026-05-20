import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL, { getAuthHeaders } from '../../api';

const StudentDashboard = ({ token, onStartCourse }) => {
  // Navigation & Hierarchy State
  const [view, setView] = useState('CLASSROOMS'); // 'CLASSROOMS' | 'COURSES'
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  // Data State
  const [classrooms, setClassrooms] = useState([]);
  const [courses, setCourses] = useState([]);

  // Enrollment State
  const [inviteCode, setInviteCode] = useState('');
  const [enrollMessage, setEnrollMessage] = useState(null);
  
  // Loading State
  const [loading, setLoading] = useState(false);

  // --- Fetching Data ---
  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/student/classrooms`, getAuthHeaders(token));
      setClassrooms(res.data || []);
    } catch (err) {
      console.error("Failed to fetch classrooms", err);
    }
  };

  const fetchCourses = async (classroomId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/student/courses?classroomId=${classroomId}`, getAuthHeaders(token));
      setCourses(res.data || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  // --- Actions ---
  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrollMessage(null);
    try {
      await axios.post(`${API_BASE_URL}/api/student/enroll`, { inviteCode }, getAuthHeaders(token));
      setEnrollMessage({ type: 'success', text: 'Successfully enrolled in classroom!' });
      setInviteCode('');
      fetchClassrooms(); // Refresh classrooms list
    } catch (err) {
      setEnrollMessage({ type: 'error', text: err.response?.data?.message || 'Failed to enroll' });
    }
  };

  const handleStartCourse = (courseId) => {
    if (courseId) {
      onStartCourse(courseId);
    }
  };

  // --- Navigation Helpers ---
  const goToCourses = (classroom) => {
    setSelectedClassroom(classroom);
    fetchCourses(classroom.id);
    setView('COURSES');
    setEnrollMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Dynamic Breadcrumb Navigation */}
      <div className="mb-8 flex items-center space-x-2 text-sm text-gray-500">
        <button 
          onClick={() => { setView('CLASSROOMS'); setSelectedClassroom(null); setEnrollMessage(null); }}
          className={`hover:text-indigo-600 font-medium ${view === 'CLASSROOMS' ? 'text-indigo-600' : ''}`}
        >
          My Classrooms
        </button>
        
        {selectedClassroom && (
          <>
            <span>/</span>
            <span className="text-gray-900 font-medium">{selectedClassroom.name || 'Classroom'}</span>
          </>
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {view === 'CLASSROOMS' && 'Student Dashboard'}
          {view === 'COURSES' && `${selectedClassroom?.name} - Courses`}
        </h1>
      </div>

      {enrollMessage && (
        <div className={`mb-6 p-4 rounded-md ${enrollMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {enrollMessage.text}
        </div>
      )}

      {/* LEVEL 1: CLASSROOMS */}
      {view === 'CLASSROOMS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List Existing Classrooms */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Enrolled Classrooms</h2>
            {classrooms.length === 0 ? (
              <p className="text-gray-500 bg-white p-6 rounded-lg border border-gray-200">You are not enrolled in any classrooms yet.</p>
            ) : (
              classrooms.map((cls, idx) => (
                <div key={cls.id || idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => goToCourses(cls)}>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{cls.name}</h3>
                  </div>
                  <button className="text-indigo-600 font-medium hover:text-indigo-800">
                    View Courses &rarr;
                  </button>
                </div>
              ))
            )}
          </div>
          
          {/* Join New Classroom */}
          <div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Join Classroom
              </h2>
              <form onSubmit={handleEnroll} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. A1B2C3" 
                    value={inviteCode} 
                    onChange={(e) => setInviteCode(e.target.value)} 
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" 
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium">
                  Enroll
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 2: COURSES */}
      {view === 'COURSES' && selectedClassroom && (
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-xl font-semibold mb-4">Available Courses</h2>
          {courses.length === 0 ? (
            <p className="text-gray-500 bg-white p-6 rounded-lg border border-gray-200">No courses available in this classroom yet.</p>
          ) : (
            courses.map((course, idx) => (
              <div key={course.id || idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => handleStartCourse(course.id)}>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 whitespace-nowrap ml-4">
                  Start Learning
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;