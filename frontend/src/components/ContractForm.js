import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography
} from '@mui/material';
import { getEmployees } from '../utils/api';

function ContractForm({ open, onClose, onSubmit }) {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    fk_employee: '',
    start_date: '',
    end_date: '',
    renewal_notification_date: '',
    status: 'Active'
  });
  const [errors, setErrors] = useState({});
  const [isPermanent, setIsPermanent] = useState(false); // Флаг для бессрочного договора
  const [loading, setLoading] = useState(false);

  // Загрузка списка сотрудников при открытии формы
  useEffect(() => {
    if (open) {
      fetchEmployees();
      // Сброс формы при открытии
      setFormData({
        fk_employee: '',
        start_date: '',
        end_date: '',
        renewal_notification_date: '',
        status: 'Active'
      });
      setIsPermanent(false);
      setErrors({});
    }
  }, [open]);

  // Загрузка списка сотрудников
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const employeesData = await getEmployees();
      // Фильтруем только активных сотрудников
      const activeEmployees = employeesData.filter(emp => emp.active === 'Yes');
      setEmployees(activeEmployees);
    } catch (error) {
      console.error('Ошибка при загрузке сотрудников:', error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очистка ошибки при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Обработчик изменения флага бессрочного договора
  const handlePermanentChange = (e) => {
    const isChecked = e.target.checked;
    setIsPermanent(isChecked);
    
    if (isChecked) {
      // Очищаем поле даты окончания при выборе бессрочного договора
      setFormData(prev => ({
        ...prev,
        end_date: '', // Оставляем пустым в форме, но при отправке установим 2099-01-01
        renewal_notification_date: '' // Очищаем дату уведомления, так как она не имеет смысла для бессрочного договора
      }));
      
      // Очищаем ошибки для этих полей
      setErrors(prev => ({
        ...prev,
        end_date: null,
        renewal_notification_date: null
      }));
    }
  };

  // Валидация формы перед отправкой
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fk_employee) {
      newErrors.fk_employee = 'Выберите сотрудника';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Укажите дату начала';
    }
    
    // Пропускаем проверку для даты окончания и уведомления, если выбран бессрочный договор
    if (!isPermanent) {
      // Проверка, что дата окончания позже даты начала, если указана
      if (formData.start_date && formData.end_date && 
          new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = 'Дата окончания должна быть позже даты начала';
      }
      
      // Проверка, что дата уведомления раньше даты окончания, если обе указаны
      if (formData.renewal_notification_date && formData.end_date && 
          new Date(formData.renewal_notification_date) >= new Date(formData.end_date)) {
        newErrors.renewal_notification_date = 'Дата уведомления должна быть раньше даты окончания';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Подготовка данных для отправки
      let formattedData = {
        ...formData,
        fk_employee: parseInt(formData.fk_employee, 10)
      };
      
      // Если выбран бессрочный договор, устанавливаем дату окончания на 1 января 2099 года
      if (isPermanent) {
        formattedData.end_date = '2099-01-01';
        formattedData.renewal_notification_date = null; // Для бессрочного договора не нужна дата уведомления
      }
      
      onSubmit(formattedData);
    }
  };

  // Находим имя выбранного сотрудника для отображения в заголовке
  const getSelectedEmployeeName = () => {
    if (!formData.fk_employee) return '';
    const employee = employees.find(emp => emp.employee_id === parseInt(formData.fk_employee, 10));
    return employee ? `${employee.first_name} ${employee.last_name}` : '';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="contract-form-dialog"
    >
      <DialogTitle className="contract-form-title">
        Новый контракт
        {formData.fk_employee && getSelectedEmployeeName() ? 
          ` для ${getSelectedEmployeeName()}` : 
          ''}
      </DialogTitle>
      
      <DialogContent className="contract-form-content">
        <form onSubmit={handleSubmit}>
          <Grid container className="contract-form-grid">
            <Grid item xs={12} className="contract-form-grid-item">
              <FormControl 
                fullWidth 
                error={!!errors.fk_employee}
                className="contract-form-select"
              >
                <InputLabel id="employee-select-label">Сотрудник</InputLabel>
                <Select
                  labelId="employee-select-label"
                  id="employee-select"
                  name="fk_employee"
                  value={formData.fk_employee}
                  onChange={handleChange}
                  label="Сотрудник"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  {loading ? (
                    <MenuItem disabled>Загрузка сотрудников...</MenuItem>
                  ) : employees.length > 0 ? (
                    employees.map(employee => (
                      <MenuItem 
                        key={employee.employee_id} 
                        value={employee.employee_id}
                      >
                        {employee.first_name} {employee.last_name} ({employee.job_name})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Нет доступных сотрудников</MenuItem>
                  )}
                </Select>
                {errors.fk_employee && (
                  <Typography className="contract-form-error">
                    {errors.fk_employee}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} className="contract-form-grid-item">
              <TextField
                fullWidth
                label="Дата начала"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.start_date}
                helperText={errors.start_date}
                className="contract-form-field"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} className="contract-form-grid-item">
              <FormControlLabel
                className="contract-form-checkbox"
                control={
                  <Checkbox
                    checked={isPermanent}
                    onChange={handlePermanentChange}
                    name="isPermanent"
                    color="primary"
                  />
                }
                label="Бессрочный договор"
              />
            </Grid>
            
            {!isPermanent && (
              <>
                <Grid item xs={12} sm={6} className="contract-form-grid-item">
                  <TextField
                    fullWidth
                    label="Дата окончания"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.end_date}
                    helperText={errors.end_date}
                    className="contract-form-field"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} className="contract-form-grid-item">
                  <TextField
                    fullWidth
                    label="Дата уведомления о продлении"
                    name="renewal_notification_date"
                    type="date"
                    value={formData.renewal_notification_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.renewal_notification_date}
                    helperText={errors.renewal_notification_date}
                    className="contract-form-field"
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6} className="contract-form-grid-item">
              <FormControl fullWidth className="contract-form-field">
                <InputLabel id="status-select-label">Статус</InputLabel>
                <Select
                  labelId="status-select-label"
                  name="status"
                  value={formData.status || 'Active'}
                  onChange={handleChange}
                  label="Статус"
                >
                  <MenuItem value="Active">Активный</MenuItem>
                  <MenuItem value="Pending">В ожидании</MenuItem>
                  <MenuItem value="Expired">Истек</MenuItem>
                  <MenuItem value="Terminated">Расторгнут</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      
      <DialogActions className="contract-form-actions">
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
        >
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ContractForm;