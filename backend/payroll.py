from flask import Blueprint, request, jsonify
from models import db, Payroll

payroll_bp = Blueprint('payroll', __name__)

@payroll_bp.route('/payroll', methods=['POST'])
def add_payroll():
    data = request.json
    payroll = Payroll(
        user_id=data['user_id'],
        month=data['month'],
        salary=data['salary']
    )
    db.session.add(payroll)
    db.session.commit()
    return jsonify({'message': 'Payroll added'})

@payroll_bp.route('/payroll/<int:user_id>', methods=['GET'])
def view_payroll(user_id):
    records = Payroll.query.filter_by(user_id=user_id).all()
    return jsonify([r.__dict__ for r in records])
