import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import ModalAlert from './ModalAlert';

function ContractCard({ contract, onClose, onDelete, onUpdate }) {
  const [status, setStatus] = useState(contract.status);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');

  // Обработчик одобрения контракта
  const handleApprove = async () => {
    try {
      await onUpdate({ ...contract, status: 'Active' });
      setStatus('Active');
      onClose();
    } catch (error) {
      console.error('Ошибка при активации контракта:', error);
      setModalText('Произошла ошибка при активации контракта.');
      setIsModalOpen(true);
    }
  };

  // Обработчик отклонения контракта
  const handleReject = async () => {
    try {
      await onUpdate({ ...contract, status: 'Inactive' });
      setStatus('Inactive');
      onClose(); 
    } catch (error) {
      console.error('Ошибка при деактивации контракта:', error);
      setModalText('Произошла ошибка при деактивации контракта.');
      setIsModalOpen(true);
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
      {/* Модальное окно */}
      <ModalAlert 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        text={modalText} 
      />

      <CardContent>
        <Typography variant="h6" gutterBottom>
          Информация о контракте
        </Typography>
        <Typography>Сотрудник: {`${contract.employee.first_name} ${contract.employee.last_name}`}</Typography>
        <Typography>Дата начала: {contract.start_date}</Typography>
        <Typography>Дата окончания: {contract.end_date}</Typography>
        <Typography>Уведомление о продлении: {contract.renewal_notification_date || 'Не указано'}</Typography>
        <Typography>Статус: {contract.status === 'Active' ? 'Активен' : 'Неактивен'}</Typography>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" color="success" onClick={handleApprove}>
            Активировать
          </Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Деактивировать
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

export default ContractCard;