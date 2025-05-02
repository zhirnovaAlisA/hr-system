from flask import Flask, jsonify, request
from flask_cors import CORS
import traceback
from datetime import datetime

from models import db, Employee, Department, Vacation, Contract, WorkHour
from schemas import (
    employee_schema, employees_schema, 
    department_schema, departments_schema,
    vacation_schema, vacations_schema,
    contract_schema, contracts_schema
)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:123456@localhost/hr_system'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Инициализация БД с приложением
db.init_app(app)

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

# Эндпоинты аналитики
@app.route('/analytics/department-count', methods=['GET'])
def get_department_count():
    departments = db.session.query(
        Department.name,
        db.func.count(Employee.employee_id).label('count')
    ).join(
        Employee, Department.department_id == Employee.fk_department, isouter=True
    ).group_by(Department.department_id).all()

    return jsonify([{
        'department': dept.name,
        'count': dept.count
    } for dept in departments])

@app.route('/analytics/average-age', methods=['GET'])
def get_average_age():
    employees = Employee.query.filter(Employee.date_of_birth != None).all()
    current_year = datetime.now().year
    total_age = 0
    for emp in employees:
        age = current_year - emp.date_of_birth.year
        total_age += age
    average_age = total_age / len(employees) if employees else 0
    return jsonify({"average_age": round(average_age, 1)})

@app.route('/analytics/churn-rate', methods=['GET'])
def get_churn_rate():
    total = Employee.query.count()
    churned = Employee.query.filter_by(active='No').count()
    churn = (churned / total) * 100 if total else 0
    return jsonify({"churn_rate": round(churn, 1)})

@app.route('/analytics/average-tenure', methods=['GET'])
def get_average_tenure():
    employees = Employee.query.filter(Employee.employment_date != None).all()
    current_year = datetime.now().year
    total_tenure = 0
    for emp in employees:
        tenure = current_year - emp.employment_date.year
        total_tenure += tenure
    average_tenure = total_tenure / len(employees) if employees else 0
    return jsonify({"average_tenure": round(average_tenure, 1)})

# среднее время работы
@app.route('/analytics/average-hours-per-department', methods=['GET'])
def get_avg_hours_per_department():
    avg_hours = db.session.query(
        Department.name,
        db.func.avg(WorkHour.hours_worked).label('average_hours')
    ).join(
        Employee, Department.department_id == Employee.fk_department
    ).join(
        WorkHour, Employee.employee_id == WorkHour.fk_employee
    ).group_by(Department.department_id).all()

    return jsonify([{
        'department': dept.name,
        'average_hours': round(dept.average_hours, 1) if dept.average_hours else 0
    } for dept in avg_hours])

# Эндпоинты для работы с контрактами
# Эндпоинт для получения всех контрактов
@app.route('/contracts', methods=['GET'])
def get_contracts():
    contracts = Contract.query.all()
    return jsonify(contracts_schema.dump(contracts)), 200

# Эндпоинт для получения конкретного контракта по ID
@app.route('/contracts/<int:contract_id>', methods=['GET'])
def get_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    return jsonify(contract_schema.dump(contract)), 200

# Эндпоинт для создания нового контракта
@app.route('/contracts', methods=['POST'])
def add_contract():
    data = request.get_json()
    new_contract = Contract(
        fk_employee=data['fk_employee'],
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
        renewal_notification_date=datetime.strptime(data.get('renewal_notification_date', ''), '%Y-%m-%d').date() if data.get('renewal_notification_date') else None
    )
    db.session.add(new_contract)
    db.session.commit()
    return jsonify(contract_schema.dump(new_contract)), 201

# Эндпоинт для обновления существующего контракта
@app.route('/contracts/<int:contract_id>', methods=['PUT'])
def update_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    data = request.get_json()

    contract.fk_employee = data.get('fk_employee', contract.fk_employee)
    contract.start_date = datetime.strptime(data.get('start_date', str(contract.start_date)), '%Y-%m-%d').date()
    contract.end_date = datetime.strptime(data.get('end_date', str(contract.end_date)), '%Y-%m-%d').date()
    contract.renewal_notification_date = datetime.strptime(data.get('renewal_notification_date', ''), '%Y-%m-%d').date() if data.get('renewal_notification_date') else None

    db.session.commit()
    return jsonify(contract_schema.dump(contract)), 200

# Эндпоинт для удаления контракта
@app.route('/contracts/<int:contract_id>', methods=['DELETE'])
def delete_contract(contract_id):
    contract = Contract.query.get_or_404(contract_id)
    db.session.delete(contract)
    db.session.commit()
    return jsonify({"message": "Контракт успешно удален"}), 200

    
if __name__ == '__main__':
    app.run(debug=True)
