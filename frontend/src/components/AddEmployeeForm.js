import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import InputMask from 'react-input-mask'; // Для маски даты
import { getDepartments } from '../utils/api';
import ModalAlert from './ModalAlert'; // Импортируем модальное окно

function AddEmployeeForm({ onAdd }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '', 
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
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
  const [modalText, setModalText] = useState(''); // Текст в модальном окне

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
      setModalText('Заполните все обязательные поля!');
      setIsModalOpen(true);
      return;
    }

    // Проверка email
    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    if (!validateEmail(formData.email)) {
      setModalText('Введите корректный email!');
      setIsModalOpen(true);
      return;
    }

    // Проверка даты рождения
    if (!formData.date_of_birth) {
      setModalText('Укажите дату рождения!');
      setIsModalOpen(true);
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
      setModalText('Ошибка при добавлении сотрудника');
      setIsModalOpen(true);
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
        <InputMask
          mask="99.99.9999"
          value={formData.date_of_birth}
          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
        >
          {() => (
            <TextField
              label="Дата рождения"
              name="date_of_birth"
              placeholder="DD.MM.YYYY"
              fullWidth
              margin="normal"
              required
              variant="outlined"
            />
          )}
        </InputMask>

        {/* Пол */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Пол</InputLabel>
          <Select
            value={formData.gender}
            onChange={handleGenderChange}
            name="gender"
          >
            <MenuItem value="">
              <em>Не указано</em>
            </MenuItem>
            {genders.map((gender) => (
              <MenuItem key={gender} value={gender}>
                {gender === 'male' ? 'Мужской' : 'Женский'} 
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
        <FormControl fullWidth margin="normal">
          <InputLabel>Отдел</InputLabel>
          <Select
            value={formData.fk_department || ''}
            onChange={handleDepartmentChange}
            name="fk_department"
          >
            <MenuItem value="">
              <em>Не указано</em>
            </MenuItem>
            {departments.map((department) => (
              <MenuItem key={department.department_id} value={department.department_id}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

        {/* Кнопка отправки формы */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            mt: 2,
            width: { xs: '100%', md: 250 },
            maxWidth: '100%', 
            borderRadius: 3, 
            marginBottom: 4
          }}
        >
          Добавить сотрудника
        </Button>

        {/* Модальное окно */}
        <ModalAlert 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          text={modalText} 
        />
      </form>
    </Box>
  );
}

export default AddEmployeeForm;