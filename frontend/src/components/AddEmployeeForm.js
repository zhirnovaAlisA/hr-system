import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Select, MenuItem } from '@mui/material';
import MaskedInput from 'react-input-mask';
import { getDepartments } from '../utils/api';

function AddEmployeeForm({ onAdd }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '', // Пол
    email: '',
    phone: '',
    salary: '',
    inn: '',
    snils: '',
    fk_department: null, // ID отдела
    job_name: '',
    active: 'Yes',
  });

  const genders = ['male', 'female'];
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error('Ошибка при получении отделов:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleGenderChange = (e) => {
    setFormData({ ...formData, gender: e.target.value });
  };

  const handleDepartmentChange = (e) => {
    setFormData({
      ...formData,
      fk_department: e.target.value === '' ? null : parseInt(e.target.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка обязательных полей
    if (
      !formData.first_name.trim() || 
      !formData.last_name.trim() || 
      !formData.email.trim() || 
      !formData.job_name.trim()
    ) {
      alert('Заполните все обязательные поля!');
      return;
    }

    // Проверка email
    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    if (!validateEmail(formData.email)) {
      alert('Введите корректный email!');
      return;
    }

    // Проверка даты рождения
    if (!formData.date_of_birth) {
      alert('Укажите дату рождения!');
      return;
    }

    // Преобразование данных
    const formattedDate = formData.date_of_birth
      ? formData.date_of_birth.split('.').reverse().join('-')
      : null;

    const formattedData = {
      ...formData,
      date_of_birth: formattedDate,
      salary: parseFloat(formData.salary) || null,
      phone: formData.phone || null,
      fk_department: formData.fk_department || null,
    };

    try {
      await onAdd(formattedData);
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
      });
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при добавлении сотрудника');
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <form onSubmit={handleSubmit}>
        {/* Имя */}
        <TextField
          label="Имя"
          name="first_name"
          placeholder="Иван"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          fullWidth
          margin="normal"
          required
        />

        {/* Фамилия */}
        <TextField
          label="Фамилия"
          name="last_name"
          placeholder="Иванов"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          fullWidth
          margin="normal"
          required
        />

        {/* Дата рождения */}
        <MaskedInput
        className='input-date'
          label="Дата рождения"
          name="date_of_birth"
          placeholder="DD.MM.YYYY"
          mask="99.99.9999"
          value={formData.date_of_birth}
          onChange={(e) => setFormData({
            ...formData,
            date_of_birth: e.target.value,
          })}
          fullWidth
          margin="normal"
          required
        />

        {/* Пол */}
        <Select
          label="Пол"
          name="gender"
          value={formData.gender}
          onChange={handleGenderChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">Не указано</MenuItem> {/* Placeholder */}
          {genders.map((gender) => (
            <MenuItem key={gender} value={gender}>
              {gender.charAt(0).toUpperCase() + gender.slice(1)}
            </MenuItem>
          ))}
        </Select>

        {/* Телефон */}
        <TextField
          label="Телефон"
          name="phone"
          placeholder="+7 (999) 999-99-99"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          fullWidth
          margin="normal"
        />

        {/* Email */}
        <TextField
          label="Email"
          name="email"
          placeholder="ivanov@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          fullWidth
          margin="normal"
          required
        />

        {/* Заработная плата */}
        <TextField
          label="Заработная плата"
          name="salary"
          placeholder="50000.00"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          fullWidth
          margin="normal"
        />

        {/* Отдел */}
        <Select
          label="Отдел"
          name="fk_department"
          value={formData.fk_department || ''}
          onChange={handleDepartmentChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">Не указано</MenuItem> {/* Placeholder */}
          {departments.map((department) => (
            <MenuItem key={department.department_id} value={department.department_id}>
              {department.name}
            </MenuItem>
          ))}
        </Select>

        {/* ИНН */}
        <TextField
          label="ИНН"
          name="inn"
          placeholder="123456789012"
          value={formData.inn}
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          fullWidth
          margin="normal"
        />

        {/* СНИЛС */}
        <TextField
          label="СНИЛС"
          name="snils"
          placeholder="123-456-789 01"
          value={formData.snils}
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          fullWidth
          margin="normal"
        />

        {/* Должность */}
        <TextField
          label="Должность"
          name="job_name"
          placeholder="Инженер"
          value={formData.job_name}
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          fullWidth
          margin="normal"
          required
        />

        {/* Активность */}
        <Select
          label="Активность"
          name="active"
          value={formData.active}
          onChange={(e) => setFormData({ ...formData, active: e.target.value })}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">Не указано</MenuItem>
          <MenuItem value="Yes">Активен</MenuItem>
          <MenuItem value="No">Неактивен</MenuItem>
        </Select>

        <Button type="submit" variant="contained" color="primary">
          Добавить сотрудника
        </Button>
      </form>
    </Box>
  );
}

export default AddEmployeeForm;