from vinum import *
from common import *
import math


@app.route('/inventaire/get', methods=['GET'])
@login_required
def get_inventaire():
    # if no_produit_interne is specified, it's a product-specific request from a commande screen,
    # otherwise it's a request from the master grid (i.e. where={})
    return get(g, request, {'inventaire': 'i', 'produit': 'p', 'producteur': 'r'},
               what=['i.*', 'p.type_vin', 'p.format', 'p.quantite_par_caisse',
                     'r.nom_producteur', 'age_in_days(date_recue)'],
               join={'p.no_produit_interne':'i.no_produit_interne',
                     'p.no_producteur': 'r.no_producteur'},
               where={'i.no_produit_interne': request.args['no_produit_interne']}
               if 'no_produit_interne' in request.args else {})


@app.route('/inventaire/save', methods=['POST'])
@login_required
def save_inventaire_record():
    cur = g.db.cursor()
    rf = request.form.to_dict()
    ni = rf.pop('no_inventaire')
    if ni == '': ni = None
    else: rf['no_inventaire'] = ni # to allow resaving it back after delete with the same id
    rf['no_produit_interne'] = unicode(pg.select1(cur, 'produit', 'no_produit_interne',
                                                  where={'type_vin': rf['type_vin']}))

    # if any existing commande_item is associated to this inv record, only allow
    # certain fields: quantite_recuee/commandee, solde_caisse/bouteille, statut_inventaire
    # WARNING: THIS IS UGLY AND SHOULD BE DONE BETTER!!
    inv = pg.select1r(cur, 'inventaire', where={'no_inventaire': ni})
    if inv and pg.exists(cur, 'commande_item', where={'no_produit_saq': inv['no_produit_saq'],
                                                      'no_demande_saq': inv['no_demande_saq']}):
        for f in pg.getColumns(cur, 'inventaire'):
            if f not in rf: continue
            if not rf[f] and not inv[f]: continue
            if inv[f].__class__ == float: inv[f] = '%.2f' % inv[f]
            if unicode(str(inv[f]), 'utf8') != rf[f] and f not in ['quantite_recue', 'quantite_commandee',
                                                                   'solde_bouteille', 'solde_caisse',
                                                                   'statut_inventaire']:
                print f, inv[f], rf[f]
                raise psycopg2.IntegrityError

    pc = float(rf['prix_coutant'])
    rf['prix_particulier'] = pc * 1.23
    timbre = pg.select1(cur, 'timbre_restaurateur', 'montant_timbre',
                        where={'format_timbre': rf['format']})

    # *** ATTENTION! EXCEPTION POUR LA COMMISSION ***
    comm_restau_mult = 1.16
    if int(rf['no_produit_interne']) in [23, 67]:
        comm_restau_mult = 1.11
    # ***********************************************

    rf['prix_restaurant'] = remove_taxes_(pc) * comm_restau_mult + timbre
    qpc = pg.select1(cur, 'produit', 'quantite_par_caisse', where={'no_produit_interne': rf['no_produit_interne']})
    if rf['solde_bouteille'] and qpc:
        rf['solde_caisse'] = int(math.ceil(float(rf['solde_bouteille']) / qpc))
    inv = pg.upsert(cur, 'inventaire', where={'no_inventaire': ni},
                    values=rf, filter_values=True, map_values={'': None})
    g.db.commit()
    return {'success': True, 'data': inv}


@app.route('/inventaire/delete', methods=['POST'])
@login_required
def delete_inventaire_record():
    cur = g.db.cursor()

    # if any existing commande_item is associated to this inv record, don't allow to del
    inv = pg.select1r(cur, 'inventaire', where={'no_inventaire': request.form['no_inventaire']})
    if pg.exists(cur, 'commande_item', where={'no_produit_saq': inv['no_produit_saq'],
                                              'no_demande_saq': inv['no_demande_saq']}):
        raise psycopg2.IntegrityError

    pg.delete(cur, 'inventaire', where={'no_inventaire': request.form['no_inventaire']})
    g.db.commit()
    return {'success': True}
