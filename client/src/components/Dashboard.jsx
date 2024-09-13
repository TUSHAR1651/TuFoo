import React from 'react';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const Navigate = useNavigate();
  const CreateForm = () => {
    Navigate('/dashboard/createForm');
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-300 via-blue-400 to-purple-500 p-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4 animate-pulse">Dashboard</h1>
        <p className="text-center text-gray-600 mb-8">Welcome to your dashboard!</p>
        <ul className="space-y-4 mb-8">
          {['Form 1', 'Form 2', 'Form 3'].map((form, index) => (
            <li
              key={index}
              className="bg-blue-100 p-4 rounded-md shadow-md transform hover:scale-105 transition-transform duration-200 ease-out cursor-pointer hover:bg-blue-200"
            >
              {form}
            </li>
          ))}
        </ul>
        <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={CreateForm}
        >
          Create New Form
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
