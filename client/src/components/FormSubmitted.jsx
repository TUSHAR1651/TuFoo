import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router

const FormSubmitted = () => {
  const formId = window.location.pathname.split('/')[4];
  console.log(window.location.pathname.split('/'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl transform transition-all">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Form Submitted Successfully
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for submitting the form
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <p className="text-center text-md text-gray-700">
            We will get back to you soon
          </p>
          <div className="text-center">
            <Link
              to={`/dashboard/form/${formId}/view`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              Submit Another Response
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSubmitted;