// utils/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: API_URL
});

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Сеанс истек или токен недействителен - перенаправить на страницу входа
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Аутентификация
export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

// Получение профиля текущего пользователя
export const getCurrentUser = async () => {
  const response = await api.get(`/auth/profile`);
  return response.data;
};

// Получение списка сотрудников (используем api с JWT)
export const getEmployees = async () => {
  const response = await api.get(`/employees`);
  return response.data;
};

// Добавление нового сотрудника
export const addEmployee = async (data) => {
  await api.post(`/employees`, data);
};

// Удаление сотрудника
export const deleteEmployee = async (id) => {
  await api.delete(`/employees/${id}`);
};

// Обновление сотрудника
export const updateEmployee = async (id, data) => {
  await api.put(`/employees/${id}`, data);
};

// Получение списка заявок на отпуск
export const getVacations = async () => {
  const response = await api.get(`/vacations`);
  return response.data;
};

// Получение списка отпусков конкретного сотрудника
export const getEmployeeVacations = async (employeeId) => {
  if (!employeeId) {
    console.error('Не указан ID сотрудника для получения отпусков');
    return [];
  }
  
  try {
    const response = await api.get(`/employee-vacations/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении отпусков сотрудника ${employeeId}:`, error);
    return [];
  }
};

// Создание заявки на отпуск
export const createVacation = async (data) => {
  // Убедимся, что fk_employee точно число
  const vacationData = {
    ...data,
    fk_employee: parseInt(data.fk_employee)
  };
  
  console.log('Отправка данных в API:', vacationData);
  const response = await api.post(`/vacations`, vacationData);
  return response.data;
};

// Обновление статуса заявки
export const updateVacation = async (id, data) => {
  await api.put(`/vacations/${id}`, data);
};

export const getDepartments = async () => {
  const response = await api.get(`/departments`);
  return response.data;
};

// Функции для аналитики
export const getEmployeeStats = async () => {
  const response = await api.get('/analytics/employee-stats');
  return response.data;
};

export const getDepartmentPerformance = async () => {
  const response = await api.get('/analytics/department-performance');
  return response.data;
};

export const getEmployeeAgeStats = async () => {
  const response = await api.get('/analytics/employee-age');
  return response.data;
};

export const getChurnRate = async () => {
  const response = await api.get('/analytics/churn-rate');
  return response.data;
};

// Контракты
export const getContracts = async () => {
  const response = await api.get('/contracts');
  return response.data;
};

export const addContract = async (contractData) => {
  const response = await api.post('/contracts', contractData);
  return response.data;
};

export const updateContract = async (contractId, updatedData) => {
  const response = await api.put(`/contracts/${contractId}`, updatedData);
  return response.data;
};

export const deleteContract = async (contractId) => {
  const response = await api.delete(`/contracts/${contractId}`);
  return response.data;
};

// Установка пароля (только для HR)
export const setPassword = async (employeeId, password) => {
  const response = await api.post(`/auth/set-password/${employeeId}`, { password });
  return response.data;
};

export default api;