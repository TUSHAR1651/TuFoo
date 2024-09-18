import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const EditForm = () => {
    const userId = Cookies.get('userId');
    const location = useLocation();
    const navigate = useNavigate();
    const formId = location.pathname.split('/').pop();
    console.log(location.pathname.split('/'));
    console.log("A" , formId);
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        getForm();
    }, [formId]);

    const getForm = async () => {
        try {
            const formResponse = await axios.get(`http://localhost:8000/form/get_form/${formId}`, {
                params: { userId }
            });

            if (formResponse.data.message === "Form not found") {
                navigate('/dashboard');
                return;
            }

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
                        params: { question_id: question.id }
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
                } catch (optionsError) {
                    console.error('Error fetching options:', optionsError);
                    return {
                        question_id: question.question_id,
                        type: question.type_name || 'short-answer',
                        questionText: question.question_text || '',
                        options: []
                    };
                }
            }));
            // console.log(questionsWithOptions);
            setQuestions(questionsWithOptions);
        } catch (error) {
            console.error("Error fetching form:", error);
            setError('Failed to fetch form data.');
        }
    };

    const handleQuestionTypeChange = useCallback((index, type) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].type = type;
        updatedQuestions[index].options = type === 'mcq' || type === 'checkboxes' ? (updatedQuestions[index].options.length ? updatedQuestions[index].options : ['']) : [];
        setQuestions(updatedQuestions);
    }, [questions]);

    const addQuestion = () => {

        setQuestions([...questions, { type: 'short-answer', questionText: '', options: [] }]);


    };

    const removeQuestion = (index , question_id) => {

        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);

        // console.log(1 , question_id);

        if (question_id) {
            const response = axios.delete(`http://localhost:8000/question/delete_question/${question_id}`);
            
        }
    };

    const handleQuestionTextChange = (index, text) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].questionText = text;
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex, optionIndex, text) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = { ...updatedQuestions[questionIndex].options[optionIndex], option_text: text };
        setQuestions(updatedQuestions);
    };

    const addOption = (questionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.push({ option_text: '' });
        setQuestions(updatedQuestions);
    };

    const removeOption = (questionIndex, optionIndex, option_id) => {
        // console.log(option_id);
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.splice(optionIndex, 1);
        setQuestions(updatedQuestions);

        if (option_id) {
            const response = axios.delete(`http://localhost:8000/options/delete_option/${option_id}`);
        }

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formName.trim()) {
            setError('Form name is required');
            return;
        }

        if (questions.length === 0) {
            setError('At least one question is required');
            return;
        }

        for (let question of questions) {
            if (!question.questionText.trim()) {
                setError('All questions must have text');
                return;
            }
            if ((question.type === 'mcq' || question.type === 'checkboxes') && question.options.length < 2) {
                setError('MCQ and Checkbox questions must have at least two options');
                return;
            }
        }

        const formData = {
            formName,
            formDescription,
            questions,
            userId
        };

        try {
            const response = await axios.put(`http://localhost:8000/form/update_form/${formId}`, formData);
            if (response.data.message === "Form Updated Successfully") {
                // console.log("Hi");
                // navigate('/dashboard');
            }   
            else {
                // console.log()
                setError('Failed to update form');
            }
        }catch {
            setError("Failed to update form");
        }

        try {
            // console.log(questions);
            await axios.put(`http://localhost:8000/question/update_question/${formId}`, {
                questions
            });

            // navigate('/dashboard');
            

        } catch (err) {
            console.error('Error updating questions:', err);
            setError("Failed to update questions");

        }
        if(error) {
            return;
        }

        window.location.href = '/dashboard';


        
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600">
                    <h2 className="text-3xl font-bold text-white">Edit Form</h2>
                </div>
                <div className="p-8 space-y-6">
                    {error && <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Enter form name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form Description</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Enter form description"
                            rows="4"
                        ></textarea>
                    </div>

                    {questions.length === 0 && (
                        <p className="text-gray-600 italic">No questions added yet. Click 'Add Question' to start.</p>
                    )}

                    {questions.map((question, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-md hover:shadow-lg transition duration-300">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-lg font-semibold text-gray-800">Question {index + 1}</label>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                                    onClick={() => removeQuestion(index, question.question_id)}
                                >
                                    Remove
                                </button>
                            </div>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                placeholder="Enter your question"
                                value={question.questionText}
                                onChange={(e) => handleQuestionTextChange(index, e.target.value)}
                                required
                            />

                            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Question Type</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                value={question.type}
                                onChange={(e) => handleQuestionTypeChange(index, e.target.value)}
                            >
                                <option value="short-answer">Short Answer</option>
                                <option value="long-answer">Long Answer</option>
                                <option value="mcq">Multiple Choice (MCQ)</option>
                                <option value="checkboxes">Checkboxes</option>
                            </select>

                            {(question.type === 'mcq' || question.type === 'checkboxes') && (
                                <div className="mt-4 space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Options</label>
                                    {question.options.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                                placeholder="Enter option"
                                                value={option.option_text}
                                                onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                                                onClick={() => removeOption(index, optionIndex, option.option_id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                                        onClick={() => addOption(index)}
                                    >
                                        Add Option
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="flex justify-between mt-8">
                        <button
                            type="button"
                            className="py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out transform hover:scale-105"
                            onClick={addQuestion}
                        >
                            Add Question
                        </button>

                        <button
                            type="submit"
                            className="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out transform hover:scale-105"
                        >
                            Update Form
                        </button>
                    </div>

                    {error && <p className="text-red-600 mt-4">{error}</p>}
                </div>
            </form>
        </div>
    );
};

export default EditForm;
