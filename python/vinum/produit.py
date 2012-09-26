from vinum import *
import common


@app.route('/produit/get', methods=['GET'])
def get_produit():
    if 'no_client' in request.args:
        return client.get_produits_commandes(request.args['no_client'])
    return common.get(request, 'produit', ('type_vin', 'nom_domaine'))

# select type_vin, nom_domaine, format, count(*) from produit p, commande_produit cp where cp.no_client = 89 and  cp.no_produit_interne = p.no_produit_interne group by p.type_vin, nom_domaine, format order by count desc;
