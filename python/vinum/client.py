from vinum import *
from common import *


@app.route('/client/get', methods=['GET', 'POST'])
def get_client():
    return get(g, request, 'client', ('nom_social', 'no_client_saq'))


@app.route('/client/load', methods=['POST'])
def load_client():
    client = pg.select1r(g.db.cursor(), 'client', 
                               where={'no_client': request.form['no_client']})
    client['representant_nom'] = pg.select1(g.db.cursor(), 'representant', 'representant_nom',
                                            where={'representant_id': client['representant_id']})
    # !!! this should be in the database
    client['default_commission'] = 0.16 if client['type_client'] == 'restaurant' else 0.23
    return {'success': True, 'data': client}


@app.route('/client/save', methods=['POST'])
def save_client():    
    rf = request.form.to_dict()
    no_client = rf.pop('no_client')
    if no_client == '': no_client = None
    rf['representant_id'] = pg.selectId(g.db.cursor(), 'representant', 
                                        where={'representant_nom': rf.get('representant_nom')})
    client = pg.upsert(g.db.cursor(), 'client', where={'no_client': no_client},
                       values=rf, filter_values=True, map_values={'': None})
    g.db.commit()
    return {'success': True, 'data': client}
    
    
@app.route('/client/update', methods=['POST'])
def update_client():
    return update(g, request, 'client', 'no_client')


@app.route('/client/create', methods=['POST'])
def create_client():
    return create(g, request, 'client', 'no_client')    


@app.route('/client/delete', methods=['POST'])
def delete_client():
    return delete(g, request, 'client', 'no_client')        


def get_produits(g, no_client):
    cursor = g.db.cursor()
    cursor.execute("""select * from produit p, client_produit cp
                      where cp.no_client = %s and p.no_produit_interne = cp.no_produit_interne
                      order by type_vin asc
                   """, [no_client])    
    rows = cursor.fetchall()
    return {'success': True, 'total': len(rows), 'rows': rows}
    

@app.route('/client/remove_produit', methods=['POST'])
def remove_produit():
    cursor = g.db.cursor()
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    pg.delete(cursor, 'client_produit', where={'no_client': request.form['no_client'], 
                                                'no_produit_interne': request.form['no_produit_interne']})
    g.db.commit()
    return {'success': True}

    
@app.route('/client/add_produit', methods=['POST'])
def add_produit():
    cursor = g.db.cursor()
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    no_produit_interne = pg.select1(cursor, 'produit', 'no_produit_interne', where={'type_vin': request.form['type_vin']})
    pg.insert(cursor, 'client_produit', values={'no_client': request.form['no_client'], 
                                                'no_produit_interne': no_produit_interne})
    g.db.commit()
    return {'success': True}
