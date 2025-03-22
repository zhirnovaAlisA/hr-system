import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import EmployeeCard from './components/EmployeeCard';
import { getEmployees, deleteEmployee, updateEmployee } from './utils/api'; // Импортируем updateEmployee

function EmployeesList() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null); // Выбранный сотрудник

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        const data = await getEmployees();
        setEmployees(data);
    };

    const handleRowClick = (employee) => {
        setSelectedEmployee(employee); // Устанавливаем выбранного сотрудника
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
            await deleteEmployee(id);
            fetchEmployees(); // Обновляем список после удаления
        }
    };

    const handleCloseCard = async () => {
        setSelectedEmployee(null); // Закрываем карточку
        await fetchEmployees(); // Обновляем список сотрудников
    };

    const handleUpdateEmployee = async (updatedEmployee) => {
        try {
            // Вызываем updateEmployee для обновления данных на сервере
            await updateEmployee(updatedEmployee.employee_id, updatedEmployee);
            fetchEmployees(); // Обновляем список после успешного обновления
        } catch (error) {
            console.error('Ошибка при обновлении сотрудника:', error);
        }
    };

    return (
        <Box sx={{ position: 'relative', p: 2 }}>
            {/* Таблица сотрудников */}
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Имя</TableCell>
                            <TableCell align="right">Фамилия</TableCell>
                            <TableCell align="right">Email</TableCell>
                            <TableCell align="right">Должность</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow
                                key={employee.employee_id}
                                onClick={() => handleRowClick(employee)} // Клик по строке
                                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                            >
                                <TableCell>{employee.first_name}</TableCell>
                                <TableCell align="right">{employee.last_name}</TableCell>
                                <TableCell align="right">{employee.email}</TableCell>
                                <TableCell align="right">{employee.job_name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Карточка выбранного сотрудника */}
            {selectedEmployee && (
                <EmployeeCard
                    employee={selectedEmployee}
                    onClose={handleCloseCard} // Закрытие карточки
                    onDelete={handleDelete} // Удаление сотрудника
                    onUpdate={handleUpdateEmployee} // Новая функция для обновления
                />
            )}
        </Box>
    );
}

export default EmployeesList;