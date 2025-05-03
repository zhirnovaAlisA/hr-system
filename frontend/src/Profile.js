// Profile.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Grid, Button, CircularProgress, Alert, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  List, ListItem, ListItemText, Divider
} from '@mui/material';
import { getCurrentUser, getEmployeeVacations, createVacation, getDepartments } from './utils/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vacations, setVacations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Состояние для диалога создания отпуска
  const [openDialog, setOpenDialog] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [creatingVacation, setCreatingVacation] = useState(false);

  // Загрузка данных профиля
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Получаем данные профиля
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Получаем отпуска пользователя
      const vacationsData = await getEmployeeVacations(userData.id);
      setVacations(vacationsData);
      
      // Получаем список отделов
      const departmentsData = await getDepartments();
      setDepartments(departmentsData);
      
      setLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные профиля');
      setLoading(false);
      
      // Если ошибка авторизации, перенаправляем на страницу входа
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  // Получение названия отдела по ID
  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'Не указан';
    
    const department = departments.find(dept => dept.department_id === departmentId);
    return department ? department.name : `ID: ${departmentId}`;
  };

  // Обработчик открытия диалога
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setStartDate('');
    setEndDate('');
    setDialogError('');
  };

  // Обработчик закрытия диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Обработчик создания заявки на отпуск
  const handleCreateVacation = async () => {
    try {
      if (!startDate || !endDate) {
        setDialogError('Пожалуйста, укажите дату начала и окончания отпуска');
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        setDialogError('Дата начала не может быть позже даты окончания');
        return;
      }

      setCreatingVacation(true);
      setDialogError('');

      const vacationData = {
        fk_employee: parseInt(user.id),
        start_date: startDate,
        end_date: endDate
      };
      
      console.log('Отправляемые данные:', vacationData);
      
      await createVacation(vacationData);
      
      // Закрываем диалог
      handleCloseDialog();
      
      // Перезагружаем данные
      await fetchUserData();
      
      setCreatingVacation(false);
    } catch (err) {
      console.error('Ошибка при создании заявки:', err);
      setCreatingVacation(false);
      
      if (err.response && err.response.data) {
        console.error('Ответ сервера:', err.response.data);
        setDialogError(err.response.data.error || 'Не удалось создать заявку на отпуск');
      } else {
        setDialogError('Не удалось создать заявку на отпуск');
      }
      
      // Если ошибка авторизации, перенаправляем на страницу входа
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    } catch (err) {
      console.error('Ошибка форматирования даты:', err);
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container className="loading-container">
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="error-container">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="profile-container">
      <Paper elevation={3} className="profile-section">
        <Typography variant="h4" gutterBottom>
          Мой профиль
        </Typography>
        
        {user && (
          <Paper elevation={1} className="user-info-paper">
            <Typography variant="h5" gutterBottom>
              Персональная информация
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Имя" 
                  secondary={user.first_name} 
                  primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                />
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Фамилия" 
                  secondary={user.last_name} 
                  primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                />
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Email" 
                  secondary={user.email} 
                  primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                />
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Должность" 
                  secondary={user.job_name} 
                  primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                />
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemText 
                  primary="Отдел" 
                  secondary={getDepartmentName(user.department_id || user.fk_department)} 
                  primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                />
              </ListItem>
            </List>
          </Paper>
        )}
      </Paper>
      
      <Paper elevation={3} className="vacations-section">
        <Typography variant="h5" gutterBottom>
          Заявки на отпуск
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          className="create-vacation-button"
          onClick={handleOpenDialog}
        >
          Создать заявку на отпуск
        </Button>
        
        {vacations && vacations.length > 0 ? (
          <Grid container spacing={2}>
            {vacations.map((vacation) => (
              <Grid item xs={12} key={vacation.vacation_id}>
                <Paper elevation={1} className="vacation-item">
                  <Typography variant="body1" gutterBottom>
                    <strong>Период:</strong> с {formatDate(vacation.start_date)} 
                    по {formatDate(vacation.end_date)}
                  </Typography>
                  <Typography variant="body2" className={`vacation-status ${
                    vacation.status === 'Approved' ? 'status-approved' : 
                    vacation.status === 'Rejected' ? 'status-rejected' : 'status-pending'
                  }`}>
                    Статус: {
                      vacation.status === 'Approved' ? 'Одобрен' : 
                      vacation.status === 'Rejected' ? 'Отклонен' : 'На рассмотрении'
                    }
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body1" className="no-vacations-text">
            У вас пока нет заявок на отпуск
          </Typography>
        )}
      </Paper>
      
      {/* Диалоговое окно для создания заявки на отпуск */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Создание заявки на отпуск</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" className="dialog-error">
              {dialogError}
            </Alert>
          )}
          
          <Grid container spacing={2} className="dialog-form">
            <Grid item xs={12}>
              <TextField
                label="Дата начала"
                type="date"
                fullWidth
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                className="date-field"
                disabled={creatingVacation}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Дата окончания"
                type="date"
                fullWidth
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                disabled={creatingVacation}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            disabled={creatingVacation}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleCreateVacation} 
            color="primary"
            disabled={creatingVacation}
          >
            {creatingVacation ? 'Создание...' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;