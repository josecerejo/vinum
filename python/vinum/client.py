from vinum import *
from common import *


@app.route('/client/get', methods=['GET'])
def get_client():
    return get(request, 'client', ('nom_social', 'no_client_saq'))

    
@app.route('/client/update', methods=['POST'])
def update_client():
    return update(request, 'client', 'no_client')


@app.route('/client/create', methods=['POST'])
def create_client():
    return create(request, 'client', 'no_client')    


@app.route('/client/delete', methods=['POST'])
def delete_client():
    return delete(request, 'client', 'no_client')        


# def get_produits_commandes(no_client):
#     conn = psycopg2.connect("dbname=vinum user=christian")
#     cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
#     json_out = {'success': True}
#     cursor.execute("""select * from produit p, (select no_produit_interne, count(*) 
#                       from commande_produit cp where cp.no_client = %s 
#                       group by no_produit_interne) f 
#                       where p.no_produit_interne = f.no_produit_interne 
#                       order by count desc;""", [no_client])
#     rows = cursor.fetchall()
#     json_out['total'] = len(rows)
#     json_out['rows'] = rows
#     return json.dumps(json_out, default=json_dthandler)


def get_produits(no_client):
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    json_out = {'success': True}
    cursor.execute("""select * from produit p, client_produit cp
                      where cp.no_client = %s and p.no_produit_interne = cp.no_produit_interne
                      order by type_vin asc
                   """, [no_client])    
    rows = cursor.fetchall()
    json_out['total'] = len(rows)
    json_out['rows'] = rows
    return json.dumps(json_out, default=json_dthandler)
    

@app.route('/client/remove_produit', methods=['POST'])
def remove_produit():
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    request.form = dict([(c, f if f else None) for c, f in request.form.items()])
    db.delete(cursor, 'client_produit', where={'no_client': request.form['no_client'], 
                                               'no_produit_interne': request.form['no_produit_interne']})
    conn.commit()
    json_out = {'success': True}
    return json.dumps(json_out, default=json_dthandler)
    
