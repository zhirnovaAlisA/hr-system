import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, TextField, Button } from '@mui/material';

function EmployeeCard({ employee, onClose, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
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

  const handleEdit = () => {
    setIsEditing(true);
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
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении сотрудника:', error);
      alert('Ошибка при обновлении сотрудника');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
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
  };

  return (
    <Card
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        width: 600,
        maxHeight: '80vh',
        overflowY: 'auto',
        p: 2,
        borderRadius: 1,
        boxShadow: 2,
      }}
    >
      <CardContent>
        {isEditing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Общая информация */}
            <TextField
              label="Имя"
              name="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Фамилия"
              name="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Дата рождения (YYYY-MM-DD)"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Пол (male/female)"
              name="gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />

            {/* Контакты */}
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
              required
            />
            <TextField
              label="Телефон"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />

            {/* Работа */}
            <TextField
              label="Заработная плата"
              name="salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="ID Отдела"
              name="fk_department"
              value={formData.fk_department || ''}
              onChange={(e) => 
                setFormData({ ...formData, fk_department: e.target.value })
              }
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Должность"
              name="job_name"
              value={formData.job_name}
              onChange={(e) => setFormData({ ...formData, job_name: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />

            {/* Документы */}
            <TextField
              label="ИНН"
              name="inn"
              value={formData.inn}
              onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="СНИЛС"
              name="snils"
              value={formData.snils}
              onChange={(e) => setFormData({ ...formData, snils: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />

            {/* Статус */}
            <TextField
              label="Активность (Yes/No)"
              name="active"
              value={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />

            {/* Кнопки действий */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Сохранить
              </Button>
              <Button variant="outlined" onClick={handleCancel} sx={{ ml: 2 }}>
                Отмена
              </Button>
              <Button variant="outlined" onClick={onClose} sx={{ ml: 2 }}>
                Закрыть
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Поля просмотра */}
            <Typography variant="h6">Имя: {employee.first_name}</Typography>
            <Typography>Фамилия: {employee.last_name}</Typography>
            <Typography>Дата рождения: {employee.date_of_birth || 'Не указана'}</Typography>
            <Typography>Пол: {employee.gender || 'Не указан'}</Typography>

            <Typography>Email: {employee.email}</Typography>
            <Typography>Телефон: {employee.phone || 'Не указан'}</Typography>

            <Typography>Заработная плата: {employee.salary || 'Не указана'}</Typography>
            <Typography>Отдел: {employee.department?.name || 'Не указан'}</Typography>
            <Typography>Должность: {employee.job_name || 'Не указана'}</Typography>

            <Typography>ИНН: {formData.inn || 'Не указан'}</Typography>
            <Typography>СНИЛС: {formData.snils || 'Не указан'}</Typography>
            <Typography>Активность: {formData.active === 'Yes' ? 'Активен' : 'Неактивен'}</Typography>

            {/* Кнопки действий */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="error" onClick={() => onDelete(employee.employee_id)}>
                Удалить
              </Button>
              <Button variant="contained" color="secondary" onClick={handleEdit} sx={{ ml: 2 }}>
                Редактировать
              </Button>
              <Button variant="outlined" onClick={onClose} sx={{ ml: 2 }}>
                Закрыть
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default EmployeeCard;