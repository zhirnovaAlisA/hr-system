from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
)
from datetime import timedelta
from functools import wraps
from models import Employee, db
import traceback

# Создаем блупринт для авторизации
auth_bp = Blueprint('auth', __name__)

# Инициализация JWT (будет выполнена в app.py)
jwt = JWTManager()

@auth_bp.route('/login', methods=['POST'])
def login():
    """Эндпоинт для входа пользователя"""
    try:
        print("===== Попытка входа =====")
        data = request.get_json()
        print(f"Полученные данные: {data}")
        
        if not data:
            print("Ошибка: Отсутствуют данные для входа")
            return jsonify({"error": "Отсутствуют данные для входа"}), 400
            
        email = data.get('email', '')
        password = data.get('password', '')
        print(f"Email: {email}")
        
        # Проверка наличия обязательных полей
        if not email or not password:
            print("Ошибка: Email и пароль обязательны")
            return jsonify({"error": "Email и пароль обязательны"}), 400
        
        # Поиск сотрудника по email
        employee = Employee.query.filter_by(email=email).first()
        print(f"Сотрудник найден: {employee is not None}")
        
        if not employee:
            print(f"Ошибка: Сотрудник с email {email} не найден")
            return jsonify({"error": "Неверный email или пароль"}), 401
            
        # Проверка пароля
        password_valid = employee.check_password(password)
        print(f"Пароль верный: {password_valid}")
        
        # Если сотрудник не найден или пароль неверный
        if not password_valid:
            print("Ошибка: Неверный пароль")
            return jsonify({"error": "Неверный email или пароль"}), 401
            
        # Если сотрудник неактивен
        if employee.active == 'No':
            print("Ошибка: Учетная запись деактивирована")
            return jsonify({"error": "Учетная запись деактивирована"}), 403
            
        # Используем строку в качестве идентификатора (ID пользователя)
        identity = str(employee.employee_id)
        print(f"ID для токена: {identity}")
        
        # Дополнительные данные для фронтенда
        additional_claims = {
            'email': employee.email,
            'role': employee.role,
            'name': f"{employee.first_name} {employee.last_name}"
        }
        
        access_token = create_access_token(
            identity=identity,
            additional_claims=additional_claims,
            expires_delta=timedelta(days=1)
        )
        print(f"Токен создан: {access_token[:20]}...")
        
        response_data = {
            'access_token': access_token,
            'employee_id': employee.employee_id,
            'role': employee.role,
            'name': f"{employee.first_name} {employee.last_name}"
        }
        print(f"Отправляемый ответ: {response_data}")
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Ошибка входа: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/set-password/<int:employee_id>', methods=['POST'])
@jwt_required()
def set_password(employee_id):
    """Эндпоинт для установки/сброса пароля (только для HR)"""
    try:
        print(f"===== Запрос на установку пароля для сотрудника {employee_id} =====")
        
        # Получаем дополнительные данные из токена
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Проверяем, имеет ли пользователь права HR
        if user_role != 'hr':
            print(f"Ошибка: Пользователь с ролью {user_role} пытается установить пароль")
            return jsonify({"error": "Только HR могут устанавливать пароли"}), 403
            
        # Находим сотрудника
        employee = Employee.query.get_or_404(employee_id)
        print(f"Найден сотрудник: {employee.first_name} {employee.last_name}")
        
        data = request.get_json()
        print(f"Полученные данные: {data}")
        
        # Проверяем наличие пароля в запросе
        if not data or 'password' not in data or not data['password']:
            print("Ошибка: Пароль не указан")
            return jsonify({"error": "Пароль обязателен"}), 400
            
        # Устанавливаем новый пароль
        employee.set_password(data['password'])
        print(f"Пароль успешно установлен для сотрудника {employee_id}")
        
        db.session.commit()
        
        return jsonify({"message": "Пароль успешно установлен"}), 200
        
    except Exception as e:
        print(f"Ошибка установки пароля: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Возвращает профиль текущего пользователя"""
    try:
        print("===== Запрос на получение профиля =====")
        
        # Проверяем заголовки запроса
        headers = dict(request.headers)
        auth_header = headers.get('Authorization', 'Заголовок отсутствует')
        print(f"Заголовок Authorization: {auth_header}")
        
        # Получаем ID пользователя из токена (строка)
        employee_id = get_jwt_identity()
        print(f"ID сотрудника из токена: {employee_id}")
        
        # Получаем дополнительные данные из токена
        claims = get_jwt()
        print(f"Дополнительные данные из токена: {claims}")
        
        # Преобразуем ID в число
        try:
            employee_id = int(employee_id)
        except (ValueError, TypeError):
            print(f"Ошибка: Недопустимый ID сотрудника: {employee_id}")
            return jsonify({"error": "Недопустимый токен"}), 401
        
        # Ищем сотрудника в базе данных
        employee = Employee.query.get_or_404(employee_id)
        print(f"Найден сотрудник: {employee.first_name} {employee.last_name}")
        
        # Формируем ответ
        profile_data = {
            'id': employee.employee_id,
            'first_name': employee.first_name,
            'last_name': employee.last_name,
            'email': employee.email,
            'job_name': employee.job_name,
            'department_id': employee.fk_department,
            'role': employee.role
        }
        print(f"Отправляемые данные профиля: {profile_data}")
        
        return jsonify(profile_data), 200
        
    except Exception as e:
        print(f"Ошибка получения профиля: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Декоратор для проверки ролей
def role_required(role):
    """
    Декоратор для проверки роли пользователя.
    Используйте 'hr' для доступа только HR, 'employee' для доступа только сотрудников,
    и 'any' для доступа обоих типов пользователей с проверкой ID сотрудника
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                print(f"===== Проверка роли: {role} для эндпоинта {request.path} =====")
                
                # Проверяем заголовки запроса
                headers = dict(request.headers)
                auth_header = headers.get('Authorization', 'Заголовок отсутствует')
                print(f"Заголовок Authorization: {auth_header}")
                
                verify_jwt_in_request()
                print("JWT успешно верифицирован")
                
                # Получаем ID пользователя из токена
                employee_id = get_jwt_identity()
                print(f"ID сотрудника из токена: {employee_id}")
                
                # Получаем дополнительные данные из токена
                claims = get_jwt()
                print(f"Дополнительные данные из токена: {claims}")
                
                # Получаем роль из дополнительных данных
                user_role = claims.get('role')
                if not user_role:
                    print("Ошибка: В токене отсутствует роль")
                    return jsonify({"error": "Недопустимый токен"}), 401
                
                # Проверка роли
                if role != 'any' and user_role != role:
                    print(f"Ошибка: Доступ запрещен: требуется роль {role}, но пользователь имеет роль {user_role}")
                    return jsonify({"error": "Доступ запрещен"}), 403
                    
                # Для роли 'any' и при наличии employee_id в маршруте
                # проверяем, что сотрудник имеет доступ только к своим данным
                if role == 'any' and 'employee_id' in kwargs:
                    if user_role != 'hr' and int(employee_id) != int(kwargs['employee_id']):
                        print(f"Ошибка: Доступ к данным другого сотрудника запрещен: {employee_id} != {kwargs['employee_id']}")
                        return jsonify({"error": "Доступ к данным другого сотрудника запрещен"}), 403
                
                print("Проверка роли успешна, вызов защищенной функции")
                return fn(*args, **kwargs)
                
            except Exception as e:
                print(f"Ошибка в декораторе role_required: {str(e)}")
                traceback.print_exc()
                return jsonify({"error": str(e)}), 422
        return decorator
    return wrapper