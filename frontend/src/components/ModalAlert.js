import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

function ModalAlert({ open, onClose, text }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Уведомление</DialogTitle>
      <DialogContent>{text}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          ОК
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalAlert;