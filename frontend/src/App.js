import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import EmployeesList from './EmployeesList'; // Для списка сотрудников
import AddEmployee from './AddEmployee'; // Для создания сотрудника
import Profile from './Profile';
import Analytics from './Analytics';
import './App.css';
import VacationsList from './VacationsList';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<EmployeesList />} /> {/* Список сотрудников */}
            <Route path="/employees" element={<EmployeesList />} /> {/* Список сотрудников */}
            <Route path="/add-employee" element={<AddEmployee />} /> {/* Создание сотрудника */}
            <Route path="/vacations" element={<VacationsList />} /> {/* Список отпусков */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;