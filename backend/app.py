from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})  # Allow React frontend to talk to backend

# Initialize DB if not exists
def init_db():
    conn = sqlite3.connect("auto_hub.db")
    c = conn.cursor()
    
    # Users table for authentication
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )
    """)
    
    # Bookings table - ensure correct schema
    c.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            user_email TEXT NOT NULL,
            service_type TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Insert test user if not exists
    c.execute("SELECT * FROM users WHERE email = ?", ("test@example.com",))
    if not c.fetchone():
        hashed_password = generate_password_hash("password123")
        c.execute("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", 
                 ("test@example.com", hashed_password, "user"))
    
    conn.commit()
    conn.close()

init_db()


# 📌 Create a new booking (POST)
@app.route("/bookings", methods=["POST"])
def book_service():
    data = request.get_json()

    service_type = data.get("service_type") or data.get("serviceType")
    date = data.get("date")
    time = data.get("time")
    user_email = data.get("user_email")
    user_id = data.get("user_id")

    if not all([service_type, date, time, user_email]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = sqlite3.connect("auto_hub.db")
    c = conn.cursor()
    
    # Insert booking with user email
    c.execute(
        "INSERT INTO bookings (user_id, user_email, service_type, date, time, status) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, user_email, service_type, date, time, "confirmed"),
    )
    
    booking_id = c.lastrowid
    conn.commit()
    
    # Get the created booking details
    booking_details = {
        "booking_id": booking_id,
        "user_email": user_email,
        "service_type": service_type,
        "date": date,
        "time": time,
        "status": "confirmed"
    }
    
    conn.close()

    return jsonify({
        "message": "Booking successful",
        "booking_id": booking_id
    }), 201


# 📌 User registration (POST)
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    conn = sqlite3.connect("auto_hub.db")
    c = conn.cursor()
    
    # Check if user already exists
    existing_user = c.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if existing_user:
        conn.close()
        return jsonify({"error": "User already exists"}), 409
    
    # Create new user
    hashed_password = generate_password_hash(password)
    c.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed_password))
    conn.commit()
    
    # Get the newly created user
    user = c.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    
    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user[0],
            "email": user[1],
            "role": user[3]
        }
    }), 201

# 📌 User login (POST)
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    conn = sqlite3.connect("auto_hub.db")
    c = conn.cursor()
    user = c.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    
    if not user or not check_password_hash(user[2], password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user[0],
            "email": user[1],
            "role": user[3]
        }
    })

# 📌 Get all bookings (GET)
@app.route("/bookings", methods=["GET"])
def get_bookings():
    conn = sqlite3.connect("auto_hub.db")
    c = conn.cursor()
    c.execute("SELECT * FROM bookings")
    rows = c.fetchall()
    conn.close()

    bookings = [
        {"id": row[0], "service_type": row[1], "date": row[2], "time": row[3], "status": row[4]}
        for row in rows
    ]
    return jsonify(bookings)

# 📌 Get maintenance info (POST)
@app.route("/maintenance", methods=["POST", "OPTIONS"])
def get_maintenance():
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200
    
    data = request.get_json()
    user_id = data.get("user_id")
    
    # Mock maintenance data for demo
    return jsonify({
        "next_service_date": "2024-02-15",
        "maintenance_items": [
            {"item": "Oil Change", "due_date": "2024-02-15", "priority": "high"},
            {"item": "Tire Rotation", "due_date": "2024-02-20", "priority": "medium"},
            {"item": "Brake Inspection", "due_date": "2024-02-25", "priority": "medium"}
        ]
    })

# 📌 Get notifications (POST)
@app.route("/notifications", methods=["POST", "OPTIONS"])
def get_notifications():
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200
    
    data = request.get_json()
    user_id = data.get("user_id")
    
    # Mock notifications for demo
    return jsonify({
        "notifications": [
            {"id": 1, "message": "Oil change due in 5 days", "type": "maintenance", "date": "2024-01-10"},
            {"id": 2, "message": "Tire pressure low", "type": "alert", "date": "2024-01-08"},
            {"id": 3, "message": "Service appointment confirmed", "type": "booking", "date": "2024-01-05"}
        ]
    })

# 📌 Get/update profile (POST)
@app.route("/profile", methods=["POST", "OPTIONS"])
def handle_profile():
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200
    
    data = request.get_json()
    user_id = data.get("user_id")
    
    # Mock profile data for demo
    return jsonify({
        "user": {
            "name": "John Doe",
            "email": "john@example.com"
        },
        "vehicle": {
            "model": "Toyota Camry 2022",
            "mileage": 25000,
            "last_service_date": "2024-01-01",
            "current_performance": "Good",
            "vehicleYear": 2022
        }
    })

if __name__ == "__main__":
    app.run(debug=True)
