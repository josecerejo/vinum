import sys, csv, re, os
sys.path.append('/home/christian/gh/little_pger')
from little_pger import *

os.system('psql -d vinum -f /home/christian/vinum/data/sql/model.sql')

conn = psycopg2.connect("dbname=vinum")
cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

export_dir = '/home/christian/vinum/data/raw/access_export_2012-12-12'
delim = ';'

num_re = re.compile('^(\d+),(\d+)')

def processRow(row):
    a = [s.decode('cp1252') for s in row]
    b = ['.'.join(num_re.match(u).groups()) if num_re.match(u) else u for u in a]
    return [u.strip() if u.strip() else None for u in b]

# client

print 'client..'
cols = getColumns(cursor, 'client')
f = csv.reader(open('%s/Clients.csv' % export_dir), delimiter=delim)
f.next()
expedition_map = {'1':'direct', '2':'succursale', '3':'pickup'}
type_client_map = {'1':'restaurant', '2':'particulier'}
for row in f:
    data = dict(zip(cols, processRow(row)))
    data['expedition'] = expedition_map.get(data['expedition'], data['expedition'])
    data['type_client'] = type_client_map.get(data['type_client'], data['type_client'])
    data['representant_id'] = selectId(cursor, 'representant', where={'representant_nom': data['representant_id']})
    data['no_succursale'] = data['no_succursale'] if data['no_succursale'] != '0' else None
    for possible_saq_nb in re.findall('\d+', data['nom_social']):
        if possible_saq_nb == data['no_client_saq']:
            data['nom_social'] = data['nom_social'].replace(possible_saq_nb, '').strip()
    insert(cursor, 'client', values=data)
cursor.execute("select setval('client_no_client_seq', (select max(no_client) from client)+1)")

# produit

print 'produit..'
formats = {}
f = csv.reader(open('%s/Formats.csv' % export_dir), delimiter=delim)
cols = f.next()
for row in f:
    data = dict(zip(cols, processRow(row)))
    formats[data['FormatID']] = data['Format']

producteurs = {}
# f = csv.reader(open('%s/Producteurs.csv' % export_dir), delimiter=delim)
# cols = f.next()
# for row in f:
#     data = dict(zip(cols, [v.strip() if v.strip() else None for v in processRow(row)]))
#     try:
#         producteurs[data['NoProducteur']] = data['NomProducteur'].decode('utf8')
#     except:
#         producteurs[data['NoProducteur']] = data['NomProducteur'].decode('latin1')

cols = getColumns(cursor, 'produit')
del cols[3]
del cols[6]

f = csv.reader(open('%s/Produits.csv' % export_dir), delimiter=delim)
f.next()
for row in f:
    data = dict(zip(cols, processRow(row)))
    data['nom_producteur'] = producteurs.get(data['no_producteur'])
    data['format'] = formats.get(data['format_id'])
    insert(cursor, 'produit', values=data)

cursor.execute("select setval('produit_no_produit_interne_seq', (select max(no_produit_interne) from produit)+1)")

# client-produit

print 'client_produit..'
cols = getColumns(cursor, 'client_produit')
del cols[0]
f = csv.reader(open('%s/Clients-Produits.csv' % export_dir), delimiter=delim)
f.next()
for row in f:
    data = dict(zip(cols, processRow(row)))
    insert(cursor, 'client_produit', values=data)

# commande

print 'commande..'
cols = getColumns(cursor, 'commande')
f = csv.reader(open('%s/Commandes.csv' % export_dir), delimiter=delim)
f.next()
for row in f:
    data = dict(zip(cols, processRow(row)))
    data['expedition'] = expedition_map.get(data['expedition'], data['expedition'])    
    data['no_succursale'] = data['no_succursale'] if data['no_succursale'] != '0' else None
    insert(cursor, 'commande', values=data)
cursor.execute("select setval('commande_no_commande_facture_seq', (select max(no_commande_facture) from commande)+1)")

cursor.execute('create index commande_no_client_idx on commande (no_client)')

# commande-produit

print 'commande_produit..'
cols = getColumns(cursor, 'commande_produit')
cols.remove('commission')
f = csv.reader(open('%s/ProduitsCommandes.csv' % export_dir), delimiter=delim)
f.next()
for row in f:
    data = dict(zip(cols, processRow(row)))
    insert(cursor, 'commande_produit', values=data)
cursor.execute("select setval('commande_produit_commande_produit_id_seq', (select max(commande_produit_id) from commande_produit)+1)")

# inventaire

print 'inventaire..'
cols = getColumns(cursor, 'inventaire')
f = csv.reader(open('%s/Inventaire.csv' % export_dir), delimiter=delim)
f.next()
for row in f:
    data = dict(zip(cols, processRow(row)))
    data['statut'] = data['statut'].lower()
    insert(cursor, 'inventaire', values=data)
cursor.execute("select setval('inventaire_no_inventaire_seq', (select max(no_inventaire) from inventaire)+1)")

conn.commit()
conn.close()

from import_succ import *
