import React, { useState } from 'react';
import { FaSignOutAlt, FaTimes, FaUser } from 'react-icons/fa';
import Cookies from 'js-cookie';

const Profile = ({ onClose }) => {
    const [error, setError] = useState('');

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('userId');
        if (Cookies.get('token') === undefined && Cookies.get('userId') === undefined) {
            window.location.reload();
        } else {
            setError('Error logging out. Please try again in a moment.');
        }
    };

    return (
        <div className="relative flex flex-col items-center p-8 bg-white rounded-2xl shadow-2xl">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                aria-label="Close"
            >
                <FaTimes size={24} />
            </button>

            <div className="mb-6">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FaUser size={48} className="text-indigo-600" />
                </div>
            </div>

            <h2 className="text-3xl font-bold text-indigo-900 mb-6">Your Profile</h2>

            <button
                onClick={handleLogout}
                className="flex items-center px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300 shadow-md"
            >
                <FaSignOutAlt className="mr-2" size={18} />
                Logout
            </button>

            {error && (
                <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Profile;