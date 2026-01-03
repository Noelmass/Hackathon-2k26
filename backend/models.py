import sqlite3
import os
from datetime import datetime

def get_db_connection():
    """Create and return database connection"""
    db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'hrms.db')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with all required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'employee')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create employees table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            job_title TEXT,
            department TEXT,
            date_of_joining DATE,
            profile_picture TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    
    # Create attendance table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date DATE NOT NULL,
            check_in TIME,
            check_out TIME,
            status TEXT CHECK(status IN ('present', 'absent', 'half_day', 'leave')),
            remarks TEXT,
            UNIQUE(user_id, date),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    
    # Create leaves table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS leaves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            leave_type TEXT NOT NULL CHECK(leave_type IN ('paid', 'sick', 'unpaid')),
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            reason TEXT,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
            admin_comment TEXT,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reviewed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    
    # Create payroll table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payroll (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            base_salary REAL NOT NULL,
            allowances REAL DEFAULT 0,
            deductions REAL DEFAULT 0,
            net_salary REAL NOT NULL,
            month TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, month),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✓ Database initialized successfully!")

def seed_admin():
    """Create default admin user for testing"""
    import bcrypt
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if admin exists
        cursor.execute("SELECT id FROM users WHERE email = ?", ('admin@hrms.com',))
        if cursor.fetchone():
            print("Admin user already exists")
            return
        
        # Create admin user
        password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute('''
            INSERT INTO users (employee_id, email, password_hash, role)
            VALUES (?, ?, ?, ?)
        ''', ('EMP001', 'admin@hrms.com', password_hash, 'admin'))
        
        user_id = cursor.lastrowid
        
        # Create admin employee profile
        cursor.execute('''
            INSERT INTO employees (user_id, first_name, last_name, job_title, department, date_of_joining)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, 'System', 'Admin', 'Administrator', 'Management', datetime.now().date()))
        
        conn.commit()
        print("✓ Admin user created: admin@hrms.com / admin123")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()
    seed_admin()
