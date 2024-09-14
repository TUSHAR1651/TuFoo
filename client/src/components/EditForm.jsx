import React from 'react'
import axios from 'axios';
// import { useParams } from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';



const EditForm = () => {
    const userId = Cookies.get('userId');
    
    const location = useLocation();
    const id = location.pathname.split('/').pop();

    console.log('a:', id);
    const [form, setForm] = useState({});

    useEffect(() => {
        getForm();
    }, []);
    

    const getForm = () => {
        axios
            .get(`http://localhost:8000/form/get_form/${id}` , { params: { userId } })
            .then((response) => {
                console.log('response.data:', response.data);
                setForm(response.data);
            })
            .catch((error) => {
                console.error("Error fetching form:", error);
            });
    };

  return (
    <div>
          <div>
              
        </div>
    </div>
  )
}

export default EditForm
