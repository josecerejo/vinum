# -*- coding: utf-8 -*-

from vinum import *
from common import *
from itertools import *
import re
from nltk.corpus import stopwords
from collections import defaultdict


MAX_N_RESULTS = 25
fr_stopwords = set([w.decode('utf-8') for w in stopwords.words('french')])

@app.route('/assistant/ask', methods=['GET'])
@login_required
def ask():
    q = request.args['query'].strip().lower()
    cur = g.db.cursor()
    results = defaultdict(list) # ts_len -> []
    tokens = re.split('\s+', q)
    tokens = [t for t in tokens if t.lower() and t not in fr_stopwords]
    token_subsets = [ts for ts in chain(*map(lambda x: combinations(tokens, x),
                                             range(len(tokens), 0, -1)))]
    # search for clients
    for ts in token_subsets:
        rows = pg.select(cur, 'client', where={('nom_social', 'ilike', 'unaccent'):
                                              {'%%%s%%' % t for t in ts}})
        for row in rows:
            create_comm = {'suggestion': 'Créer une commande pour le client %s' % row['nom_social'],
                           'target': 'commande', 'action': 'create',
                           'no_client': row['no_client']}
            list_comms = {'suggestion': 'Voir les commandes du client %s' % row['nom_social'],
                          'target': 'commande', 'action': 'filter',
                          'no_client': row['no_client']}
            if u'créer' in q and 'commande' in q:
                results[len(ts)].append(create_comm)
            elif 'commande' in q:
                results[len(ts)].append(create_comm)
                results[len(ts)].append(list_comms)
            elif 'backorder' in q or 'rupture' in q:
                results[len(ts)].append({'suggestion': 'Voir les BOs pour le client %s' % row['nom_social'],
                                         'target': 'backorder', 'action': 'filter',
                                         'no_client': row['no_client']})
            else:
                results[len(ts)].append({'suggestion': 'Voir le client %s' % row['nom_social'],
                                         'target': 'client', 'action': 'edit',
                                         'no_client': row['no_client']})
    if not results:
        # search for a produit
        for ts in token_subsets:
            rows = pg.select(cur, 'produit', where={('type_vin', 'ilike', 'unaccent'):
                                                    {'%%%s%%' % t for t in ts}})
            for row in rows:
                inv = {'suggestion': "Voir l'inventaire pour le produit %s" % row['type_vin'],
                       'target': 'inventaire', 'action': 'filter',
                       'type_vin': row['type_vin']}
                price = {'suggestion': "Voir le prix du produit %s" % row['type_vin'],
                         'target': 'prix', 'action': 'filter',
                         'type_vin': row['type_vin']}
                if 'backorder' in q or 'rupture' in q:
                    results[len(ts)].append({'suggestion': "Voir les BOs pour le produit %s" % row['type_vin'],
                                             'target': 'backorder', 'action': 'filter',
                                             'no_produit_interne': row['no_produit_interne']})
                elif 'prix' in q:
                    results[len(ts)].append(price)
                elif 'inventaire' in q:
                    results[len(ts)].append(inv)
                else:
                    results[len(ts)].append(price)
                    results[len(ts)].append(inv)
    return {'success': True, 'rows': results[max(results.keys())][:MAX_N_RESULTS] if results else []}
