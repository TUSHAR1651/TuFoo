import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from 'react-modal';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';

const CreateForm = () => {
    const REACT_API_URL = process.env.REACT_APP_API_URL;
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');
    const userId = Cookies.get('userId');
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const addQuestion = () => {
        setQuestions([...questions, { type: 'short-answer', questionText: '', options: [] , isOn : false}]);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
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

        const formData = { formName, formDescription, questions, userId };

        try {
            const formId = await createForm(formData);
            console.log(`Form created with ID: ${formId}`);
            window.location.href = '/dashboard';
        } catch (err) {
            setError('Failed to create form. Please try again.');
            console.error(err);
        }
    };

    async function createForm(formData) {
        if (!userId) {
            console.log("User id is null");
            throw new Error('User ID is null');
        }
        try {
            const response = await axios.post(`${REACT_API_URL}/form/create_form`, formData);
            if (response.data.message === "Form Created Successfully") {
                const formId = response.data.formId;
                await axios.post(`${REACT_API_URL}/form/add_form_to_user`, {
                    form_id: formId,
                    userId: userId
                });
                await axios.post(`${REACT_API_URL}/question/create_question`, {
                    questions: formData.questions,
                    form_id: formId
                });
                return formId;
            } else {
                throw new Error('Form creation failed.');
            }
        } catch (error) {
            console.error('Error creating form:', error);
            throw error;
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <h2 className="text-3xl font-extrabold text-white">Create a New Form</h2>
                </div>
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Enter form name"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form Description</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Enter form description"
                            rows="4"
                        ></textarea>
                    </div>

                    {questions.length === 0 && (
                        <p className="mb-6 text-gray-600 italic text-center">No questions added yet. Click 'Add Question' to start.</p>
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
                            onClick={() => removeQuestion(index)}
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
                                    value={option}
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
                            className="py-2 px-6 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
                            onClick={addQuestion}
                        >
                            <FaPlus className="inline-block mr-2" /> Add Question
                        </button>

                        <button
                            type="submit"
                            className="py-2 px-6 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
                        >
                            Create Form
                        </button>
                    </div>
                </div>
            </form>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                className="bg-white rounded-lg p-8 max-w-md mx-auto mt-24"
                overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
            >
                {/* Modal content */}
            </Modal>
        </div>
    );
};

export default CreateForm;