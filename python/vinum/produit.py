import common


@common.app.route('/produit/get', methods=['GET'])
def p_get():
    return common.get('produit', ('type_vin', 'nom_domaine'))
    
