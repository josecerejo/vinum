from vinum import *
from common import *


@app.route('/rapport/vente', methods=['GET'])
@login_required
def get_rapport_vente():
    where = {('date_commande', '>='): request.args['start_date'], ('date_commande', '<='): request.args['end_date']}
    if request.args['representant_nom']:
        where['representant_nom'] = request.args['representant_nom']
    rows = pg.select(g.db.cursor(), {'commande': 'c', 'commande_item': 'ci', 'produit': 'p', 'client': 'l', 'representant': 'r'},
                     what=['ci.no_produit_interne', 'p.type_vin', 'p.nom_domaine', 'p.format', 'p.quantite_par_caisse',
                           'sum(ci.quantite_caisse) as quantite_caisse'],
                     join={'c.no_commande_facture': 'ci.no_commande_facture', 'ci.no_produit_interne': 'p.no_produit_interne',
                           'c.no_client': 'l.no_client', 'l.representant_id': 'r.representant_id'}, where=where,
                     group_by='type_vin, nom_domaine, format, quantite_par_caisse, ci.no_produit_interne', order_by='type_vin')
    return {'success': True, 'total': len(rows), 'rows': rows}
