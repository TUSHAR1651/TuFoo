import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Response = () => {
    const form_id = window.location.pathname.split('/')[3];
    // console.log(formId);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getQuestions();
    }, []);

    const getQuestions = () => {
        setIsLoading(true);
        setError(null);
        axios
            .get(`http://localhost:8000/question/get_questions`, { params: { form_id } })
          .then((response) => {
            console.log(response.data);
            setQuestions(response.data);
          })
          .catch((error) => {
            console.error("Error fetching questions:", error);
            setError("Failed to load questions. Please try again.");
          })
          .finally(() => {
            setIsLoading(false);
          });
        
    };
    
    
    // const getAnswers = () => {
        
    //     axios
    //       .get(`http://localhost:8000/form/get_answers/${formId}`)
    //       .then((response) => {
    //         // console.log(response.data);
    //         setAnswers(response.data);
    //       })
    //       .catch((error) => {
    //         console.error("Error fetching answers:", error);
    //         setError("Failed to load answers. Please try again.");
    //       })
    //       .finally(() => {
    //         setIsLoading(false);
    //       });
        
    // };
  return (
    <div>
      
    </div>
  )
}

export default Response
