import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Collapse,
  FormGroup,
  Tooltip,
} from '@mui/material';
import EmployeeCard from './components/EmployeeCard';
import { getEmployees, deleteEmployee, updateEmployee } from './utils/api';

function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Поиск
  const [filterGender, setFilterGender] = useState(''); // Фильтр по полу
  const [filterSalaryMin, setFilterSalaryMin] = useState(''); // Минимальная зарплата
  const [filterSalaryMax, setFilterSalaryMax] = useState(''); // Максимальная зарплата
  const [showFilters, setShowFilters] = useState(false); // Состояние для показа/скрытия фильтров
  const [sortField, setSortField] = useState(null); // Поле сортировки
  const [sortDirection, setSortDirection] = useState('asc'); // Направление сортировки

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  // Фильтрация сотрудников
  const filteredEmployees = employees
    .filter((employee) => {
      // Поиск по строковому запросу
      const matchesSearch =
        Object.values(employee).some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(searchQuery.toLowerCase())
        ) || searchQuery === '';

      // Фильтр по полу
      const matchesGender =
        filterGender === '' || employee.gender === filterGender;

      // Фильтр по зарплате
      const salary = parseFloat(employee.salary);
      const matchesSalary =
        (!filterSalaryMin || salary >= parseFloat(filterSalaryMin)) &&
        (!filterSalaryMax || salary <= parseFloat(filterSalaryMax));

      return matchesSearch && matchesGender && matchesSalary;
    })
    .slice() // Копия массива для сортировки
    .sort((a, b) => {
      if (!sortField) return 0; // Если нет поля сортировки, не сортируем

      const valueA = a[sortField];
      const valueB = b[sortField];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return 0;
    });

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm('Вы уверены, что хотите удалить этого сотрудника?')
    ) {
      await deleteEmployee(id);
      fetchEmployees();
    }
  };

  const handleCloseCard = async () => {
    setSelectedEmployee(null);
    await fetchEmployees();
  };

  const handleUpdateEmployee = async (updatedEmployee) => {
    try {
      await updateEmployee(updatedEmployee.employee_id, updatedEmployee);
      fetchEmployees();
    } catch (error) {
      console.error('Ошибка при обновлении сотрудника:', error);
    }
  };

  // Обработчик сортировки
  const handleSort = (field) => {
    if (sortField === field) {
      // Переключаем направление сортировки
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Устанавливаем новое поле сортировки и направление "asc"
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Функция для сброса всех фильтров
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterGender('');
    setFilterSalaryMin('');
    setFilterSalaryMax('');
    setSortField(null); // Сбрасываем сортировку
    setSortDirection('asc'); // Возвращаем направление к "asc"
    setShowFilters(false); // Скрываем блок фильтров после сброса
  };

  return (
    <Box className="employees-list-container">
      {/* Поле поиска */}
      <Box className="search-container">
        <TextField
          label="Поиск по сотрудникам"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-field"
        />
        {/* Кнопка для показа/скрытия фильтров */}
        <Button
          variant="contained"
          onClick={() => setShowFilters(!showFilters)}
          className="filter-toggle-btn"
        >
          {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
        </Button>
        {/* Кнопка сброса фильтров */}
        <Button
          variant="outlined"
          color="error"
          onClick={handleResetFilters}
          className="reset-filters-btn"
        >
          Сбросить фильтры
        </Button>
      </Box>

      {/* Блок фильтров */}
      <Collapse in={showFilters} timeout="auto" unmountOnExit>
        <Box className="filters-container">
          <FormControl fullWidth className="gender-filter">
            <InputLabel id="gender-label">Пол</InputLabel>
            <Select
              labelId="gender-label"
              id="gender-select"
              value={filterGender}
              label="Пол"
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="male">Мужской</MenuItem>
              <MenuItem value="female">Женский</MenuItem>
            </Select>
          </FormControl>
          <FormGroup row className="salary-filters">
            <TextField
              label="Мин. зарплата"
              type="number"
              value={filterSalaryMin}
              onChange={(e) => setFilterSalaryMin(e.target.value)}
              className="salary-min"
            />
            <TextField
              label="Макс. зарплата"
              type="number"
              value={filterSalaryMax}
              onChange={(e) => setFilterSalaryMax(e.target.value)}
              className="salary-max"
            />
          </FormGroup>
        </Box>
      </Collapse>

      {/* Таблица сотрудников */}
      <Box className="table-container">
        <TableContainer component={Paper}>
          <Table className="employees-table" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Tooltip title="Сортировать">
                    <span
                      className="sortable-header"
                      onClick={() => handleSort('first_name')}
                    >
                      Имя{' '}
                      {sortField === 'first_name' &&
                        (sortDirection === 'asc' ? '↑' : '↓')}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Сортировать">
                    <span
                      className="sortable-header"
                      onClick={() => handleSort('last_name')}
                    >
                      Фамилия{' '}
                      {sortField === 'last_name' &&
                        (sortDirection === 'asc' ? '↑' : '↓')}
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">Пол</TableCell>
                <TableCell align="right">Email</TableCell>
                <TableCell align="right">Должность</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.employee_id}
                  onClick={() => handleRowClick(employee)}
                  className={`employee-row ${selectedEmployee?.employee_id === employee.employee_id ? 'selected' : ''}`}
                >
                  <TableCell>{employee.first_name}</TableCell>
                  <TableCell align="right">{employee.last_name}</TableCell>
                  <TableCell align="right">{employee.gender}</TableCell>
                  <TableCell align="right">{employee.email}</TableCell>
                  <TableCell align="right">{employee.job_name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Карточка выбранного сотрудника */}
      {selectedEmployee && (
        <EmployeeCard
          employee={selectedEmployee}
          onClose={handleCloseCard}
          onDelete={handleDelete}
          onUpdate={handleUpdateEmployee}
        />
      )}
    </Box>
  );
}

export default EmployeesList;