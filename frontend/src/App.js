import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import EmployeesList from './EmployeesList';
import AddEmployee from './AddEmployee';
import Profile from './Profile';
import Analytics from './Analytics';
import ContractsList from './ContractsList';
import VacationsList from './VacationsList';
import Login from './Login';
import Forbidden from './Forbidden';
import ProtectedRoute from './ProtectedRoute';
import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null,
    userId: null,
    userName: null
  });

  useEffect(() => {
    // Восстановление состояния авторизации из localStorage
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (token && userRole && userId) {
      setAuth({
        isAuthenticated: true,
        role: userRole,
        userId: parseInt(userId),
        userName
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    
    setAuth({
      isAuthenticated: false,
      role: null,
      userId: null,
      userName: null
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="app-container">
          {auth.isAuthenticated && <Sidebar userName={auth.userName} role={auth.role} onLogout={handleLogout} />}
          
          <div className="content">
            <Routes>
              <Route path="/login" element={
                auth.isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setAuth} />
              } />
              
              <Route path="/" element={
                <ProtectedRoute>
                  {auth.role === 'hr' ? <EmployeesList /> : <Navigate to="/profile" />}
                </ProtectedRoute>
              } />
              
              <Route path="/employees" element={
                <ProtectedRoute requiredRole="hr">
                  <EmployeesList />
                </ProtectedRoute>
              } />
              
              <Route path="/add-employee" element={
                <ProtectedRoute requiredRole="hr">
                  <AddEmployee />
                </ProtectedRoute>
              } />
              
              <Route path="/vacations" element={
                <ProtectedRoute requiredRole="hr">
                  <VacationsList />
                </ProtectedRoute>
              } />
              
              <Route path="/my-vacations" element={
                <ProtectedRoute requiredRole="any">
                  <VacationsList personal={true} />
                </ProtectedRoute>
              } />
              
              <Route path="/contracts" element={
                <ProtectedRoute requiredRole="hr">
                  <ContractsList />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute requiredRole="any">
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/analytics" element={
                <ProtectedRoute requiredRole="hr">
                  <Analytics />
                </ProtectedRoute>
              } />
              
              <Route path="/forbidden" element={<Forbidden />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;