import React, { useState } from 'react';
import AddEmployeeForm from './components/AddEmployeeForm';
import ModalAlert from './components/ModalAlert';
import { Box, Typography } from '@mui/material';
import { addEmployee } from './utils/api';
import { useNavigate } from 'react-router-dom';

function AddEmployee() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const navigate = useNavigate();

  const handleAdd = async (newEmployee) => {
    try {
      await addEmployee(newEmployee);
      setModalText('Сотрудник успешно добавлен!');
      setIsModalOpen(true);
      
      setTimeout(() => {
        navigate('/employees');
      }, 1500);
    } catch (error) {
      console.error('Error adding employee:', error);
      setModalText('Произошла ошибка при добавлении сотрудника.');
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (modalText === 'Сотрудник успешно добавлен!') {
      navigate('/employees');
    }
  };

  return (
    <Box className="add-employee-page">
      <Typography variant="h4" gutterBottom>
        Добавление сотрудника
      </Typography>
      <AddEmployeeForm onAdd={handleAdd} />
      <ModalAlert 
        open={isModalOpen} 
        onClose={handleModalClose}
        text={modalText} 
      />
    </Box>
  );
}

export default AddEmployee;