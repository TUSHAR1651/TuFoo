import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ToggleSwitch = ({ onToggle, onLabel = "On", offLabel = "Off", formId }) => {
    const [isOn, setIsOn] = useState(false); 
    const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
    useEffect(() => {
        const fetchFormState = async () => {
            try {
                const response = await axios.get(`${REACT_APP_API_URL}/form/get_form_view/${formId}`);
                setIsOn(response.data[0].form_open);
            } catch (error) {
                console.error("Error fetching form state", error);
            }
        };

        fetchFormState();
    }, []); 

    const handleToggle = () => {
        const newState = !isOn;
        setIsOn(newState);

        if (onToggle) {
            onToggle(newState);
        }

        axios.put(`${REACT_APP_API_URL}/form/toggle_form_status`, { formId, newState })
            .then(response => {
                console.log("Form status updated", response.data);
            })
            .catch(error => {
                console.error("Error updating form status", error);
            });
    };

    return (
        <div className="flex items-center space-x-2">
            <button
                type="button"
                role="switch"
                aria-checked={isOn}
                onClick={handleToggle}
                className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    ${isOn ? 'bg-indigo-600' : 'bg-gray-200'}
                `}
            >
                <span className="sr-only">{isOn ? onLabel : offLabel}</span>
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                        transition duration-200 ease-in-out
                        ${isOn ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
            <span className="text-sm font-medium text-gray-900">
                {isOn ? onLabel : offLabel}
            </span>
        </div>
    );
};

export default ToggleSwitch;
