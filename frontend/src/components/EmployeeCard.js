import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Tabs,
  Tab,
  Grid,
  styled,
} from '@mui/material';
import ModalAlert from './ModalAlert'; // Импортируем модальное окно

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 9999,
  width: 600,
  maxHeight: '80vh',
  overflowY: 'auto',
  borderRadius: 16,
  boxShadow: theme.shadows[10],
  padding: theme.spacing(2),
}));

function EmployeeCard({ employee, onClose, onDelete, onUpdate }) {
  const [tabIndex, setTabIndex] = useState(0); // Табы: 0 - просмотр, 1 - редактирование
  const [formData, setFormData] = useState({
    first_name: employee.first_name,
    last_name: employee.last_name,
    date_of_birth: employee.date_of_birth?.toString().split('T')[0] || '',
    gender: employee.gender || '',
    email: employee.email,
    phone: employee.phone || '',
    salary: employee.salary || '',
    inn: employee.inn || '',
    snils: employee.snils || '',
    fk_department: employee.fk_department || null,
    job_name: employee.job_name,
    active: employee.active || 'Yes',
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
  const [modalText, setModalText] = useState(''); // Текст в модальном окне

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
  };

  const handleSave = async () => {
    try {
      const formattedData = {
        ...formData,
        salary: parseFloat(formData.salary) || null,
        date_of_birth: formData.date_of_birth
          ? new Date(formData.date_of_birth).toISOString().split('T')[0]
          : null,
      };

      await onUpdate({ ...formattedData, employee_id: employee.employee_id });
      setTabIndex(0); // Вернуться к режиму просмотра после сохранения
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении сотрудника:', error);
      setModalText('Произошла ошибка при обновлении сотрудника.');
      setIsModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) return;

    try {
      await onDelete(employee.employee_id);
      onClose();
    } catch (error) {
      console.error('Ошибка при удалении сотрудника:', error);
      setModalText('Произошла ошибка при удалении сотрудника.');
      setIsModalOpen(true);
    }
  };

  return (
    <StyledCard>
      {/* Модальное окно */}
      <ModalAlert 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        text={modalText} 
      />

      {/* Вкладки */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        centered
        sx={{ mb: 2 }}
      >
        <Tab label="Просмотр" />
        <Tab label="Редактирование" />
      </Tabs>

      {tabIndex === 0 ? (
        <CardContent>
          {/* Два столбца для данных */}
          <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
            {/* Левый столбец */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">Имя: {employee.first_name}</Typography>
              <Typography variant="body1">Фамилия: {employee.last_name}</Typography>
              <Typography variant="body1">
                Дата рождения: {employee.date_of_birth || 'Не указана'}
              </Typography>
              <Typography variant="body1">Пол: {employee.gender || 'Не указан'}</Typography>
              <Typography variant="body1">Email: {employee.email}</Typography>
              <Typography variant="body1">Телефон: {employee.phone || 'Не указан'}</Typography>
            </Grid>

            {/* Правый столбец */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                Заработная плата: {employee.salary || 'Не указана'}
              </Typography>
              <Typography variant="body1">
                Отдел: {employee.department?.name || 'Не указан'}
              </Typography>
              <Typography variant="body1">
                Должность: {employee.job_name || 'Не указана'}
              </Typography>
              <Typography variant="body1">ИНН: {formData.inn || 'Не указан'}</Typography>
              <Typography variant="body1">СНИЛС: {formData.snils || 'Не указан'}</Typography>
              <Typography variant="body1">
                Активность: {formData.active === 'Yes' ? 'Активен' : 'Неактивен'}
              </Typography>
            </Grid>
          </Grid>

          {/* Кнопки действий */}
          <Box mt={2} display="flex" justifyContent="center" gap={2}>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Удалить
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Закрыть
            </Button>
          </Box>
        </CardContent>
      ) : (
        <CardContent>
          <Grid container spacing={3} justifyContent="center">
            {/* Общая информация */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Имя"
                name="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Фамилия"
                name="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                fullWidth
                required
              />
            </Grid>

            {/* Дата рождения и Пол */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Дата рождения (YYYY-MM-DD)"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Пол (male/female)"
                name="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                fullWidth
              />
            </Grid>

            {/* Контакты */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Телефон"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                fullWidth
              />
            </Grid>

            {/* Работа */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Заработная плата"
                name="salary"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="ID Отдела"
                name="fk_department"
                value={formData.fk_department || ''}
                onChange={(e) =>
                  setFormData({ ...formData, fk_department: e.target.value })
                }
                fullWidth
              />
            </Grid>

            {/* Должность и Статус */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Должность"
                name="job_name"
                value={formData.job_name}
                onChange={(e) =>
                  setFormData({ ...formData, job_name: e.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Активность (Yes/No)"
                name="active"
                value={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.value })
                }
                fullWidth
              />
            </Grid>

            {/* Документы */}
            <Grid item xs={12} md={6}>
              <TextField
                label="ИНН"
                name="inn"
                value={formData.inn}
                onChange={(e) =>
                  setFormData({ ...formData, inn: e.target.value })
                }
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="СНИЛС"
                name="snils"
                value={formData.snils}
                onChange={(e) =>
                  setFormData({ ...formData, snils: e.target.value })
                }
                fullWidth
              />
            </Grid>
          </Grid>

          {/* Кнопки действий */}
          <Box mt={2} display="flex" justifyContent="center" gap={2}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Сохранить
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Закрыть
            </Button>
          </Box>
        </CardContent>
      )}
    </StyledCard>
  );
}

export default EmployeeCard;