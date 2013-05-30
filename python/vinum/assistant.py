# -*- coding: utf-8 -*-

from vinum import *
from common import *
from itertools import *
import re
from nltk.corpus import stopwords


MAX_N_RESULTS = 25

@app.route('/assistant/ask', methods=['GET'])
@login_required
def ask():
    q = request.args['query'].strip().lower()
    cur = g.db.cursor()
    results = []
    tokens = re.split('\W+', q)
    tokens = [t for t in tokens if t.lower() not in stopwords.words('french')]
    token_subsets = [ts for ts in chain(*map(lambda x: combinations(tokens, x),
                                             range(len(tokens), 0, -1)))]
    # search for clients
    for ts in token_subsets:
        rows = pg.select(cur, 'client', where={('nom_social', 'ilike', 'unaccent'):
                                              {'%%%s%%' % t for t in ts}})
        if rows and len(rows) <= MAX_N_RESULTS:
            for row in rows:
                if u'créer' in q and 'commande' in q:
                    results.append({'suggestion': u'Créer une commande pour le client %s' % row['nom_social'],
                                    'target': 'commande',
                                    'filter': {'no_client': row['no_client']}})
                if 'commande' in q:
                    results.append({'suggestion': 'Voir les commandes du client %s' % row['nom_social'],
                                    'target': 'commande',
                                    'filter': {'no_client': row['no_client']}})
                elif 'backorder' in q or 'rupture' in q:
                    results.append({'suggestion': 'Voir les BOs pour le client %s' % row['nom_social'],
                                    'target': 'backorder',
                                    'filter': {'no_client': row['no_client']}})
                else:
                    results.append({'suggestion': 'Voir le client %s' % row['nom_social'],
                                    'target': 'client',
                                    'id': row['no_client']})
            # else: too many results!
            break
    if not results:
        # search for a produit
        for ts in token_subsets:
            rows = pg.select(cur, 'produit', where={('type_vin', 'ilike', 'unaccent'):
                                                    {'%%%s%%' % t for t in ts}})
            if rows and len(rows) <= MAX_N_RESULTS:
                for row in rows:
                    if 'backorder' in q or 'rupture' in q:
                        results.append({'suggestion': "Voir les BOs pour le produit %s" % row['type_vin'],
                                        'target': 'backorder',
                                        'filter': {'no_produit_interne': row['no_produit_interne']}})
                    else:
                        results.append({'suggestion': "Voir l'inventaire pour le produit %s" % row['type_vin'],
                                        'target': 'inventaire',
                                        'filter': {'type_vin': row['type_vin']}})
                break
    return {'success': True, 'rows': results}
