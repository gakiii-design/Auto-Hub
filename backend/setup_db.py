import mysql.connector

DB_CONFIG = {
    'host': 'localhost',
    'port': 3305,
    'user': 'root',
    'password': 'Kinyanjui@7873',
    'database': 'autohub'
}

def create_bookings_table():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            service_type VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == '__main__':
    create_bookings_table()
    print("Bookings table created or already exists.")
