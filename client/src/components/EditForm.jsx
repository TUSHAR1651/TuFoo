import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { PlusCircle, MinusCircle, Save, ArrowLeft, Trash2, Edit3 } from 'lucide-react';

const EditForm = () => {
    const userId = Cookies.get('userId');
    const location = useLocation();
    const navigate = useNavigate();
    const formId = location.pathname.split('/').pop();
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const [DeletedOptions, setDeletedOptions] = useState([]);
    const [DeletedQuestions, setDeletedQuestions] = useState([]);

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
            // console.log(questionsData);
            const questionsWithOptions = await Promise.all(questionsData.map(async (question) => {
                try {
                    const optionsResponse = await axios.get('http://localhost:8000/options/get_options', {
                        params: { question_id: question.id }
                    });
                    const options = optionsResponse.data || [];

                    return {
                        question_id: question.id,
                        type: question.type_name || 'short-answer',
                        questionText: question.question_text || '',
                        isOn : question.required,
                        options: options.map(option => ({
                            option_text: option.option_text || '',
                            option_id: option.id
                        }))
                    };
                } catch (optionsError) {
                    console.error('Error fetching options:', optionsError);
                    return {
                        question_id: question.id,
                        type: question.type_name || 'short-answer',
                        isOn : question.required,
                        questionText: question.question_text || '',
                        options: []
                    };
                }
            }));
            setQuestions(questionsWithOptions);

            console.log(questionsWithOptions);
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

    const removeQuestion = (index, question_id) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
        // console.log();
        if (question_id) {
            setDeletedQuestions([...DeletedQuestions, question_id]);
        }
        console.log(DeletedQuestions);
        
    };

    const handleQuestionTextChange = (index, text) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].questionText = text;
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex, optionIndex, text) => {
        // console.log(text);
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = { ...updatedQuestions[questionIndex].options[optionIndex], option_text: text };
        // console.log(updatedQuestions[questionIndex].options[optionIndex]);
        setQuestions(updatedQuestions);
    };

    const addOption = (questionIndex) => {
        // console.log("hi");
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.push({ option_text: '' });
        setQuestions(updatedQuestions);
    };
   

    const removeOption = (questionIndex, optionIndex, option_id) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.splice(optionIndex, 1);
        setQuestions(updatedQuestions);

        if (option_id) {
            setDeletedOptions([...DeletedOptions, option_id]);
        }
    };
    const toggleQuestionState = (index) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].isOn = !updatedQuestions[index].isOn; 
        setQuestions(updatedQuestions);
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
            if (response.data.message !== "Form Updated Successfully") {
                setError('Failed to update form');
                return;
            }
        } catch {
            setError("Failed to update form");
            return;
        }

        try {
            await axios.put(`http://localhost:8000/question/update_question/${formId}`, {
                questions
            });
        } catch (err) {
            console.error('Error updating questions:', err);
            setError("Failed to update questions");
            return;
        }

        try {
            for (let option_id of DeletedOptions) {
                await axios.delete(`http://localhost:8000/options/delete_option/${option_id}`);
            }
        } catch (err) {
            console.error('Error deleting options:', err);
            setError("Failed to delete options");
            return;
        }

        try {

            for (let question_id of DeletedQuestions) {
                await axios.delete(`http://localhost:8000/question/delete_question/${question_id}`);
            }
        } catch (err) {
            console.error('Error deleting questions:', err);
            setError("Failed to delete questions");
            return;
        }

        window.location.href = '/dashboard';
    };

           return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition duration-150 ease-in-out"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="px-8 py-6 bg-gradient-to-r from-indigo-400 to-purple-500">
                            <h2 className="text-3xl font-bold text-white flex items-center">
                                <Edit3 className="w-8 h-8 mr-3" />
                                Edit Form
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">{error}</div>}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Enter form name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Form Description</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Enter form description"
                                    rows="4"
                                ></textarea>
                            </div>

                            {questions.length === 0 && (
                                <p className="text-gray-500 italic">No questions added yet. Click 'Add Question' to start.</p>
                            )}

                            {questions.map((question, index) => (
                                <div key={index} className="mb-8 bg-gray-50 rounded-lg p-6 shadow-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-lg font-semibold text-gray-800">Question {index + 1}</label>
                                            <div>
                                                {/* Toggle Button */}
                                                    <h5 className="inline-block text-lg text-gray-800 mr-4">
                                                        Required:
                                                    </h5>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleQuestionState(index)}
                                                        className={`px-4 py-2 rounded-full text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ${
                                                        question.isOn ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
                                                        }`}
                                                    >
                                                    {question.isOn ? 'ON' : 'OFF'}
                                                    </button>
                                                </div>
                                                {/* Remove Button */}
                                                    <button
                                                    type="button"
                                                    className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
                                                    onClick={() => removeQuestion(index , question.question_id)}
                                                    >
                                                        <FaTrash className="inline-block mr-2" /> Remove
                                                    </button>
                                            </div>
                            
                                                    {/* Question Text Input */}
                                            <input
                                                        type="text"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                                        placeholder="Enter your question"
                                                        value={question.questionText}
                                                        onChange={(e) => handleQuestionTextChange(index, e.target.value)}
                                                        required
                                                    />
                            
                                                    {/* Question Type Selector */}
                                                    <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Question Type</label>
                                                    <select
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                                        value={question.type}
                                                        onChange={(e) => handleQuestionTypeChange(index, e.target.value)}
                                                    >
                                                        <option value="short-answer">Short Answer</option>
                                                        <option value="long-answer">Long Answer</option>
                                                        <option value="mcq">Multiple Choice (MCQ)</option>
                                                        <option value="checkboxes">Checkboxes</option>
                                                    </select>
                            
                                                    {/* Options Section for MCQ or Checkboxes */}
                                                    {(question.type === 'mcq' || question.type === 'checkboxes') && (
                                                        <div className="mt-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                                        {question.options.map((option, optionIndex) => (
                                                            <div key={optionIndex} className="flex items-center mb-2">
                                                            <input
                                                                type="text"
                                                                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                                                placeholder="Enter option"
                                                                value={option.option_text}
                                                                onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                                                required
                                                            />
                                                            <button
                                                                type="button"
                                                                className="ml-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
                                                                onClick={() => removeOption(index, optionIndex)}
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            className="mt-2 py-2 px-4 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
                                                            onClick={() => addOption(index)}
                                                        >
                                                            <FaPlus className="inline-block mr-2" /> Add Option
                                                        </button>
                                                        </div>
                                                    )}
                                                    </div>
                                                ))}
                            <div className="flex justify-between mt-8">
                                <button
                                    type="button"
                                    className="flex items-center py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out transform hover:scale-105"
                                    onClick={addQuestion}
                                >
                                    <PlusCircle className="w-5 h-5 mr-2" />
                                    Add Question
                                </button>

                                <button
                                    type="submit"
                                    className="flex items-center py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out transform hover:scale-105"
                                >
                                    <Save className="w-5 h-5 mr-2" />
                                    Update Form
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    export default EditForm;