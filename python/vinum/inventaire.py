from vinum import *
from common import *


@app.route('/inventaire/get', methods=['GET'])
def get_inventaire():
    # if no_produit_interne is specified, it's a product-specific request from a commande screen,
    # otherwise it's a request from the master grid
    return get(g, request, {'inventaire': 'i', 'produit': 'p'},
               what=['i.*', 'p.type_vin', 'p.format', 'p.quantite_par_caisse',
                     'age_in_days(date_recue)'],
               join={'p.no_produit_interne':'i.no_produit_interne'},
               where={'i.no_produit_interne': request.args['no_produit_interne']}
               if 'no_produit_interne' in request.args else {})


@app.route('/inventaire/save', methods=['POST'])
def save_inventaire_record():
    rf = request.form.to_dict()
    ni = rf.pop('no_inventaire')
    if ni == '': ni = None
    else: rf['no_inventaire'] = ni # to allow resaving it back after delete with the same id
    rf['no_produit_interne'] = pg.select1(g.db.cursor(), 'produit', 'no_produit_interne',
                                          where={'type_vin': rf['type_vin']})
    pc = float(rf['prix_coutant'])
    rf['prix_particulier'] = (pc * 0.23) + pc
    rf['prix_restaurant'] = (pc / 1.14975) * 0.16 + (pc / 1.15975) + 0.81
    inv = pg.upsert(g.db.cursor(), 'inventaire', where={'no_inventaire': ni},
                    values=rf, filter_values=True, map_values={'': None}, debug_print=True)
    g.db.commit()
    return {'success': True, 'data': inv}


@app.route('/inventaire/delete', methods=['POST'])
def delete_inventaire_record():
    pg.delete(g.db.cursor(), 'inventaire',
              where={'no_inventaire': request.form['no_inventaire']})
    g.db.commit()
    return {'success': True}
