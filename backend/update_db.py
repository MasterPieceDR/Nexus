import sqlite3
conn=sqlite3.connect('pincloud.db')
c=conn.cursor()
c.execute("UPDATE posts SET status='APPROVED'")
conn.commit()
print('DB Updated')
