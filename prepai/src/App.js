import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Assistant from './components/Assistant';
import { AuthProvider } from './contexts/AuthContext';
import Create from './components/Create';
import Validation from './components/Validation';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/create" element={<Create />} />
          <Route path="/validation" element={<Validation />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;