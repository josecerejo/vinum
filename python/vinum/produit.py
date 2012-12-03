from vinum import *
from common import *


@app.route('/produit/get', methods=['GET'])
def get_produit():
    if 'no_client' in request.args:
        return client.get_produits(g, request.args['no_client'])
    return get(g, request, 'produit', ('type_vin', 'nom_domaine'))
