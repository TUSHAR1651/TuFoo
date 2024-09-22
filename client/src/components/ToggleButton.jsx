import React, { useState } from 'react';
import axios from 'axios';

const ToggleSwitch = ({ onToggle, initialState = true, onLabel = "On", offLabel = "Off" , formId}) => {
    const [isOn, setIsOn] = useState(initialState);

    const handleToggle = () => {
        const newState = !isOn;
        setIsOn(newState);
        if (onToggle) {
            onToggle(newState);
        }
        console.log("formId", formId);
        if (isOn) {
            // console.log("On");
            console.log(newState);
            axios.put(`http://localhost:8000/form/toggle_form_status`, { formId, newState: newState });
        }
        else {
            // console.log("Off");
            console.log(newState);
            axios.put(`http://localhost:8000/form/toggle_form_status`, { formId, newState: newState });
        }
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