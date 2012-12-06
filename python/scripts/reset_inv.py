import sys, codecs, csv, re, os
sys.path.append('/home/christian/gh/little_pger')
from little_pger import *

conn = psycopg2.connect("dbname=vinum")
cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

cursor.execute('delete from inventaire')

cols = getColumns(cursor, 'inventaire')
f = csv.reader(open('/home/christian/vinum/data/raw/data_export_2012-08-29/Inventaire.txt'))
f.next()
for row in f:
    data = dict(zip(cols, [v.strip().replace('$', '') if v.strip() else None for v in row]))
    insert(cursor, 'inventaire', values=data)
cursor.execute("select setval('inventaire_no_inventaire_seq', (select max(no_inventaire) from inventaire)+1)")

conn.commit()
conn.close()
