import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaLink, FaEdit, FaChartBar, FaTrash, FaShareAlt } from 'react-icons/fa';
import Modal from 'react-modal';

// Bind modal to your appElement
Modal.setAppElement('#root');

const Dashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = Cookies.get('userId');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(null);

  const [shareModalIsOpen, setShareModalIsOpen] = useState(false);
  const [emailToShare, setEmailToShare] = useState("");
  const [currentFormIdForSharing, setCurrentFormIdForSharing] = useState(null);

  useEffect(() => {
    if (userId) {
      getForms();
    }
  }, [userId]);

  const getForms = () => {
    setIsLoading(true);
    setError(null);
    axios
      .get('http://localhost:8000/form/get_forms', { params: { id: userId } })
      .then((response) => {
        setForms(response.data);
      })
      .catch((error) => {
        console.error("Error fetching forms:", error);
        setError("Failed to load forms. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleFormClick = (formId) => {
    navigate(`/dashboard/form/${formId}`);
  }

  const handleLinkClicked = (formId) => {
    setCurrentFormId(formId);
    setModalIsOpen(true);
  }

  const handleCreateForm = () => {
    navigate('/dashboard/createForm');
  };

  const handleResponseClicked = (formId) => {
    navigate(`/dashboard/response/${formId}`);
  }

  const handleShareAccess = (formId) => {
    setCurrentFormIdForSharing(formId);
    setShareModalIsOpen(true);
  };

  const handleDeleteForm = (e, formId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this form?")) {
      axios.delete(`http://localhost:8000/form/delete_form/${formId}`, {
        params: { id: userId }
      })
        .then(() => {
          getForms();
        })
        .catch((error) => {
          console.error("Error deleting form:", error);
          setError("Failed to delete form. Please try again.");
        });
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentFormId(null);
  }

  const closeShareModal = () => {
    setShareModalIsOpen(false);
    setEmailToShare("");
    setCurrentFormIdForSharing(null);
  }

  const copyLinkToClipboard = () => {
    const link = `${window.location.origin}/dashboard/form/${currentFormId}/view`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }

  const handleShareWithUser = (formId, email) => {
    if (!email) {
      alert("Please enter a valid email address.");
      return;
    }
    console.log(email);
    axios.get(`http://localhost:8000/user/get_user/${email}`)
      .then((response) => {
        if (response.data.length === 0) {
          alert("User not found. Please enter a valid email address.");
          return;
        }
        const userId = response.data[0].id;
        console.log("userId", userId);
        console.log("formId", formId);
        const form_id = formId;
        axios.post(`http://localhost:8000/form/add_form_to_user`, {
          form_id,
          userId
        })
          .then(() => {
            alert("Form shared successfully!");
            closeShareModal();
          })
          .catch((error) => {
            console.error("Error sharing form:", error);
            alert("Failed to share form. Please try again.");
          });
      })
      .catch((error) => {
        console.error("Error fetching user ID:", error);
        alert("Failed to share form. Please try again.");
      }); 
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

        {error && (
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-gray-500">Loading forms...</p>
            </div>
          ) : forms.length > 0 ? (
            forms.map((form) => (
              <div
                key={form.form_id}
                className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div className="p-6 flex-grow cursor-pointer">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{form.form_name}</h3>
                  <p className="text-sm text-gray-600">{form.description}</p>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLinkClicked(form.form_id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-150 ease-in-out flex items-center"
                    >
                      <FaLink className="mr-2" />
                      Form Link
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleFormClick(form.form_id)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors duration-150 ease-in-out"
                      title="Edit Form"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleResponseClicked(form.form_id)}
                      className="p-2 text-gray-600 hover:text-green-600 transition-colors duration-150 ease-in-out"
                      title="View Responses"
                    >
                      <FaChartBar />
                    </button>
                    <button
                      onClick={(e) => handleDeleteForm(e, form.form_id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors duration-150 ease-in-out"
                      title="Delete Form"
                    >
                      <FaTrash />
                    </button>

                    {/* Share Access Button */}
                    <button
                      onClick={() => handleShareAccess(form.form_id)}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150"
                      title="Give Access to Other User"
                    >
                      <FaShareAlt className="mr-2" />
                      Give Access
                    </button>
                  </div>
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

      {/* Modal for Sharing Access */}
      <Modal
        isOpen={shareModalIsOpen}
        onRequestClose={closeShareModal}
        contentLabel="Share Form Access Modal"
        className="bg-white shadow-xl rounded-lg p-8 max-w-md mx-auto mt-24 transform transition-transform duration-300 ease-out scale-100"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Form Access</h2>
          <p className="text-gray-600 mb-6">Enter the email address of the user you want to share access with.</p>

          {/* Input for Email */}
          <input
            type="email"
            value={emailToShare}
            onChange={(e) => setEmailToShare(e.target.value)}
            placeholder="Enter user email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
          />

          {/* Submit Button */}
          <button
            onClick={() => handleShareWithUser(currentFormIdForSharing, emailToShare)}
            className="px-6 py-3 bg-green-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            Share Access
          </button>
        </div>
      </Modal>

      {/* Modal for Copying Form Link */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Form Link Modal"
        className="bg-white shadow-xl rounded-lg p-8 max-w-md mx-auto mt-24 transform transition-transform duration-300 ease-out scale-100"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Form Link</h2>
          <p className="text-gray-600 mb-6">Copy the link below to share your form:</p>
          <input
            type="text"
            value={`${window.location.origin}/dashboard/form/${currentFormId}/view`}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
          />
          <button
            onClick={copyLinkToClipboard}
            className="px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Copy Link
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
