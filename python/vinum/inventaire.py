from vinum import *
from common import *


@app.route('/inventaire/get', methods=['GET'])
def get_inventaire():
    # if no_produit_interne is specified, it's a product-specific request from a commande screen,
    # otherwise it's a request from the master grid
    return get(g, request, {'inventaire': 'i', 'produit': 'p'},
               what=['i.*', 'p.type_vin', 'p.format', 'p.quantite_par_caisse',
                     'age_in_days(date_recue)'],
               join={'p.no_produit_interne':'i.no_produit_interne'},
               where={'i.no_produit_interne': request.args['no_produit_interne']}
               if 'no_produit_interne' in request.args else {})
