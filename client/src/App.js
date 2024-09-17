import React from "react";
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import CreateForm from "./components/CreateForm";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { UserProvider } from "./components/UserProvider";
import Form from "./components/Form";
import FormSubmitted from "./components/FormSubmitted";
import EditForm from "./components/EditForm";
import Response from "./components/Response";

function App() {
  return (
    <UserProvider>
    <BrowserRouter>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="" element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/createForm" element={<CreateForm />} />
            <Route path="/dashboard/form/:formId" element={<EditForm />} />
            <Route path="/dashboard/response/:formId" element={<Response />} />
          </Route>
          <Route path="/dashboard/form/:formId/view" element={<Form />} />
        <Route path = "/submitted/:formId" element = {<FormSubmitted/>} />
      </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
