from vinum import *
from common import *


@app.route('/client/get', methods=['GET'])
@login_required
def get_client():
    return get(g, request, 'client', ('nom_social', 'no_client_saq', 'no_tel', 'courriel',
                                      'no_tel_personnel', 'no_cellulaire', 'note_client',
                                      'nom_responsable'))


@app.route('/client/load', methods=['POST'])
@login_required
def load_client():
    client = pg.select1r(g.db.cursor(), {'client': 'c', 'representant': 'r'},
                         join={'c.representant_id': 'r.representant_id'},
                         where={'no_client': request.form['no_client']})
    # !!! this should be in the database
    client['default_commission'] = 0.16 if client['type_client'] == 'restaurant' else 0.23
    if 'format_note' in request.form and client['note_client']:
        client['note_client'] = client['note_client'].replace('\n', ' ')
    return {'success': True, 'data': client}


@app.route('/client/save', methods=['POST'])
@login_required
def save_client():
    rf = request.form.to_dict()
    rf['jours_livraison'] = request.form.getlist('jours_livraison')
    no_client = rf.pop('no_client')
    if no_client == '': no_client = None
    else: rf['no_client'] = no_client # to allow resaving it back after delete with the same id
    rf['representant_id'] = pg.selectId(g.db.cursor(), 'representant',
                                        where={'representant_nom': rf.get('representant_nom')})
    client = pg.upsert(g.db.cursor(), 'client', where={'no_client': no_client},
                       values=rf, filter_values=True, map_values={'': None})
    g.db.commit()
    return {'success': True, 'data': client}


@app.route('/client/update', methods=['POST'])
@login_required
def update_client():
    return update(g, request, 'client', 'no_client')


@app.route('/client/create', methods=['POST'])
@login_required
def create_client():
    return create(g, request, 'client', 'no_client')


@app.route('/client/delete', methods=['POST'])
@login_required
def delete_client():
    pg.delete(g.db.cursor(), 'client', where={'no_client':
                                              request.form['no_client']})
    g.db.commit()
    return {'success': True}


@app.route('/client/remove_produit', methods=['POST'])
@login_required
def remove_produit():
    cursor = g.db.cursor()
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    pg.delete(cursor, 'client_produit', where={'no_client': request.form['no_client'],
                                                'no_produit_interne': request.form['no_produit_interne']})
    g.db.commit()
    return {'success': True}


@app.route('/client/add_produit', methods=['POST'])
@login_required
def add_produit():
    cursor = g.db.cursor()
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    no_produit_interne = pg.select1(cursor, 'produit', 'no_produit_interne', where={'type_vin': request.form['type_vin']})
    pg.insert(cursor, 'client_produit', values={'no_client': request.form['no_client'],
                                                'no_produit_interne': no_produit_interne})
    g.db.commit()
    return {'success': True}
