import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoArrowBack } from 'react-icons/io5';
import Cookies from 'js-cookie';

const Response = () => {
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
    const userId = Cookies.get('userId');
    const form_id = window.location.pathname.split('/')[3];
    const [questions, setQuestions] = useState([]);
    const [formName, setFormName] = useState('Form Responses');
    const [loadingSheet, setLoadingSheet] = useState(false);

    useEffect(() => {
        getQuestions();
    }, []);

    const getQuestions = async () => {
        try {
            const questionsResponse = await axios.get(`${REACT_APP_API_URL}/question/get_questions`, { params: { form_id } });
            const questionsData = questionsResponse.data;

            const questionsWithAnswers = await Promise.all(
                questionsData.map(async (question) => {
                    const answerResponse = await axios.get(`${REACT_APP_API_URL}/response/get_responses`, {
                        params: { question_id: question.id }
                    });
                    return { ...question, answers: answerResponse.data };
                })
            );

            setQuestions(questionsWithAnswers);

            const formNameResponse = await axios.get(`${REACT_APP_API_URL}/form/get_form/${form_id}`, { params: { userId } });
            setFormName(formNameResponse.data[0].form_name);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleViewSheet = async () => {
        try {
            setLoadingSheet(true);
            const res = await axios.post(`${REACT_APP_API_URL}/response/create_sheet?formId=${form_id}`);
            const sheetId = res.data.sheetId;
            window.open(`https://docs.google.com/spreadsheets/d/${sheetId}`, '_blank');
        } catch (error) {
            console.error('Failed to create sheet:', error);
        } finally {
            setLoadingSheet(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 font-sans text-gray-900 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 mb-2">{formName}</h1>
                    <p className="text-md md:text-lg text-gray-600">Review all responses submitted to this form</p>
                </header>

                <div className="space-y-8">
                    {questions.map((question, qIndex) => (
                        <div key={question.question_id} className="border border-gray-200 rounded-xl overflow-hidden shadow">
                            <div className="bg-purple-700 px-5 py-3">
                                <h2 className="text-xl md:text-2xl font-semibold text-white">
                                    Question {qIndex + 1}: {question.question_text}
                                </h2>
                            </div>
                            <div className="p-5 overflow-x-auto">
                                {question.answers && question.answers.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-gray-700">Response #</th>
                                                <th className="px-4 py-2 text-left font-medium text-gray-700">Answer</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {question.answers.map((answer, aIndex) => (
                                                <tr key={aIndex}>
                                                    <td className="px-4 py-2 text-gray-800">{aIndex + 1}</td>
                                                    <td className="px-4 py-2 text-gray-700">{answer.answer_text}</td>
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

                <div className="mt-12 flex justify-center gap-6 flex-wrap">
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="flex items-center gap-2 px-6 py-3 text-lg font-medium text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-all duration-300"
                    >
                        <IoArrowBack />
                        Back to Dashboard
                    </button>

                    <button
                        onClick={handleViewSheet}
                        disabled={loadingSheet}
                        className={`px-6 py-3 text-lg font-medium text-white rounded-xl transition-all duration-300 ${
                            loadingSheet ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {loadingSheet ? 'Creating Sheet...' : 'View in Sheets'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Response;
