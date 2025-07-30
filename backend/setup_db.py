import mysql.connector
from mysql.connector import errorcode

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'port': 3305,
    'password': 'Kinyanjui@7873'
}

DB_NAME = 'autohub'

SCHEMA_FILE = '../db/schema.sql'

def create_database(cursor):
    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} DEFAULT CHARACTER SET 'utf8'")
        print(f"Database {DB_NAME} created or already exists.")
    except mysql.connector.Error as err:
        print(f"Failed creating database: {err}")
        exit(1)

def create_user_and_grant(cursor):
    try:
        cursor.execute(f"CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY '{DB_CONFIG['password']}'")
        cursor.execute(f"GRANT ALL PRIVILEGES ON {DB_NAME}.* TO 'root'@'localhost'")
        cursor.execute("FLUSH PRIVILEGES")
        print("User privileges granted.")
    except mysql.connector.Error as err:
        print(f"Failed creating user or granting privileges: {err}")
        exit(1)

def import_schema(cursor):
    try:
        with open(SCHEMA_FILE, 'r') as f:
            schema_sql = f.read()
        # Split the schema SQL by semicolon and execute each statement separately
        statements = schema_sql.split(';')
        for statement in statements:
            stmt = statement.strip()
            if stmt:
                cursor.execute(stmt)
        print("Database schema imported successfully.")
    except FileNotFoundError:
        print(f"Schema file {SCHEMA_FILE} not found. Skipping schema import.")
    except mysql.connector.Error as err:
        print(f"Failed importing schema: {err}")
        exit(1)

def main():
    try:
        cnx = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            port=DB_CONFIG['port'],
            password=DB_CONFIG['password']
        )
        cursor = cnx.cursor()
        create_database(cursor)
        create_user_and_grant(cursor)
        cnx.database = DB_NAME
        import_schema(cursor)
        cursor.close()
        cnx.close()
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Access denied: Check your username or password.")
        else:
            print(err)

if __name__ == '__main__':
    main()
