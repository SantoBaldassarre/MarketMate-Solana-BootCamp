import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import User from './pages/User';
import Admin from './pages/Admin';
import Email from './pages/Email';
import BusinessOwner from './pages/BusinessOwner';
import Registration from './pages/Registration';
import Login from './pages/Login';
import SolanaProvider from './solanaContext';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <SolanaProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/user" element={<PrivateRoute element={<User />} requiredRole="user" />} />
          <Route path="/admin" element={<PrivateRoute element={<Admin />} requiredRole="admin" />} />
          <Route path="/email" element={<PrivateRoute element={<Email />} />} />
          <Route path="/business-owner" element={<PrivateRoute element={<BusinessOwner />} requiredRole="business-owner" />} />
        </Routes>
      </Router>
    </SolanaProvider>
  );
};

export default App;
