import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import ModalAlert from './ModalAlert';
import { getDepartments } from '../utils/api';

function EmployeeCard({ employee, onClose, onDismiss, onUpdate }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [departments, setDepartments] = useState([]);
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsData = await getDepartments();
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Ошибка при загрузке отделов:', error);
      }
    };
    
    fetchDepartments();
  }, []);

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'Не указан';
    
    const department = departments.find(dept => dept.department_id === departmentId);
    return department ? department.name : 'Не указан';
  };

  const handleTabChange = (_, newValue) => {
    setTabIndex(newValue);
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
      setTabIndex(0);
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении сотрудника:', error);
      setModalText('Произошла ошибка при обновлении сотрудника.');
      setIsModalOpen(true);
    }
  };

  const handleDismiss = async () => {
    const actionText = employee.active === 'Yes' 
      ? 'уволить' 
      : 'вернуть на работу';
    
    if (!window.confirm(`Вы уверены, что хотите ${actionText} этого сотрудника?`)) return;

    try {
      const updatedEmployee = {
        ...employee,
        active: employee.active === 'Yes' ? 'No' : 'Yes'
      };
      
      await onDismiss(updatedEmployee);
      onClose();
    } catch (error) {
      console.error('Ошибка при изменении статуса сотрудника:', error);
      setModalText('Произошла ошибка при изменении статуса сотрудника.');
      setIsModalOpen(true);
    }
  };

  return (
    <Card className="employee-card">
      <ModalAlert 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        text={modalText} 
      />

      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        centered
        className="employee-card-tabs"
      >
        <Tab label="Просмотр" />
        <Tab label="Редактирование" />
      </Tabs>

      {tabIndex === 0 ? (
        <CardContent>
          <div className="employee-card-view">
            <div className="employee-card-column">
              <Typography variant="body1">Имя: {employee.first_name}</Typography>
              <Typography variant="body1">Фамилия: {employee.last_name}</Typography>
              <Typography variant="body1">
                Дата рождения: {employee.date_of_birth || 'Не указана'}
              </Typography>
              <Typography variant="body1">Пол: {employee.gender || 'Не указан'}</Typography>
              <Typography variant="body1">Email: {employee.email}</Typography>
              <Typography variant="body1">Телефон: {employee.phone || 'Не указан'}</Typography>
            </div>

            <div className="employee-card-column">
              <Typography variant="body1">
                Заработная плата: {employee.salary || 'Не указана'}
              </Typography>
              <Typography variant="body1">
                Отдел: {getDepartmentName(employee.fk_department)}
              </Typography>
              <Typography variant="body1">
                Должность: {employee.job_name || 'Не указана'}
              </Typography>
              <Typography variant="body1">ИНН: {formData.inn || 'Не указан'}</Typography>
              <Typography variant="body1">СНИЛС: {formData.snils || 'Не указан'}</Typography>
              <Typography variant="body1">
                Активность: {formData.active === 'Yes' ? 'Активен' : 'Неактивен'}
              </Typography>
            </div>
          </div>

          <Box className="employee-card-actions">
            <Button 
              variant="contained" 
              color={employee.active === 'Yes' ? 'error' : 'success'} 
              onClick={handleDismiss}
              className={employee.active === 'Yes' ? 'dismiss-button' : 'rehire-button'}
            >
              {employee.active === 'Yes' ? 'Уволить' : 'Восстановить'}
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Закрыть
            </Button>
          </Box>
        </CardContent>
      ) : (
        <CardContent>
          <div className="employee-card-edit-form">
            <div className="employee-card-edit-row">
              <TextField
                label="Имя"
                name="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                fullWidth
                required
                className="employee-card-field"
              />
              <TextField
                label="Фамилия"
                name="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                fullWidth
                required
                className="employee-card-field"
              />
            </div>

            <div className="employee-card-edit-row">
              <TextField
                label="Дата рождения (YYYY-MM-DD)"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
                fullWidth
                className="employee-card-field"
              />
              <TextField
                label="Пол (male/female)"
                name="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                fullWidth
                className="employee-card-field"
              />
            </div>

            <div className="employee-card-edit-row">
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                fullWidth
                required
                className="employee-card-field"
              />
              <TextField
                label="Телефон"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                fullWidth
                className="employee-card-field"
              />
            </div>

            <div className="employee-card-edit-row">
              <TextField
                label="Заработная плата"
                name="salary"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
                fullWidth
                className="employee-card-field"
              />
              <TextField
                label="ID Отдела"
                name="fk_department"
                value={formData.fk_department || ''}
                onChange={(e) =>
                  setFormData({ ...formData, fk_department: e.target.value })
                }
                fullWidth
                className="employee-card-field"
              />
            </div>

            <div className="employee-card-edit-row">
              <TextField
                label="Должность"
                name="job_name"
                value={formData.job_name}
                onChange={(e) =>
                  setFormData({ ...formData, job_name: e.target.value })
                }
                fullWidth
                className="employee-card-field"
              />
              <TextField
                label="Активность (Yes/No)"
                name="active"
                value={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.value })
                }
                fullWidth
                className="employee-card-field"
              />
            </div>

            <div className="employee-card-edit-row">
              <TextField
                label="ИНН"
                name="inn"
                value={formData.inn}
                onChange={(e) =>
                  setFormData({ ...formData, inn: e.target.value })
                }
                fullWidth
                className="employee-card-field"
              />
              <TextField
                label="СНИЛС"
                name="snils"
                value={formData.snils}
                onChange={(e) =>
                  setFormData({ ...formData, snils: e.target.value })
                }
                fullWidth
                className="employee-card-field"
              />
            </div>
          </div>

          <Box className="employee-card-actions">
            <Button variant="contained" color="primary" onClick={handleSave}>
              Сохранить
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Закрыть
            </Button>
          </Box>
        </CardContent>
      )}
    </Card>
  );
}

export default EmployeeCard;