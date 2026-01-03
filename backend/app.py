from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
import models

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Enable CORS for all routes
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize JWT
jwt = JWTManager(app)

# Initialize database
print("Initializing database...")
models.init_db()
models.seed_admin()

# Import blueprints
from auth import auth_bp
from employee import employee_bp
from attendance import attendance_bp
from leave import leave_bp
from payroll import payroll_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(employee_bp, url_prefix='/api/employee')
app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
app.register_blueprint(leave_bp, url_prefix='/api/leave')
app.register_blueprint(payroll_bp, url_prefix='/api/payroll')

# Root endpoint
@app.route('/')
def home():
    return jsonify({
        "message": "HRMS API is running",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "employee": "/api/employee",
            "attendance": "/api/attendance",
            "leave": "/api/leave",
            "payroll": "/api/payroll"
        }
    })

# Health check endpoint
@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "database": "connected"
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        "success": False,
        "message": "Token has expired"
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        "success": False,
        "message": "Invalid token"
    }), 401

@jwt.unauthorized_loader
def unauthorized_callback(error):
    return jsonify({
        "success": False,
        "message": "Missing authorization token"
    }), 401

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 HRMS Backend Server Starting...")
    print("="*50)
    print("📍 API URL: http://localhost:5000")
    print("📚 Default Admin: admin@hrms.com / admin123")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
