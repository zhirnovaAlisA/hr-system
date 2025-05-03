import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Drawer, List, ListItem, ListItemText, Divider, Button, Typography, Box 
} from '@mui/material';

const Sidebar = ({ userName, role, onLogout }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {userName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {role === 'hr' ? 'HR-менеджер' : 'Сотрудник'}
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {/* Общие пункты меню для всех пользователей */}
        <ListItem button component={Link} to="/profile">
          <ListItemText primary="Мой профиль" />
        </ListItem>
        
        {/* Пункты меню только для HR */}
        {role === 'hr' && (
          <>
            <ListItem button component={Link} to="/employees">
              <ListItemText primary="Сотрудники" />
            </ListItem>
            
            <ListItem button component={Link} to="/add-employee">
              <ListItemText primary="Добавить сотрудника" />
            </ListItem>
            
            <ListItem button component={Link} to="/vacations">
              <ListItemText primary="Заявки на отпуск" />
            </ListItem>
            
            <ListItem button component={Link} to="/contracts">
              <ListItemText primary="Контракты" />
            </ListItem>
            
            <ListItem button component={Link} to="/analytics">
              <ListItemText primary="Аналитика" />
            </ListItem>
          </>
        )}
      </List>
      
      <Box sx={{ 
        position: 'fixed', 
        bottom: 20, 
        width: 200,  // Уменьшаем ширину кнопки
        left: 20     // Отступ слева
      }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          fullWidth
        >
          Выйти
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;