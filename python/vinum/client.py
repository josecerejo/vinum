import psycopg2, psycopg2.extras, json, datetime
from vinum import *
import common


@app.route('/client/get', methods=['GET'])
def get_client():
    return common.get(request, 'client', ('nom_social', 'no_client_saq'))

    
@app.route('/client/update', methods=['POST'])
def update_client():
    return common.update(request, 'client', 'no_client')


@app.route('/client/create', methods=['POST'])
def create_client():
    return common.create(request, 'client', 'no_client')    


@app.route('/client/delete', methods=['POST'])
def delete_client():
    return common.delete(request, 'client', 'no_client')        


def get_produits_commandes(no_client):
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    json_out = {'success': True}
    cursor.execute("""select * from produit p, (select no_produit_interne, count(*) 
                      from commande_produit cp where cp.no_client = %s 
                      group by no_produit_interne) f 
                      where p.no_produit_interne = f.no_produit_interne 
                      order by count desc;""", [no_client])
    rows = cursor.fetchall()
    json_out['total'] = len(rows)
    json_out['rows'] = rows
    return json.dumps(json_out, default=common.json_dthandler)
