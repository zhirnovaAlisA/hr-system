import React from 'react';
import { Typography, Box } from '@mui/material';

function Analytics() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Аналитика
      </Typography>
      <Typography>Здесь будет аналитика по сотрудникам.</Typography>
    </Box>
  );
}

export default Analytics;