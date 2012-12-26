from vinum import *
from common import *


@app.route('/produit/get', methods=['GET'])
def get_produit():
    if 'no_client' in request.args:
        return client.get_produits(g, request.args['no_client'])
    return get(g, request, {'produit':'p','producteur':'r'},
               join={'p.no_producteur': 'r.no_producteur'},
               what=['p.*', 'r.nom_producteur'],
               query_fields=('type_vin', 'nom_domaine'),
               field_map={'no_producteur': 'p.no_producteur'})


@app.route('/produit/get_nom_domaine', methods=['GET'])
def get_nom_domaine():
    return get(g, request, 'produit', ('nom_domaine',))


@app.route('/produit/get_format', methods=['GET'])
def get_format():
    return get(g, request, 'produit', ('format',), what='distinct format')


@app.route('/produit/get_pays', methods=['GET'])
def get_pays():
    return get(g, request, 'produit', ('pays',), what='distinct pays')


@app.route('/produit/save', methods=['POST'])
def save_produit():
    rf = request.form.to_dict()
    npi = rf.pop('no_produit_interne')
    if npi == '': npi = None
    produit = pg.upsert(g.db.cursor(), 'produit', where={'no_produit_interne': npi},
                        values=rf, filter_values=True, map_values={'': None})
    g.db.commit()
    return {'success': True, 'data': produit}


@app.route('/produit/delete', methods=['POST'])
def delete_produit():
    pg.delete(g.db.cursor(), 'produit', where={'no_produit_interne':
                                               request.form['no_produit_interne']})
    g.db.commit()
    return {'success': True}
