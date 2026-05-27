import sqlite3
import datetime

try:
    conn = sqlite3.connect('pincloud.db')
    c = conn.cursor()

    c.execute("SELECT id FROM users LIMIT 1")
    user = c.fetchone()
    if not user:
        c.execute("INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)", 
                  ("Profesor PinCloud", "profesor@test.com", "hashed", "user", 1))
        user_id = c.lastrowid
    else:
        user_id = user[0]

    c.execute("SELECT id FROM categories LIMIT 1")
    cat = c.fetchone()
    if not cat:
        c.execute("INSERT INTO categories (name, slug, is_active) VALUES (?, ?, ?)", ("Comida", "comida", 1))
        cat_id = c.lastrowid
    else:
        cat_id = cat[0]

    c.execute("""
        INSERT INTO posts (title, description, category_id, user_id, s3_key, media_type, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "Cena Especial de Prueba",
        "Publicación provisional generada para la revisión del profesor.",
        cat_id,
        user_id,
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&fit=crop",
        "image/jpeg",
        "Aprobado",
        datetime.datetime.now().isoformat()
    ))
    conn.commit()
    print("¡Publicación provisional cargada con éxito!")
except Exception as e:
    print("Error:", e)
finally:
    if 'conn' in locals():
        conn.close()
