import React from 'react';
import AddEmployeeForm from './components/AddEmployeeForm';
import { Box, Typography } from '@mui/material';
import { addEmployee } from './utils/api';

function AddEmployee() {
    const handleAdd = async (newEmployee) => {
        try {
            await addEmployee(newEmployee); // Отправляем данные на сервер
            alert('Сотрудник успешно добавлен!');
        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Произошла ошибка при добавлении сотрудника.');
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
        </Box>
    );
}

export default AddEmployee;