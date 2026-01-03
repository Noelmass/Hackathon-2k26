from flask import Blueprint, request, jsonify
from models import db, Leave

leave_bp = Blueprint('leave', __name__)

@leave_bp.route('/leaves', methods=['POST'])
def apply_leave():
    data = request.json
    leave = Leave(
        user_id=data['user_id'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        reason=data['reason'],
        status='Pending'
    )
    db.session.add(leave)
    db.session.commit()
    return jsonify({'message': 'Leave applied'})

@leave_bp.route('/leaves', methods=['GET'])
def get_leaves():
    leaves = Leave.query.all()
    return jsonify([leave.__dict__ for leave in leaves])
