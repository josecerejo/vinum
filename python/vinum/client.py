from vinum import *
from common import *


@app.route('/client/get', methods=['GET'])
def get_client():
    return get(g, request, 'client', ('nom_social', 'no_client_saq'))

    
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
    db.delete(cursor, 'client_produit', where={'no_client': request.form['no_client'], 
                                                'no_produit_interne': request.form['no_produit_interne']})
    g.db.commit()
    return {'success': True}

    
@app.route('/client/add_produit', methods=['POST'])
def add_produit():
    cursor = g.db.cursor()
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    no_produit_interne = db.select1(cursor, 'produit', 'no_produit_interne', where={'type_vin': request.form['type_vin']})
    db.insert(cursor, 'client_produit', values={'no_client': request.form['no_client'], 
                                                'no_produit_interne': no_produit_interne})
    g.db.commit()
    return {'success': True}
