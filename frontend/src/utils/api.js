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

// Новые функции для аналитики
export const getEmployeeStats = async () => {
    const response = await axios.get('http://localhost:5000/analytics/employee-stats');
    return response.data;
  };
  
  export const getDepartmentPerformance = async () => {
    const response = await axios.get('http://localhost:5000/analytics/department-performance');
    return response.data;
  };
  
  export const getEmployeeAgeStats = async () => {
    const response = await axios.get('http://localhost:5000/analytics/employee-age');
    return response.data;
  };
  
  export const getChurnRate = async () => {
    const response = await axios.get('http://localhost:5000/analytics/churn-rate');
    return response.data;
  };

//   Контракты
  export const getContracts = async () => {
    const response = await axios.get('http://localhost:5000/contracts');
    return response.data;
  };
  
  export const addContract = async (contractData) => {
    const response = await axios.post('http://localhost:5000/contracts', contractData);
    return response.data;
  };
  
  export const updateContract = async (contractId, updatedData) => {
    const response = await axios.put(`http://localhost:5000/contracts/${contractId}`, updatedData);
    return response.data;
  };
  
  export const deleteContract = async (contractId) => {
    const response = await axios.delete(`http://localhost:5000/contracts/${contractId}`);
    return response.data;
  };