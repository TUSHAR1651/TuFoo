import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaLink, FaEdit, FaChartBar, FaTrash, FaShareAlt, FaPlus } from 'react-icons/fa';
import ToggleButton from './ToggleButton';
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
  };

  const handleLinkClicked = (formId) => {
    setCurrentFormId(formId);
    setModalIsOpen(true);
  };

  const handleCreateForm = () => {
    navigate('/dashboard/createForm');
  };

  const handleResponseClicked = (formId) => {
    navigate(`/dashboard/response/${formId}`);
  };

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
  };

  const closeShareModal = () => {
    setShareModalIsOpen(false);
    setEmailToShare("");
    setCurrentFormIdForSharing(null);
  };

  const copyLinkToClipboard = () => {
    const link = `${window.location.origin}/dashboard/form/${currentFormId}/view`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleShareWithUser = (formId, email) => {
    if (!email) {
      alert("Please enter a valid email address.");
      return;
    }
    axios.get(`http://localhost:8000/user/get_user/${email}`)
      .then((response) => {
        if (response.data.length === 0) {
          alert("User not found. Please enter a valid email address.");
          return;
        }
        const userId = response.data[0].id;
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

  const handleToggleFormStatus = (formId) => {
    // Your logic to handle form status toggle
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

        <div className="mb-10 text-center">
          <button
            onClick={handleCreateForm}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus className="mr-2" />
            Create New Form
          </button>
        </div>

        {error && (
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-xl text-gray-500">Loading forms...</p>
            </div>
          ) : forms.length > 0 ? (
            forms.map((form) => (
              <div
                key={form.form_id}
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{form.form_name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{form.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleLinkClicked(form.form_id)}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded"
                    >
                      <FaLink className="mr-2" />
                      Form Link
                    </button>
                    <button
                      onClick={() => handleFormClick(form.form_id)}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded"
                    >
                      <FaEdit className="mr-2" />
                      Edit Form
                    </button>
                    <button
                      onClick={() => handleResponseClicked(form.form_id)}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded"
                    >
                      <FaChartBar className="mr-2" />
                      View Responses
                    </button>
                    <button
                      onClick={() => handleShareAccess(form.form_id)}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 rounded"
                    >
                      <FaShareAlt className="mr-2" />
                      Share
                    </button>
                    <button
                      onClick={(e) => handleDeleteForm(e, form.form_id)}
                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                    <button
                      // onClick={(e) => handleResponseClicked(e, form.form_id)}
                    >
                      <ToggleButton
                        formId={form.form_id}
                      />
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

      {/* Share Access Modal */}
      <Modal
        isOpen={shareModalIsOpen}
        onRequestClose={closeShareModal}
        contentLabel="Share Form Access Modal"
        className="bg-white shadow-xl rounded-lg p-8 max-w-md mx-auto mt-24"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Form Access</h2>
          <input
            type="email"
            placeholder="Enter email to share with"
            value={emailToShare}
            onChange={(e) => setEmailToShare(e.target.value)}
            className="w-full border-gray-300 p-2 rounded mb-4"
          />
          <button
            onClick={() => handleShareWithUser(currentFormIdForSharing, emailToShare)}
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            Share
          </button>
        </div>
      </Modal>

      {/* Link Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Form Link Modal"
        className="bg-white shadow-xl rounded-lg p-8 max-w-md mx-auto mt-24"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Link</h2>
          <p className="mb-6">{`${window.location.origin}/dashboard/form/${currentFormId}/view`}</p>
          <button
            onClick={copyLinkToClipboard}
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            Copy Link
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
