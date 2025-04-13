import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';
import VacationCard from './components/VacationCard';
import { getVacations } from './utils/api';

function VacationsList() {
    const [pendingVacations, setPendingVacations] = useState([]); // Заявки, ожидающие одобрения
    const [processedVacations, setProcessedVacations] = useState([]); // Одобренные/отклоненные заявки
    const [selectedVacation, setSelectedVacation] = useState(null);

    useEffect(() => {
        fetchVacations();
    }, []);

    // Получение списка заявок
    const fetchVacations = async () => {
        try {
            const data = await getVacations(); // Получаем все заявки
            const pending = data.filter(vacation => vacation.status === 'Pending'); // Фильтруем по статусу
            const processed = data.filter(vacation => vacation.status !== 'Pending'); // Все остальные

            setPendingVacations(pending); // Устанавливаем ожидающие заявки
            setProcessedVacations(processed); // Устанавливаем обработанные заявки
        } catch (error) {
            console.error('Error fetching vacations:', error);
            alert('Произошла ошибка при получении списка отпусков.');
        }
    };

    // Обработчик клика по строке таблицы
    const handleRowClick = (vacation) => {
        if (vacation.status === 'Pending') {
            setSelectedVacation(vacation); // Открываем карточку только для ожидающих заявок
        } else {
            alert('Эта заявка уже обработана и не может быть изменена.');
        }
    };

    // Обработчик закрытия карточки
    const handleCloseCard = () => {
        setSelectedVacation(null);
        fetchVacations(); // Перезагружаем данные после закрытия карточки
    };

    return (
        <Box sx={{ position: 'relative', p: 2 }}>
            {/* Таблица с заявками в ожидании */}
            <Typography variant="h5" gutterBottom>
                Заявки на одобрение
            </Typography>
            <TableContainer component={Paper}>
                <Table aria-label="pending vacations table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Сотрудник</TableCell>
                            <TableCell align="right">Дата начала</TableCell>
                            <TableCell align="right">Дата окончания</TableCell>
                            <TableCell align="right">Статус</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingVacations.map((vacation) => (
                            <TableRow
                                key={vacation.vacation_id}
                                onClick={() => handleRowClick(vacation)} // Клик по строке
                                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
                            >
                                <TableCell>{`${vacation.employee.first_name} ${vacation.employee.last_name}`}</TableCell>
                                <TableCell align="right">{vacation.start_date}</TableCell>
                                <TableCell align="right">{vacation.end_date}</TableCell>
                                <TableCell align="right">{vacation.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Таблица с обработанными заявками */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Обработанные заявки
            </Typography>
            <TableContainer component={Paper}>
                <Table aria-label="processed vacations table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Сотрудник</TableCell>
                            <TableCell align="right">Дата начала</TableCell>
                            <TableCell align="right">Дата окончания</TableCell>
                            <TableCell align="right">Статус</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processedVacations.map((vacation) => (
                            <TableRow key={vacation.vacation_id}>
                                <TableCell>{`${vacation.employee.first_name} ${vacation.employee.last_name}`}</TableCell>
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
                <VacationCard
                    vacation={selectedVacation}
                    onClose={handleCloseCard} // Закрываем карточку после обновления
                />
            )}
        </Box>
    );
}

export default VacationsList;