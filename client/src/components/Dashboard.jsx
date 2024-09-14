import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);

  const userId = Cookies.get('userId');
  console.log('userId:', userId);

  useEffect(() => {
    if (userId) {
      getForms();
    }
  }, [userId]);

  const getForms = () => {
    axios
      .get('http://localhost:8000/form/get_forms', { params: { userId } }) 
      .then((response) => {
        setForms(response.data);
      })
      .catch((error) => {
        console.error("Error fetching forms:", error);
      });
  };

  const getForm = (formId) => {
    navigate(`/dashboard/form/${formId}`);
  }

  const createForm = () => {
    navigate('/dashboard/createForm');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-300 via-blue-400 to-purple-500 p-8">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-3xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">Dashboard</h1>
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">Forms</h2>
        <button
          className="w-full py-3 px-5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={createForm}
        >
          Create New Form
        </button>

        {forms.length > 0 ? (
          <div className="mt-8">
            <ul className="divide-y divide-gray-200">
              {forms.map((form, index) => (
                <li key={index} className="py-6 px-4 bg-gray-50 rounded-lg shadow-sm mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full ring-2 ring-blue-300"
                        src="https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg"
                        alt="Workflow"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{form.name}</h3>
                      <p className="text-gray-600 mt-1">{form.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-6">No forms found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
