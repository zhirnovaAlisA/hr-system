import React from 'react';
import AddEmployeeForm from './components/AddEmployeeForm';
import ModalAlert from './components/ModalAlert'; // Импортируем модальное окно
import { Box, Typography } from '@mui/material';
import { addEmployee } from './utils/api';

function AddEmployee() {
  const [isModalOpen, setIsModalOpen] = React.useState(false); // Состояние модального окна
  const [modalText, setModalText] = React.useState(''); // Текст в модальном окне

  const handleAdd = async (newEmployee) => {
    try {
      await addEmployee(newEmployee); // Отправляем данные на сервер
      setModalText('Сотрудник успешно добавлен!');
      setIsModalOpen(true); // Открываем модальное окно при успехе
    } catch (error) {
      console.error('Error adding employee:', error);
      setModalText('Произошла ошибка при добавлении сотрудника.');
      setIsModalOpen(true); // Открываем модальное окно при ошибке
    }
  };

  return (
    <Box
      sx={{
        height: '100vh', // Занимает всю высоту экрана
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto', // Добавляем вертикальную прокрутку
        p: 2, // Внутренние отступы
        border: '1px solid #ccc', // Опционально: добавляем границу для стиля
        borderRadius: 2, // Опционально: скругляем углы
      }}
    >
      <Typography variant="h4" gutterBottom>
        Добавление сотрудника
      </Typography>
      {/* Форма добавления сотрудника */}
      <AddEmployeeForm onAdd={handleAdd} />

      {/* Модальное окно */}
      <ModalAlert 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        text={modalText} 
      />
    </Box>
  );
}

export default AddEmployee;