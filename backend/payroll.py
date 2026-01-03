from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import get_db_connection
from datetime import datetime

payroll_bp = Blueprint('payroll', __name__)

def get_user_role(user_id):
    """Helper function to get user role"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT role FROM users WHERE id = ?', (user_id,))
    result = cursor.fetchone()
    conn.close()
    return result['role'] if result else None

@payroll_bp.route('/my-salary', methods=['GET'])
@jwt_required()
def get_my_salary():
    """Get salary details for logged-in employee"""
    try:
        current_user_id = get_jwt_identity()
        month = request.args.get('month', datetime.now().strftime('%Y-%m'))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT base_salary, allowances, deductions, net_salary, month, updated_at
            FROM payroll
            WHERE user_id = ? AND month = ?
        ''', (current_user_id, month))
        
        salary = cursor.fetchone()
        
        # Get all months for history
        cursor.execute('''
            SELECT month FROM payroll
            WHERE user_id = ?
            ORDER BY month DESC
        ''', (current_user_id,))
        
        months = [row['month'] for row in cursor.fetchall()]
        conn.close()
        
        if not salary:
            return jsonify({
                "success": True,
                "salary": None,
                "message": "No salary record found for this month",
                "available_months": months
            }), 200
        
        return jsonify({
            "success": True,
            "salary": {
                "base_salary": salary['base_salary'],
                "allowances": salary['allowances'],
                "deductions": salary['deductions'],
                "net_salary": salary['net_salary'],
                "month": salary['month'],
                "updated_at": salary['updated_at']
            },
            "available_months": months
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@payroll_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_payroll():
    """Get payroll for all employees (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        role = get_user_role(current_user_id)
        
        if role != 'admin':
            return jsonify({"success": False, "message": "Unauthorized access"}), 403
        
        month = request.args.get('month', datetime.now().strftime('%Y-%m'))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                p.id, p.base_salary, p.allowances, p.deductions, p.net_salary, 
                p.month, p.updated_at,
                u.employee_id, e.first_name, e.last_name, e.department, e.job_title
            FROM payroll p
            JOIN users u ON p.user_id = u.id
            JOIN employees e ON u.id = e.user_id
            WHERE p.month = ?
            ORDER BY e.first_name
        ''', (month,))
        
        records = cursor.fetchall()
        conn.close()
        
        payroll_list = []
        for record in records:
            payroll_list.append({
                "id": record['id'],
                "employee_id": record['employee_id'],
                "name": f"{record['first_name']} {record['last_name']}",
                "department": record['department'],
                "job_title": record['job_title'],
                "base_salary": record['base_salary'],
                "allowances": record['allowances'],
                "deductions": record['deductions'],
                "net_salary": record['net_salary'],
                "month": record['month'],
                "updated_at": record['updated_at']
            })
        
        return jsonify({
            "success": True,
            "payroll": payroll_list,
            "month": month
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@payroll_bp.route('/employee/<int:user_id>', methods=['GET'])
@jwt_required()
def get_employee_payroll(user_id):
    """Get payroll for specific employee (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        role = get_user_role(current_user_id)
        
        if role != 'admin':
            return jsonify({"success": False, "message": "Unauthorized access"}), 403
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                p.base_salary, p.allowances, p.deductions, p.net_salary, 
                p.month, p.updated_at,
                e.first_name, e.last_name
            FROM payroll p
            JOIN employees e ON p.user_id = e.user_id
            WHERE p.user_id = ?
            ORDER BY p.month DESC
        ''', (user_id,))
        
        records = cursor.fetchall()
        conn.close()
        
        if not records:
            return jsonify({
                "success": True,
                "payroll": [],
                "message": "No payroll records found"
            }), 200
        
        payroll_list = []
        employee_name = None
        for record in records:
            if not employee_name:
                employee_name = f"{record['first_name']} {record['last_name']}"
            
            payroll_list.append({
                "base_salary": record['base_salary'],
                "allowances": record['allowances'],
                "deductions": record['deductions'],
                "net_salary": record['net_salary'],
                "month": record['month'],
                "updated_at": record['updated_at']
            })
        
        return jsonify({
            "success": True,
            "employee_name": employee_name,
            "payroll": payroll_list
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@payroll_bp.route('/update/<int:user_id>', methods=['POST', 'PUT'])
@jwt_required()
def update_payroll(user_id):
    """Create or update payroll for employee (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        role = get_user_role(current_user_id)
        
        if role != 'admin':
            return jsonify({"success": False, "message": "Unauthorized access"}), 403
        
        data = request.json
        
        # Validate required fields
        if 'base_salary' not in data:
            return jsonify({"success": False, "message": "base_salary is required"}), 400
        
        base_salary = float(data['base_salary'])
        allowances = float(data.get('allowances', 0))
        deductions = float(data.get('deductions', 0))
        net_salary = base_salary + allowances - deductions
        month = data.get('month', datetime.now().strftime('%Y-%m'))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE id = ?', (user_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "message": "Employee not found"}), 404
        
        # Check if payroll exists for this month
        cursor.execute('SELECT id FROM payroll WHERE user_id = ? AND month = ?', (user_id, month))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing payroll
            cursor.execute('''
                UPDATE payroll
                SET base_salary = ?, allowances = ?, deductions = ?, 
                    net_salary = ?, updated_at = ?
                WHERE user_id = ? AND month = ?
            ''', (base_salary, allowances, deductions, net_salary, datetime.now(), user_id, month))
            message = "Payroll updated successfully"
        else:
            # Insert new payroll
            cursor.execute('''
                INSERT INTO payroll (user_id, base_salary, allowances, deductions, net_salary, month, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, base_salary, allowances, deductions, net_salary, month, datetime.now()))
            message = "Payroll created successfully"
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": message,
            "payroll": {
                "base_salary": base_salary,
                "allowances": allowances,
                "deductions": deductions,
                "net_salary": net_salary,
                "month": month
            }
        }), 200
    
    except ValueError:
        return jsonify({"success": False, "message": "Invalid salary values"}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@payroll_bp.route('/delete/<int:user_id>/<string:month>', methods=['DELETE'])
@jwt_required()
def delete_payroll(user_id, month):
    """Delete payroll record (Admin only)"""
    try:
        current_user_id = get_jwt_identity()
        role = get_user_role(current_user_id)
        
        if role != 'admin':
            return jsonify({"success": False, "message": "Unauthorized access"}), 403
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM payroll WHERE user_id = ? AND month = ?', (user_id, month))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"success": False, "message": "Payroll record not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Payroll record deleted"
        }), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
