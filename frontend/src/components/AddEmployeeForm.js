import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

function AddEmployeeForm({ onAdd }) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '', // Дата рождения
        gender: '', // Пол
        email: '',
        phone: '', // Телефон
        salary: '', // Заработная плата
        inn: '', // ИНН
        snils: '', // СНИЛС
        fk_department: null, // ID отдела
        job_name: '',
        active: 'Yes', // Активен ли сотрудник
    });

    // Обработчик изменения полей формы
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Валидация email
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверка наличия обязательных полей
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.job_name) {
            alert('Заполните все обязательные поля!');
            return;
        }

        if (!validateEmail(formData.email)) {
            alert('Введите корректный email!');
            return;
        }

        try {
            // Преобразование данных в правильный формат перед отправкой
            const formattedData = {
                ...formData,
                salary: parseFloat(formData.salary) || null, // Преобразуем salary в число
                date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : null, // Форматируем дату
            };

            await onAdd(formattedData); // Отправляем данные на сервер через родительский компонент
            setFormData({
                first_name: '',
                last_name: '',
                date_of_birth: '',
                gender: '',
                email: '',
                phone: '',
                salary: '',
                inn: '',
                snils: '',
                fk_department: null,
                job_name: '',
                active: 'Yes',
            }); // Очищаем форму после успешного создания
        } catch (error) {
            console.error('Error adding employee:', error);
            alert('Произошла ошибка при добавлении сотрудника.');
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Имя"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Фамилия"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Дата рождения (YYYY-MM-DD)"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Пол (male/female)"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Телефон"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Заработная плата"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="ИНН"
                    name="inn"
                    value={formData.inn}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="СНИЛС"
                    name="snils"
                    value={formData.snils}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="ID Отдела"
                    name="fk_department"
                    value={formData.fk_department || ''}
                    onChange={(e) => setFormData({ ...formData, fk_department: e.target.value.trim() === '' ? null : parseInt(e.target.value) })}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Должность"
                    name="job_name"
                    value={formData.job_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <Button type="submit" variant="contained" color="primary">
                    Добавить сотрудника
                </Button>
            </form>
        </Box>
    );
}

export default AddEmployeeForm;