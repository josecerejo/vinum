from vinum import *
import common


@app.route('/produit/get', methods=['GET'])
def get_produit():
    return common.get(request, 'produit', ('type_vin', 'nom_domaine'))
