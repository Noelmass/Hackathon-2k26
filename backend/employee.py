from flask import Blueprint, jsonify
from models import User

employee_bp = Blueprint('employee', __name__)

@employee_bp.route('/employees', methods=['GET'])
def get_employees():
    users = User.query.all()
    return jsonify([
        {'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role}
        for u in users
    ])
