import sys, codecs, csv, re
sys.path.append('/home/christian/gh/little_pger')
from little_pger import *

conn = psycopg2.connect("dbname=vinum")
cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

cols = getColumns(cursor, 'client')

# clients

f = csv.reader(open('/home/christian/vinum/data/raw/data_export_2012-08-29/Clients.txt'))
f.next()
for row in f:
    data = dict(zip(cols, [v.strip() if v.strip() else None for v in row]))
    for possible_saq_nb in re.findall('\d+', data['nom_social']):
        if possible_saq_nb == data['no_client_saq']:
            data['nom_social'] = data['nom_social'].replace(possible_saq_nb, '')
    insert(cursor, 'client', values=data)

cursor.execute("select setval('client_no_client_seq', (select max(no_client) from client)+1)")

# produits

formats = {}
f = csv.reader(open('/home/christian/vinum/data/raw/data_export_2012-08-29/Formats.txt'))
f.next()
for row in f:
    data = dict(zip(cols, [v.strip() if v.strip() else None for v in row]))
    formats[data['FormatID']] = data['Format']

producteurs = {}
f = csv.reader(open('/home/christian/vinum/data/raw/data_export_2012-08-29/Producteurs.txt'))
f.next()
for row in f:
    data = dict(zip(cols, [v.strip() if v.strip() else None for v in row]))
    formats[data['FormatID']] = data['Format']


cols = getColumns(cursor, 'produit')

f = csv.reader(open('/home/christian/vinum/data/raw/data_export_2012-08-29/Produits.txt'))
f.next()
for row in f:
    data = dict(zip(cols, [v.strip() if v.strip() else None for v in row]))
    insert(cursor, 'produit', values=data)

cursor.execute("select setval('produit_no_produit_interne_seq', (select max(no_produit_interne) from produit)+1)")


conn.commit()
