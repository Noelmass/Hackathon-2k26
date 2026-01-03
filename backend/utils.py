import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app

def hash_password(password):
    return generate_password_hash(password)

def verify_password(password, hashed):
    return check_password_hash(hashed, password)

def generate_token(user):
    return jwt.encode(
        {'id': user.id, 'role': user.role},
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )
