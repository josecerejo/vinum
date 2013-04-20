from vinum import *
from common import *


@app.route('/produit/get', methods=['GET'])
@login_required
def get_produit():
    if 'no_client' in request.args:
        return get(g, request, {'produit': 'p', 'client_produit': 'cp'},
                   join={'p.no_produit_interne': 'cp.no_produit_interne'},
                   where={'no_client': request.args['no_client']})
    else:
        return get(g, request, {'produit':'p','producteur':'r'},
                   join={'p.no_producteur': 'r.no_producteur'},
                   what=['p.*', 'r.nom_producteur'],
                   query_fields=('type_vin', 'nom_domaine'),
                   field_map={'no_producteur': 'p.no_producteur'})


@app.route('/produit/get_nom_domaine', methods=['GET'])
@login_required
def get_nom_domaine():
    return get(g, request, 'produit', ('nom_domaine',))


@app.route('/produit/get_format', methods=['GET'])
@login_required
def get_format():
    return get(g, request, 'produit', ('format',), what='distinct format')


@app.route('/produit/get_pays', methods=['GET'])
@login_required
def get_pays():
    return get(g, request, 'produit', ('pays',), what='distinct pays')


@app.route('/produit/save', methods=['POST'])
@login_required
def save_produit():
    rf = request.form.to_dict()
    npi = rf.pop('no_produit_interne')
    if npi == '': npi = None
    else: rf['no_produit_interne'] = npi # to allow resaving it back after delete with the same id
    produit = pg.upsert(g.db.cursor(), 'produit', where={'no_produit_interne': npi},
                        values=rf, filter_values=True, map_values={'': None})
    g.db.commit()
    return {'success': True, 'data': produit}


@app.route('/produit/delete', methods=['POST'])
@login_required
def delete_produit():
    pg.delete(g.db.cursor(), 'produit',
              where={'no_produit_interne': request.form['no_produit_interne']},
              tighten_sequence=True)
    g.db.commit()
    return {'success': True}
