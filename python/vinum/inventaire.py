from vinum import *
from common import *


# def _db(f):
#     def g():
#         conn = psycopg2.connect("dbname=vinum user=christian")
#         cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
#         return json.dumps(f(conn, cursor), default=json_dthandler)
#     return g


@app.route('/inventaire/get', methods=['GET'])
@_db
def get_inventaire(conn, cursor):
    #where = {'no_produit_interne': request.args['no_produit_interne'], ('statut', '!='): 'Inactif'}
    #rows = db.select(cursor, 'inventaire', what={'*':1, '-1':'solde_caisse'}, where=where)
    cursor.execute("""select i.*, p.type_vin, p.format, p.quantite_par_caisse,
                             ceil(solde::real / quantite_par_caisse) as solde_caisse
                      from inventaire i, produit p
                      where i.no_produit_interne = %s and p.no_produit_interne = i.no_produit_interne and
                      statut != 'Inactif'""", [request.args['no_produit_interne']])
    rows = cursor.fetchall()
    return {'success': True, 'total': len(rows), 'rows': rows}
