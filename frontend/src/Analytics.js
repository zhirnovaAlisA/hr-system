import React, { useEffect, useState } from 'react';

function Analytics() {
  const [departmentCount, setDepartmentCount] = useState([]);
  const [averageAge, setAverageAge] = useState(0);
  const [churnRate, setChurnRate] = useState(0);
  const [averageTenure, setAverageTenure] = useState(0);
  const [averageHours, setAverageHours] = useState([]);

  useEffect(() => {
    // Количество сотрудников в отделах
    fetch('http://localhost:5000/analytics/department-count')
      .then(response => response.json())
      .then(data => setDepartmentCount(data))
      .catch(error => console.error('Ошибка:', error));

    // Средний возраст
    fetch('http://localhost:5000/analytics/average-age')
      .then(response => response.json())
      .then(data => setAverageAge(data.average_age))
      .catch(error => console.error('Ошибка:', error));

    // Текучесть
    fetch('http://localhost:5000/analytics/churn-rate')
      .then(response => response.json())
      .then(data => setChurnRate(data.churn_rate))
      .catch(error => console.error('Ошибка:', error));

    // Средний стаж
    fetch('http://localhost:5000/analytics/average-tenure')
      .then(response => response.json())
      .then(data => setAverageTenure(data.average_tenure))
      .catch(error => console.error('Ошибка:', error));

    // Среднее время работы по отделам
    fetch('http://localhost:5000/analytics/average-hours-per-department')
      .then(response => response.json())
      .then(data => setAverageHours(data))
      .catch(error => console.error('Ошибка:', error));
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

      {/* Количество сотрудников в отделах */}
      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h3>Распределение по отделам:</h3>
        <ul>
          {departmentCount.map(dept => (
            <li key={dept.department}>
              {dept.department}: {dept.count} сотрудников
            </li>
          ))}
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
          {averageHours.length > 0 ? (
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