import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoArrowBack } from 'react-icons/io5';
import Cookies from 'js-cookie';

const Response = () => {
    const userId = Cookies.get('userId');
    const form_id = window.location.pathname.split('/')[3];
    const [questions, setQuestions] = useState([]);
    const [formName, setFormName] = useState('Form Responses');

    useEffect(() => {
        getQuestions();
    }, []);

    const getQuestions = async () => {
        try {
            const questionsResponse = await axios.get(`http://localhost:8000/question/get_questions`, { params: { form_id } });
            const questionsData = questionsResponse.data;

            const questionsWithAnswers = await Promise.all(
                questionsData.map(async (question) => {
                    const answerResponse = await axios.get(`http://localhost:8000/response/get_responses`, { params: { question_id: question.id } });
                    return { ...question, answers: answerResponse.data };
                })
            );

            setQuestions(questionsWithAnswers);
            const formNameResponse = await axios.get(`http://localhost:8000/form/get_form/${form_id}`, { params: { userId } });
            setFormName(formNameResponse.data[0].form_name);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{formName}</h1>
                    <p className="text-gray-600">Review all responses for this form</p>
                </header>

                <div className="space-y-8">
                    {questions.map((question, qIndex) => (
                        <div key={question.question_id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-indigo-600 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white">
                                    Question {qIndex + 1}
                                </h2>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-800 font-medium mb-4">{question.question_text}</p>
                                {question.answers && question.answers.length > 0 ? (
                                    <ul className="space-y-3">
                                        {question.answers.map((answer, aIndex) => (
                                            <li key={aIndex} className="bg-gray-50 rounded-lg p-4 text-gray-700">
                                                {answer.answer_text}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">No responses yet</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 space-y-4">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                    >
                        <IoArrowBack className="mr-2" />
                        Back to Dashboard
                    </button>

                   
                </div>
            </div>
        </div>
    );
}

export default Response;
