import bcrypt
import pyodbc

password = b"admin123"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
hashed_password = hashed.decode('utf-8')

conn_str = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=.;DATABASE=NexusDB;Trusted_Connection=yes;"
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("UPDATE sec.Users SET PasswordHash = ? WHERE Email = 'admin@pincloud.local'", (hashed_password,))
    conn.commit()
    print("Password updated successfully to 'admin123' for admin@pincloud.local")
except Exception as e:
    print("Error:", e)
finally:
    if 'conn' in locals():
        conn.close()
