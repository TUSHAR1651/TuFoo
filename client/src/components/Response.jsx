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
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8">
                
                <header className="mb-10">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">{formName}</h1>
                    <p className="text-lg text-gray-600">Review all responses for this form</p>
                    
                </header>

                <div className="space-y-10">
                    {questions.map((question, qIndex) => (
                        <div key={question.question_id} className="bg-gray-100 rounded-lg shadow-md overflow-hidden">
                            <div className="bg-purple-700 px-6 py-4">
                                <h2 className="text-2xl font-semibold text-white">
                                    Question {qIndex + 1}: {question.question_text}
                                </h2>
                            </div>
                            <div className="p-6">
                                {question.answers && question.answers.length > 0 ? (
                                    <table className="min-w-full bg-white rounded-lg shadow-md">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Response #</th>
                                                <th className="py-3 px-6 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">Answer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {question.answers.map((answer, aIndex) => (
                                                <tr key={aIndex}>
                                                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{aIndex + 1}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-700">{answer.answer_text}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-gray-500 italic">No responses yet</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
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