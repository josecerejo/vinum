from vinum import *
from common import *


@app.route('/inventaire/get', methods=['GET'])
def get_inventaire():
    # inventaire request from commande screen, for a single produit
    if 'no_produit_interne' in request.args:
        return get(g, request, {'inventaire': 'i', 'produit': 'p'},
                   what=['i.*', 'p.type_vin', 'p.format', 'p.quantite_par_caisse'],
                   join={'p.no_produit_interne':'i.no_produit_interne'},
                   where={('statut', '!='): 'inactif',
                          'i.no_produit_interne': request.args['no_produit_interne']})
    # full inventaire query
    else:
        return get(g, request, {'inventaire': 'i', 'produit': 'p'},
                   what=['i.*', 'p.type_vin', 'p.format', 'p.quantite_par_caisse',
                         'diff_in_days(date_recue) / 30 as fraicheur'],
                   join={'i.no_produit_interne': 'p.no_produit_interne'})
