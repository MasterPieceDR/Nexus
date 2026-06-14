import sys
import os
import re

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.connection import get_connection

def apply_sql_file(file_path):
    print(f"Applying {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    batches = re.split(r'^\s*GO\s*$', sql_content, flags=re.IGNORECASE | re.MULTILINE)

    conn = get_connection()
    cursor = conn.cursor()

    success_count = 0
    fail_count = 0

    for batch in batches:
        batch_clean = batch.strip()
        if not batch_clean:
            continue
        try:
            cursor.execute(batch_clean)
            conn.commit()
            success_count += 1
        except Exception as e:
            print(f"Error executing batch starting with:\n{batch_clean[:200]}...")
            print("Error details:", e)
            fail_count += 1
            conn.rollback()

    conn.close()
    print(f"Finished. Success: {success_count}, Failed: {fail_count}")

if __name__ == '__main__':
    apply_sql_file('sql/03_procedures.sql')
