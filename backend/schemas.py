from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import fields
from models import Employee, Department, Vacation, Contract, db

# Схема Employee
class EmployeeSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Employee
        load_instance = True
        sqla_session = db.session
        include_fk = True  # Включаем fk_department

employee_schema = EmployeeSchema()
employees_schema = EmployeeSchema(many=True)

# Схема для Contract
class ContractSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Contract
        load_instance = True
        include_fk = True
        include_relationships = True

    # Вычисляемое поле для имени сотрудника
    employee_name = fields.Method("get_employee_name")

    def get_employee_name(self, obj):
        if obj.employee:  
            return f"{obj.employee.first_name} {obj.employee.last_name}"
        return "Сотрудник удален"
    
contracts_schema = ContractSchema(many=True)  
contract_schema = ContractSchema() 

# Схема Vacation
class VacationSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Vacation
        load_instance = True
        sqla_session = db.session
        include_fk = True

    employee = fields.Nested(  
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