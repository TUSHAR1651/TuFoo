import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './UserProvider';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const CreateForm = () => {
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const userId = Cookies.get('userId');
    const addQuestion = () => {
        setQuestions([...questions, { type: 'short-answer', questionText: '', options: [] }]);
    };

    const removeQuestion = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const handleQuestionTypeChange = (index, type) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].type = type;
        if (type === 'mcq' || type === 'checkboxes') {
            updatedQuestions[index].options = updatedQuestions[index].options.length ? updatedQuestions[index].options : [''];
        }
        setQuestions(updatedQuestions);
    };

    const handleQuestionTextChange = (index, text) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].questionText = text;
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex, optionIndex, text) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = text;
        setQuestions(updatedQuestions);
    };

    const addOption = (questionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.push('');
        setQuestions(updatedQuestions);
    };

    const removeOption = (questionIndex, optionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.splice(optionIndex, 1);
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

        var success = false;
        try {
            const formId = await createForm(formData);
            console.log(`Form created with ID: ${formId}`);
            window.location.href = '/dashboard';
            // success = true;
        } catch (err) {
            setError('Failed to create form. Please try again.');
            console.error(err);
        }
        
        // if (success) {
        //     setFormName('');
        //     setFormDescription('');
        //     setQuestions([]);
        //     setError('');
        //     Navigate('/dashboard');
        // }
    };

    async function createForm(formData) {
        if (userId === null) {
            // setError('User ID is null');
            console.log("User id is null");
            throw new Error('User ID is null');
        } 
        try {
            const response = await axios.post('http://localhost:8000/form/create_form', formData);
            if (response.data.message === "Form Created Successfully") {
                const formId = response.data.formId;
                // console.log(response.data);
                // console.log(`Form created with ID: ${formId}`);
                // try {
                    await axios.post('http://localhost:8000/form/add_form_to_user', {
                        form_id: formId,
                        userId: userId
                    });
                // }
                // catch (err) {

                //     console.error('Error adding form to user:', err);
                   
                // }
                // try {
                    await axios.post('http://localhost:8000/question/create_question', {
                        questions: formData.questions,
                        form_id: formId
                    });
            // } 
                // catch (err) {
                    // console.error('Error creating questions:', err);
                    // throw err;

                // }
                return formId;
            } else {
                console.error('Error creating form:', response.data.message);
                throw new Error('Form creation failed.');
            }
        } catch (error) {
            console.error('Error creating form:', error);
            throw error; // Re-throw error to be caught in handleSubmit
        }

        
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <h2 className="text-3xl font-extrabold text-white">Create a New Form</h2>
                </div>
                <div className="p-8">
                    {error && <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">{error}</div>}

                    <div className="mb-6">
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

                    <div className="mb-6">
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
                        <p className="mb-4 text-gray-600 italic">No questions added yet. Click 'Add Question' to start.</p>
                    )}

                    {questions.map((question, index) => (
                        <div key={index} className="mb-8 bg-gray-50 rounded-lg p-6 shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-lg font-semibold text-gray-800">Question {index + 1}</label>
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                                    onClick={() => removeQuestion(index)}
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
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                    {question.options.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center mb-2">
                                            <input
                                                type="text"
                                                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                                placeholder="Enter option"
                                                value={option}
                                                onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="ml-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                                                onClick={() => removeOption(index, optionIndex)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="mt-2 py-2 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
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
                            className="py-2 px-6 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out transform hover:scale-105"
                            onClick={addQuestion}
                        >
                            Add Question
                        </button>

                        <button
                            type="submit"
                            className="py-2 px-6 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-150 ease-in-out transform hover:scale-105"
                        >
                            Create Form
                        </button>
                    </div>

                    {error && <p className="text-red-600 mt-4">{error}</p>}
                </div>
            </form>
        </div>
    );
};

export default CreateForm;
