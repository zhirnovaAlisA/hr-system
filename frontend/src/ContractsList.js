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
  Typography,
  Button,
} from '@mui/material';
import ModalAlert from './components/ModalAlert'; // Модальное окно
import ContractCard from './components/ContractCard';

function ContractsList() {
  const [contracts, setContracts] = useState([]); // Список контрактов
  const [selectedContract, setSelectedContract] = useState(null); // Выбранный контракт
  const [isModalOpen, setIsModalOpen] = useState(false); // Открыто ли модальное окно
  const [modalText, setModalText] = useState(''); // Текст в модальном окне

  // Форматирование даты
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  };

  // Получение списка контрактов
  const fetchContracts = async () => {
    try {
      const response = await fetch('http://localhost:5000/contracts');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при загрузке контрактов.');
      }
      setContracts(data);
    } catch (error) {
      console.error('Ошибка при загрузке контрактов:', error);
      setModalText(error.message || 'Произошла ошибка при загрузке контрактов.');
      setIsModalOpen(true);
    }
  };

  // Обработчик клика по строке таблицы
  const handleRowClick = (contract) => {
    setSelectedContract(contract); // Открываем карточку контракта
  };

  // Обработчик закрытия карточки контракта
  const handleCloseCard = async () => {
    setSelectedContract(null);
    await fetchContracts(); // Перезагружаем данные после закрытия карточки
  };

  // Обработчик удаления контракта
  const handleDelete = async (contractId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот контракт?')) {
      try {
        const response = await fetch(`http://localhost:5000/contracts/${contractId}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error((await response.json()).error || 'Ошибка при удалении контракта.');
        }
        await fetchContracts(); // Обновляем список контрактов
      } catch (error) {
        console.error('Ошибка при удалении контракта:', error);
        setModalText(error.message || 'Произошла ошибка при удалении контракта.');
        setIsModalOpen(true);
      }
    }
  };

  useEffect(() => {
    fetchContracts(); // Загружаем контракты при монтировании компонента
  }, []);

  return (
    <Box className="contracts-list-container">
      {/* Модальное окно для уведомлений */}
      <ModalAlert 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        text={modalText} 
      />

      {/* Заголовок страницы */}
      <Typography variant="h4" gutterBottom>
        Список контрактов
      </Typography>

      {/* Таблица контрактов */}
      <TableContainer component={Paper} className="contracts-table-container">
        <Table aria-label="contracts table" className="contracts-table">
          <TableHead>
            <TableRow>
              <TableCell>Сотрудник</TableCell>
              <TableCell align="right">Дата начала</TableCell>
              <TableCell align="right">Дата окончания</TableCell>
              <TableCell align="right">Уведомление о продлении</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow
                key={contract.contract_id}
                onClick={() => handleRowClick(contract)}
                className={`contract-row ${selectedContract?.contract_id === contract.contract_id ? 'selected' : ''}`}
              >
                <TableCell>{contract.employee_name || 'Сотрудник удален'}</TableCell>
                <TableCell align="right">{formatDate(contract.start_date)}</TableCell>
                <TableCell align="right">{formatDate(contract.end_date)}</TableCell>
                <TableCell align="right">{formatDate(contract.renewal_notification_date)}</TableCell>
                <TableCell align="right">
                  <Button
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation(); // Предотвращаем клик на строку
                      handleDelete(contract.contract_id);
                    }}
                  >
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Карточка выбранного контракта */}
      {selectedContract && (
        <ContractCard
          contract={selectedContract}
          onClose={handleCloseCard}
          onDelete={handleDelete}
        />
      )}
    </Box>
  );
}

export default ContractsList;