from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Модель Department
class Department(db.Model):
    __tablename__ = 'departments'
    department_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)

# Модель Employee
class Employee(db.Model):
    __tablename__ = 'employees'
    employee_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(20))
    last_name = db.Column(db.String(25), nullable=False)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.Enum('male', 'female'))
    email = db.Column(db.String(50), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    salary = db.Column(db.DECIMAL(8, 2))
    inn = db.Column(db.String(12))
    snils = db.Column(db.String(11))
    fk_department = db.Column(db.Integer, db.ForeignKey('departments.department_id'), nullable=True)
    job_name = db.Column(db.String(50), nullable=False)
    active = db.Column(db.Enum('Yes', 'No'), default='Yes')
    
    password_hash = db.Column(db.String(128))
    role = db.Column(db.Enum('hr', 'employee'), default='employee')
    
    department = db.relationship('Department', backref='employees')
    employee_contracts = db.relationship('Contract', back_populates='employee')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)   

# Модель Vacation
class Vacation(db.Model):
    __tablename__ = 'vacations'
    vacation_id = db.Column(db.Integer, primary_key=True)
    fk_employee = db.Column(db.Integer, db.ForeignKey('employees.employee_id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('Pending', 'Approved', 'Rejected'), default='Pending')

    employee = db.relationship('Employee', backref='vacations')

# Модель Contract
class Contract(db.Model):
    __tablename__ = 'contracts'
    contract_id = db.Column(db.Integer, primary_key=True)
    fk_employee = db.Column(db.Integer, db.ForeignKey('employees.employee_id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    renewal_notification_date = db.Column(db.Date, default=None)

    # Связь с Employee
    employee = db.relationship('Employee', back_populates='employee_contracts')

class WorkHour(db.Model):
    __tablename__ = 'work_hours'
    entry_id = db.Column(db.Integer, primary_key=True)
    fk_employee = db.Column(db.Integer, db.ForeignKey('employees.employee_id'))
    work_date = db.Column(db.Date)
    hours_worked = db.Column(db.DECIMAL(4, 2))