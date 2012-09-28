from vinum import *
from common import *


@app.route('/inventaire/get', methods=['GET'])
def get_inventaire():
    conn = psycopg2.connect("dbname=vinum user=christian")
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    json_out = {'success': True}

    #where = {'no_produit_interne': request.args['no_produit_interne'], ('statut', '!='): 'Inactif'}
    #rows = db.select(cursor, 'inventaire', what={'*':1, '-1':'solde_caisse'}, where=where)
    cursor.execute("""select i.*, p.type_vin, p.format, p.quantite_par_caisse,
                             ceil(solde::real / quantite_par_caisse) as solde_caisse 
                      from inventaire i, produit p 
                      where i.no_produit_interne = %s and p.no_produit_interne = i.no_produit_interne and
                      statut != 'Inactif'""", [request.args['no_produit_interne']])
    rows = cursor.fetchall()

    json_out['total'] = len(rows)
    json_out['rows'] = rows

    return json.dumps(json_out, default=json_dthandler)
