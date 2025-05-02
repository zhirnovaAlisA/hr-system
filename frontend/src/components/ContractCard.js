import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import ModalAlert from './ModalAlert'; // Модальное окно

function ContractCard({ contract, onClose }) {
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
  const [modalText, setModalText] = useState(''); // Текст в модальном окне

  return (
    <Card className="contract-card">
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
        <Typography>Сотрудник: {contract.employee_name || 'Сотрудник удален'}</Typography>
        <Typography>Дата начала: {contract.start_date}</Typography>
        <Typography>Дата окончания: {contract.end_date}</Typography>
        <Typography>Уведомление о продлении: {contract.renewal_notification_date || 'Не указано'}</Typography>
        <Typography>Статус: {contract.status || 'Не указан'}</Typography>

        <Box className="contract-card-actions">
          <Button variant="outlined" onClick={onClose}>
            Закрыть
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ContractCard;