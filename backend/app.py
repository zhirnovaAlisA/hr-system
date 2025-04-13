from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from flask_cors import CORS
import traceback
from datetime import datetime
from marshmallow import fields  # Импортируйте fields

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:123456@localhost/hr_system'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

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

    department = db.relationship('Department', backref='employees')

# Модель Vacation
class Vacation(db.Model):
    __tablename__ = 'vacations'
    vacation_id = db.Column(db.Integer, primary_key=True)
    fk_employee = db.Column(db.Integer, db.ForeignKey('employees.employee_id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum('Pending', 'Approved', 'Rejected'), default='Pending')

    employee = db.relationship('Employee', backref='vacations')

# Схема Employee
class EmployeeSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Employee
        load_instance = True
        sqla_session = db.session
        include_fk = True  # Включаем fk_department

employee_schema = EmployeeSchema()
employees_schema = EmployeeSchema(many=True)

# Схема Vacation
class VacationSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Vacation
        load_instance = True
        sqla_session = db.session
        include_fk = True

    employee = fields.Nested(  # Уберите 'ma.'
        'EmployeeSchema',
        only=('first_name', 'last_name', 'email'),
        dump_only=True
)

vacation_schema = VacationSchema()
vacations_schema = VacationSchema(many=True)

# Схема Department
class DepartmentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Department
        load_instance = True
        sqla_session = db.session

department_schema = DepartmentSchema()
departments_schema = DepartmentSchema(many=True)

# Эндпоинты

# Employees
@app.route('/employees', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    return jsonify(employees_schema.dump(employees))  # ✅ Используйте dump()

@app.route('/employees/<int:employee_id>', methods=['GET'])
def get_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    return jsonify(employee_schema.dump(employee))  # ✅

@app.route('/employees', methods=['POST'])
def add_employee():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ('first_name', 'last_name', 'email', 'job_name')):
            return jsonify({"error": "Missing required fields"}), 400

        # Преобразование данных
        if 'salary' in data and data['salary'] is not None:
            data['salary'] = float(data['salary'])

        if 'date_of_birth' in data and data['date_of_birth'] is not None:
            data['date_of_birth'] = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()

        new_employee = Employee(**data)
        db.session.add(new_employee)
        db.session.commit()

        return jsonify(employee_schema.dump(new_employee)), 201

    except Exception as e:
        print("Error:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# PUT /employees/<int:employee_id>
@app.route('/employees/<int:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    try:
        employee = Employee.query.get_or_404(employee_id)
        data = request.get_json()

        if not data or not all(key in data for key in ('first_name', 'last_name', 'email', 'job_name')):
            return jsonify({"error": "Missing required fields"}), 400

        # Преобразование данных
        if 'date_of_birth' in data and data['date_of_birth'] is not None:
            data['date_of_birth'] = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()

        if 'salary' in data and data['salary'] is not None:
            data['salary'] = float(data['salary'])

        # Обновление данных
        for key, value in data.items():
            setattr(employee, key, value)

        db.session.commit()
        return jsonify(employee_schema.dump(employee)), 200

    except Exception as e:
        print("Error:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# DELETE /employees/<int:employee_id>
@app.route('/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    try:
        employee = Employee.query.get_or_404(employee_id)
        db.session.delete(employee)
        db.session.commit()
        return jsonify({"message": "Employee deleted"}), 200

    except Exception as e:
        print("Error:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Vacations
@app.route('/vacations', methods=['POST'])
def create_vacation():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ('fk_employee', 'start_date', 'end_date')):
            return jsonify({"error": "Missing required fields"}), 400

        # Проверка сотрудника
        employee = Employee.query.get(data['fk_employee'])
        if not employee:
            return jsonify({"error": f"Employee {data['fk_employee']} not found"}), 400

        # Преобразование дат
        data['start_date'] = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        data['end_date'] = datetime.strptime(data['end_date'], '%Y-%m-%d').date()

        new_vacation = Vacation(**data)
        db.session.add(new_vacation)
        db.session.commit()
        return jsonify(vacation_schema.dump(new_vacation)), 201

    except Exception as e:
        print("Error:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/vacations', methods=['GET'])
def get_vacations():
    vacations = Vacation.query.all()
    return jsonify(vacations_schema.dump(vacations))

@app.route('/vacations/<int:vacation_id>', methods=['GET'])
def get_vacation(vacation_id):
    vacation = Vacation.query.get_or_404(vacation_id)
    return jsonify(vacation_schema.dump(vacation))

@app.route('/vacations/<int:vacation_id>', methods=['PUT'])
def update_vacation(vacation_id):
    try:
        vacation = Vacation.query.get_or_404(vacation_id)
        data = request.get_json()

        if 'status' not in data or data['status'] not in ['Approved', 'Rejected']:
            return jsonify({"error": "Invalid status"}), 400

        vacation.status = data['status']
        db.session.commit()
        return jsonify(vacation_schema.dump(vacation)), 200

    except Exception as e:
        print("Error:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Departments
@app.route('/departments', methods=['GET'])
def get_departments():
    departments = Department.query.all()
    return jsonify(departments_schema.dump(departments))

if __name__ == '__main__':
    app.run(debug=True)