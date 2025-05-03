import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Paper, Box } from '@mui/material';

const Forbidden = () => {
  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%', textAlign: 'center' }}>
          <Typography component="h1" variant="h4" color="error" gutterBottom>
            Доступ запрещен
          </Typography>
          <Typography variant="body1" paragraph>
            У вас нет прав для просмотра этой страницы.
          </Typography>
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary"
          >
            Вернуться на главную
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Forbidden;