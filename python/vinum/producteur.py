# -*- coding: utf-8 -*-

from vinum import *
from common import *


@app.route('/producteur/get', methods=['GET'])
@login_required
def get_producteur():
    return get(g, request, 'producteur', query_fields=('nom_producteur',))


@app.route('/producteur/get_nom', methods=['GET'])
@login_required
def get_nom_producteur():
    return get_distinct_values(g, request, 'producteur', 'nom_producteur')


@app.route('/producteur/get_comte', methods=['GET'])
@login_required
def get_comte():
    return get_distinct_values(g, request, 'producteur', 'comte')


@app.route('/producteur/get_region', methods=['GET'])
@login_required
def get_region():
    # !!!
    s = u"""Alsace
Beaujolais
Bourgogne
Bordeaux
Languedoc
Rhône
Champagne
Loire
Toscane
Abruzzes
Frioul
Venetie
Piedmont
Pouilles
Californie
Heathcote
Mc Laren Vale
Penedès
Navarre
Somontano
Lujan de Cuyo
Uco Valley
Maipu"""
    return {'success': True, 'rows': [{'region': r} for r in s.split('\n')]}
    #return get_distinct_values(g, request, 'producteur', 'region')


@app.route('/producteur/get_pays', methods=['GET'])
@login_required
def get_pays():
    res = get_distinct_values(g, request, 'producteur', 'pays')
    if 'add_nouveau_monde' in request.args:
        res['rows'].append({'pays': 'Nouveau Monde'})
    return res


@app.route('/producteur/save', methods=['POST'])
@login_required
def save_producteur():
    rf = request.form.to_dict()
    np = rf.pop('no_producteur')
    if np == '': np = None
    else: rf['no_producteur'] = np # to allow resaving it back after delete with the same id
    producteur = pg.upsert(g.db.cursor(), 'producteur', where={'no_producteur': np},
                           values=rf, filter_values=True, map_values={'': None})
    g.db.commit()
    return {'success': True, 'data': producteur}


@app.route('/producteur/delete', methods=['POST'])
@login_required
def delete_producteur():
    pg.delete(g.db.cursor(), 'producteur', where={'no_producteur': request.form['no_producteur']},
              tighten_sequence=True)
    g.db.commit()
    return {'success': True}
