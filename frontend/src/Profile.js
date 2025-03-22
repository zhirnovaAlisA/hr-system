import React from 'react';
import { Typography, Box } from '@mui/material';

function Profile() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Мой профиль
      </Typography>
      <Typography>Имя: Иван Иванов</Typography>
      <Typography>Email: ivan@example.com</Typography>
    </Box>
  );
}

export default Profile;