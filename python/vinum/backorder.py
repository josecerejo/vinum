# -*- coding: utf-8 -*-

from vinum import *
from common import *


@app.route('/backorder/get', methods=['GET'])
@login_required
def get_bos():
    return get(g, request, {'backorder': 'b', 'produit': 'p', 'client': 'c', 'representant': 'r'},
               join={'b.no_produit_interne': 'p.no_produit_interne', 'b.no_client': 'c.no_client',
                     'c.representant_id': 'r.representant_id'})


@app.route('/backorder/remove', methods=['POST'])
@login_required
def remove_bo():
    pg.delete(g.db.cursor(), 'backorder',
              where={'backorder_id': request.form['backorder_id']},
              tighten_sequence=True)
    g.db.commit()
    return {'success': True}


@app.route('/backorder/load', methods=['POST'])
@login_required
def load_bo():
    bo = pg.select1r(g.db.cursor(), {'backorder':'b', 'client':'c', 'produit':'p'},
                     join={'b.no_client':'c.no_client', 'b.no_produit_interne':'p.no_produit_interne'},
                     where={'backorder_id': request.form['backorder_id']})
    return {'success': True, 'data': bo}


@app.route('/backorder/save', methods=['POST'])
@login_required
def save_bo():
    cur = g.db.cursor()
    rf = request.form.to_dict()
    boid = rf.pop('backorder_id')
    if boid == '': # a new BO is created
        rf['no_client'] = pg.select1(cur, 'client', 'no_client', where={'nom_social': rf['nom_social']})
        rf['no_produit_interne'] = pg.select1(cur, 'produit', 'no_produit_interne', where={'type_vin': rf['type_vin']})
        boid = None
    else:
        #rf['backorder_id'] = boid
        bo = pg.select1r(cur, 'backorder', where={'backorder_id': boid})
        rf['no_client'] = bo['no_client']
        rf['no_produit_interne'] = bo['no_produit_interne']
    qc = int(rf['quantite_caisse'])
    rf['quantite_bouteille'] = qc * pg.select1(cur, 'produit', 'quantite_par_caisse',
                                               where={'no_produit_interne': rf['no_produit_interne']})
    if boid is None and pg.exists(cur, 'backorder', where={'no_client': rf['no_client'],
                                                          'no_produit_interne': rf['no_produit_interne']}):
        return {'success': False, 'error': 'server', 'error_msg': 'Un BO avec ce client/produit existe déjà!'}
    pg.upsert(cur, 'backorder', values=rf, where={'backorder_id': boid}, filter_values=True)
    g.db.commit()
    return {'success': True}
