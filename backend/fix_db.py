import sqlite3
import os

# Connect to the database
conn = sqlite3.connect('auto_hub.db')
c = conn.cursor()

# Check current bookings table structure
c.execute('PRAGMA table_info(bookings)')
columns = [column[1] for column in c.fetchall()]
print('Current bookings columns:', columns)

# If user_id column doesn't exist, drop and recreate table
if 'user_id' not in columns:
    print('Recreating bookings table with correct schema...')
    
    # Drop existing table
    c.execute('DROP TABLE IF EXISTS bookings')
    
    # Create new bookings table with correct schema
    c.execute('''
        CREATE TABLE bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            user_email TEXT NOT NULL,
            service_type TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    print('Bookings table recreated successfully')
else:
    print('Bookings table already has correct schema')

conn.close()
