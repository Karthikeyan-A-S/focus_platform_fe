import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL, { getAuthHeaders } from '../../api';

const StudentDashboard = ({ token, onStartCourse }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [courseIdToStart, setCourseIdToStart] = useState('');
  const [enrollMessage, setEnrollMessage] = useState(null);

  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrollMessage(null);
    try {
      await axios.post(`${API_BASE_URL}/api/student/enroll`, { inviteCode }, getAuthHeaders(token));
      setEnrollMessage({ type: 'success', text: 'Successfully enrolled in classroom!' });
      setInviteCode('');
    } catch (err) {
      setEnrollMessage({ type: 'error', text: err.response?.data?.message || 'Failed to enroll' });
    }
  };

  const handleStartCourse = (e) => {
    e.preventDefault();
    if (courseIdToStart.trim()) {
      onStartCourse(courseIdToStart.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Enrollment Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-2 rounded-md">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold ml-3">Classroom Enrollment</h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">Got an invite code from your teacher? Enter it here to join the classroom.</p>
          
          {enrollMessage && (
            <div className={`mb-4 p-3 rounded-md text-sm ${enrollMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {enrollMessage.text}
            </div>
          )}

          <form onSubmit={handleEnroll} className="flex gap-4">
            <input 
              type="text" 
              required 
              placeholder="e.g. A1B2C3" 
              value={inviteCode} 
              onChange={(e) => setInviteCode(e.target.value)} 
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" 
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium whitespace-nowrap">
              Join
            </button>
          </form>
        </div>

        {/* Course Selection Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-2 rounded-md">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold ml-3">Start Learning</h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">Ready to learn? Enter the ID of the course you want to study today.</p>
          
          <form onSubmit={handleStartCourse} className="flex gap-4">
            <input 
              type="number" 
              required 
              placeholder="Course ID" 
              value={courseIdToStart} 
              onChange={(e) => setCourseIdToStart(e.target.value)} 
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" 
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium whitespace-nowrap">
              Start Course
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;