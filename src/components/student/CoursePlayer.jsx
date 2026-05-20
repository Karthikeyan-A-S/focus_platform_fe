import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL, { getAuthHeaders } from '../../api';

const CoursePlayer = ({ token, courseId, onExit }) => {
  const [step, setStep] = useState(1);
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContent();
  }, [courseId]);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Read Content
      const res = await axios.get(`${API_BASE_URL}/api/student/courses/${courseId}/content`, getAuthHeaders(token));
      // In case the API returns an array of contents or a single content object
      const data = res.data;
      if (Array.isArray(data) && data.length > 0) {
        setContent(data[0].bodyText); // assuming first item
      } else if (data && data.bodyText) {
        setContent(data.bodyText);
      } else {
        setContent(typeof data === 'string' ? data : JSON.stringify(data));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course content.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/student/courses/${courseId}/questions`, getAuthHeaders(token));
      setQuestions(res.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/student/submit`, { 
        courseId: parseInt(courseId), 
        answers 
      }, getAuthHeaders(token));
      setScore(res.data.score || res.data); // Adjust depending on if backend returns a number or object
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onExit} className="text-gray-500 hover:text-gray-700 flex items-center">
          &larr; Back to Dashboard
        </button>
        <span className="text-sm font-medium text-indigo-600">Step {step} of 3</span>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-8">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
              {content || 'No content available for this course yet.'}
            </div>
            <div className="mt-8 flex justify-end">
              <button 
                onClick={fetchQuestions}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium"
              >
                Next to Quiz
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Quiz</h2>
            {questions.length === 0 ? (
              <p className="text-gray-500">No questions available for this quiz.</p>
            ) : (
              <div className="space-y-8">
                {questions.map((q, idx) => {
                  let parsedOptions = [];
                  try {
                    parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                  } catch (e) {
                    parsedOptions = [];
                  }

                  return (
                    <div key={q.id || idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <p className="font-medium text-lg mb-4">{idx + 1}. {q.questionText}</p>
                      <div className="space-y-3">
                        {parsedOptions.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center p-3 rounded-md border border-gray-200 bg-white hover:bg-indigo-50 cursor-pointer transition-colors">
                            <input 
                              type="radio" 
                              name={`question-${q.id || idx}`}
                              value={opt}
                              checked={answers[q.id || idx] === opt}
                              onChange={() => handleOptionChange(q.id || idx, opt)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-gray-300"
                            />
                            <span className="ml-3 text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2"
              >
                Back to Content
              </button>
              <button 
                onClick={submitQuiz}
                disabled={Object.keys(answers).length !== questions.length || questions.length === 0}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
            <div className="text-6xl font-bold text-indigo-600 mb-6">
              {score !== null ? `${score}%` : 'N/A'}
            </div>
            <p className="text-xl text-gray-600 mb-8">
              You have successfully completed this course module.
            </p>
            <button 
              onClick={onExit}
              className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 font-medium text-lg"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;