import React, { useState , useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import axios from 'axios';


const Form = () => {
  const location = useLocation();
  // pop 2 times
  const path = location.pathname.split('/');
  path.pop();
  const formId = path.pop();
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getForm();
  }, []);
  const getForm = async () => {
    const formResponse = await axios.get(`http://localhost:8000/form/get_form_view/${formId}`);
    // console.log("hi");
    if (formResponse.data.message === "Form not found") {
      console.log("A");
      // navigate('/dashboard');
      return;
    }
    // console.log(formResponse.data);
    const formData = formResponse.data[0] || {};
    setFormName(formData.form_name || '');
    setFormDescription(formData.description || '');
    
    const questionsResponse = await axios.get('http://localhost:8000/question/get_questions', {
      params: { form_id: formId }
    });

    const questionsData = questionsResponse.data || [];

    const questionsWithOptions = await Promise.all(questionsData.map(async (question) => {
      // console.log(question);
      try {
        const optionsResponse = await axios.get('http://localhost:8000/options/get_options', {
          params: { question_id: question.question_id }
        });
        // console.log(optionsResponse);
        const options = optionsResponse.data || [];

        // console.log(options);

        return {
          question_id: question.question_id,
          type: question.type_name || 'short-answer',
          questionText: question.question_text || '',
          options: options.map(option => ({
            option_text: option.option_text || '',
            option_id: option.option_id
          }))
        };
      } catch (err) {
        console.error(err);
        return null;
      }
    }));
    setQuestions(questionsWithOptions);
    // console.log(questionsWithOptions);
  }

 const handleAnswerTextChange = (questionIndex, text) => {
   const updateAnswers = [...answers];
   
    updateAnswers[questionIndex] = {
      text: text,
      question_id: questions[questionIndex].question_id
    };
    setAnswers(updateAnswers);

  };

  const handleOptionChange = (questionIndex, optionText, text , questions_type) => {
    const updateAnswers = [...answers];
    if(questions_type === "mcq"){
      updateAnswers[questionIndex] = {
        text: optionText,
        question_id: questions[questionIndex].question_id
      };
    }
    else{
      if (!updateAnswers[questionIndex]) {
          updateAnswers[questionIndex] = {
          text: [], 
          question_id: questions[questionIndex].question_id
        }
      }
      updateAnswers[questionIndex].text.push(optionText);
    }
    setAnswers(updateAnswers);
  };


  const handleSubmit = async () => {
    console.log("hi");
    
    if(answers.length !== questions.length){
      setError("Please answer all the questions");
      return;
    }
    const response = await axios.post('http://localhost:8000/response/create_response', {
      answers
    });
    // console.log(response);

    window.location.href('/formSubmitted');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all">
        <div className="px-8 py-8 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-4xl font-extrabold text-white tracking-wide">{formName}</h2>
          <p className="mt-2 text-blue-100">{formDescription}</p>
        </div>
        <div className="p-8 space-y-8">
          {questions.map((question, index) => (
            <div key={question.question_id} className="bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <label className="block text-xl font-semibold text-gray-800 mb-4">
                <span className="text-indigo-600 mr-2">Q{index + 1}.</span>
                {question.questionText}
              </label>

              {question.type === 'short-answer' && (
                <input
                  type="text"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out"
                  placeholder="Your answer"
                  defaultValue={''}
                  onChange={(e) => handleAnswerTextChange(index, e.target.value)}
                />
              )}

              {question.type === 'long-answer' && (
                <textarea
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out"
                  rows="4"
                  placeholder="Your answer"
                  defaultValue={''}
                  onChange={(e) => handleAnswerTextChange(index, e.target.value)}
                ></textarea>
              )}

              {(question.type === 'mcq' || question.type === 'checkboxes') && (
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <div key={option.option_id} className="flex items-center">
                      <input
                        type={question.type === 'mcq' ? 'radio' : 'checkbox'}
                        id={`option-${option.option_id}`}
                        name={`question-${question.question_id}`}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        onChange={(e) => handleOptionChange(index, option.option_text, e.target.checked , question.type)}
                      />
                      <label htmlFor={`option-${option.option_id}`} className="ml-3 block text-sm font-medium text-gray-700">
                        {option.option_text}
                      </label>
                    </div>
                  ))}
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
}

export default Form
