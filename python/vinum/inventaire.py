from vinum import *
from common import *


@app.route('/inventaire/get', methods=['GET'])
def get_inventaire():
    if 'no_produit_interne' in request.args:
        rows = pg.select(g.db.cursor(), {'inventaire': 'i', 'produit': 'p'},
                         join={'p.no_produit_interne':'i.no_produit_interne'},
                         where={('statut', '!='): 'inactif',
                                'i.no_produit_interne': request.args['no_produit_interne']},
                         order_by='date_commande')
        return {'success': True, 'total': len(rows), 'rows': rows}
    else:
        return get(g, request, {'inventaire': 'i', 'produit': 'p'}, ('no_client',),
                   join={'i.no_produit_interne': 'p.no_produit_interne'})
