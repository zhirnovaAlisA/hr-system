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
import ModalAlert from './components/ModalAlert';
import ContractCard from './components/ContractCard';
import ContractForm from './components/ContractForm';
import api, { addContract } from './utils/api';

function ContractsList() {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Получение списка контрактов
  const fetchContracts = async () => {
    try {
      const response = await api.get('/contracts');
      setContracts(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке контрактов:', error);
      setModalText(error.response?.data?.error || 'Произошла ошибка при загрузке контрактов.');
      setIsModalOpen(true);
    }
  };

  // Обработчик клика по строке таблицы
  const handleRowClick = (contract) => {
    setSelectedContract(contract);
  };

  // Обработчик закрытия карточки контракта
  const handleCloseCard = async () => {
    setSelectedContract(null);
    await fetchContracts();
  };

  // Обработчик удаления контракта
  const handleDelete = async (contractId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот контракт?')) {
      try {
        await api.delete(`/contracts/${contractId}`);
        await fetchContracts();
      } catch (error) {
        console.error('Ошибка при удалении контракта:', error);
        setModalText(error.response?.data?.error || 'Произошла ошибка при удалении контракта.');
        setIsModalOpen(true);
      }
    }
  };

  // Обработчик открытия формы добавления контракта
  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  // Обработчик создания нового контракта
  const handleCreateContract = async (formData) => {
    try {
      await addContract(formData);
      setIsFormOpen(false);
      await fetchContracts();
      
      // Уведомление об успешном создании
      setModalText('Контракт успешно создан.');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Ошибка при создании контракта:', error);
      setModalText(error.response?.data?.error || 'Произошла ошибка при создании контракта.');
      setIsModalOpen(true);
    }
  };

  // Форматирование даты
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  return (
    <Box className="contracts-list-container">
      {/* Модальное окно для уведомлений */}
      <ModalAlert 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        text={modalText} 
      />

      {/* Форма создания нового контракта */}
      <ContractForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateContract}
      />

      <Box className="contracts-header">
        <Typography variant="h4">
          Список контрактов
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenForm}
          className="add-contract-button"
        >
          Добавить контракт
        </Button>
      </Box>

      {/* Таблица контрактов */}
      <TableContainer component={Paper} className="contracts-table-container">
        <Table className="contracts-table">
          <TableHead>
            <TableRow>
              <TableCell>Сотрудник</TableCell>
              <TableCell align="right">Дата начала</TableCell>
              <TableCell align="right">Дата окончания</TableCell>
              <TableCell align="right">Уведомление о продлении</TableCell>
              <TableCell align="right">Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.length > 0 ? (
              contracts.map((contract) => (
                <TableRow
                  key={contract.contract_id}
                  onClick={() => handleRowClick(contract)}
                  className={`contract-row ${selectedContract?.contract_id === contract.contract_id ? 'selected' : ''}`}
                >
                  <TableCell>{contract.employee_name || 'Сотрудник удален'}</TableCell>
                  <TableCell align="right">{formatDate(contract.start_date)}</TableCell>
                  <TableCell align="right">{contract.end_date ? formatDate(contract.end_date) : 'Бессрочный'}</TableCell>
                  <TableCell align="right">{formatDate(contract.renewal_notification_date)}</TableCell>
                  <TableCell align="right">
                    <span className={`status-badge status-${contract.status?.toLowerCase() || 'unknown'}`}>
                      {contract.status === 'Active' ? 'Активный' : 
                       contract.status === 'Pending' ? 'В ожидании' :
                       contract.status === 'Expired' ? 'Истек' :
                       contract.status === 'Terminated' ? 'Расторгнут' : 
                       'Неизвестно'}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      color="error"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(contract.contract_id);
                      }}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Контракты не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Карточка выбранного контракта */}
      {selectedContract && (
        <ContractCard
          contract={selectedContract}
          onClose={handleCloseCard}
          onDelete={() => handleDelete(selectedContract.contract_id)}
        />
      )}
    </Box>
  );
}

export default ContractsList;