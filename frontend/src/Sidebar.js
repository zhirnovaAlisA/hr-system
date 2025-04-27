import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, Drawer } from '@mui/material';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemText primary="Сотрудники" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/add-employee">
            <ListItemText primary="Добавить сотрудника" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/vacations">
            <ListItemText primary="Отпуска" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/profile">
            <ListItemText primary="Мой профиль" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/analytics">
            <ListItemText primary="Аналитика" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/contracts">
            <ListItemText primary="Договоры" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar;