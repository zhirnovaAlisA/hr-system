from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from flask_cors import CORS
import traceback
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Конфигурация базы данных
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

    # Отношение с таблицей departments
    department = db.relationship('Department', backref='employees')

# Схема для сериализации Employee
class EmployeeSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Employee
        load_instance = True
        sqla_session = db.session
        include_fk = True  # Включает внешние ключи

employee_schema = EmployeeSchema()
employees_schema = EmployeeSchema(many=True)

# Эндпоинты

# Получение всех сотрудников
@app.route('/employees', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    return jsonify(employees_schema.dump(employees))  # Используйте dump вместо jsonify

@app.route('/employees/<int:employee_id>', methods=['GET'])
def get_employee(employee_id):
    employee = Employee.query.get_or_404(employee_id)
    return jsonify(employee_schema.dump(employee))  # Используйте dump вместо jsonify

@app.route('/employees', methods=['POST'])
def add_employee():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ('first_name', 'last_name', 'email', 'job_name')):
            return jsonify({"error": "Missing required fields"}), 400

        # Проверка типа данных
        if 'salary' in data and data['salary'] is not None:
            data['salary'] = float(data['salary'])  # Преобразуем salary в число

        if 'date_of_birth' in data and data['date_of_birth'] is not None:
            data['date_of_birth'] = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()  # Преобразуем дату

        new_employee = Employee(**data)
        db.session.add(new_employee)
        db.session.commit()

        return jsonify(employee_schema.dump(new_employee)), 201  # Используйте dump вместо jsonify

    except Exception as e:
        print("Error:", traceback.format_exc())  # Логируем ошибку
        return jsonify({"error": str(e)}), 500
    

@app.route('/employees/<int:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    try:
        employee = Employee.query.get_or_404(employee_id)
        data = request.get_json()

        # Проверка обязательных полей
        if not data or not all(key in data for key in ('first_name', 'last_name', 'email', 'job_name')):
            return jsonify({"error": "Missing required fields"}), 400

        # Преобразование данных
        if 'date_of_birth' in data and data['date_of_birth'] is not None:
            data['date_of_birth'] = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()

        if 'salary' in data and data['salary'] is not None:
            data['salary'] = float(data['salary'])  # Преобразуем salary в число

        # Обновление данных сотрудника
        for key, value in data.items():
            setattr(employee, key, value)

        db.session.commit()
        return jsonify(employee_schema.dump(employee)), 200  # Возвращаем обновленного сотрудника

    except Exception as e:
        print("Error:", traceback.format_exc())  # Логирование ошибки
        return jsonify({"error": str(e)}), 500
    
@app.route('/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    try:
        employee = Employee.query.get_or_404(employee_id)
        db.session.delete(employee)
        db.session.commit()

        return jsonify({"message": "Employee deleted"}), 200
    except Exception as e:
        print("Error:", traceback.format_exc())  # Логирование ошибки
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)