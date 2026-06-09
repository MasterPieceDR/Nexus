import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.connection import execute_query

# Agregar FirstName y LastName a sec.Users si no existen
try:
    execute_query("ALTER TABLE sec.Users ADD FirstName NVARCHAR(50)")
    print("Added FirstName column")
except Exception as e:
    print(f"FirstName might already exist: {e}")

try:
    execute_query("ALTER TABLE sec.Users ADD LastName NVARCHAR(50)")
    print("Added LastName column")
except Exception as e:
    print(f"LastName might already exist: {e}")
