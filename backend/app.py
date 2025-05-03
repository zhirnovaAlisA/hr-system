from flask import Flask, jsonify, request
from flask_cors import CORS
import traceback
from datetime import datetime
from flask_jwt_extended import JWTManager, get_jwt_identity

from models import db, Employee, Department, Vacation, Contract, WorkHour
from schemas import (
    employee_schema, employees_schema, 
    department_schema, departments_schema,
    vacation_schema, vacations_schema,
    contract_schema, contracts_schema
)
from auth import auth_bp, jwt, role_required

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:123456@localhost/hr_system'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Настройки JWT
app.config['JWT_SECRET_KEY'] = 'super-sekretny-klyuch-izmenit-v-prodakshene' 
app.config['JWT_HEADER_TYPE'] = 'Bearer'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'

# Инициализация БД и JWT
db.init_app(app)
jwt.init_app(app)

# Регистрация блупринта аутентификации
app.register_blueprint(auth_bp, url_prefix='/auth')

# Отладочный endpoint для проверки работы сервера
@app.route('/api-status', methods=['GET'])
def api_status():
    return jsonify({"status": "API работает", "время": str(datetime.now())}), 200

# Employees
@app.route('/employees', methods=['GET'])
@role_required('hr')  # Только HR может видеть всех сотрудников
def get_employees():
    try:
        employees = Employee.query.all()
        return jsonify(employees_schema.dump(employees))
    except Exception as e:
        print(f"Ошибка при получении списка сотрудников: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/employees/<int:employee_id>', methods=['GET'])
@role_required('any')  # И HR, и сам сотрудник могут просматривать профиль
def get_employee(employee_id):
    try:
        employee = Employee.query.get_or_404(employee_id)
        return jsonify(employee_schema.dump(employee))
    except Exception as e:
        print(f"Ошибка при получении сотрудника {employee_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/employees', methods=['POST'])
@role_required('hr')  # Только HR может добавлять сотрудников
def add_employee():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ('first_name', 'last_name', 'email', 'job_name')):
            return jsonify({"error": "Отсутствуют обязательные поля"}), 400

        # Преобразование данных
        if 'salary' in data and data['salary'] is not None:
            data['salary'] = float(data['salary'])

        if 'date_of_birth' in data and data['date_of_birth'] is not None:
            data['date_of_birth'] = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()

        # Проверка уникальности email
        if Employee.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Сотрудник с таким email уже существует"}), 400

        # Обработка роли
        if 'role' in data:
            role = data['role']
            if role not in ['hr', 'employee']:
                return jsonify({"error": "Недопустимая роль"}), 400
        else:
            data['role'] = 'employee'

        # Обработка пароля
        temp_password = data.pop('password', None)
        
        new_employee = Employee(**data)
        
        # Установка пароля, если он предоставлен
        if temp_password:
            new_employee.set_password(temp_password)
        else:
            # По умолчанию используем email как временный пароль
            new_employee.set_password(new_employee.email)
            
        db.session.add(new_employee)
        db.session.commit()

        return jsonify(employee_schema.dump(new_employee)), 201

    except Exception as e:
        print("Ошибка:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/employees/<int:employee_id>', methods=['PUT'])
@role_required('hr')  # Только HR может обновлять данные сотрудников
def update_employee(employee_id):
    try:
        employee = Employee.query.get_or_404(employee_id)
        data = request.get_json()

        if not data:
            return jsonify({"error": "Нет данных для обновления"}), 400

        # Проверка уникальности email
        if 'email' in data and data['email'] != employee.email:
            if Employee.query.filter_by(email=data['email']).first():
                return jsonify({"error": "Сотрудник с таким email уже существует"}), 400

        # Преобразование данных
        if 'date_of_birth' in data and data['date_of_birth'] is not None:
            data['date_of_birth'] = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()

        if 'salary' in data and data['salary'] is not None:
            data['salary'] = float(data['salary'])
            
        # Пароль обрабатывается отдельно
        if 'password' in data:
            temp_password = data.pop('password')
            if temp_password:
                employee.set_password(temp_password)

        # Обновление данных
        for key, value in data.items():
            if key != 'password_hash':  # Защита от прямого изменения хеша пароля
                setattr(employee, key, value)

        db.session.commit()
        return jsonify(employee_schema.dump(employee)), 200

    except Exception as e:
        print("Ошибка:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/employees/<int:employee_id>', methods=['DELETE'])
@role_required('hr')  # Только HR может удалять сотрудников
def delete_employee(employee_id):
    try:
        employee = Employee.query.get_or_404(employee_id)
        db.session.delete(employee)
        db.session.commit()
        return jsonify({"message": "Сотрудник удален"}), 200

    except Exception as e:
        print("Ошибка:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Vacations
@app.route('/vacations', methods=['POST'])
@role_required('any')  # И HR, и сотрудники могут создавать заявки на отпуск
def create_vacation():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ('fk_employee', 'start_date', 'end_date')):
            return jsonify({"error": "Отсутствуют обязательные поля"}), 400

        # Проверка доступа: сотрудник может создать отпуск только для себя
        current_user = get_jwt_identity()
        if current_user['role'] != 'hr' and int(current_user['id']) != int(data['fk_employee']):
            return jsonify({"error": "Вы можете создавать заявки только для себя"}), 403

        # Проверка сотрудника
        employee = Employee.query.get(data['fk_employee'])
        if not employee:
            return jsonify({"error": f"Сотрудник {data['fk_employee']} не найден"}), 400

        # Преобразование дат
        data['start_date'] = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        data['end_date'] = datetime.strptime(data['end_date'], '%Y-%m-%d').date()

        new_vacation = Vacation(**data)
        db.session.add(new_vacation)
        db.session.commit()
        return jsonify(vacation_schema.dump(new_vacation)), 201

    except Exception as e:
        print("Ошибка:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/vacations', methods=['GET'])
@role_required('hr')  # Только HR может видеть все отпуска
def get_vacations():
    try:
        vacations = Vacation.query.all()
        return jsonify(vacations_schema.dump(vacations))
    except Exception as e:
        print(f"Ошибка при получении списка отпусков: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/employee-vacations/<int:employee_id>', methods=['GET'])
@role_required('any')  # И HR, и сам сотрудник могут видеть отпуска сотрудника
def get_employee_vacations(employee_id):
    try:
        vacations = Vacation.query.filter_by(fk_employee=employee_id).all()
        return jsonify(vacations_schema.dump(vacations))
    except Exception as e:
        print(f"Ошибка при получении отпусков сотрудника {employee_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/vacations/<int:vacation_id>', methods=['GET'])
@role_required('any')  # И HR, и сам сотрудник могут просматривать отпуск
def get_vacation(vacation_id):
    try:
        vacation = Vacation.query.get_or_404(vacation_id)
        
        # Проверка доступа
        current_user = get_jwt_identity()
        if current_user['role'] != 'hr' and int(current_user['id']) != vacation.fk_employee:
            return jsonify({"error": "Доступ запрещен"}), 403
            
        return jsonify(vacation_schema.dump(vacation))
    except Exception as e:
        print(f"Ошибка при получении отпуска {vacation_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/vacations/<int:vacation_id>', methods=['PUT'])
@role_required('hr')  # Только HR может обновлять статус отпуска
def update_vacation(vacation_id):
    try:
        vacation = Vacation.query.get_or_404(vacation_id)
        data = request.get_json()

        if 'status' not in data or data['status'] not in ['Approved', 'Rejected', 'Pending']:
            return jsonify({"error": "Недопустимый статус"}), 400

        vacation.status = data['status']
        db.session.commit()
        return jsonify(vacation_schema.dump(vacation)), 200

    except Exception as e:
        print("Ошибка:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# Departments
@app.route('/departments', methods=['GET'])
@role_required('hr')  # Только HR нужен полный список отделов
def get_departments():
    try:
        departments = Department.query.all()
        return jsonify(departments_schema.dump(departments))
    except Exception as e:
        print(f"Ошибка при получении списка отделов: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Аналитика - только для HR
@app.route('/analytics/department-count', methods=['GET'])
@role_required('hr')
def get_department_count():
    try:
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
    except Exception as e:
        print(f"Ошибка при получении статистики по отделам: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/analytics/average-age', methods=['GET'])
@role_required('hr')
def get_average_age():
    try:
        employees = Employee.query.filter(Employee.date_of_birth != None).all()
        current_year = datetime.now().year
        total_age = 0
        for emp in employees:
            age = current_year - emp.date_of_birth.year
            total_age += age
        average_age = total_age / len(employees) if employees else 0
        return jsonify({"average_age": round(average_age, 1)})
    except Exception as e:
        print(f"Ошибка при расчете среднего возраста: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/analytics/churn-rate', methods=['GET'])
@role_required('hr')
def get_churn_rate():
    try:
        total = Employee.query.count()
        churned = Employee.query.filter_by(active='No').count()
        churn = (churned / total) * 100 if total else 0
        return jsonify({"churn_rate": round(churn, 1)})
    except Exception as e:
        print(f"Ошибка при расчете текучести кадров: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/analytics/average-tenure', methods=['GET'])
@role_required('hr')
def get_average_tenure():
    try:
        employees = Employee.query.filter(Employee.date_of_birth != None).all()
        current_year = datetime.now().year
        total_tenure = 0
        for emp in employees:
            tenure = current_year - emp.date_of_birth.year
            total_tenure += tenure
        average_tenure = total_tenure / len(employees) if employees else 0
        return jsonify({"average_tenure": round(average_tenure, 1)})
    except Exception as e:
        print(f"Ошибка при расчете среднего стажа: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/analytics/average-hours-per-department', methods=['GET'])
@role_required('hr')
def get_avg_hours_per_department():
    try:
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
    except Exception as e:
        print(f"Ошибка при расчете средних часов по отделам: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Contracts - только для HR
@app.route('/contracts', methods=['GET'])
@role_required('hr')
def get_contracts():
    try:
        contracts = Contract.query.all()
        return jsonify(contracts_schema.dump(contracts)), 200
    except Exception as e:
        print(f"Ошибка при получении списка контрактов: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/contracts/<int:contract_id>', methods=['GET'])
@role_required('hr')
def get_contract(contract_id):
    try:
        contract = Contract.query.get_or_404(contract_id)
        return jsonify(contract_schema.dump(contract)), 200
    except Exception as e:
        print(f"Ошибка при получении контракта {contract_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/contracts', methods=['POST'])
@role_required('hr')
def add_contract():
    try:
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
    except Exception as e:
        print("Ошибка:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/contracts/<int:contract_id>', methods=['PUT'])
@role_required('hr')
def update_contract(contract_id):
    try:
        contract = Contract.query.get_or_404(contract_id)
        data = request.get_json()

        contract.fk_employee = data.get('fk_employee', contract.fk_employee)
        contract.start_date = datetime.strptime(data.get('start_date', str(contract.start_date)), '%Y-%m-%d').date()
        contract.end_date = datetime.strptime(data.get('end_date', str(contract.end_date)), '%Y-%m-%d').date()
        contract.renewal_notification_date = datetime.strptime(data.get('renewal_notification_date', ''), '%Y-%m-%d').date() if data.get('renewal_notification_date') else None

        db.session.commit()
        return jsonify(contract_schema.dump(contract)), 200
    except Exception as e:
        print("Ошибка:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/contracts/<int:contract_id>', methods=['DELETE'])
@role_required('hr')
def delete_contract(contract_id):
    try:
        contract = Contract.query.get_or_404(contract_id)
        db.session.delete(contract)
        db.session.commit()
        return jsonify({"message": "Контракт успешно удален"}), 200
    except Exception as e:
        print("Ошибка:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        # Проверяем соединение с базой данных при запуске
        try:
            db.engine.connect()
            print("Соединение с базой данных установлено успешно")
        except Exception as e:
            print(f"Ошибка соединения с базой данных: {str(e)}")
    app.run(debug=True)