import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL, { getAuthHeaders } from '../../api';

const TeacherDashboard = ({ token }) => {
  // Navigation & Hierarchy State
  const [view, setView] = useState('CLASSROOMS'); // 'CLASSROOMS' | 'COURSES' | 'COURSE_EDITOR'
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Data State
  const [classrooms, setClassrooms] = useState([]);
  const [courses, setCourses] = useState([]);

  // Form States
  const [classroomName, setClassroomName] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [bodyText, setBodyText] = useState('');
  
  // Quiz Form State
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Fetching Data ---
  
  // 1. Fetch Classrooms on load
  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      // Assuming your backend has a GET endpoint for this
      const res = await axios.get(`${API_BASE_URL}/api/teacher/classrooms`, getAuthHeaders(token));
      setClassrooms(res.data || []);
    } catch (err) {
      console.error("Failed to fetch classrooms", err);
    }
  };

  // 2. Fetch Courses when a classroom is selected
  const fetchCourses = async (classroomId) => {
    try {
      // Assuming your backend supports fetching courses by classroom
      const res = await axios.get(`${API_BASE_URL}/api/teacher/courses?classroomId=${classroomId}`, getAuthHeaders(token));
      setCourses(res.data || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  // --- Actions ---

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/teacher/classrooms`, { name: classroomName }, getAuthHeaders(token));
      setMessage({ type: 'success', text: `Classroom created! Invite Code: ${res.data.inviteCode}` });
      setClassroomName('');
      fetchClassrooms(); // Refresh list
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create classroom' });
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await axios.post(`${API_BASE_URL}/api/teacher/courses`, { 
        title: courseTitle, 
        description: courseDescription, 
        classroomId: selectedClassroom.id 
      }, getAuthHeaders(token));
      
      setMessage({ type: 'success', text: 'Course created successfully!' });
      setCourseTitle('');
      setCourseDescription('');
      fetchCourses(selectedClassroom.id); // Refresh list
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create course' });
    }
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      await axios.post(`${API_BASE_URL}/api/teacher/contents`, { 
        contentType: 'TEXT', 
        bodyText, 
        courseId: selectedCourse.id 
      }, getAuthHeaders(token));
      
      setMessage({ type: 'success', text: 'Content saved to course!' });
      setBodyText('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add content' });
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const validOptions = options.filter(opt => opt.trim() !== '');
      await axios.post(`${API_BASE_URL}/api/teacher/questions`, { 
        questionText, 
        correctAnswer, 
        options: JSON.stringify(validOptions), 
        courseId: selectedCourse.id 
      }, getAuthHeaders(token));
      
      setMessage({ type: 'success', text: 'Question added to course!' });
      setQuestionText('');
      setCorrectAnswer('');
      setOptions(['', '', '', '']);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add question' });
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // --- Navigation Helpers ---
  const goToCourses = (classroom) => {
    setSelectedClassroom(classroom);
    fetchCourses(classroom.id);
    setView('COURSES');
    setMessage(null);
  };

  const goToCourseEditor = (course) => {
    setSelectedCourse(course);
    setView('COURSE_EDITOR');
    setMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Dynamic Breadcrumb Navigation */}
      <div className="mb-8 flex items-center space-x-2 text-sm text-gray-500">
        <button 
          onClick={() => { setView('CLASSROOMS'); setSelectedClassroom(null); setSelectedCourse(null); setMessage(null); }}
          className={`hover:text-indigo-600 font-medium ${view === 'CLASSROOMS' ? 'text-indigo-600' : ''}`}
        >
          My Classrooms
        </button>
        
        {selectedClassroom && (
          <>
            <span>/</span>
            <button 
              onClick={() => { setView('COURSES'); setSelectedCourse(null); setMessage(null); }}
              className={`hover:text-indigo-600 font-medium ${view === 'COURSES' ? 'text-indigo-600' : ''}`}
            >
              {selectedClassroom.name || 'Classroom'}
            </button>
          </>
        )}

        {selectedCourse && (
          <>
            <span>/</span>
            <span className="text-gray-900 font-medium">{selectedCourse.title || 'Course Editor'}</span>
          </>
        )}
      </div>

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {view === 'CLASSROOMS' && 'Manage Classrooms'}
          {view === 'COURSES' && `${selectedClassroom?.name} - Courses`}
          {view === 'COURSE_EDITOR' && `Editing: ${selectedCourse?.title}`}
        </h1>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* LEVEL 1: CLASSROOMS */}
      {view === 'CLASSROOMS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List Existing */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Your Classrooms</h2>
            {classrooms.length === 0 ? (
              <p className="text-gray-500 bg-white p-6 rounded-lg border border-gray-200">No classrooms created yet.</p>
            ) : (
              classrooms.map((cls, idx) => (
                <div key={cls.id || idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => goToCourses(cls)}>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{cls.name}</h3>
                    <p className="text-sm text-gray-500">Invite Code: <span className="font-mono text-indigo-600 font-medium">{cls.inviteCode}</span></p>
                  </div>
                  <button className="text-indigo-600 font-medium hover:text-indigo-800">
                    Manage Courses &rarr;
                  </button>
                </div>
              ))
            )}
          </div>
          
          {/* Create New */}
          <div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Create New Classroom</h2>
              <form onSubmit={handleCreateClassroom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" required value={classroomName} onChange={(e) => setClassroomName(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" placeholder="e.g. Fall Math 101" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium">Create</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 2: COURSES */}
      {view === 'COURSES' && selectedClassroom && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Courses in this Classroom</h2>
            {courses.length === 0 ? (
              <p className="text-gray-500 bg-white p-6 rounded-lg border border-gray-200">No courses created in this classroom yet.</p>
            ) : (
              courses.map((course, idx) => (
                <div key={course.id || idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => goToCourseEditor(course)}>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Course ID: {course.id}</p>
                  </div>
                  <button className="text-indigo-600 font-medium hover:text-indigo-800 whitespace-nowrap ml-4">
                    Edit Content &rarr;
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Add New Course</h2>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" required value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea required value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} rows={3} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium">Create Course</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 3: COURSE EDITOR (Content & Quiz) */}
      {view === 'COURSE_EDITOR' && selectedCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Content Editor */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
              Course Content
            </h2>
            <form onSubmit={handleCreateContent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reading Material / Body Text</label>
                <textarea 
                  required 
                  value={bodyText} 
                  onChange={(e) => setBodyText(e.target.value)} 
                  rows={12} 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border font-mono" 
                  placeholder="Enter the lesson text here..." 
                />
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium">Save Content</button>
            </form>
          </div>

          {/* Quiz Builder */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Add Quiz Questions
            </h2>
            <form onSubmit={handleCreateQuiz} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <input type="text" required value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Multiple Choice Options</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="w-8 text-sm text-gray-500 font-medium">{idx + 1}.</span>
                    <input 
                      type="text" 
                      value={opt} 
                      onChange={(e) => updateOption(idx, e.target.value)} 
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" 
                      placeholder={`Option ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <input type="text" required value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border" placeholder="Type the exact text of the correct option" />
              </div>
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium">Add Question</button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;