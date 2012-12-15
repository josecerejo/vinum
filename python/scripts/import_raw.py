from __future__ import division
import sys, csv, re, os, math
sys.path.append('/home/christian/gh/little_pger')
from little_pger import *

inventaire_only = False

conn = psycopg2.connect("dbname=vinum")
cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

if inventaire_only:
    cursor.execute('delete from inventaire')
else:
    os.system('psql -d vinum -f /home/christian/vinum/data/sql/model.sql')

export_dir = '/home/christian/vinum/data/raw/access_export_2012-12-12'
#export_dir = '/home/christian/vinum/data/raw/access_export_2012-08-29'
delim = ';'
#default_encoding = 'utf8'
default_encoding = 'cp1252'

num_re = re.compile('^[$]?(\d+)[.,](\d+)')

def processRow(row, encoding=default_encoding):
    a = [s.decode(encoding) for s in row]
    b = ['.'.join(num_re.match(u).groups()) if num_re.match(u) else u for u in a]
    return [u.strip() if u.strip() else None for u in b]

####################################################################################################

if not inventaire_only:
    print 'client..'
    cols = getColumns(cursor, 'client')
    f = csv.reader(open('%s/Clients.csv' % export_dir), delimiter=delim)
    f.next()
    expedition_map = {'1':'direct', '2':'succursale', '3':'pickup'}
    type_client_map = {'1':'restaurant', '2':'particulier'}
    jl_map = {'Jeudi':'jeudi', '1':'dimanche','2':'lundi', '3':'mardi', '4':'mercredi', '5':'jeudi',
              '6':'vendredi', '7':'samedi'}
    for row in f:
        data = dict(zip(cols, processRow(row)))
        data['expedition'] = expedition_map.get(data['expedition'], data['expedition'])
        data['type_client'] = type_client_map.get(data['type_client'], data['type_client'])
        data['representant_id'] = selectId(cursor, 'representant', where={'representant_nom': data['representant_id']})
        data['no_succursale'] = data['no_succursale'] if data['no_succursale'] != '0' else None
        jl = jl_map.get(data['jours_livraison'])
        if jl: data['jours_livraison'] = [jl]
        else: data['jours_livraison'] = None
        for possible_saq_nb in re.findall('\d+', data['nom_social']):
            if possible_saq_nb == data['no_client_saq']:
                data['nom_social'] = data['nom_social'].replace(possible_saq_nb, '').strip()
        insert(cursor, 'client', values=data)
    cursor.execute("select setval('client_no_client_seq', (select max(no_client) from client)+1)")

####################################################################################################

print 'produit..'
format_map = {}
npi_to_qpc = {}
f = csv.reader(open('%s/Formats.csv' % export_dir), delimiter=delim)
cols = f.next()
for row in f:
    data = dict(zip(cols, processRow(row)))
    format_map[data['FormatID']] = data['Format']
cols = getColumns(cursor, 'produit')
f = csv.reader(open('%s/Produits.csv' % export_dir), delimiter=delim)
f.next()
for row in f:
    row[5] = format_map.get(row[5])
    data = dict(zip(cols, processRow(row)))
    npi_to_qpc[data['no_produit_interne']] = int(data['quantite_par_caisse'])
    if not inventaire_only:
        insert(cursor, 'produit', values=data)
if not inventaire_only:
    cursor.execute("select setval('produit_no_produit_interne_seq', (select max(no_produit_interne) from produit)+1)")

####################################################################################################

if not inventaire_only:
    print 'producteur..'
    cols = getColumns(cursor, 'producteur')
    f = csv.reader(open('%s/Producteurs.csv' % export_dir), delimiter=delim)
    f.next()
    for row in f:
        data = dict(zip(cols, processRow(row, 'cp1252')))
        insert(cursor, 'producteur', values=data)
    cursor.execute("select setval('producteur_no_producteur_seq', (select max(no_producteur) from producteur)+1)")

####################################################################################################

if not inventaire_only:
    print 'client_produit..'
    cols = getColumns(cursor, 'client_produit')
    del cols[0]
    f = csv.reader(open('%s/Clients-Produits.csv' % export_dir), delimiter=delim)
    f.next()
    for row in f:
        data = dict(zip(cols, processRow(row)))
        insert(cursor, 'client_produit', values=data)
    cursor.execute('create index client_produit_no_client_idx on client_produit (no_client)')
    cursor.execute('create index client_produit_no_produit_interne_idx on client_produit (no_produit_interne)')

####################################################################################################

if not inventaire_only:
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

####################################################################################################

if not inventaire_only:
    print 'commande_item..'
    cols = getColumns(cursor, 'commande_item')
    cols.remove('commission')
    f = csv.reader(open('%s/ProduitsCommandes.csv' % export_dir), delimiter=delim)
    f.next()
    for row in f:
        data = dict(zip(cols, processRow(row)))
        insert(cursor, 'commande_item', values=data)
    cursor.execute("select setval('commande_item_commande_item_id_seq', (select max(commande_item_id) from commande_item)+1)")

####################################################################################################

print 'inventaire..'
cols = getColumns(cursor, 'inventaire')
f = csv.reader(open('%s/Inventaire.csv' % export_dir), delimiter=delim)
f.next()
for row in f:
    if row[12] and row[1] in npi_to_qpc:
        solde_b = int(row[12])
        qpc = npi_to_qpc[row[1]]
        solde_c = int(math.ceil(solde_b / qpc))
        row.insert(13, str(solde_c))
    else:
        row.insert(13, '')
    data = dict(zip(cols, processRow(row)))
    data['statut'] = data['statut'].lower()
    insert(cursor, 'inventaire', values=data)
cursor.execute("select setval('inventaire_no_inventaire_seq', (select max(no_inventaire) from inventaire)+1)")
cursor.execute('create index inventaire_no_produit_interne_idx on inventaire (no_produit_interne)')

####################################################################################################

conn.commit()
conn.close()

from import_succ import *
