import { useEffect } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FormSubmitted = () => {
  const formId = window.location.pathname.split('/')[2];
  useEffect(() => {
    console.log(formId);
  }, []);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-200 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <h1 className="absolute top-5 right-5 text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)' }}>
        tuFoo
      </h1>
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl transform transition-all hover:scale-105 duration-300">
        <div className="text-center">
          <CheckCircle className="mx-auto h-20 w-20 text-green-500 animate-bounce" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Form Submitted Successfully!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for taking the time to submit the form.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <p className="text-center text-md text-gray-700">
            We appreciate your input and will get back to you soon.
          </p>
          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard/form/' + formId +'/view')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              Submit Another Response
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSubmitted;