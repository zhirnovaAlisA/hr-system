import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Получение списка сотрудников
export const getEmployees = async () => {
    const response = await axios.get(`${API_URL}/employees`);
    return response.data;
};

// Добавление нового сотрудника
export const addEmployee = async (data) => {
    await axios.post(`${API_URL}/employees`, data);
};

// Удаление сотрудника
export const deleteEmployee = async (id) => {
    await axios.delete(`${API_URL}/employees/${id}`);
};

// Обновление сотрудника
// Обновление сотрудника
export const updateEmployee = async (id, data) => {
    await axios.put(`${API_URL}/employees/${id}`, data);
};

// Получение списка заявок на отпуск
export const getVacations = async () => {
    const response = await axios.get(`${API_URL}/vacations`);
    return response.data;
};

// Обновление статуса заявки
export const updateVacation = async (id, data) => {
    await axios.put(`${API_URL}/vacations/${id}`, data); // Отправляем PUT-запрос
};

export const getDepartments = async () => {
    const response = await axios.get(`${API_URL}/departments`);
    return response.data;
};