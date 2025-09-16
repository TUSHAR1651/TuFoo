import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserContext } from './UserProvider';

const Login = () => {
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const { setUserId } = useContext(UserContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [wrongCredentials, setWrongCredentials] = useState(false);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, [setUserId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${REACT_APP_API_URL}/user/login`, { email, password });
            if (response.data.message === "Login Successfull") {
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-600 via-purple-500 to-pink-600">
            <h1 className="absolute top-5 right-5 text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)' }}>
                tuFoo
            </h1>
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold mb-2 text-blue-600 tracking-tight">Hey! Welcome to tuFoo</h2>
                    <p className="text-gray-600 text-sm font-medium">Enter your credentials to login</p>
                </div>
                {wrongCredentials && (
                    <p className="text-sm text-center text-red-600 mb-4 font-semibold">Wrong username or password</p>
                )}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-gray-900"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out text-gray-900"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-[1.02]"
                    >
                        Login
                    </button>
                    <div className="text-center mt-6">
                        <Link
                            to="/signup"
                            className="text-blue-600 hover:text-blue-700 transition duration-200 ease-in-out font-medium"
                        >
                            Don't have an account? Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;