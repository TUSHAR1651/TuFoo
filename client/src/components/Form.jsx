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
      case 'long-answer':
        return (
          <input
            type={question.type === 'short-answer' ? 'text' : 'textarea'}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out"
            value={answers[index].text}
            onChange={(e) => handleAnswerChange(index, e.target.value, question.id)}
          />
        );
      case 'mcq':
      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center">
                <input
                  type={question.type === 'mcq' ? 'radio' : 'checkbox'}
                  id={`option-${option.id}`}
                  name={`question-${question.id}`}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={question.type === 'mcq'
                    ? answers[index].text === option.text
                    : answers[index].text.includes(option.text)}
                  onChange={() => {
                    const newValue = question.type === 'mcq'
                      ? option.text
                      : answers[index].text.includes(option.text)
                        ? answers[index].text.filter(t => t !== option.text)
                        : [...answers[index].text, option.text];
                    handleAnswerChange(index, newValue, question.id);
                  }}
                />
                <label htmlFor={`option-${option.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        {!formData.isOpen ? (
          <div className="bg-red-500 text-white text-center p-4">
            <p className="text-2xl font-bold">Form Closed</p>
          </div>
        ) : (
          <>
            <div className="px-8 py-8 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-4xl font-extrabold text-white tracking-wide">{formData.name}</h2>
              <p className="mt-2 text-blue-100">{formData.description}</p>
            </div>
            <div className="p-8 space-y-8">
              {questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <label className="block text-xl font-semibold text-gray-800 mb-4">
                    <span className="text-indigo-600 mr-2">Q{index + 1}.</span>
                    {question.text}
                  </label>
                  {renderQuestion(question, index)}
                </div>
              ))}

              <div className="flex justify-end mt-12">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="py-3 px-8 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Submit Response
                </button>
              </div>

              {error && (
                <div className="text-red-600 text-center mt-4">
                  {error}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Form;