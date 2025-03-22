import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, TextField, Button } from '@mui/material';

function EmployeeCard({ employee, onClose, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false); // Режим редактирования
    const [formData, setFormData] = useState({
        first_name: employee.first_name,
        last_name: employee.last_name,
        date_of_birth: employee.date_of_birth?.toString() || '', // Преобразуем дату в строку
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
      try {
          // Преобразование данных в правильный формат перед отправкой
          const formattedData = {
              ...formData,
              salary: parseFloat(formData.salary) || null, // Преобразуем salary в число
              date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : null, // Форматируем дату
          };
  
          await onUpdate({ ...formattedData, employee_id: employee.employee_id }); // Отправляем данные на сервер
          setIsEditing(false); // Выключаем режим редактирования
          onClose(); // Закрываем карточку
      } catch (error) {
          console.error('Ошибка при обновлении сотрудника:', error);
          alert('Произошла ошибка при обновлении сотрудника.');
      }
  };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            first_name: employee.first_name,
            last_name: employee.last_name,
            date_of_birth: employee.date_of_birth?.toString() || '',
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
                {isEditing ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Имя"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Фамилия"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Дата рождения (YYYY-MM-DD)"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Пол (male/female)"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Телефон"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Заработная плата"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="ИНН"
                            name="inn"
                            value={formData.inn}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="СНИЛС"
                            name="snils"
                            value={formData.snils}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="ID Отдела"
                            name="fk_department"
                            value={formData.fk_department || ''}
                            onChange={(e) => setFormData({ ...formData, fk_department: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Должность"
                            name="job_name"
                            value={formData.job_name}
                            onChange={handleChange}
                            fullWidth
                        />
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Button variant="contained" color="primary" onClick={handleSave}>
                                Сохранить
                            </Button>
                            <Button variant="outlined" onClick={handleCancel}>
                                Отмена
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            {employee.first_name} {employee.last_name}
                        </Typography>
                        <Typography>Email: {employee.email || 'Не указано'}</Typography>
                        <Typography>Дата рождения: {employee.date_of_birth?.toString().split('T')[0] || 'Не указана'}</Typography>
                        <Typography>Пол: {employee.gender || 'Не указан'}</Typography>
                        <Typography>Телефон: {employee.phone || 'Не указан'}</Typography>
                        <Typography>Заработная плата: {employee.salary || 'Не указана'}</Typography>
                        <Typography>ИНН: {employee.inn || 'Не указан'}</Typography>
                        <Typography>СНИЛС: {employee.snils || 'Не указан'}</Typography>
                        <Typography>Отдел: {employee.department?.name || 'Не указан'}</Typography>
                        <Typography>Должность: {employee.job_name || 'Не указана'}</Typography>
                        <Typography>Статус: {employee.active === 'Yes' ? 'Активен' : 'Неактивен'}</Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Button variant="contained" color="error" onClick={() => onDelete(employee.employee_id)}>
                                Удалить
                            </Button>
                            <Button variant="contained" color="secondary" onClick={handleEdit}>
                                Редактировать
                            </Button>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default EmployeeCard;