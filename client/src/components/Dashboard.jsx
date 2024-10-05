import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaLink, FaEdit, FaChartBar, FaTrash, FaShareAlt, FaPlus, FaUser } from 'react-icons/fa';
import ToggleButton from './ToggleButton';
import Modal from 'react-modal';
import Profile from './Profile';

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
  const [ProfileOpen, setProfileOpen] = useState(false);

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

  const handleProfileClick = () => {
    setProfileOpen(!ProfileOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative text-center mb-16">
          <h1 className="text-5xl font-extrabold text-indigo-900 sm:text-6xl md:text-7xl">
            Your Dashboard
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-xl text-indigo-600">
            Manage your forms and create new ones with ease.
          </p>
          <div className="absolute top-0 right-0 mt-4 mr-4">
            <button
              className="flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300"
              onClick={handleProfileClick}
            >
              <FaUser className="mr-2" /> Profile
            </button>
          </div>
        </div>

        <div className="mb-12 text-center">
          <button
            onClick={handleCreateForm}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition duration-300"
          >
            <FaPlus className="mr-2" />
            Create New Form
          </button>
        </div>

        {error && (
          <div className="text-center py-6 mb-8">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-16">
              <p className="text-2xl text-indigo-600">Loading forms...</p>
            </div>
          ) : forms.length > 0 ? (
            forms.map((form) => (
              <div
                key={form.form_id}
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-indigo-900 mb-3">{form.form_name}</h3>
                  <p className="text-indigo-600 mb-6">{form.description}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleLinkClicked(form.form_id)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition duration-300"
                    >
                      <FaLink className="mr-2" />
                      Form Link
                    </button>
                    <button
                      onClick={() => handleFormClick(form.form_id)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-full hover:bg-indigo-200 transition duration-300"
                    >
                      <FaEdit className="mr-2" />
                      Edit Form
                    </button>
                    <button
                      onClick={() => handleResponseClicked(form.form_id)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-full hover:bg-green-200 transition duration-300"
                    >
                      <FaChartBar className="mr-2" />
                      View Responses
                    </button>
                    <button
                      onClick={() => handleShareAccess(form.form_id)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-100 rounded-full hover:bg-purple-200 transition duration-300"
                    >
                      <FaShareAlt className="mr-2" />
                      Share
                    </button>
                    <button
                      onClick={(e) => handleDeleteForm(e, form.form_id)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition duration-300"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                    <ToggleButton formId={form.form_id} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-indigo-600 py-16">
              <p className="text-2xl">No forms found. Create your first form!</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={shareModalIsOpen}
        onRequestClose={closeShareModal}
        contentLabel="Share Form Access Modal"
        className="bg-white rounded-2xl p-8 max-w-md mx-auto mt-24 shadow-2xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold text-indigo-900 mb-6">Share Form Access</h2>
          <input
            type="email"
            placeholder="Enter email to share with"
            value={emailToShare}
            onChange={(e) => setEmailToShare(e.target.value)}
            className="w-full border-2 border-indigo-300 p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleShareWithUser(currentFormIdForSharing, emailToShare)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-full text-lg font-semibold hover:bg-indigo-700 transition duration-300"
          >
            Share
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Form Link Modal"
        className="bg-white rounded-2xl p-8 max-w-md mx-auto mt-24 shadow-2xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
      >
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold text-indigo-900 mb-6">Form Link</h2>
          <p className="mb-6 text-indigo-600 text-lg">{`${window.location.origin}/dashboard/form/${currentFormId}/view`}</p>
          <button
            onClick={copyLinkToClipboard}
            className="px-8 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Copy Link
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={ProfileOpen}
        onRequestClose={() => setProfileOpen(!ProfileOpen)}
        contentLabel="Profile Modal"
        className="bg-white rounded-2xl p-8 max-w-md mx-auto mt-24 shadow-2xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
      >
        <Profile onClose={() => setProfileOpen(!ProfileOpen)} />
      </Modal>
    </div>
  );
};

export default Dashboard;