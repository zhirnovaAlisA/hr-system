import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import VacationCard from './components/VacationCard';
import { getVacations } from './utils/api';

function VacationsList() {
    const [vacations, setVacations] = useState([]);
    const [selectedVacation, setSelectedVacation] = useState(null);

    useEffect(() => {
        fetchVacations();
    }, []);

    const fetchVacations = async () => {
        try {
            const data = await getVacations(); // Получаем список заявок
            setVacations(data);
        } catch (error) {
            console.error('Error fetching vacations:', error);
            alert('Произошла ошибка при получении списка отпусков.');
        }
    };

    const handleRowClick = (vacation) => {
        if (!vacation || !vacation.employee) {
            alert('Данные о сотруднике отсутствуют!');
            return;
        }
        setSelectedVacation(vacation); // Устанавливаем выбранную заявку
    };

    const handleCloseCard = () => {
        setSelectedVacation(null); // Закрываем карточку
    };

    return (
        <Box sx={{ position: 'relative', p: 2 }}>
            {/* Таблица заявок */}
            <TableContainer component={Paper}>
                <Table aria-label="vacations table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Сотрудник</TableCell>
                            <TableCell align="right">Дата начала</TableCell>
                            <TableCell align="right">Дата окончания</TableCell>
                            <TableCell align="right">Статус</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {vacations.map((vacation) => (
                            <TableRow
                                key={vacation.vacation_id}
                                onClick={() => handleRowClick(vacation)} // Клик по строке
                                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                            >
                                <TableCell>
                                    {vacation.employee ? `${vacation.employee.first_name} ${vacation.employee.last_name}` : 'Не указан'}
                                </TableCell>
                                <TableCell align="right">{vacation.start_date}</TableCell>
                                <TableCell align="right">{vacation.end_date}</TableCell>
                                <TableCell align="right">{vacation.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Карточка выбранной заявки */}
            {selectedVacation && (
                <VacationCard vacation={selectedVacation} onClose={handleCloseCard} />
            )}
        </Box>
    );
}

export default VacationsList;