import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Box, 
  Typography 
} from '@mui/material';
import VacationCard from './components/VacationCard';
import ModalAlert from './components/ModalAlert'; // Импортируем модальное окно
import { getVacations } from './utils/api';

function VacationsList() {
  const [pendingVacations, setPendingVacations] = useState([]); // Заявки, ожидающие одобрения
  const [processedVacations, setProcessedVacations] = useState([]); // Одобренные/отклоненные заявки
  const [selectedVacation, setSelectedVacation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
  const [modalText, setModalText] = useState(''); // Текст в модальном окне

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
      setModalText('Произошла ошибка при получении списка отпусков.');
      setIsModalOpen(true);
    }
  };

  // Обработчик клика по строке таблицы
  const handleRowClick = (vacation) => {
    if (vacation.status === 'Pending') {
      setSelectedVacation(vacation); // Открываем карточку только для ожидающих заявок
    } else {
      setModalText('Эта заявка уже обработана и не может быть изменена.');
      setIsModalOpen(true);
    }
  };

  // Обработчик закрытия карточки
  const handleCloseCard = () => {
    setSelectedVacation(null);
    fetchVacations(); // Перезагружаем данные после закрытия карточки
  };

  // Функция перевода статуса на русский язык
  const translateStatus = (status) => {
    switch (status) {
      case 'Pending':
        return 'Ожидает рассмотрения';
      case 'Approved':
        return 'Одобрено';
      case 'Rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  // Функция преобразования даты в формат dd.mm.yyyy
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  };

  return (
    <Box className="vacations-list-container">
      {/* Модальное окно */}
      <ModalAlert 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        text={modalText} 
      />

      {/* Таблица с заявками в ожидании */}
      {pendingVacations.length > 0 && ( // Показываем только если есть ожидающие заявки
        <>
          <Typography variant="h5" gutterBottom>
            Заявки на одобрение
          </Typography>
          <TableContainer component={Paper} className="vacations-table-container">
            <Table aria-label="pending vacations table" className="vacations-table">
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
                    className="vacation-row clickable"
                  >
                    <TableCell>{`${vacation.employee.first_name} ${vacation.employee.last_name}`}</TableCell>
                    <TableCell align="right">{formatDate(vacation.start_date)}</TableCell>
                    <TableCell align="right">{formatDate(vacation.end_date)}</TableCell>
                    <TableCell align="right">{translateStatus(vacation.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Таблица с обработанными заявками */}
      <Typography variant="h5" gutterBottom className="processed-vacations-title">
        Обработанные заявки
      </Typography>
      <TableContainer component={Paper} className="vacations-table-container">
        <Table aria-label="processed vacations table" className="vacations-table">
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
              <TableRow key={vacation.vacation_id} className="vacation-row">
                <TableCell>{`${vacation.employee.first_name} ${vacation.employee.last_name}`}</TableCell>
                <TableCell align="right">{formatDate(vacation.start_date)}</TableCell>
                <TableCell align="right">{formatDate(vacation.end_date)}</TableCell>
                <TableCell align="right">{translateStatus(vacation.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Карточка выбранной заявки */}
      {selectedVacation && (
        <VacationCard 
          vacation={selectedVacation} 
          onClose={handleCloseCard} 
        />
      )}
    </Box>
  );
}

export default VacationsList;