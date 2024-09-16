import React from 'react'

const FormSubmitted = () => {
  const formId = window.location.pathname.split('/')[4]
  return (
    <div>
        <div>
              <h1>
                  Form Submitted SuccessFully
        </h1> 
      </div>
      <div>
        <h2>
          Thank you for submitting the form
        </h2>
        <h3>
          We will get back to you soon
        </h3>
        <a href={`/http://localhost:3000/dashboard/form/${formId}`}>Wants to submit another response</a>
      </div>
    </div>
  )
}

export default FormSubmitted
