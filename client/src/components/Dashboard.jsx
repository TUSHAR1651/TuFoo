import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const Dashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const userId = Cookies.get('userId');

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

  const handleFormClick = (formId) => {
    navigate(`/dashboard/form/${formId}`);
  }

  const handleCreateForm = () => {
    navigate('/dashboard/createForm');
  };

  const handleDeleteForm = (e, formId) => {
    e.stopPropagation();
    // Add your delete logic here
    console.log(`Deleting form with id: ${formId}`);

    axios.delete(`http://localhost:8000/form/delete_form/${formId}`, {
      params: { userId }
    })
    // After successful deletion, you might want to refresh the forms list
    .then(() => {
      getForms();
    })
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Your Dashboard
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Manage your forms and create new ones with ease.
          </p>
        </div>

        <div className="mb-10">
          <button
            onClick={handleCreateForm}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Form
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.length > 0 ? (
            forms.map((form) => (
              <div
                key={form.form_id}
                onClick={() => handleFormClick(form.form_id)}
                className="bg-white overflow-hidden shadow-md rounded-lg hover:shadow-lg transition duration-300 cursor-pointer"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{form.name}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">{form.description}</p>
                </div>
                <div className="px-4 py-4 sm:px-6 flex justify-between items-center bg-gray-50">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View details
                  </span>
                  <button
                    onClick={(e) => handleDeleteForm(e, form.form_id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              <p className="text-xl">No forms found. Create your first form!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;