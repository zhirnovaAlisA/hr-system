import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import ModalAlert from './ModalAlert'; // Импортируем модальное окно
import { updateVacation } from '../utils/api';

function VacationCard({ vacation, onClose }) {
  const [status, setStatus] = useState(vacation.status);
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
  const [modalText, setModalText] = useState(''); // Текст в модальном окне

  // Обработчик одобрения заявки
  const handleApprove = async () => {
    try {
      await updateVacation(vacation.vacation_id, { status: 'Approved' });
      setStatus('Approved');
      onClose(); // Закрываем карточку и перезагружаем данные
    } catch (error) {
      console.error('Ошибка при одобрении заявки:', error);
      setModalText('Произошла ошибка при одобрении заявки.');
      setIsModalOpen(true);
    }
  };

  // Обработчик отклонения заявки
  const handleReject = async () => {
    try {
      await updateVacation(vacation.vacation_id, { status: 'Rejected' });
      setStatus('Rejected');
      onClose(); // Закрываем карточку и перезагружаем данные
    } catch (error) {
      console.error('Ошибка при отклонении заявки:', error);
      setModalText('Произошла ошибка при отклонении заявки.');
      setIsModalOpen(true);
    }
  };

  return (
    <Card className="vacation-card">
      {/* Модальное окно */}
      <ModalAlert 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        text={modalText} 
      />

      <CardContent>
        <Typography variant="h6" gutterBottom>
          Заявка на отпуск
        </Typography>
        <Typography>Сотрудник: {`${vacation.employee.first_name} ${vacation.employee.last_name}`}</Typography>
        <Typography>Дата начала: {vacation.start_date}</Typography>
        <Typography>Дата окончания: {vacation.end_date}</Typography>
        <Typography>Текущий статус: {status}</Typography>

        <Box className="vacation-card-actions">
          <Button variant="contained" color="success" onClick={handleApprove}>
            Одобрить
          </Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Отклонить
          </Button>
        </Box>

        <Box className="vacation-card-close">
          <Button variant="outlined" onClick={onClose}>
            Закрыть
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default VacationCard;