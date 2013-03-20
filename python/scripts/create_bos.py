from little_pger import *

conn = psycopg2.connect("dbname=vinum")
cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

delete(cursor, 'backorder')

print 'backorder..',
rows = select(cursor, {'commande_item':'ci', 'commande':'c'},
              join={'ci.no_commande_facture': 'c.no_commande_facture'},
              where={'statut_item': 'BO'})
for row in rows:
    row['date_bo'] = row['date_commande']
    insert(cursor, 'backorder', values=row, filter_values=True)
print '(%s)' % count(cursor, 'backorder')

conn.commit()
conn.close()
