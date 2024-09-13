import React from 'react';
import { Link } from 'react-router-dom'; 
import axios from 'axios';
import Cookies from 'js-cookie';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext , UserProvider } from './UserProvider';

const Login = () => {
    const Navigate = useNavigate();
    // const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [wrongCredentials, setWrongCredentials] = React.useState(false);
    // const [userId, setUserId] = React.useState(0);
    const { setUserId } = useContext(UserContext);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            axios.post('http://localhost:8000/user/login', { email, password }).then((response) => {
                // console.log(response.data);
                if (response.data.message === "Login Successfull") {
                    console.log(response.data);
                    // setIsLoggedIn(true);
                    Cookies.set('token', response.data.token);
                    setWrongCredentials(false);
                    console.log(response.data);
                    setUserId(response.data.user_id);
                    Navigate('/dashboard');
                }
                else if(response.data.message === "Wrong username or password"){
                    // setIsLoggedIn(false);
                    setWrongCredentials(true);
                    console.log(response.data);
                }
            }).catch((error) => {
                console.log(error);
                // setIsLoggedIn(false);
            });
        } catch (error) {
            console.error(error);
        }
        // console.log("Logged in successfully");
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-600 via-purple-500 to-pink-600">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Login</h1>
                    <p className="text-gray-600 text-sm">Enter your credentials to login</p>
                </div>
                {/* <hr /> */}
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
