import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { updateVacation } from '../utils/api'; // Импортируйте функцию updateVacation

function VacationCard({ vacation, onClose }) {
    const [status, setStatus] = useState(vacation.status);

    // Обработчик одобрения заявки
    const handleApprove = async () => {
        try {
            await updateVacation(vacation.vacation_id, { status: 'Approved' });
            setStatus('Approved');
        } catch (error) {
            console.error('Ошибка при одобрении заявки:', error);
            alert('Произошла ошибка при одобрении заявки.');
        }
    };

    // Обработчик отклонения заявки
    const handleReject = async () => {
        try {
            await updateVacation(vacation.vacation_id, { status: 'Rejected' });
            setStatus('Rejected');
        } catch (error) {
            console.error('Ошибка при отклонении заявки:', error);
            alert('Произошла ошибка при отклонении заявки.');
        }
    };

    return (
        <Card
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                width: 400,
                p: 2,
            }}
        >
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Заявка на отпуск
                </Typography>
                <Typography>Сотрудник: {vacation.employee ? `${vacation.employee.first_name} ${vacation.employee.last_name}` : 'Не указан'}</Typography>
                <Typography>Дата начала: {vacation.start_date}</Typography>
                <Typography>Дата окончания: {vacation.end_date}</Typography>
                <Typography>Текущий статус: {status}</Typography>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="contained" color="success" onClick={handleApprove}>
                        Одобрить
                    </Button>
                    <Button variant="contained" color="error" onClick={handleReject}>
                        Отклонить
                    </Button>
                </Box>

                <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Button variant="outlined" onClick={onClose}>
                        Закрыть
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}

export default VacationCard;