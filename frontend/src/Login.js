import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Container, Box, Alert } from '@mui/material';
import { login } from './utils/api';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await login({ email, password });
      
      // Сохраняем данные авторизации
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userId', data.employee_id);
      localStorage.setItem('userName', data.name);
      
      // Обновляем состояние авторизации
      if (setAuth) {
        setAuth({
          isAuthenticated: true,
          role: data.role,
          userId: data.employee_id,
          userName: data.name
        });
      }
      
      // Перенаправляем на главную страницу
      navigate('/');
      
    } catch (err) {
      console.error('Ошибка входа:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Неверный email или пароль');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center">
            Вход в HR-систему
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Войти
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;