import React from 'react';
import { FaSignOutAlt, FaTimes } from 'react-icons/fa';
import Cookies from 'js-cookie';    
import { useNavigate } from 'react-router-dom';

const Profile = ({ onClose }) => {
    
    const [error, setError] = React.useState('');

    const handleLogout = () => {
        
        Cookies.remove('token');
        Cookies.remove('userId');
        if(Cookies.get('token') === undefined && Cookies.get('userId') === undefined){
            window.location.reload();
        }
        else {
            setError('Error logging out try in some time');
        }
        
    };

    return (
        <div className="relative flex flex-col items-center p-6 bg-white rounded-lg shadow-lg">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
                <FaTimes size={20} />
            </button>

            {/* Profile Content */}
            <h2 className="text-2xl font-bold mb-4">Profile</h2>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
                <FaSignOutAlt className="mr-2" size={16} />
                Logout
            </button>

            {/* Error Message */}
            {error && (
                <div className="text-red-600 text-center mt-4">
                    {error}
                </div>
            )}

        </div>
    );
};

export default Profile;
