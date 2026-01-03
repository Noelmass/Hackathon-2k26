from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db_connection

employee_bp = Blueprint('employee', __name__)

def get_user_role(user_id):
    """Helper function to get user role"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
    result = cursor.fetchone()
    conn.close()
    return result['role'] if result else None

@employee_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_my_profile():
    """Get profile of logged-in employee"""
    try:
        current_user_id = get_jwt_identity()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                u.employee_id, u.email, u.role,
                e.first_name, e.last_name, e.phone, e.address,
                e.job_title, e.department, e.date_of_joining, e.profile_picture
            FROM users u
            JOIN employees e ON u.id = e.user_id
            WHERE u.id = ?
        ''', (current_user_id,))
        
        profile = cursor.fetchone()
        conn.close()
        
        if not profile:
            return jsonify({"success": False, "message": "Profile not found"}), 404
        
        return jsonify({
            "success": True,
            "profile": {
                "employee_id": profile['employee_id'],
                "email": profile['email'],
                "role": profile['role'],
                "first_name": profile['first_name'],
                "last_name": profile['last_name'],
                "phone": profile['phone'],
                "address": profile['address'],
                "job_title": profile['job_title'],
                "department": profile['department'],
                "date_of_joining": profile['date_of_joining'],
                "profile_picture": profile['profile_picture']
            }
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@employee_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_my_profile():
    """Update own profile (limited fields for employees)"""
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        # Fields that employees can update
        allowed_fields = ['phone', 'address', 'profile_picture']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        update_parts = []
        values = []
        
        for field in allowed_fields:
            if field in data:
                update_parts.append(f"{field} = ?")
                values.append(data[field])
        
        if not update_parts:
            return jsonify({"success": False, "message": "No valid fields to update"}), 400
        
        values.append(current_user_id)
        query = f"UPDATE employees SET {', '.join(update_parts)} WHERE user_id = ?"
        
        cursor.execute(query, values)
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Profile updated successfully"
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@employee_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_employees():
    """Get all employees (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        role = get_user_role(current_user_id)
        
        if role != 'admin':
            return jsonify({"success": False, "message": "Unauthorized access"}), 403
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                u.id, u.employee_id, u.email, u.role,
                e.first_name, e.last_name, e.phone, e.address,
                e.job_title, e.department, e.date_of_joining, e.profile_picture
            FROM users u
            JOIN employees e ON u.id = e.user_id
            ORDER BY e.first_name
        ''')
        
        employees = cursor.fetchall()
        conn.close()
        
        employee_list = []
        for emp in employees:
            employee_list.append({
                "user_id": emp['id'],
                "employee_id": emp['employee_id'],
                "email": emp['email'],
                "role": emp['role'],
                "first_name": emp['first_name'],
                "last_name": emp['last_name'],
                "phone": emp['phone'],
                "address": emp['address'],
                "job_title": emp['job_title'],
                "department": emp['department'],
                "date_of_joining": emp['date_of_joining'],
                "profile_picture": emp['profile_picture']
            })
        
        return jsonify({
            "success": True,
            "employees": employee_list,
            "count": len(employee_list)
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@employee_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_employee_by_id(user_id):
    """Get specific employee details (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        role = get_user_role(current_user_id)
        
        if role != 'admin' and current_user_id != user_id:
            return jsonify({"success": False, "message": "Unauthorized access"}), 403
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                u.id, u.employee_id, u.email, u.role,
                e.first_name, e.last_name, e.phone, e.address,
                e.job_title, e.department, e.date_of_joining, e.profile_picture
            FROM users u
            JOIN employees e ON u.id = e.user_id
            WHERE u.id = ?
        ''', (user_id,))
        
        employee = cursor.fetchone()
        conn.close()
        
        if not employee:
            return jsonify({"success": False, "message": "Employee not found"}), 404
        
        return jsonify({
            "success": True,
            "employee": {
                "user_id": employee['id'],
                "employee_id": employee['employee_id'],
                "email": employee['email'],
                "role": employee['role'],
                "first_name": employee['first_name'],
                "last_name": employee['last_name'],
                "phone": employee['phone'],
                "address": employee['address'],
                "job_title": employee['job_title'],
                "department": employee['department'],
                "date_of_joining": employee['date_of_joining'],
                "profile_picture": employee['profile_picture']
            }
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@employee_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_employee(user_id):
    """Update employee details (Admin only - can update all fields)"""
    try:
        current_user_id = get_jwt_identity()
        role = get_user_role(current_user_id)
        
        if role != 'admin':
            return jsonify({"success": False, "message": "Unauthorized access"}), 403
        
        data = request.json
        
        # Fields that admin can update
        allowed_fields = ['first_name', 'last_name', 'phone', 'address', 
                         'job_title', 'department', 'date_of_joining', 'profile_picture']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if employee exists
        cursor.execute('SELECT id FROM users WHERE id = ?', (user_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "message": "Employee not found"}), 404
        
        update_parts = []
        values = []
        
        for field in allowed_fields:
            if field in data:
                update_parts.append(f"{field} = ?")
                values.append(data[field])
        
        if not update_parts:
            return jsonify({"success": False, "message": "No valid fields to update"}), 400
        
        values.append(user_id)
        query = f"UPDATE employees SET {', '.join(update_parts)} WHERE user_id = ?"
        
        cursor.execute(query, values)
        
        # Update role if provided
        if 'role' in data and data['role'] in ['admin', 'employee']:
            cursor.execute('UPDATE users SET role = ? WHERE id = ?', (data['role'], user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Employee updated successfully"
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@employee_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_employee(user_id):
    """Delete employee (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        role = get_user_role(current_user_id)
        
        if role != 'admin':
            return jsonify({"success": False, "message": "Unauthorized access"}), 403
        
        if current_user_id == user_id:
            return jsonify({"success": False, "message": "Cannot delete your own account"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"success": False, "message": "Employee not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Employee deleted successfully"
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@employee_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_employee_stats():
    """Get employee statistics (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        role = get_user_role(current_user_id)
        
        if role != 'admin':
            return jsonify({"success": False, "message": "Unauthorized access"}), 403
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Total employees
        cursor.execute('SELECT COUNT(*) as count FROM users')
        total = cursor.fetchone()['count']
        
        # By department
        cursor.execute('''
            SELECT department, COUNT(*) as count
            FROM employees
            WHERE department IS NOT NULL AND department != ''
            GROUP BY department
        ''')
        departments = [{"department": row['department'], "count": row['count']} 
                      for row in cursor.fetchall()]
        
        # Today's attendance
        from datetime import date
        cursor.execute('''
            SELECT COUNT(*) as count
            FROM attendance
            WHERE date = ? AND status = 'present'
        ''', (date.today().isoformat(),))
        present_today = cursor.fetchone()['count']
        
        conn.close()
        
        return jsonify({
            "success": True,
            "stats": {
                "total_employees": total,
                "present_today": present_today,
                "departments": departments
            }
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
