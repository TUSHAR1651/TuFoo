import React from "react";
import "./App.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import CreateForm from "./components/CreateForm";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { UserProvider } from "./components/UserProvider";

function App() {
  return (
    <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="" element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/createForm" element={<CreateForm />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
