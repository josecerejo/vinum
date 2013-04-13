from __future__ import division
import sys, csv, re, os, math
from little_pger import *


inventaire_only = False

conn = psycopg2.connect("dbname=vinum")
cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

#conn.set_isolation_level(0) # autocommit for psycopg2 < 2.4.x

if inventaire_only:
    cursor.execute('delete from inventaire; drop index inventaire_no_produit_interne_idx;')
else:
    os.system('psql -d vinum -f /home/christian/vinum/data/sql/model.sql')
export_dir = '/home/christian/vinum/data/raw/access_export_2013-04-12'
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
    print 'succursale_saq..',
    succs = set()
    with open('../../data/raw/succursales_saq.txt') as f:
        for line in f:
            parts = [p.strip() for p in line.split('|')]
            values = {'no_succursale_saq': parts[0], 'adresse': parts[1], 'ville': parts[2].strip()}
            succs.add(parts[0])
            insert(cursor, 'succursale_saq', values=values)
        print '(%s)' % count(cursor, 'succursale_saq')

####################################################################################################

if not inventaire_only:
    print 'client..',
    sys.stdout.flush()
    cols = getColumns(cursor, 'client')
    f = csv.reader(open('%s/Clients.csv' % export_dir), delimiter=delim)
    f.next()
    expedition_map = {'1':'direct', '2':'succursale', '3':'pickup'}
    type_client_map = {'1':'restaurant', '2':'particulier'}
    jl_map = {'Jeudi':'jeudi', '1':'dimanche','2':'lundi', '3':'mardi', '4':'mercredi', '5':'jeudi',
              '6':'vendredi', '7':'samedi'}
    no_clients = set()
    for row in f:
        data = dict(zip(cols, processRow(row)))
        data['expedition'] = expedition_map.get(data['expedition'], data['expedition'])
        data['type_client'] = type_client_map.get(data['type_client'], data['type_client'])
        data['representant_id'] = selectId(cursor, 'representant', where={'representant_nom': data['representant_id']})
        if data['representant_id'] is None: continue # invalid client
        data['no_succursale_saq'] = data['no_succursale_saq'] if data['no_succursale_saq'] in succs else None
        data['mode_facturation'] = 'poste' # historical clients have "poste", newer have default "courriel"
        for f in ['code_postal', 'code_postal_fact']:
            if data[f]:
                m = re.match('([A-Z]\d[A-Z]) *(\d[A-Z]\d)', data[f].upper())
                data[f] = '%s %s' % (m.group(1), m.group(2))
        jl = jl_map.get(data['jours_livraison'])
        if jl: data['jours_livraison'] = [jl]
        else: data['jours_livraison'] = None
        for possible_saq_nb in re.findall('\d+', data['nom_social']):
            if possible_saq_nb == data['no_client_saq']:
                data['nom_social'] = data['nom_social'].replace(possible_saq_nb, '').strip()
        no_clients.add(data['no_client'])
        insert(cursor, 'client', values=data)
    cursor.execute("select setval('client_no_client_seq', (select max(no_client) from client))")
    print '(%s)' % count(cursor, 'client')

####################################################################################################

if not inventaire_only:
    print 'producteur..',
    sys.stdout.flush()
    no_producteurs = set()
    cols = getColumns(cursor, 'producteur')
    f = csv.reader(open('%s/Producteurs.csv' % export_dir), delimiter=delim)
    f.next()
    for row in f:
        data = dict(zip(cols, processRow(row, 'cp1252')))
        no_producteurs.add(data['no_producteur'])
        insert(cursor, 'producteur', values=data)
    cursor.execute("select setval('producteur_no_producteur_seq', (select max(no_producteur) from producteur))")
    print '(%s)' % count(cursor, 'producteur')

####################################################################################################

print 'produit..',
sys.stdout.flush()
format_map = {}
npi_to_qpc = {}
no_produit_internes = set()
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
    data['format'] = {'6 litres': '6 Litres', '1.5': '1.5 Litre'}.get(data['format'], data['format'])
    if not inventaire_only and data['no_producteur'] in no_producteurs:
        insert(cursor, 'produit', values=data)
        no_produit_internes.add(data['no_produit_interne'])
if not inventaire_only:
    cursor.execute("select setval('produit_no_produit_interne_seq', (select max(no_produit_interne) from produit))")
print '(%s)' % count(cursor, 'produit')

####################################################################################################

if not inventaire_only:
    print 'client_produit..',
    sys.stdout.flush()
    cols = getColumns(cursor, 'client_produit')
    del cols[0]
    f = csv.reader(open('%s/Clients-Produits.csv' % export_dir), delimiter=delim)
    f.next()
    for row in f:
        data = dict(zip(cols, processRow(row)))
        if data['no_client'] not in no_clients or \
                data['no_produit_interne'] not in no_produit_internes: continue
        insert(cursor, 'client_produit', values=data)
    cursor.execute('create index client_produit_no_client_idx on client_produit (no_client)')
    cursor.execute('create index client_produit_no_produit_interne_idx on client_produit (no_produit_interne)')
    print '(%s)' % count(cursor, 'client_produit')

####################################################################################################

if not inventaire_only:
    print 'commande..',
    sys.stdout.flush()
    no_commande_factures = set()
    cols = getColumns(cursor, 'commande')
    f = csv.reader(open('%s/Commandes.csv' % export_dir), delimiter=delim)
    f.next()
    for row in f:
        data = dict(zip(cols, processRow(row)))
        data['expedition'] = expedition_map.get(data['expedition'], data['expedition'])
        data['no_succursale_saq'] = data['no_succursale_saq'] if data['no_succursale_saq'] in succs else None
        if data['no_client'] not in no_clients: continue
        insert(cursor, 'commande', values=data)
        no_commande_factures.add(data['no_commande_facture'])
    cursor.execute("select setval('commande_no_commande_facture_seq', (select max(no_commande_facture) from commande))")
    cursor.execute('create index commande_no_client_idx on commande (no_client)')
    print '(%s)' % count(cursor, 'commande')

####################################################################################################

if not inventaire_only:
    print 'commande_item..',
    sys.stdout.flush()
    cols = getColumns(cursor, 'commande_item')
    cols.remove('commission')
    f = csv.reader(open('%s/ProduitsCommandes.csv' % export_dir), delimiter=delim)
    f.next()
    for row in f:
        del row[-2] # date_commande
        data = dict(zip(cols, processRow(row)))
        if data['no_commande_facture'] not in no_commande_factures or \
                data['no_produit_interne'] not in no_produit_internes: continue
        insert(cursor, 'commande_item', values=data)
    cursor.execute("select setval('commande_item_commande_item_id_seq', (select max(commande_item_id) from commande_item))")
    print '(%s)' % count(cursor, 'commande_item')

####################################################################################################

print 'inventaire..',
sys.stdout.flush()
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
    data['statut_inventaire'] = data['statut_inventaire'].lower()
    if data['no_produit_interne'] not in no_produit_internes: continue
    insert(cursor, 'inventaire', values=data)
cursor.execute("select setval('inventaire_no_inventaire_seq', (select max(no_inventaire) from inventaire))")
cursor.execute('create index inventaire_no_produit_interne_idx on inventaire (no_produit_interne)')
print '(%s)' % count(cursor, 'inventaire')

cursor.execute("""
update inventaire set prix_particulier = prix_coutant * 1.23;
update inventaire set prix_restaurant = (prix_coutant / 1.14975) * 1.16 +
                                           (select montant_timbre from timbre_restaurateur tr, produit p
                                               where p.format = tr.format_timbre and
                                               p.no_produit_interne = inventaire.no_produit_interne);
-- exception for ROU711/721
update inventaire set prix_restaurant = (prix_coutant / 1.14975) * 1.11 +
                                           (select montant_timbre from timbre_restaurateur tr, produit p
                                               where p.format = tr.format_timbre and
                                               p.no_produit_interne = inventaire.no_produit_interne)
    where no_produit_interne in (23, 67);
""")

####################################################################################################

print 'backorder..',
rows = select(cursor, {'commande_item':'ci', 'commande':'c'},
              join={'ci.no_commande_facture': 'c.no_commande_facture'},
              where={'statut_item': 'BO'})
for row in rows:
    row['date_bo'] = row['date_commande']
    insert(cursor, 'backorder', values=row, filter_values=True)
print '(%s)' % count(cursor, 'backorder')

####################################################################################################

conn.commit()
conn.close()
