import React, { useEffect, useState } from 'react';
import api from './utils/api'; // Импортируем API с авторизацией

function Analytics() {
  const [departmentCount, setDepartmentCount] = useState([]);
  const [averageAge, setAverageAge] = useState(0);
  const [churnRate, setChurnRate] = useState(0);
  const [averageTenure, setAverageTenure] = useState(0);
  const [averageHours, setAverageHours] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Количество сотрудников в отделах
        const deptCountResponse = await api.get('/analytics/department-count');
        setDepartmentCount(deptCountResponse.data || []);

        // Средний возраст
        const ageResponse = await api.get('/analytics/average-age');
        setAverageAge(ageResponse.data.average_age || 0);

        // Текучесть
        const churnResponse = await api.get('/analytics/churn-rate');
        setChurnRate(churnResponse.data.churn_rate || 0);

        // Средний стаж
        const tenureResponse = await api.get('/analytics/average-tenure');
        setAverageTenure(tenureResponse.data.average_tenure || 0);

        // Среднее время работы по отделам
        const hoursResponse = await api.get('/analytics/average-hours-per-department');
        setAverageHours(hoursResponse.data || []);
      } catch (err) {
        console.error('Ошибка загрузки аналитики:', err);
        setError('Не удалось загрузить данные аналитики');
      }
    };

    fetchData();
  }, []);

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        height: '100vh',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <h1>Аналитика</h1>
      
      {error && (
        <div style={{ color: 'red', padding: '10px', marginBottom: '20px', border: '1px solid red' }}>
          {error}
        </div>
      )}
      
      {/* Количество сотрудников в отделах */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Распределение по отделам:</h3>
        <ul>
          {Array.isArray(departmentCount) && departmentCount.length > 0 ? (
            departmentCount.map(dept => (
              <li key={dept.department}>
                {dept.department}: {dept.count} сотрудников
              </li>
            ))
          ) : (
            <li>Нет данных</li>
          )}
        </ul>
      </div>
      
      {/* Средний возраст */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Средний возраст сотрудников:</h3>
        <p>{averageAge || 0} лет</p>
      </div>
      
      {/* Текучесть */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Текучесть кадров:</h3>
        <p>{churnRate || 0}% сотрудников уволились</p>
      </div>
      
      {/* Средний стаж */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Средний стаж сотрудников:</h3>
        <p>{averageTenure || 0} лет</p>
      </div>
      
      {/* Среднее время работы */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Среднее время работы по отделам:</h3>
        <ul>
          {Array.isArray(averageHours) && averageHours.length > 0 ? (
            averageHours.map(dept => (
              <li key={dept.department}>
                {dept.department}: {dept.average_hours} часов/день
              </li>
            ))
          ) : (
            <li>Нет данных</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Analytics;