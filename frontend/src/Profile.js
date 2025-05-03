// Profile.js
import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Grid, Button, CircularProgress, Alert } from '@mui/material';
import { getCurrentUser, getEmployeeVacations, createVacation } from './utils/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Получаем данные профиля
        const userData = await getCurrentUser();
        setUser(userData);
        
        // Получаем отпуска пользователя
        const vacationsData = await getEmployeeVacations(userData.id);
        setVacations(vacationsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные профиля');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Мой профиль
        </Typography>
        
        {user && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Имя:</Typography>
              <Typography variant="body1">{user.first_name} {user.last_name}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Email:</Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Должность:</Typography>
              <Typography variant="body1">{user.job_name}</Typography>
            </Grid>
          </Grid>
        )}
        
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Мои отпуска
        </Typography>
        
        {vacations.length > 0 ? (
          <Grid container spacing={2}>
            {vacations.map((vacation) => (
              <Grid item xs={12} key={vacation.vacation_id}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="body1">
                    С {new Date(vacation.start_date).toLocaleDateString()} 
                    по {new Date(vacation.end_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color={
                    vacation.status === 'Approved' ? 'success.main' : 
                    vacation.status === 'Rejected' ? 'error.main' : 'text.secondary'
                  }>
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
          <Typography variant="body1" color="text.secondary">
            У вас пока нет заявок на отпуск
          </Typography>
        )}
        
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 3 }}
          onClick={() => {/* Здесь можно добавить открытие формы для создания заявки */}}
        >
          Создать заявку на отпуск
        </Button>
      </Paper>
    </Container>
  );
};

export default Profile;