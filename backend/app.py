from flask import Flask
from flask_cors import CORS
from models import db
from auth import auth_bp
from employee import employee_bp
from attendance import attendance_bp
from leave import leave_bp
from payroll import payroll_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret123'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../database/hrms.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(employee_bp, url_prefix='/api')
app.register_blueprint(attendance_bp, url_prefix='/api')
app.register_blueprint(leave_bp, url_prefix='/api')
app.register_blueprint(payroll_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)


