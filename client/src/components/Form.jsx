import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Form = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '', isOpen: false });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getForm();
  }, [formId]);

  const getForm = async () => {
    try {
      const [formResponse, questionsResponse] = await Promise.all([
        axios.get(`http://localhost:8000/form/get_form_view/${formId}`),
        axios.get('http://localhost:8000/question/get_questions', { params: { form_id: formId } })
      ]);

      if (formResponse.data.message === "Form not found") {
        navigate('/dashboard');
        return;
      }

      const formData = formResponse.data[0] || {};
      setFormData({
        name: formData.form_name || '',
        description: formData.description || '',
        isOpen: formData.form_open || false
      });

      const questionsWithOptions = await Promise.all(questionsResponse.data.map(async (question) => {
        const optionsResponse = await axios.get('http://localhost:8000/options/get_options', {
          params: { question_id: question.id }
        });
        return {
          id: question.id,
          type: question.type_name || 'short-answer',
          text: question.question_text || '',
          options: optionsResponse.data.map(option => ({
            text: option.option_text || '',
            id: option.option_id
          }))
        };
      }));

      setQuestions(questionsWithOptions);
      setAnswers(questionsWithOptions.map(() => ({ text: '', questionId: '' })));
    } catch (error) {
      console.error('Error fetching form data:', error);
      setError('Error fetching form data');
    }
  };

  const handleAnswerChange = (index, value, questionId) => {
    setAnswers(prev => prev.map((answer, i) =>
      i === index ? { text: value, questionId } : answer
    ));
  };

  const handleSubmit = async () => {
    if (answers.some(answer => !answer.text)) {
      setError("Please answer all the questions");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/response/create_response', { answers });
      if (response.data === "Response created successfully") {
        navigate(`/submitted/${formId}`);
      } else {
        setError("Failed to submit response");
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setError("Error submitting response");
    }
  };

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'short-answer':
        return (
          <input
            type="text"
            value={answers[index].text}
            onChange={(e) => handleAnswerChange(index, e.target.value, question.id)}
            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition duration-300 ease-in-out"
            placeholder="Your answer"
          />
        );
      case 'long-answer':
        return (
          <textarea
            value={answers[index].text}
            onChange={(e) => handleAnswerChange(index, e.target.value, question.id)}
            className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition duration-300 ease-in-out"
            rows="4"
            placeholder="Your answer"
          />
        );
      case 'mcq':
        return (
          <div className="space-y-2">
            {question.options.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.text}
                  checked={answers[index].text === option.text}
                  onChange={() => handleAnswerChange(index, option.text, question.id)}
                  className="form-radio h-5 w-5 text-purple-600 transition duration-300 ease-in-out"
                />
                <span className="text-gray-700">{option.text}</span>
              </label>
            ))}
          </div>
        );
      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers[index].text.includes(option.text)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...answers[index].text, option.text]
                      : answers[index].text.filter(t => t !== option.text);
                    handleAnswerChange(index, newValue, question.id);
                  }}
                  className="form-checkbox h-5 w-5 text-purple-600 rounded transition duration-300 ease-in-out"
                />
                <span className="text-gray-700">{option.text}</span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (!formData.isOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Form Closed</h2>
          <p className="text-gray-600">We apologize, but this form is no longer accepting responses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
     

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <div className="bg-purple-600 py-8 px-6 sm:px-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{formData.name}</h1>
            <h1
              className="absolute top-5 right-5 text-4xl font-bold text-white "
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)' }}
            >
              tuFoo
            </h1>
            <p className="text-purple-100">{formData.description}</p>
          </div>
          <div className="px-6 sm:px-10 py-8 space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  <span className="text-purple-600 mr-2">{index + 1}.</span>
                  {question.text}
                </h3>
                {renderQuestion(question, index)}
              </div>
            ))}
            <div className="flex justify-end mt-8">
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg"
              >
                Submit Response
              </button>
            </div>
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mt-4" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;