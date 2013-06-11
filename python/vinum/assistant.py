# -*- coding: utf-8 -*-

from vinum import *
from common import *
from itertools import *
import re
from nltk.corpus import stopwords
from collections import defaultdict


MAX_N_RESULTS = 25
fr_stopwords = set([w.decode('utf-8') for w in stopwords.words('french')] + ['tous', 'les'])

@app.route('/assistant/ask', methods=['GET'])
@login_required
def ask():
    q = request.args['query'].strip().lower()
    cur = g.db.cursor()
    results = defaultdict(list) # ts_len -> []
    tokens = re.split('\s+', q)
    tokens = [t for t in tokens if t.lower() and t not in fr_stopwords and len(t) > 2]
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
    #if not results:
    if True:
        # search for a produit
        for ts in token_subsets:
            rows = pg.select(cur, 'produit', where={('type_vin', 'ilike', 'unaccent'):
                                                    {'%%%s%%' % t for t in ts}})
            if not rows and len(ts) == 1: # if not found in produit, search in inventaire
                rows = pg.select(cur, {'inventaire': 'i', 'produit': 'p'},
                                 what='distinct type_vin, i.no_produit_interne',
                                 join={'i.no_produit_interne': 'p.no_produit_interne'},
                                 where_or={'no_demande_saq': ts[0],
                                           "coalesce(no_produit_saq::text, '')": ts[0]})
            for row in rows:
                inv = {'suggestion': "Voir l'inventaire pour le produit %s" % row['type_vin'],
                       'target': 'inventaire', 'action': 'filter',
                       'type_vin': row['type_vin']}
                price = {'suggestion': "Voir le prix du produit %s" % row['type_vin'],
                         'target': 'prix', 'action': 'filter',
                         'type_vin': row['type_vin']}
                client = {'suggestion': "Voir les clients ayant commandé le produit %s" % row['type_vin'],
                         'target': 'client', 'action': 'query',
                         'no_produit_interne': row['no_produit_interne']}
                if 'backorder' in q or 'rupture' in q:
                    results[len(ts)].append({'suggestion': "Voir les BOs pour le produit %s" % row['type_vin'],
                                             'target': 'backorder', 'action': 'filter',
                                             'no_produit_interne': row['no_produit_interne']})
                elif 'prix' in q:
                    results[len(ts)].append(price)
                elif 'inventaire' in q:
                    results[len(ts)].append(inv)
                elif 'client' in q:
                    results[len(ts)].append(client)
                else:
                    results[len(ts)].append(price)
                    results[len(ts)].append(inv)
                    results[len(ts)].append(client)

    m = max(results.keys()) if results else 0
    if u'créer' in q:
        if 'client' in q:
            results[m].append({'suggestion': 'Créer un nouveau client',
                               'target': 'client', 'action': 'create'})
        elif 'commande' in q:
            results[m].append({'suggestion': 'Créer une nouvelle commande',
                               'target': 'commande', 'action': 'create'})
        else:
            results[m].append({'suggestion': 'Créer un nouveau client',
                               'target': 'client', 'action': 'create'})
            results[m].append({'suggestion': 'Créer une nouvelle commande',
                               'target': 'commande', 'action': 'create'})
    elif 'commande' in q:
        results[m].append({'suggestion': 'Voir la liste de toutes les commandes',
                                             'target': 'commande', 'action': 'all'})
    elif 'client' in q:
        results[m].append({'suggestion': 'Voir la liste de tous les clients',
                                             'target': 'client', 'action': 'all'})
    elif 'inventaire' in q:
        results[m].append({'suggestion': "Voir tout l'inventaire",
                           'target': 'inventaire', 'action': 'all'})
    elif 'backorder' in q or 'rupture' in q:
        results[m].append({'suggestion': "Voir toutes les ruptures de stock (BOs)",
                           'target': 'backorder', 'action': 'all'})
    elif 'liste' in q or 'prix' in q:
        results[m].append({'suggestion': "Voir la liste de prix",
                           'target': 'prix', 'action': 'all'})

    return {'success': True, 'rows': results[max(results.keys())][:MAX_N_RESULTS] if results else []}
