from vinum import *
from common import *


@app.route('/produit/get', methods=['GET'])
def get_produit():
    if 'no_client' in request.args:
        return client.get_produits(g, request.args['no_client'])
    return get(g, request, 'produit', ('type_vin', 'nom_domaine'))


@app.route('/produit/get_nom_domaine', methods=['GET'])
def get_nom_domaine():
    return get(g, request, 'produit', ('nom_domaine',))


@app.route('/produit/get_format', methods=['GET'])
def get_format():
    return get(g, request, 'produit', ('format',), what='distinct format')


@app.route('/produit/get_pays', methods=['GET'])
def get_pays():
    return get(g, request, 'produit', ('pays',), what='distinct pays')


@app.route('/produit/load', methods=['POST'])
def load_produit():
    produit = pg.select1r(g.db.cursor(), {'produit': 'p', 'producteur': 'r'},
                          what=['p.*', 'r.nom_producteur'],
                          join={'p.no_producteur': 'r.no_producteur'},
                          where={'no_produit_interne': request.form['no_produit_interne']})
    return {'success': True, 'data': produit}
