from flask import Blueprint, request, jsonify
from models import db, User
from utils import hash_password, verify_password, generate_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    user = User(
        name=data['name'],
        email=data['email'],
        password=hash_password(data['password']),
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered'})

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and verify_password(data['password'], user.password):
        return jsonify({
            'token': generate_token(user),
            'role': user.role,
            'user_id': user.id
        })
    return jsonify({'message': 'Invalid credentials'}), 401
