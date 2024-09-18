import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserContext } from './UserProvider'; // Ensure UserProvider wraps the component tree

const Login = () => {
    const { setUserId } = useContext(UserContext);
    const navigate = useNavigate(); // Use lowercase for navigate
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [wrongCredentials, setWrongCredentials] = useState(false);

    useEffect(() => {
        // Fetch userId from localStorage and set it in the context if it exists
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, [setUserId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/user/login', { email, password });
            if (response.data.message === "Login Successfull") {
                // Set token in cookies and userId in localStorage
                console.log(response.data);
                Cookies.set('token', response.data.token);
                Cookies.set('userId', response.data.user_id);
                setWrongCredentials(false);
                navigate('/dashboard'); 
            } else if (response.data.message === "Wrong username or password") {
                setWrongCredentials(true);
            }
        } catch (error) {
            console.error(error);
            setWrongCredentials(true);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-600 via-purple-500 to-pink-600">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Login</h1>
                    <p className="text-gray-600 text-sm">Enter your credentials to login</p>
                </div>
                {wrongCredentials && (
                    <p className="text-sm text-center text-red-600">Wrong username or password</p>
                )}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Login
                    </button>
                    <div className="text-center mt-4">
                        <Link
                            to="/signup"
                            className="text-blue-600 hover:text-blue-700"
                        >
                            Don't have an account? Signup
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
