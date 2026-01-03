from flask import Blueprint, request, jsonify
from models import db, Attendance
from datetime import datetime

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/attendance/checkin', methods=['POST'])
def checkin():
    data = request.json
    now = datetime.now()
    status = 'Present' if now.hour < 9 else 'Late'
    att = Attendance(
        user_id=data['user_id'],
        date=now.strftime('%Y-%m-%d'),
        check_in=now.strftime('%H:%M'),
        status=status
    )
    db.session.add(att)
    db.session.commit()
    return jsonify({'message': 'Checked in', 'status': status})

@attendance_bp.route('/attendance/checkout', methods=['POST'])
def checkout():
    data = request.json
    att = Attendance.query.filter_by(user_id=data['user_id'], date=data['date']).first()
    att.check_out = datetime.now().strftime('%H:%M')
    db.session.commit()
    return jsonify({'message': 'Checked out'})
