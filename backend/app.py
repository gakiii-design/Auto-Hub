from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Database connection setup
# Update these values with your MySQL credentials
DB_CONFIG = {
    'host': 'localhost',
    'port': 3305,
    'user': 'root',
    'password': 'Kinyanjui@7873',  # Set your MySQL root password
    'database': 'autohub'
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

@app.route('/register', methods=['POST'])
def register():
    """
    Registers a new user with name, email and password.
    """
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'error': 'Name, email and password required'}), 400
    hashed_pw = generate_password_hash(password)
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed_pw))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except mysql.connector.IntegrityError as err:
        if err.errno == 1062:
            return jsonify({'error': 'User already exists with this email.'}), 409
        return jsonify({'error': str(err)}), 500
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/login', methods=['POST'])
def login():
    """
    Logs in a user. Expects JSON with 'email' and 'password'.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        if user and check_password_hash(user['password'], password):
            return jsonify({'message': 'Login successful', 'user_id': user['id']}), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/profile', methods=['POST'])
def setup_profile():
    """
    Sets up or updates a user's vehicle profile. Expects JSON with user_id and vehicle details.
    Also returns user name and vehicle model for dashboard greeting.
    """
    data = request.get_json()
    user_id = data.get('user_id')
    vehicle = data.get('vehicle')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        # If vehicle data is provided, update/insert
        if vehicle:
            cursor.execute('''
                INSERT INTO vehicles (user_id, mileage, manufacture_year, last_service_date, terrain_type, current_performance, likely_locations)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    mileage=VALUES(mileage),
                    manufacture_year=VALUES(manufacture_year),
                    last_service_date=VALUES(last_service_date),
                    terrain_type=VALUES(terrain_type),
                    current_performance=VALUES(current_performance),
                    likely_locations=VALUES(likely_locations)
            ''', (
                user_id,
                vehicle.get('mileage'),
                vehicle.get('manufacture_year'),
                vehicle.get('last_service_date'),
                vehicle.get('terrain_type'),
                vehicle.get('current_performance'),
                vehicle.get('likely_locations')
            ))
            conn.commit()
        # Always fetch user and vehicle info for dashboard
        cursor.execute('SELECT email FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        cursor.execute('SELECT * FROM vehicles WHERE user_id = %s', (user_id,))
        vehicle_row = cursor.fetchone()
        cursor.close()
        conn.close()
        # Simulate user name and vehicle model if not present
        user_name = user['email'].split('@')[0].capitalize() if user and 'email' in user else 'User'
        vehicle_model = f"{vehicle_row['manufacture_year']} Model" if vehicle_row and vehicle_row.get('manufacture_year') else 'Your Car'
        return jsonify({
            'user': {'name': user_name},
            'vehicle': vehicle_row or {},
            'vehicle_model': vehicle_model
        })
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/maintenance', methods=['POST'])
def maintenance_schedule():
    """
    Calculates the next maintenance date and gives a recommendation based on mileage and last service date.
    Expects JSON with 'user_id'.
    """
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT mileage, last_service_date FROM vehicles WHERE user_id = %s", (user_id,))
        vehicle = cursor.fetchone()
        cursor.close()
        conn.close()
        if not vehicle:
            return jsonify({'error': 'Vehicle profile not found'}), 404
        mileage = vehicle['mileage'] or 0
        last_service_date = vehicle['last_service_date']
        # Assume maintenance every 10,000 km or 6 months, whichever comes first
        next_mileage = ((mileage // 10000) + 1) * 10000
        if last_service_date:
            last_service = datetime.strptime(str(last_service_date), '%Y-%m-%d')
            next_service_date = last_service + timedelta(days=180)
            next_service_date_str = next_service_date.strftime('%Y-%m-%d')
        else:
            next_service_date_str = 'Unknown'
        recommendation = f"Next maintenance at {next_mileage} km or by {next_service_date_str}."
        return jsonify({
            'current_mileage': mileage,
            'next_mileage': next_mileage,
            'next_service_date': next_service_date_str,
            'recommendation': recommendation
        })
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500

@app.route('/notifications', methods=['POST'])
def get_notifications():
    """
    Returns a list of notifications for the user. Simulated for now.
    Expects JSON with 'user_id'.
    """
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
    # Simulate notifications
    notifications = [
        {'message': 'Time for your next maintenance!', 'type': 'maintenance', 'date': '2024-07-01'},
        {'message': 'Upgrade available: New air filter recommended.', 'type': 'upgrade', 'date': '2024-06-15'},
    ]
    if int(user_id) == 1:
        notifications.append({'message': 'Admin: 2 new service requests.', 'type': 'admin', 'date': '2024-07-10'})
    return jsonify({'notifications': notifications})

if __name__ == '__main__':
    app.run(debug=True) 