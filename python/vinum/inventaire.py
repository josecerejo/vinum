from vinum import *
from common import *


@app.route('/inventaire/get', methods=['GET'])
def get_inventaire():
    #where = {'no_produit_interne': request.args['no_produit_interne'], ('statut', '!='): 'Inactif'}
    #rows = db.select(cursor, 'inventaire', what={'*':1, '-1':'solde_caisse'}, where=where)
    cursor = g.db.cursor()
    cursor.execute("""select i.*, p.type_vin, p.format, p.quantite_par_caisse,
                             ceil(solde::real / quantite_par_caisse) as solde_caisse
                      from inventaire i, produit p
                      where i.no_produit_interne = %s and p.no_produit_interne = i.no_produit_interne and
                      statut != 'inactif'
                      order by date_commande
                   """, [request.args['no_produit_interne']])
    rows = cursor.fetchall()
    return {'success': True, 'total': len(rows), 'rows': rows}
